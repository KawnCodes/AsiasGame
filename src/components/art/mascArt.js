/**
 * MASCULINE CHARACTER TEMPLATE — body, face tweaks, short hairstyles and menswear shapes
 * for male characters (love interests, visitors). Same 200 × 440 frame and anchor points
 * as the main template (docs/ASSETS.md); shoulders are broader and the torso straighter.
 * Rendered by avatarRenderer when appearance.body === 'masc'. (Temporary procedural art.)
 */
import { symClosed, mirrorPath, sym } from '../../utils/svgPath.js';

export const M_TORSO = symClosed('M 100 121 C 94 121 91 122 89 124 C 78 126 68 130 64 138 C 61 150 64 166 69 178 C 73 190 80 198 83 206 C 82 216 81 226 81 236 C 84 246 92 252 100 254');
export const M_NECK = 'M 91 96 L 109 96 L 110.5 127 C 104 131 96 131 89.5 127 Z';
export const M_LEG_L = 'M 81 232 C 79 262 83 292 85 322 C 84 352 86 382 88 404 L 97 404 C 98 380 99 352 97.5 322 C 99.5 292 101 268 100.5 252 Z';
export const M_FOOT_L = 'M 87 400 C 85 410 86 422 89 429 C 92 433 98.5 433 98.5 427 L 97.5 400 Z';
export const M_ARM_L = 'M 67 133 C 58 137 55 150 56 166 C 56 180 55 192 54 202 C 52 220 51 236 50 250 L 60 251 C 61 236 63 220 65.5 202 C 67 190 69 178 71 166 C 73 158 76 151 79 146 Z';
export const M_HAND_L = 'M 50.5 248 C 45.5 254 45 265 48.5 272.5 C 50.5 277 55.5 277.5 57.5 273 C 58.5 269 58 265.5 59.5 261.5 C 60.8 257.5 60.8 253 60 250 Z';
export const M_FACE = symClosed('M 100 24 C 84 24 70.5 36 70.5 58 C 70.5 76 74 90 82 99 C 89 105 95 107.5 100 107.5');
export const M_BROW = 'M 76.5 53 C 82 49 90 48.5 96.8 50.5 C 97 52.6 96.3 53.8 95 53.8 C 89 52.4 83 53 76.5 55.8 Z';
export const M_LIPS = {
  up: 'M 92 90.4 C 95 88.6 97.6 88.2 100 89.2 C 102.4 88.2 105 88.6 108 90.4 C 103 91.2 97 91.2 92 90.4 Z',
  low: 'M 92 90.4 C 95 94.6 105 94.6 108 90.4 C 103 91.4 97 91.4 92 90.4 Z',
  line: 'M 92 90.4 C 97 91.3 103 91.3 108 90.4',
};

const cap = (bottom) => symClosed(`M 100 16 C 79 16 65 30 65 58 C 65 68 66 ${bottom - 8} 68 ${bottom} C 80 ${bottom - 4} 90 ${bottom - 4} 100 ${bottom - 4}`);
const curls = (pts, r) => pts.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr || r}"/>`).join('');

/** Short hairstyles (merged into the main hairstyle table; not sold in the salon). */
export const MASC_HAIR = {
  m_crop: {
    back: [cap(80)],
    front: [symClosed('M 100 17 C 80 17 66 29 66 53 C 66 61 67 67 68.5 72 C 70 66 71.5 60 73.5 55 C 78 46 88 41.5 100 41')],
    shine: ['M 84 24 C 96 20 110 21 120 27'],
  },
  m_quiff: {
    back: [cap(80)],
    front: ['M 67 70 C 64 46 70 24 86 15 C 98 7 121 8 131 21 C 137 30 136 47 134 70 C 133 64 132 58 129 52 C 122 41 111 38 100 40 C 88 42 77 46 71.5 56 C 69.5 62 68 66 67 70 Z'],
    shine: ['M 92 14 C 104 10 118 13 126 22', 'M 84 26 C 96 20 110 22 118 30'],
  },
  m_curls: {
    back: [cap(82)],
    front: [symClosed('M 100 18 C 80 18 66 30 66 54 C 66 61 67 67 68.5 72 C 70 66 71.5 60 73.5 55 C 78 46 88 42 100 42')],
    frontCircles: curls([[72, 40], [80, 30], [91, 24], [100, 22], [109, 24], [120, 30], [128, 40], [68, 52], [132, 52], [86, 36], [114, 36], [100, 32]], 7.5),
    shine: [],
  },
  m_wavy: {
    back: [symClosed('M 100 15 C 77 15 62 30 62 58 C 62 76 62 92 66 104 C 76 108 90 107 100 106')],
    front: ['M 66 74 C 61 46 75 16 101 16 C 127 16 140 38 136 66 C 136 80 136 92 132 102 C 129 96 128 84 127 72 C 124 56 114 46 98 42 C 90 48 82 54 76 64 C 74 76 73 90 70 102 C 67 96 66 86 66 74 Z'],
    shine: ['M 84 22 C 74 30 70 42 68 56', 'M 112 22 C 124 28 130 38 132 50'],
  },
  m_buzz: {
    back: [],
    front: [symClosed('M 100 21 C 82 21 69 32 68 52 C 68 56 68.5 60 69 63 C 71 56 76 48 86 45 C 92 44 96 44 100 44')],
    shine: [],
  },
  m_bun: {
    back: [cap(80)],
    front: [symClosed('M 100 17 C 80 17 66 30 66 54 C 66 61 67 67 68.5 72 C 70.5 66 72 60 74 55 C 79 45 89 40 100 39')],
    extraHair: () => '<circle cx="100" cy="14" r="11"/>',
    shine: ['M 86 24 C 96 20 108 21 116 26'],
  },
};

// ------------------------------------------------------------------ menswear shapes
const M_TEE_BODY = (hem = 224) => symClosed(`M 100 130 C 95 130 92 127 90 123.5 C 78 125.5 68 129.5 64 137.5 C 61 150 64 166 69 178 C 73 190 80 198 82.5 206 C 82 212 81.5 ${hem - 6} 81 ${hem - 2} C 88 ${hem} 94 ${hem} 100 ${hem}`);
const M_SHORT = sym('M 67 132 C 57 136 54 150 55 168 C 60 171 66 172 71.5 171 C 73 160 76 152 79 146 Z');
const M_ROLLED = sym('M 67 132 C 57 136 54 150 55 166 C 55 180 54.5 190 54 202 C 59 205 64 205 66.5 203 C 68 190 69.5 178 71 166 C 73 158 76 151 79 146 Z');
const M_LONG = sym('M 67 132 C 57 136 54.5 150 55.5 166 C 55.5 180 54.5 192 53.5 202 C 51.5 220 50.5 234 49.5 246 C 53.5 249.5 58.5 250 61.5 247.5 C 62.5 233 64.5 219 66.5 202 C 68 190 69.5 178 71 166 C 73 158 76 151 79 146 Z');
const M_JACKET_SLEEVE = sym('M 66 131 C 56 135 53 150 54 166 C 54 180 53 192 52 202 C 50 220 49 234 48 246 C 52.5 250 59 250.5 62.5 248 C 63.5 233 65.5 219 67.5 202 C 69 190 70.5 178 72 166 C 74 158 77 151 80 146 Z');
const lines = (arr, c, w = 0.8, op = 0.6) => `<path d="${arr.join(' ')}" fill="none" stroke="${c.line}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
const buttons = (pts, c) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="${c.accent}" stroke="${c.line}" stroke-width=".4"/>`).join('');
const legs = (hem = 402, wide = 0) => sym(`M 81 206 L 100 206 L 101 254 C 99.5 280 99 300 98 322 C 99 350 ${99 + wide / 2} 378 ${98.5 + wide / 2} ${hem} L ${86 - wide} ${hem} C ${84.5 - wide / 2} 380 82 350 83.5 322 C 81 292 78 262 79.5 236 C 80 224 80.5 214 81 206 Z`);

export const MASC_SHAPES = {
  m_tee: { slot: 'top', body: [M_TEE_BODY()], sleeves: [M_SHORT], details: (c) => lines(['M 90.5 124 C 95 131 105 131 109.5 124'], c, 1.2, 0.7) },
  m_shirt: {
    slot: 'top', body: [M_TEE_BODY(226)], sleeves: [M_ROLLED],
    details: (c) => `<path d="${sym('M 90 123.5 C 92 131 95 135 100 137 C 97 131 94.5 127 93 123 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>${buttons([[100, 148], [100, 164], [100, 180], [100, 196], [100, 212]], c)}${lines([sym('M 54.5 197 C 59 200 64 200 67 198')], c, 1.4, 0.7)}`,
  },
  m_knit: {
    slot: 'top', body: [M_TEE_BODY(226)], sleeves: [M_LONG],
    details: (c) => lines(['M 90 124 C 95 132 105 132 110 124', 'M 82 220 L 118 220', sym('M 50 240 C 54 243 59 243 62 241')], c, 1.2, 0.55),
  },
  m_hoodie: {
    slot: 'top', body: [M_TEE_BODY(228)], sleeves: [M_LONG],
    details: (c) => `<path d="${sym('M 88 124 C 82 128 82 136 92 138 C 96 139 100 139 100 139')}" fill="none" stroke="${c.line}" stroke-width="1.2" opacity=".6"/><path d="M 86 196 L 114 196 L 118 214 L 82 214 Z" fill="none" stroke="${c.line}" stroke-width="1" opacity=".55"/><path d="M 96 136 L 95 158 M 104 136 L 105 158" stroke="${c.accent}" stroke-width="1.4"/>`,
  },
  m_jeans: { slot: 'bottom', body: [legs()], details: (c) => lines(['M 81 211 L 119 211', 'M 100 211 L 100 244'], c, 0.9, 0.55) },
  m_chinos: { slot: 'bottom', body: [legs(402, 2)], details: (c) => lines(['M 81 211 L 119 211', sym('M 88 222 C 88 280 89 340 90 400')], c, 0.8, 0.45) },
  m_blazer: {
    slot: 'outerwear',
    body: [sym('M 89 124 C 78 126 68 130 63.5 138 C 60.5 150 63.5 166 68.5 178 C 72.5 190 79 198 81 208 C 80 218 79.5 228 79.5 238 C 85 241 91 242 96.5 241 C 95.5 214 95 186 95.5 162 C 96 150 95.5 138 94 130 Z')],
    sleeves: [M_JACKET_SLEEVE],
    details: (c) => `<path d="${sym('M 89 124 C 87 134 88 148 95.5 162 C 91 150 84 142 82 136 C 86 134 88 130 89 124 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>${buttons([[94, 200], [94, 216]], c)}${lines([sym('M 78 220 L 90 220')], c, 1, 0.6)}`,
  },
  m_leather: {
    slot: 'outerwear',
    body: [sym('M 89 124 C 78 126 68 130 63.5 138 C 60.5 150 63.5 166 68.5 178 C 72 188 77 196 79.5 204 C 80 208 80.5 212 80.5 216 C 86 218 91 218 96.5 217 C 95.5 196 95.5 172 95.5 158 C 96 146 95.5 136 94 130 Z')],
    sleeves: [M_JACKET_SLEEVE],
    details: (c) => `<path d="${sym('M 89 124 C 86 130 84 136 83 142 L 95.5 152 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>${lines([sym('M 80.5 211 L 96 212'), sym('M 72 160 L 88 162')], c, 1.1, 0.6)}<path d="M 93 154 L 92 214" stroke="${c.accent}" stroke-width="1.4"/>`,
  },
  m_sneakers: {
    slot: 'shoes', body: [sym('M 85.5 400 C 83.5 412 84 423 87 431 C 90 436 99.5 435.5 99.5 429 C 99.5 418 98.8 408 98.2 400 C 94 402 89.5 402 85.5 400 Z')],
    details: (c) => `<path d="${sym('M 86 427 C 88.5 434.5 99 434.5 99.5 427.5 Z')}" fill="#fff" stroke="${c.line}" stroke-width=".6"/>${lines([sym('M 88 407 L 96 409 M 87.6 413 L 96.6 415')], c, 1, 0.7)}`,
  },
  m_boots: { slot: 'shoes', body: [sym('M 84.8 380 C 84.2 394 84.4 412 86.4 426 C 88.4 435 99.4 435 99.4 427 C 99.4 410 99.2 394 98.4 380 Z')], details: (c) => lines([sym('M 84.8 386 L 98.6 386')], c, 1, 0.6) },
  m_loafers: {
    slot: 'shoes', body: [sym('M 86.8 414 C 86 421 87.5 427 89.5 431 C 92 435 99.2 434.5 99.2 428.5 C 99 422 98.6 418 98.4 414 C 94.5 416.5 90.5 416.5 86.8 414 Z')],
    details: (c) => `<path d="${sym('M 89.5 418 L 96.5 418')}" stroke="${c.accent}" stroke-width="1.4"/>`,
  },
  m_watch: { slot: 'bracelet', layer: 'hand', body: [], details: (c) => `<rect x="138" y="240" width="11" height="6" rx="2" fill="${c.base}" stroke="${c.line}" stroke-width=".6"/><circle cx="143.5" cy="243" r="2.2" fill="#fff" stroke="${c.accent}" stroke-width=".6"/>` },
};

export const mascBody = { torso: M_TORSO, neck: M_NECK, leg: M_LEG_L, foot: M_FOOT_L, arm: M_ARM_L, hand: M_HAND_L, mirrorPath };
