/**
 * MENSWEAR — outfits worn by male characters (love interests, visitors). Not sold in
 * shops; uses the masculine template's garment shapes (components/art/mascArt.js).
 */
import { SHAPES } from '../components/art/clothingArt.js';

function m(id, name, shape, color, o = {}) {
  return { id, name, shape, color, slot: SHAPES[shape].slot, color2: o.c2, accent: o.acc, pattern: o.pat || 'solid', finish: o.fin, rarity: 'common', styles: o.s || [], category: 'menswear', price: { coins: 0 }, shop: null, sellable: false, npcOnly: true };
}

export const MENSWEAR = [
  m('m_tee_white', 'White Tee', 'm_tee', '#fbfbf8'),
  m('m_tee_black', 'Black Tee', 'm_tee', '#26222a'),
  m('m_tee_stripe', 'Breton Tee', 'm_tee', '#ffffff', { c2: '#2d3d74', pat: 'stripes' }),
  m('m_shirt_denim', 'Denim Shirt', 'm_shirt', '#6f93c9', { acc: '#4f74ad', c2: '#86a7d6', pat: 'denim' }),
  m('m_shirt_white', 'Linen Shirt', 'm_shirt', '#fbf7ef', { acc: '#e9dfcf' }),
  m('m_shirt_floral', 'Hawaiian Shirt', 'm_shirt', '#5fb6e8', { acc: '#ffffff', c2: '#fff3b0', pat: 'floral' }),
  m('m_shirt_pink', 'Rose Shirt', 'm_shirt', '#f6c3d4', { acc: '#ffffff' }),
  m('m_knit_cream', 'Cable Knit', 'm_knit', '#efe4d2'),
  m('m_knit_navy', 'Navy Knit', 'm_knit', '#2d3d74'),
  m('m_hoodie_sage', 'Sage Hoodie', 'm_hoodie', '#a9c9a4', { acc: '#ffffff' }),
  m('m_jeans_blue', 'Blue Jeans', 'm_jeans', '#5f86c4', { c2: '#7d9fd4', pat: 'denim' }),
  m('m_jeans_black', 'Black Jeans', 'm_jeans', '#2b2833'),
  m('m_chinos_sand', 'Sand Chinos', 'm_chinos', '#d9c3a0'),
  m('m_chinos_navy', 'Navy Trousers', 'm_chinos', '#28304f'),
  m('m_blazer_navy', 'Navy Blazer', 'm_blazer', '#2d3d74', { acc: '#3b4c88' }),
  m('m_blazer_cream', 'Cream Blazer', 'm_blazer', '#efe6d6', { acc: '#d9c9b0' }),
  m('m_blazer_velvet', 'Velvet Blazer', 'm_blazer', '#6b1f4a', { acc: '#8a2f5e', fin: 'satin' }),
  m('m_leather_black', 'Leather Jacket', 'm_leather', '#26222a', { acc: '#3a3440', fin: 'satin' }),
  m('m_sneakers_white', 'White Sneakers', 'm_sneakers', '#ffffff', { acc: '#dddddd' }),
  m('m_boots_brown', 'Chelsea Boots', 'm_boots', '#6b4a36'),
  m('m_loafers_black', 'Loafers', 'm_loafers', '#231e25', { acc: '#c9a24e' }),
  m('m_watch_gold', 'Gold Watch', 'm_watch', '#e3b553', { acc: '#c9932e' }),
  m('m_watch_steel', 'Steel Watch', 'm_watch', '#c9ccd8', { acc: '#2d3d74' }),
];
export const MENSWEAR_BY_ID = Object.fromEntries(MENSWEAR.map((x) => [x.id, x]));
