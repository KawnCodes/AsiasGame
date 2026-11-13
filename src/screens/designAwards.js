/**
 * HOME DESIGN AWARDS — themed decorating contests.
 * Board of two briefs → pick one of your rooms (live score preview) → judges compare it
 * with four rival rooms (real generated rooms, drawn and scored the same way) → prizes.
 */
import { h, appendTo, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { celebrate, rewardChips } from '../components/rewards.js';
import { addTwinkles } from '../components/sparkles.js';
import { renderRoom } from '../components/roomRenderer.js';
import { HOME_THEME_BY_ID } from '../data/homeContests.js';
import { HOME_STYLE_BY_ID } from '../data/homeStyles.js';
import { PROPERTY_BY_ID, ROOM_TYPES } from '../data/properties.js';
import { BALANCE } from '../data/gameBalance.js';
import { ensureHomeBoard, scoreRoom, submitHomeEntry, homePrize, HOME_CATS } from '../systems/homeContestSystem.js';
import { roomsOf, layoutOf } from '../systems/decoratingSystem.js';

const PLACE = ['', '1st', '2nd', '3rd', '4th', '5th'];
const MEDAL = ['', '🥇', '🥈', '🥉', '🎀', '🎀'];
const palette = (t) => h('div', { class: 'palette' }, t.palette.map((c) => h('span', { style: { background: c } })));
const roomTypeName = (t) => ROOM_TYPES[t]?.name || t;

function catBars(categories) {
  return h('div', { class: 'hd-cats' }, Object.entries(HOME_CATS).map(([k, label]) => h('div', { class: 'hd-cat' },
    h('span', {}, label), h('div', { class: 'hd-bar' }, h('i', { style: { width: `${categories[k] * 10}%` } })), h('b', {}, categories[k].toFixed(1)))));
}

export const design = {
  id: 'design',
  chrome: 'full',
  title: 'Home Design Awards',
  mount(el, params, ctx) {
    if (!ctx.store.get().homeContests?.board?.length || ctx.store.get().homeContests.board.length < BALANCE.homeContests.boardSize) ctx.store.transact((d) => { ensureHomeBoard(d); }, 'hboard');
    const body = h('div');
    el.append(h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('home'), html: `${icon('back')}Back` }), h('h2', {}, h('span', { class: 'script' }, 'Design'), ' Awards')), body);

    function lobby() {
      const s = ctx.store.get();
      const c = s.homeContests;
      body.innerHTML = '';
      const hero = h('div', { class: 'hd-hero' },
        h('p', {}, 'Decorate a room to the brief, enter it, and let the judges decide! Every entry pays.'),
        h('div', { class: 'hd-stats' },
          h('div', {}, h('b', {}, fmt(c.entries)), h('small', {}, 'entries')),
          h('div', {}, h('b', {}, fmt(c.wins)), h('small', {}, 'wins')),
          h('div', {}, h('b', {}, fmt((s.homeAwards || []).length)), h('small', {}, 'trophies')),
          h('div', { html: `<b>${fmt(homePrize(1).coins)}</b><small>1st prize</small>` })));
      addTwinkles(hero, 6);
      body.append(hero, h('div', { class: 'section-title pad-x', html: `${icon('star')}Open briefs` }));
      const list = h('div', { class: 'hd-list' });
      for (const b of c.board) {
        const t = HOME_THEME_BY_ID[b.theme];
        list.append(h('div', { class: 'hd-card', dataset: { uid: b.uid } },
          h('div', { class: 'hd-head' }, h('span', { class: 'hd-ico' }, t.icon), h('div', {}, h('b', {}, t.name), h('p', { class: 'muted tiny' }, t.blurb))),
          h('div', { class: 'hd-row' }, palette(t), h('span', { class: 'muted tiny' }, `Best in: ${t.roomTypes.map(roomTypeName).join(', ')}`)),
          h('div', { class: 'tags' }, Object.entries(t.styles).sort((a, z) => z[1] - a[1]).map(([id]) => h('span', { class: 'tag' }, HOME_STYLE_BY_ID[id]?.name || id))),
          h('div', { class: 'hd-row' }, rewardChips(homePrize(1)), h('button', { class: 'btn btn-primary btn-small hd-enter', onClick: () => chooseRoom(b) }, 'Enter a room'))));
      }
      body.append(list);
      if (c.history.length) {
        body.append(h('div', { class: 'section-title pad-x', html: `${icon('scroll')}Recent results` }),
          h('div', { class: 'history pad-x' }, c.history.slice(0, 6).map((r) => h('div', { class: 'hist' },
            h('span', { class: 'hist-place' }, MEDAL[r.place] || PLACE[r.place]), h('span', { class: 'hist-name' }, HOME_THEME_BY_ID[r.theme]?.name), h('b', {}, `${r.percent}%`)))));
      }
      body.append(h('p', { class: 'muted tiny center pad-x' }, 'Tip: one collection, the brief\'s colours, wallpaper and floor to match, a rug, wall art and a plant win hearts.'));
    }

    function chooseRoom(b) {
      const s = ctx.store.get();
      const t = HOME_THEME_BY_ID[b.theme];
      const rooms = s.properties.owned.flatMap((pid) => roomsOf(s, pid).map((r) => ({ pid, r, score: scoreRoom(s, pid, r.id, t.id), n: Object.keys(layoutOf(s, pid, r.id)?.placed || {}).length })))
        .sort((a, z) => z.score.percent - a.score.percent);
      body.innerHTML = '';
      appendTo(body,
        h('div', { class: 'hd-brief pad-x' }, h('b', {}, `${t.icon} ${t.name}`), palette(t)),
        h('p', { class: 'muted tiny pad-x' }, 'Pick a room to enter. The meter is the judges\' likely score — you can decorate first and come back!'),
        h('div', { class: 'hd-rooms' }, rooms.map(({ pid, r, score, n }) => h('div', { class: 'hd-room', dataset: { room: `${pid}/${r.id}` } },
          h('div', { class: 'hd-thumb', html: renderRoom(s, pid, r.id) }),
          h('div', { class: 'hd-rinfo' },
            h('b', {}, r.name || roomTypeName(r.type)), h('span', { class: 'muted tiny' }, `${PROPERTY_BY_ID[pid]?.name} · ${n} pieces`),
            h('div', { class: 'hd-meter' }, h('i', { style: { width: `${score.percent}%` } }), h('span', {}, `${score.percent}%`)),
            h('div', { class: 'hd-btns' },
              h('button', { class: 'btn btn-soft btn-small', onClick: () => ctx.go('decorate', { propertyId: pid, roomId: r.id }) }, 'Decorate'),
              h('button', { class: 'btn btn-primary btn-small hd-submit', disabled: n < BALANCE.homeContests.minItems ? true : null, onClick: () => submit(b, pid, r.id) }, n < BALANCE.homeContests.minItems ? `Needs ${BALANCE.homeContests.minItems}+ pieces` : 'Enter')))))),
        h('div', { class: 'center' }, h('button', { class: 'btn btn-soft btn-small', onClick: lobby }, '← Back to briefs')),
      );
    }

    async function submit(b, pid, roomId) {
      const r = ctx.store.transact((d) => submitHomeEntry(d, b.uid, pid, roomId), 'home-contest');
      if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.message || 'Could not enter that room.', { type: 'error' }); return; }
      await ctx.saveNow();
      results(r);
    }

    async function results(r) {
      const s = ctx.store.get();
      body.innerHTML = '';
      const me = r.me;
      const banner = h('div', { class: `hd-banner place-${me.place}` }, h('div', { class: 'hd-medal' }, MEDAL[me.place]),
        h('div', {}, h('b', {}, me.place === 1 ? 'You won!' : `You placed ${PLACE[me.place]}`), h('span', {}, `${r.theme.name} · ${me.percent}%`)), rewardChips(r.reward));
      if (me.place <= 3) addTwinkles(banner, 8);
      appendTo(body,
        banner,
        h('div', { class: 'panel hd-mine' }, h('b', {}, 'Judges\' scorecard'), catBars(me.categories)),
        h('div', { class: 'section-title pad-x', html: `${icon('star')}All entries` }),
        h('div', { class: 'hd-results' }, r.ranked.map((e) => h('div', { class: `hd-entry ${e.isPlayer ? 'me' : ''}` },
          h('div', { class: 'hd-place' }, MEDAL[e.place] || PLACE[e.place]),
          h('div', { class: 'hd-thumb', html: e.isPlayer ? renderRoom(s, e.property, e.room) : renderRoom(e.ghost, e.property, e.room) }),
          h('div', { class: 'hd-rinfo' }, h('b', {}, e.isPlayer ? `${e.name} (you)` : e.name), h('span', { class: 'muted tiny' }, e.isPlayer ? `${e.pieces} pieces` : `${e.style} style · ${e.pieces} pieces`), h('b', { class: 'hd-pct' }, `${e.percent}%`))))),
        h('div', { class: 'center' }, h('button', { class: 'btn btn-primary hd-done', onClick: lobby }, 'Back to briefs')),
      );
      ctx.root?.scrollTo?.(0, 0);
      await celebrate(ctx, r, { title: me.place === 1 ? `First place! +${fmt(r.reward.coins)} coins & ${r.reward.gems} gems 🏆` : `${PLACE[me.place]} place — +${fmt(r.reward.coins)} coins`, from: banner });
    }

    lobby();
  },
};
