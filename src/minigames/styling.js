/**
 * TIMED STYLING CHALLENGE — style a look for a theme from a studio kit before the timer
 * runs out. Scored with the same judging code as the fashion contests.
 */
import { THEMES, THEME_BY_ID } from '../data/competitions.js';
import { CLOTHING } from '../data/clothing.js';
import { HAIRSTYLES } from '../data/appearance.js';
import { seededRandom } from '../utils/time.js';
import { scoreLook, tagFit } from '../systems/competitionSystem.js';

export const STYLING = { seconds: 45, perSlot: 4 };
export const KIT_SLOTS = ['dress', 'top', 'bottom', 'shoes', 'bag', 'earrings', 'necklace', 'hairAcc'];

function pickMixed(list, theme, n, rnd) {
  const scored = list.map((it) => [tagFit(it.styles, theme) + rnd() * 0.2, it]).sort((a, b) => b[0] - a[0]);
  const good = scored.slice(0, Math.ceil(n / 2)).map((x) => x[1]);
  const rest = scored.slice(Math.ceil(list.length / 2)).map((x) => x[1]);
  const off = [];
  while (off.length < n - good.length && rest.length) off.push(rest.splice(Math.floor(rnd() * rest.length), 1)[0]);
  return [...good, ...off].sort(() => rnd() - 0.5);
}

/** A challenge: theme + a studio kit (some on-theme, some decoys). */
export function createChallenge(seed = String(Date.now())) {
  const rnd = seededRandom(`styling:${seed}`);
  const theme = THEMES[Math.floor(rnd() * THEMES.length)];
  const kit = {};
  for (const slot of KIT_SLOTS) kit[slot] = pickMixed(CLOTHING.filter((c) => c.slot === slot), theme, STYLING.perSlot, rnd).map((c) => c.id);
  const hair = pickMixed(HAIRSTYLES.map((h) => ({ ...h, styles: h.styles || [] })), theme, 4, rnd).map((h) => h.id);
  return { seed, theme: theme.id, kit, hair, seconds: STYLING.seconds };
}

/** Percent 0–100 from the contest categories that matter for quick styling. */
export function scoreChallenge(look, themeId) {
  const theme = THEME_BY_ID[themeId];
  const { categories: c, hasBase } = scoreLook(look, theme);
  const w = { theme: 3, coordination: 2, colour: 2, hair: 1, accessories: 1.5, makeup: 0.5 };
  let sum = 0; let tw = 0;
  for (const [k, v] of Object.entries(w)) { sum += c[k] * v; tw += v; }
  const percent = Math.round((sum / tw) * 10 * (hasBase ? 1 : 0.5));
  const stars = percent >= 75 ? 3 : percent >= 58 ? 2 : percent >= 35 ? 1 : 0;
  return { percent, stars, categories: c };
}
