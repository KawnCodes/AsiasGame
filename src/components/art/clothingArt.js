/**
 * CLOTHING ART — vector garment templates fitted to the shared body template.
 *
 * A clothing *item* (src/data/clothing.js) picks a `shape` from SHAPES and supplies
 * colours + an optional pattern. Each shape returns render parts:
 *   body     → path(s) drawn in the garment pass (before arms)
 *   sleeves  → path(s) drawn after the arms so sleeves cover skin
 *   details  → (c) => svg string for seams, buttons, laces, sparkle etc.
 * Shapes are authored as left halves and mirrored to stay perfectly symmetrical.
 */
import { symClosed, mirrorPath, sym } from '../../utils/svgPath.js';

// ---- reusable outline fragments ----------------------------------------------------
const TEE_BODY = (hem = 208) =>
  symClosed(`M 100 131 C 95 131 92 128 90.5 124.5 C 80 126.5 71.5 129 68.5 136 C 66.5 146 69.5 158 73.5 166 C 76.5 176 83 186 84.5 196 C 84 200 83.5 ${hem - 4} 83 ${hem} C 90 ${hem + 2} 95 ${hem + 2} 100 ${hem + 2}`);
const SHORT_SLEEVE = sym('M 71 130 C 61.5 134 58.5 147 59 167 C 64 169.5 69 170 73.5 169 C 75 160 78 151 81 146 Z');
const LONG_SLEEVE = sym('M 71 130 C 61 134 58.5 148 59.5 164 C 59.5 177 59 190 58 200 C 56 218 54.5 234 53 246.5 C 56.5 249 61 249.5 63.5 247.5 C 64.8 232 67 218 69 200 C 71 188 73 176 75 165 C 77 156 79 150 81 145 Z');
const PUFF_SLEEVE = sym('M 71 129 C 56 129 52 146 58 160 C 63 166 70 167 75 164 C 77 156 79 150 81 145 Z');
const STRAPS = (c) => `<path d="${sym('M 82.5 145 L 88.5 125')}" fill="none" stroke="${c.line}" stroke-width="1.6" stroke-linecap="round"/>`;
const SWEETHEART = (hemPath) =>
  symClosed(`M 100 150 C 96 144 89 141 82 143.5 C 77.5 152 79.5 166 83 180 C 85 188 85.5 194 85 198 ${hemPath}`);

const CAMI_HEM = 'C 84.5 202 84 205 84 208 C 90 210 95 210 100 210';

// Pleats / seams helpers
const lines = (arr, c, w = 0.8, op = 0.6) =>
  `<path d="${arr.join(' ')}" fill="none" stroke="${c.line}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
const buttons = (pts, c) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${c.accent}" stroke="${c.line}" stroke-width=".4"/>`).join('');

// Shoes: authored for the LEFT foot (viewer's left), mirrored for the right.
const shoe = (d) => sym(d);

export const SHAPES = {
  // =================================== TOPS ===================================
  tee: { slot: 'top', body: [TEE_BODY(207)], sleeves: [SHORT_SLEEVE], details: (c) => lines(['M 91 125 C 95 132 105 132 109 125'], c, 1.2, 0.7) },
  cami: { slot: 'top', body: [SWEETHEART(CAMI_HEM)], details: (c) => STRAPS(c) + lines(['M 86 152 C 92 156 96 156 100 150', 'M 114 152 C 108 156 104 156 100 150'], c, 0.6, 0.4) },
  blouse: {
    slot: 'top', body: [TEE_BODY(207)], sleeves: [LONG_SLEEVE],
    details: (c) => `<path d="${sym('M 90.5 124.5 C 92 131 95 135 100 136 C 97 131 95 128 93 124 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>` +
      buttons([[100, 146], [100, 160], [100, 174], [100, 188]], c) + lines([sym('M 53.5 241 C 57 244 61 244 64 242')], c, 1.2, 0.8),
  },
  crop: {
    slot: 'top',
    body: [symClosed('M 100 131 C 95 131 92 128 90.5 124.5 C 80 126.5 71.5 129 68.5 136 C 66.5 146 69.5 158 73.5 166 C 76 172 79 177 80.5 182.5 C 88 184.5 94 184.5 100 184.5')],
    sleeves: [SHORT_SLEEVE],
    details: (c) => lines(['M 91 125 C 95 132 105 132 109 125', 'M 81 179 C 90 181 110 181 119 179'], c, 1, 0.6),
  },
  sweater: {
    slot: 'top',
    body: [symClosed('M 100 130 C 95 130 92 127 90 123.5 C 79 125.5 70 128 66.5 136 C 64 148 67 160 72 170 C 76 182 80 196 80.5 206 C 80 211 79.5 215 79.5 219 C 88 221 95 221 100 221')],
    sleeves: [sym('M 70 129 C 59 133 56 148 57 164 C 57 178 56 192 55 202 C 53 220 52 234 51 245 C 55.5 249 61.5 249.5 65 247 C 66.5 232 68 218 70.5 201 C 72.5 188 74.5 176 76 165 C 78 156 80 150 82 145 Z')],
    details: (c) => lines(['M 90 124 C 95 131 105 131 110 124', 'M 81 213 L 119 213', sym('M 52 239 C 56 242 61 242 65 240'), 'M 84 150 L 84 200 M 116 150 L 116 200'], c, 1.1, 0.55),
  },
  offshoulder: {
    slot: 'top',
    body: [symClosed('M 100 146 C 88 144 76 140 66 140 C 65 150 70 160 74 168 C 77 178 83 186 84.5 196 C 84 200 83.5 204 83 207 C 90 209 95 209 100 209')],
    sleeves: [sym('M 66 140 C 57.5 143 56.5 156 59.5 167 C 64 169.5 69 170 73.5 169 C 75 160 76.5 150 77 142 Z')],
    details: (c) => `<path d="${sym('M 64 138 C 68 145 72 136 76 143 C 80 136 84 146 88 140 C 92 147 96 139 100 145')}" fill="none" stroke="${c.accent}" stroke-width="3" stroke-linecap="round"/>`,
  },
  tank: {
    slot: 'top',
    body: [symClosed('M 100 136 C 94 136 91 132 90 126 C 87 126 85 127 84 128 C 83 138 79 146 76 150 C 76 160 79 170 83 182 C 85 190 85.5 196 85 200 C 84.5 203 84 205 84 208 C 90 210 95 210 100 210')],
    details: (c) => lines(['M 90 126 C 92 136 108 136 110 126'], c, 1.2, 0.7) + lines([sym('M 84 128 C 83 138 79 146 76 150')], c, 1.4, 0.8),
  },
  corset_top: {
    slot: 'top',
    body: [SWEETHEART('C 84.5 202 84 205 84 206 C 90 210 95 212 100 214')],
    details: (c) => STRAPS(c) + lines(['M 100 152 L 100 212', 'M 92 154 L 93 208', 'M 108 154 L 107 208'], c, 0.8, 0.6) +
      `<path d="M 96 158 L 104 162 M 104 158 L 96 162 M 96 170 L 104 174 M 104 170 L 96 174 M 96 182 L 104 186 M 104 182 L 96 186 M 96 194 L 104 198 M 104 194 L 96 198" stroke="${c.accent}" stroke-width="1"/>`,
  },

  // ================================== BOTTOMS =================================
  mini_skirt: {
    slot: 'bottom', body: [symClosed('M 100 191 L 84.5 191 C 83 204 79.5 216 77.5 230 C 75 242 72 254 70 265 C 80 269 90 270 100 270')],
    details: (c) => lines(['M 84.5 197 L 115.5 197'], c, 1, 0.6),
  },
  pleated_skirt: {
    slot: 'bottom', body: [symClosed('M 100 191 L 84.5 191 C 82 206 77 220 74 236 C 70 254 66 272 63 288 C 76 293 88 294 100 294')],
    details: (c) => lines(['M 84.5 197 L 115.5 197', sym('M 90 197 L 82 292 M 95 197 L 91 293'), 'M 100 197 L 100 294'], c, 0.8, 0.5),
  },
  midi_skirt: {
    slot: 'bottom', body: [symClosed('M 100 191 L 84.5 191 C 82 210 76 230 72 255 C 68 280 64 310 62 334 C 76 339 88 340 100 340')],
    details: (c) => lines(['M 84.5 198 L 115.5 198', sym('M 90 205 C 86 250 80 300 78 337')], c, 0.8, 0.45),
  },
  tutu_skirt: {
    slot: 'bottom', body: [symClosed('M 100 191 L 84.5 191 C 80 204 70 216 60 236 C 54 248 52 256 54 266 C 70 272 86 274 100 274')],
    details: (c) => `<path d="${sym('M 56 262 C 62 256 66 268 72 262 C 78 256 82 270 88 264 C 94 258 96 270 100 266')}" fill="none" stroke="${c.accent}" stroke-width="1.6"/>` + lines(['M 84.5 197 L 115.5 197'], c, 2, 0.8),
  },
  jeans: {
    slot: 'bottom',
    body: [sym('M 84.5 191 L 100 191 L 101 252 C 99 270 98 296 97 322 C 98 350 98 378 97.5 401 L 86.5 401 C 85 380 81 350 82.5 322 C 80 292 73.5 262 76.5 230 C 79 216 83.5 204 84.5 191 Z')],
    details: (c) => lines(['M 84.5 197 L 115.5 197', sym('M 84 204 C 86 210 90 212 94 212'), 'M 100 197 L 100 240'], c, 0.9, 0.55),
  },
  wide_pants: {
    slot: 'bottom',
    body: [sym('M 84.5 191 L 100 191 L 101 252 C 100 290 99.5 340 99.5 404 L 76 404 C 76 360 74 300 75 250 C 75.5 236 79 214 84.5 191 Z')],
    details: (c) => lines(['M 84.5 197 L 115.5 197', sym('M 88 220 C 87 290 86 350 87 402')], c, 0.8, 0.45),
  },
  shorts: {
    slot: 'bottom',
    body: [sym('M 84.5 191 L 100 191 L 100.5 254 C 97 258.5 92 260.5 79 258.5 C 77 248 76.5 238 77 230 C 79 216 83.5 204 84.5 191 Z')],
    details: (c) => lines(['M 84.5 197 L 115.5 197', sym('M 79 253 C 86 255 93 254.5 99 252')], c, 0.9, 0.55),
  },
  leggings: {
    slot: 'bottom',
    body: [sym('M 84.8 191 L 100 191 L 100.6 251 C 99 270 98.5 296 96.8 322 C 97.6 350 97.6 378 96.6 400 L 87.6 400 C 86 380 82.2 350 83.6 322 C 81 292 74.5 262 77.3 230 C 79.5 216 84 204 84.8 191 Z')],
    details: (c) => lines(['M 84.8 196 L 115.2 196'], c, 0.9, 0.5),
  },

  // ================================== DRESSES =================================
  slip_dress: {
    slot: 'dress',
    body: [symClosed('M 100 150 C 95 144 88 142 82 144 C 78 152 79 166 83 182 C 85 190 85 196 84.5 200 C 83 214 78 228 77 240 C 75 270 74 300 72 326 C 82 330 92 331 100 331')],
    details: (c) => STRAPS(c) + lines([sym('M 88 230 C 86 270 84 300 82 328')], c, 0.7, 0.35),
  },
  sundress: {
    slot: 'dress',
    body: [SWEETHEART('C 80 214 72 236 66 256 C 62 268 59 280 58 291 C 72 297 86 298 100 298')],
    details: (c) => STRAPS(c) + lines(['M 85 197 L 115 197', sym('M 92 200 C 86 240 80 270 76 296')], c, 0.8, 0.45),
  },
  ballgown: {
    slot: 'dress',
    body: [symClosed('M 100 147 C 92 144 84 140 76 142 C 76 154 80 166 83 180 C 85 188 85.5 194 85 198 C 70 230 48 280 36 330 C 30 360 26 400 24 430 C 50 437 76 438 100 438')],
    details: (c) => `<path d="${sym('M 26 426 C 34 418 40 432 48 424 C 56 416 62 432 70 424 C 78 416 84 432 92 424 C 96 420 98 428 100 426')}" fill="none" stroke="${c.accent}" stroke-width="2"/>` +
      lines(['M 85 198 L 115 198', sym('M 90 205 C 76 260 62 330 56 432'), sym('M 95 205 C 88 280 82 360 80 436')], c, 0.8, 0.4) +
      `<path d="${sym('M 76 142 C 72 136 68 136 66 141 C 68 146 72 146 76 142 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".5"/>`,
  },
  mermaid_gown: {
    slot: 'dress',
    body: [symClosed('M 100 150 C 95 144 88 142 82 144 C 78 152 79 166 83 182 C 85 190 85 196 84.5 200 C 84 210 79 218 78 230 C 77.5 262 82 292 84 316 C 80 342 70 384 58 432 C 74 438 88 439 100 439')],
    details: (c) => STRAPS(c) + `<path d="${sym('M 60 428 C 66 418 72 432 78 422 C 84 414 90 430 96 420 C 98 418 99 424 100 424')}" fill="none" stroke="${c.accent}" stroke-width="1.6"/>` + lines([sym('M 86 316 C 84 360 80 400 74 434')], c, 0.8, 0.4),
  },
  bodycon: {
    slot: 'dress',
    body: [symClosed('M 100 131 C 95 131 92 128 90.5 124.5 C 80 126.5 71.5 129 68.5 136 C 66.5 146 69.5 158 73.5 166 C 76.5 176 83 186 84.5 196 C 83 210 79 218 77.5 232 C 76.5 246 77 258 78 268 C 88 271 94 271 100 271')],
    sleeves: [LONG_SLEEVE],
    details: (c) => lines(['M 91 125 C 95 132 105 132 109 125', sym('M 84.5 196 C 90 200 96 200 100 199')], c, 0.9, 0.5),
  },
  tea_dress: {
    slot: 'dress',
    body: [symClosed('M 100 131 C 95 131 92 128 90.5 124.5 C 80 126.5 71.5 129 68.5 136 C 66.5 146 69.5 158 73.5 166 C 76.5 176 83 186 84.5 196 C 80 216 74 238 70 262 C 67 284 66 300 65 316 C 78 321 89 322 100 322')],
    sleeves: [PUFF_SLEEVE],
    details: (c) => `<path d="${sym('M 90.5 124.5 C 92 131 95 135 100 136 C 97 131 95 128 93 124 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>` + buttons([[100, 146], [100, 160], [100, 174]], c) + lines(['M 84.5 196 L 115.5 196'], c, 1.4, 0.7),
  },
  princess_gown: {
    slot: 'dress',
    body: [symClosed('M 100 146 C 92 144 84 140 76 142 C 76 154 80 166 83 180 C 85 188 85.5 194 85 198 C 66 226 44 272 32 322 C 25 356 22 398 20 432 C 48 438 76 439 100 439')],
    sleeves: [sym('M 77 141 C 62 136 54 150 58 162 C 63 168 70 169 75 165 C 76.5 157 77.5 149 77 141 Z')],
    details: (c) => `<path d="${sym('M 22 428 C 28 418 36 434 44 424 C 52 414 58 434 66 424 C 74 414 80 434 88 424 C 94 418 97 428 100 426')}" fill="none" stroke="${c.accent}" stroke-width="2.4"/>` +
      `<path d="${sym('M 85 198 C 72 230 60 270 54 300 C 66 296 80 292 100 290')}" fill="${c.accent}" opacity=".35"/>` + lines(['M 85 198 L 115 198'], c, 2.2, 0.8),
  },
  jumpsuit: {
    slot: 'dress',
    body: [sym('M 100 150 C 95 144 88 142 82 144 C 78 152 79 166 83 182 C 85 190 85 196 84.5 200 C 79 214 75 236 75.5 252 C 75 300 76 360 76 404 L 99.5 404 C 99.5 340 100 290 100.5 254 L 100 150 Z')],
    details: (c) => STRAPS(c) + lines(['M 84.5 198 L 115.5 198', 'M 100 200 L 100 250'], c, 1, 0.6),
  },

  // ================================ OUTERWEAR =================================
  blazer: {
    slot: 'outerwear',
    body: [sym('M 92 124.5 C 80 126.5 71.5 129 68 136 C 65.5 148 68.5 160 73 168 C 76 178 81 188 82.5 198 C 81 210 79 220 78 233 C 84 236 90 237 96.5 236 C 95.5 214 95 186 95.5 162 C 96 150 96 140 95 132 Z')],
    sleeves: [sym('M 70 129 C 60 133 57.5 148 58.5 164 C 58.5 177 58 190 57 200 C 55 218 53.5 234 52 246 C 56 249.5 61.5 250 64.5 247.5 C 66 232 68 218 70 200 C 72 188 74 176 76 165 C 78 156 80 150 82 145 Z')],
    details: (c) => `<path d="${sym('M 92 124.5 C 90 134 90 146 95.5 162 C 92 150 86 142 84 136 C 88 134 90 130 92 124.5 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>` + buttons([[94, 190], [94, 206]], c) + lines([sym('M 80 210 L 90 210')], c, 1, 0.6),
  },
  cropped_jacket: {
    slot: 'outerwear',
    body: [sym('M 92 124.5 C 80 126.5 71.5 129 68 136 C 65.5 148 68.5 160 73 168 C 76 176 79 182 80 190 C 86 192 91 192 96 191 C 95.5 176 95.5 160 95.5 150 C 96 142 96 136 95 130 Z')],
    sleeves: [sym('M 70 129 C 60 133 57.5 148 58.5 164 C 58.5 177 58 190 57 200 C 55 218 53.5 234 52 246 C 56 249.5 61.5 250 64.5 247.5 C 66 232 68 218 70 200 C 72 188 74 176 76 165 C 78 156 80 150 82 145 Z')],
    details: (c) => `<path d="${sym('M 92 124.5 C 88 130 86 134 85 140 L 95.5 150 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>` + lines([sym('M 80 186 L 96 187'), sym('M 76 150 L 90 152')], c, 1, 0.6) + buttons([[93, 160], [93, 176]], c),
  },
  cardigan: {
    slot: 'outerwear',
    body: [sym('M 91 124.5 C 80 126.5 71 129 67.5 136 C 65 148 68 160 72.5 170 C 76.5 182 79 196 79.5 206 C 79 212 78.5 218 78.5 222 C 85 224 91 224 97 223 C 96 200 96 170 96.5 150 C 96 140 94 132 91 124.5 Z')],
    sleeves: [sym('M 70 129 C 59 133 56 148 57 164 C 57 178 56 192 55 202 C 53 220 52 234 51 245 C 55.5 249 61.5 249.5 65 247 C 66.5 232 68 218 70.5 201 C 72.5 188 74.5 176 76 165 C 78 156 80 150 82 145 Z')],
    details: (c) => buttons([[95, 160], [95, 175], [95, 190], [95, 205]], c).replace(/cx="95"/g, 'cx="95"') + lines([sym('M 79 216 L 97 217'), sym('M 52 239 C 56 242 61 242 65 240')], c, 1.1, 0.55),
  },
  trench_coat: {
    slot: 'outerwear',
    body: [sym('M 92 124.5 C 80 126.5 71 129 67.5 136 C 65 148 68 160 72.5 168 C 75.5 178 80 188 81.5 198 C 79 216 74 250 71 280 C 69 296 68 310 67.5 322 C 78 326 88 327 97 326 C 96 290 95 240 95.5 190 C 95.5 160 96 140 95 130 Z')],
    sleeves: [sym('M 70 129 C 59 133 56.5 148 57.5 164 C 57.5 177 57 190 56 200 C 54 218 52.5 234 51 246 C 55.5 249.5 61.5 250 65 247.5 C 66.5 232 68 218 70 200 C 72 188 74 176 76 165 C 78 156 80 150 82 145 Z')],
    details: (c) => `<path d="${sym('M 92 124.5 C 89 132 86 136 82 140 C 88 144 92 150 95.5 158 Z')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>` +
      `<path d="M 80.5 196 L 119.5 196 L 119 203 L 81 203 Z" fill="${c.accent}" stroke="${c.line}" stroke-width=".6"/>` + buttons([[91, 170], [91, 184], [91, 214], [91, 230], [109, 170], [109, 184], [109, 214], [109, 230]], c),
  },
  fur_coat: {
    slot: 'outerwear',
    body: [sym('M 91 123 C 78 124 68 128 64 136 C 61 150 64 164 70 174 C 74 190 76 210 75 230 C 74 250 72 266 71 280 C 80 286 89 288 97 286 C 96 250 95 200 95.5 160 C 96 145 95 132 91 123 Z')],
    sleeves: [sym('M 68 128 C 55 132 52 150 53 166 C 53 180 52 194 51 204 C 49 222 48 234 47 244 C 53 251 62 252 67 248 C 68 232 70 218 72.5 201 C 74.5 188 76 176 77.5 165 C 79 156 81 150 83 145 Z')],
    details: (c) => `<g fill="none" stroke="${c.accent}" stroke-width="1.2" opacity=".7">${[150, 175, 200, 225, 250].map((y) => `<path d="${sym(`M 74 ${y} C 77 ${y - 4} 80 ${y + 4} 83 ${y} C 86 ${y - 4} 89 ${y + 4} 92 ${y}`)}"/>`).join('')}</g>`,
  },

  // =================================== SHOES ==================================
  pumps: {
    slot: 'shoes',
    body: [shoe('M 87.7 410 C 87 416 88.2 423 91 429.5 C 93 433.5 97.8 432.5 97.8 426.5 C 97.6 421 97.3 415 97 410 C 94 413 90.5 413 87.7 410 Z')],
    details: (c) => `<path d="${sym('M 89 426 C 91 431 95 431 96.8 427')}" fill="none" stroke="${c.accent}" stroke-width="1" opacity=".8"/>`,
  },
  sandals: {
    slot: 'shoes',
    body: [shoe('M 90 427 C 91 432.5 97.8 433 97.8 427 L 97.6 425 L 90.2 425 Z')],
    details: (c) => `<path d="${sym('M 87.6 404 C 91 406 94 406 96.6 404 M 88.5 415 L 97 418 M 89 421 L 97.2 421')}" fill="none" stroke="${c.base}" stroke-width="1.8" stroke-linecap="round"/>`,
  },
  sneakers: {
    slot: 'shoes',
    body: [shoe('M 86.2 398 C 84.4 410 85 421 87.8 429.5 C 90.5 435 99 434.5 99 428.5 C 99 418 98.2 408 97.6 398 C 94 400 90 400 86.2 398 Z')],
    details: (c) => `<path d="${sym('M 86.8 426 C 89 433.5 98.5 433.5 99 426.5 Z')}" fill="#fff" stroke="${c.line}" stroke-width=".6"/>` + lines([sym('M 89 405 L 96 407 M 88.6 410 L 96.4 412 M 88.6 415 L 96.6 417')], c, 1, 0.7),
  },
  ankle_boots: {
    slot: 'shoes',
    body: [shoe('M 85.6 378 C 85 392 85 410 87.2 424.5 C 89 433.5 98.6 433.5 98.6 426 C 98.6 410 98.6 392 97.6 378 Z')],
    details: (c) => lines([sym('M 85.6 384 L 97.8 384'), sym('M 92 386 L 92 418')], c, 0.9, 0.6),
  },
  knee_boots: {
    slot: 'shoes',
    body: [shoe('M 83 318 C 81.5 345 85.5 378 86.8 404 C 86.5 412 87 420 88.4 426 C 90 433.5 98.6 433.5 98.6 426 C 98.4 410 98.2 392 98 370 C 98.4 350 98.6 334 98 318 Z')],
    details: (c) => lines([sym('M 83 324 L 98 324')], c, 1.2, 0.7) + `<path d="${sym('M 86 330 C 87 360 89 390 90 410')}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".35"/>`,
  },
  flats: {
    slot: 'shoes',
    body: [shoe('M 88 414 C 88 421 89.5 426 91 429.5 C 93 433.5 97.6 432.5 97.6 426.5 C 97.4 421 97.1 417 96.9 414 C 94 416 91 416 88 414 Z')],
    details: (c) => `<path d="${sym('M 90 415.5 C 92 418 94 418 95.5 416')}" fill="${c.accent}" stroke="${c.line}" stroke-width=".5"/>`,
  },
  glass_heels: {
    slot: 'shoes',
    body: [shoe('M 87.7 410 C 87 416 88.2 423 91 429.5 C 93 433.5 97.8 432.5 97.8 426.5 C 97.6 421 97.3 415 97 410 C 94 413 90.5 413 87.7 410 Z')],
    details: () => `<path d="${sym('M 89 414 L 96 420 M 90 424 L 96.5 426')}" fill="none" stroke="#fff" stroke-width="1.4" opacity=".8"/>`,
  },

  // ==================================== BAGS ==================================
  clutch: {
    slot: 'bag', layer: 'hand',
    body: ['M 137 257 L 160 257 C 162.5 257 162.5 272 160 272 L 137 272 C 134.5 272 134.5 257 137 257 Z'],
    details: (c) => `<path d="M 135.5 262 L 161.5 262" stroke="${c.line}" stroke-width=".7" opacity=".6"/><circle cx="148.5" cy="262" r="2.2" fill="${c.accent}" stroke="${c.line}" stroke-width=".5"/>`,
  },
  handbag: {
    slot: 'bag', layer: 'hand',
    body: ['M 135 271 L 161 271 C 163 271 164.5 283 164 296 L 132 296 C 131.5 283 133 271 135 271 Z'],
    details: (c) => `<path d="M 140.5 271 C 140.5 256 155.5 256 155.5 271" fill="none" stroke="${c.line}" stroke-width="2.6"/><path d="M 133 279 L 163.5 279" stroke="${c.accent}" stroke-width="2"/><rect x="145" y="276" width="6" height="5" rx="1" fill="${c.accent}" stroke="${c.line}" stroke-width=".5"/>`,
  },
  tote: {
    slot: 'bag', layer: 'hand',
    body: ['M 131 272 L 165 272 L 168 312 L 128 312 Z'],
    details: (c) => `<path d="M 137 272 C 137 252 159 252 159 272" fill="none" stroke="${c.line}" stroke-width="2.2"/><path d="M 129 302 L 167 302" stroke="${c.accent}" stroke-width="2.5"/>`,
  },
  shoulder_bag: {
    slot: 'bag', layer: 'hand',
    body: ['M 132 226 C 132 222 152 222 152 226 L 153 246 C 153 250 131 250 131 246 Z'],
    details: (c) => `<path d="M 123 131 C 130 170 134 200 136 224" fill="none" stroke="${c.line}" stroke-width="1.8"/><path d="M 131 232 C 140 238 146 238 153 232" fill="none" stroke="${c.accent}" stroke-width="1.4"/><circle cx="142" cy="236" r="1.8" fill="${c.accent}"/>`,
  },
  heart_bag: {
    slot: 'bag', layer: 'hand',
    body: ['M 148 296 C 136 288 128 280 130 272 C 132 264 142 264 148 271 C 154 264 164 264 166 272 C 168 280 160 288 148 296 Z'],
    details: (c) => `<path d="M 141 268 C 141 254 155 254 155 268" fill="none" stroke="${c.accent}" stroke-width="2"/><path d="M 136 272 C 138 269 141 268 143 269" fill="none" stroke="#fff" stroke-width="1.6" opacity=".6"/>`,
  },

  // ================================= JEWELLERY ================================
  studs: { slot: 'earrings', layer: 'head', body: [], details: (c) => `<circle cx="68.5" cy="75" r="2" fill="${c.base}" stroke="${c.line}" stroke-width=".5"/><circle cx="131.5" cy="75" r="2" fill="${c.base}" stroke="${c.line}" stroke-width=".5"/><circle cx="68" cy="74.4" r=".7" fill="#fff"/><circle cx="131" cy="74.4" r=".7" fill="#fff"/>` },
  hoops: { slot: 'earrings', layer: 'head', body: [], details: (c) => `<circle cx="68" cy="81" r="6" fill="none" stroke="${c.base}" stroke-width="1.6"/><circle cx="132" cy="81" r="6" fill="none" stroke="${c.base}" stroke-width="1.6"/>` },
  drops: { slot: 'earrings', layer: 'head', body: [], details: (c) => `<path d="${sym('M 68.5 75 L 68.5 82 M 68.5 82 C 65 87 65 91 68.5 92 C 72 91 72 87 68.5 82 Z')}" fill="${c.base}" stroke="${c.line}" stroke-width=".6"/>` },
  pearl_earrings: { slot: 'earrings', layer: 'head', body: [], details: () => `<circle cx="68.5" cy="78" r="3" fill="#fbf4ea" stroke="#d9c9b8" stroke-width=".6"/><circle cx="131.5" cy="78" r="3" fill="#fbf4ea" stroke="#d9c9b8" stroke-width=".6"/><circle cx="67.6" cy="77" r="1" fill="#fff"/><circle cx="130.6" cy="77" r="1" fill="#fff"/>` },
  chandelier_earrings: { slot: 'earrings', layer: 'head', body: [], details: (c) => `<path d="${sym('M 68.5 75 L 68.5 79 L 64.5 86 L 68.5 96 L 72.5 86 Z')}" fill="${c.base}" stroke="${c.line}" stroke-width=".5"/><circle cx="68.5" cy="96" r="1.6" fill="${c.accent}"/><circle cx="131.5" cy="96" r="1.6" fill="${c.accent}"/>` },

  pendant: { slot: 'necklace', body: [], details: (c) => `<path d="M 91 125 C 93 138 107 138 109 125" fill="none" stroke="${c.base}" stroke-width=".9"/><path d="M 100 136 L 103 140 L 100 145 L 97 140 Z" fill="${c.accent}" stroke="${c.base}" stroke-width=".8"/>` },
  pearls: { slot: 'necklace', body: [], details: () => { let s = ''; for (let i = 0; i <= 12; i++) { const t = i / 12; const x = 90 + 20 * t; const y = 125 + 13 * Math.sin(Math.PI * t); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7" fill="#fbf4ea" stroke="#d9c9b8" stroke-width=".4"/>`; } return s; } },
  choker: { slot: 'necklace', body: [], details: (c) => `<path d="M 92.6 110 C 97 113 103 113 107.4 110 L 107.6 114 C 103 117 97 117 92.4 114 Z" fill="${c.base}" stroke="${c.line}" stroke-width=".5"/><circle cx="100" cy="117" r="1.8" fill="${c.accent}"/>` },
  statement_necklace: { slot: 'necklace', body: [], details: (c) => `<path d="M 90 124 C 92 142 108 142 110 124 C 106 134 94 134 90 124 Z" fill="${c.base}" stroke="${c.line}" stroke-width=".6"/>${[[94, 133], [100, 137], [106, 133]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${c.accent}" stroke="${c.line}" stroke-width=".4"/>`).join('')}` },

  bangle: { slot: 'bracelet', layer: 'hand', body: [], details: (c) => `<ellipse cx="143.5" cy="244" rx="5.5" ry="2.2" fill="none" stroke="${c.base}" stroke-width="2"/>` },
  charm_bracelet: { slot: 'bracelet', layer: 'hand', body: [], details: (c) => `<ellipse cx="143.5" cy="244" rx="5" ry="1.8" fill="none" stroke="${c.base}" stroke-width="1"/><circle cx="141" cy="247" r="1.4" fill="${c.accent}"/><path d="M 145 246 l 1.5 2 l 1.5 -2 l -1.5 -1 z" fill="${c.accent}"/>` },
  cuff: { slot: 'bracelet', layer: 'hand', body: [], details: (c) => `<path d="M 138 240 C 142 242 146 242 149 240 L 149 246 C 146 248 142 248 138 246 Z" fill="${c.base}" stroke="${c.line}" stroke-width=".5"/>` },

  // ============================== HAIR ACCESSORIES ============================
  bow: { slot: 'hairAcc', layer: 'top', body: [], details: (c) => `<path d="M 80 28 C 68 16 62 34 76 34 Z M 80 28 C 92 16 98 34 84 34 Z" fill="${c.base}" stroke="${c.line}" stroke-width=".8" transform="rotate(-18 80 28)"/><circle cx="80" cy="30" r="3" fill="${c.accent}" stroke="${c.line}" stroke-width=".5"/>` },
  tiara: { slot: 'hairAcc', layer: 'top', body: [], details: (c) => `<path d="M 80 28 L 84 18 L 90 24 L 100 10 L 110 24 L 116 18 L 120 28 C 106 24 94 24 80 28 Z" fill="${c.base}" stroke="${c.line}" stroke-width=".7"/><circle cx="100" cy="17" r="2.4" fill="${c.accent}"/><circle cx="88" cy="24" r="1.4" fill="${c.accent}"/><circle cx="112" cy="24" r="1.4" fill="${c.accent}"/>` },
  headband: { slot: 'hairAcc', layer: 'top', body: [], details: (c) => `<path d="M 66 50 C 68 22 132 22 134 50" fill="none" stroke="${c.base}" stroke-width="4.5" stroke-linecap="round"/><path d="M 66 50 C 68 22 132 22 134 50" fill="none" stroke="${c.accent}" stroke-width="1" stroke-dasharray="2 4"/>` },
  flower_clip: { slot: 'hairAcc', layer: 'top', body: [], details: (c) => { let s = ''; for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; s += `<circle cx="${(126 + Math.cos(a) * 4).toFixed(1)}" cy="${(36 + Math.sin(a) * 4).toFixed(1)}" r="3.6" fill="${c.base}" stroke="${c.line}" stroke-width=".5"/>`; } return s + `<circle cx="126" cy="36" r="2.4" fill="${c.accent}"/>`; } },
  beret: { slot: 'hairAcc', layer: 'top', body: [], details: (c) => `<path d="M 66 34 C 64 14 112 4 136 22 C 140 28 134 32 128 32 C 110 26 86 28 66 34 Z" fill="${c.base}" stroke="${c.line}" stroke-width=".8"/><circle cx="104" cy="10" r="2" fill="${c.line}"/>` },
};

// ---------------------------------------------------------------------------------
const PATTERNS = {
  dots: (c) => `<circle cx="3" cy="3" r="1.4" fill="${c.alt}"/><circle cx="8" cy="8" r="1.4" fill="${c.alt}"/>`,
  stripes: (c) => `<rect x="0" y="0" width="10" height="3" fill="${c.alt}"/>`,
  pinstripe: (c) => `<rect x="4.5" y="0" width="1" height="10" fill="${c.alt}"/>`,
  gingham: (c) => `<rect x="0" y="0" width="5" height="10" fill="${c.alt}" opacity=".5"/><rect x="0" y="0" width="10" height="5" fill="${c.alt}" opacity=".5"/>`,
  plaid: (c) => `<rect x="0" y="3" width="10" height="2" fill="${c.alt}" opacity=".7"/><rect x="3" y="0" width="2" height="10" fill="${c.alt}" opacity=".7"/><rect x="0" y="8" width="10" height=".6" fill="${c.line}" opacity=".5"/>`,
  floral: (c) => `<g fill="${c.alt}"><circle cx="3" cy="3" r="1.1"/><circle cx="4.6" cy="3" r="1.1"/><circle cx="3.8" cy="1.7" r="1.1"/><circle cx="3.8" cy="4.3" r="1.1"/></g><circle cx="3.8" cy="3" r=".7" fill="#fff6a8"/><circle cx="8" cy="8" r=".8" fill="${c.alt}" opacity=".7"/>`,
  hearts: (c) => `<path d="M 5 7.5 C 2 5.5 1.5 3.8 2.6 2.8 C 3.6 2 4.6 2.5 5 3.4 C 5.4 2.5 6.4 2 7.4 2.8 C 8.5 3.8 8 5.5 5 7.5 Z" fill="${c.alt}"/>`,
  sparkle: (c) => `<path d="M 3 1 L 3.6 2.4 L 5 3 L 3.6 3.6 L 3 5 L 2.4 3.6 L 1 3 L 2.4 2.4 Z" fill="${c.alt}"/><circle cx="7.5" cy="7.5" r=".7" fill="#fff"/>`,
  leopard: (c) => `<g fill="none" stroke="${c.alt}" stroke-width="1.1"><path d="M 2 2 C 4 1 5 3 4 4"/><path d="M 7 6 C 9 6 9 8 7.5 9"/></g>`,
  denim: (c) => `<path d="M 0 10 L 10 0 M -2 2 L 2 -2 M 8 12 L 12 8" stroke="${c.alt}" stroke-width=".5" opacity=".6"/>`,
};
export const PATTERN_IDS = ['solid', ...Object.keys(PATTERNS)];

export function patternDef(pid, pattern, c) {
  if (!pattern || pattern === 'solid' || !PATTERNS[pattern]) return '';
  const size = pattern === 'stripes' ? 6 : 10;
  return `<pattern id="${pid}" patternUnits="userSpaceOnUse" width="${size}" height="${size}"><rect width="10" height="10" fill="${c.base}"/>${PATTERNS[pattern](c)}</pattern>`;
}
