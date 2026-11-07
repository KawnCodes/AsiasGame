/**
 * Path utilities for the avatar art.
 *
 * All avatar artwork lives in a 200 × 440 coordinate space whose vertical centre
 * line is x = 100. Most garments are symmetrical, so we author the left half (or a
 * left-side part such as a sleeve) and mirror it with `mirrorPath`.
 *
 * Paths must use ABSOLUTE commands only (M L C Q S T H V Z). Arcs are not supported.
 */
const AXIS = 200;

export function mirrorPath(d) {
  const tokens = d.match(/[MLCQSTHVZmlcqsthvz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let out = [];
  let cmd = '';
  let idx = 0;
  for (const t of tokens) {
    if (/[A-Za-z]/.test(t)) {
      cmd = t.toUpperCase();
      if (t !== t.toUpperCase()) throw new Error('mirrorPath needs absolute commands');
      idx = 0;
      out.push(cmd);
      continue;
    }
    let v = parseFloat(t);
    if (cmd === 'H') v = AXIS - v;
    else if (cmd !== 'V' && idx % 2 === 0) v = AXIS - v;
    idx++;
    out.push(+v.toFixed(2));
  }
  return out.join(' ');
}

/** Returns the path plus its mirror, joined into one compound path. */
export const sym = (d) => `${d} ${mirrorPath(d)}`;

function parseSegments(d) {
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+/g) || [];
  const segs = [];
  let i = 0;
  let cmd = null;
  let start = null;
  let cur = null;
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    if (/[MLCQZ]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === 'Z') continue;
    const n = { M: 1, L: 1, Q: 2, C: 3 }[cmd];
    const pts = [];
    for (let k = 0; k < n; k++) pts.push([num(), num()]);
    if (cmd === 'M') { start = pts[0]; cur = pts[0]; continue; }
    segs.push({ cmd, from: cur, pts });
    cur = pts[pts.length - 1];
  }
  return { start, segs, end: cur };
}

const p = ([x, y]) => `${+x.toFixed(2)} ${+y.toFixed(2)}`;
const mx = ([x, y]) => [AXIS - x, y];

/**
 * Build a closed symmetrical shape from its LEFT outline only.
 * `d` starts on the centre line (x=100) at the top, travels down the left side and
 * ends back on the centre line. Supports M, L, Q, C (absolute).
 */
export function symClosed(d) {
  const { start, segs } = parseSegments(d);
  let out = `M ${p(start)}`;
  for (const s of segs) out += ` ${s.cmd} ${s.pts.map(p).join(' ')}`;
  // walk back up the right side: mirrored + reversed
  for (let k = segs.length - 1; k >= 0; k--) {
    const s = segs[k];
    const end = mx(s.from);
    if (s.cmd === 'L') out += ` L ${p(end)}`;
    else if (s.cmd === 'Q') out += ` Q ${p(mx(s.pts[0]))} ${p(end)}`;
    else if (s.cmd === 'C') out += ` C ${p(mx(s.pts[1]))} ${p(mx(s.pts[0]))} ${p(end)}`;
  }
  return out + ' Z';
}
