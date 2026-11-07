/**
 * BODY & FACE ART — the shared character template.
 *
 * Coordinate system: 200 × 440 viewBox, centre line x = 100 (see docs/ASSETS.md).
 * Key anchor points other art modules rely on:
 *   head top y≈24 · eyes y≈67 · lips y≈91 · chin y≈106 · neck base y≈124
 *   shoulder tips (69,136)/(131,136) · bust y≈155 · waist y≈194 (x 85–115)
 *   hips y≈230 (x 78–122) · crotch y≈252 · knees y≈322 · ankles y≈402 · toes y≈430
 *   wrists (57,250)/(143,250) · hand centres (54,263)/(146,263) · ears (69,68)/(131,68)
 */
import { symClosed, mirrorPath } from '../../utils/svgPath.js';
import { mix, darken, lighten } from '../../utils/color.js';

export const TORSO = symClosed(
  'M 100 122 C 95 122 92 123 90 125 C 80 127 72 129 69 136 C 67 146 70 158 74 166 C 77 176 84 186 85 194 C 84 204 79 216 78 230 C 79 240 88 250 100 253'
);
export const NECK = 'M 92.5 96 L 107.5 96 L 108.5 126 C 103 129 97 129 91.5 126 Z';
export const LEG_L = 'M 78 228 C 75 262 82 292 84 322 C 82 350 86 380 88 402 L 96 402 C 97 378 98 350 96.5 322 C 99 292 101 268 100 250 Z';
export const FOOT_L = 'M 88 398 C 86.5 410 88 421 91 429 C 93 433 97.5 432 97.5 426 C 97 417 96.5 408 96 398 Z';
export const ARM_L = 'M 72 131 C 63 135 60 148 61 162 C 61 175 60 188 59 198 C 57 218 55 236 53.5 250 L 61.5 251 C 63 236 66 219 68 199 C 70 186 72 175 74 164 C 76 156 78 150 80 144 Z';
export const HAND_L = 'M 54 248 C 49.5 254 48.6 264 51.4 271.5 C 53 275.8 56.8 276.4 58.4 272.4 C 59.4 268.6 59 265.2 60.6 261.2 C 61.8 257.4 61.8 253.2 61.2 250 Z';
export const EAR_L = 'M 71 59 C 65.5 57 64.5 68 67.5 74 C 69.5 77.5 72 77 73 72 Z';

export const FACE = {
  oval: symClosed('M 100 24 C 84 24 71 36 70 58 C 69 77 78 94 90 102 C 94 105 97 106 100 106'),
  heart: symClosed('M 100 24 C 83 24 68.5 36 69 56 C 69 73 80 92 92 102.5 C 95 105.5 98 107.5 100 107.5'),
  round: symClosed('M 100 24 C 83 24 69.5 37 69.5 60 C 69.5 83 83 102 100 104.5'),
  soft_square: symClosed('M 100 24 C 84 24 70.5 36 70.5 58 C 70.5 77 75 92 85 100 C 91 104 96 105 100 105'),
};

/** Eye shapes for the LEFT eye: [outer corner, upper lid curve, lower lid curve]. */
const EYES = {
  doe: { outer: [78, 67], up: 'C 80 56.5 93 55.5 96.5 66', low: 'C 93 74 82 74.5 78 67', r: 6.1, cy: 67.2 },
  almond: { outer: [77.5, 66.5], up: 'C 81 58.5 92 58 96.5 66.5', low: 'C 92 71.5 82 71.5 77.5 66.5', r: 5.5, cy: 66.6 },
  cat: { outer: [76.5, 63], up: 'C 80 56.5 92 57.5 96.5 67', low: 'C 91 72.5 81 70.5 76.5 63', r: 5.4, cy: 66.2 },
  round: { outer: [78.5, 67], up: 'C 79.5 54.5 95 54.5 96.5 67', low: 'C 95 76.5 80 76.5 78.5 67', r: 6.4, cy: 67 },
};

const BROWS = {
  soft_arch: 'M 76.5 55.5 C 81 48.5 90 47 96.5 50.5 C 96.6 52 96 52.6 95 52.4 C 89.5 50.4 82.5 51.2 76.5 55.5 Z',
  straight: 'M 77 54 C 83 50.6 90 50 96.5 51 C 96.8 52.6 96.2 53.4 95 53.2 C 89 52.6 83 53 77 54 Z',
  high_arch: 'M 76 57 C 79 47.5 88 45.5 96.5 50.5 C 96.7 52.1 96 52.8 95 52.5 C 88.5 48.6 81.5 50.5 76 57 Z',
  feathered: 'M 76 56 C 80.5 47.5 90 46 97 50 C 97.3 52.6 96.4 53.6 95 53.4 C 89 51 82 51.6 76 56 Z',
};

const NOSES = {
  button: (s) => `<path d="M 98.2 76.5 C 97 80.6 98.6 83 101.4 82.4" fill="none" stroke="${s}" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    <ellipse cx="101.6" cy="79.6" rx="1.2" ry=".8" fill="#fff" opacity=".45"/>`,
  slim: (s) => `<path d="M 99.6 68 C 99.6 74 98.4 79.5 99.4 82 C 100.4 83.2 102.2 82.6 102.8 81.8" fill="none" stroke="${s}" stroke-width="1.05" stroke-linecap="round" opacity=".7"/>`,
  soft: (s) => `<path d="M 96.6 80.4 C 97.8 82.8 102.2 82.8 103.4 80.4" fill="none" stroke="${s}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
    <path d="M 99.2 72 C 98.6 76 98.6 78.5 99.6 80" fill="none" stroke="${s}" stroke-width=".8" opacity=".35"/>`,
};

const LIPS = {
  full: {
    up: 'M 90.5 90.5 C 93.5 87 97 85.8 100 88 C 103 85.8 106.5 87 109.5 90.5 C 104 91.4 96 91.4 90.5 90.5 Z',
    low: 'M 90.5 90.5 C 94.5 97.5 105.5 97.5 109.5 90.5 C 104 91.8 96 91.8 90.5 90.5 Z',
    line: 'M 90.5 90.5 C 96 91.6 104 91.6 109.5 90.5',
  },
  heart: {
    up: 'M 92.5 90.5 C 95 86.5 97.8 85.2 100 87.8 C 102.2 85.2 105 86.5 107.5 90.5 C 103 91.2 97 91.2 92.5 90.5 Z',
    low: 'M 92.5 90.5 C 95.5 96.5 104.5 96.5 107.5 90.5 C 103 91.6 97 91.6 92.5 90.5 Z',
    line: 'M 92.5 90.5 C 97 91.4 103 91.4 107.5 90.5',
  },
  smile: {
    up: 'M 90 89 C 93.5 87.2 97 86.6 100 88.2 C 103 86.6 106.5 87.2 110 89 C 104 91.2 96 91.2 90 89 Z',
    low: 'M 90 89 C 94 96 106 96 110 89 C 104 91.6 96 91.6 90 89 Z',
    line: 'M 90 89 C 96 91.4 104 91.4 110 89',
  },
  pout: {
    up: 'M 93 90.5 C 95.5 87.4 98 86.6 100 88.2 C 102 86.6 104.5 87.4 107 90.5 C 103 91.2 97 91.2 93 90.5 Z',
    low: 'M 93 90.5 C 95 98 105 98 107 90.5 C 103 91.8 97 91.8 93 90.5 Z',
    line: 'M 93 90.5 C 97 91.4 103 91.4 107 90.5',
  },
};

export function bodyDefs(id, skin) {
  return `
  <linearGradient id="${id}-skinShade" x1="0" x2="1">
    <stop offset="0" stop-color="${skin.shade}" stop-opacity=".85"/>
    <stop offset=".28" stop-color="${skin.shade}" stop-opacity="0"/>
    <stop offset=".72" stop-color="${skin.shade}" stop-opacity="0"/>
    <stop offset="1" stop-color="${skin.shade}" stop-opacity=".85"/>
  </linearGradient>
  <radialGradient id="${id}-face" cx=".5" cy=".55" r=".6">
    <stop offset="0" stop-color="${lighten(skin.base, 0.18)}"/>
    <stop offset=".75" stop-color="${skin.base}"/>
    <stop offset="1" stop-color="${skin.shade}"/>
  </radialGradient>`;
}

/** Skin layers behind the clothes: legs, feet, torso, neck. */
export function bodyBack(id, skin) {
  const line = darken(skin.shade, 0.25);
  const legs = `${LEG_L} ${mirrorPath(LEG_L)}`;
  const feet = `${FOOT_L} ${mirrorPath(FOOT_L)}`;
  return `<g class="body" stroke="${line}" stroke-width=".7" stroke-linejoin="round">
    <path d="${legs}" fill="${skin.base}"/>
    <path d="${legs}" fill="url(#${id}-skinShade)" stroke="none"/>
    <path d="${feet}" fill="${skin.base}"/>
    <path d="${TORSO}" fill="${skin.base}"/>
    <path d="${TORSO}" fill="url(#${id}-skinShade)" stroke="none"/>
    <path d="M 84 150 C 90 158 96 158 99 152 M 116 150 C 110 158 104 158 101 152" fill="none" stroke="${skin.shade}" stroke-width=".9" opacity=".6"/>
    <path d="${NECK}" fill="${skin.base}"/>
    <path d="M 92 104 C 96 112 104 112 108 104 L 108 112 C 103 116 97 116 92 112 Z" fill="${skin.shade}" stroke="none" opacity=".55"/>
  </g>`;
}

/** Simple modest base layer (always worn under clothing). */
export function baseLayer() {
  const c = '#f3e6f7';
  const d = '#d9c3e3';
  return `<g class="base-layer" stroke="${d}" stroke-width=".7">
    <path d="${symClosed('M 100 150 C 92 148 86 146 80 147 C 76 156 79 168 84 186 C 85 192 86 196 86 199 C 92 200 96 200 100 200')}" fill="${c}"/>
    <path d="${symClosed('M 100 214 C 92 214 86 214 81 215 C 79 222 78 228 78.5 236 C 84 240 92 244 100 253')}" fill="${c}"/>
  </g>`;
}

export function arms(id, skin) {
  const line = darken(skin.shade, 0.25);
  const a = `${ARM_L} ${mirrorPath(ARM_L)}`;
  const hnd = `${HAND_L} ${mirrorPath(HAND_L)}`;
  return `<g class="arms" stroke="${line}" stroke-width=".7" stroke-linejoin="round">
    <path d="${a}" fill="${skin.base}"/>
    <path d="${a}" fill="url(#${id}-skinShade)" stroke="none" opacity=".7"/>
    <path d="${hnd}" fill="${skin.base}"/>
  </g>`;
}

export function head(id, skin, ap, mk) {
  const line = darken(skin.shade, 0.3);
  const faceD = FACE[ap.face] || FACE.oval;
  const ears = `${EAR_L} ${mirrorPath(EAR_L)}`;
  return `<g class="head">
    <path d="${ears}" fill="${skin.base}" stroke="${line}" stroke-width=".7"/>
    <path d="${faceD}" fill="url(#${id}-face)" stroke="${line}" stroke-width=".8"/>
    ${mk.ghost ? '' : face(id, skin, ap, mk)}
  </g>`;
}

function eyePair(id, ap, mk, eyeColor, browColor) {
  const E = EYES[ap.eyes] || EYES.doe;
  const [ox, oy] = E.outer;
  const shapeL = `M ${ox} ${oy} ${E.up} ${E.low} Z`;
  const shapeR = mirrorPath(shapeL);
  const upL = `M ${ox} ${oy} ${E.up}`;
  const upR = mirrorPath(upL);
  const ix = 88.2;
  const lash = '#2a1420';
  const iris = (cx) => `
    <circle cx="${cx}" cy="${E.cy}" r="${E.r}" fill="url(#${id}-iris)"/>
    <circle cx="${cx}" cy="${E.cy}" r="${E.r}" fill="none" stroke="${darken(eyeColor, 0.5)}" stroke-width=".7"/>
    <circle cx="${cx}" cy="${E.cy + 0.2}" r="${E.r * 0.45}" fill="#1c0d16"/>
    <circle cx="${cx + 1.9}" cy="${E.cy - 2.1}" r="${E.r * 0.3}" fill="#fff"/>
    <circle cx="${cx - 1.9}" cy="${E.cy + 2.3}" r="${E.r * 0.14}" fill="#fff" opacity=".9"/>`;

  // eyeshadow between lid and brow
  let shadow = '';
  if (mk.eyeshadow?.color) {
    const s = `M ${ox - 1.5} ${oy} C 78.5 51.5 94.5 50.5 97.8 64 C 93 57.5 82 57.5 ${ox - 1.5} ${oy} Z`;
    shadow = `<path d="${s} ${mirrorPath(s)}" fill="${mk.eyeshadow.color}" opacity=".62" filter="url(#${id}-soft)"/>`;
  }
  // liner styles
  const style = mk.eyeliner?.style || 'none';
  const lineW = style === 'none' ? 1.7 : style === 'thin' ? 2.3 : 2.8;
  let wing = '';
  if (style === 'wing' || style === 'dramatic') {
    const far = style === 'dramatic' ? [70.5, 57.5] : [73, 60.5];
    const w = `M ${ox + 2.5} ${oy - 1.4} L ${far[0]} ${far[1]} L ${ox + 1} ${oy + 0.8} Z`;
    wing = `<path d="${w} ${mirrorPath(w)}" fill="${lash}"/>`;
  }
  // lashes (outer flicks)
  const l = `M ${ox + 1} ${oy - 1} L ${ox - 3} ${oy - 4} M ${ox + 3} ${oy - 4.5} L ${ox} ${oy - 8} M ${ox + 6.5} ${oy - 7} L ${ox + 5} ${oy - 10.5}`;
  const crease = `M ${ox + 1} ${oy - 4} C 82 55 92 54.5 96 60.5`;
  const brow = BROWS[ap.brows] || BROWS.soft_arch;
  return `
    ${shadow}
    <clipPath id="${id}-eyeL"><path d="${shapeL}"/></clipPath>
    <clipPath id="${id}-eyeR"><path d="${shapeR}"/></clipPath>
    <path d="${shapeL} ${shapeR}" fill="#fffafc"/>
    <g clip-path="url(#${id}-eyeL)">${iris(ix)}<path d="${upL} L 96 60 L 78 60 Z" fill="#000" opacity=".12"/></g>
    <g clip-path="url(#${id}-eyeR)">${iris(200 - ix)}<path d="${upR} L 104 60 L 122 60 Z" fill="#000" opacity=".12"/></g>
    <path d="${crease} ${mirrorPath(crease)}" fill="none" stroke="#7a4a4a" stroke-width=".7" opacity=".35"/>
    <path d="${upL} ${upR}" fill="none" stroke="${lash}" stroke-width="${lineW}" stroke-linecap="round"/>
    <path d="M ${ox} ${oy} ${E.low} ${mirrorPath(`M ${ox} ${oy} ${E.low}`)}" fill="none" stroke="${lash}" stroke-width=".7" opacity=".45"/>
    <path d="${l} ${mirrorPath(l)}" stroke="${lash}" stroke-width="1.3" stroke-linecap="round"/>
    ${wing}
    <path d="${brow} ${mirrorPath(brow)}" fill="${browColor}"/>`;
}

function face(id, skin, ap, mk) {
  const eyeColor = mk.eyeColorHex;
  const browColor = darken(mk.hairHex, 0.25);
  const L = LIPS[ap.lips] || LIPS.full;
  const natural = mix(skin.base, '#d65a78', 0.42);
  const lipColor = mk.lipstick?.color || natural;
  let blush = '';
  if (mk.blush?.color) {
    blush = `<ellipse cx="80.5" cy="82" rx="8" ry="4.6" fill="url(#${id}-blush)"/><ellipse cx="119.5" cy="82" rx="8" ry="4.6" fill="url(#${id}-blush)"/>`;
  }
  const gloss = mk.lipstick?.gloss ? 0.75 : 0.4;
  return `
  <defs>
    <radialGradient id="${id}-iris" cx=".5" cy=".65" r=".6">
      <stop offset="0" stop-color="${lighten(eyeColor, 0.45)}"/>
      <stop offset=".6" stop-color="${eyeColor}"/>
      <stop offset="1" stop-color="${darken(eyeColor, 0.45)}"/>
    </radialGradient>
    <radialGradient id="${id}-blush"><stop offset="0" stop-color="${mk.blush?.color || '#f59bb5'}" stop-opacity=".7"/><stop offset="1" stop-color="${mk.blush?.color || '#f59bb5'}" stop-opacity="0"/></radialGradient>
    <filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".9"/></filter>
  </defs>
  ${blush}
  ${eyePair(id, ap, mk, eyeColor, browColor)}
  ${(NOSES[ap.nose] || NOSES.button)(skin.shade)}
  <path d="${L.up}" fill="${darken(lipColor, 0.08)}"/>
  <path d="${L.low}" fill="${lipColor}"/>
  <path d="${L.line}" fill="none" stroke="${darken(lipColor, 0.45)}" stroke-width=".8" stroke-linecap="round"/>
  <ellipse cx="102.5" cy="93.6" rx="2.6" ry="1" fill="#fff" opacity="${gloss}"/>`;
}
