/**
 * Synthesised sound effects (Web Audio) — no audio files needed, works offline.
 * Final production audio can replace these via the same `sfx.play(name)` API.
 */
let ctx = null;
let enabled = true;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = 'sine', gain = 0.08) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.05);
}

const SOUNDS = {
  tap: () => tone(880, 0, 0.06, 'triangle', 0.04),
  equip: () => { tone(660, 0, 0.08, 'sine'); tone(990, 0.06, 0.12, 'sine'); },
  buy: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.22, 'triangle', 0.07)); },
  reward: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.3, 'sine', 0.07)); },
  error: () => { tone(220, 0, 0.12, 'square', 0.03); tone(180, 0.1, 0.16, 'square', 0.03); },
  page: () => tone(1320, 0, 0.05, 'sine', 0.03),
};

export const sfx = {
  setEnabled(v) { enabled = !!v; },
  play(name) {
    if (!enabled) return;
    try { SOUNDS[name]?.(); } catch { /* audio is best-effort */ }
  },
};
