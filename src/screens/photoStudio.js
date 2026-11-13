/**
 * PHOTO STUDIO & ALBUM
 *   photo : pick a pose, backdrop (incl. your own decorated rooms), frame and optional
 *           magazine cover, then snap — the shot is saved to the album as a small spec.
 *   album : browse, favourite, delete and export photos as PNG.
 * Advanced poses/backdrops unlock through the Modelling career.
 */
import { h, appendTo, fmt } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { celebrate } from '../components/rewards.js';
import { renderPhoto, photoToPng } from '../components/art/photoArt.js';
import { POSES, BACKDROPS, FRAMES, MASTHEADS, HEADLINES, POSE_BY_ID, BACKDROP_BY_ID } from '../data/photo.js';
import { BALANCE } from '../data/gameBalance.js';
import { PROPERTY_BY_ID } from '../data/properties.js';
import { isUnlocked, unlockText, takePhoto, deletePhoto, togglePhotoFav } from '../systems/photoSystem.js';
import { roomsOf } from '../systems/decoratingSystem.js';

const TABS = [['pose', 'Pose'], ['backdrop', 'Backdrop'], ['frame', 'Frame'], ['cover', 'Cover']];

export async function downloadPhoto(ctx, photo) {
  try {
    const blob = await photoToPng(renderPhoto(ctx.store.get(), photo, { className: '' }));
    const a = h('a', { href: URL.createObjectURL(blob), download: `glamour-city-${photo.cover ? 'cover' : 'photo'}-${new Date(photo.at).toISOString().slice(0, 10)}.png` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    ctx.toast('Saved as PNG 📥', { type: 'success' });
  } catch {
    ctx.toast('Could not export this photo on this device.', { type: 'error' });
  }
}

// ================================================================== studio
export const photo = {
  id: 'photo',
  chrome: 'hud',
  title: 'Photo Studio',
  mount(el, params, ctx) {
    const s0 = ctx.store.get();
    const homeRooms = s0.properties.owned.flatMap((pid) => roomsOf(s0, pid).map((r) => ({ property: pid, room: r.id, name: `${r.name} · ${PROPERTY_BY_ID[pid]?.name || pid}` })));
    const draft = {
      pose: 'classic', backdrop: params.home ? 'home' : 'studio_pink', frame: 'none',
      home: params.home || homeRooms.find((r) => r.property === s0.properties.current) || homeRooms[0], cover: null,
    };
    let tab = params.cover ? 'cover' : 'pose';
    if (params.cover) draft.cover = { masthead: 'etoile', headline: HEADLINES[0] };
    const preview = h('div', { class: 'pst-preview' });
    const tabs = h('div', { class: 'chips pst-tabs' });
    const opts = h('div', { class: 'pst-opts' });
    const snap = h('button', { class: 'btn btn-primary pst-snap', onClick: shoot, html: '📸 Snap!' });
    el.append(
      h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('home'), html: `${icon('back')}Back` }), h('h2', {}, '📸 Photo Studio')),
      preview,
      h('div', { class: 'pst-actions' }, snap, h('button', { class: 'btn btn-soft btn-small pst-album', onClick: () => ctx.go('album') }, `Album (${(s0.photos || []).length})`), h('button', { class: 'btn btn-soft btn-small', onClick: () => ctx.go('wardrobe') }, 'Change outfit')),
      tabs, opts,
    );

    function paintPreview() { preview.innerHTML = renderPhoto(ctx.store.get(), draft); }

    function option(entry, selected, onPick, thumb) {
      const s = ctx.store.get();
      const ok = isUnlocked(s, entry);
      return h('button', {
        class: `pst-opt ${selected ? 'selected' : ''} ${ok ? '' : 'locked'}`,
        dataset: { id: entry.id },
        onClick: () => { if (!ok) { ctx.sfx.play('error'); ctx.toast(`${entry.name} unlocks at ${unlockText(entry)} 🔒`, { type: 'info' }); return; } ctx.sfx.play('tap'); onPick(); render(); },
      }, thumb || h('span', { class: 'pst-ico' }, entry.icon || '✦'), h('span', { class: 'pst-name' }, entry.name), ok ? null : h('small', { html: `${icon('lock')}${unlockText(entry)}` }));
    }

    function render() {
      paintPreview();
      tabs.innerHTML = '';
      tabs.append(...TABS.map(([id, label]) => h('button', { class: `chip ${tab === id ? 'active' : ''}`, onClick: () => { tab = id; render(); } }, label)));
      opts.innerHTML = '';
      if (tab === 'pose') opts.append(h('div', { class: 'pst-grid' }, POSES.map((p) => option(p, draft.pose === p.id, () => { draft.pose = p.id; }))));
      if (tab === 'backdrop') {
        const sw = (b) => h('span', { class: `pst-sw sw-${b.id}`, style: b.colors ? { background: `linear-gradient(135deg, ${b.colors[0]}, ${b.colors[1]})` } : {} });
        opts.append(h('div', { class: 'pst-grid' }, BACKDROPS.map((b) => option(b, draft.backdrop === b.id, () => { draft.backdrop = b.id; }, sw(b)))));
        if (draft.backdrop === 'home') {
          opts.append(h('div', { class: 'opt-group-title' }, 'Which room?'), h('div', { class: 'chips wrap' }, homeRooms.map((r) => h('button', {
            class: `chip ${draft.home?.property === r.property && draft.home?.room === r.room ? 'active' : ''}`,
            onClick: () => { draft.home = { property: r.property, room: r.room }; render(); },
          }, r.name))), h('p', { class: 'muted tiny pad-x' }, 'Decorate a room first and it becomes your photo set!'));
        }
      }
      if (tab === 'frame') opts.append(h('div', { class: 'pst-grid' }, FRAMES.map((f) => option(f, draft.frame === f.id, () => { draft.frame = f.id; }, h('span', { class: `pst-fr fr-${f.id}` })))));
      if (tab === 'cover') {
        opts.append(h('label', { class: 'pst-toggle' }, h('input', { type: 'checkbox', checked: draft.cover ? true : null, onChange: (e) => { draft.cover = e.target.checked ? { masthead: 'etoile', headline: HEADLINES[0] } : null; render(); } }), ' Make it a magazine cover'));
        if (draft.cover) {
          opts.append(h('div', { class: 'opt-group-title' }, 'Magazine'),
            h('div', { class: 'pst-grid' }, MASTHEADS.map((m) => option(m, draft.cover.masthead === m.id, () => { draft.cover.masthead = m.id; }, h('span', { class: `pst-mast ${m.font}`, style: { color: m.color } }, m.name.split(' ')[0])))),
            h('div', { class: 'opt-group-title' }, 'Headline'),
            h('div', { class: 'pst-heads' }, HEADLINES.map((t) => h('button', {
              class: `pst-head ${draft.cover.headline === t ? 'selected' : ''}`, onClick: () => { draft.cover.headline = t; render(); },
            }, t.replace('{name}', ctx.store.get().player.name))),
            h('button', { class: 'pst-head custom', onClick: async () => { const v = await ctx.modal.prompt('Your headline', { placeholder: 'e.g. Style Queen of the Year', maxLength: 40 }); if (v) { draft.cover.headline = v; render(); } } }, '✏️ Write my own…')));
        }
      }
    }

    async function shoot() {
      if (draft.backdrop === 'home' && !draft.home) { ctx.toast('You need a room to shoot in!', { type: 'info' }); return; }
      const r = ctx.store.transact((d) => takePhoto(d, { ...draft, cover: draft.cover ? { ...draft.cover } : null }), 'photo');
      if (r.ok === false) {
        ctx.sfx.play('error');
        ctx.toast(r.reason === 'album-full' ? `Your album is full (${BALANCE.photos.albumMax}) — delete a few photos first.` : r.message || 'Could not take that photo.', { type: 'error' });
        return;
      }
      await ctx.saveNow();
      preview.classList.remove('flash'); void preview.offsetWidth; preview.classList.add('flash');
      ctx.sfx.play('reward');
      el.querySelector('.pst-album').textContent = `Album (${ctx.store.get().photos.length})`;
      if (r.reward) await celebrate(ctx, r, { title: r.photo.cover ? 'Cover star! ✨' : 'Photo of the day saved ✨', from: snap });
      else ctx.toast(r.photo.cover ? 'Cover saved to your album 📰' : 'Saved to your album 📷', { type: 'success' });
    }

    render();
  },
};

// ================================================================== album
export const album = {
  id: 'album',
  chrome: 'hud',
  title: 'Photo Album',
  mount(el, params, ctx) {
    let filter = 'all';
    const chips = h('div', { class: 'chips' });
    const grid = h('div', { class: 'album-grid' });
    const count = h('span', { class: 'muted tiny' });
    el.append(
      h('div', { class: 'screen-header' }, h('button', { class: 'back-btn', onClick: () => ctx.back('photo'), html: `${icon('back')}Back` }), h('h2', {}, '📔 My Album')),
      h('div', { class: 'album-top pad-x' }, count, h('button', { class: 'btn btn-primary btn-small', onClick: () => ctx.go('photo') }, '📸 New photo')),
      chips, grid,
    );

    function render() {
      const s = ctx.store.get();
      const all = [...(s.photos || [])].reverse();
      const list = filter === 'covers' ? all.filter((p) => p.cover) : filter === 'favs' ? all.filter((p) => p.fav) : all;
      count.textContent = `${all.length} / ${BALANCE.photos.albumMax} photos`;
      chips.innerHTML = '';
      chips.append(...[['all', 'All'], ['covers', '📰 Covers'], ['favs', '♥ Favourites']].map(([id, l]) => h('button', { class: `chip ${filter === id ? 'active' : ''}`, onClick: () => { filter = id; render(); } }, l)));
      grid.innerHTML = '';
      if (!list.length) grid.append(h('div', { class: 'empty' }, all.length ? 'Nothing here yet.' : 'No photos yet — strike a pose in the studio!'));
      for (const p of list) {
        grid.append(h('button', { class: `album-pic ${p.fav ? 'fav' : ''}`, dataset: { id: p.id }, onClick: () => open(p.id), html: renderPhoto(s, p) }));
      }
    }

    async function open(id) {
      const s = ctx.store.get();
      const p = s.photos.find((x) => x.id === id);
      if (!p) return;
      const when = new Date(p.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const choice = await ctx.modal.open({
        title: p.cover ? 'Magazine cover' : 'Photo',
        className: 'photo-view',
        body: h('div', { class: 'pv' }, h('div', { class: 'pv-img', html: renderPhoto(s, p) }),
          h('p', { class: 'muted tiny center' }, `${POSE_BY_ID[p.pose]?.name} · ${BACKDROP_BY_ID[p.backdrop]?.name} · ${when}`)),
        buttons: [
          { label: '🗑', value: 'delete', cls: 'btn-soft' },
          { label: p.fav ? '♥ Unfavourite' : '♡ Favourite', value: 'fav', cls: 'btn-soft' },
          { label: '📥 Save PNG', value: 'png', cls: 'btn-primary' },
        ],
      });
      if (choice === 'png') downloadPhoto(ctx, p);
      if (choice === 'fav') { ctx.store.transact((d) => togglePhotoFav(d, id), 'photo-fav'); render(); }
      if (choice === 'delete' && await ctx.modal.confirm('Delete photo?', 'This photo will be removed from your album for good.', 'Delete')) {
        ctx.store.transact((d) => deletePhoto(d, id), 'photo-delete');
        ctx.toast('Photo deleted', { type: 'info' });
        render();
      }
    }
    render();
  },
};
