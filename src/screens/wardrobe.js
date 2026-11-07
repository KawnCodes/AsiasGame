/** WARDROBE — view owned clothes, filter, try on / equip, favourites and saved looks. */
import { h } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar, renderItemThumb } from '../components/avatarRenderer.js';
import { itemCard, rarityPill } from '../components/itemCard.js';
import { addTwinkles } from '../components/sparkles.js';
import { CLOTHING_BY_ID, CATEGORIES } from '../data/clothing.js';
import { toggleEquip, toggleFavourite, saveOutfit, applyOutfit, deleteOutfit, toggleOutfitFavourite, isEquipped, maxOutfits } from '../systems/inventory.js';
import { emptyEquipped } from '../systems/gameState.js';

let lastFilter = 'all';

export default {
  id: 'wardrobe',
  chrome: 'full',
  title: 'Wardrobe',
  mount(el, params, ctx) {
    let filter = lastFilter;
    let selectedId = null;

    const stage = h('div', { class: 'avatar-stage' });
    addTwinkles(stage, 6);
    const avatarBox = h('div', { class: 'avatar-idle stage-fill' });
    stage.append(avatarBox);
    const detail = h('div', { class: 'detail-card' });
    const looksBtn = h('button', { class: 'btn btn-soft btn-small', onClick: openLooks });
    const side = h('div', { class: 'side-panel' }, detail,
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn btn-primary btn-small', onClick: saveLook }, 'Save look'),
        looksBtn),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn btn-soft btn-small', onClick: undress }, 'Undress'),
        h('button', { class: 'btn btn-lilac btn-small', onClick: () => ctx.go('creator', { mode: 'edit', tab: 'hair' }) }, 'Hair & face')),
    );
    const chips = h('div', { class: 'chips' });
    const grid = h('div', { class: 'grid' });
    el.append(
      h('div', { class: 'screen-header' }, h('h2', {}, h('span', { class: 'script' }, 'My'), ' Closet'), h('button', { class: 'btn btn-gold btn-small', onClick: () => ctx.go('mall'), html: `${icon('bag')}Shop` })),
      h('div', { class: 'stage-wrap' }, stage, side), chips, grid,
    );

    function ownedItems(s) {
      return Object.keys(s.inventory.clothing).map((id) => CLOTHING_BY_ID[id]).filter(Boolean);
    }

    function render() {
      const s = ctx.store.get();
      avatarBox.innerHTML = renderAvatar(s.appearance, s.equipped);
      looksBtn.textContent = `Looks (${s.outfits.length})`;
      const items = ownedItems(s);

      // chips
      chips.innerHTML = '';
      const counts = {};
      for (const it of items) counts[it.category] = (counts[it.category] || 0) + 1;
      const favCount = items.filter((it) => s.inventory.clothing[it.id].favourite).length;
      const chip = (id, label) => h('button', { class: `chip ${filter === id ? 'active' : ''}`, onClick: () => { filter = lastFilter = id; ctx.sfx.play('tap'); render(); } }, label);
      chips.append(chip('all', `All (${items.length})`), chip('wearing', 'Wearing'), chip('fav', `♥ Favourites (${favCount})`));
      for (const c of CATEGORIES) if (counts[c.id]) chips.append(chip(c.id, `${c.name} (${counts[c.id]})`));

      // grid
      let list = items;
      if (filter === 'fav') list = items.filter((it) => s.inventory.clothing[it.id].favourite);
      else if (filter === 'wearing') list = items.filter((it) => isEquipped(s, it.id));
      else if (filter !== 'all') list = items.filter((it) => it.category === filter);
      list.sort((a, b) => (s.inventory.clothing[b.id].acquiredAt - s.inventory.clothing[a.id].acquiredAt) || a.name.localeCompare(b.name));
      grid.innerHTML = '';
      if (!list.length) grid.append(h('div', { class: 'empty' }, filter === 'fav' ? 'Tap the heart on an item to add it to your favourites.' : 'Nothing here yet — time to go shopping!'));
      for (const it of list) {
        grid.append(itemCard({
          thumbHTML: renderItemThumb(it), name: it.name, rarity: it.rarity,
          selected: it.id === selectedId, equipped: isEquipped(s, it.id), favourite: s.inventory.clothing[it.id].favourite,
          onClick: () => toggle(it.id),
        }));
      }
      renderDetail(s);
    }

    function renderDetail(s) {
      detail.innerHTML = '';
      const it = selectedId && CLOTHING_BY_ID[selectedId];
      if (!it) {
        detail.append(h('h3', {}, 'Style me!'), h('p', { class: 'muted tiny' }, 'Tap any piece to put it on or take it off. Dresses replace tops & bottoms automatically.'));
        return;
      }
      const wearing = isEquipped(s, it.id);
      const fav = s.inventory.clothing[it.id]?.favourite;
      detail.append(
        h('h3', {}, it.name),
        h('div', { class: 'row-gap' }, rarityPill(it.rarity), h('span', { class: 'tag' }, CATEGORIES.find((c) => c.id === it.category)?.name)),
        h('div', { class: 'tags' }, it.styles.map((t) => h('span', { class: 'tag' }, t))),
        h('div', { class: 'grow' }),
        h('div', { class: 'btn-row' },
          h('button', { class: `btn btn-small ${wearing ? 'btn-soft' : 'btn-primary'}`, onClick: () => toggle(it.id) }, wearing ? 'Take off' : 'Wear'),
          h('button', { class: 'btn btn-soft btn-small fav-btn', 'aria-pressed': !!fav, 'aria-label': 'Favourite', onClick: () => { ctx.store.transact((d) => toggleFavourite(d, it.id), 'fav'); ctx.sfx.play('tap'); render(); }, html: `${icon('heart')}${fav ? 'Loved' : 'Love'}` })),
      );
    }

    function toggle(id) {
      selectedId = id;
      const r = ctx.store.transact((d) => toggleEquip(d, id), 'equip');
      if (r.ok === false) { ctx.sfx.play('error'); return; }
      ctx.sfx.play('equip');
      render();
    }

    function undress() {
      ctx.store.transact((d) => { const keep = d.equipped; d.equipped = { ...emptyEquipped(), earrings: keep.earrings }; }, 'undress');
      ctx.sfx.play('tap');
      render();
    }

    async function saveLook() {
      const s = ctx.store.get();
      if (s.outfits.length >= maxOutfits(s)) { ctx.toast(`You can keep up to ${maxOutfits(s)} looks — delete one first.`, { type: 'error' }); return; }
      const name = await ctx.modal.prompt('Name this look', { placeholder: `Look ${s.outfits.length + 1}` });
      if (name === null) return;
      const r = ctx.store.transact((d) => { const res = saveOutfit(d, name); if (res.ok) d.stats.outfitsSaved += 1; return res; }, 'outfit');
      if (r.ok) { ctx.sfx.play('reward'); ctx.sparkleBurst(stage); ctx.toast(`"${r.outfit.name}" saved to My looks!`, { type: 'success' }); render(); }
    }

    function openLooks() {
      const s = ctx.store.get();
      const body = h('div', { class: 'looks-list' });
      const fill = () => {
        const st = ctx.store.get();
        body.innerHTML = '';
        if (!st.outfits.length) { body.append(h('p', { class: 'muted' }, 'No saved looks yet. Dress up and tap "Save look"!')); return; }
        const sorted = [...st.outfits].sort((a, b) => (b.favourite - a.favourite) || (b.createdAt - a.createdAt));
        for (const o of sorted) {
          const ap = { ...st.appearance, ...o.hair, ...o.makeup };
          body.append(h('div', { class: 'look' },
            h('div', { class: 'look-av', html: renderAvatar(ap, o.equipped, { viewBox: '10 0 180 440', shadow: false }) }),
            h('div', { class: 'look-info' },
              h('b', {}, o.name),
              h('div', { class: 'btn-col' },
                h('button', { class: 'btn btn-primary btn-small', onClick: () => { ctx.store.transact((d) => applyOutfit(d, o.id), 'apply'); ctx.sfx.play('equip'); body.closest('.modal-card').closeModal(true); } }, 'Wear'),
                h('div', { class: 'btn-row' },
                  h('button', { class: `btn btn-soft btn-small ${o.favourite ? 'loved' : ''}`, 'aria-label': 'Favourite look', html: icon('heart'), onClick: () => { ctx.store.transact((d) => toggleOutfitFavourite(d, o.id)); fill(); } }),
                  h('button', { class: 'btn btn-soft btn-small', 'aria-label': 'Delete look', html: icon('close'), onClick: async () => { ctx.store.transact((d) => deleteOutfit(d, o.id)); fill(); } }),
                ),
              ),
            ),
          ));
        }
      };
      fill();
      ctx.modal.open({ title: `My looks (${s.outfits.length})`, body, buttons: [], className: 'wide' }).then(render);
    }

    render();
  },
};
