/**
 * FURNITURE ART — procedural vector furniture (temporary art, see docs/ASSETS.md).
 *
 * drawFurniture(item, opts) returns SVG drawn around the item's anchor:
 *   floor items → anchor at bottom-centre, art spans x −w/2..w/2, y −h..0
 *   wall & rug  → anchor at centre, art spans x −w/2..w/2, y −h/2..h/2
 * Colours come from item.palette { main, accent, wood, fabric, metal }.
 */
import { darken, lighten } from '../../utils/color.js';
import { renderAvatar } from '../avatarRenderer.js';

const L = (c) => darken(c, 0.32);
const leg = (x, y, h, c, w = 4) => `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${c}" stroke="${L(c)}" stroke-width=".6"/>`;
const shine = (d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45"/>`;

const KIND_ART = {
  bed: (p) => `
    <path d="M -75 -18 L -75 -96 Q -75 -104 -67 -104 L 67 -104 Q 75 -104 75 -96 L 75 -18 Z" fill="${p.wood}" stroke="${L(p.wood)}"/>
    ${[-45, -15, 15, 45].map((x) => `<circle cx="${x}" cy="-84" r="2.4" fill="${p.accent}"/>`).join('')}
    <rect x="-78" y="-46" width="156" height="34" rx="8" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <rect x="-78" y="-56" width="156" height="16" rx="7" fill="#fffdfb" stroke="#eadfe6"/>
    <ellipse cx="-38" cy="-60" rx="26" ry="10" fill="#fff" stroke="#efe2ea"/><ellipse cx="34" cy="-60" rx="26" ry="10" fill="#fff" stroke="#efe2ea"/>
    <path d="M -78 -30 Q 0 -22 78 -30" stroke="${lighten(p.fabric, 0.4)}" stroke-width="2" fill="none"/>
    ${leg(-70, -12, 12, p.wood, 6)}${leg(70, -12, 12, p.wood, 6)}`,
  sofa: (p) => `
    <rect x="-66" y="-66" width="132" height="34" rx="12" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <rect x="-70" y="-40" width="140" height="28" rx="9" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <rect x="-72" y="-54" width="18" height="44" rx="8" fill="${lighten(p.fabric, 0.1)}" stroke="${L(p.fabric)}"/>
    <rect x="54" y="-54" width="18" height="44" rx="8" fill="${lighten(p.fabric, 0.1)}" stroke="${L(p.fabric)}"/>
    <path d="M 0 -40 L 0 -14" stroke="${L(p.fabric)}" stroke-width=".8" opacity=".5"/>
    <rect x="-46" y="-60" width="22" height="18" rx="5" fill="${p.accent}" stroke="${L(p.accent)}" transform="rotate(-8 -35 -51)"/>
    ${shine('M -60 -60 L -20 -60')}${leg(-62, -10, 10, p.wood)}${leg(62, -10, 10, p.wood)}`,
  armchair: (p) => `
    <path d="M -26 -40 Q -28 -70 0 -70 Q 28 -70 26 -40 Z" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <rect x="-30" y="-42" width="60" height="28" rx="9" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <rect x="-31" y="-50" width="12" height="36" rx="6" fill="${lighten(p.fabric, 0.1)}" stroke="${L(p.fabric)}"/>
    <rect x="19" y="-50" width="12" height="36" rx="6" fill="${lighten(p.fabric, 0.1)}" stroke="${L(p.fabric)}"/>
    ${shine('M -14 -62 Q 0 -66 14 -62')}${leg(-24, -14, 14, p.wood)}${leg(24, -14, 14, p.wood)}`,
  chair: (p) => `
    <path d="M -15 -64 L 15 -64 L 13 -34 L -13 -34 Z" fill="${p.wood}" stroke="${L(p.wood)}"/>
    <rect x="-11" y="-60" width="22" height="20" rx="5" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <rect x="-18" y="-36" width="36" height="9" rx="4" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    ${leg(-14, -28, 28, p.wood, 3.5)}${leg(14, -28, 28, p.wood, 3.5)}`,
  coffee_table: (p) => `
    <ellipse cx="0" cy="-30" rx="42" ry="7" fill="${p.main}" stroke="${L(p.main)}"/>
    <rect x="-38" y="-30" width="76" height="5" fill="${darken(p.main, 0.08)}"/>
    ${leg(-30, -26, 26, p.metal, 3)}${leg(30, -26, 26, p.metal, 3)}${leg(0, -26, 24, p.metal, 3)}
    <circle cx="-12" cy="-33" r="4" fill="${p.accent}"/><rect x="6" y="-36" width="14" height="4" rx="1" fill="${lighten(p.accent, 0.3)}"/>`,
  dining_table: (p) => `
    <rect x="-58" y="-50" width="116" height="10" rx="3" fill="${p.wood}" stroke="${L(p.wood)}"/>
    <rect x="-54" y="-41" width="108" height="5" fill="${darken(p.wood, 0.1)}"/>
    ${leg(-48, -38, 38, p.wood, 5)}${leg(48, -38, 38, p.wood, 5)}
    <path d="M -8 -50 L -6 -62 L 6 -62 L 8 -50 Z" fill="${p.accent}"/><circle cx="-4" cy="-66" r="4" fill="#ff9fc6"/><circle cx="4" cy="-67" r="4" fill="#fff"/>`,
  desk: (p) => `
    <rect x="-50" y="-62" width="100" height="9" rx="2" fill="${p.wood}" stroke="${L(p.wood)}"/>
    <rect x="16" y="-54" width="30" height="40" rx="2" fill="${p.wood}" stroke="${L(p.wood)}"/>
    <rect x="20" y="-50" width="22" height="14" rx="2" fill="${lighten(p.wood, 0.15)}"/><circle cx="31" cy="-43" r="1.6" fill="${p.metal}"/>
    ${leg(-44, -53, 53, p.wood, 5)}${leg(44, -14, 14, p.wood, 5)}
    <rect x="-36" y="-80" width="30" height="18" rx="2" fill="#2b2b2f"/><rect x="-34" y="-78" width="26" height="14" fill="#9fd2ff"/>
    <rect x="0" y="-70" width="10" height="8" rx="2" fill="${p.accent}"/>`,
  dressing_table: (p) => `
    <ellipse cx="0" cy="-90" rx="24" ry="26" fill="${p.metal}" stroke="${L(p.metal)}"/>
    <ellipse cx="0" cy="-90" rx="19" ry="21" fill="url(#mirrorGlass)"/>
    ${[-21, -12, 12, 21].map((x, i) => `<circle cx="${x}" cy="${-104 + (i % 3 === 0 ? 14 : 0)}" r="2.8" fill="#fff6c4" stroke="${p.metal}" stroke-width=".6"/>`).join('')}
    ${shine('M -10 -100 L -2 -108')}
    <rect x="-38" y="-62" width="76" height="9" rx="3" fill="${p.main}" stroke="${L(p.main)}"/>
    <rect x="-34" y="-54" width="68" height="22" rx="3" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <circle cx="-14" cy="-43" r="2" fill="${p.metal}"/><circle cx="14" cy="-43" r="2" fill="${p.metal}"/>
    ${leg(-31, -32, 32, p.main, 4)}${leg(31, -32, 32, p.main, 4)}
    <rect x="-26" y="-70" width="6" height="9" rx="2" fill="#ff5c97"/><rect x="-17" y="-68" width="5" height="7" rx="2" fill="#c9a7ff"/><circle cx="22" cy="-66" r="4" fill="#fff" stroke="${p.metal}"/>`,
  floor_mirror: (p) => `
    <rect x="-16" y="-116" width="32" height="104" rx="16" fill="${p.main}" stroke="${L(p.main)}"/>
    <rect x="-12" y="-112" width="24" height="96" rx="12" fill="url(#mirrorGlass)"/>
    ${shine('M -6 -96 L 4 -106 M -6 -80 L 8 -94')}
    <path d="M -10 -14 L -16 0 M 10 -14 L 16 0" stroke="${p.main}" stroke-width="4" stroke-linecap="round"/>`,
  wardrobe: (p) => `
    <path d="M -46 -186 L 0 -200 L 46 -186 Z" fill="${p.fabric}" stroke="${p.accent}" stroke-width="2"/>
    <rect x="-44" y="-186" width="88" height="180" rx="3" fill="${p.main}" stroke="${p.accent}" stroke-width="2"/>
    <rect x="-38" y="-178" width="35" height="164" rx="6" fill="${p.fabric}" stroke="${L(p.fabric)}" stroke-width=".8"/>
    <rect x="3" y="-178" width="35" height="164" rx="6" fill="${p.fabric}" stroke="${L(p.fabric)}" stroke-width=".8"/>
    <circle cx="-6" cy="-96" r="3" fill="${p.accent}"/><circle cx="6" cy="-96" r="3" fill="${p.accent}"/>
    <path d="M -28 -162 Q -20 -170 -12 -162 M 13 -162 Q 21 -170 29 -162" stroke="${p.accent}" stroke-width="2" fill="none"/>
    ${leg(-38, -6, 6, p.accent, 6)}${leg(38, -6, 6, p.accent, 6)}`,
  bookshelf: (p) => {
    let books = '';
    const cols = ['#c2193a', '#2d3d74', '#2f9a6a', '#e3b553', '#ff9fc6', '#9a6ee8', p.accent];
    for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) books += `<rect x="${-32 + i * 9}" y="${-150 + r * 36 + (i % 3)}" width="7" height="${28 - (i % 3)}" rx="1" fill="${cols[(i + r * 2) % cols.length]}"/>`;
    return `<rect x="-40" y="-160" width="80" height="160" rx="3" fill="${p.wood}" stroke="${L(p.wood)}"/>
      <rect x="-35" y="-154" width="70" height="148" fill="${darken(p.wood, 0.25)}"/>${books}
      ${[0, 1, 2, 3].map((r) => `<rect x="-36" y="${-121 + r * 36}" width="72" height="4" fill="${p.wood}"/>`).join('')}`;
  },
  tv_stand: (p) => `
    <rect x="-38" y="-80" width="76" height="46" rx="3" fill="#232028" stroke="#000"/>
    <rect x="-35" y="-77" width="70" height="40" fill="url(#tvGlow)"/>
    <rect x="-55" y="-30" width="110" height="26" rx="3" fill="${p.wood}" stroke="${L(p.wood)}"/>
    <rect x="-50" y="-26" width="46" height="18" rx="2" fill="${lighten(p.wood, 0.12)}"/><rect x="4" y="-26" width="46" height="18" rx="2" fill="${lighten(p.wood, 0.12)}"/>
    <rect x="-3" y="-34" width="6" height="4" fill="#232028"/>${leg(-50, -4, 4, p.metal)}${leg(50, -4, 4, p.metal)}`,
  piano: (p) => `
    <path d="M -70 -60 L 30 -60 Q 70 -60 70 -30 L 70 -26 L -70 -26 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    <path d="M -64 -60 L -10 -92 L -4 -88 L -48 -60 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    <rect x="-70" y="-30" width="62" height="10" fill="#fff" stroke="#ccc"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${-66 + i * 6.6}" y="-30" width="3" height="6" fill="#222"/>`).join('')}
    ${shine('M -40 -56 L 30 -56')}${leg(-62, -20, 20, p.main, 5)}${leg(60, -26, 26, p.main, 5)}${leg(10, -26, 26, p.main, 5)}
    <circle cx="0" cy="-58" r="2" fill="${p.accent}"/>`,
  floor_lamp: (p) => `
    <circle cx="0" cy="-104" r="30" fill="url(#lampGlow)"/>
    <path d="M -15 -122 L 15 -122 L 21 -96 L -21 -96 Z" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <rect x="-1.5" y="-96" width="3" height="90" fill="${p.metal}"/><ellipse cx="0" cy="-4" rx="12" ry="4" fill="${p.metal}" stroke="${L(p.metal)}"/>`,
  chandelier: (p) => `
    <circle cx="0" cy="8" r="34" fill="url(#lampGlow)"/>
    <path d="M 0 -31 L 0 -14" stroke="${p.metal}" stroke-width="2"/>
    <path d="M -30 0 Q 0 22 30 0" fill="none" stroke="${p.metal}" stroke-width="3"/>
    <path d="M -20 -14 L 20 -14 L 12 4 L -12 4 Z" fill="${p.metal}" stroke="${L(p.metal)}"/>
    ${[-30, -15, 0, 15, 30].map((x) => `<rect x="${x - 2}" y="${-6 + Math.abs(x) / 3}" width="4" height="9" rx="1" fill="#fffbe8"/><circle cx="${x}" cy="${-8 + Math.abs(x) / 3}" r="2.6" fill="#fff3a0"/>`).join('')}
    ${[-22, -8, 8, 22].map((x) => `<path d="M ${x} ${12 + (Math.abs(x) > 10 ? 0 : 6)} l -3 6 l 3 6 l 3 -6 Z" fill="${lighten(p.accent, 0.4)}" stroke="#fff" stroke-width=".5"/>`).join('')}`,
  rug: (p) => `<ellipse cx="0" cy="0" rx="85" ry="26" fill="${p.main}" stroke="${L(p.main)}" stroke-width="1"/>
    <ellipse cx="0" cy="0" rx="72" ry="20" fill="none" stroke="${p.accent}" stroke-width="2" stroke-dasharray="4 5"/>
    <ellipse cx="0" cy="0" rx="40" ry="10" fill="${lighten(p.main, 0.25)}" opacity=".7"/>`,
  curtains: (p) => `
    <rect x="-65" y="-84" width="130" height="7" rx="3" fill="${p.metal}"/><circle cx="-66" cy="-80" r="5" fill="${p.metal}"/><circle cx="66" cy="-80" r="5" fill="${p.metal}"/>
    <path d="M -62 -78 Q -40 0 -56 84 L -38 84 Q -44 10 -30 -40 Q -26 -60 -26 -78 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    <path d="M 62 -78 Q 40 0 56 84 L 38 84 Q 44 10 30 -40 Q 26 -60 26 -78 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    <path d="M -50 -70 Q -46 0 -50 76 M 50 -70 Q 46 0 50 76" stroke="${lighten(p.main, 0.4)}" stroke-width="2" fill="none"/>
    <path d="M -46 6 Q -36 2 -32 10 M 46 6 Q 36 2 32 10" stroke="${p.accent}" stroke-width="3" fill="none"/>`,
  wall_art: (p) => `
    <rect x="-27" y="-22" width="54" height="44" rx="3" fill="${p.accent === '#ffffff' ? '#f2c86a' : p.wood}" stroke="${L(p.wood)}"/>
    <rect x="-22" y="-17" width="44" height="34" fill="#fffaf5"/>
    <circle cx="-8" cy="-4" r="8" fill="${lighten(p.accent, 0.2)}"/><path d="M -22 17 L -6 2 L 4 10 L 12 2 L 22 14 L 22 17 Z" fill="${p.main === '#ffffff' ? '#9fdcae' : p.main}" opacity=".85"/>
    <path d="M 4 -10 Q 10 -14 16 -10" stroke="${p.accent}" stroke-width="2" fill="none"/>`,
  wall_mirror: (p) => `
    <ellipse cx="0" cy="0" rx="24" ry="30" fill="${p.metal}" stroke="${L(p.metal)}"/>
    <ellipse cx="0" cy="0" rx="19" ry="25" fill="url(#mirrorGlass)"/>${shine('M -10 -10 L -2 -18 M -10 2 L 4 -12')}
    <circle cx="0" cy="-30" r="4" fill="${p.accent}"/>`,
  wall_shelf: (p) => `
    <rect x="-46" y="4" width="92" height="7" rx="2" fill="${p.main}" stroke="${L(p.main)}"/>
    <path d="M -38 11 L -38 15 M 38 11 L 38 15" stroke="${L(p.main)}" stroke-width="3"/>
    <rect x="-38" y="-12" width="8" height="16" rx="1" fill="#c9a7ff"/><rect x="-29" y="-9" width="7" height="13" rx="1" fill="#ff9fc6"/>
    <circle cx="4" cy="-3" r="7" fill="${p.accent}"/><path d="M 20 4 L 24 -12 L 30 -12 L 34 4 Z" fill="#fff" stroke="#ddd"/><circle cx="27" cy="-15" r="4" fill="#7fcf98"/>`,
  trophy_shelf: (p, o) => {
    const cups = { 1: ['#ffd36e', '#c9932e'], 2: ['#e4e7ef', '#9aa1b3'], 3: ['#e7a978', '#a8673f'] };
    const list = [...(o.trophies || [])].sort((a, b) => (a.place - b.place) || (b.at - a.at)).slice(0, 5);
    const art = list.length ? list.map((t, i) => {
      const [c, d] = cups[t.place] || cups[3];
      const sc = t.tier === 'gala' ? 1.25 : t.tier === 'city' ? 1.1 : 1;
      return `<g transform="translate(${-40 + i * 20} 8) scale(${sc})"><rect x="-5" y="-4" width="10" height="4" fill="${d}"/><rect x="-1.5" y="-9" width="3" height="5" fill="${d}"/>
        <path d="M -7 -20 L 7 -20 L 5 -12 Q 0 -8 -5 -12 Z" fill="${c}" stroke="${d}" stroke-width=".8"/><path d="M -7 -18 Q -11 -17 -7 -13 M 7 -18 Q 11 -17 7 -13" fill="none" stroke="${d}" stroke-width="1.2"/></g>`;
    }).join('') : `<path d="M -22 8 L -18 -4 L -10 -4 L -6 8 Z M 14 8 L 18 -4 L 26 -4 L 30 8 Z" fill="#fbe9f2" stroke="#e9c" stroke-dasharray="2 2"/>`;
    return `${art}<rect x="-55" y="8" width="110" height="7" rx="2" fill="${p.main}" stroke="${p.accent}"/>
      <text x="0" y="24" text-anchor="middle" font-size="7.5" fill="#b07aa6" font-family="Quicksand, sans-serif" font-weight="700">${list.length ? `${(o.trophies || []).length} trophies` : 'win contests to fill me!'}</text>`;
  },
  portrait_frame: (p, o) => {
    const portrait = o.portrait || '';
    return `<rect x="-22" y="-26" width="44" height="52" rx="4" fill="${p.main}" stroke="${L(p.main)}"/><rect x="-18" y="-22" width="36" height="44" fill="#fff6fb"/>
      <g transform="translate(-17 -21)">${portrait}</g>`;
  },
  neon_sign: (p) => `
    <rect x="-45" y="-21" width="90" height="42" rx="10" fill="#1e1830" opacity=".85"/>
    <path d="M -24 -2 C -30 -12 -18 -16 -14 -8 C -10 -16 2 -12 -4 -2 L -14 8 Z" fill="none" stroke="${p.main}" stroke-width="3" filter="url(#neon)"/>
    <text x="16" y="5" text-anchor="middle" font-family="'Parisienne', cursive" font-size="17" fill="${p.accent}" stroke="${p.main}" stroke-width=".6" filter="url(#neon)">star</text>`,
  plant_big: (p) => `
    <path d="M -15 -28 L 15 -28 L 12 0 L -12 0 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    <path d="M -16 -30 L 16 -30 L 16 -25 L -16 -25 Z" fill="${darken(p.main, 0.06)}"/>
    ${[[-14, -58, -30], [12, -62, 30], [0, -76, 0], [-6, -48, -55], [8, -46, 55]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="20" fill="${p.accent}" stroke="${L(p.accent)}" transform="rotate(${r} ${x} ${y})"/>`).join('')}
    <path d="M 0 -30 L 0 -70 M 0 -40 L -12 -56 M 0 -42 L 12 -58" stroke="${L(p.accent)}" stroke-width="1.5"/>`,
  plant_small: (p) => `
    <path d="M -10 -16 L 10 -16 L 8 0 L -8 0 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    ${[[-6, -26], [0, -32], [6, -26], [-3, -22], [4, -21]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${p.accent}" stroke="${L(p.accent)}" stroke-width=".6"/>`).join('')}
    <path d="M 0 -16 L 0 -28" stroke="#4f9a68" stroke-width="1.5"/>`,
  hanging_plant: (p) => `
    <path d="M 0 -32 L -12 -6 M 0 -32 L 12 -6" stroke="${p.main}" stroke-width="1.2"/>
    <path d="M -14 -6 L 14 -6 L 10 10 L -10 10 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    ${[-12, -6, 0, 6, 12].map((x, i) => `<path d="M ${x} 6 Q ${x + (i % 2 ? 4 : -4)} 18 ${x} ${24 + (i % 3) * 6}" stroke="${p.accent}" stroke-width="3" fill="none"/><circle cx="${x}" cy="${26 + (i % 3) * 6}" r="3" fill="${p.accent}"/>`).join('')}`,
  vase: (p) => `
    <path d="M -9 -26 Q -14 -12 -9 0 L 9 0 Q 14 -12 9 -26 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    ${[[-6, -38], [0, -44], [6, -37], [-1, -33]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${p.accent}" stroke="${L(p.accent)}" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="1.6" fill="${lighten(p.accent, 0.5)}"/>`).join('')}
    <path d="M -4 -26 L -5 -36 M 2 -26 L 0 -40 M 5 -26 L 6 -34" stroke="#4f9a68" stroke-width="1.4"/>`,
  teddy: (p) => `
    <ellipse cx="0" cy="-12" rx="13" ry="12" fill="${p.main}" stroke="${L(p.main)}"/>
    <circle cx="0" cy="-28" r="10" fill="${p.main}" stroke="${L(p.main)}"/>
    <circle cx="-8" cy="-36" r="4" fill="${p.main}" stroke="${L(p.main)}"/><circle cx="8" cy="-36" r="4" fill="${p.main}" stroke="${L(p.main)}"/>
    <ellipse cx="0" cy="-25" rx="4.5" ry="3.5" fill="${lighten(p.main, 0.4)}"/><circle cx="-3.5" cy="-30" r="1.3" fill="#2a1420"/><circle cx="3.5" cy="-30" r="1.3" fill="#2a1420"/>
    <path d="M -6 -19 L 0 -16 L 6 -19 L 0 -21 Z" fill="${p.accent}"/>
    <ellipse cx="-9" cy="-2" rx="5" ry="3.5" fill="${p.main}" stroke="${L(p.main)}"/><ellipse cx="9" cy="-2" rx="5" ry="3.5" fill="${p.main}" stroke="${L(p.main)}"/>`,
  candles: (p) => `
    <ellipse cx="0" cy="-2" rx="17" ry="3" fill="${p.accent}"/>
    ${[[-9, 18], [0, 26], [9, 14]].map(([x, hh]) => `<rect x="${x - 4}" y="${-2 - hh}" width="8" height="${hh}" rx="2" fill="${p.main}" stroke="#e8dcc8"/><path d="M ${x} ${-6 - hh} q -3 -4 0 -8 q 3 4 0 8 Z" fill="#ffb84d"/><circle cx="${x}" cy="${-8 - hh}" r="6" fill="url(#lampGlow)"/>`).join('')}`,
  globe: (p) => `
    <circle cx="0" cy="-36" r="15" fill="#7cc6f2" stroke="${L(p.accent)}"/><path d="M -10 -44 Q -2 -40 -6 -32 Q 2 -30 4 -24 M 4 -48 Q 10 -42 12 -36" stroke="#5fb37f" stroke-width="4" fill="none"/>
    <path d="M -17 -48 A 17 17 0 0 1 17 -26" fill="none" stroke="${p.accent}" stroke-width="2"/>
    <rect x="-1.5" y="-21" width="3" height="16" fill="${p.wood}"/><ellipse cx="0" cy="-4" rx="11" ry="4" fill="${p.wood}" stroke="${L(p.wood)}"/>`,
  kitchen_counter: (p) => `
    <rect x="-75" y="-96" width="150" height="34" rx="2" fill="${p.main}" stroke="${L(p.main)}"/>
    <rect x="-71" y="-92" width="70" height="26" rx="2" fill="${lighten(p.main, 0.1)}" stroke="${L(p.main)}" stroke-width=".6"/><rect x="3" y="-92" width="68" height="26" rx="2" fill="${lighten(p.main, 0.1)}" stroke="${L(p.main)}" stroke-width=".6"/>
    <rect x="-76" y="-48" width="152" height="6" rx="1" fill="${p.fabric}" stroke="${L(p.fabric)}"/>
    <rect x="-74" y="-42" width="148" height="40" rx="2" fill="${p.main}" stroke="${L(p.main)}"/>
    ${[-55, -18, 18, 55].map((x) => `<rect x="${x - 15}" y="-38" width="30" height="32" rx="2" fill="${lighten(p.main, 0.08)}" stroke="${L(p.main)}" stroke-width=".6"/><rect x="${x - 6}" y="-30" width="12" height="2.5" rx="1" fill="${p.metal}"/>`).join('')}
    <rect x="-20" y="-54" width="28" height="6" rx="2" fill="#2b2b2f"/><circle cx="-14" cy="-51" r="2" fill="#555"/><circle cx="2" cy="-51" r="2" fill="#555"/>
    <path d="M 40 -48 L 40 -60 Q 40 -64 46 -64" stroke="${p.metal}" stroke-width="2.5" fill="none"/><rect x="28" y="-52" width="24" height="4" rx="2" fill="${p.metal}"/>
    <rect x="-60" y="-56" width="10" height="8" rx="2" fill="#ff9fc6"/><circle cx="62" cy="-54" r="5" fill="#ffd36e"/>`,
  fridge: (p) => `
    <rect x="-26" y="-136" width="52" height="132" rx="10" fill="${p.main}" stroke="${L(p.main)}"/>
    <path d="M -26 -90 L 26 -90" stroke="${L(p.main)}" stroke-width="1.2"/>
    <rect x="16" y="-124" width="4" height="22" rx="2" fill="${p.accent}"/><rect x="16" y="-82" width="4" height="34" rx="2" fill="${p.accent}"/>
    ${shine('M -18 -126 L -18 -96 M -18 -80 L -18 -20')}<rect x="-10" y="-70" width="10" height="10" rx="2" fill="#ff7eb6" transform="rotate(-8 -5 -65)"/>
    ${leg(-18, -4, 4, '#999')}${leg(18, -4, 4, '#999')}`,
  bathtub: (p) => `
    <path d="M -66 -46 L 66 -46 Q 64 -14 40 -12 L -40 -12 Q -64 -14 -66 -46 Z" fill="${p.main}" stroke="${L(p.accent)}"/>
    <rect x="-68" y="-50" width="136" height="6" rx="3" fill="${p.main}" stroke="${L(p.accent)}"/>
    <path d="M -58 -48 Q -40 -54 -20 -48 Q 0 -54 20 -48 Q 40 -54 58 -48" fill="#e3f4ff" stroke="#fff"/>
    ${[-50, -30, 30, 50].map((x, i) => `<circle cx="${x}" cy="${-56 - (i % 2) * 4}" r="5" fill="#fff" opacity=".9"/>`).join('')}
    <path d="M 52 -50 L 52 -64 Q 52 -70 58 -70 L 62 -70" stroke="${p.accent}" stroke-width="3" fill="none"/>
    <path d="M -50 -12 Q -54 -4 -58 0 M 50 -12 Q 54 -4 58 0" stroke="${p.accent}" stroke-width="4" stroke-linecap="round"/>`,
  sink_vanity: (p) => `
    <rect x="-24" y="-98" width="48" height="36" rx="18" fill="${p.accent}"/><rect x="-20" y="-94" width="40" height="28" rx="14" fill="url(#mirrorGlass)"/>
    <rect x="-36" y="-56" width="72" height="8" rx="2" fill="#f7f5f2" stroke="#ddd"/><ellipse cx="0" cy="-54" rx="16" ry="3" fill="#dfe9f2"/>
    <path d="M 0 -56 L 0 -64 Q 0 -66 4 -66" stroke="${p.accent}" stroke-width="2.5" fill="none"/>
    <rect x="-34" y="-48" width="68" height="40" rx="2" fill="${p.main}" stroke="${L(p.main)}"/>
    <rect x="-30" y="-44" width="30" height="32" rx="2" fill="${lighten(p.main, 0.1)}"/><rect x="0" y="-44" width="30" height="32" rx="2" fill="${lighten(p.main, 0.1)}"/>
    <circle cx="-4" cy="-28" r="1.8" fill="${p.accent}"/><circle cx="4" cy="-28" r="1.8" fill="${p.accent}"/>${leg(-28, -8, 8, p.main)}${leg(28, -8, 8, p.main)}`,
  towel_rail: (p) => `
    <rect x="-30" y="-16" width="60" height="4" rx="2" fill="${p.main}"/><circle cx="-30" cy="-14" r="3" fill="${p.main}"/><circle cx="30" cy="-14" r="3" fill="${p.main}"/>
    <path d="M -24 -14 L -24 18 Q -14 22 -4 18 L -4 -14 Z" fill="${p.accent}" stroke="${L(p.accent)}"/><path d="M 2 -14 L 2 12 Q 12 16 24 12 L 24 -14 Z" fill="#fff" stroke="#ddd"/>
    <path d="M -24 10 L -4 10 M 2 6 L 24 6" stroke="#fff" stroke-width="2" opacity=".7"/>`,
  sun_lounger: (p) => `
    <path d="M -60 -18 L 30 -18 L 58 -42 L 62 -38 L 36 -12 L -60 -12 Z" fill="${p.wood}" stroke="${L(p.wood)}"/>
    <path d="M -56 -24 L 30 -24 L 54 -44 L 58 -40 L 34 -18 L -56 -18 Z" fill="${p.accent}" stroke="${L(p.accent)}"/>
    <path d="M -40 -24 L -40 -18 M -20 -24 L -20 -18 M 0 -24 L 0 -18" stroke="#fff" stroke-width="2" opacity=".6"/>
    ${leg(-52, -12, 12, p.wood, 4)}${leg(26, -12, 12, p.wood, 4)}`,
  parasol: (p) => `
    <path d="M -44 -100 Q 0 -134 44 -100 Z" fill="${p.main}" stroke="${L(p.main)}"/>
    ${[-30, -10, 10, 30].map((x, i) => `<path d="M ${x - 7} ${-104 - (i === 1 || i === 2 ? 14 : 4)} L ${x + 3} ${-100} L ${x - 10} ${-100} Z" fill="${p.accent}" opacity=".9"/>`).join('')}
    <path d="M -44 -100 Q -38 -94 -32 -100 Q -24 -94 -16 -100 Q -8 -94 0 -100 Q 8 -94 16 -100 Q 24 -94 32 -100 Q 38 -94 44 -100" fill="${p.main}" stroke="${L(p.main)}"/>
    <rect x="-1.5" y="-118" width="3" height="114" fill="#ddd" stroke="#bbb" stroke-width=".5"/><ellipse cx="0" cy="-3" rx="12" ry="4" fill="#bbb"/>`,
  patio_set: (p) => `
    <ellipse cx="0" cy="-40" rx="24" ry="6" fill="${p.main}" stroke="${L(p.accent)}"/><rect x="-1.5" y="-36" width="3" height="34" fill="${L(p.main)}"/>
    <path d="M -10 -2 L 10 -2" stroke="${L(p.main)}" stroke-width="3"/>
    <circle cx="-6" cy="-44" r="3" fill="${p.accent}"/><rect x="2" y="-48" width="6" height="6" rx="1" fill="#fff" stroke="#ddd"/>
    ${[-40, 40].map((x) => `<g transform="translate(${x} 0)"><path d="M -10 -50 Q 0 -60 10 -50 L 10 -30 L -10 -30 Z" fill="none" stroke="${L(p.main)}" stroke-width="2.5"/><rect x="-12" y="-30" width="24" height="5" rx="2" fill="${p.accent}"/>${leg(-9, -25, 25, L(p.main), 2.5)}${leg(9, -25, 25, L(p.main), 2.5)}</g>`).join('')}`,
  lantern: (p) => `
    <circle cx="0" cy="-44" r="16" fill="url(#lampGlow)"/><path d="M -7 -56 L 7 -56 L 9 -36 L -9 -36 Z" fill="${p.accent}" stroke="${p.main}" stroke-width="2"/>
    <path d="M -9 -58 L 0 -64 L 9 -58 Z" fill="${p.main}"/><rect x="-1.5" y="-36" width="3" height="34" fill="${p.main}"/><ellipse cx="0" cy="-2" rx="6" ry="2.5" fill="${p.main}"/>`,
};

/** Shared gradients/filters furniture art references — include once per room SVG. */
export function furnitureDefs() {
  return `<linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f6ff"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#d7ecfb"/></linearGradient>
    <radialGradient id="lampGlow"><stop offset="0" stop-color="#fff5c4" stop-opacity=".85"/><stop offset="1" stop-color="#fff5c4" stop-opacity="0"/></radialGradient>
    <linearGradient id="tvGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cc6f2"/><stop offset="1" stop-color="#c9a7ff"/></linearGradient>
    <filter id="neon" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

/** Player portrait for portrait frames (34 × 42). */
export function portraitFor(state) {
  return renderAvatar(state.appearance, state.equipped, { viewBox: '58 14 84 96', shadow: false, align: 'xMidYMid' }).replace('<svg', '<svg x="0" y="0" width="34" height="42"');
}

export function drawFurniture(item, opts = {}) {
  const fn = KIND_ART[item.kind];
  return fn ? fn(item.palette, opts) : `<rect x="${-item.w / 2}" y="${-item.h}" width="${item.w}" height="${item.h}" fill="#eee"/>`;
}

/** Stand-alone thumbnail SVG for shop cards & the decorating drawer. */
export function furnitureThumb(item, opts = {}) {
  const pad = 10;
  const box = item.placement === 'floor' ? `${-item.w / 2 - pad} ${-item.h - pad} ${item.w + pad * 2} ${item.h + pad * 2}` : `${-item.w / 2 - pad} ${-item.h / 2 - pad} ${item.w + pad * 2} ${item.h + pad * 2}`;
  return `<svg viewBox="${box}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><defs>${furnitureDefs()}</defs>${drawFurniture(item, opts)}</svg>`;
}
