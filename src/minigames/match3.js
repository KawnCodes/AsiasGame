/**
 * JEWELLERY MATCH-3 — swap neighbouring jewels to make lines of 3+. Pure logic.
 * Real match detection, gravity, refill, cascading combos, reshuffle when stuck,
 * and a win/lose condition (reach the target score before running out of moves).
 */
import { seededRandom } from '../utils/time.js';

export const JEWELS = [
  { id: 0, name: 'Ruby', color: '#e8435f' },
  { id: 1, name: 'Sapphire', color: '#4a7be0' },
  { id: 2, name: 'Emerald', color: '#2fae7d' },
  { id: 3, name: 'Topaz', color: '#f2c048' },
  { id: 4, name: 'Amethyst', color: '#9a6ee8' },
  { id: 5, name: 'Pink Pearl', color: '#ff8fbd' },
];
export const MATCH3 = { size: 7, moves: 20, target: 1400, pointsPerJewel: 10 };

const key = (r, c) => r * 100 + c;

export function createMatch3(seed = String(Date.now()), opts = {}) {
  const size = opts.size || MATCH3.size;
  const rnd = seededRandom(`match3:${seed}`);
  const g = { size, board: [], score: 0, moves: opts.moves || MATCH3.moves, target: opts.target || MATCH3.target, rnd, combos: 0, status: 'playing', reshuffles: 0 };
  fillNoMatches(g);
  return g;
}

function randomJewel(g) { return Math.floor(g.rnd() * JEWELS.length); }

/** Fill the board so it starts with no ready-made lines but at least one possible move. */
function fillNoMatches(g) {
  for (let tries = 0; tries < 50; tries++) {
    g.board = [];
    for (let r = 0; r < g.size; r++) {
      const row = [];
      for (let c = 0; c < g.size; c++) {
        let j;
        do { j = randomJewel(g); } while ((c >= 2 && row[c - 1] === j && row[c - 2] === j) || (r >= 2 && g.board[r - 1][c] === j && g.board[r - 2][c] === j));
        row.push(j);
      }
      g.board.push(row);
    }
    if (hasPossibleMove(g.board)) return;
  }
}

/** All positions that are part of a horizontal or vertical run of 3+. Returns {cells:Set, runs:[len]} */
export function findMatches(board) {
  const n = board.length;
  const cells = new Set();
  const runs = [];
  for (let r = 0; r < n; r++) {
    let start = 0;
    for (let c = 1; c <= n; c++) {
      if (c < n && board[r][c] !== null && board[r][c] === board[r][start]) continue;
      if (board[r][start] !== null && c - start >= 3) { runs.push(c - start); for (let k = start; k < c; k++) cells.add(key(r, k)); }
      start = c;
    }
  }
  for (let c = 0; c < n; c++) {
    let start = 0;
    for (let r = 1; r <= n; r++) {
      if (r < n && board[r][c] !== null && board[r][c] === board[start][c]) continue;
      if (board[start][c] !== null && r - start >= 3) { runs.push(r - start); for (let k = start; k < r; k++) cells.add(key(k, c)); }
      start = r;
    }
  }
  return { cells, runs };
}

const adjacent = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

function swapCells(board, a, b) {
  const t = board[a.r][a.c]; board[a.r][a.c] = board[b.r][b.c]; board[b.r][b.c] = t;
}

export function hasPossibleMove(board) {
  const n = board.length;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const b = { r: r + dr, c: c + dc };
      if (b.r >= n || b.c >= n) continue;
      swapCells(board, { r, c }, b);
      const ok = findMatches(board).cells.size > 0;
      swapCells(board, { r, c }, b);
      if (ok) return true;
    }
  }
  return false;
}

/** Remove matched cells, drop jewels down, refill from the top. Returns the cleared cells. */
function collapse(g, cells) {
  for (const k of cells) g.board[Math.floor(k / 100)][k % 100] = null;
  for (let c = 0; c < g.size; c++) {
    const col = [];
    for (let r = g.size - 1; r >= 0; r--) if (g.board[r][c] !== null) col.push(g.board[r][c]);
    for (let r = g.size - 1, i = 0; r >= 0; r--, i++) g.board[r][c] = i < col.length ? col[i] : randomJewel(g);
  }
}

/**
 * Try to swap two neighbouring cells. Invalid swaps (not adjacent, or making no line)
 * are undone and cost no move. Valid swaps resolve every cascade and return animation
 * steps: [{ cleared: [[r,c]...], points, combo, board }].
 */
export function trySwap(g, a, b) {
  if (g.status !== 'playing') return { ok: false, reason: 'over' };
  if (!adjacent(a, b)) return { ok: false, reason: 'not-adjacent' };
  swapCells(g.board, a, b);
  if (findMatches(g.board).cells.size === 0) { swapCells(g.board, a, b); return { ok: false, reason: 'no-match' }; }
  g.moves -= 1;
  const steps = [];
  let combo = 0;
  for (;;) {
    const { cells, runs } = findMatches(g.board);
    if (!cells.size) break;
    combo += 1;
    const bonus = runs.reduce((n, len) => n + (len >= 5 ? 100 : len === 4 ? 40 : 0), 0);
    const points = (cells.size * MATCH3.pointsPerJewel + bonus) * combo;
    g.score += points;
    const cleared = [...cells].map((k) => [Math.floor(k / 100), k % 100]);
    collapse(g, cells);
    steps.push({ cleared, points, combo, board: g.board.map((r) => [...r]) });
  }
  g.combos = Math.max(g.combos, combo);
  let reshuffled = false;
  if (!hasPossibleMove(g.board)) { fillNoMatches(g); g.reshuffles += 1; reshuffled = true; }
  if (g.score >= g.target) g.status = 'won';
  else if (g.moves <= 0) g.status = 'lost';
  return { ok: true, steps, reshuffled, status: g.status };
}

export function match3Stars(g) {
  if (g.status !== 'won') return g.score >= g.target * 0.5 ? 1 : 0;
  return g.moves >= 6 ? 3 : g.moves >= 2 ? 2 : 1;
}
