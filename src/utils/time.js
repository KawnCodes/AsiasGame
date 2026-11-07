/**
 * Calendar helpers. Daily resets use the player's LOCAL calendar day (midnight local
 * time); weekly resets start on Monday. Keys are 'YYYY-MM-DD' strings.
 */
const pad = (n) => String(n).padStart(2, '0');

export function dateKey(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function previousDateKey(ms) {
  const d = new Date(ms);
  return dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1).getTime());
}

/** Key of the Monday that starts the week containing `ms`. */
export function weekKey(ms) {
  const d = new Date(ms);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  return dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow).getTime());
}

/** Milliseconds until the next local midnight. */
export function msUntilMidnight(ms) {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - ms;
}

export function formatDuration(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}:${pad(s % 60)}`;
  return `${Math.floor(m / 60)}h ${pad(m % 60)}m`;
}

/** Deterministic PRNG + string hash for daily quest rotation. */
export function seededRandom(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
