/**
 * PROPERTY — Dream Homes Realty (buy homes) and My Homes (visit, move in, upgrade).
 */
import { h, appendTo, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { exteriorSVG } from '../components/art/propertyArt.js';
import { renderRoom } from '../components/roomRenderer.js';
import { rewardChips } from '../components/rewards.js';
import { PROPERTIES, PROPERTY_BY_ID, UPGRADE_BY_ID, ROOM_TYPES } from '../data/properties.js';
import { buyProperty, moveIn, buyUpgrade, upgradesOf, ownsProperty, propertyLockReason } from '../systems/propertySystem.js';
import { roomsOf, placedCount, layoutOf } from '../systems/decoratingSystem.js';
import { canAfford } from '../systems/economy.js';
import { priceTag } from '../components/itemCard.js';

const VIEW_NAME = { city: 'City view', garden: 'Garden view', skyline: 'Skyline view', street: 'Street view', ocean: 'Ocean view', night: 'Night-sky view', hills: 'Hillside view' };

function roomList(state, p) {
  const rooms = state && ownsProperty(state, p.id) ? roomsOf(state, p.id) : p.rooms;
  return h('div', { class: 'room-pills' }, rooms.map((r) => h('span', { class: `room-pill ${ROOM_TYPES[r.type].outdoor ? 'out' : ''}` }, r.name)));
}

// ================================================================== agency
export const agency = {
  id: 'agency',
  chrome: 'full',
  title: 'Dream Homes Realty',
  mount(el, params, ctx) {
    const list = h('div', { class: 'prop-list' });
    el.append(
      h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('city'), html: `${icon('back')}Back` }), h('h2', {}, h('span', { class: 'script' }, 'Dream'), ' Homes')),
      h('p', { class: 'muted tiny pad-x' }, 'Every home is yours forever once bought — own as many as you like and move between them any time.'),
      list,
    );
    function render() {
      const s = ctx.store.get();
      list.innerHTML = '';
      for (const p of PROPERTIES) {
        const owned = ownsProperty(s, p.id);
        const lock = owned ? null : propertyLockReason(s, p.id);
        const current = s.properties.current === p.id;
        appendTo(list, h('div', { class: `prop-card ${owned ? 'owned' : ''} ${lock ? 'locked' : ''}` },
          h('div', { class: 'prop-ext', html: exteriorSVG(p, upgradesOf(s, p.id)) }),
          h('div', { class: 'prop-body' },
            h('div', { class: 'prop-row' }, h('b', {}, p.name), owned ? h('span', { class: 'owned-tag' }, current ? '★ Living here' : '✓ Owned') : priceTag({ coins: p.price }, canAfford(s, { coins: p.price }))),
            h('small', { class: 'muted' }, `${p.address} · ${VIEW_NAME[p.view]}`),
            h('p', { class: 'tiny prop-blurb' }, p.blurb),
            roomList(s, p),
            h('div', { class: 'btn-row' },
              owned
                ? h('button', { class: 'btn btn-soft btn-small', onClick: () => ctx.go('home', { propertyId: p.id }) }, 'Visit')
                : h('button', { class: 'btn btn-soft btn-small', onClick: () => preview(p) }, 'Tour'),
              owned
                ? (current ? null : h('button', { class: 'btn btn-primary btn-small', onClick: () => doMove(p) }, 'Move in'))
                : lock ? h('span', { class: 'lock-note', html: `${icon('lock')}${lock}` }) : h('button', { class: 'btn btn-gold btn-small', onClick: () => buy(p) }, 'Buy'),
            ),
          )));
      }
    }
    function preview(p) {
      const s = ctx.store.get();
      // a tour shows the empty first room with the property's view
      const ghost = structuredClone(s);
      ghost.properties.owned.push(p.id);
      const body = h('div', { class: 'tour' }, h('div', { class: 'tour-room', html: renderRoom(ghost, p.id, p.rooms[0].id, { avatar: true }) }), h('p', { class: 'tiny' }, p.blurb), roomList(null, p),
        h('p', { class: 'muted tiny' }, `${p.rooms.length} rooms · ${VIEW_NAME[p.view]} · requires level ${p.level}`));
      ctx.modal.open({ title: p.name, body, className: 'wide', buttons: [{ label: 'Close', value: false }, ...(propertyLockReason(s, p.id) ? [] : [{ label: `Buy · ${fmt(p.price)}`, value: true, cls: 'btn-gold' }])] })
        .then((v) => { if (v) buy(p); });
    }
    async function buy(p) {
      const s = ctx.store.get();
      if (!canAfford(s, { coins: p.price })) { ctx.sfx.play('error'); ctx.toast(`You need ${fmt(p.price - s.player.coins)} more coins.`, { type: 'error' }); return; }
      const ok = await ctx.modal.confirm('Buy this home?', `<p>Buy the <b>${p.name}</b> for <b>${fmt(p.price)} coins</b>?</p><p class="muted tiny">You'll have ${fmt(s.player.coins - p.price)} coins left.</p>`, 'Buy it!', 'Not yet');
      if (!ok) return;
      const r = ctx.store.transact((d) => buyProperty(d, p.id), 'buy-property');
      if (r.ok === false) { ctx.toast(r.message || 'Could not buy this home.', { type: 'error' }); return; }
      await ctx.saveNow();
      ctx.sfx.play('buy');
      ctx.sparkleBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 26);
      const move = await ctx.modal.open({ title: 'Keys in hand! 🔑', body: `<p>The <b>${p.name}</b> is yours! A housewarming plant is waiting in your furniture storage.</p>`, buttons: [{ label: 'Stay where I am', value: false }, { label: 'Move in now', value: true, cls: 'btn-primary' }] });
      if (move) ctx.store.transact((d) => moveIn(d, p.id), 'move-in');
      ctx.go('home', { propertyId: p.id });
    }
    function doMove(p) {
      ctx.store.transact((d) => moveIn(d, p.id), 'move-in');
      ctx.sfx.play('reward');
      ctx.toast(`You moved into the ${p.name}!`, { type: 'success' });
    }
    render();
    return ctx.store.subscribe((s) => s && render());
  },
};

// ================================================================== my homes
export const homes = {
  id: 'homes',
  chrome: 'full',
  title: 'My homes',
  mount(el, params, ctx) {
    const list = h('div', { class: 'prop-list' });
    el.append(
      h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('home'), html: `${icon('back')}Back` }), h('h2', {}, h('span', { class: 'script' }, 'My'), ' Homes')),
      list,
      h('div', { class: 'pad' }, h('button', { class: 'btn btn-gold btn-block', onClick: () => ctx.go('agency') }, 'Browse more homes at Dream Homes Realty')),
    );
    function render() {
      const s = ctx.store.get();
      list.innerHTML = '';
      for (const id of s.properties.owned) {
        const p = PROPERTY_BY_ID[id];
        const current = s.properties.current === id;
        const rooms = roomsOf(s, id);
        const pieces = rooms.reduce((n, r) => n + placedCount(layoutOf(s, id, r.id)), 0);
        const available = p.upgrades.filter((u) => !upgradesOf(s, id).includes(u)).length;
        appendTo(list, h('div', { class: `prop-card owned ${current ? 'current' : ''}` },
          h('div', { class: 'prop-ext', html: exteriorSVG(p, upgradesOf(s, id)) }),
          h('div', { class: 'prop-body' },
            h('div', { class: 'prop-row' }, h('b', {}, p.name), current ? h('span', { class: 'owned-tag' }, '★ Living here') : null),
            h('small', { class: 'muted' }, `${rooms.length} rooms · ${pieces} pieces placed`),
            roomList(s, p),
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-soft btn-small', onClick: () => ctx.go('home', { propertyId: id }) }, 'Visit'),
              h('button', { class: 'btn btn-lilac btn-small', onClick: () => openUpgrades(ctx, id) }, `Upgrades${available ? ` (${available})` : ''}`),
              current ? null : h('button', { class: 'btn btn-primary btn-small', onClick: () => { ctx.store.transact((d) => moveIn(d, id), 'move-in'); ctx.sfx.play('reward'); ctx.toast(`You moved into the ${p.name}!`, { type: 'success' }); } }, 'Move in'),
            ),
          )));
      }
    }
    render();
    return ctx.store.subscribe((s) => s && render());
  },
};

/** Upgrade shop for one home — upgrades apply instantly. */
export function openUpgrades(ctx, propertyId) {
  const p = PROPERTY_BY_ID[propertyId];
  const body = h('div', { class: 'upgrade-list' });
  const fill = () => {
    const s = ctx.store.get();
    body.innerHTML = '';
    for (const uid of p.upgrades) {
      const u = UPGRADE_BY_ID[uid];
      const owned = upgradesOf(s, propertyId).includes(uid);
      body.append(h('div', { class: `upgrade ${owned ? 'owned' : ''}` },
        h('span', { class: 'up-ico' }, u.icon),
        h('div', { class: 'up-body' }, h('b', {}, u.name), h('small', { class: 'muted' }, u.blurb)),
        owned ? h('span', { class: 'owned-tag' }, '✓')
          : h('button', { class: 'btn btn-gold btn-small', onClick: async (e) => {
            const btn = e.currentTarget; // currentTarget is cleared once we await
            const r = ctx.store.transact((d) => buyUpgrade(d, propertyId, uid), 'upgrade');
            if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.reason === 'insufficient-funds' ? `You need ${fmt(u.price - ctx.store.get().player.coins)} more coins.` : 'Not available.', { type: 'error' }); return; }
            await ctx.saveNow();
            ctx.sfx.play('buy');
            ctx.sparkleBurst(btn.isConnected ? btn : body, 14);
            ctx.toast(r.newRoom ? `${u.name} built — new room added!` : `${u.name} installed!${u.gift ? ' Check your furniture storage.' : ''}`, { type: 'reward' });
            fill();
          } }, priceTag({ coins: u.price }, canAfford(s, { coins: u.price }))),
      ));
    }
  };
  fill();
  return ctx.modal.open({ title: `${p.name} upgrades`, body, buttons: [{ label: 'Done', value: true, cls: 'btn-primary' }], className: 'wide' });
}
