/**
 * HAIR ART — each hairstyle provides a `back` layer (drawn behind head & body) and a
 * `front` layer (drawn over the face), plus optional `shine` strokes.
 * All hair is filled with a per-avatar gradient built from the chosen hair colour.
 */
import { symClosed, mirrorPath } from '../../utils/svgPath.js';
import { lighten, darken } from '../../utils/color.js';

const capBack = (bottom = 86) =>
  symClosed(`M 100 15 C 78 15 63 30 63 60 C 63 72 65 ${bottom - 6} 67 ${bottom} C 80 ${bottom - 4} 90 ${bottom - 4} 100 ${bottom - 4}`);

function curlCloud(points, r) {
  return points.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr || r}"/>`).join('');
}

const STYLES = {
  long_straight: {
    back: [symClosed('M 100 14 C 78 14 61 30 61 60 C 60 100 58 150 60 198 C 72 204 88 202 100 200')],
    front: [
      'M 66 70 C 62 40 76 16 101 16 C 126 16 139 38 135 70 C 134 100 137 130 140 170 C 134 172 129 160 128 140 C 127 110 127 85 124 62 C 120 52 108 44 92 38 C 86 48 78 56 75 66 C 74 90 73 120 72 162 C 66 164 62 152 61 132 C 61 110 64 90 66 70 Z',
    ],
    shine: ['M 80 26 C 72 34 68 46 68 60', 'M 112 22 C 122 26 128 34 130 46', 'M 132 96 C 133 116 134 136 136 156'],
  },
  long_waves: {
    back: [symClosed('M 100 12 C 76 12 58 30 58 60 C 56 90 50 110 55 130 C 60 150 49 166 54 186 C 58 200 51 210 60 220 C 72 225 88 218 100 216')],
    front: [symClosed('M 100 15 C 78 15 63 30 63 58 C 62 80 59 100 57 120 C 55 140 62 152 59 172 C 66 168 70 152 70 136 C 72 116 69 96 73 77 C 76 60 85 46 100 32')],
    shine: ['M 84 22 C 74 30 68 42 67 56', 'M 116 22 C 126 30 132 42 133 56', 'M 64 110 C 62 124 66 136 64 150', 'M 136 110 C 138 124 134 136 136 150'],
  },
  bob: {
    back: [symClosed('M 100 13 C 76 13 60 30 60 62 C 60 82 60 98 64 112 C 76 118 90 116 100 114')],
    front: [symClosed('M 100 15 C 77 15 62 30 62 62 C 62 82 62 100 66 113 C 70 115 74 113 77 109 C 74 92 73 76 74 62 C 76 52 80 47.5 85 46.5 C 90 47.5 95 47.5 100 47')],
    shine: ['M 78 24 C 70 32 66 44 66 58', 'M 92 20 C 104 18 116 21 124 27', 'M 128 70 C 130 84 130 96 128 106'],
  },
  ponytail: {
    back: [
      'M 104 18 C 132 4 152 22 150 52 C 148 82 158 112 151 150 C 147 172 136 178 131 170 C 140 142 135 112 131 82 C 129 60 121 40 104 30 Z',
      capBack(86),
    ],
    front: [symClosed('M 100 16 C 79 16 64 30 64 58 C 64 66 65 72 67 79 C 69 76 70 71 71 66 C 73 52 84 41 100 37.5')],
    extra: () => `<ellipse cx="114" cy="22" rx="6" ry="4.5" fill="#ff7eb6" stroke="#d14e8b" stroke-width=".8" transform="rotate(-30 114 22)"/>`,
    shine: ['M 80 24 C 72 32 68 44 68 56', 'M 140 40 C 144 70 146 100 142 140'],
  },
  top_bun: {
    back: [capBack(86)],
    front: [symClosed('M 100 16 C 79 16 64 30 64 58 C 64 66 65 72 67 79 C 69 76 70 71 71 66 C 73 53 84 42 100 38.5')],
    // bun sits on top of the front cap
    extraHair: () => `<circle cx="100" cy="13" r="15.5"/><path d="M 88 6 C 94 2 106 2 112 6"/>`,
    extra: () => `<path d="M 86 24 C 94 28 106 28 114 24" fill="none" stroke="#ff7eb6" stroke-width="2.6" stroke-linecap="round"/>`,
    shine: ['M 80 26 C 72 34 68 44 68 56', 'M 94 5 C 100 3 106 4 109 8'],
  },
  curls: {
    back: [
      symClosed('M 100 8 C 70 8 50 28 50 60 C 48 90 44 120 52 150 C 70 158 86 156 100 154'),
    ],
    backCircles: curlCloud([[52, 70], [49, 95], [51, 120], [56, 145], [148, 70], [151, 95], [149, 120], [144, 145], [60, 40], [140, 40], [80, 16], [120, 16], [100, 10], [66, 158, 11], [134, 158, 11]], 15),
    front: [symClosed('M 100 16 C 78 16 63 30 63 56 C 63 64 64 70 66 76 C 69 72 71 66 73 60 C 76 50 86 44 100 43')],
    frontCircles: curlCloud([[70, 40, 9], [80, 33, 9], [92, 30, 9], [100, 34, 8], [108, 30, 9], [120, 33, 9], [130, 40, 9], [66, 54, 8], [134, 54, 8]], 9),
    shine: ['M 60 70 C 56 90 56 110 60 130', 'M 140 70 C 144 90 144 110 140 130'],
  },
  pixie: {
    back: [capBack(88)],
    front: ['M 64 78 C 60 50 72 15 102 15 C 128 15 139 34 136 58 C 136 68 134 76 132 81 C 130 75 129 69 128 63 C 124 53 114 47 104 47 C 92 45 80 51 72 61 C 70 67 68 73 64 78 Z'],
    shine: ['M 84 22 C 100 18 116 20 126 28', 'M 74 40 C 70 46 68 54 67 62'],
  },
  twin_tails: {
    back: [
      capBack(84),
      'M 66 34 C 44 36 36 60 39 90 C 42 120 33 142 40 172 C 44 182 53 180 55 171 C 50 142 58 116 56 90 C 54 66 62 50 72 43 Z',
      mirrorPath('M 66 34 C 44 36 36 60 39 90 C 42 120 33 142 40 172 C 44 182 53 180 55 171 C 50 142 58 116 56 90 C 54 66 62 50 72 43 Z'),
    ],
    front: [symClosed('M 100 15 C 78 15 63 30 63 58 C 63 66 64 72 66 78 C 69 74 71 68 73 62 C 75 52 79 47.5 84 45.5 C 90 46.5 95 46.5 100 45.5')],
    extra: () => {
      const bow = 'M 66 36 C 58 28 54 40 62 40 Z M 66 36 C 74 28 78 40 70 40 Z';
      return `<path d="${bow} ${mirrorPath(bow)}" fill="#ff7eb6" stroke="#d14e8b" stroke-width=".8"/><circle cx="66" cy="37" r="2.4" fill="#ffd1e6"/><circle cx="134" cy="37" r="2.4" fill="#ffd1e6"/>`;
    },
    shine: ['M 46 70 C 44 100 44 130 46 160', 'M 154 70 C 156 100 156 130 154 160', 'M 82 24 C 74 30 70 40 68 52'],
  },
  side_braid: {
    back: [capBack(88)],
    front: ['M 65 72 C 60 42 76 16 101 16 C 126 16 139 36 135 66 C 134 72 133 76 131 80 C 129 72 128 66 126 60 C 120 50 108 43 92 38 C 86 46 79 54 75 64 C 73 70 71 76 70 84 C 67 82 66 78 65 72 Z'],
    extraHair: () => {
      let s = '';
      const pts = [[70, 92], [72, 106], [73, 120], [74, 134], [75, 148], [76, 162], [77, 176], [78, 190]];
      pts.forEach(([x, y], i) => {
        s += `<ellipse cx="${x + (i % 2 ? 2 : -2)}" cy="${y}" rx="7.5" ry="8.5" transform="rotate(${i % 2 ? -25 : 25} ${x} ${y})"/>`;
      });
      s += '<path d="M 78 198 C 74 208 76 216 79 222 C 82 216 84 208 80 198 Z"/>';
      return s;
    },
    extra: () => '<ellipse cx="78.5" cy="198" rx="5" ry="3" fill="#ff7eb6" stroke="#d14e8b" stroke-width=".7"/>',
    shine: ['M 80 26 C 72 34 68 46 68 58', 'M 112 22 C 122 26 128 34 130 46'],
  },
  hollywood: {
    back: [symClosed('M 100 12 C 74 12 56 30 56 60 C 54 82 56 100 54 116 C 58 128 66 133 75 131 C 85 127 92 127 100 127')],
    front: ['M 64 80 C 58 50 72 14 100 14 C 130 14 144 40 142 70 C 142 90 146 110 140 126 C 134 133 126 129 126 118 C 130 100 128 80 124 66 C 118 50 104 40 88 40 C 82 46 76 58 74 70 C 74 84 72 100 70 116 C 66 123 59 121 57 112 C 60 100 62 90 64 80 Z'],
    shine: ['M 92 22 C 108 18 124 24 132 36', 'M 134 70 C 138 84 138 98 134 112', 'M 66 88 C 64 98 64 106 62 114', 'M 96 44 C 108 46 118 54 122 64'],
  },
  updo: {
    back: [capBack(84)],
    front: [symClosed('M 100 15 C 79 15 64 30 64 58 C 64 66 65 72 67 79 C 69 75 70 70 71 64 C 74 50 85 40 100 36')],
    extraHair: () => `<ellipse cx="100" cy="14" rx="24" ry="13"/><ellipse cx="86" cy="12" rx="10" ry="9"/><ellipse cx="114" cy="12" rx="10" ry="9"/>`,
    extra: (c) => `<path d="M 68 70 C 64 80 70 86 66 96 M 132 70 C 136 80 130 86 134 96" fill="none" stroke="${c.base}" stroke-width="2.2" stroke-linecap="round"/>`,
    shine: ['M 84 8 C 92 4 108 4 116 8', 'M 80 24 C 72 32 68 44 68 56'],
  },
};

export const HAIR_STYLE_IDS = Object.keys(STYLES);

export function hairDefs(id, hex) {
  return `<linearGradient id="${id}-hair" x1="0" y1="0" x2=".25" y2="1">
      <stop offset="0" stop-color="${lighten(hex, 0.22)}"/>
      <stop offset=".35" stop-color="${hex}"/>
      <stop offset="1" stop-color="${darken(hex, 0.28)}"/>
    </linearGradient>`;
}

function colors(hex) {
  return { base: hex, line: darken(hex, 0.45), shine: lighten(hex, 0.55) };
}

export function hairBack(id, styleId, hex) {
  const s = STYLES[styleId] || STYLES.long_straight;
  const c = colors(hex);
  const paths = (s.back || []).map((d) => `<path d="${d}"/>`).join('');
  return `<g class="hair-back" fill="url(#${id}-hair)" stroke="${c.line}" stroke-width=".9" stroke-linejoin="round">
    ${paths}${s.backCircles || ''}
    <g fill="${darken(hex, 0.18)}" stroke="none" opacity=".35">${paths}</g>
  </g>`;
}

export function hairFront(id, styleId, hex) {
  const s = STYLES[styleId] || STYLES.long_straight;
  const c = colors(hex);
  const paths = (s.front || []).map((d) => `<path d="${d}"/>`).join('');
  const extraHair = s.extraHair ? s.extraHair(c) : '';
  const shine = (s.shine || []).map((d) => `<path d="${d}"/>`).join('');
  return `<g class="hair-front">
    <g fill="url(#${id}-hair)" stroke="${c.line}" stroke-width=".9" stroke-linejoin="round">${extraHair}${paths}${s.frontCircles || ''}</g>
    <g fill="none" stroke="${c.shine}" stroke-width="2.2" stroke-linecap="round" opacity=".55">${shine}</g>
    ${s.extra ? s.extra(c) : ''}
  </g>`;
}
