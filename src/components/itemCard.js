/** Item card used by the wardrobe and shops. */
import { h } from '../utils/dom.js';
import { icon } from './icons.js';
import { RARITIES } from '../data/clothing.js';
import { priceCurrency, priceAmount } from '../systems/economy.js';

export function priceTag(price, affordable = true) {
  if (!price || priceAmount(price) === 0) return h('span', { class: 'price free' }, 'Free');
  const cur = priceCurrency(price);
  return h('span', { class: `price ${affordable ? '' : 'cant'}`, html: `${icon(cur === 'gems' ? 'gem' : 'coin')}${priceAmount(price).toLocaleString('en-GB')}` });
}

export function rarityPill(rarity = 'common') {
  const r = RARITIES[rarity] || RARITIES.common;
  return h('span', { class: 'rarity', style: { background: r.color } }, r.name);
}

/**
 * itemCard({ thumbHTML, name, rarity, selected, equipped, favourite, owned, price, affordable, locked, onClick })
 */
export function itemCard(o) {
  const r = RARITIES[o.rarity] || RARITIES.common;
  const card = h('button', {
    class: `card ${o.selected ? 'selected' : ''} ${o.owned === false ? 'unowned' : ''}`,
    style: { '--rar': r.color },
    'aria-label': `${o.name}${o.equipped ? ', wearing' : ''}${o.owned ? ', owned' : ''}`,
    onClick: o.onClick,
  },
  h('div', { class: 'thumb', html: o.thumbHTML }),
  h('div', { class: 'name' }, o.name),
  o.footer || null,
  o.equipped ? h('span', { class: 'badge', html: icon('check') }) : null,
  o.favourite ? h('span', { class: 'fav', html: icon('heart') }) : null,
  );
  card.style.setProperty('--rar', o.rarity === 'common' ? '#f1dcea' : r.color);
  return card;
}
