/**
 * VENUE SCENES — backdrops for the café, restaurant, park and rooftop club
 * (390 × 420 units, procedural temporary art). People are drawn on top by the caller.
 */
import { renderAvatar } from '../avatarRenderer.js';

const string = (y, n = 14, colors = ['#fff3b0', '#ffd0e6', '#c9f0ff']) => `<path d="M 0 ${y} Q 195 ${y + 30} 390 ${y}" stroke="#7a5a7a" stroke-width="1" fill="none"/>${Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n; const x = t * 390; const yy = y + 30 * 4 * t * (1 - t) * 0.5 + 4; return `<circle cx="${x}" cy="${yy}" r="3.4" fill="${colors[i % colors.length]}"/><circle cx="${x}" cy="${yy}" r="7" fill="${colors[i % colors.length]}" opacity=".25"/>`; }).join('')}`;

const SCENES = {
  cafe: () => `
    <rect width="390" height="300" fill="#ffe9f2"/>
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 28}" width="14" height="300" fill="#ffdcea"/>`).join('')}
    <rect x="30" y="40" width="130" height="100" rx="50" fill="#fff"/><rect x="38" y="48" width="114" height="84" rx="42" fill="#cfe9ff"/>
    <g fill="#f3b3cf"><rect x="46" y="96" width="18" height="36"/><rect x="68" y="82" width="20" height="50"/><rect x="94" y="100" width="16" height="32"/><rect x="114" y="88" width="22" height="44"/></g>
    <path d="M 95 48 L 95 132 M 38 90 L 152 90" stroke="#fff" stroke-width="4"/>
    <rect x="220" y="36" width="140" height="80" rx="6" fill="#2b2b2f" stroke="#c99a6b" stroke-width="5"/>
    <text x="290" y="60" text-anchor="middle" font-family="'Parisienne', cursive" font-size="20" fill="#fff">Sugarplum</text>
    <text x="290" y="82" text-anchor="middle" font-family="Quicksand, sans-serif" font-size="9" fill="#ffd0e6">LATTE · MACARONS · TARTS</text>
    <text x="290" y="100" text-anchor="middle" font-family="Quicksand, sans-serif" font-size="9" fill="#c9f0ff">HOT CHOCOLATE · CROISSANT</text>
    <rect x="200" y="178" width="190" height="104" fill="#fff8f0" stroke="#e8cfa0"/>
    <rect x="200" y="170" width="190" height="12" fill="#c99a6b"/>
    <rect x="214" y="140" width="160" height="32" rx="4" fill="#e9f6ff" stroke="#fff" stroke-width="2" opacity=".85"/>
    ${[228, 252, 276, 300, 324, 348].map((x, i) => `<circle cx="${x}" cy="${160}" r="7" fill="${['#ff9fc6', '#c9a7ff', '#a9e8d2', '#fff3a6', '#ffb68a', '#ff9fc6'][i]}"/>`).join('')}
    ${string(18)}
    <rect y="280" width="390" height="140" fill="#e9c9a8"/>${Array.from({ length: 8 }, (_, i) => `<rect y="${280 + i * 18}" width="390" height="1.5" fill="#d7b08d"/>`).join('')}
    <g transform="translate(70 330)"><ellipse cx="0" cy="0" rx="40" ry="9" fill="#fff" stroke="#e8cfa0"/><rect x="-3" y="0" width="6" height="40" fill="#c99a6b"/><circle cx="-10" cy="-6" r="6" fill="#ff9fc6"/><rect x="6" y="-14" width="10" height="12" rx="3" fill="#fff" stroke="#c99a6b"/></g>`,
  restaurant: () => `
    <rect width="390" height="300" fill="#4a1f2e"/>
    <pattern id="vdam" patternUnits="userSpaceOnUse" width="40" height="50"><rect width="40" height="50" fill="#5a2436"/><path d="M 20 8 C 28 16 28 22 20 30 C 12 22 12 16 20 8 Z" fill="#7a3048"/></pattern>
    <rect width="390" height="280" fill="url(#vdam)"/>
    ${[60, 195, 330].map((x) => `<g transform="translate(${x} 0)"><path d="M 0 0 L 0 26" stroke="#e3b553" stroke-width="2"/><path d="M -28 30 Q 0 52 28 30 Z" fill="#e3b553"/>${[-24, -12, 0, 12, 24].map((d) => `<circle cx="${d}" cy="${38 - Math.abs(d) / 3}" r="3" fill="#fff6c4"/><circle cx="${d}" cy="${38 - Math.abs(d) / 3}" r="9" fill="#fff6c4" opacity=".2"/>`).join('')}</g>`).join('')}
    <rect x="135" y="80" width="120" height="150" rx="60" fill="#e3b553"/><rect x="143" y="88" width="104" height="134" rx="52" fill="#1e1830"/>
    ${[0.2, 0.5, 0.8].map((t, i) => `<circle cx="${143 + t * 104}" cy="${110 + i * 12}" r="1.4" fill="#fff"/>`).join('')}<circle cx="215" cy="118" r="10" fill="#fff6d0"/>
    <text x="195" y="262" text-anchor="middle" font-family="'Parisienne', cursive" font-size="26" fill="#f2d27a">La Rosette</text>
    <rect y="280" width="390" height="140" fill="#2a1a22"/><path d="M 0 280 L 390 280" stroke="#e3b553" stroke-width="3"/>
    <rect x="100" y="280" width="190" height="140" fill="#8a1f36" opacity=".8"/>
    ${[60, 330].map((x) => `<g transform="translate(${x} 330)"><ellipse cx="0" cy="0" rx="46" ry="10" fill="#fff" stroke="#ddd"/><rect x="-3" y="0" width="6" height="40" fill="#e3b553"/><rect x="-2" y="-18" width="4" height="16" fill="#fff8e0"/><path d="M 0 -22 q -3 -4 0 -8 q 3 4 0 8 Z" fill="#ffb84d"/><circle cx="0" cy="-24" r="10" fill="#fff6c4" opacity=".35"/><circle cx="14" cy="-4" r="4" fill="#e8435f"/></g>`).join('')}`,
  park: () => `
    <defs><linearGradient id="vsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc6dd"/><stop offset=".7" stop-color="#ffe7c9"/></linearGradient></defs>
    <rect width="390" height="300" fill="url(#vsk)"/><circle cx="300" cy="90" r="36" fill="#fff3b0" opacity=".9"/>
    <path d="M 0 200 Q 100 150 200 190 T 390 170 L 390 300 L 0 300 Z" fill="#9fdcae"/>
    <path d="M 0 240 Q 140 210 260 236 T 390 230 L 390 420 L 0 420 Z" fill="#86cc97"/>
    <path d="M 195 330 C 110 290 120 226 195 254 C 270 226 280 290 195 330 Z" fill="#9fd8f2" stroke="#fff" stroke-width="4" transform="translate(0 -20)"/>
    <path d="M 160 260 q 15 -6 30 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
    <g transform="translate(220 262)"><path d="M -14 0 Q 0 8 14 0 L 10 -4 L -10 -4 Z" fill="#c99a6b"/><path d="M -6 -4 L -2 -16" stroke="#8a6b4a" stroke-width="1.5"/></g>
    ${[[40, 210, 26], [350, 200, 30], [90, 190, 18], [310, 186, 16]].map(([x, y, r]) => `<rect x="${x - 3}" y="${y}" width="6" height="${r + 10}" fill="#a07050"/><circle cx="${x}" cy="${y - 4}" r="${r}" fill="#7fcf98"/><circle cx="${x - r / 3}" cy="${y - r / 2}" r="${r / 2}" fill="#b4e8c0"/>${[0, 1, 2].map((k) => `<circle cx="${x - r / 2 + k * r / 2}" cy="${y - 4 + (k - 1) * 6}" r="3" fill="#ff9fc6"/>`).join('')}`).join('')}
    <g transform="translate(60 360)"><rect x="-34" y="-14" width="68" height="6" rx="2" fill="#c99a6b"/><rect x="-34" y="-26" width="68" height="5" rx="2" fill="#c99a6b"/><rect x="-30" y="-8" width="4" height="12" fill="#6b4a36"/><rect x="26" y="-8" width="4" height="12" fill="#6b4a36"/></g>
    ${[[110, 390], [280, 400], [340, 360], [20, 400]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="${i % 2 ? '#fff3b0' : '#ff9fc6'}"/>`).join('')}`,
  club: () => `
    <defs><linearGradient id="vnight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2552"/><stop offset="1" stop-color="#7a4a9a"/></linearGradient></defs>
    <rect width="390" height="300" fill="url(#vnight)"/>
    ${[[30, 30], [80, 60], [150, 24], [240, 50], [330, 30], [360, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join('')}<circle cx="320" cy="60" r="16" fill="#fff6d0"/>
    ${[[0, 60, 150], [50, 40, 180], [100, 50, 130], [160, 40, 200], [210, 60, 160], [280, 44, 190], [330, 60, 140]].map(([x, w, hh], i) => `<rect x="${x}" y="${280 - hh}" width="${w}" height="${hh}" fill="#3b2f66"/>${Array.from({ length: Math.floor(hh / 20) }, (_, r) => `<rect x="${x + 6}" y="${290 - hh + r * 20}" width="5" height="7" fill="#fff3b0" opacity="${(r + i) % 3 ? 0.9 : 0.3}"/><rect x="${x + w - 12}" y="${290 - hh + r * 20}" width="5" height="7" fill="#fff3b0" opacity="${(r + i) % 2 ? 0.8 : 0.3}"/>`).join('')}`).join('')}
    ${string(30, 16, ['#ffd36e', '#ff9fc6', '#7ce0ff'])}
    <rect y="250" width="390" height="10" fill="#fff" opacity=".8"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 28 + 4}" y="250" width="3" height="40" fill="#fff" opacity=".8"/>`).join('')}
    <rect y="288" width="390" height="132" fill="#3a2c4a"/>${Array.from({ length: 6 }, (_, i) => `<rect y="${288 + i * 24}" width="390" height="1" fill="#55406a"/>`).join('')}
    <g transform="translate(320 330)"><rect x="-50" y="-40" width="100" height="44" rx="4" fill="#2b2230" stroke="#e3b553" stroke-width="2"/><rect x="-44" y="-52" width="10" height="12" rx="2" fill="#ff9fc6"/><rect x="-28" y="-54" width="8" height="14" rx="2" fill="#7ce0ff"/><circle cx="10" cy="-46" r="6" fill="#ffd36e"/></g>`,
};

export function venueSVG(venueId, people = []) {
  const scene = (SCENES[venueId] || SCENES.cafe)();
  const ppl = people.map((p) => renderAvatar(p.look.appearance, p.look.equipped, { shadow: true, label: p.name }).replace('<svg', `<svg x="${p.x - 62}" y="${(p.y || 404) - 276}" width="124" height="280" data-person="${p.id || ''}" class="vperson"`)).join('');
  return `<svg viewBox="0 0 390 420" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${scene}${ppl}</svg>`;
}
