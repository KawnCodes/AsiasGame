/**
 * FASHION MEMORY — match pairs of accessories. Pure game logic (no DOM).
 * Faces are catalogue item ids so the UI can draw each card with the real item art.
 */
import { CLOTHING } from '../data/clothing.js';
import { seededRandom } from '../utils/time.js';

export const MEMORY_LEVELS = {
  easy: { name: 'Easy', pairs: 6, cols: 4, mult: 1 },
  medium: { name: 'Medium', pairs: 8, cols: 4, mult: 1.25 },
  hard: { name: 'Hard', pairs: 10, cols: 5, mult: 1.6 },
};
const FACE_SLOTS = ['earrings', 'necklace', 'bag', 'shoes', 'hairAcc', 'bracelet'];

function shuffle(arr, rnd) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function createMemory(level = 'easy', seed = String(Date.now())) {
  const L = MEMORY_LEVELS[level] || MEMORY_LEVELS.easy;
  const rnd = seededRandom(`memory:${seed}`);
  const pool = shuffle(CLOTHING.filter((c) => FACE_SLOTS.includes(c.slot)), rnd).slice(0, L.pairs).map((c) => c.id);
  const cards = shuffle([...pool, ...pool], rnd).map((face, i) => ({ i, face, open: false, matched: false }));
  return { level, cards, first: null, pending: null, moves: 0, matches: 0, pairs: L.pairs, cols: L.cols, done: false };
}

/**
 * Flip a card. Returns { result: 'first' | 'match' | 'miss' | 'ignored' }.
 * After a miss both cards stay face-up until hideMiss() — the UI waits a moment first.
 */
export function flipCard(g, index) {
  const c = g.cards[index];
  if (!c || c.open || c.matched || g.pending || g.done) return { result: 'ignored' };
  c.open = true;
  if (g.first === null) { g.first = index; return { result: 'first' }; }
  const a = g.cards[g.first];
  g.moves += 1;
  if (a.face === c.face) {
    a.matched = c.matched = true;
    g.first = null;
    g.matches += 1;
    if (g.matches === g.pairs) g.done = true;
    return { result: 'match', done: g.done };
  }
  g.pending = [g.first, index];
  g.first = null;
  return { result: 'miss' };
}

export function hideMiss(g) {
  if (!g.pending) return;
  for (const i of g.pending) g.cards[i].open = false;
  g.pending = null;
}

/** Score: fewer moves and less time is better; scaled by difficulty. */
export function memoryScore(g, seconds) {
  const L = MEMORY_LEVELS[g.level];
  const perfect = g.pairs; // a perfect game takes exactly `pairs` moves
  const raw = 1000 - Math.max(0, g.moves - perfect) * 30 - Math.max(0, seconds - g.pairs * 3) * 4;
  return Math.round(Math.max(150, raw) * L.mult);
}

/** 3 stars for near-perfect memory, 1 star for simply finishing. */
export function memoryStars(g) {
  const extra = g.moves - g.pairs;
  return extra <= Math.ceil(g.pairs * 0.5) ? 3 : extra <= g.pairs * 1.5 ? 2 : 1;
}
