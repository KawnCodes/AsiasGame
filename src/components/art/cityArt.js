/**
 * CITY ART — procedural, original illustrated buildings for the city map.
 * Every building is drawn from the parameters in data/locations.js so new
 * locations need only data. (Temporary procedural art — see docs/ASSETS.md.)
 */
import { lighten, darken } from '../../utils/color.js';
import { mulberry } from './sceneArt.js';

export const MAP_W = 390;
export const MAP_H = 1690;

const EMBLEM = {
  home: '💗', cafe: '☕', shop_everyday: '👗', shop_luxury: '👑', shop_shoes: '👠', shop_jewellery: '💎', shop_accessories: '👜',
  salon: '✂️', makeup: '💄', agency: '📸', studio_music: '🎤', studio_film: '🎬', pageant: '🏆', restaurant: '🌹', park: '💞',
  arcade: '🎮', social: '💬', property: '🔑', furniture: '🛋️',
};

function stripes(x, y, w, h, c1, c2, n) {
  let s = '';
  const sw = w / n;
  for (let i = 0; i < n; i++) s += `<rect x="${(x + i * sw).toFixed(1)}" y="${y}" width="${(sw + 0.3).toFixed(1)}" height="${h}" fill="${i % 2 ? c2 : c1}"/>`;
  return s;
}

function scallop(x, y, w, n, c1, c2) {
  let s = '';
  const sw = w / n;
  for (let i = 0; i < n; i++) s += `<path d="M ${x + i * sw} ${y} q ${sw / 2} ${sw * 0.7} ${sw} 0 Z" fill="${i % 2 ? c2 : c1}"/>`;
  return s;
}

function awning(x, y, w, color) {
  const n = Math.max(5, Math.round(w / 12));
  return `<g stroke="${darken(color, 0.25)}" stroke-width=".6">
    <path d="M ${x - 4} ${y} L ${x + w + 4} ${y} L ${x + w + 8} ${y + 14} L ${x - 8} ${y + 14} Z" fill="${color}"/>
    ${stripes(x - 6, y + 2, w + 12, 12, color, '#fff', n)}
  </g>${scallop(x - 8, y + 14, w + 16, n + 1, color, '#fff')}`;
}

function windowArch(x, y, w, h, frame, glass = '#cfe9ff') {
  return `<path d="M ${x} ${y + h} L ${x} ${y + w / 2} Q ${x} ${y} ${x + w / 2} ${y} Q ${x + w} ${y} ${x + w} ${y + w / 2} L ${x + w} ${y + h} Z" fill="${glass}" stroke="${frame}" stroke-width="2"/>
    <path d="M ${x + w / 2} ${y + 2} L ${x + w / 2} ${y + h} M ${x} ${y + h * 0.55} L ${x + w} ${y + h * 0.55}" stroke="${frame}" stroke-width="1.2"/>
    <path d="M ${x + 3} ${y + h - 4} L ${x + w * 0.45} ${y + w * 0.4}" stroke="#fff" stroke-width="2" opacity=".6"/>`;
}

function flowerBox(x, y, w) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="5" rx="2" fill="#b07c52"/>`;
  for (let i = 0; i < w / 5; i++) s += `<circle cx="${x + 2.5 + i * 5}" cy="${y - 1}" r="2.4" fill="${i % 2 ? '#ff7eb6' : '#fff'}"/>`;
  return s;
}

function mannequinDress(cx, by, color) {
  return `<g><circle cx="${cx}" cy="${by - 34}" r="3.2" fill="#f4dfe8"/>
    <path d="M ${cx - 5} ${by - 30} L ${cx + 5} ${by - 30} L ${cx + 11} ${by - 6} L ${cx - 11} ${by - 6} Z" fill="${color}" stroke="${darken(color, 0.3)}" stroke-width=".6"/>
    <path d="M ${cx} ${by - 6} L ${cx} ${by}" stroke="#c9a" stroke-width="1.4"/></g>`;
}

const KINDS = {
  apartment(a, loc) {
    const { w, h } = a;
    let s = `<rect x="6" y="18" width="${w - 12}" height="${h - 18}" rx="6" fill="${a.wall}" stroke="${darken(a.wall, 0.25)}"/>
      <rect x="0" y="10" width="${w}" height="12" rx="4" fill="${a.roof}"/>
      <rect x="10" y="22" width="${w - 20}" height="5" fill="${lighten(a.roof, 0.5)}"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const x = 20 + c * ((w - 40) / 3) + 4;
      const y = 34 + r * 36;
      if (r === 3 && c === 1) continue;
      s += windowArch(x, y, 24, 26, '#fff') + flowerBox(x - 2, y + 26, 28);
    }
    const dx = w / 2 - 15;
    s += `<rect x="${dx}" y="${h - 46}" width="30" height="46" rx="14" fill="#c96f9a" stroke="#fff" stroke-width="2"/>
      <circle cx="${dx + 23}" cy="${h - 22}" r="2" fill="#ffe08a"/>
      ${awning(dx - 6, h - 58, 42, '#ff7eb6')}
      <path d="M ${w / 2} 2 C ${w / 2 - 8} -6 ${w / 2 - 14} 4 ${w / 2} 12 C ${w / 2 + 14} 4 ${w / 2 + 8} -6 ${w / 2} 2 Z" fill="#ff5c97" stroke="#fff" stroke-width="1.5"/>`;
    return s;
  },
  cafe(a) {
    const { w, h } = a;
    return `<rect x="4" y="30" width="${w - 8}" height="${h - 30}" rx="5" fill="${a.wall}" stroke="${darken(a.wall, 0.25)}"/>
      <path d="M 0 32 L ${w / 2} 8 L ${w} 32 Z" fill="${a.awning}" stroke="${darken(a.awning, 0.3)}"/>
      <rect x="14" y="${h - 76}" width="${w - 28}" height="40" rx="4" fill="#cfe9ff" stroke="#fff" stroke-width="3"/>
      <path d="M ${w / 2} ${h - 76} L ${w / 2} ${h - 36}" stroke="#fff" stroke-width="3"/>
      ${awning(14, h - 92, w - 28, a.awning)}
      <rect x="${w / 2 - 26}" y="40" width="52" height="18" rx="9" fill="#fff" stroke="${a.awning}" stroke-width="2"/>
      <text x="${w / 2}" y="53" text-anchor="middle" font-size="11" font-weight="800" fill="${darken(a.awning, 0.3)}" font-family="Quicksand, sans-serif">CAFÉ</text>
      <g transform="translate(${w - 34} ${h - 30})"><path d="M -14 0 Q 0 -16 14 0 Z" fill="${a.awning}"/><path d="M -14 0 Q -7 -4 0 0 Q 7 -4 14 0" fill="#fff"/><rect x="-1" y="0" width="2" height="22" fill="#a77"/><ellipse cx="0" cy="18" rx="9" ry="3" fill="#fff" stroke="#dcc"/></g>`;
  },
  boutique(a, loc) {
    const { w, h } = a;
    const tall = h > 100;
    const winY = tall ? h - 74 : h - 44;
    const winH = tall ? 46 : 30;
    return `<rect x="4" y="22" width="${w - 8}" height="${h - 22}" rx="5" fill="${a.wall}" stroke="${darken(a.wall, 0.22)}"/>
      <path d="M 0 24 L 8 6 L ${w - 8} 6 L ${w} 24 Z" fill="${lighten(a.awning, 0.35)}" stroke="${darken(a.awning, 0.2)}"/>
      <rect x="${w / 2 - 30}" y="10" width="60" height="18" rx="9" fill="#fff" stroke="${a.awning}" stroke-width="2"/>
      ${tall ? `${windowArch(14, 36, 22, 26, '#fff')}${windowArch(w - 36, 36, 22, 26, '#fff')}` : ''}
      <rect x="12" y="${winY}" width="${w * 0.52}" height="${winH}" rx="3" fill="#fff6fb" stroke="#fff" stroke-width="3"/>
      ${mannequinDress(12 + w * 0.15, winY + winH, a.awning)}${w > 110 ? mannequinDress(12 + w * 0.37, winY + winH, lighten(a.awning, 0.4)) : ''}
      <rect x="${w * 0.66}" y="${h - 40}" width="${w * 0.24}" height="40" rx="8" fill="${darken(a.awning, 0.15)}" stroke="#fff" stroke-width="2"/>
      ${awning(8, winY - 16, w - 16, a.awning)}`;
  },
  luxury(a) {
    const { w, h } = a;
    let cols = '';
    for (let i = 0; i < 4; i++) cols += `<rect x="${10 + i * ((w - 28) / 3)}" y="34" width="8" height="${h - 40}" fill="${a.trim}" opacity=".9"/>`;
    return `<rect x="4" y="28" width="${w - 8}" height="${h - 28}" fill="${a.wall}" stroke="#1d1530"/>
      <path d="M 0 30 L ${w / 2} 0 L ${w} 30 Z" fill="${a.wall}" stroke="${a.awning}" stroke-width="2"/>
      <circle cx="${w / 2}" cy="20" r="8" fill="${a.awning}"/>
      ${cols}
      ${windowArch(22, 46, 24, 34, a.awning, '#fbe9b8')}${windowArch(w - 46, 46, 24, 34, a.awning, '#fbe9b8')}
      ${windowArch(w / 2 - 14, 96, 28, h - 96, a.awning, '#fff3d0')}
      <path d="M ${w / 2 - 28} ${h} L ${w / 2 + 28} ${h} L ${w / 2 + 20} ${h - 4} L ${w / 2 - 20} ${h - 4} Z" fill="#c2193a"/>
      <rect x="${w / 2 - 34}" y="86" width="68" height="6" rx="3" fill="${a.awning}"/>`;
  },
  salon(a, loc) {
    return KINDS.boutique(a, loc) + `<circle cx="${a.w - 16}" cy="${a.h - 58}" r="10" fill="#fff" stroke="${a.awning}" stroke-width="2"/><rect x="${a.w - 18}" y="${a.h - 86}" width="4" height="18" fill="${a.awning}"/>`;
  },
  tower(a) {
    const { w, h } = a;
    let wins = '';
    for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) wins += `<rect x="${14 + c * ((w - 28) / 4)}" y="${30 + r * 18}" width="${(w - 28) / 4 - 5}" height="12" rx="2" fill="${(r + c) % 3 ? '#e9e0ff' : '#cbb8ff'}"/>`;
    return `<rect x="6" y="18" width="${w - 12}" height="${h - 18}" rx="4" fill="${a.wall}" stroke="${darken(a.wall, 0.3)}"/>
      <rect x="0" y="12" width="${w}" height="10" rx="3" fill="${a.roof}"/>
      ${wins}
      <path d="M ${w / 2} -4 L ${w / 2 + 4} 6 L ${w / 2 + 14} 6 L ${w / 2 + 6} 12 L ${w / 2 + 9} 22 L ${w / 2} 16 L ${w / 2 - 9} 22 L ${w / 2 - 6} 12 L ${w / 2 - 14} 6 L ${w / 2 - 4} 6 Z" fill="#ffd36e" stroke="#fff"/>
      <rect x="${w / 2 - 16}" y="${h - 30}" width="32" height="30" fill="${a.trim}" stroke="#fff" stroke-width="2"/>`;
  },
  studio(a) {
    const { w, h } = a;
    let bulbs = '';
    for (let i = 0; i < Math.floor((w - 20) / 9); i++) bulbs += `<circle cx="${14 + i * 9}" cy="18" r="2.3" fill="#fff3a0"/>`;
    return `<rect x="4" y="24" width="${w - 8}" height="${h - 24}" rx="5" fill="${a.wall}" stroke="${darken(a.wall, 0.3)}"/>
      <rect x="6" y="8" width="${w - 12}" height="22" rx="6" fill="${a.roof}" stroke="#fff" stroke-width="2"/>${bulbs}
      <rect x="${w / 2 - 14}" y="${h - 28}" width="28" height="28" rx="4" fill="${a.trim}" stroke="#fff" stroke-width="2"/>
      ${h > 90 ? `<rect x="14" y="40" width="${w - 28}" height="${h - 80}" rx="4" fill="${lighten(a.wall, 0.15)}" stroke="${a.trim}" stroke-width="2"/>` : ''}`;
  },
  pavilion(a) {
    const { w, h } = a;
    let cols = '';
    for (let i = 0; i < 6; i++) cols += `<rect x="${18 + i * ((w - 44) / 5)}" y="${h - 50}" width="7" height="40" fill="#fff" stroke="#e8d8c0"/>`;
    return `<ellipse cx="${w / 2}" cy="${h - 52}" rx="${w / 2 - 6}" ry="12" fill="${a.trim}"/>
      <path d="M 14 ${h - 52} Q ${w / 2} ${-14} ${w - 14} ${h - 52} Z" fill="${a.roof}" stroke="#fff" stroke-width="2"/>
      <path d="M ${w / 2} 4 L ${w / 2} -12 L ${w / 2 + 14} -6 L ${w / 2} 0" fill="#ff5c97" stroke="#c23477"/>
      ${cols}<rect x="8" y="${h - 12}" width="${w - 16}" height="12" rx="3" fill="#f6ebdc"/>
      <rect x="${w / 2 - 22}" y="${h - 12}" width="44" height="12" fill="#c2193a"/>`;
  },
  park(a) {
    const { w, h } = a;
    const tree = (x, y, r) => `<rect x="${x - 2}" y="${y}" width="4" height="${r}" fill="#a07050"/><circle cx="${x}" cy="${y - 2}" r="${r}" fill="#8fd6a0"/><circle cx="${x - r / 3}" cy="${y - r / 2}" r="${r / 2}" fill="#b4e8c0"/>`;
    return `<rect x="0" y="10" width="${w}" height="${h - 10}" rx="24" fill="#bfeacb" stroke="#9ed6ae" stroke-width="2"/>
      <path d="M ${w / 2} ${h - 22} C ${w / 2 - 70} ${h - 60} ${w / 2 - 40} 20 ${w / 2} 44 C ${w / 2 + 40} 20 ${w / 2 + 70} ${h - 60} ${w / 2} ${h - 22} Z" fill="#9fd8f2" stroke="#fff" stroke-width="3"/>
      <path d="M ${w / 2 - 24} 56 Q ${w / 2 - 10} 50 ${w / 2} 58" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
      ${tree(22, 40, 14)}${tree(w - 24, 44, 15)}${tree(28, h - 30, 12)}${tree(w - 28, h - 26, 12)}
      <rect x="${w / 2 - 18}" y="${h - 14}" width="36" height="5" rx="2" fill="#c08a60"/>`;
  },
  house(a) {
    const { w, h } = a;
    return `<path d="M 6 ${h * 0.42} L ${w / 2} 4 L ${w - 6} ${h * 0.42} Z" fill="${a.roof}" stroke="#fff" stroke-width="2"/>
      <rect x="16" y="${h * 0.4}" width="${w - 32}" height="${h * 0.6}" fill="${a.wall}" stroke="${darken(a.wall, 0.2)}"/>
      ${windowArch(28, h * 0.48, 22, 26, '#fff')}${windowArch(w - 50, h * 0.48, 22, 26, '#fff')}
      <rect x="${w / 2 - 12}" y="${h - 38}" width="24" height="38" rx="10" fill="${a.trim}" stroke="#fff" stroke-width="2"/>
      <g transform="translate(${w - 30} ${h - 30})"><rect x="-1" y="0" width="2" height="30" fill="#8a6"/><rect x="-16" y="0" width="32" height="16" rx="2" fill="#fff" stroke="#c23477"/><text x="0" y="11" text-anchor="middle" font-size="7" font-weight="800" fill="#c23477" font-family="Quicksand, sans-serif">FOR SALE</text></g>`;
  },
};

/** One tappable building with its name plaque. */
export function locationSVG(loc, playerLevel = 99) {
  const a = loc.art;
  const levelLock = loc.status === 'open' && (loc.requires?.level || 1) > playerLevel ? loc.requires.level : 0;
  const body = (KINDS[a.kind] || KINDS.boutique)(a, loc);
  const soon = loc.status !== 'open';
  const em = EMBLEM[loc.id] || '✦';
  const plaqueW = Math.min(a.w + 10, Math.max(80, loc.name.length * 6.2 + 26));
  const emblemY = a.kind === 'luxury' ? 24 : a.kind === 'park' ? 30 : a.kind === 'cafe' ? 72 : a.kind === 'pavilion' ? a.h - 64 : 22;
  return `<g class="loc ${soon ? 'soon' : 'open'} ${levelLock ? 'level-locked' : ''}" data-id="${loc.id}" role="button" tabindex="0" aria-label="${loc.name}${soon ? ' (coming soon)' : ''}" transform="translate(${loc.x} ${loc.y})">
    <ellipse cx="${a.w / 2}" cy="${a.h + 2}" rx="${a.w / 2}" ry="6" fill="#7a4a7a" opacity=".12"/>
    <g class="bld">${body}
      <text x="${a.w / 2}" y="${emblemY}" text-anchor="middle" dominant-baseline="middle" font-size="${a.kind === 'park' ? 22 : 13}">${em}</text>
    </g>
    ${levelLock ? `<g class="soon-ribbon" transform="translate(${a.w - 6} 4) rotate(12)"><rect x="-44" y="-9" width="56" height="18" rx="4" fill="#f0559b" stroke="#fff" stroke-width="1.5"/><text x="-16" y="4" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fff" font-family="Quicksand, sans-serif">🔒 LV ${levelLock}</text></g>` : ''}
    ${soon ? `<g class="soon-ribbon" transform="translate(${a.w - 6} 4) rotate(12)"><rect x="-44" y="-9" width="56" height="18" rx="4" fill="#9a6ee8" stroke="#fff" stroke-width="1.5"/><text x="-16" y="4" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fff" font-family="Quicksand, sans-serif">SOON</text></g>` : ''}
    <g class="plaque" transform="translate(${a.w / 2} ${a.h + 14})">
      <rect x="${-plaqueW / 2}" y="-10" width="${plaqueW}" height="20" rx="10" fill="${soon ? '#f1e9ff' : '#fff'}" stroke="${soon ? '#c9a7ff' : '#ff9fc6'}" stroke-width="2"/>
      <text y="4" text-anchor="middle" font-size="10.5" font-weight="800" fill="${soon ? '#8a6bc0' : '#c23477'}" font-family="Quicksand, sans-serif">${loc.name.replace('&', '&amp;')}</text>
    </g>
  </g>`;
}

export function groundSVG(districts) {
  const rnd = mulberry(42);
  let deco = '';
  // trees & lamps scattered along the sidewalks
  const spots = [[180, 280], [370, 290], [6, 560], [136, 560], [258, 560], [380, 560], [134, 790], [374, 792], [190, 1040], [6, 1360], [376, 1366], [176, 1466], [380, 1640], [6, 1660]];
  for (const [x, y] of spots) {
    if (rnd() > 0.5) deco += `<g transform="translate(${x} ${y})"><rect x="-1.5" y="-26" width="3" height="26" fill="#8a6b8f"/><circle cx="0" cy="-28" r="5" fill="#fff3b0" stroke="#8a6b8f"/></g>`;
    else deco += `<g transform="translate(${x} ${y})"><rect x="-2" y="-14" width="4" height="14" fill="#a07050"/><circle cx="0" cy="-20" r="11" fill="#9fdcae"/><circle cx="-3" cy="-24" r="5" fill="#c3f0cf"/><circle cx="4" cy="-17" r="2" fill="#ff9fc6"/></g>`;
  }
  const road = (y, hgt) => `<rect x="0" y="${y}" width="${MAP_W}" height="${hgt}" fill="#d9cfe6"/><rect x="0" y="${y - 4}" width="${MAP_W}" height="4" fill="#fff"/><rect x="0" y="${y + hgt}" width="${MAP_W}" height="4" fill="#fff"/>
    <path d="M 0 ${y + hgt / 2} L ${MAP_W} ${y + hgt / 2}" stroke="#fff" stroke-width="3" stroke-dasharray="14 12"/>
    ${[60, 200, 330].map((x) => `<g fill="#fff" opacity=".85">${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + i * 7}" y="${y + 3}" width="4" height="${hgt - 6}"/>`).join('')}</g>`).join('')}`;
  const banner = (d) => `<g class="district-banner" transform="translate(${MAP_W / 2} ${d.y + 13})">
      <path d="M -100 -12 L 100 -12 L 112 0 L 100 12 L -100 12 L -112 0 Z" fill="#fff" stroke="#f2c86a" stroke-width="2"/>
      <text y="5" text-anchor="middle" font-size="15" font-family="'Playfair Display', serif" font-weight="700" fill="#5a2a5e">${d.name}</text>
      <path d="M -88 0 l 4 -4 l 4 4 l -4 4 Z M 88 0 l -4 -4 l -4 4 l 4 4 Z" fill="#f2c86a"/></g>`;
  return `
  <defs>
    <linearGradient id="mapSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2f0"/><stop offset=".25" stop-color="#fff2e6"/><stop offset=".6" stop-color="#f5ecff"/><stop offset="1" stop-color="#e9f8ef"/></linearGradient>
    <pattern id="paving" patternUnits="userSpaceOnUse" width="20" height="20"><rect width="20" height="20" fill="#fbf1f6"/><path d="M 0 10 L 20 10 M 10 0 L 10 10 M 0 20 L 0 10 M 20 20 L 20 10" stroke="#f1dfe9" stroke-width="1"/></pattern>
  </defs>
  <rect width="${MAP_W}" height="${MAP_H}" fill="url(#mapSky)"/>
  <rect y="40" width="${MAP_W}" height="${MAP_H - 40}" fill="url(#paving)" opacity=".8"/>
  ${road(294, 30)}${road(780, 30)}
  <rect x="0" y="1146" width="${MAP_W}" height="26" fill="#a9dcf5"/><path d="M 0 1155 Q 30 1150 60 1155 T 120 1155 T 180 1155 T 240 1155 T 300 1155 T 360 1155 T 420 1155" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
  <path d="M 150 1146 Q 195 1128 240 1146 L 240 1172 L 150 1172 Z" fill="#f6ebdc" stroke="#e1cdb4"/>
  <rect x="0" y="1500" width="${MAP_W}" height="${MAP_H - 1500}" fill="#d7f2dd" opacity=".55"/>
  ${districts.map(banner).join('')}
  ${deco}`;
}
