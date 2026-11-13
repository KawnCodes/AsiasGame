/**
 * DECORATING MODE — drag-and-drop interior design for any room of any owned home.
 *
 * Pointer events (mouse + touch on iPhone) drag a piece; positions are clamped to the
 * piece's zone live, and the move is committed (and auto-saved) when you let go.
 * Tap a piece to select it: Flip, Store (back to storage) or deselect. Pieces placed from
 * storage drop into the free-est spot. Wallpaper and floors apply instantly.
 */
import { h, appendTo, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderRoom } from '../components/roomRenderer.js';
import { furnitureThumb } from '../components/art/furnitureArt.js';
import { surfaceSwatch } from './furnitureShop.js';
import { FURNITURE_BY_ID, SURFACES } from '../data/furniture.js';
import { PROPERTY_BY_ID, ROOM_TYPES } from '../data/properties.js';
import { storedGroups, ownsSurface, sellFurniture, furnitureResale } from '../systems/furnitureInventory.js';
import {
  ROOM, roomsOf, roomDef, layoutOf, placeItem, moveItem, flipItem, storeItem, setSurface, clampPosition, itemScale, placedCount, MAX_ITEMS_PER_ROOM,
} from '../systems/decoratingSystem.js';

export const decorate = {
  id: 'decorate',
  chrome: 'hud',
  title: 'Decorating mode',
  mount(el, params, ctx) {
    const s0 = ctx.store.get();
    const propertyId = s0.properties.owned.includes(params.propertyId) ? params.propertyId : s0.properties.current;
    let roomId = roomDef(s0, propertyId, params.roomId) ? params.roomId : roomsOf(s0, propertyId)[0].id;
    let selected = null;
    let tab = 'storage';
    let selling = false;
    let drag = null;

    const roomTabs = h('div', { class: 'chips room-tabs' });
    const canvas = h('div', { class: 'deco-canvas', style: { aspectRatio: `${ROOM.W} / ${ROOM.H}` } });
    const tools = h('div', { class: 'deco-tools' });
    const drawerTabs = h('div', { class: 'chips seg' });
    const drawer = h('div', { class: 'deco-drawer' });
    el.append(
      h('div', { class: 'screen-header deco-head' },
        h('div', {}, h('h2', {}, h('span', { class: 'script' }, 'Decorate')), h('small', { class: 'muted' }, PROPERTY_BY_ID[propertyId].name)),
        h('button', { class: 'btn btn-primary btn-small', onClick: done }, 'Done ✓')),
      roomTabs, canvas, tools, drawerTabs, drawer,
    );

    // first-visit hint
    if (!s0.flags.decoHintSeen) {
      setTimeout(() => ctx.toast('Drag furniture to move it · tap to select ✨', { duration: 3500 }), 300);
      ctx.store.transact((d) => { d.flags.decoHintSeen = true; }, 'flag');
    }

    function svgPoint(evt) {
      const svg = canvas.querySelector('svg');
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    function renderCanvas() {
      const s = ctx.store.get();
      canvas.innerHTML = renderRoom(s, propertyId, roomId, { avatar: false, selected });
    }

    function renderTools() {
      const s = ctx.store.get();
      tools.innerHTML = '';
      const layout = layoutOf(s, propertyId, roomId);
      if (!selected || !layout?.placed[selected]) {
        tools.append(h('span', { class: 'muted tiny' }, `${placedCount(layout)}/${MAX_ITEMS_PER_ROOM} pieces · drag to move, tap to select`));
        return;
      }
      const item = FURNITURE_BY_ID[s.furniture.items[selected].id];
      tools.append(
        h('b', { class: 'tool-name' }, item.name),
        h('button', { class: 'btn btn-soft btn-small', onClick: () => { ctx.store.transact((d) => flipItem(d, selected), 'flip'); ctx.sfx.play('tap'); } }, '↔ Flip'),
        h('button', { class: 'btn btn-soft btn-small', onClick: () => { ctx.store.transact((d) => storeItem(d, selected), 'store'); ctx.sfx.play('tap'); ctx.toast(`${item.name} moved to storage`); selected = null; render(); } }, '📦 Store'),
        h('button', { class: 'btn btn-soft btn-small', 'aria-label': 'Deselect', onClick: () => { selected = null; render(); } }, '✕'),
      );
    }

    function renderRoomTabs() {
      const s = ctx.store.get();
      roomTabs.innerHTML = '';
      for (const r of roomsOf(s, propertyId)) roomTabs.append(h('button', { class: `chip ${r.id === roomId ? 'active' : ''}`, onClick: () => { roomId = r.id; selected = null; ctx.sfx.play('tap'); render(); } }, r.name));
    }

    function renderDrawer() {
      const s = ctx.store.get();
      const outdoor = ROOM_TYPES[roomDef(s, propertyId, roomId).type].outdoor;
      const groups = storedGroups(s);
      drawerTabs.innerHTML = '';
      const t = (id, label) => h('button', { class: `chip ${tab === id ? 'active' : ''}`, onClick: () => { tab = id; ctx.sfx.play('tap'); renderDrawer(); } }, label);
      appendTo(drawerTabs, t('storage', `Storage (${groups.reduce((n, g) => n + g.uids.length, 0)})`), outdoor ? null : t('wallpaper', 'Walls'), t('floor', 'Floor'));
      if (outdoor && tab === 'wallpaper') tab = 'storage';
      drawer.innerHTML = '';
      if (tab === 'storage') {
        const grid = h('div', { class: 'grid small' });
        if (!groups.length) grid.append(h('div', { class: 'empty' }, 'Storage is empty. Pieces you store or buy appear here.'));
        for (const g of groups) {
          const canSell = g.item.sellable && !g.item.starter && g.item.price.coins > 0;
          appendTo(grid, h('button', { class: `card ${selling ? (canSell ? 'sellable' : 'unsellable') : ''}`, onClick: () => (selling ? sell(g) : place(g.uids[0])) },
            h('div', { class: 'thumb', html: furnitureThumb(g.item, { trophies: s.trophies }) }), h('div', { class: 'name' }, g.item.name),
            selling ? h('div', { class: 'meta sell-price' }, canSell ? `${fmt(furnitureResale(g.item).coins)} coins` : 'Keepsake') : null,
            g.uids.length > 1 ? h('span', { class: 'count-badge' }, `×${g.uids.length}`) : null));
        }
        drawer.append(grid, h('div', { class: 'pad btn-row' },
          h('button', { class: `btn btn-small ${selling ? 'btn-primary' : 'btn-soft'} sell-mode`, onClick: () => { selling = !selling; ctx.sfx.play('tap'); renderDrawer(); } }, selling ? '✓ Done selling' : '💰 Sell pieces'),
          h('button', { class: 'btn btn-gold btn-small', onClick: () => ctx.go('mall', { section: 'home' }) }, 'Shop furniture')));
        return;
      }
      const kind = tab;
      const layout = layoutOf(s, propertyId, roomId);
      const current = kind === 'wallpaper' ? layout.wallpaper : layout.floor;
      const owned = SURFACES.filter((sf) => sf.kind === kind && ownsSurface(s, sf.id));
      const grid = h('div', { class: 'grid small' });
      for (const sf of owned) {
        grid.append(h('button', { class: `card ${sf.id === current ? 'selected' : ''}`, onClick: () => { ctx.store.transact((d) => setSurface(d, propertyId, roomId, sf.id), 'surface'); ctx.sfx.play('equip'); } },
          h('div', { class: 'thumb', html: surfaceSwatch(sf) }), h('div', { class: 'name' }, sf.name)));
      }
      const more = SURFACES.filter((sf) => sf.kind === kind && !ownsSurface(s, sf.id)).length;
      appendTo(drawer, grid, more ? h('div', { class: 'pad' }, h('button', { class: 'btn btn-gold btn-small', onClick: () => ctx.go('fshop', { shopId: 'dream_decor' }) }, `${more} more at Dream Decor`)) : null);
    }

    async function sell(g) {
      const { item } = g;
      if (!(item.sellable && !item.starter && item.price.coins > 0)) { ctx.sfx.play('error'); ctx.toast(`${item.name} is a free keepsake and can't be sold.`, { type: 'info' }); return; }
      const value = furnitureResale(item).coins;
      const ok = await ctx.modal.confirm('Sell this piece?', `Sell one <b>${item.name}</b> for <b>${fmt(value)} coins</b>?`, 'Sell', 'Keep it');
      if (!ok) return;
      const r = ctx.store.transact((d) => sellFurniture(d, g.uids[0]), 'sell-furniture');
      if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.message || 'Could not sell that.', { type: 'error' }); return; }
      await ctx.saveNow();
      ctx.sfx.play('buy');
      ctx.toast(`Sold ${item.name} for ${fmt(value)} coins`, { type: 'success' });
      renderDrawer();
    }

    function place(uid) {
      const r = ctx.store.transact((d) => placeItem(d, propertyId, roomId, uid), 'place');
      if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.reason === 'room-full' ? 'This room is full — store something first.' : 'Could not place that.', { type: 'error' }); return; }
      selected = uid;
      ctx.sfx.play('equip');
      render();
      ctx.sparkleBurst(canvas, 8);
    }

    function render() { renderRoomTabs(); renderCanvas(); renderTools(); renderDrawer(); }

    // ---------------- drag & drop (pointer events: mouse, pen and touch) ----------------
    canvas.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.fitem');
      if (!g) { if (selected) { selected = null; renderCanvas(); renderTools(); } return; }
      e.preventDefault();
      const uid = g.dataset.uid;
      const s = ctx.store.get();
      const p = layoutOf(s, propertyId, roomId).placed[uid];
      const item = FURNITURE_BY_ID[s.furniture.items[uid].id];
      const start = svgPoint(e);
      drag = { uid, g, item, start, orig: { x: p.x, y: p.y }, flip: p.flip, pos: { x: p.x, y: p.y }, moved: false, id: e.pointerId };
      canvas.setPointerCapture(e.pointerId);
      if (selected !== uid) { selected = uid; canvas.querySelector('.sel-box')?.remove(); renderTools(); }
      g.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const pt = svgPoint(e);
      const dx = pt.x - drag.start.x; const dy = pt.y - drag.start.y;
      if (!drag.moved && Math.hypot(dx, dy) < 3) return;
      drag.moved = true;
      canvas.querySelector('.sel-box')?.remove();
      drag.pos = clampPosition(drag.item, drag.orig.x + dx, drag.orig.y + dy);
      const sc = itemScale(drag.item, drag.pos.y);
      drag.g.setAttribute('transform', `translate(${drag.pos.x} ${drag.pos.y}) scale(${drag.flip ? -sc : sc} ${sc})`);
    });
    const endDrag = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const d = drag;
      drag = null;
      if (d.moved) { ctx.store.transact((st) => moveItem(st, d.uid, d.pos.x, d.pos.y), 'move'); ctx.sfx.play('tap'); }
      else renderCanvas();
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    async function done() {
      await ctx.saveNow();
      ctx.sfx.play('reward');
      ctx.toast('Room saved! 🏡', { type: 'success' });
      ctx.go('home', { propertyId, roomId }, { replace: true });
    }

    if (params.placeUid && ctx.store.get().furniture.items[params.placeUid] && !ctx.store.get().furniture.items[params.placeUid].at) place(params.placeUid);
    else render();
    return ctx.store.subscribe((s) => { if (s && !drag) { renderCanvas(); renderTools(); renderDrawer(); } });
  },
};
