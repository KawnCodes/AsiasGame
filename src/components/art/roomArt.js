/**
 * ROOM ART — the starter apartment interior (procedural vector illustration).
 * Coordinates: 390 × 420 viewBox. Furniture anchor points are exported so the
 * home screen can place hotspots and (Milestone 4) the decorating system can
 * replace these fixed pieces with placeable furniture.
 */
import { renderAvatar } from '../avatarRenderer.js';

export const ROOM_W = 390;
export const ROOM_H = 420;

export const HOTSPOTS = [
  { id: 'wardrobe', label: 'Wardrobe', x: 342, y: 150 },
  { id: 'vanity', label: 'Vanity', x: 268, y: 196 },
  { id: 'mirror', label: 'Mirror', x: 162, y: 270 },
  { id: 'bed', label: 'Bed', x: 72, y: 262 },
  { id: 'gift', label: 'Daily gift', x: 104, y: 352 },
];

export function roomSVG(state) {
  const portrait = renderAvatar(state.appearance, state.equipped, { viewBox: '58 14 84 96', shadow: false, align: 'xMidYMid' }).replace('<svg', '<svg x="0" y="0" width="34" height="38"');
  return `<svg viewBox="0 0 ${ROOM_W} ${ROOM_H}" xmlns="http://www.w3.org/2000/svg" class="room-svg">
  <defs>
    <pattern id="wallpaper" patternUnits="userSpaceOnUse" width="26" height="26">
      <rect width="26" height="26" fill="#ffe3ef"/><rect width="13" height="26" fill="#ffd6e7"/>
      <path d="M 19.5 9 C 18 7.6 16 8.6 17 10.6 C 17.6 11.8 19.5 13 19.5 13 C 19.5 13 21.4 11.8 22 10.6 C 23 8.6 21 7.6 19.5 9 Z" fill="#fff" opacity=".8"/>
    </pattern>
    <pattern id="floor" patternUnits="userSpaceOnUse" width="60" height="20">
      <rect width="60" height="20" fill="#e9c9a8"/><rect width="60" height="1.5" fill="#d7b08d"/><rect x="30" y="0" width="1.5" height="20" fill="#d7b08d"/>
    </pattern>
    <linearGradient id="winSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc6dd"/><stop offset=".6" stop-color="#ffe7c9"/><stop offset="1" stop-color="#fff5e0"/></linearGradient>
    <radialGradient id="lampGlow"><stop offset="0" stop-color="#fff5c4" stop-opacity=".9"/><stop offset="1" stop-color="#fff5c4" stop-opacity="0"/></radialGradient>
    <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f6ff"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#d7ecfb"/></linearGradient>
  </defs>
  <!-- walls & floor -->
  <rect width="${ROOM_W}" height="292" fill="url(#wallpaper)"/>
  <rect y="0" width="${ROOM_W}" height="14" fill="#fff"/><rect y="12" width="${ROOM_W}" height="4" fill="#f2c86a"/>
  <rect y="278" width="${ROOM_W}" height="16" fill="#fff"/>
  <path d="M 0 292 L ${ROOM_W} 292 L ${ROOM_W} ${ROOM_H} L 0 ${ROOM_H} Z" fill="url(#floor)"/>
  <ellipse cx="200" cy="372" rx="128" ry="34" fill="#c9a7ff" opacity=".85"/>
  <ellipse cx="200" cy="372" rx="112" ry="27" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 5"/>

  <!-- window -->
  <g>
    <rect x="140" y="44" width="88" height="124" rx="44" fill="#fff"/>
    <rect x="147" y="51" width="74" height="112" rx="37" fill="url(#winSky)"/>
    <g fill="#f3b3cf"><rect x="152" y="118" width="12" height="45"/><rect x="166" y="100" width="14" height="63"/><rect x="182" y="124" width="10" height="39"/><rect x="194" y="108" width="14" height="55"/><rect x="209" y="128" width="8" height="35"/></g>
    <g fill="#fff6c8"><rect x="169" y="106" width="3" height="4"/><rect x="174" y="116" width="3" height="4"/><rect x="197" y="114" width="3" height="4"/><rect x="202" y="126" width="3" height="4"/></g>
    <path d="M 184 51 L 184 163 M 147 106 L 221 106" stroke="#fff" stroke-width="4"/>
    <path d="M 132 38 Q 150 100 136 176 L 124 176 Q 128 100 124 38 Z" fill="#ff8fbd" stroke="#e86aa3"/>
    <path d="M 236 38 Q 218 100 232 176 L 244 176 Q 240 100 244 38 Z" fill="#ff8fbd" stroke="#e86aa3"/>
    <rect x="118" y="32" width="132" height="8" rx="4" fill="#f2c86a"/>
    <rect x="132" y="166" width="104" height="8" rx="3" fill="#fff"/>
    <g transform="translate(150 162)"><rect x="0" y="-12" width="14" height="12" rx="2" fill="#fff" stroke="#e9c"/><circle cx="7" cy="-16" r="6" fill="#9fdcae"/><circle cx="4" cy="-19" r="2.4" fill="#ff7eb6"/><circle cx="10" cy="-15" r="2" fill="#ffd36e"/></g>
  </g>

  <!-- wall gallery: framed photos of the player -->
  <g>
    <rect x="22" y="40" width="44" height="50" rx="4" fill="#f2c86a"/><rect x="26" y="44" width="36" height="42" fill="#fff6fb"/>
    <g transform="translate(27 46)">${portrait}</g>
    <rect x="76" y="54" width="40" height="34" rx="4" fill="#fff" stroke="#f2c86a" stroke-width="3"/>
    <path d="M 82 82 L 92 68 L 99 76 L 104 70 L 112 82 Z" fill="#9fdcae"/><circle cx="104" cy="62" r="4" fill="#ffd36e"/>
  </g>
  <!-- trophy shelf -->
  <g>
    <rect x="18" y="128" width="104" height="7" rx="2" fill="#fff" stroke="#e8c26e"/>
    <path d="M 40 128 L 44 116 L 52 116 L 56 128 Z M 80 128 L 84 116 L 92 116 L 96 128 Z" fill="#fbe9f2" stroke="#e9c" stroke-dasharray="2 2"/>
    <text x="70" y="148" text-anchor="middle" font-size="8" fill="#b07aa6" font-family="Quicksand, sans-serif" font-weight="700">trophies go here!</text>
  </g>

  <!-- bed -->
  <g>
    <path d="M 8 300 L 8 214 Q 8 192 30 192 L 120 192 Q 142 192 142 214 L 142 300 Z" fill="#fff" stroke="#f0c6da" stroke-width="2"/>
    <g fill="#ffd6e7">${[30, 58, 86, 114].map((x) => `<circle cx="${x}" cy="210" r="3"/><circle cx="${x - 14}" cy="226" r="3"/>`).join('')}</g>
    <rect x="4" y="262" width="150" height="56" rx="10" fill="#c9a7ff"/>
    <rect x="4" y="252" width="150" height="20" rx="8" fill="#fff"/>
    <ellipse cx="44" cy="248" rx="26" ry="11" fill="#fff" stroke="#f0d6e4"/>
    <path d="M 102 252 C 96 242 106 234 112 242 C 118 234 128 242 122 252 L 112 262 Z" fill="#ff7eb6"/>
    <path d="M 4 290 Q 80 300 154 290" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
    <rect x="12" y="318" width="8" height="12" fill="#e9c9a8"/><rect x="138" y="318" width="8" height="12" fill="#e9c9a8"/>
  </g>

  <!-- wardrobe -->
  <g>
    <path d="M 300 84 L 384 84 L 384 300 L 300 300 Z" fill="#fff8f0" stroke="#e8c26e" stroke-width="2"/>
    <path d="M 296 84 L 342 66 L 388 84 Z" fill="#ffd6e7" stroke="#e8c26e" stroke-width="2"/>
    <circle cx="342" cy="79" r="5" fill="#f2c86a"/>
    <rect x="306" y="94" width="33" height="196" rx="6" fill="#ffe9f2" stroke="#f3cadc"/>
    <rect x="345" y="94" width="33" height="196" rx="6" fill="#ffe9f2" stroke="#f3cadc"/>
    <circle cx="336" cy="190" r="3" fill="#f2c86a"/><circle cx="348" cy="190" r="3" fill="#f2c86a"/>
    <path d="M 316 112 Q 322 104 330 112 M 355 112 Q 361 104 369 112" stroke="#f3a9c8" stroke-width="2" fill="none"/>
  </g>

  <!-- vanity -->
  <g>
    <ellipse cx="268" cy="196" rx="24" ry="30" fill="#f2c86a"/>
    <ellipse cx="268" cy="196" rx="19" ry="25" fill="url(#mirrorGlass)"/>
    <path d="M 256 184 L 264 176 M 258 194 L 272 180" stroke="#fff" stroke-width="2.5"/>
    <rect x="234" y="226" width="68" height="10" rx="3" fill="#fff" stroke="#f0c6da"/>
    <rect x="238" y="236" width="60" height="26" rx="3" fill="#ffe3ef" stroke="#f0c6da"/>
    <rect x="240" y="262" width="5" height="34" fill="#fff" stroke="#f0c6da"/><rect x="291" y="262" width="5" height="34" fill="#fff" stroke="#f0c6da"/>
    <rect x="246" y="216" width="6" height="10" rx="2" fill="#ff5c97"/><rect x="255" y="219" width="5" height="7" rx="2" fill="#c9a7ff"/>
    <circle cx="288" cy="221" r="5" fill="#fff" stroke="#f2c86a"/>
    <ellipse cx="268" cy="306" rx="14" ry="6" fill="#ff9fc6"/><rect x="266" y="306" width="4" height="12" fill="#f2c86a"/>
  </g>

  <!-- standing mirror -->
  <g>
    <rect x="148" y="214" width="30" height="96" rx="15" fill="#f2c86a"/>
    <rect x="152" y="218" width="22" height="88" rx="11" fill="url(#mirrorGlass)"/>
    <path d="M 156 236 L 166 226 M 156 252 L 170 238" stroke="#fff" stroke-width="2.5"/>
    <path d="M 154 308 L 146 326 M 172 308 L 180 326" stroke="#f2c86a" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- daily gift box -->
  <g transform="translate(88 336)">
    <rect x="0" y="10" width="32" height="24" rx="3" fill="#ff7eb6" stroke="#d14e8b"/>
    <rect x="-2" y="4" width="36" height="9" rx="2" fill="#ff9fc6" stroke="#d14e8b"/>
    <rect x="13" y="4" width="6" height="30" fill="#fff3b0"/>
    <path d="M 16 4 C 6 -6 2 2 12 4 Z M 16 4 C 26 -6 30 2 20 4 Z" fill="#fff3b0" stroke="#e3b553"/>
  </g>
  <!-- floor lamp & plant -->
  <circle cx="372" cy="226" r="40" fill="url(#lampGlow)"/>
  <g><rect x="12" y="330" width="22" height="22" rx="4" fill="#fff" stroke="#f0c6da"/>
    <path d="M 23 330 C 10 312 6 300 14 298 C 18 308 22 316 23 330 C 24 314 26 298 34 296 C 40 304 32 318 23 330 Z" fill="#7fcf98"/></g>
</svg>`;
}
