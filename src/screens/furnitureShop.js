/**
 * FURNITURE SHOPS — Cosy Living, Glam Interiors, Luxe Maison and Dream Decor.
 * Pieces are previewed inside your own current room before buying; wallpapers and floors
 * preview on the room itself. Furniture can be bought in multiples.
 */
import { h, appendTo, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderRoom } from '../components/roomRenderer.js';
import { furnitureThumb } from '../components/art/furnitureArt.js';
import { itemCard, priceTag } from '../components/itemCard.js';
import { FURNITURE, SURFACES, FURNITURE_SHOP_BY_ID, FURNITURE_SHOPS } from '../data/furniture.js';
import { HOME_STYLE_BY_ID } from '../data/homeStyles.js';
import { buyFurniture, buySurface, ownsSurface, instancesOf, isForSale, MAX_BUY_QTY } from '../systems/furnitureInventory.js';
import { roomsOf, findSpot, layoutOf } from '../systems/decoratingSystem.js';
import { ROOM_TYPES } from '../data/properties.js';
import { canAfford } from '../systems/economy.js';

const SURFACE_SHOP = 'dream_decor';

export const fshop = {
  id: 'fshop',
  chrome: 'full',
  title: 'Furniture shop',
  mount(el, params, ctx) {
    const shop = FURNITURE_SHOP_BY_ID[params.shopId] || FURNITURE_SHOPS[0];
    const furniture = FURNITURE.filter((f) => f.shop === shop.id && isForSale(f));
    const surfaces = shop.id === SURFACE_SHOP ? SURFACES.filter((s) => !s.free) : [];
    const cats = [...new Set(furniture.map((f) => f.category))];
    let filter = 'all';
    let selected = null; // { type: 'furniture'|'surface', entry }

    const s0 = ctx.store.get();
    const propertyId = s0.properties.current;
    const indoor = roomsOf(s0, propertyId).filter((r) => !ROOM_TYPES[r.type].outdoor);
    let roomId = (indoor[0] || roomsOf(s0, propertyId)[0]).id;

    const preview = h('div', { class: 'shop-room' });
    const detail = h('div', { class: 'detail-card fdetail' });
    const chips = h('div', { class: 'chips' });
    const grid = h('div', { class: 'grid' });
    el.append(
      h('div', { class: `fshop-banner ${shop.theme.dark ? 'dark' : ''}`, style: { '--accent': shop.theme.accent, '--wall': shop.theme.wall, '--sign': shop.theme.sign } },
        h('button', { class: 'back-btn', onClick: () => ctx.back('mall'), html: `${icon('back')}Leave` }),
        h('div', { class: 'fshop-sign' }, h('b', {}, shop.name), h('small', {}, shop.type)),
        h('p', { class: 'tiny' }, shop.tagline)),
      h('div', { class: 'pad-x preview-wrap' }, preview, detail),
      chips, grid,
    );

    function previewState(s) {
      if (selected?.type !== 'surface') return s;
      const ghost = structuredClone(s);
      const layout = layoutOf(ghost, propertyId, roomId);
      if (layout) layout[selected.entry.kind === 'wallpaper' ? 'wallpaper' : 'floor'] = selected.entry.id;
      return ghost;
    }

    function render() {
      const s = ctx.store.get();
      let prev = null;
      if (selected?.type === 'furniture') prev = { item: selected.entry, ...findSpot(s, propertyId, roomId, selected.entry) };
      preview.innerHTML = renderRoom(previewState(s), propertyId, roomId, { preview: prev });
      preview.append(h('span', { class: 'preview-label' }, 'Preview in your room'));
      renderDetail(s);
      chips.innerHTML = '';
      const chip = (id, label) => h('button', { class: `chip ${filter === id ? 'active' : ''}`, onClick: () => { filter = id; ctx.sfx.play('tap'); render(); } }, label);
      chips.append(chip('all', 'All'));
      if (surfaces.length) { chips.append(chip('wallpaper', 'Wallpaper & paint'), chip('floor', 'Floors')); }
      for (const c of cats) chips.append(chip(c, c));
      grid.innerHTML = '';
      const showSurf = filter === 'all' || filter === 'wallpaper' || filter === 'floor';
      if (showSurf) {
        for (const sf of surfaces.filter((x) => filter === 'all' || x.kind === filter)) {
          const owned = ownsSurface(s, sf.id);
          grid.append(itemCard({
            thumbHTML: surfaceSwatch(sf), name: sf.name, rarity: sf.price >= 600 ? 'rare' : 'common', owned, selected: selected?.entry.id === sf.id,
            footer: h('div', { class: 'meta' }, owned ? h('span', { class: 'owned-tag' }, '✓ Owned') : priceTag({ coins: sf.price }, canAfford(s, { coins: sf.price }))),
            onClick: () => { selected = { type: 'surface', entry: sf }; ctx.sfx.play('tap'); render(); },
          }));
        }
      }
      if (filter !== 'wallpaper' && filter !== 'floor') {
        for (const f of furniture.filter((x) => filter === 'all' || x.category === filter)) {
          const n = instancesOf(s, f.id).length;
          appendTo(grid, itemCard({
            thumbHTML: furnitureThumb(f, { trophies: s.trophies }), name: f.name, rarity: f.price.coins >= 2500 ? 'epic' : f.price.coins >= 1200 ? 'rare' : 'common', selected: selected?.entry.id === f.id,
            footer: h('div', { class: 'meta' }, priceTag(f.price, canAfford(s, f.price)), n ? h('span', { class: 'owned-tag' }, ` ×${n}`) : null),
            onClick: () => { selected = { type: 'furniture', entry: f }; ctx.sfx.play('tap'); render(); window.scrollTo?.(0, 0); el.scrollTo({ top: 0, behavior: 'smooth' }); },
          }));
        }
      }
    }

    function renderDetail(s) {
      detail.innerHTML = '';
      const rooms = roomsOf(s, propertyId);
      const roomSel = h('select', { class: 'room-select', 'aria-label': 'Preview room', onChange: (e) => { roomId = e.target.value; render(); } },
        rooms.map((r) => { const o = h('option', { value: r.id }, r.name); if (r.id === roomId) o.selected = true; return o; }));
      if (!selected) {
        detail.append(h('h3', {}, 'Window shopping'), h('p', { class: 'muted tiny' }, 'Tap anything to see it in your own room. Furniture goes to storage — place it with Decorate.'), roomSel);
        return;
      }
      const e = selected.entry;
      if (selected.type === 'surface') {
        const owned = ownsSurface(s, e.id);
        appendTo(detail, h('h3', {}, e.name), h('small', { class: 'muted' }, e.kind === 'wallpaper' ? 'Wallpaper / paint · use in any room' : 'Flooring · use in any room'),
          e.styles?.length ? h('div', { class: 'tags' }, e.styles.map((t) => h('span', { class: 'tag' }, HOME_STYLE_BY_ID[t]?.name || t))) : null, roomSel, h('div', { class: 'grow' }),
          owned ? h('span', { class: 'owned-tag' }, '✓ Owned — apply it in Decorate') : h('button', { class: 'btn btn-gold btn-small', onClick: () => buySurf(e) }, h('span', {}, 'Buy '), priceTag({ coins: e.price })));
        return;
      }
      const n = instancesOf(s, e.id).length;
      appendTo(detail, h('h3', {}, e.name),
        h('small', { class: 'muted' }, `${e.category}${e.styles[0] ? ` · ${HOME_STYLE_BY_ID[e.styles[0]]?.name}` : ''}`),
        e.func ? h('small', { class: 'func-note' }, `✨ Interactive: ${{ bed: 'rest & save', wardrobe: 'opens your closet', vanity: 'makeup', mirror: 'hair & face', trophies: 'shows trophies' }[e.func]}`) : null,
        roomSel, h('div', { class: 'grow' }),
        n ? h('small', { class: 'owned-tag' }, `You own ${n}`) : null,
        h('button', { class: 'btn btn-gold btn-small', onClick: () => buyFurn(e) }, h('span', {}, 'Buy '), priceTag(e.price)));
    }

    async function buyFurn(item) {
      let qty = 1;
      const qtyLabel = h('b', { class: 'qty' }, '1');
      const total = h('p', { class: 'muted tiny' });
      const update = () => { qtyLabel.textContent = qty; total.textContent = `Total ${fmt(item.price.coins * qty)} coins · you have ${fmt(ctx.store.get().player.coins)}`; };
      const body = h('div', { class: 'buy-confirm' },
        h('div', { class: 'buy-thumb', html: furnitureThumb(item) }), h('p', {}, h('b', {}, item.name)),
        h('div', { class: 'stepper' }, h('button', { class: 'btn btn-soft btn-small', 'aria-label': 'Fewer', onClick: () => { qty = Math.max(1, qty - 1); update(); } }, '−'), qtyLabel,
          h('button', { class: 'btn btn-soft btn-small', 'aria-label': 'More', onClick: () => { qty = Math.min(MAX_BUY_QTY, qty + 1); update(); } }, '+')), total);
      update();
      const ok = await ctx.modal.open({ title: 'Add to your home?', body, buttons: [{ label: 'Not now', value: false }, { label: 'Buy', value: true, cls: 'btn-gold' }] });
      if (!ok) return;
      const r = ctx.store.transact((d) => buyFurniture(d, item.id, qty), 'buy-furniture');
      if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.reason === 'insufficient-funds' ? 'Not enough coins for that many.' : 'Purchase failed.', { type: 'error' }); return; }
      await ctx.saveNow();
      ctx.sfx.play('buy');
      ctx.sparkleBurst(preview, 16);
      const place = await ctx.modal.open({ title: 'Delivered! 📦', body: `<p><b>${qty} × ${item.name}</b> ${qty > 1 ? 'are' : 'is'} in your furniture storage.</p>`, buttons: [{ label: 'Keep shopping', value: false }, { label: 'Place it now', value: true, cls: 'btn-primary' }] });
      if (place) ctx.go('decorate', { propertyId, roomId, placeUid: r.uids[0] });
      else render();
    }

    async function buySurf(sf) {
      const r = ctx.store.transact((d) => buySurface(d, sf.id), 'buy-surface');
      if (r.ok === false) { ctx.sfx.play('error'); ctx.toast(r.reason === 'insufficient-funds' ? `You need ${fmt(sf.price - ctx.store.get().player.coins)} more coins.` : 'Already owned.', { type: 'error' }); return; }
      await ctx.saveNow();
      ctx.sfx.play('buy');
      ctx.toast(`${sf.name} is yours — apply it in any room with Decorate!`, { type: 'reward' });
      render();
    }

    render();
  },
};

/** Small square swatch for a wallpaper/floor (uses the room renderer's patterns via a mini room). */
export function surfaceSwatch(sf) {
  const c1 = sf.c1; const c2 = sf.c2 || c1; const c3 = sf.c3 || '#fff';
  const pat = {
    stripes: `<rect width="60" height="60" fill="${c1}"/>${[0, 20, 40].map((x) => `<rect x="${x}" width="10" height="60" fill="${c2}"/>`).join('')}`,
    stripes_hearts: `<rect width="60" height="60" fill="${c1}"/>${[0, 20, 40].map((x) => `<rect x="${x}" width="10" height="60" fill="${c2}"/>`).join('')}`,
    damask: `<rect width="60" height="60" fill="${c1}"/>${[[15, 15], [45, 45]].map(([x, y]) => `<path d="M ${x} ${y - 10} C ${x + 8} ${y - 2} ${x + 8} ${y + 4} ${x} ${y + 10} C ${x - 8} ${y + 4} ${x - 8} ${y - 2} ${x} ${y - 10} Z" fill="${c2}"/>`).join('')}`,
    floral: `<rect width="60" height="60" fill="${c1}"/>${[[15, 15], [45, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c2}"/><circle cx="${x}" cy="${y}" r="2" fill="#fff6c4"/><path d="M ${x + 6} ${y + 4} q 6 3 8 8" stroke="${c3}" stroke-width="2" fill="none"/>`).join('')}`,
    stars: `<rect width="60" height="60" fill="${c1}"/>${[[14, 14], [42, 26], [24, 44]].map(([x, y]) => `<path d="M ${x} ${y - 6} l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 Z" fill="${c2}"/>`).join('')}`,
    hearts: `<rect width="60" height="60" fill="${c1}"/>${[[18, 20], [42, 42]].map(([x, y]) => `<path d="M ${x} ${y + 6} C ${x - 10} ${y - 2} ${x - 4} ${y - 10} ${x} ${y - 4} C ${x + 4} ${y - 10} ${x + 10} ${y - 2} ${x} ${y + 6} Z" fill="${c2}"/>`).join('')}`,
    brick: `<rect width="60" height="60" fill="#e9d8cc"/>${[0, 1, 2, 3, 4].map((r) => `<rect x="${r % 2 ? -10 : 1}" y="${r * 12 + 1}" width="28" height="10" fill="${c1}"/><rect x="${r % 2 ? 20 : 31}" y="${r * 12 + 1}" width="28" height="10" fill="${c2}"/>`).join('')}`,
    panel: `<rect width="60" height="60" fill="${c1}"/><rect x="10" y="10" width="40" height="40" rx="3" fill="none" stroke="${c2}" stroke-width="4"/>`,
    tiles: `<rect width="60" height="60" fill="${c2}"/>${[0, 1, 2, 3].map((r) => `<rect x="${r % 2 ? -12 : 2}" y="${r * 15 + 2}" width="26" height="11" rx="2" fill="${c1}"/><rect x="${r % 2 ? 18 : 32}" y="${r * 15 + 2}" width="26" height="11" rx="2" fill="${c1}"/>`).join('')}`,
    planks: `<rect width="60" height="60" fill="${c1}"/>${[0, 1, 2, 3, 4].map((r) => `<rect y="${r * 12}" width="60" height="1.5" fill="${c2}"/><rect x="${r % 2 ? 22 : 40}" y="${r * 12}" width="1.5" height="12" fill="${c2}"/>`).join('')}`,
    checker: `<rect width="60" height="60" fill="${c1}"/>${[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => ((r + c) % 2 ? `<rect x="${c * 15}" y="${r * 15}" width="15" height="15" fill="${c2}"/>` : '')).join('')).join('')}`,
    marble: `<rect width="60" height="60" fill="${c1}"/><path d="M 0 40 Q 20 25 35 32 T 60 14 M 8 0 Q 16 18 40 14" stroke="${c2}" stroke-width="2" fill="none"/>`,
    carpet: `<rect width="60" height="60" fill="${c1}"/>`,
    grass: `<rect width="60" height="60" fill="${c1}"/>`,
    herringbone: `<rect width="60" height="60" fill="${c1}"/>${[0, 1, 2, 3].map((r) => `<path d="M 0 ${r * 15 + 15} L 15 ${r * 15} L 30 ${r * 15 + 15} L 45 ${r * 15} L 60 ${r * 15 + 15}" stroke="${c2}" stroke-width="2" fill="none"/>`).join('')}`,
    paint: `<rect width="60" height="60" fill="${c1}"/><path d="M 8 52 Q 30 40 52 52" stroke="#fff" stroke-width="3" opacity=".4" fill="none"/>`,
  }[sf.pattern] || `<rect width="60" height="60" fill="${c1}"/>`;
  return `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><clipPath id="sw${sf.id}"><rect width="60" height="60" rx="10"/></clipPath><g clip-path="url(#sw${sf.id})">${pat}</g></svg>`;
}
