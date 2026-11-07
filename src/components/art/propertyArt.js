/**
 * PROPERTY EXTERIORS — procedural illustrations for the property agency & My Homes
 * (temporary art). 200 × 150 viewBox. Owned upgrades add visible touches (pool, garden,
 * balcony, studio lights).
 */
import { darken, lighten } from '../../utils/color.js';

const win = (x, y, w = 14, h = 18, glow = false) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${glow ? '#fff3b0' : '#cfe9ff'}" stroke="#fff" stroke-width="2"/><path d="M ${x + w / 2} ${y} L ${x + w / 2} ${y + h}" stroke="#fff" stroke-width="1.2"/>`;
const door = (x, y, c = '#c96f9a', w = 16, h = 24) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${c}" stroke="#fff" stroke-width="2"/><circle cx="${x + w - 4}" cy="${y + h / 2 + 2}" r="1.4" fill="#ffe08a"/>`;
const tree = (x, y, r = 12, c = '#8fd6a0') => `<rect x="${x - 2}" y="${y}" width="4" height="${r}" fill="#a07050"/><circle cx="${x}" cy="${y - 2}" r="${r}" fill="${c}"/><circle cx="${x - r / 3}" cy="${y - r / 2}" r="${r / 2}" fill="${lighten(c, 0.3)}"/>`;
const palm = (x, y) => `<path d="M ${x} ${y} Q ${x - 3} ${y - 22} ${x + 2} ${y - 40}" stroke="#a07050" stroke-width="4" fill="none"/>${[-50, -15, 20, 55, 160].map((a) => `<ellipse cx="${x + 2 + Math.cos(a * Math.PI / 180) * 12}" cy="${y - 40 + Math.sin(a * Math.PI / 180) * 5}" rx="13" ry="4" fill="#5fb37f" transform="rotate(${a} ${x + 2 + Math.cos(a * Math.PI / 180) * 12} ${y - 40 + Math.sin(a * Math.PI / 180) * 5})"/>`).join('')}`;

const SKY = { city: ['#ffd6e8', '#fff3e6'], garden: ['#cdeeff', '#f2fbff'], skyline: ['#b9d4ff', '#ffe9f2'], street: ['#d6ecff', '#fff6ee'], ocean: ['#9fdcff', '#fff4d6'], night: ['#2b2552', '#7a4a9a'], hills: ['#bfe6ff', '#fff6e0'] };

const KINDS = {
  apartment: () => `<rect x="50" y="30" width="100" height="105" rx="4" fill="#ffd8e6" stroke="#e8a8c4"/><rect x="44" y="24" width="112" height="10" rx="3" fill="#c96f9a"/>
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 1 ? '' : win(62 + c * 28, 42 + r * 30))).join('')).join('')}${door(92, 111)}`,
  studio: () => `<rect x="55" y="62" width="90" height="73" rx="4" fill="#fff1d6" stroke="#e8cfa0"/><path d="M 48 64 L 100 30 L 152 64 Z" fill="#ff9fc6" stroke="#fff" stroke-width="2"/>
    ${win(70, 76, 18, 20)}${win(112, 76, 18, 20)}<rect x="62" y="108" width="40" height="27" fill="#cfe9ff" stroke="#fff" stroke-width="2"/>
    <g>${[0, 1, 2, 3, 4].map((i) => `<rect x="${60 + i * 9}" y="102" width="9" height="6" fill="${i % 2 ? '#fff' : '#ff7eb6'}"/>`).join('')}</g>${door(116, 111, '#ff7eb6')}
    ${[66, 74, 82, 90].map((x, i) => `<circle cx="${x}" cy="133" r="3" fill="${i % 2 ? '#ff9fc6' : '#fff3b0'}"/>`).join('')}`,
  apartment_tall: () => `<rect x="60" y="12" width="80" height="123" rx="3" fill="#f3e9ff" stroke="#c9b2f2"/><rect x="55" y="8" width="90" height="8" rx="3" fill="#9a6ee8"/>
    ${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => win(68 + c * 24, 22 + r * 24, 13, 16)).join('')).join('')}
    <rect x="58" y="114" width="84" height="21" fill="#ffe3ef"/><rect x="58" y="108" width="84" height="7" fill="#ff7eb6"/>${door(92, 115, '#9a6ee8', 16, 20)}`,
  loft: () => `<rect x="35" y="40" width="130" height="95" fill="#b8664f" stroke="#8a4a38"/>
    ${Array.from({ length: 9 }, (_, r) => `<path d="M 35 ${48 + r * 10} L 165 ${48 + r * 10}" stroke="#9a5240" stroke-width=".8"/>`).join('')}
    <rect x="30" y="34" width="140" height="8" fill="#5a3a30"/><path d="M 120 34 L 120 14 L 132 14 L 132 34" fill="#5a3a30"/>
    ${[0, 1, 2].map((c) => `<rect x="${48 + c * 38}" y="54" width="28" height="44" rx="2" fill="#cfe9ff" stroke="#2b2b2f" stroke-width="2.5"/><path d="M ${62 + c * 38} 54 L ${62 + c * 38} 98 M ${48 + c * 38} 76 L ${76 + c * 38} 76" stroke="#2b2b2f" stroke-width="1.5"/>`).join('')}
    ${door(92, 111, '#2b2b2f')}`,
  townhouse: () => `${[0, 1, 2].map((i) => `<rect x="${30 + i * 48}" y="${26 + (i % 2) * 6}" width="46" height="${109 - (i % 2) * 6}" fill="${['#f6efe6', '#e9f1f7', '#f7e9ee'][i]}" stroke="#d8cfc4"/>
      <path d="M ${28 + i * 48} ${28 + (i % 2) * 6} L ${53 + i * 48} ${10 + (i % 2) * 6} L ${78 + i * 48} ${28 + (i % 2) * 6} Z" fill="#6f8fd8" stroke="#fff"/>
      ${win(36 + i * 48, 40 + (i % 2) * 6)}${win(56 + i * 48, 40 + (i % 2) * 6)}${win(36 + i * 48, 72)}${win(56 + i * 48, 72)}${door(45 + i * 48, 111, ['#2d3d74', '#c2193a', '#2f9a6a'][i])}`).join('')}`,
  beach: () => `<rect x="0" y="118" width="200" height="32" fill="#f3dfb3"/><rect x="0" y="108" width="200" height="12" fill="#5fb6e8"/>
    <rect x="40" y="52" width="120" height="66" fill="#fffaf2" stroke="#d8cfc4"/><path d="M 32 54 L 100 22 L 168 54 Z" fill="#5a8de0" stroke="#fff" stroke-width="2"/>
    <rect x="40" y="82" width="120" height="6" fill="#d8b98d"/>${Array.from({ length: 12 }, (_, i) => `<path d="M ${44 + i * 10} 82 L ${44 + i * 10} 70" stroke="#fff" stroke-width="2"/>`).join('')}<path d="M 40 70 L 160 70" stroke="#fff" stroke-width="3"/>
    ${win(56, 58, 22, 10)}${win(122, 58, 22, 10)}${win(52, 92, 20, 18)}${door(92, 92, '#5a8de0', 16, 26)}${win(128, 92, 20, 18)}${palm(18, 120)}${palm(184, 122)}`,
  penthouse: () => `<rect x="62" y="40" width="76" height="110" fill="#8fa8d8" stroke="#6f87b8"/>
    ${Array.from({ length: 6 }, (_, r) => [0, 1, 2, 3].map((c) => `<rect x="${68 + c * 17}" y="${48 + r * 16}" width="12" height="10" fill="${(r + c) % 3 ? '#cfe0ff' : '#fff3b0'}"/>`).join('')).join('')}
    <rect x="52" y="16" width="96" height="26" rx="3" fill="#e9f1ff" stroke="#fff" stroke-width="2"/><rect x="56" y="20" width="88" height="18" fill="#9fc7ff" opacity=".8"/>
    <rect x="48" y="12" width="104" height="5" rx="2" fill="#e3b553"/><path d="M 100 12 L 100 2" stroke="#e3b553" stroke-width="2"/><circle cx="100" cy="2" r="2.5" fill="#ff5c97"/>`,
  mansion: () => `<rect x="10" y="66" width="180" height="69" fill="#fffaf0" stroke="#e8dcc0"/><rect x="70" y="40" width="60" height="95" fill="#fffaf0" stroke="#e8dcc0"/>
    <path d="M 62 42 L 100 14 L 138 42 Z" fill="#e3b553" stroke="#fff" stroke-width="2"/><path d="M 4 68 L 46 48 L 88 68 Z M 112 68 L 154 48 L 196 68 Z" fill="#c9a24e" stroke="#fff" stroke-width="2"/>
    ${[78, 90, 102, 114].map((x) => `<rect x="${x}" y="70" width="5" height="65" fill="#fff" stroke="#e8dcc0"/>`).join('')}
    ${[18, 40, 150, 172].map((x) => win(x, 78, 12, 18)).join('')}${[18, 40, 150, 172].map((x) => win(x, 104, 12, 18)).join('')}${win(93, 48, 14, 16)}
    ${door(92, 108, '#c2193a', 16, 27)}${tree(4, 128, 8)}${tree(196, 128, 8)}<path d="M 84 135 L 116 135 L 124 150 L 76 150 Z" fill="#e9dcc8"/>`,
};

export function exteriorSVG(property, upgrades = []) {
  const [s1, s2] = SKY[property.view] || SKY.city;
  const id = `ext${property.id}`;
  const extras = [];
  if (upgrades.includes('swimming_pool')) extras.push('<rect x="128" y="136" width="56" height="10" rx="4" fill="#7cd3f2" stroke="#fff" stroke-width="2"/>');
  if (upgrades.includes('garden')) extras.push([12, 22, 32, 168, 178, 188].map((x, i) => `<circle cx="${x}" cy="140" r="3.5" fill="${i % 2 ? '#ff9fc6' : '#ffe08a'}"/>`).join(''));
  if (upgrades.includes('balcony')) extras.push('<rect x="140" y="70" width="34" height="4" fill="#fff"/><path d="M 142 74 L 142 82 M 150 74 L 150 82 M 158 74 L 158 82 M 166 74 L 166 82 M 172 74 L 172 82" stroke="#fff" stroke-width="1.5"/>');
  if (upgrades.some((u) => ['home_studio', 'photo_studio', 'home_cinema'].includes(u))) extras.push('<g transform="translate(176 20)"><circle r="9" fill="#fff" opacity=".9"/><text y="4" text-anchor="middle" font-size="10">⭐</text></g>');
  return `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient></defs>
    <rect width="200" height="150" fill="url(#${id})"/>
    ${property.view === 'night' ? '<circle cx="30" cy="22" r="10" fill="#fff6d0"/><circle cx="160" cy="16" r="1.2" fill="#fff"/><circle cx="20" cy="60" r="1" fill="#fff"/>' : '<circle cx="28" cy="24" r="12" fill="#fff6c4" opacity=".9"/>'}
    <rect x="0" y="135" width="200" height="15" fill="${property.exterior === 'beach' ? '#f3dfb3' : '#bfeacb'}"/>
    ${(KINDS[property.exterior] || KINDS.apartment)()}
    ${extras.join('')}
  </svg>`;
}
