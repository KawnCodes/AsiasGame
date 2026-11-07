/**
 * ROOM RENDERER — draws any room of any home as one SVG (390 × 420 units):
 * architecture (wallpaper/paint, floor, window with the property's view, trims), then the
 * room's furniture in depth order, with the avatar standing among it.
 *
 * Every placed piece is wrapped in <g class="fitem" data-uid="…"> so decorating mode can
 * hit-test and drag it. Pattern ids are unique per render, so many rooms can share a page.
 */
import { SURFACE_BY_ID } from '../data/furniture.js';
import { PROPERTY_BY_ID, ROOM_TYPES } from '../data/properties.js';
import { ROOM, drawOrder, layoutOf, roomDef, itemScale, boxOf } from '../systems/decoratingSystem.js';
import { drawFurniture, furnitureDefs, portraitFor } from './art/furnitureArt.js';
import { renderAvatar } from './avatarRenderer.js';
import { darken, lighten } from '../utils/color.js';

let n = 0;
const AVATAR_Y = 396;

// ------------------------------------------------------------------ surfaces
function wallPattern(id, s) {
  const { c1, c2 = darken(c1, 0.06), c3 = '#ffffff' } = s;
  switch (s.pattern) {
    case 'stripes': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="28" height="28"><rect width="28" height="28" fill="${c1}"/><rect width="14" height="28" fill="${c2}"/></pattern>`;
    case 'stripes_hearts': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="26" height="26"><rect width="26" height="26" fill="${c1}"/><rect width="13" height="26" fill="${c2}"/><path d="M 19.5 9 C 18 7.6 16 8.6 17 10.6 C 17.6 11.8 19.5 13 19.5 13 C 19.5 13 21.4 11.8 22 10.6 C 23 8.6 21 7.6 19.5 9 Z" fill="${c3}" opacity=".8"/></pattern>`;
    case 'panel': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="64" height="300"><rect width="64" height="300" fill="${c1}"/><rect x="8" y="150" width="48" height="110" rx="3" fill="none" stroke="${c2}" stroke-width="3"/><rect x="8" y="30" width="48" height="96" rx="3" fill="none" stroke="${c2}" stroke-width="2" opacity=".6"/><rect x="0" y="136" width="64" height="5" fill="${c3}" opacity=".7"/></pattern>`;
    case 'tiles': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="30" height="16"><rect width="30" height="16" fill="${c2}"/><rect x="1" y="1" width="28" height="6" rx="1.5" fill="${c1}"/><rect x="-14" y="9" width="28" height="6" rx="1.5" fill="${c1}"/><rect x="16" y="9" width="28" height="6" rx="1.5" fill="${c1}"/></pattern>`;
    case 'damask': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="40" height="50"><rect width="40" height="50" fill="${c1}"/><path d="M 20 6 C 28 14 30 22 20 30 C 10 22 12 14 20 6 Z M 20 30 C 24 36 24 42 20 46 C 16 42 16 36 20 30 Z M 8 20 C 12 22 14 26 12 30 M 32 20 C 28 22 26 26 28 30" fill="${c2}" stroke="${c2}" stroke-width="1" opacity=".75"/><circle cx="0" cy="0" r="3" fill="${c2}" opacity=".6"/><circle cx="40" cy="50" r="3" fill="${c2}" opacity=".6"/></pattern>`;
    case 'floral': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="44" height="44"><rect width="44" height="44" fill="${c1}"/>${[[11, 11], [33, 33]].map(([x, y]) => `<g fill="${c2}"><circle cx="${x - 3}" cy="${y}" r="3.4"/><circle cx="${x + 3}" cy="${y}" r="3.4"/><circle cx="${x}" cy="${y - 3}" r="3.4"/><circle cx="${x}" cy="${y + 3}" r="3.4"/></g><circle cx="${x}" cy="${y}" r="2" fill="#fff6c4"/><path d="M ${x + 5} ${y + 5} q 6 2 8 8" stroke="${c3}" stroke-width="1.6" fill="none"/>`).join('')}</pattern>`;
    case 'stars': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="40" height="40"><rect width="40" height="40" fill="${c1}"/><path d="M 10 4 l 1.6 4 l 4 1.6 l -4 1.6 l -1.6 4 l -1.6 -4 l -4 -1.6 l 4 -1.6 Z" fill="${c2}"/><circle cx="30" cy="28" r="1.4" fill="${c2}"/><circle cx="24" cy="10" r="1" fill="#fff"/></pattern>`;
    case 'hearts': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="30" height="30"><rect width="30" height="30" fill="${c1}"/><path d="M 10 14 C 6 10 8 5 12 7 C 13 7.5 13.6 8.4 14 9 C 14.4 8.4 15 7.5 16 7 C 20 5 22 10 18 14 L 14 18 Z" fill="${c2}" transform="translate(-4 -2)"/><path d="M 10 14 C 6 10 8 5 12 7 C 13 7.5 13.6 8.4 14 9 C 14.4 8.4 15 7.5 16 7 C 20 5 22 10 18 14 L 14 18 Z" fill="${c2}" opacity=".5" transform="translate(11 13) scale(.6)"/></pattern>`;
    case 'brick': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="40" height="20"><rect width="40" height="20" fill="#e9d8cc"/><rect x="1" y="1" width="38" height="8" rx="1" fill="${c1}"/><rect x="-19" y="11" width="38" height="8" rx="1" fill="${c2}"/><rect x="21" y="11" width="38" height="8" rx="1" fill="${c2}"/></pattern>`;
    default: return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="10" height="10"><rect width="10" height="10" fill="${c1}"/></pattern>`;
  }
}

function floorPattern(id, s) {
  const { c1, c2 = darken(c1, 0.08) } = s;
  switch (s.pattern) {
    case 'planks': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="60" height="20"><rect width="60" height="20" fill="${c1}"/><rect width="60" height="1.5" fill="${c2}"/><rect x="30" y="0" width="1.5" height="10" fill="${c2}"/><rect x="10" y="10" width="1.5" height="10" fill="${c2}"/><rect y="10" width="60" height="1" fill="${c2}" opacity=".5"/></pattern>`;
    case 'checker': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="32" height="32"><rect width="32" height="32" fill="${c1}"/><rect width="16" height="16" fill="${c2}"/><rect x="16" y="16" width="16" height="16" fill="${c2}"/></pattern>`;
    case 'marble': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="80" height="40"><rect width="80" height="40" fill="${c1}"/><path d="M 0 30 Q 20 18 34 24 T 80 10 M 10 0 Q 18 14 40 12" stroke="${c2}" stroke-width="1.2" fill="none" opacity=".8"/><rect width="80" height="40" fill="none" stroke="${c2}" stroke-width=".6" opacity=".5"/></pattern>`;
    case 'carpet': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8"><rect width="8" height="8" fill="${c1}"/><circle cx="2" cy="2" r=".8" fill="${lighten(c1, 0.35)}"/><circle cx="6" cy="6" r=".8" fill="${darken(c1, 0.05)}"/></pattern>`;
    case 'grass': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="20" height="14"><rect width="20" height="14" fill="${c1}"/><path d="M 3 12 l 1 -5 l 1 5 M 12 7 l 1 -5 l 1 5 M 16 13 l 1 -4 l 1 4" stroke="${c2}" stroke-width="1.2" fill="none"/></pattern>`;
    case 'herringbone': return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="24" height="24"><rect width="24" height="24" fill="${c1}"/><path d="M 0 12 L 12 0 L 24 12 L 12 24 Z" fill="none" stroke="${c2}" stroke-width="1.6"/><path d="M 0 24 L 12 12 L 24 24" fill="none" stroke="${c2}" stroke-width="1" opacity=".6"/></pattern>`;
    default: return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="10" height="10"><rect width="10" height="10" fill="${c1}"/></pattern>`;
  }
}

// ------------------------------------------------------------------ views
function viewSVG(view, x, y, w, h) {
  const b = y + h;
  const sky = {
    city: ['#ffc6dd', '#fff1dc'], garden: ['#bfe6ff', '#effaff'], skyline: ['#9fc7ff', '#ffe3ef'], ocean: ['#8fd3ff', '#fff1d0'],
    night: ['#2b2552', '#7a4a9a'], hills: ['#a9dcff', '#fff6e0'], street: ['#c9e6ff', '#fff6ee'],
  }[view] || ['#ffc6dd', '#fff1dc'];
  let scene = '';
  const towers = (cols, tall, color, lit) => cols.map(([cx, cw, chh], i) => `<rect x="${x + cx * w}" y="${b - chh * h * tall}" width="${cw * w}" height="${chh * h * tall}" fill="${color}"/>${lit ? `<rect x="${x + cx * w + 3}" y="${b - chh * h * tall + 6}" width="3" height="4" fill="#fff3b0"/><rect x="${x + cx * w + 3}" y="${b - chh * h * tall + 16}" width="3" height="4" fill="#fff3b0" opacity="${i % 2 ? 1 : 0.4}"/>` : ''}`).join('');
  const bldgs = [[0.02, 0.16, 0.42], [0.2, 0.18, 0.62], [0.4, 0.12, 0.38], [0.54, 0.18, 0.56], [0.74, 0.12, 0.32], [0.86, 0.14, 0.48]];
  if (view === 'city' || view === 'street') scene = towers(bldgs, 1, view === 'city' ? '#f3b3cf' : '#e9c9a8', true);
  else if (view === 'skyline') scene = towers(bldgs.map(([a, c, d]) => [a, c, d + 0.3]), 1, '#8fa8d8', true);
  else if (view === 'night') scene = `${[0.1, 0.3, 0.6, 0.8].map((sx, i) => `<circle cx="${x + sx * w}" cy="${y + (0.1 + (i % 2) * 0.12) * h}" r="1.4" fill="#fff"/>`).join('')}<circle cx="${x + 0.78 * w}" cy="${y + 0.18 * h}" r="${0.07 * w}" fill="#fff6d0"/>${towers(bldgs.map(([a, c, d]) => [a, c, d * 0.8]), 1, '#3b2f66', true)}`;
  else if (view === 'ocean') scene = `<circle cx="${x + 0.7 * w}" cy="${y + 0.5 * h}" r="${0.12 * w}" fill="#ffd36e"/><rect x="${x}" y="${y + 0.58 * h}" width="${w}" height="${0.42 * h}" fill="#5fb6e8"/><path d="M ${x} ${y + 0.7 * h} q ${w / 8} -4 ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/><rect x="${x}" y="${y + 0.9 * h}" width="${w}" height="${0.1 * h}" fill="#f3dfb3"/>`;
  else if (view === 'hills' || view === 'garden') scene = `<path d="M ${x} ${b - 0.3 * h} Q ${x + 0.3 * w} ${b - 0.55 * h} ${x + 0.6 * w} ${b - 0.32 * h} T ${x + w} ${b - 0.4 * h} L ${x + w} ${b} L ${x} ${b} Z" fill="#9fdcae"/><path d="M ${x} ${b - 0.15 * h} Q ${x + 0.5 * w} ${b - 0.32 * h} ${x + w} ${b - 0.12 * h} L ${x + w} ${b} L ${x} ${b} Z" fill="#7fcf98"/>${view === 'garden' ? [0.15, 0.4, 0.7, 0.88].map((fx, i) => `<circle cx="${x + fx * w}" cy="${b - 0.08 * h}" r="3" fill="${i % 2 ? '#ff9fc6' : '#fff3b0'}"/>`).join('') : `<circle cx="${x + 0.2 * w}" cy="${y + 0.2 * h}" r="${0.08 * w}" fill="#fff3b0"/>`}`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#vsky${view})"/>${scene}
    <defs><linearGradient id="vsky${view}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>`;
}

function windowSVG(view, small, cid) {
  const [x, y, w, h] = small ? [160, 54, 70, 70] : [146, 42, 98, 128];
  return `<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${small ? 35 : 48}"/></clipPath>
    <rect x="${x - 7}" y="${y - 7}" width="${w + 14}" height="${h + 14}" rx="${small ? 40 : 54}" fill="#fff"/>
    <g clip-path="url(#${cid})">${viewSVG(view, x, y, w, h)}</g>
    <path d="M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h * 0.5} L ${x + w} ${y + h * 0.5}" stroke="#fff" stroke-width="4"/>
    <rect x="${x - 10}" y="${y + h + 4}" width="${w + 20}" height="7" rx="3" fill="#fff"/>`;
}

function roomExtras(type) {
  if (type === 'music') return `<g opacity=".9">${[30, 80, 310, 360].map((x) => `<rect x="${x - 18}" y="60" width="36" height="120" rx="6" fill="#3d3047"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x - 14}" y="${66 + i * 22}" width="28" height="16" rx="3" fill="#4a3a57"/>`).join('')}`).join('')}</g>`;
  if (type === 'photo') return `<path d="M 40 30 L 350 30 L 350 282 Q 195 300 40 282 Z" fill="#fdfbff" stroke="#e8e0f2"/><rect x="36" y="22" width="318" height="12" rx="6" fill="#9aa0a8"/>`;
  if (type === 'cinema') return `<rect x="60" y="40" width="270" height="150" rx="6" fill="#1e1830" stroke="#e3b553" stroke-width="4"/><rect x="72" y="52" width="246" height="126" fill="url(#tvGlow)" opacity=".7"/><text x="195" y="124" text-anchor="middle" font-size="20" font-family="'Playfair Display', serif" font-weight="700" fill="#fff">✦ starring you ✦</text>`;
  return '';
}

// ------------------------------------------------------------------ main
/**
 * renderRoom(state, propertyId, roomId, opts)
 *   opts.avatar   → include the player standing in the room
 *   opts.selected → uid to outline (decorating mode)
 *   opts.preview  → { item, x, y } ghost piece (furniture shop preview)
 *   opts.people   → [{ look: {appearance, equipped}, x, name }] visitors standing in the room
 */
export function renderRoom(state, propertyId, roomId, opts = {}) {
  const id = `rm${(++n).toString(36)}`;
  const prop = PROPERTY_BY_ID[propertyId];
  const def = roomDef(state, propertyId, roomId) || { type: 'bedroom' };
  const type = ROOM_TYPES[def.type];
  const layout = layoutOf(state, propertyId, roomId) || { placed: {}, wallpaper: type.wallpaper, floor: type.floor };
  const wall = SURFACE_BY_ID[layout.wallpaper] || SURFACE_BY_ID[type.wallpaper || 'wp_cream'];
  const floor = SURFACE_BY_ID[layout.floor] || SURFACE_BY_ID[type.floor];
  const portrait = portraitFor(state);

  let arch;
  if (type.outdoor) {
    arch = `${viewSVG(prop?.view || 'garden', 0, 0, ROOM.W, 300)}
      <rect y="290" width="${ROOM.W}" height="${ROOM.H - 290}" fill="url(#${id}f)"/>
      ${def.type === 'balcony' ? `<g stroke="#fff" stroke-width="4">${Array.from({ length: 14 }, (_, i) => `<path d="M ${10 + i * 28} 232 L ${10 + i * 28} 292"/>`).join('')}<path d="M 0 232 L 390 232" stroke-width="7"/></g>` : ''}
      ${type.pool ? `<path d="M 40 300 L 350 300 L 370 352 L 20 352 Z" fill="#7cd3f2" stroke="#fff" stroke-width="5"/><path d="M 70 318 q 20 -6 40 0 t 40 0 M 210 334 q 20 -6 40 0 t 40 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>` : ''}
      ${def.type === 'garden' ? `<path d="M 0 292 Q 100 270 200 288 T 390 284 L 390 300 L 0 300 Z" fill="#7fcf98"/>` : ''}`;
  } else {
    arch = `<rect width="${ROOM.W}" height="294" fill="url(#${id}w)"/>
      ${roomExtras(def.type)}
      <rect y="0" width="${ROOM.W}" height="14" fill="#fff"/><rect y="12" width="${ROOM.W}" height="4" fill="#f2c86a"/>
      ${['music', 'cinema', 'photo'].includes(def.type) ? '' : windowSVG(prop?.view || 'city', def.type === 'bathroom' || def.type === 'beauty', `${id}win`)}
      <rect y="${ROOM.WALL_BOTTOM - 2}" width="${ROOM.W}" height="16" fill="#fff"/>
      <rect y="292" width="${ROOM.W}" height="${ROOM.H - 292}" fill="url(#${id}f)"/>
      <rect y="292" width="${ROOM.W}" height="10" fill="#000" opacity=".06"/>`;
  }

  const items = drawOrder(state, layout);
  let body = '';
  let avatarDone = !opts.avatar && !(opts.people || []).length;
  const person = (look, x, label) => renderAvatar(look.appearance, look.equipped, { shadow: true, label }).replace('<svg', `<svg x="${x - 64}" y="${AVATAR_Y - 280}" width="128" height="282"`);
  const avatarSVG = () => [
    opts.avatar ? person({ appearance: state.appearance, equipped: state.equipped }, opts.avatarX || 205, 'You') : '',
    ...(opts.people || []).map((p) => person(p.look, p.x, p.name)),
  ].join('');
  for (const e of items) {
    if (!avatarDone && e.item.placement === 'floor' && e.y > AVATAR_Y) { body += `<g class="room-av">${avatarSVG()}</g>`; avatarDone = true; }
    const s = itemScale(e.item, e.y);
    const sel = opts.selected === e.uid;
    const box = sel ? boxOf(e.item, e.x, e.y) : null;
    body += `<g class="fitem${sel ? ' sel' : ''}${e.item.func ? ' func' : ''}" data-uid="${e.uid}" transform="translate(${e.x} ${e.y}) scale(${e.flip ? -s : s} ${s})">${drawFurniture(e.item, { trophies: state.trophies, portrait })}</g>`;
    if (sel) body += `<rect class="sel-box" x="${box.x0 - 4}" y="${box.y0 - 4}" width="${box.x1 - box.x0 + 8}" height="${box.y1 - box.y0 + 8}" rx="8" fill="none" stroke="#f0559b" stroke-width="2" stroke-dasharray="6 4"/>`;
  }
  if (!avatarDone) body += `<g class="room-av">${avatarSVG()}</g>`;
  if (opts.preview) {
    const { item, x, y } = opts.preview;
    const s = itemScale(item, y);
    body += `<g class="preview-item" transform="translate(${x} ${y}) scale(${s})">${drawFurniture(item, { trophies: state.trophies, portrait })}</g>`;
  }

  return `<svg viewBox="0 0 ${ROOM.W} ${ROOM.H}" xmlns="http://www.w3.org/2000/svg" class="room-svg" preserveAspectRatio="xMidYMid meet">
    <defs>${wall && !type.outdoor ? wallPattern(`${id}w`, wall) : ''}${floorPattern(`${id}f`, floor)}${furnitureDefs()}</defs>
    ${arch}${body}
  </svg>`;
}
