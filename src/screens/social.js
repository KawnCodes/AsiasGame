/**
 * SOCIAL — venues (meet people), character profiles with all relationship actions,
 * dialogue / gift / date flows, story scenes, the phone (messages & contacts),
 * friends' homes and parties at your place.
 */
import { h, appendTo, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar } from '../components/avatarRenderer.js';
import { renderRoom } from '../components/roomRenderer.js';
import { venueSVG } from '../components/art/venueArt.js';
import { celebrate, rewardChips } from '../components/rewards.js';
import { CHARACTERS, CHARACTER_BY_ID, VIBES } from '../data/characters.js';
import { VENUES, VENUE_BY_ID } from '../data/venues.js';
import { GIFTS } from '../data/gifts.js';
import { BALANCE } from '../data/gameBalance.js';
import { HOME_STYLE_BY_ID } from '../data/homeStyles.js';
import { FURNITURE_BY_ID } from '../data/furniture.js';
import { PROPERTY_BY_ID } from '../data/properties.js';
import {
  rel, levelOf, levelInfo, isPartner, presentAt, meet, nextTopic, chat, canFlirt, nextFlirt, flirt, giveGift, canDate, outfitBonus,
  goOnDate, askPartner, breakUp, canInvite, inviteHome, hostParty, visitFriendHome, pendingStories, markStorySeen, replyMessage,
  markThreadRead, metIds,
} from '../systems/relationshipSystem.js';
import { canAfford } from '../systems/economy.js';
import { clampPosition, roomsOf } from '../systems/decoratingSystem.js';

const headSVG = (c, size = 'head') => renderAvatar(c.look.appearance, c.look.equipped, { viewBox: size === 'head' ? '50 12 100 104' : '10 0 180 440', shadow: false, align: 'xMidYMid', label: c.name });
const firstName = (c) => c.name.split(' ')[0];
const heartsBar = (state, c) => {
  const info = levelInfo(c, state.social.rel[c.id]?.points || 0);
  return h('div', { class: 'rel-bar' }, h('div', { class: 'rel-top' }, h('b', {}, `${isPartner(state, c.id) ? '💕 Partner · ' : ''}${info.name}`), h('small', {}, info.next ? `${state.social.rel[c.id]?.points || 0} / ${info.next.min}` : 'Max')),
    h('div', { class: 'xp-bar career big' }, h('i', { style: { width: `${Math.round(info.ratio * 100)}%`, background: c.kind === 'romance' ? 'linear-gradient(90deg,#ff9ccb,#f0559b)' : 'linear-gradient(90deg,#a9e8d2,#7cc6f2)' } })));
};

/** Show any story scenes the relationship has just unlocked. */
export async function playStories(ctx, id) {
  const c = CHARACTER_BY_ID[id];
  for (const st of pendingStories(ctx.store.get(), id)) {
    ctx.sfx.play('reward');
    await ctx.modal.open({
      title: st.title, className: 'wide story-modal',
      body: h('div', { class: 'story-scene' },
        h('div', { class: 'story-pair' }, h('div', { class: 'sp', html: renderAvatar(ctx.store.get().appearance, ctx.store.get().equipped, { viewBox: '50 12 100 104', shadow: false, align: 'xMidYMid' }) }), h('span', { class: 'sp-heart' }, c.kind === 'romance' ? '💗' : '🌸'), h('div', { class: 'sp', html: headSVG(c) })),
        h('p', { class: 'story-text' }, st.text)),
      buttons: [{ label: c.kind === 'romance' ? '💗' : '🌸 Aww', value: true, cls: 'btn-primary' }],
    });
    ctx.store.transact((d) => markStorySeen(d, id, st.level), 'story');
  }
}

function pointsChip(r) {
  if (r.capped) return h('span', { class: 'pts capped' }, 'No more points today — come back tomorrow!');
  if (!r.gained) return h('span', { class: 'pts zero' }, '+0');
  return h('span', { class: `pts ${r.gained > 0 ? 'up' : 'down'}` }, `${r.gained > 0 ? '+' : ''}${r.gained} ${r.gained > 0 ? '💗' : '💔'}`);
}

/** Generic speech dialog: question + choices → reaction. Resolves with the action result. */
function talk(ctx, c, { title, q, choices, act }) {
  return new Promise((resolve) => {
    const body = h('div', { class: 'dialogue' },
      h('div', { class: 'dl-head' }, h('div', { class: 'dl-portrait', html: headSVG(c) }), h('div', { class: 'bubble-npc' }, h('b', {}, firstName(c)), h('span', {}, q))),
      h('div', { class: 'dl-choices' }));
    const list = body.querySelector('.dl-choices');
    choices.forEach((ch, i) => list.append(h('button', {
      class: 'btn btn-soft dl-choice', onClick: () => {
        const r = act(i);
        if (r.ok === false) { ctx.toast('That didn\'t work.', { type: 'error' }); return; }
        ctx.sfx.play(r.grade === 'great' ? 'reward' : r.grade === 'bad' ? 'error' : 'tap');
        list.innerHTML = '';
        appendTo(list,
          h('div', { class: 'bubble-me' }, ch.t),
          h('div', { class: `bubble-npc reply ${r.grade}` }, h('b', {}, firstName(c)), h('span', {}, r.reaction)),
          h('div', { class: 'dl-result' }, pointsChip(r), r.levelUp ? h('span', { class: 'lvl-up' }, `Now: ${r.levelUp}!`) : null),
          h('button', { class: 'btn btn-primary btn-block', onClick: () => { body.closest('.modal-card').closeModal(true); resolve(r); } }, 'Continue'));
      },
    }, VIBES[ch.v] ? h('span', { class: 'vibe' }, VIBES[ch.v].icon) : null, ch.t)));
    ctx.modal.open({ title, body, buttons: [], className: 'wide dialogue-modal' }).then(() => resolve(null));
  });
}

// ================================================================== actions
export async function doChat(ctx, id) {
  const c = CHARACTER_BY_ID[id];
  const t = nextTopic(ctx.store.get(), id);
  await talk(ctx, c, { title: `Chat with ${firstName(c)}`, q: t.q, choices: t.choices, act: (i) => ctx.store.transact((d) => chat(d, id, i), 'chat') });
  await playStories(ctx, id);
}

export async function doFlirt(ctx, id) {
  const c = CHARACTER_BY_ID[id];
  const f = nextFlirt(ctx.store.get(), id);
  await talk(ctx, c, { title: `Flirt with ${firstName(c)}`, q: f.q, choices: f.choices, act: (i) => ctx.store.transact((d) => flirt(d, id, i), 'flirt') });
  await playStories(ctx, id);
}

export async function doGift(ctx, id) {
  const c = CHARACTER_BY_ID[id];
  const s = ctx.store.get();
  const known = levelOf(s, id).index >= 2;
  const giftId = await new Promise((resolve) => {
    const grid = h('div', { class: 'gift-grid' }, GIFTS.map((g) => h('button', {
      class: `gift-opt ${known && c.gifts.love.includes(g.id) ? 'loved' : ''}`,
      onClick: (e) => { resolve(g.id); e.currentTarget.closest('.modal-card').closeModal(true); },
    }, h('span', { class: 'g-ico' }, g.icon), h('small', {}, g.name), h('b', { class: canAfford(s, { coins: g.price }) ? '' : 'cant' }, `${fmt(g.price)} 🪙`))));
    ctx.modal.open({ title: `A gift for ${firstName(c)}`, className: 'wide', body: h('div', {}, h('p', { class: 'muted tiny' }, known ? `Hint: ${firstName(c)} loves the ones marked 💗` : `Get to know ${firstName(c)} better to learn what they love.`), grid), buttons: [] }).then(() => resolve(null));
  });
  if (!giftId) return;
  const r = ctx.store.transact((d) => giveGift(d, id, giftId), 'gift');
  if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.reason === 'insufficient-funds' ? 'Not enough coins for that gift.' : 'Couldn\'t give that.', { type: 'error' }); return; }
  await ctx.saveNow();
  const line = { love: `"No way — I LOVE this! How did you know?!"`, like: '"Aww, thank you! That\'s really thoughtful."', neutral: '"Oh, thank you — that\'s nice of you."', dislike: '"Oh… um, thanks. It\'s… not really me."' }[r.reaction];
  ctx.sfx.play(r.reaction === 'dislike' ? 'error' : 'reward');
  await ctx.modal.open({ title: { love: 'They love it!', like: 'They like it', neutral: 'Thanks!', dislike: 'Oops…' }[r.reaction], body: h('div', { class: 'dialogue' }, h('div', { class: 'dl-head' }, h('div', { class: 'dl-portrait', html: headSVG(c) }), h('div', { class: 'bubble-npc' }, h('b', {}, firstName(c)), h('span', {}, line))), h('div', { class: 'dl-result' }, pointsChip(r), r.levelUp ? h('span', { class: 'lvl-up' }, `Now: ${r.levelUp}!`) : null)), buttons: [{ label: 'Continue', value: true, cls: 'btn-primary' }] });
  await playStories(ctx, id);
}

export async function doDate(ctx, id) {
  const c = CHARACTER_BY_ID[id];
  const s = ctx.store.get();
  const venueId = await new Promise((resolve) => {
    const list = h('div', { class: 'venue-pick' }, VENUES.map((v) => {
      const bonus = outfitBonus(s, v.id);
      return h('button', { class: 'venue-opt', onClick: (e) => { resolve(v.id); e.currentTarget.closest('.modal-card').closeModal(true); } },
        h('span', { class: 'v-ico' }, v.icon), h('div', { class: 'v-body' }, h('b', {}, v.name), h('small', { class: 'muted' }, v.blurb),
          h('small', { class: 'v-meta' }, `${v.cost ? `${fmt(v.cost)} coins` : 'Free'} · dress: ${v.styles.slice(0, 3).join(', ')}${bonus ? ` · outfit bonus +${bonus}` : ''}`)));
    }));
    ctx.modal.open({ title: `Date with ${firstName(c)}`, className: 'wide', body: list, buttons: [] }).then(() => resolve(null));
  });
  if (!venueId) return;
  const v = VENUE_BY_ID[venueId];
  if (!canAfford(s, { coins: v.cost })) { ctx.sfx.play('error'); ctx.toast(`A date at ${v.name} costs ${fmt(v.cost)} coins.`, { type: 'error' }); return; }
  const picks = [];
  for (let i = 0; i < v.beats.length; i++) {
    const beat = v.beats[i];
    const pick = await new Promise((resolve) => {
      const people = [{ look: { appearance: s.appearance, equipped: s.equipped }, x: 140, id: 'me' }, { look: c.look, x: 250, id: c.id }];
      const body = h('div', { class: 'date-beat' }, h('div', { class: 'date-scene', html: venueSVG(venueId, people) }), h('div', { class: 'beat-step' }, `${i + 1} / ${v.beats.length}`), h('p', { class: 'beat-q' }, beat.q), h('div', { class: 'dl-choices' }));
      const choicesEl = body.querySelector('.dl-choices');
      beat.choices.forEach((ch, k) => choicesEl.append(h('button', {
        class: 'btn btn-soft dl-choice', onClick: () => {
          const score = Math.max(-2, Math.min(2, c.vibes[ch.v] ?? 0));
          const g = score >= 2 ? 'great' : score >= 0 ? 'ok' : 'bad';
          ctx.sfx.play(g === 'great' ? 'reward' : g === 'bad' ? 'error' : 'tap');
          choicesEl.innerHTML = '';
          appendTo(choicesEl, h('div', { class: 'bubble-me' }, ch.t), h('div', { class: `bubble-npc reply ${g}` }, h('b', {}, firstName(c)), h('span', {}, c.reactions[g][i % c.reactions[g].length])),
            h('button', { class: 'btn btn-primary btn-block', onClick: () => { body.closest('.modal-card').closeModal(true); resolve(k); } }, i < v.beats.length - 1 ? 'Next' : 'End the date'));
        },
      }, h('span', { class: 'vibe' }, VIBES[ch.v].icon), ch.t)));
      ctx.modal.open({ title: `${v.icon} ${v.name}`, className: 'wide dialogue-modal', body, buttons: [] }).then(() => resolve(null));
    });
    if (pick === null) { ctx.toast('Date cancelled — maybe next time!'); return; }
    picks.push(pick);
  }
  const r = ctx.store.transact((d) => goOnDate(d, id, venueId, picks), 'date');
  if (r.ok === false) { ctx.toast('The date couldn\'t happen.', { type: 'error' }); return; }
  await ctx.saveNow();
  ctx.sfx.play('reward');
  ctx.sparkleBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, r.hearts * 10);
  await ctx.modal.open({
    title: ['', 'Sweet date', 'Lovely date!', 'Magical date!'][r.hearts], className: 'celebrate',
    body: h('div', { class: 'date-result' }, h('div', { class: 'hearts' }, '💗'.repeat(r.hearts) + '🤍'.repeat(3 - r.hearts)),
      h('p', {}, r.hearts === 3 ? `${firstName(c)} can't stop smiling.` : r.hearts === 2 ? `${firstName(c)} had a really nice time.` : `${firstName(c)} enjoyed it — get to know their taste better!`),
      h('div', { class: 'dl-result' }, pointsChip(r), r.bonus ? h('span', { class: 'pts up' }, `Outfit bonus +${r.bonus}`) : null, r.levelUp ? h('span', { class: 'lvl-up' }, `Now: ${r.levelUp}!`) : null),
      r.reward ? rewardChips(r.reward) : h('small', { class: 'muted' }, 'Second date today — fewer points, but still fun!')),
    buttons: [{ label: 'Aww 💗', value: true, cls: 'btn-primary' }],
  });
  if (r.levels?.length) await celebrate(ctx, { levels: r.levels });
  await playStories(ctx, id);
}

export async function doAsk(ctx, id) {
  const c = CHARACTER_BY_ID[id];
  const ok = await ctx.modal.confirm('Ask them out?', `<p>Ask <b>${firstName(c)}</b> to be your partner?</p>`, 'Ask 💗', 'Not yet');
  if (!ok) return;
  const r = ctx.store.transact((d) => askPartner(d, id), 'ask');
  if (r.ok === false) { ctx.toast(r.message || 'Not possible right now.', { type: 'error' }); return; }
  await ctx.saveNow();
  ctx.sfx.play(r.accepted ? 'reward' : 'error');
  if (r.accepted) ctx.sparkleBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 30);
  await ctx.modal.open({ title: r.accepted ? 'It\'s official! 💕' : 'Not yet…', className: r.accepted ? 'celebrate' : '', body: h('div', { class: 'dialogue' }, h('div', { class: 'dl-head' }, h('div', { class: 'dl-portrait', html: headSVG(c) }), h('div', { class: 'bubble-npc' }, h('b', {}, firstName(c)), h('span', {}, r.line)))), buttons: [{ label: r.accepted ? '💕' : 'Okay', value: true, cls: 'btn-primary' }] });
  await playStories(ctx, id);
}

export async function doInvite(ctx, id) {
  const r = ctx.store.transact((d) => inviteHome(d, id), 'invite');
  if (r.ok === false) { ctx.toast('Get to know them a little better first.', { type: 'error' }); return; }
  await ctx.saveNow();
  ctx.sfx.play('reward');
  ctx.toast(r.first ? `${firstName(CHARACTER_BY_ID[id])} is coming over! +${r.gained} 💗` : `${firstName(CHARACTER_BY_ID[id])} is at your place.`, { type: 'reward' });
  if (r.levels?.length) await celebrate(ctx, { levels: r.levels });
  ctx.go('home');
}

/** Furnish a friend's home from their favourite style (for visiting). */
export function friendHomeState(state, c) {
  const style = HOME_STYLE_BY_ID[c.house.style];
  const prop = c.house.property;
  const room = PROPERTY_BY_ID[prop].rooms[0].id;
  const items = {};
  const placed = {};
  const layout = [['rug', 200, 380], ['curtains', 195, 106], ['wall_art', 60, 120], ['sofa', 110, 330], ['armchair', 300, 340], ['floor_lamp', 30, 340], ['bookshelf', 350, 310], ['coffee_table', 200, 392], ['chandelier', 195, 50]];
  let n = 1;
  for (const [kind, x, y] of layout) {
    const id = `${style.id}__${kind}`;
    if (!FURNITURE_BY_ID[id]) continue;
    const uid = `v${n++}`;
    items[uid] = { id, at: { property: prop, room } };
    placed[uid] = { ...clampPosition(FURNITURE_BY_ID[id], x, y), flip: false };
  }
  items.vplant = { id: 'decor_monstera', at: { property: prop, room } };
  placed.vplant = { x: 30, y: 410, flip: false };
  return { appearance: state.appearance, equipped: state.equipped, trophies: [], properties: { owned: [prop], current: prop, upgrades: {} }, furniture: { items }, homes: { [prop]: { rooms: { [room]: { wallpaper: c.house.wallpaper, floor: c.house.floor, placed } } } }, _room: room, _prop: prop };
}

export async function doVisitFriend(ctx, id) {
  const c = CHARACTER_BY_ID[id];
  const r = ctx.store.transact((d) => visitFriendHome(d, id), 'visit-friend');
  if (r.ok === false) { ctx.toast('Become friends first!', { type: 'error' }); return; }
  await ctx.saveNow();
  const ghost = friendHomeState(ctx.store.get(), c);
  await ctx.modal.open({
    title: `${firstName(c)}'s place`, className: 'wide',
    body: h('div', {}, h('div', { class: 'tour-room', html: renderRoom(ghost, ghost._prop, ghost._room, { avatar: true, avatarX: 150, people: [{ look: c.look, x: 255, name: c.name }] }) }),
      h('p', { class: 'tiny' }, `${firstName(c)}'s ${HOME_STYLE_BY_ID[c.house.style].name} ${PROPERTY_BY_ID[c.house.property].name.toLowerCase()}.`),
      h('div', { class: 'dl-result' }, pointsChip(r))),
    buttons: [{ label: 'Lovely visit!', value: true, cls: 'btn-primary' }],
  });
  await playStories(ctx, id);
}

/** Pick up to 4 guests and throw a party at your current home. */
export async function openParty(ctx) {
  const s = ctx.store.get();
  const eligible = metIds(s).filter((id) => canInvite(s, id));
  const P = BALANCE.social.party;
  if (!eligible.length) { ctx.toast('Make some friends first — you need people to invite!', { iconName: 'heart' }); return; }
  const chosen = new Set(eligible.slice(0, P.maxGuests));
  const grid = h('div', { class: 'guest-grid' });
  const fill = () => {
    grid.innerHTML = '';
    for (const id of eligible) {
      const c = CHARACTER_BY_ID[id];
      grid.append(h('button', { class: `guest ${chosen.has(id) ? 'on' : ''}`, onClick: () => { if (chosen.has(id)) chosen.delete(id); else if (chosen.size < P.maxGuests) chosen.add(id); fill(); } },
        h('div', { class: 'g-av', html: headSVG(c) }), h('small', {}, firstName(c)), chosen.has(id) ? h('span', { class: 'g-check', html: icon('check') }) : null));
    }
  };
  fill();
  const go = await ctx.modal.open({ title: 'Host a party 🎉', className: 'wide', body: h('div', {}, h('p', { class: 'muted tiny' }, `Pick up to ${P.maxGuests} guests. Catering costs ${fmt(P.cost)} coins. Your first party each day earns fame & XP, and every guest likes you more.`), grid), buttons: [{ label: 'Cancel', value: false }, { label: `Party! · ${fmt(P.cost)}`, value: true, cls: 'btn-gold' }] });
  if (!go) return;
  const r = ctx.store.transact((d) => hostParty(d, [...chosen]), 'party');
  if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.reason === 'insufficient-funds' ? 'Not enough coins for catering.' : 'Pick at least one guest.', { type: 'error' }); return; }
  await ctx.saveNow();
  ctx.sfx.play('buy');
  const st = ctx.store.get();
  const xs = [62, 330, 128, 268];
  await ctx.modal.open({
    title: 'Party time! 🎉', className: 'wide celebrate',
    body: h('div', { class: 'party' }, h('div', { class: 'tour-room confetti', html: renderRoom(st, st.properties.current, roomsOf(st, st.properties.current)[0].id, { avatar: true, avatarX: 198, people: r.guests.map((id, i) => ({ look: CHARACTER_BY_ID[id].look, x: xs[i], name: CHARACTER_BY_ID[id].name })) }) }),
      r.first ? rewardChips(r.reward) : h('small', { class: 'muted' }, 'Another party today — great fun, no extra rewards.'),
      r.levelUps.length ? h('p', { class: 'tiny' }, r.levelUps.map((u) => `${firstName(CHARACTER_BY_ID[u.id])}: ${u.level}!`).join(' · ')) : null),
    buttons: [{ label: 'Best night ever!', value: true, cls: 'btn-primary' }],
  });
  ctx.sparkleBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 30);
  if (r.levels?.length) await celebrate(ctx, { levels: r.levels });
  for (const id of r.guests) await playStories(ctx, id);
}

// ================================================================== venue
export const venue = {
  id: 'venue',
  chrome: 'full',
  title: 'Venue',
  mount(el, params, ctx) {
    const v = VENUE_BY_ID[params.id] || VENUES[0];
    const sceneBox = h('div', { class: 'venue-scene' });
    const list = h('div', { class: 'people-list' });
    el.append(
      h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('city'), html: `${icon('back')}City` }), h('h2', {}, `${v.icon} ${v.name}`)),
      h('p', { class: 'muted tiny pad-x' }, v.blurb), sceneBox,
      h('div', { class: 'section-title pad-x', html: `${icon('heart')}Who's here today` }), list,
      h('p', { class: 'muted tiny pad-x center' }, `Date here: ${v.cost ? `${fmt(v.cost)} coins` : 'free'} · best outfits: ${v.styles.join(', ')}`),
    );
    function render() {
      const s = ctx.store.get();
      const here = presentAt(v.id);
      const xs = here.length === 1 ? [255] : here.length === 2 ? [110, 280] : [70, 195, 320];
      const people = here.slice(0, 3).map((id, i) => ({ id, look: CHARACTER_BY_ID[id].look, x: xs[i], name: CHARACTER_BY_ID[id].name }));
      sceneBox.innerHTML = venueSVG(v.id, people);
      for (const p of people) {
        const met = s.social.rel[p.id]?.met;
        sceneBox.append(h('button', { class: `name-tag ${met ? 'met' : 'new'}`, style: { left: `${(p.x / 390) * 100}%` }, onClick: () => open(p.id) }, met ? firstName(CHARACTER_BY_ID[p.id]) : `👋 Say hi`));
      }
      list.innerHTML = '';
      for (const id of here) {
        const c = CHARACTER_BY_ID[id];
        const met = s.social.rel[id]?.met;
        list.append(h('button', { class: 'person-card', onClick: () => open(id) },
          h('div', { class: 'pc-av', html: headSVG(c) }),
          h('div', { class: 'pc-body' }, h('b', {}, met ? c.name : 'Someone new'), h('small', { class: 'muted' }, met ? `${c.job} · ${levelOf(s, id).name}${isPartner(s, id) ? ' 💕' : ''}` : `${c.job} — go say hello!`)),
          h('span', { class: 'pc-kind' }, c.kind === 'romance' ? '💗' : '🌸')));
      }
    }
    async function open(id) {
      const c = CHARACTER_BY_ID[id];
      if (!ctx.store.get().social.rel[id]?.met) {
        ctx.store.transact((d) => meet(d, id), 'meet');
        ctx.sfx.play('reward');
        await ctx.modal.open({ title: `Meet ${firstName(c)}`, className: 'wide', body: h('div', { class: 'dialogue' }, h('div', { class: 'dl-head' }, h('div', { class: 'dl-portrait', html: headSVG(c) }), h('div', { class: 'bubble-npc' }, h('b', {}, c.name), h('span', {}, c.intro))), h('p', { class: 'tiny muted' }, `${c.age} · ${c.job}. Added to your phone contacts.`)), buttons: [{ label: 'Nice to meet you!', value: true, cls: 'btn-primary' }] });
        await ctx.saveNow();
      }
      ctx.go('person', { id });
    }
    render();
    return ctx.store.subscribe((s) => s && render());
  },
};

// ================================================================== person profile
export const person = {
  id: 'person',
  chrome: 'full',
  title: 'Profile',
  mount(el, params, ctx) {
    const c = CHARACTER_BY_ID[params.id] || CHARACTERS[0];
    const body = h('div');
    el.append(h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('phone'), html: `${icon('back')}Back` }), h('h2', {}, firstName(c))), body);
    function render() {
      const s = ctx.store.get();
      rel(s, c.id);
      const r = s.social.rel[c.id];
      const lvl = levelOf(s, c.id);
      const partner = isPartner(s, c.id);
      const known = lvl.index >= 2;
      body.innerHTML = '';
      const act = (label, fn, enabled = true, why = '', cls = 'btn-soft') => h('button', { class: `btn btn-small ${cls}`, disabled: !enabled, title: why, onClick: fn }, label, !enabled && why ? h('small', { class: 'why' }, why) : null);
      const actions = [
        act('💬 Chat', () => doChat(ctx, c.id), r.met, 'Meet first'),
        act('🎁 Gift', () => doGift(ctx, c.id), r.met, 'Meet first'),
        c.kind === 'romance' ? act('😘 Flirt', () => doFlirt(ctx, c.id), canFlirt(s, c.id), 'At Friend') : null,
        c.kind === 'romance' ? act('🌹 Date', () => doDate(ctx, c.id), canDate(s, c.id), 'At Friend', 'btn-primary') : null,
        act('🏠 Invite home', () => doInvite(ctx, c.id), canInvite(s, c.id), 'At Friend'),
        c.kind === 'friend' ? act('🚪 Visit their home', () => doVisitFriend(ctx, c.id), lvl.index >= 2, 'At Friend', 'btn-lilac') : null,
        c.kind === 'romance' && !partner ? act('💍 Ask to be partners', () => doAsk(ctx, c.id), r.met && lvl.index >= 3 && !s.social.partner, s.social.partner ? 'Taken' : 'At Crush', 'btn-gold') : null,
        partner ? act('💔 Just friends', async () => { if (await ctx.modal.confirm('Break up?', `<p>Go back to being friends with ${firstName(c)}?</p>`, 'Just friends', 'Stay together')) ctx.store.transact((d) => breakUp(d), 'breakup'); }, true) : null,
      ];
      const scenes = Object.entries(c.story).filter(([k]) => r.storiesSeen.includes(Number(k)));
      appendTo(body,
        h('div', { class: `person-hero ${c.kind}` },
          h('div', { class: 'ph-av', html: headSVG(c, 'full') }),
          h('div', { class: 'ph-info' },
            h('div', { class: 'script ph-name' }, c.name),
            h('small', {}, `${c.age} · ${c.job}`),
            h('small', { class: 'muted' }, `Usually at ${VENUE_BY_ID[c.home].name}`),
            heartsBar(s, c),
            partner ? h('span', { class: 'partner-badge' }, '💕 Your partner') : null)),
        h('div', { class: 'pad' }, h('p', { class: 'bio' }, c.bio),
          h('div', { class: 'likes' }, h('b', {}, 'Loves: '), known ? c.gifts.love.map((g) => GIFTS.find((x) => x.id === g)).map((g) => h('span', { class: 'tag' }, `${g.icon} ${g.name}`)) : h('span', { class: 'muted tiny' }, 'Become friends to find out'),
            h('br'), h('b', {}, 'Enjoys: '), known ? Object.entries(c.vibes).filter(([, v]) => v >= 2).map(([k]) => h('span', { class: 'tag' }, `${VIBES[k].icon} ${VIBES[k].name}`)) : h('span', { class: 'muted tiny' }, '???'))),
        h('div', { class: 'person-actions pad' }, actions),
        h('p', { class: 'muted tiny pad-x' }, `Today: ${Math.min(r.chats, 3)}/3 chats · ${Math.min(r.gifts, 2)}/2 gifts${c.kind === 'romance' ? ` · ${Math.min(r.flirts, 2)}/2 flirts · ${r.dates} dates total` : ''} earn points`),
        scenes.length ? h('div', { class: 'pad' }, h('div', { class: 'section-title', html: `${icon('heart')}Memories` }), scenes.map(([k, st]) => h('button', { class: 'memory', onClick: () => ctx.modal.open({ title: st.title, body: `<p class="story-text">${st.text}</p>`, buttons: [{ label: '💗', value: true, cls: 'btn-primary' }] }) }, h('b', {}, `💗 ${st.title}`)))) : null,
        c.kind === 'friend' ? compare(s, c) : null,
      );
    }
    render();
    playStories(ctx, c.id);
    return ctx.store.subscribe((s) => s && render());
  },
};

function compare(s, c) {
  const seed = c.id.length * 7;
  const theirs = { Level: 6 + (seed % 9), Fame: 900 + seed * 61, 'Contest wins': 2 + (seed % 7), Homes: 1 + (seed % 3) };
  const mine = { Level: s.player.level, Fame: s.player.fame, 'Contest wins': s.contests?.wins || 0, Homes: s.properties.owned.length };
  return h('div', { class: 'pad' }, h('div', { class: 'section-title', html: `${icon('star')}You vs ${firstName(c)}` }),
    h('div', { class: 'compare' }, Object.keys(mine).map((k) => h('div', { class: 'cmp-row' }, h('b', { class: mine[k] >= theirs[k] ? 'win' : '' }, fmt(mine[k])), h('span', {}, k), h('b', { class: theirs[k] > mine[k] ? 'win' : '' }, fmt(theirs[k]))))));
}

// ================================================================== phone
export const phone = {
  id: 'phone',
  chrome: 'full',
  title: 'Phone',
  mount(el, params, ctx) {
    let tab = params.thread ? 'messages' : params.tab || 'messages';
    let thread = params.thread || null;
    const body = h('div', { class: 'phone' });
    el.append(body);
    function render() {
      const s = ctx.store.get();
      body.innerHTML = '';
      const msgs = s.social.messages;
      if (thread) {
        const c = CHARACTER_BY_ID[thread];
        const list = msgs.filter((m) => m.from === thread);
        const conv = h('div', { class: 'conv' });
        for (const m of list) {
          conv.append(h('div', { class: 'msg in' }, m.text, h('small', {}, new Date(m.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))));
          if (m.replied !== null && m.replies) conv.append(h('div', { class: 'msg out' }, m.replies[m.replied].t));
        }
        const last = [...list].reverse().find((m) => m.replies && m.replied === null);
        appendTo(body,
          h('div', { class: 'phone-head' }, h('button', { class: 'back-btn', onClick: () => { thread = null; render(); }, html: `${icon('back')}Chats` }), h('button', { class: 'ph-who', onClick: () => ctx.go('person', { id: c.id }) }, h('span', { class: 'ph-mini', html: headSVG(c) }), h('b', {}, c.name))),
          conv,
          last ? h('div', { class: 'reply-row' }, last.replies.map((rp, i) => h('button', { class: 'chip', onClick: () => { const r = ctx.store.transact((d) => replyMessage(d, last.id, i), 'reply'); ctx.sfx.play(r.gained ? 'reward' : 'tap'); if (r.gained) ctx.toast(`+${r.gained} 💗 with ${firstName(c)}`, { type: 'reward' }); } }, rp.t))) : h('p', { class: 'muted tiny center' }, 'You\'re all caught up 💌'));
        requestAnimationFrame(() => { conv.scrollTop = conv.scrollHeight; });
        if (list.some((m) => !m.read)) setTimeout(() => ctx.store.transact((d) => markThreadRead(d, thread), 'read'), 50);
        return;
      }
      const tabs = h('div', { class: 'chips seg' },
        h('button', { class: `chip ${tab === 'messages' ? 'active' : ''}`, onClick: () => { tab = 'messages'; render(); } }, 'Messages'),
        h('button', { class: `chip ${tab === 'contacts' ? 'active' : ''}`, onClick: () => { tab = 'contacts'; render(); } }, `Contacts (${metIds(s).length})`));
      appendTo(body, h('div', { class: 'screen-header' }, h('h2', {}, h('span', { class: 'script' }, 'My'), ' Phone'), h('button', { class: 'btn btn-gold btn-small', onClick: () => openParty(ctx) }, '🎉 Party')), tabs);
      if (tab === 'messages') {
        const threads = {};
        for (const m of msgs) threads[m.from] = m;
        const ordered = Object.values(threads).sort((a, b) => b.at - a.at);
        if (!ordered.length) body.append(h('div', { class: 'empty' }, 'No messages yet. Meet people at the café, restaurant, park or Social Club!'));
        for (const m of ordered) {
          const c = CHARACTER_BY_ID[m.from];
          const unread = msgs.filter((x) => x.from === m.from && !x.read).length;
          body.append(h('button', { class: `thread ${unread ? 'unread' : ''}`, onClick: () => { thread = m.from; render(); } },
            h('span', { class: 'ph-mini', html: headSVG(c) }), h('div', { class: 't-body' }, h('b', {}, c.name, isPartner(s, c.id) ? ' 💕' : ''), h('small', {}, m.text)), unread ? h('span', { class: 't-badge' }, unread) : null));
        }
      } else {
        const ids = metIds(s);
        if (!ids.length) body.append(h('div', { class: 'empty' }, 'No contacts yet — go out and say hi!'));
        for (const id of ids.sort((a, b) => (s.social.rel[b].points - s.social.rel[a].points))) {
          const c = CHARACTER_BY_ID[id];
          body.append(h('button', { class: 'person-card', onClick: () => ctx.go('person', { id }) }, h('div', { class: 'pc-av', html: headSVG(c) }),
            h('div', { class: 'pc-body' }, h('b', {}, c.name, isPartner(s, id) ? ' 💕' : ''), h('small', { class: 'muted' }, `${c.job} · ${levelOf(s, id).name}`), heartsBar(s, c)), h('span', { class: 'pc-kind' }, c.kind === 'romance' ? '💗' : '🌸')));
        }
        const unmet = CHARACTERS.filter((c) => !s.social.rel[c.id]?.met);
        if (unmet.length) body.append(h('p', { class: 'muted tiny pad-x' }, `${unmet.length} more people to meet: try ${[...new Set(unmet.map((c) => VENUE_BY_ID[c.home].name))].join(', ')}.`));
      }
    }
    render();
    return ctx.store.subscribe((s) => s && render());
  },
};

