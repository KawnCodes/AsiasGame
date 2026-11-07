/**
 * CHARACTER CREATOR — used for new games (mode 'new') and later restyling (mode 'edit',
 * opened from the home mirror/vanity or the wardrobe).
 * Body & face features are always free. Hairstyles, dyes and makeup must be owned
 * (free starter options are owned by everyone; more are sold at the Salon & Makeup Studio).
 */
import { h } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { renderAvatar } from '../components/avatarRenderer.js';
import { addTwinkles } from '../components/sparkles.js';
import {
  SKIN_TONES, FACE_SHAPES, EYE_SHAPES, EYE_COLORS, BROWS, NOSES, LIPS, HAIRSTYLES, HAIR_COLORS, MAKEUP, DEFAULT_APPEARANCE,
} from '../data/appearance.js';
import { STARTER_OUTFITS, createNewGameState } from '../systems/gameState.js';
import { owns, setAppearance } from '../systems/inventory.js';
import { ensureQuests, recordEvent } from '../systems/questSystem.js';

const FACE_VIEW = '64 40 72 64';
const EYE_VIEW = '74 44 52 30';
const LIP_VIEW = '86 78 28 22';
const HAIR_VIEW = '36 0 128 150';

const TABS = [
  { id: 'skin', label: 'Skin', key: 'skin', type: 'swatch', options: SKIN_TONES.map((s) => ({ ...s, color: s.base })) },
  { id: 'face', label: 'Face', key: 'face', type: 'render', view: FACE_VIEW, options: FACE_SHAPES },
  { id: 'eyes', label: 'Eyes', key: 'eyes', type: 'render', view: EYE_VIEW, options: EYE_SHAPES },
  { id: 'eyeColor', label: 'Eye Colour', key: 'eyeColor', type: 'swatch', options: EYE_COLORS },
  { id: 'brows', label: 'Brows', key: 'brows', type: 'render', view: EYE_VIEW, options: BROWS },
  { id: 'nose', label: 'Nose', key: 'nose', type: 'render', view: '84 62 32 32', options: NOSES },
  { id: 'lips', label: 'Lips', key: 'lips', type: 'render', view: LIP_VIEW, options: LIPS },
  { id: 'hair', label: 'Hairstyle', key: 'hairStyle', type: 'render', view: HAIR_VIEW, kind: 'hairstyle', options: HAIRSTYLES },
  { id: 'hairColor', label: 'Hair Colour', key: 'hairColor', type: 'swatch', kind: 'hairColor', options: HAIR_COLORS },
  { id: 'makeup', label: 'Makeup', type: 'makeup' },
  { id: 'outfit', label: 'Outfit', type: 'outfit', newOnly: true },
];

const MAKEUP_GROUPS = [
  { key: 'eyeshadow', label: 'Eyeshadow', view: EYE_VIEW },
  { key: 'eyeliner', label: 'Eyeliner', view: EYE_VIEW },
  { key: 'lipstick', label: 'Lipstick', view: LIP_VIEW },
  { key: 'blush', label: 'Blush', view: FACE_VIEW },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  id: 'creator',
  chrome: 'none',
  title: 'Character creator',
  mount(el, params, ctx) {
    const isNew = params.mode !== 'edit';
    const state = ctx.store.get();
    let draft = isNew ? { ...DEFAULT_APPEARANCE, skin: pick(SKIN_TONES).id } : { ...state.appearance };
    let name = isNew ? '' : state.player.name;
    let outfitId = 'sunny';
    let tab = params.tab || 'skin';
    const equipped = () => (isNew ? STARTER_OUTFITS.find((o) => o.id === outfitId).equipped : state.equipped);

    const isOwned = (kind, entry) => (isNew ? !!entry.free : owns(state, kind, entry.id));

    // ---------- layout ----------
    const stage = h('div', { class: 'creator-stage avatar-stage' });
    addTwinkles(stage, 8);
    const avatarBox = h('div', { class: 'creator-avatar avatar-idle' });
    stage.append(avatarBox);
    const tabsEl = h('div', { class: 'chips creator-tabs', role: 'tablist' });
    const optionsEl = h('div', { class: 'creator-options' });

    const header = h('div', { class: 'creator-header' },
      isNew ? h('div', { class: 'creator-title' }, h('span', { class: 'script' }, 'Create'), ' your star')
        : h('button', { class: 'back-btn', onClick: () => ctx.back('home'), html: `${icon('back')}Back` }),
      !isNew ? h('div', { class: 'creator-title small' }, 'Mirror, mirror') : null,
      h('button', { class: 'btn btn-lilac btn-small', 'aria-label': 'Randomise', onClick: randomise, html: `${icon('dice')}Surprise me` }),
    );

    const nameInput = h('input', { class: 'text-input', placeholder: 'Your star name', maxlength: 18, value: name, 'aria-label': 'Name', onInput: (e) => { name = e.target.value; } });
    const footer = isNew
      ? h('div', { class: 'creator-footer' }, nameInput, h('button', { class: 'btn btn-primary', onClick: finishNew }, 'Start my story ✦'))
      : h('div', { class: 'creator-footer' },
        h('button', { class: 'btn btn-soft', onClick: () => ctx.back('home') }, 'Cancel'),
        h('button', { class: 'btn btn-primary', onClick: saveEdit }, 'Save my look'));

    el.append(h('div', { class: 'creator' }, header, stage, tabsEl, optionsEl, footer));

    const ZOOM_TABS = ['face', 'eyes', 'eyeColor', 'brows', 'nose', 'lips', 'makeup'];
    function renderAvatarNow() {
      const zoom = ZOOM_TABS.includes(tab);
      stage.classList.toggle('zoomed', zoom);
      avatarBox.innerHTML = renderAvatar(draft, equipped(), zoom ? { viewBox: '40 6 120 140', shadow: false, align: 'xMidYMid' } : {});
    }

    function renderTabs() {
      tabsEl.innerHTML = '';
      for (const t of TABS) {
        if (t.newOnly && !isNew) continue;
        tabsEl.append(h('button', {
          class: `chip ${tab === t.id ? 'active' : ''}`, role: 'tab', 'aria-selected': tab === t.id,
          onClick: () => { tab = t.id; ctx.sfx.play('tap'); renderTabs(); renderOptions(); renderAvatarNow(); },
        }, t.label));
      }
    }

    function optionButton({ key, entry, kind, type, view, label }) {
      const selected = draft[key] === entry.id;
      const ownedOk = !kind || isOwned(kind, entry);
      let visual;
      if (type === 'swatch') {
        visual = h('span', { class: 'swatch', style: { background: entry.color || 'repeating-linear-gradient(45deg,#fff 0 4px,#f3dbe8 4px 8px)' } });
      } else {
        const preview = { ...draft, [key]: entry.id };
        visual = h('span', { class: 'opt-render', html: renderAvatar(preview, {}, { viewBox: view, shadow: false, align: 'xMidYMid' }) });
      }
      return h('button', {
        class: `opt ${selected ? 'selected' : ''} ${ownedOk ? '' : 'locked'}`,
        'aria-pressed': selected,
        'aria-label': entry.name,
        onClick: () => {
          if (!ownedOk) {
            ctx.sfx.play('error');
            const where = kind === 'makeup' ? 'Blush Studio' : 'Silk & Curl Salon';
            ctx.toast(isNew ? `Unlock "${entry.name}" later at ${where}!` : `Buy "${entry.name}" at ${where} in the city.`, { iconName: 'lock' });
            return;
          }
          draft = { ...draft, [key]: entry.id };
          ctx.sfx.play('equip');
          renderAvatarNow();
          renderOptions();
        },
      }, visual, h('span', { class: 'opt-label' }, label || entry.name), ownedOk ? null : h('span', { class: 'opt-lock', html: icon('lock') }));
    }

    function renderOptions() {
      optionsEl.innerHTML = '';
      const t = TABS.find((x) => x.id === tab);
      if (t.type === 'makeup') {
        for (const g of MAKEUP_GROUPS) {
          const list = MAKEUP.filter((m) => m.kind === g.key);
          optionsEl.append(h('div', { class: 'opt-group-title' }, g.label));
          const row = h('div', { class: 'opt-grid' });
          for (const m of list) {
            const type = g.key === 'eyeliner' ? 'render' : 'swatch';
            row.append(optionButton({ key: g.key, entry: m, kind: 'makeup', type, view: g.view }));
          }
          optionsEl.append(row);
        }
        return;
      }
      if (t.type === 'outfit') {
        const row = h('div', { class: 'opt-grid outfit-grid' });
        for (const o of STARTER_OUTFITS) {
          row.append(h('button', {
            class: `opt opt-outfit ${outfitId === o.id ? 'selected' : ''}`,
            onClick: () => { outfitId = o.id; ctx.sfx.play('equip'); renderAvatarNow(); renderOptions(); },
          }, h('span', { class: 'opt-render tall', html: renderAvatar(draft, o.equipped, { viewBox: '20 100 160 340', shadow: false, align: 'xMidYMid' }) }), h('span', { class: 'opt-label' }, o.name)));
        }
        optionsEl.append(h('p', { class: 'muted tiny center' }, 'All three starter outfits are yours — pick one to wear first.'), row);
        return;
      }
      const row = h('div', { class: `opt-grid ${t.type === 'swatch' ? 'swatches' : ''}` });
      for (const entry of t.options) row.append(optionButton({ key: t.key, entry, kind: t.kind, type: t.type, view: t.view }));
      optionsEl.append(row);
    }

    function randomise() {
      const ownedOf = (kind, list) => list.filter((e) => isOwned(kind, e));
      draft = {
        skin: pick(SKIN_TONES).id,
        face: pick(FACE_SHAPES).id,
        eyes: pick(EYE_SHAPES).id,
        eyeColor: pick(EYE_COLORS).id,
        brows: pick(BROWS).id,
        nose: pick(NOSES).id,
        lips: pick(LIPS).id,
        hairStyle: pick(ownedOf('hairstyle', HAIRSTYLES)).id,
        hairColor: pick(ownedOf('hairColor', HAIR_COLORS)).id,
      };
      for (const g of MAKEUP_GROUPS) draft[g.key] = pick(ownedOf('makeup', MAKEUP.filter((m) => m.kind === g.key))).id;
      ctx.sfx.play('reward');
      ctx.sparkleBurst(stage, 10);
      renderAvatarNow();
      renderOptions();
    }

    async function finishNew() {
      const clean = name.trim();
      if (!clean) {
        ctx.sfx.play('error');
        ctx.toast('Every star needs a name! ✨', { type: 'error' });
        nameInput.focus();
        return;
      }
      const s = createNewGameState({ name: clean, appearance: draft, outfitId });
      ensureQuests(s);
      ctx.store.replace(s);
      await ctx.saveNow();
      ctx.sfx.play('reward');
      ctx.go('home', { firstTime: true });
    }

    async function saveEdit() {
      const LOOK_KEYS = ['hairStyle', 'hairColor', 'eyeshadow', 'eyeliner', 'lipstick', 'blush'];
      const restyled = LOOK_KEYS.some((k) => draft[k] !== state.appearance[k]);
      const r = ctx.store.transact((d) => {
        const res = setAppearance(d, draft);
        if (res.ok && restyled) recordEvent(d, 'restyle');
        return res;
      }, 'appearance');
      if (r.ok === false) { ctx.toast('Some choices are not owned yet.', { type: 'error' }); return; }
      await ctx.saveNow();
      ctx.sfx.play('reward');
      ctx.toast('Looking gorgeous! Look saved.', { type: 'success' });
      ctx.back('home');
    }

    renderTabs();
    renderOptions();
    renderAvatarNow();
  },
};
