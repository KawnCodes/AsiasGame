/** RUNWAY STAGE — backdrop for contest presentations (procedural vector art). */
export function runwaySVG(theme) {
  let audience = '';
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 14; i++) {
      const x = 8 + i * 28 + (row % 2) * 14;
      const y = 470 + row * 26;
      const c = ['#5a2a5e', '#6b3a72', '#7a4a80'][row];
      audience += `<circle cx="${x}" cy="${y - 14}" r="9" fill="${c}"/><path d="M ${x - 14} ${y + 14} Q ${x} ${y - 8} ${x + 14} ${y + 14} Z" fill="${c}"/>`;
    }
  }
  const pal = theme.palette;
  return `<svg viewBox="0 0 390 540" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="rwBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2340"/><stop offset="1" stop-color="#5a2a5e"/></linearGradient>
      <linearGradient id="rwCarpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9fc6"/><stop offset="1" stop-color="#e2558f"/></linearGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d0" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="390" height="540" fill="url(#rwBack)"/>
    ${pal.map((c, i) => `<circle cx="${40 + i * 75}" cy="40" r="26" fill="${c}" opacity=".25"/>`).join('')}
    <rect x="95" y="60" width="200" height="120" rx="10" fill="#1e1830" stroke="#f2c86a" stroke-width="3"/>
    <text x="195" y="100" text-anchor="middle" font-family="'Playfair Display', serif" font-weight="700" font-size="17" fill="#f2c86a">GRAND PAVILION</text>
    <text x="195" y="128" text-anchor="middle" font-size="26">${theme.icon}</text>
    <text x="195" y="160" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="800" font-size="14" fill="#fff">${theme.name}</text>
    <path d="M 0 0 L 70 0 Q 60 200 80 460 L 0 460 Z" fill="#c2193a"/><path d="M 390 0 L 320 0 Q 330 200 310 460 L 390 460 Z" fill="#c2193a"/>
    <path d="M 20 0 Q 30 200 18 460 M 45 0 Q 52 220 48 460 M 370 0 Q 360 200 372 460 M 345 0 Q 338 220 342 460" stroke="#99102a" stroke-width="3" fill="none"/>
    <path d="M 170 190 L 220 190 L 300 460 L 90 460 Z" fill="url(#rwCarpet)"/>
    <path d="M 170 190 L 90 460 M 220 190 L 300 460" stroke="#f2c86a" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${170 - i * 14}" cy="${200 + i * 48}" r="3" fill="#fff6c4"/><circle cx="${220 + i * 14}" cy="${200 + i * 48}" r="3" fill="#fff6c4"/>`).join('')}
    <path d="M 60 0 L 150 460 L 40 460 Z" fill="url(#beam)" class="beam b1"/><path d="M 330 0 L 240 460 L 350 460 Z" fill="url(#beam)" class="beam b2"/>
    ${audience}
  </svg>`;
}
