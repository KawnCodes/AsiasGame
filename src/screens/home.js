/**
 * HOME — the player's current home (or any owned home being visited), room by room.
 * Functional furniture (bed, wardrobe, vanity, mirrors, trophy shelf) carries hotspots;
 * the main hub moves with you when you move into another property.
 */
import { h, appendTo, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderRoom } from '../components/roomRenderer.js';
import { addTwinkles } from '../components/sparkles.js';
import { wardrobeSize } from '../systems/inventory.js';
import { maybeShowDaily, openDaily } from '../components/dailyReward.js';
import { readyJobs } from '../systems/careerSystem.js';
import { claimableCount } from '../systems/questSystem.js';
import { dailyStatus } from '../systems/dailySystem.js';
import { THEME_BY_ID } from '../data/competitions.js';
import { BALANCE } from '../data/gameBalance.js';
import { PROPERTY_BY_ID } from '../data/properties.js';
import { ROOM, roomsOf, layoutOf, drawOrder, itemScale } from '../systems/decoratingSystem.js';
import { moveIn } from '../systems/propertySystem.js';

const FUNC_LABEL = { wardrobe: 'Wardrobe', vanity: 'Vanity', mirror: 'Mirror', bed: 'Bed', trophies: 'Trophies' };
const lastRoom = {};

export default {
  id: 'home',
  chrome: 'full',
  title: 'My home',
  mount(el, params, ctx) {
    const s0 = ctx.store.get();
    const propertyId = params.propertyId && s0.properties.owned.includes(params.propertyId) ? params.propertyId : s0.properties.current;
    let roomId = params.roomId || lastRoom[propertyId] || roomsOf(s0, propertyId)[0].id;

    const title = h('div', { class: 'home-title' });
    const roomTabs = h('div', { class: 'chips room-tabs' });
    const room = h('div', { class: 'room', style: { aspectRatio: `${ROOM.W} / ${ROOM.H}` } });
    const hotspots = h('div', { class: 'hotspots' });
    room.append(h('div', { class: 'room-bg avatar-idle-wrap' }), hotspots);
    addTwinkles(room, 5);
    const toolbar = h('div', { class: 'home-actions' });
    const info = h('div', { class: 'home-panel' });
    el.append(title, roomTabs, room, toolbar, info);

    const actions = {
      wardrobe: () => ctx.go('wardrobe'),
      vanity: () => ctx.go('creator', { mode: 'edit', tab: 'makeup' }),
      mirror: () => ctx.go('creator', { mode: 'edit', tab: 'hair' }),
      bed: rest,
      trophies: () => showTrophies(ctx),
    };

    function render(s) {
      const prop = PROPERTY_BY_ID[propertyId];
      const rooms = roomsOf(s, propertyId);
      if (!rooms.some((r) => r.id === roomId)) roomId = rooms[0].id;
      lastRoom[propertyId] = roomId;
      const isCurrent = s.properties.current === propertyId;
      title.innerHTML = '';
      title.append(h('span', { class: 'script' }, isCurrent ? 'Home' : 'Visiting'), isCurrent ? ' sweet home' : '', h('small', {}, `${prop.name} · ${prop.address}`));

      roomTabs.innerHTML = '';
      roomTabs.hidden = rooms.length < 2;
      for (const r of rooms) roomTabs.append(h('button', { class: `chip ${r.id === roomId ? 'active' : ''}`, onClick: () => { roomId = r.id; ctx.sfx.play('tap'); render(ctx.store.get()); } }, r.name));

      room.querySelector('.room-bg').innerHTML = renderRoom(s, propertyId, roomId, { avatar: true });
      hotspots.innerHTML = '';
      const seen = new Set();
      for (const e of drawOrder(s, layoutOf(s, propertyId, roomId))) {
        const f = e.item.func;
        if (!f || seen.has(f)) continue;
        seen.add(f);
        const sc = itemScale(e.item, e.y);
        const hy = e.item.placement === 'floor' ? e.y - e.item.h * sc * 0.55 : e.y;
        hotspots.append(h('button', {
          class: 'hotspot', style: { left: `${(e.x / ROOM.W) * 100}%`, top: `${(Math.max(30, hy) / ROOM.H) * 100}%` }, 'aria-label': FUNC_LABEL[f],
          onClick: () => { ctx.sfx.play('tap'); actions[f](); },
          html: `<span class="hs-dot">${icon('sparkle')}</span><span class="hs-label">${FUNC_LABEL[f]}</span>`,
        }));
      }
      hotspots.append(h('button', { class: 'hotspot gift-spot', 'aria-label': 'Daily gift', onClick: () => openDaily(ctx), html: `<span class="hs-dot gift">🎁</span>${dailyStatus(s).claimedToday ? '' : '<span class="hs-label">Daily gift</span>'}` }));

      toolbar.innerHTML = '';
      appendTo(toolbar, 
        h('button', { class: 'btn btn-primary btn-small', onClick: () => ctx.go('decorate', { propertyId, roomId }), html: `${icon('sparkle')}Decorate` }),
        h('button', { class: 'btn btn-soft btn-small', onClick: () => ctx.go('homes'), html: `${icon('home')}My homes (${s.properties.owned.length})` }),
        isCurrent ? null : h('button', { class: 'btn btn-gold btn-small', onClick: () => { ctx.store.transact((d) => moveIn(d, propertyId), 'move-in'); ctx.sfx.play('reward'); ctx.toast(`Welcome home to the ${prop.name}! 🏡`, { type: 'success' }); } }, 'Move in here'),
      );

      info.innerHTML = '';
      info.append(
        h('div', { class: 'quick-grid' },
          quick('briefcase', 'Go to work', workLine(s), () => ctx.go('work'), readyJobs(s).length > 0),
          quick('scroll', 'Quests', questLine(s), () => ctx.go('quests'), claimableCount(s) > 0 || !dailyStatus(s).claimedToday),
          quick('hanger', 'Wardrobe', `${wardrobeSize(s)} pieces`, () => ctx.go('wardrobe')),
          quick('bag', 'Go shopping', 'Fashion & furniture', () => ctx.go('mall')),
          quick('crown', 'Fashion contests', contestLine(s), () => ctx.go('pavilion')),
          quick('home', 'Dream Homes Realty', `${s.properties.owned.length} of 8 homes owned`, () => ctx.go('agency')),
          quick('star', 'My profile', `Level ${s.player.level} · ${fmt(s.player.fame)} fame`, () => ctx.go('profile')),
          quick('city', 'Explore city', 'Tap to travel', () => ctx.go('city')),
        ),
        h('div', { class: 'panel tip' },
          h('div', { class: 'section-title', html: `${icon('star')}Star tip` }),
          h('p', { class: 'muted' }, tipFor(s)),
        ),
      );
    }

    function quick(ic, label, sub, fn, alert = false) {
      return h('button', { class: `quick ${alert ? 'alert' : ''}`, onClick: () => { ctx.sfx.play('tap'); fn(); } },
        h('span', { class: 'quick-ico', html: icon(ic) }), h('b', {}, label), h('small', {}, sub));
    }

    async function rest() {
      room.classList.add('night');
      await ctx.saveNow();
      setTimeout(() => {
        room.classList.remove('night');
        ctx.toast('Sweet dreams! Your progress is saved. 🌙', { type: 'success' });
      }, 1300);
    }

    render(ctx.store.get());
    const unsub = ctx.store.subscribe((s) => s && render(s));

    if (params.firstTime) {
      const s = ctx.store.get();
      setTimeout(() => {
        ctx.sfx.play('reward');
        ctx.modal.open({
          title: 'Welcome!',
          body: h('div', { class: 'welcome-gift' },
            h('p', {}, 'Welcome to ', h('b', {}, 'Glamour City'), `, ${s.player.name}! This cosy apartment is all yours.`),
            h('div', { class: 'gift-row' },
              h('div', { class: 'gift', html: `${icon('coin')}<b>${fmt(s.player.coins)}</b><span>coins</span>` }),
              h('div', { class: 'gift', html: `${icon('gem')}<b>${fmt(s.player.gems)}</b><span>gems</span>` }),
            ),
            h('p', { class: 'muted tiny' }, 'Head to Boutique Avenue to treat yourself, then style your look in the wardrobe!'),
          ),
          buttons: [{ label: "Let's go shopping!", value: 'shop', cls: 'btn-primary' }],
        }).then((v) => { if (v === 'shop') ctx.go('mall'); else maybeShowDaily(ctx); });
        ctx.sparkleBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 22);
      }, 450);
    }
    if (!params.firstTime) maybeShowDaily(ctx);
    return unsub;
  },
};

function contestLine(s) {
  const c = s.contests;
  return c?.entries ? `${c.wins} win${c.wins === 1 ? '' : 's'} · ${(s.trophies || []).length} trophies` : 'Grand Pavilion is open!';
}

function showTrophies(ctx) {
  const s = ctx.store.get();
  const list = [...(s.trophies || [])].sort((a, b) => b.at - a.at);
  const medal = ['', '🥇', '🥈', '🥉'];
  const body = list.length
    ? h('div', { class: 'trophy-list' }, list.slice(0, 30).map((t) => h('div', { class: 'hist' },
      h('span', { class: 'hist-place' }, medal[t.place]),
      h('span', { class: 'hist-name' }, `${THEME_BY_ID[t.theme]?.name || t.theme} · ${BALANCE.contests.tiers[t.tier]?.name || ''}`),
      h('small', { class: 'muted' }, new Date(t.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })))))
    : h('p', {}, 'No trophies yet. Place in the top 3 at the Grand Pavilion to win one!');
  ctx.modal.open({ title: `Trophies (${list.length})`, body, buttons: [{ label: 'Go to the Pavilion', value: true, cls: 'btn-primary' }] })
    .then((v) => { if (v) ctx.go('pavilion'); });
}

function workLine(s) {
  const ready = readyJobs(s).length;
  if (ready) return `${ready} job${ready > 1 ? 's' : ''} ready to collect!`;
  const running = Object.keys(s.activeJobs).length;
  return running ? `${running} job${running > 1 ? 's' : ''} in progress` : 'Earn coins, XP & fame';
}

function questLine(s) {
  const n = claimableCount(s);
  if (!dailyStatus(s).claimedToday) return 'Daily gift waiting! 🎁';
  return n ? `${n} reward${n > 1 ? 's' : ''} to claim` : 'Daily, weekly & milestones';
}

function tipFor(s) {
  if (s.player.level >= 2 && !s.contests?.entries) return 'The Grand Pavilion is open! Enter a fashion contest — even 4th place pays 200 coins.';
  if (!s.stats.jobsCompleted) return 'Head to Work and take a quick catalogue shoot — jobs take seconds and pay coins, XP and fame.';
  if (s.player.level < 3) return 'Wear pieces that match a job\'s style tags for a +25% style bonus. Singing unlocks at level 2, acting at level 3!';
  if (s.stats.itemsBought === 0) return 'Your closet is a little bare — Petal & Thread on Boutique Avenue has cute pieces from just 100 coins.';
  if (s.outfits.length === 0) return 'Love your outfit? Tap "Save look" in the wardrobe to keep it for later.';
  if (!s.stats.furnitureBought) return 'Tap Decorate to drag your furniture around — then visit Glam Interiors for something new!';
  if (s.properties.owned.length < 2 && s.player.coins >= 5000 && s.player.level >= 2) return 'You can afford the Cosy Studio! Visit Dream Homes Realty in Luxury Hills.';
  if (s.stats.itemsBought < 8) return 'Run all three careers at once — one job per studio — and check Quests for bonus rewards.';
  return 'Try a new hairstyle at Silk & Curl Salon, then show it off in the mirror!';
}
