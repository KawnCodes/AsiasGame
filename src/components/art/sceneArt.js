/** Shared scenic art: city skyline silhouette used on the welcome screen and banners. */
export function skylineSVG({ w = 400, h = 220, back = '#f7b8d6', front = '#e98fbf', windows = '#fff3c4' } = {}) {
  const rnd = mulberry(7);
  let backRects = '';
  let x = 0;
  while (x < w) {
    const bw = 22 + rnd() * 34;
    const bh = 70 + rnd() * 110;
    backRects += `<rect x="${x.toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3"/>`;
    x += bw + 2;
  }
  let front2 = '';
  let wins = '';
  x = -10;
  while (x < w) {
    const bw = 30 + rnd() * 40;
    const bh = 40 + rnd() * 80;
    const top = h - bh;
    front2 += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4"/>`;
    if (rnd() > 0.5) front2 += `<path d="M ${x + bw / 2 - 8} ${top} L ${x + bw / 2} ${top - 18} L ${x + bw / 2 + 8} ${top} Z"/>`;
    for (let wy = top + 10; wy < h - 10; wy += 14) {
      for (let wx = x + 6; wx < x + bw - 8; wx += 11) if (rnd() > 0.45) wins += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="5" height="7" rx="1"/>`;
    }
    x += bw + 4;
  }
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g fill="${back}" opacity=".7">${backRects}</g>
    <g fill="${front}">${front2}</g>
    <g fill="${windows}" opacity=".85">${wins}</g>
  </svg>`;
}

/** Deterministic PRNG so the art is identical every launch. */
export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
