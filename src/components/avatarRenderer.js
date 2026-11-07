/**
 * LAYERED AVATAR RENDERER
 *
 * Composes the character as a single inline SVG from data:
 *   appearance (skin, face, eyes, hair, makeup)  +  equipped clothing items.
 *
 * Render order (back → front) — keep in sync with docs/ASSETS.md:
 *   1 hair-back · 2 body (legs, feet, torso, neck) · 3 base layer · 4 shoes · 5 bottom
 *   6 top · 7 dress · 8 outerwear · 9 necklace · 10 arms · 11 sleeves (top→dress→outer)
 *   12 bracelet · 13 bag · 14 head & face & makeup · 15 earrings · 16 hair-front
 *   17 hair accessory
 *
 * `renderAvatar` returns an SVG string; `renderItemThumb` renders one garment on a
 * faint mannequin cropped to its slot so shop/wardrobe icons match the avatar exactly.
 */
import { bodyDefs, bodyBack, baseLayer, arms, head } from './art/bodyArt.js';
import { hairDefs, hairBack, hairFront } from './art/hairArt.js';
import { SHAPES, patternDef } from './art/clothingArt.js';
import { SKIN, EYE_COLOR, HAIR_COLOR, MAKEUP_BY_ID, DEFAULT_APPEARANCE } from '../data/appearance.js';
import { CLOTHING_BY_ID } from '../data/clothing.js';
import { MENSWEAR_BY_ID } from '../data/menswear.js';
import { darken, lighten } from '../utils/color.js';

let counter = 0;
const nextId = () => `av${(++counter).toString(36)}`;

export const SLOT_ORDER = ['shoes', 'bottom', 'top', 'dress', 'outerwear'];
const SLEEVE_ORDER = ['top', 'dress', 'outerwear'];

function itemColors(item) {
  const base = item.color;
  return {
    base,
    alt: item.color2 || lighten(base, 0.6),
    accent: item.accent || item.color2 || lighten(base, 0.45),
    line: darken(base, 0.42),
  };
}

function garmentLayer(id, item, part) {
  const shape = SHAPES[item.shape];
  if (!shape) return '';
  const c = itemColors(item);
  const paths = shape[part] || [];
  if (part === 'details') return shape.details ? `<g class="det">${shape.details(c)}</g>` : '';
  if (!paths.length) return '';
  const pid = `${id}-p-${item.id}`;
  const fill = item.pattern && item.pattern !== 'solid' ? `url(#${pid})` : c.base;
  const d = paths.join(' ');
  const sheen = item.finish === 'satin' || item.finish === 'glitter'
    ? `<path d="${d}" fill="url(#${id}-sheen)" stroke="none"/>` : '';
  const glitter = item.finish === 'glitter' ? `<path d="${d}" fill="url(#${id}-glit)" stroke="none" opacity=".8"/>` : '';
  const opacity = item.finish === 'sheer' ? ' opacity=".82"' : '';
  return `<g class="g-${item.slot}"${opacity}><path d="${d}" fill="${fill}" stroke="${c.line}" stroke-width=".8" stroke-linejoin="round"/>
    <path d="${d}" fill="url(#${id}-fold)" stroke="none"/>${sheen}${glitter}</g>`;
}

function defs(id, items, skin, hairHex) {
  const pats = items.map((it) => patternDef(`${id}-p-${it.id}`, it.pattern, itemColors(it))).join('');
  return `<defs>
    ${bodyDefs(id, skin)}
    ${hairDefs(id, hairHex)}
    <linearGradient id="${id}-fold" x1="0" x2="1">
      <stop offset="0" stop-color="#3a0f2c" stop-opacity=".28"/>
      <stop offset=".22" stop-color="#3a0f2c" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".1"/>
      <stop offset=".78" stop-color="#3a0f2c" stop-opacity="0"/>
      <stop offset="1" stop-color="#3a0f2c" stop-opacity=".28"/>
    </linearGradient>
    <linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".0"/>
      <stop offset=".42" stop-color="#fff" stop-opacity=".38"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".0"/>
      <stop offset=".62" stop-color="#fff" stop-opacity=".22"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <pattern id="${id}-glit" patternUnits="userSpaceOnUse" width="9" height="9">
      <circle cx="2" cy="2" r=".7" fill="#fff"/><circle cx="6.5" cy="5" r=".5" fill="#fff8d0"/><circle cx="3.5" cy="7.5" r=".4" fill="#fff"/>
    </pattern>
    ${pats}
  </defs>`;
}

/** Resolve equipped ids → items, ignoring unknown ids defensively. */
export function resolveEquipped(equipped = {}) {
  const out = {};
  for (const [slot, itemId] of Object.entries(equipped)) {
    const it = itemId && (CLOTHING_BY_ID[itemId] || MENSWEAR_BY_ID[itemId]);
    if (it) out[slot] = it;
  }
  return out;
}

export function renderAvatar(appearance = DEFAULT_APPEARANCE, equipped = {}, opts = {}) {
  const id = nextId();
  const ap = { ...DEFAULT_APPEARANCE, ...appearance };
  const ghost = !!opts.ghost;
  const skin = ghost ? GHOST_SKIN : SKIN[ap.skin] || SKIN.peach;
  const hairHex = (HAIR_COLOR[ap.hairColor] || HAIR_COLOR.chestnut).color;
  const mk = {
    eyeshadow: MAKEUP_BY_ID[ap.eyeshadow],
    eyeliner: MAKEUP_BY_ID[ap.eyeliner],
    lipstick: MAKEUP_BY_ID[ap.lipstick],
    blush: MAKEUP_BY_ID[ap.blush],
    eyeColorHex: (EYE_COLOR[ap.eyeColor] || EYE_COLOR.hazel).color,
    hairHex,
    ghost,
    masc: ap.body === 'masc',
  };
  const eq = resolveEquipped(equipped);
  if (eq.dress) { delete eq.top; delete eq.bottom; }
  const items = Object.values(eq);
  const handLayer = [];
  const garments = [];
  for (const slot of SLOT_ORDER) {
    const it = eq[slot];
    if (!it) continue;
    garments.push(garmentLayer(id, it, 'body'), garmentLayer(id, it, 'details'));
  }
  const sleeves = SLEEVE_ORDER.filter((s) => eq[s]).map((s) => garmentLayer(id, eq[s], 'sleeves')).join('');
  const neck = eq.necklace ? garmentLayer(id, eq.necklace, 'details') : '';
  for (const s of ['bracelet', 'bag']) if (eq[s]) handLayer.push(garmentLayer(id, eq[s], 'body'), garmentLayer(id, eq[s], 'details'));
  const ears = eq.earrings ? garmentLayer(id, eq.earrings, 'details') : '';
  const hairAcc = eq.hairAcc ? garmentLayer(id, eq.hairAcc, 'details') : '';

  const vb = opts.viewBox || '0 0 200 440';
  const cls = opts.className ? ` class="${opts.className}"` : '';
  return `<svg${cls} xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${opts.label || 'Your avatar'}" preserveAspectRatio="${opts.align || 'xMidYMax'} meet">
  ${defs(id, items, skin, hairHex)}
  ${opts.shadow === false ? '' : '<ellipse cx="100" cy="433" rx="34" ry="5" fill="#5a2a5e" opacity=".14"/>'}
  ${ghost ? '' : hairBack(id, ap.hairStyle, hairHex)}
  ${bodyBack(id, skin, mk.masc)}
  ${ghost ? '' : baseLayer(mk.masc)}
  ${garments.join('')}
  ${neck}
  ${arms(id, skin, mk.masc)}
  ${sleeves}
  ${handLayer.join('')}
  ${head(id, skin, ap, mk)}
  ${ears}
  ${ghost ? '' : hairFront(id, ap.hairStyle, hairHex)}
  ${hairAcc}
</svg>`;
}

/** Crop windows used for thumbnails, per slot (x y w h in avatar space). */
export const THUMB_VIEW = {
  top: '48 112 104 112',
  bottom: '40 182 120 228',
  dress: '18 110 164 330',
  outerwear: '40 112 120 220',
  shoes: '70 316 60 120',
  bag: '118 210 60 100',
  earrings: '58 52 84 50',
  necklace: '80 100 40 46',
  bracelet: '130 228 28 28',
  hairAcc: '58 0 84 64',
  hair: '44 4 112 120',
  face: '62 36 76 76',
};

const GHOST_SKIN = { base: '#f7eef5', shade: '#eadcea' };

/** Approximate bounding box of an item's art from the coordinates in its paths. */
function itemBox(item) {
  const shape = SHAPES[item.shape];
  const src = [...(shape.body || []), ...(shape.sleeves || [])].join(' ');
  const nums = (src.match(/-?\d*\.?\d+/g) || []).map(Number);
  if (nums.length < 4) return null;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]);
    y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]);
  }
  return { x0, x1, y0, y1 };
}

/** Square crop around the item (or the slot default for jewellery & small accessories). */
export function thumbViewBox(item) {
  const b = itemBox(item);
  if (!b || ['earrings', 'necklace', 'bracelet', 'hairAcc'].includes(item.slot)) return THUMB_VIEW[item.slot];
  const size = Math.max(b.x1 - b.x0, b.y1 - b.y0) * 1.12;
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  return `${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}`;
}

/** Render a single clothing item on a pale "ghost" mannequin cropped to the item. */
export function renderItemThumb(item) {
  if (!item) return '';
  const svg = renderAvatar(DEFAULT_APPEARANCE, { [item.slot]: item.id }, { viewBox: thumbViewBox(item), shadow: false, ghost: true, align: 'xMidYMid', label: item.name });
  return `<div class="thumb thumb-${item.slot}">${svg}</div>`;
}
