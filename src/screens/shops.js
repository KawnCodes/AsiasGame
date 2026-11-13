/**
 * SHOPPING — the mall directory and the generic shop interior.
 * Shops are data-driven (data/shops.js); every purchasable kind (clothing,
 * hairstyles, hair dyes, makeup) shares one try-on → buy → wear flow.
 */
import { h, appendTo } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar, renderItemThumb } from '../components/avatarRenderer.js';
import { itemCard, priceTag, rarityPill } from '../components/itemCard.js';
import { addTwinkles } from '../components/sparkles.js';
import { shopBannerSVG } from '../components/art/shopArt.js';
import { locationSVG } from '../components/art/cityArt.js';
import { SHOPS, SHOP_BY_ID } from '../data/shops.js';
import { LOCATIONS } from '../data/locations.js';
import { CLOTHING, CATEGORIES } from '../data/clothing.js';
import { HAIRSTYLES, HAIR_COLORS, MAKEUP } from '../data/appearance.js';
import { owns, purchase, equip, setAppearance } from '../systems/inventory.js';
import { canAfford, priceAmount, priceCurrency } from '../systems/economy.js';
import { priceOf } from '../systems/catalog.js';
import { FURNITURE_SHOPS } from '../data/furniture.js';

const HAIR_VIEW = '36 0 128 150';
const FACE_VIEW = '64 40 72 64';
const MAKEUP_KEYS = { eyeshadow: 'Eyeshadow', eyeliner: 'Eyeliner', lipstick: 'Lipstick', blush: 'Blush' };

// ------------------------------------------------------------------ entries
function entriesFor(shop) {
  const out = [];
  for (const rule of shop.sells) {
    if (rule.kind === 'clothing') {
      for (const c of CLOTHING) if (!c.starter && c.shop === rule.shop) out.push({ kind: 'clothing', id: c.id, name: c.name, entry: c, rarity: c.rarity, styles: c.styles, filter: c.category });
    } else if (rule.kind === 'hairstyle') {
      for (const hs of HAIRSTYLES) if (!hs.free) out.push({ kind: 'hairstyle', id: hs.id, name: hs.name, entry: hs, rarity: hs.price.coins >= 700 ? 'rare' : 'common', styles: hs.styles || [], filter: 'hairstyles' });
    } else if (rule.kind === 'hairColor') {
      for (const hc of HAIR_COLORS) if (!hc.free) out.push({ kind: 'hairColor', id: hc.id, name: `${hc.name} Dye`, entry: hc, rarity: 'common', styles: [], filter: 'dyes' });
    } else if (rule.kind === 'makeup') {
      for (const m of MAKEUP) if (!m.free) out.push({ kind: 'makeup', id: m.id, name: m.name, entry: m, rarity: priceAmount(m.price) >= 220 ? 'rare' : 'common', styles: m.styles || [], filter: m.kind });
    }
  }
  return out;
}

function filtersFor(entries) {
  const seen = new Set(entries.map((e) => e.filter));
  const list = [];
  for (const c of CATEGORIES) if (seen.has(c.id)) list.push({ id: c.id, name: c.name });
  if (seen.has('hairstyles')) list.push({ id: 'hairstyles', name: 'Hairstyles' });
  if (seen.has('dyes')) list.push({ id: 'dyes', name: 'Hair dyes' });
  for (const [k, v] of Object.entries(MAKEUP_KEYS)) if (seen.has(k)) list.push({ id: k, name: v });
  return list;
}

function thumbFor(e, appearance) {
  if (e.kind === 'clothing') return renderItemThumb(e.entry);
  if (e.kind === 'hairstyle') return renderAvatar({ ...appearance, hairStyle: e.id }, {}, { viewBox: HAIR_VIEW, shadow: false, align: 'xMidYMid' });
  if (e.kind === 'hairColor') return `<div class="dye" style="--c:${e.entry.color}">${renderAvatar({ ...appearance, hairColor: e.id }, {}, { viewBox: HAIR_VIEW, shadow: false, align: 'xMidYMid' })}</div>`;
  return renderAvatar({ ...appearance, hairStyle: 'top_bun', [e.entry.kind]: e.id }, {}, { viewBox: e.entry.kind === 'lipstick' ? '82 72 36 30' : e.entry.kind === 'blush' ? FACE_VIEW : '72 42 56 34', shadow: false, align: 'xMidYMid' });
}

// ------------------------------------------------------------------ mall
export const mall = {
  id: 'mall',
  chrome: 'full',
  title: 'Shopping district',
  mount(el, params, ctx) {
    const list = h('div', { class: 'mall-list' });
    for (const shop of SHOPS) {
      const loc = LOCATIONS.find((l) => l.action?.shop === shop.id);
      const art = loc ? `<svg viewBox="-6 -8 ${loc.art.w + 12} ${loc.art.h + 14}" xmlns="http://www.w3.org/2000/svg">${locationSVG({ ...loc, x: 0, y: 0 })}</svg>` : '';
      list.append(h('button', { class: 'mall-card', style: { '--accent': shop.theme.accent }, onClick: () => { ctx.sfx.play('tap'); ctx.go('shop', { shopId: shop.id }); } },
        h('div', { class: 'mall-art', html: art }),
        h('div', { class: 'mall-info' }, h('b', {}, shop.name), h('small', { class: 'mall-type' }, shop.type), h('span', { class: 'muted tiny' }, shop.tagline)),
        h('span', { class: 'mall-go', html: icon('back') }),
      ));
    }
    const homeList = h('div', { class: 'mall-list home-shops' });
    for (const fs of FURNITURE_SHOPS) {
      homeList.append(h('button', { class: 'mall-card', style: { '--accent': fs.theme.accent }, onClick: () => { ctx.sfx.play('tap'); ctx.go('fshop', { shopId: fs.id }); } },
        h('div', { class: 'mall-art furn', style: { background: fs.theme.wall }, html: `<span>${{ cosy_living: '🛋️', glam_interiors: '🪞', luxe_maison: '👑', dream_decor: '🌿' }[fs.id]}</span>` }),
        h('div', { class: 'mall-info' }, h('b', {}, fs.name), h('small', { class: 'mall-type' }, fs.type), h('span', { class: 'muted tiny' }, fs.tagline)),
        h('span', { class: 'mall-go', html: icon('back') }),
      ));
    }
    const homeTitle = h('div', { class: 'screen-header sub' }, h('h2', {}, h('span', { class: 'script' }, 'Furniture'), ' Row'));
    el.append(
      h('div', { class: 'screen-header' }, h('h2', {}, h('span', { class: 'script' }, 'Boutique'), ' Avenue')),
      h('p', { class: 'muted tiny pad' }, 'Seven fashion & beauty shops, plus four furniture stores for your homes.'),
      list, homeTitle, homeList,
    );
    if (params.section === 'home') requestAnimationFrame(() => el.scrollTo({ top: homeTitle.offsetTop - 8 }));
  },
};

// ------------------------------------------------------------------ shop interior
export const shop = {
  id: 'shop',
  chrome: 'full',
  title: 'Shop',
  mount(el, params, ctx) {
    const def = SHOP_BY_ID[params.shopId] || SHOPS[0];
    const entries = entriesFor(def);
    const filters = filtersFor(entries);
    const s0 = ctx.store.get();
    let preview = { appearance: { ...s0.appearance }, equipped: { ...s0.equipped } };
    let filter = 'all';
    let selected = null;
    let hideOwned = false;

    const keeper = def.keeper
      ? h('div', { class: 'keeper' },
        h('div', { class: 'keeper-av', html: renderAvatar(def.keeper.appearance, def.keeper.equipped, { viewBox: '30 0 140 230', shadow: false, label: def.keeper.name }) }),
        h('div', { class: 'bubble' }, h('b', {}, def.keeper.name), h('span', {}, def.greeting)))
      : null;
    const banner = h('div', { class: `shop-banner ${def.theme.dark ? 'dark' : ''}`, style: { '--accent': def.theme.accent, '--sign': def.theme.sign } },
      h('div', { class: 'banner-art', html: shopBannerSVG(def) }),
      h('button', { class: 'back-btn banner-back', onClick: () => ctx.back('mall'), html: `${icon('back')}Leave` }),
      h('div', { class: 'shop-sign' }, h('span', { class: 'shop-name' }, def.name), h('small', {}, def.type)),
      keeper,
    );

    const stage = h('div', { class: 'avatar-stage' });
    addTwinkles(stage, 6);
    const avatarBox = h('div', { class: 'avatar-idle stage-fill' });
    stage.append(avatarBox, h('button', { class: 'reset-btn', onClick: resetPreview, 'aria-label': 'Reset try-on' }, '↺ Reset'));
    const detail = h('div', { class: 'detail-card' });
    const chips = h('div', { class: 'chips' });
    const grid = h('div', { class: 'grid' });
    el.append(banner, h('div', { class: 'stage-wrap' }, stage, h('div', { class: 'side-panel' }, detail)), chips, grid);

    function applyPreview(e) {
      if (e.kind === 'clothing') {
        const it = e.entry;
        const eq = { ...preview.equipped };
        if (it.slot === 'dress') { eq.top = null; eq.bottom = null; }
        if (it.slot === 'top' || it.slot === 'bottom') eq.dress = null;
        eq[it.slot] = it.id;
        preview.equipped = eq;
      } else if (e.kind === 'hairstyle') preview.appearance = { ...preview.appearance, hairStyle: e.id };
      else if (e.kind === 'hairColor') preview.appearance = { ...preview.appearance, hairColor: e.id };
      else preview.appearance = { ...preview.appearance, [e.entry.kind]: e.id };
    }

    function resetPreview() {
      const s = ctx.store.get();
      preview = { appearance: { ...s.appearance }, equipped: { ...s.equipped } };
      selected = null;
      ctx.sfx.play('tap');
      render();
    }

    function select(e) {
      selected = e;
      applyPreview(e);
      ctx.sfx.play('equip');
      render();
    }

    function render() {
      const s = ctx.store.get();
      avatarBox.innerHTML = renderAvatar(preview.appearance, preview.equipped);
      chips.innerHTML = '';
      const chip = (id, label) => h('button', { class: `chip ${filter === id ? 'active' : ''}`, onClick: () => { filter = id; ctx.sfx.play('tap'); render(); } }, label);
      chips.append(chip('all', `All (${entries.length})`));
      if (filters.length > 1) for (const f of filters) chips.append(chip(f.id, f.name));
      chips.append(h('button', { class: `chip ${hideOwned ? 'active' : ''}`, onClick: () => { hideOwned = !hideOwned; render(); } }, hideOwned ? '✓ Hiding owned' : 'Hide owned'));

      grid.innerHTML = '';
      let list = filter === 'all' ? entries : entries.filter((e) => e.filter === filter);
      if (hideOwned) list = list.filter((e) => !owns(s, e.kind, e.id));
      if (!list.length) grid.append(h('div', { class: 'empty' }, 'You own everything here — what a collection! 💖'));
      for (const e of list) {
        const owned = owns(s, e.kind, e.id);
        const price = priceOf(e.kind, e.entry);
        grid.append(itemCard({
          thumbHTML: thumbFor(e, s.appearance), name: e.name, rarity: e.rarity, selected: selected?.id === e.id, owned,
          footer: h('div', { class: 'meta' }, owned ? h('span', { class: 'owned-tag' }, '✓ Owned') : priceTag(price, canAfford(s, price))),
          onClick: () => select(e),
        }));
      }
      renderDetail(s);
    }

    function renderDetail(s) {
      detail.innerHTML = '';
      if (!selected) {
        detail.append(h('h3', {}, 'Try anything on!'), h('p', { class: 'muted tiny' }, 'Tap an item to preview it on yourself. Nothing is charged until you tap Buy.'),
          h('div', { class: 'grow' }), h('div', { class: 'wallet', html: `${icon('coin')}<b>${s.player.coins.toLocaleString('en-GB')}</b>&nbsp;&nbsp;${icon('gem')}<b>${s.player.gems.toLocaleString('en-GB')}</b>` }));
        return;
      }
      const e = selected;
      const owned = owns(s, e.kind, e.id);
      const price = priceOf(e.kind, e.entry);
      const afford = canAfford(s, price);
      const wearing = isWearing(s, e);
      appendTo(detail, 
        h('h3', {}, e.name),
        h('div', { class: 'row-gap' }, rarityPill(e.rarity), owned ? h('span', { class: 'owned-tag' }, '✓ Owned') : priceTag(price, afford)),
        e.styles.length ? h('div', { class: 'tags' }, e.styles.map((t) => h('span', { class: 'tag' }, t))) : null,
        h('div', { class: 'grow' }),
        owned
          ? h('button', { class: `btn btn-small ${wearing ? 'btn-soft' : 'btn-primary'}`, disabled: wearing, onClick: () => wear(e) }, wearing ? 'Wearing ✓' : 'Wear it now')
          : h('button', { class: 'btn btn-gold btn-small buy-btn', onClick: () => buy(e) }, afford ? 'Buy' : 'Not enough ' + priceCurrency(price)),
      );
    }

    function isWearing(s, e) {
      if (e.kind === 'clothing') return Object.values(s.equipped).includes(e.id);
      if (e.kind === 'hairstyle') return s.appearance.hairStyle === e.id;
      if (e.kind === 'hairColor') return s.appearance.hairColor === e.id;
      return s.appearance[e.entry.kind] === e.id;
    }

    function wear(e) {
      const r = ctx.store.transact((d) => {
        if (e.kind === 'clothing') return equip(d, e.id);
        const key = e.kind === 'hairstyle' ? 'hairStyle' : e.kind === 'hairColor' ? 'hairColor' : e.entry.kind;
        return setAppearance(d, { [key]: e.id });
      }, 'wear');
      if (r.ok !== false) {
        ctx.sfx.play('equip');
        const s = ctx.store.get();
        preview = { appearance: { ...s.appearance }, equipped: { ...s.equipped } };
        ctx.toast(`Now wearing ${e.name}!`, { type: 'success' });
        render();
      }
    }

    async function buy(e) {
      const s = ctx.store.get();
      const price = priceOf(e.kind, e.entry);
      if (!canAfford(s, price)) {
        ctx.sfx.play('error');
        ctx.toast(`You need ${priceAmount(price) - s.player[priceCurrency(price)]} more ${priceCurrency(price)}. Earn more with a job, a contest or the Glitter Arcade!`, { type: 'error' });
        return;
      }
      const cur = priceCurrency(price);
      const left = s.player[cur] - priceAmount(price);
      const body = h('div', { class: 'buy-confirm' },
        h('div', { class: 'buy-thumb', html: thumbFor(e, s.appearance) }),
        h('p', {}, 'Buy ', h('b', {}, e.name), ' for ', priceTag(price), '?'),
        h('p', { class: 'muted tiny' }, `You'll have ${left.toLocaleString('en-GB')} ${cur} left.`));
      const ok = await ctx.modal.open({ title: 'Treat yourself?', body, buttons: [{ label: 'Not now', value: false }, { label: 'Buy it!', value: true, cls: 'btn-gold' }] });
      if (!ok) return;
      const r = ctx.store.transact((d) => purchase(d, e.kind, e.id), 'purchase');
      if (r.ok === false) {
        ctx.sfx.play('error');
        ctx.toast(r.reason === 'already-owned' ? 'You already own this!' : 'Purchase failed.', { type: 'error' });
        render();
        return;
      }
      await ctx.saveNow();
      ctx.sfx.play('buy');
      ctx.sparkleBurst(stage, 18);
      ctx.floatText(document.querySelector(cur === 'gems' ? '.pill-gem' : '.pill-coin') || stage, `-${priceAmount(price).toLocaleString('en-GB')}`);
      ctx.toast(`${e.name} is yours! 💖`, { type: 'reward' });
      render();
    }

    render();
  },
};
