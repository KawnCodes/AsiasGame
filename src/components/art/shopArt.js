/** SHOP INTERIOR BANNER — themed per shop from data/shops.js (procedural art). */
import { lighten, darken } from '../../utils/color.js';

export function shopBannerSVG(shop) {
  const t = shop.theme;
  const W = 390;
  const H = 150;
  const niche = (x, color) => `<g transform="translate(${x} 34)">
      <path d="M 0 86 L 0 20 Q 0 0 22 0 Q 44 0 44 20 L 44 86 Z" fill="${lighten(t.wall, 0.35)}" stroke="${t.trim}" stroke-width="3"/>
      <rect x="4" y="44" width="36" height="3" fill="${t.trim}"/>
      <rect x="4" y="70" width="36" height="3" fill="${t.trim}"/>
      <rect x="8" y="30" width="10" height="14" rx="3" fill="${color}"/><rect x="22" y="34" width="12" height="10" rx="5" fill="${lighten(color, 0.4)}"/>
      <rect x="10" y="58" width="8" height="12" rx="2" fill="${lighten(color, 0.3)}"/><circle cx="28" cy="64" r="5" fill="${color}"/>
    </g>`;
  let bulbs = '';
  for (let i = 0; i < 5; i++) bulbs += `<circle cx="${-16 + i * 8}" cy="${18 + (i % 2) * 4}" r="2.6" fill="#fff8d0"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><pattern id="sw-${shop.id}" patternUnits="userSpaceOnUse" width="24" height="24"><rect width="24" height="24" fill="${t.wall}"/><rect width="12" height="24" fill="${t.wall2}"/></pattern>
    <radialGradient id="glow-${shop.id}"><stop offset="0" stop-color="#fff6d0" stop-opacity=".8"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sw-${shop.id})"/>
    <rect y="${H - 22}" width="${W}" height="22" fill="${t.floor}"/><rect y="${H - 24}" width="${W}" height="4" fill="${t.trim}"/>
    ${niche(14, t.accent)}${niche(66, darken(t.accent, 0.15))}
    <circle cx="195" cy="40" r="46" fill="url(#glow-${shop.id})"/>
    <g transform="translate(195 0)"><path d="M 0 0 L 0 10" stroke="${t.trim}" stroke-width="2"/><path d="M -22 14 Q 0 34 22 14 Z" fill="${t.trim}" opacity=".9"/>${bulbs}
      <path d="M -14 24 l 2 8 M 0 28 l 0 9 M 14 24 l -2 8" stroke="${lighten(t.accent, 0.5)}" stroke-width="2"/></g>
    <rect x="${W - 14}" y="${H - 24}" width="2" height="2" fill="none"/>
  </svg>`;
}
