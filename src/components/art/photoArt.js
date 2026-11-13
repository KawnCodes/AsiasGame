/**
 * PHOTO ART — composes a photo/magazine cover as one standalone SVG (300×400):
 * backdrop (studio gradient, painted scene or one of your decorated rooms) → posed
 * avatar → frame → optional masthead & cover lines. Used for the live studio preview,
 * the album and PNG export (the SVG is self-contained, so it rasterises cleanly).
 */
import { renderAvatar } from '../avatarRenderer.js';
import { renderRoom } from '../roomRenderer.js';
import { POSE_BY_ID, BACKDROP_BY_ID, MASTHEAD_BY_ID } from '../../data/photo.js';
import { mulberry } from './sceneArt.js';

export const PHOTO = { W: 300, H: 400 };
let n = 0;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function scene(kind, id) {
  const { W, H } = PHOTO;
  const rnd = mulberry(kind.length * 97);
  switch (kind) {
    case 'paris': return `
      <defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9c7"/><stop offset="1" stop-color="#fff2e6"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}sky)"/>
      <g fill="#d9b8c8" opacity=".9"><path d="M150 40 L162 150 L176 300 L124 300 L138 150 Z"/><rect x="128" y="196" width="44" height="6"/><rect x="134" y="140" width="32" height="5"/>
        <path d="M118 300 Q150 250 182 300 Z" fill="#ffd9c7"/></g>
      ${[[-14, 150, '#f6e3d4'], [52, 186, '#efd5c3'], [196, 176, '#efd5c3'], [256, 146, '#f6e3d4']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="58" height="${H}" fill="${c}"/><rect x="${x - 3}" y="${y - 8}" width="64" height="10" rx="3" fill="#8a9bb4"/>
        ${[0, 1, 2, 3].map((r) => [0, 1].map((k) => `<path d="M${x + 9 + k * 24} ${y + 50 + r * 44} v-14 a8 8 0 0 1 16 0 v14 z" fill="#a9c6e8"/><rect x="${x + 7 + k * 24}" y="${y + 50 + r * 44}" width="20" height="3" fill="#5a3a4a"/>`).join('')).join('')}`).join('')}
      <rect y="350" width="${W}" height="50" fill="#cdb4a8"/><path d="M0 350 H${W}" stroke="#a8907f" stroke-width="3"/>`;
    case 'beach': return `
      <defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd6f2"/><stop offset="1" stop-color="#d9f4ff"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}sky)"/><circle cx="230" cy="80" r="34" fill="#fff3b0"/>
      <rect y="220" width="${W}" height="70" fill="#4fb9d8"/><path d="M0 230 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>
      <path d="M0 280 Q150 262 ${W} 282 L${W} ${H} L0 ${H} Z" fill="#f7e2b5"/>
      <path d="M30 330 q10 -14 20 0 z M250 360 q8 -12 16 0 z" fill="#ffb3c7"/>
      <path d="M268 280 Q262 200 248 150" stroke="#8a5a3a" stroke-width="7" fill="none"/>
      ${[0, 1, 2, 3, 4].map((i) => `<path d="M248 150 q ${-40 + i * 20} ${-20 + Math.abs(i - 2) * 12} ${-55 + i * 28} ${10 + Math.abs(i - 2) * 10}" stroke="#3fae6f" stroke-width="8" fill="none" stroke-linecap="round"/>`).join('')}`;
    case 'runway': return `
      <rect width="${W}" height="${H}" fill="#2a2140"/>
      ${Array.from({ length: 30 }, () => `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * 160).toFixed(0)}" r="${(1 + rnd() * 2).toFixed(1)}" fill="#fff" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`).join('')}
      <path d="M120 170 H180 L250 ${H} H50 Z" fill="#f6f2fb"/><path d="M120 170 L50 ${H} M180 170 L250 ${H}" stroke="#f2c86a" stroke-width="3"/>
      ${Array.from({ length: 12 }, (_, i) => `<circle cx="${i < 6 ? 14 + (i % 3) * 14 : 286 - (i % 3) * 14}" cy="${230 + Math.floor((i % 6) / 3) * 70 + (i % 3) * 22}" r="10" fill="#4a3a66"/>`).join('')}
      <path d="M40 0 L120 ${H} L0 ${H} Z M260 0 L180 ${H} L300 ${H} Z" fill="#fff6d0" opacity=".12"/>`;
    case 'starry': return `
      <defs><radialGradient id="${id}sky" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#4b3a8a"/><stop offset="1" stop-color="#161233"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}sky)"/>
      ${Array.from({ length: 60 }, () => `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(0.6 + rnd() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.3 + rnd() * 0.7).toFixed(2)}"/>`).join('')}
      <circle cx="240" cy="70" r="26" fill="#fff6d6"/><circle cx="252" cy="62" r="24" fill="#2c2360"/>
      <path d="M0 350 Q80 320 150 345 T${W} 335 V${H} H0 Z" fill="#221a48"/>`;
    case 'gold': return `
      <defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#e3b54f"/><stop offset="1" stop-color="#b9832a"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}g)"/>
      ${Array.from({ length: 140 }, () => `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(1 + rnd() * 3).toFixed(1)}" fill="${rnd() < 0.5 ? '#fff8d8' : '#a8761f'}" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`).join('')}`;
    default: return `<rect width="${W}" height="${H}" fill="#fff"/>`;
  }
}

function backdrop(state, photo, id) {
  const { W, H } = PHOTO;
  const bd = BACKDROP_BY_ID[photo.backdrop] || BACKDROP_BY_ID.studio_pink;
  if (bd.kind === 'gradient') return `<defs><radialGradient id="${id}bg" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="${bd.colors[1]}"/><stop offset="1" stop-color="${bd.colors[0]}"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}bg)"/><ellipse cx="150" cy="392" rx="140" ry="22" fill="${bd.colors[0]}" opacity=".7"/>`;
  if (bd.kind === 'home' && photo.home) {
    // the room is drawn as it is decorated today (photos keep the outfit, the room stays live)
    const room = renderRoom(state, photo.home.property, photo.home.room);
    return room.replace('<svg', `<svg x="0" y="0" width="${W}" height="${H}" `).replace('preserveAspectRatio="xMidYMid meet"', 'preserveAspectRatio="xMidYMid slice"');
  }
  return scene(bd.scene, id);
}

function frame(kind, id) {
  const { W, H } = PHOTO;
  switch (kind) {
    case 'polaroid': return `<path fill="#fff" fill-rule="evenodd" d="M0 0 H${W} V${H} H0 Z M14 14 V${H - 64} H${W - 14} V14 Z"/><rect x="14" y="14" width="${W - 28}" height="${H - 78}" fill="none" stroke="#000" stroke-opacity=".08"/>`;
    case 'gold': return `<defs><linearGradient id="${id}fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#d9a640"/><stop offset="1" stop-color="#f6dc8c"/></linearGradient></defs>
      <path fill="url(#${id}fg)" fill-rule="evenodd" d="M0 0 H${W} V${H} H0 Z M16 16 V${H - 16} H${W - 16} V16 Z"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" fill="none" stroke="#8a5a14" stroke-width="2"/><rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="none" stroke="#fff6d0" stroke-width="1.5"/>`;
    case 'hearts': {
      const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-8 -2 -6 -9 0 -5 C6 -9 8 -2 0 6 Z" fill="${c}"/>`;
      let out = `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="16" fill="none" stroke="#ff9fc6" stroke-width="6"/>`;
      for (let i = 0; i < 9; i++) out += heart(18 + i * 33, 14, 1.4, i % 2 ? '#ff7eb6' : '#ffc4e0') + heart(18 + i * 33, H - 14, 1.4, i % 2 ? '#ffc4e0' : '#ff7eb6');
      for (let i = 1; i < 12; i++) out += heart(12, 14 + i * 32, 1.2, i % 2 ? '#ff7eb6' : '#ffc4e0') + heart(W - 12, 14 + i * 32, 1.2, i % 2 ? '#ffc4e0' : '#ff7eb6');
      return out;
    }
    case 'film': return `<rect width="22" height="${H}" fill="#1c1a22"/><rect x="${W - 22}" width="22" height="${H}" fill="#1c1a22"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="6" y="${8 + i * 25}" width="10" height="13" rx="2" fill="#fff"/><rect x="${W - 16}" y="${8 + i * 25}" width="10" height="13" rx="2" fill="#fff"/>`).join('')}`;
    case 'sparkle': {
      const rnd = mulberry(7);
      const star = (x, y, r) => `<path d="M${x} ${y - r} L${x + r * 0.25} ${y - r * 0.25} L${x + r} ${y} L${x + r * 0.25} ${y + r * 0.25} L${x} ${y + r} L${x - r * 0.25} ${y + r * 0.25} L${x - r} ${y} L${x - r * 0.25} ${y - r * 0.25} Z" fill="#fff" stroke="#e3b54f" stroke-width=".8"/>`;
      let out = `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="10" fill="none" stroke="#fff" stroke-width="4" opacity=".9"/>`;
      for (let i = 0; i < 26; i++) {
        const side = i % 4; const t = rnd();
        const [x, y] = side === 0 ? [t * W, 8] : side === 1 ? [W - 8, t * H] : side === 2 ? [t * W, H - 8] : [8, t * H];
        out += star(x.toFixed(0), y.toFixed(0), 4 + rnd() * 6);
      }
      return out;
    }
    default: return '';
  }
}

function cover(c, name, id) {
  const { W, H } = PHOTO;
  const m = MASTHEAD_BY_ID[c.masthead] || MASTHEAD_BY_ID.etoile;
  const font = m.font === 'script' ? "Parisienne, 'Brush Script MT', cursive" : "'Playfair Display', Didot, Georgia, serif";
  const size = m.name.length > 10 ? (m.font === 'script' ? 40 : 34) : 58;
  const headline = esc((c.headline || '').replace('{name}', name));
  // wrap the headline over up to 3 lines
  const words = headline.split(' '); const lines = ['']; for (const w of words) { if ((lines[lines.length - 1] + ' ' + w).trim().length > 16 && lines.length < 3) lines.push(w); else lines[lines.length - 1] = `${lines[lines.length - 1]} ${w}`.trim(); }
  return `<defs><linearGradient id="${id}cv" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}cv)"/>
    <text x="${W / 2}" y="${m.font === 'script' ? 56 : 62}" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${size}" letter-spacing="${m.font === 'script' ? 0 : 3}" fill="${m.color}" stroke="#fff" stroke-width="1.2" paint-order="stroke">${esc(m.name)}</text>
    <text x="${W / 2}" y="78" text-anchor="middle" font-family="Quicksand, Arial, sans-serif" font-weight="700" font-size="9" letter-spacing="2" fill="#fff" stroke="${m.color}" stroke-width="2.4" paint-order="stroke">THE STYLE ISSUE · GLAMOUR CITY</text>
    <text x="14" y="128" font-family="Quicksand, Arial, sans-serif" font-weight="800" font-size="11" fill="#fff" stroke="#00000055" stroke-width="2" paint-order="stroke">NEW SEASON</text>
    <text x="14" y="142" font-family="Quicksand, Arial, sans-serif" font-weight="700" font-size="10" fill="#fff" stroke="#00000055" stroke-width="2" paint-order="stroke">120 must-have looks</text>
    <text x="${W - 14}" y="196" text-anchor="end" font-family="Quicksand, Arial, sans-serif" font-weight="800" font-size="11" fill="#fff" stroke="#00000055" stroke-width="2" paint-order="stroke">HOME TOURS</text>
    <text x="${W - 14}" y="210" text-anchor="end" font-family="Quicksand, Arial, sans-serif" font-weight="700" font-size="10" fill="#fff" stroke="#00000055" stroke-width="2" paint-order="stroke">Penthouse secrets</text>
    ${lines.map((l, i) => `<text x="16" y="${H - 22 - (lines.length - 1 - i) * 24}" font-family="'Playfair Display', Georgia, serif" font-weight="700" font-size="21" fill="#fff" stroke="#00000066" stroke-width="2" paint-order="stroke">${l}</text>`).join('')}
    <g transform="translate(${W - 50} ${H - 40})"><rect width="38" height="28" fill="#fff"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${3 + i * 2.3}" y="3" width="${i % 3 ? 1 : 1.6}" height="18" fill="#111"/>`).join('')}</g>`;
}

/** Full photo SVG for a stored photo spec (or a live draft with the current look). */
export function renderPhoto(state, photo, { className = 'photo-svg' } = {}) {
  const { W, H } = PHOTO;
  const id = `ph${(++n).toString(36)}`;
  const pose = POSE_BY_ID[photo.pose] || POSE_BY_ID.classic;
  const look = photo.look || { appearance: state.appearance, equipped: state.equipped };
  // close-up poses crop the avatar; full-length poses stand on the floor of the frame
  const full = pose.view === '0 0 200 440';
  const avW = full ? 196 * (pose.scale || 1) : W;
  const avH = full ? 372 * (pose.scale || 1) : H;
  const avX = (W - avW) / 2;
  const avY = full ? H - avH - (photo.frame === 'polaroid' ? 60 : 14) : 0;
  const av = renderAvatar(look.appearance, look.equipped, { viewBox: pose.view, shadow: full, align: full ? 'xMidYMax' : 'xMidYMid', className: '' })
    .replace('<svg', `<svg x="${avX.toFixed(1)}" y="${avY.toFixed(1)}" width="${avW.toFixed(1)}" height="${avH.toFixed(1)}"`)
    .replace(/preserveAspectRatio="[^"]*"/, `preserveAspectRatio="${full ? 'xMidYMax meet' : 'xMidYMid slice'}"`);
  const flip = pose.flip ? `translate(${W} 0) scale(-1 1)` : '';
  const tilt = pose.tilt ? `rotate(${pose.tilt} ${W / 2} ${H * 0.7})` : '';
  const name = state.player?.name || 'You';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="${className}" role="img" aria-label="Photo of ${esc(name)}">
    <clipPath id="${id}clip"><rect width="${W}" height="${H}"/></clipPath>
    <g clip-path="url(#${id}clip)">
      ${backdrop(state, photo, id)}
      <g transform="${tilt} ${flip}">${av}</g>
      ${photo.cover ? cover(photo.cover, name, id) : ''}
      ${frame(photo.frame, id)}
    </g>
  </svg>`;
}

/** Rasterise a photo SVG to a PNG blob (2× for crisp phone screens). */
export function photoToPng(svg, scale = 2) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = PHOTO.W * scale; c.height = PHOTO.H * scale;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('png-failed'))), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('svg-load-failed')); };
    img.src = url;
  });
}
