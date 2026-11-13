/**
 * CLOTHING CATALOGUE — data-driven. Add an item by adding one line below.
 *
 * item(id, name, shape, color, options)
 *   shape   → key in src/components/art/clothingArt.js SHAPES (decides slot & art)
 *   options → { c2: pattern colour, acc: accent, pat: pattern, fin: 'satin'|'glitter'|'sheer',
 *               p: price in coins, g: price in gems, r: rarity, s: style tags, shop, starter,
 *               sellable }
 *
 * Style tags drive fashion-contest scoring (Milestone 3):
 *   casual chic glam romantic sporty vintage edgy princess summer winter elegant street
 *   luxury pastel boho formal
 */
import { SHAPES } from '../components/art/clothingArt.js';

export const RARITIES = {
  common: { name: 'Common', color: '#b9a6c9', score: 1 },
  rare: { name: 'Rare', color: '#6fa8ff', score: 2 },
  epic: { name: 'Epic', color: '#c07bff', score: 3 },
  legendary: { name: 'Legendary', color: '#f2b84b', score: 4 },
};

const CATEGORY_BY_SHAPE = {
  tee: 'tops', cami: 'tops', blouse: 'tops', crop: 'tops', sweater: 'tops', offshoulder: 'tops', tank: 'tops', corset_top: 'tops',
  mini_skirt: 'skirts', pleated_skirt: 'skirts', midi_skirt: 'skirts', tutu_skirt: 'skirts',
  jeans: 'trousers', wide_pants: 'trousers', leggings: 'trousers', shorts: 'shorts',
  slip_dress: 'dresses', sundress: 'dresses', bodycon: 'dresses', tea_dress: 'dresses', jumpsuit: 'dresses',
  ballgown: 'special', mermaid_gown: 'special', princess_gown: 'special',
  blazer: 'jackets', cropped_jacket: 'jackets', cardigan: 'jackets', trench_coat: 'coats', fur_coat: 'coats',
  pumps: 'shoes', sandals: 'shoes', sneakers: 'shoes', ankle_boots: 'shoes', knee_boots: 'shoes', flats: 'shoes', glass_heels: 'shoes',
  clutch: 'handbags', handbag: 'handbags', tote: 'handbags', shoulder_bag: 'handbags', heart_bag: 'handbags',
  studs: 'earrings', hoops: 'earrings', drops: 'earrings', pearl_earrings: 'earrings', chandelier_earrings: 'earrings',
  pendant: 'necklaces', pearls: 'necklaces', choker: 'necklaces', statement_necklace: 'necklaces',
  bangle: 'bracelets', charm_bracelet: 'bracelets', cuff: 'bracelets',
  bow: 'hairAccessories', tiara: 'hairAccessories', headband: 'hairAccessories', flower_clip: 'hairAccessories', beret: 'hairAccessories',
};

const DEFAULT_SHOP = {
  tops: 'everyday', skirts: 'everyday', trousers: 'everyday', shorts: 'everyday', dresses: 'everyday', jackets: 'everyday',
  coats: 'luxury', special: 'luxury', shoes: 'shoes', handbags: 'accessories', hairAccessories: 'accessories',
  earrings: 'jewellery', necklaces: 'jewellery', bracelets: 'jewellery',
};

export const CATEGORIES = [
  { id: 'tops', name: 'Tops', icon: '👚' },
  { id: 'skirts', name: 'Skirts', icon: '🩰' },
  { id: 'trousers', name: 'Trousers', icon: '👖' },
  { id: 'shorts', name: 'Shorts', icon: '🩳' },
  { id: 'dresses', name: 'Dresses', icon: '👗' },
  { id: 'special', name: 'Gowns', icon: '✨' },
  { id: 'jackets', name: 'Jackets', icon: '🧥' },
  { id: 'coats', name: 'Coats', icon: '🧣' },
  { id: 'shoes', name: 'Shoes', icon: '👠' },
  { id: 'handbags', name: 'Bags', icon: '👜' },
  { id: 'earrings', name: 'Earrings', icon: '💎' },
  { id: 'necklaces', name: 'Necklaces', icon: '📿' },
  { id: 'bracelets', name: 'Bracelets', icon: '💫' },
  { id: 'hairAccessories', name: 'Hair Acc.', icon: '🎀' },
];

function item(id, name, shape, color, o = {}) {
  const shapeDef = SHAPES[shape];
  if (!shapeDef) throw new Error(`Unknown clothing shape "${shape}" for ${id}`);
  const category = CATEGORY_BY_SHAPE[shape];
  return {
    id, name, shape, color,
    slot: shapeDef.slot,
    category,
    color2: o.c2, accent: o.acc, pattern: o.pat || 'solid', finish: o.fin,
    price: o.g ? { gems: o.g } : { coins: o.p ?? 0 },
    rarity: o.r || 'common',
    styles: o.s || [],
    shop: o.shop || DEFAULT_SHOP[category],
    starter: !!o.starter,
    sellable: o.sellable !== false && !o.starter, // free starter pieces can't be sold
  };
}

export const CLOTHING = [
  // ---------------- starter wardrobe (free) ----------------
  item('top_daisy_tee', 'Daisy White Tee', 'tee', '#fffaf5', { c2: '#ffc6dc', pat: 'floral', starter: true, s: ['casual', 'summer'] }),
  item('top_lilac_cami', 'Lilac Ribbon Cami', 'cami', '#c9b2f2', { starter: true, s: ['casual', 'pastel', 'romantic'] }),
  item('bot_denim_mini', 'Classic Denim Mini', 'mini_skirt', '#7fa6d9', { c2: '#9fbde6', pat: 'denim', starter: true, s: ['casual', 'street'] }),
  item('bot_blue_jeans', 'Everyday Skinny Jeans', 'jeans', '#5f86c4', { c2: '#7d9fd4', pat: 'denim', starter: true, s: ['casual', 'street'] }),
  item('dr_gingham_sun', 'Strawberry Gingham Sundress', 'sundress', '#ffd6e5', { c2: '#ff93bb', pat: 'gingham', starter: true, s: ['summer', 'romantic', 'casual', 'pastel'] }),
  item('sh_blush_flats', 'Blush Ballet Flats', 'flats', '#f7b8cf', { acc: '#ffffff', starter: true, s: ['casual', 'romantic', 'pastel'] }),
  item('sh_cloud_sneaks', 'Cloud Sneakers', 'sneakers', '#ffffff', { acc: '#ffb3d1', starter: true, s: ['sporty', 'casual', 'street'] }),
  item('ear_silver_studs', 'Silver Star Studs', 'studs', '#dfe3ee', { starter: true, s: ['casual', 'chic'] }),

  // ---------------- Everyday Fashion Boutique — tops ----------------
  item('top_rose_tee', 'Rosé Basic Tee', 'tee', '#f6a5c0', { p: 100, s: ['casual', 'pastel'] }),
  item('top_stripe_tee', 'Breton Stripe Tee', 'tee', '#ffffff', { c2: '#2d3d74', pat: 'stripes', p: 150, s: ['casual', 'chic', 'vintage'] }),
  item('top_heart_tee', 'Sweetheart Print Tee', 'tee', '#fff0f6', { c2: '#ff6f9f', pat: 'hearts', p: 160, s: ['casual', 'pastel', 'romantic'] }),
  item('top_mint_cami', 'Mint Sorbet Cami', 'cami', '#a9e8d2', { p: 120, s: ['summer', 'pastel'] }),
  item('top_satin_cami', 'Champagne Satin Cami', 'cami', '#f1d9b5', { fin: 'satin', p: 220, r: 'rare', s: ['elegant', 'chic', 'glam'] }),
  item('top_poet_blouse', 'Poet Ruffle Blouse', 'blouse', '#fffaf2', { acc: '#f3e1d0', p: 240, s: ['vintage', 'romantic', 'elegant'] }),
  item('top_pink_blouse', 'Peony Silk Blouse', 'blouse', '#f7c3d6', { acc: '#ffffff', fin: 'satin', p: 280, s: ['chic', 'elegant', 'romantic'] }),
  item('top_floral_blouse', 'Garden Party Blouse', 'blouse', '#fff6e8', { c2: '#f08bb0', acc: '#ffd6e5', pat: 'floral', p: 260, s: ['romantic', 'vintage', 'boho'] }),
  item('top_crop_lemon', 'Lemonade Crop Top', 'crop', '#fff1a8', { p: 130, s: ['summer', 'casual', 'sporty'] }),
  item('top_crop_black', 'Midnight Crop Top', 'crop', '#2b2230', { p: 150, s: ['edgy', 'street'] }),
  item('top_crop_gingham', 'Picnic Gingham Crop', 'crop', '#ffffff', { c2: '#9ec5ff', pat: 'gingham', p: 170, s: ['summer', 'vintage', 'casual'] }),
  item('top_cream_sweater', 'Cosy Cream Knit', 'sweater', '#f6ead9', { p: 240, s: ['casual', 'winter', 'chic'] }),
  item('top_pink_sweater', 'Candyfloss Knit', 'sweater', '#ffc2da', { p: 240, s: ['winter', 'pastel', 'casual'] }),
  item('top_plaid_sweater', 'Campus Plaid Knit', 'sweater', '#8a3d4f', { c2: '#e3b26a', pat: 'plaid', p: 280, s: ['winter', 'vintage', 'chic'] }),
  item('top_off_white', 'Riviera Off-Shoulder', 'offshoulder', '#ffffff', { acc: '#ffe3ef', p: 220, s: ['summer', 'romantic', 'boho'] }),
  item('top_off_coral', 'Coral Reef Off-Shoulder', 'offshoulder', '#ff9a86', { acc: '#ffd2c8', p: 220, s: ['summer', 'boho'] }),
  item('top_sport_tank', 'Studio Sport Tank', 'tank', '#7cc6f2', { p: 110, s: ['sporty', 'casual'] }),
  item('top_black_tank', 'Rock Chic Tank', 'tank', '#1f1a24', { p: 120, s: ['edgy', 'street', 'casual'] }),
  item('top_corset_rose', 'Rosebud Corset Top', 'corset_top', '#e8789f', { acc: '#ffffff', p: 300, r: 'rare', s: ['glam', 'romantic', 'vintage'] }),
  item('top_corset_black', 'Noir Lace Corset', 'corset_top', '#2a1f2f', { acc: '#d9b46a', p: 300, r: 'rare', s: ['edgy', 'glam'] }),

  // ---------------- skirts / trousers / shorts ----------------
  item('bot_pink_mini', 'Bubblegum Mini', 'mini_skirt', '#ff8fbd', { p: 150, s: ['casual', 'pastel', 'summer'] }),
  item('bot_leather_mini', 'Faux Leather Mini', 'mini_skirt', '#2a2230', { fin: 'satin', p: 260, s: ['edgy', 'street', 'glam'] }),
  item('bot_leopard_mini', 'Wild Cat Mini', 'mini_skirt', '#e2b36a', { c2: '#5a3a1e', pat: 'leopard', p: 280, r: 'rare', s: ['edgy', 'glam'] }),
  item('bot_tennis_pleat', 'Tennis Club Pleats', 'pleated_skirt', '#ffffff', { p: 180, s: ['sporty', 'casual', 'chic'] }),
  item('bot_plaid_pleat', 'Academy Plaid Pleats', 'pleated_skirt', '#7b2f41', { c2: '#e3b26a', pat: 'plaid', p: 240, s: ['vintage', 'chic', 'winter'] }),
  item('bot_lilac_pleat', 'Lavender Haze Pleats', 'pleated_skirt', '#c3a7f0', { p: 200, s: ['pastel', 'romantic'] }),
  item('bot_cream_midi', 'Café Crème Midi', 'midi_skirt', '#f3e3cc', { p: 260, s: ['elegant', 'chic', 'vintage'] }),
  item('bot_floral_midi', 'Wildflower Midi', 'midi_skirt', '#fff5e6', { c2: '#e981a8', pat: 'floral', p: 300, s: ['boho', 'romantic', 'summer'] }),
  item('bot_satin_midi', 'Liquid Gold Midi', 'midi_skirt', '#e6c27a', { fin: 'satin', p: 450, r: 'rare', s: ['glam', 'luxury', 'elegant'] }),
  item('bot_tutu_pink', 'Prima Tutu', 'tutu_skirt', '#ffc6de', { acc: '#ffffff', fin: 'sheer', p: 320, s: ['princess', 'pastel', 'romantic'] }),
  item('bot_white_jeans', 'Yacht Club White Jeans', 'jeans', '#f8f6f2', { p: 260, s: ['summer', 'chic'] }),
  item('bot_black_jeans', 'Noir Skinny Jeans', 'jeans', '#2b2833', { c2: '#3d3a47', pat: 'denim', p: 240, s: ['edgy', 'street', 'casual'] }),
  item('bot_cream_wide', 'Riviera Wide Trousers', 'wide_pants', '#f2e6d4', { p: 320, s: ['elegant', 'chic', 'vintage'] }),
  item('bot_pinstripe_wide', 'Boardroom Pinstripes', 'wide_pants', '#3a3550', { c2: '#9a95b8', pat: 'pinstripe', p: 380, s: ['chic', 'formal', 'elegant'] }),
  item('bot_pink_wide', 'Flamingo Palazzo', 'wide_pants', '#ff9fc2', { p: 320, s: ['summer', 'glam', 'boho'] }),
  item('bot_denim_shorts', 'Festival Denim Shorts', 'shorts', '#7fa6d9', { c2: '#9fbde6', pat: 'denim', p: 160, s: ['summer', 'casual', 'boho', 'street'] }),
  item('bot_white_shorts', 'Seaside Linen Shorts', 'shorts', '#fffdf6', { p: 150, s: ['summer', 'casual'] }),
  item('bot_sport_leggings', 'Pilates Leggings', 'leggings', '#4a4060', { p: 170, s: ['sporty', 'casual'] }),
  item('bot_pink_leggings', 'Glow Leggings', 'leggings', '#ff7eb6', { p: 170, s: ['sporty', 'street'] }),

  // ---------------- dresses ----------------
  item('dr_lemon_sun', 'Lemon Drop Sundress', 'sundress', '#fff3a6', { c2: '#ffffff', pat: 'dots', p: 420, s: ['summer', 'casual', 'pastel'] }),
  item('dr_floral_sun', 'Primrose Picnic Dress', 'sundress', '#fff7ef', { c2: '#f28cb4', pat: 'floral', p: 480, s: ['summer', 'romantic', 'boho'] }),
  item('dr_navy_sun', 'Sailor Sweetheart Dress', 'sundress', '#2d3d74', { c2: '#ffffff', pat: 'dots', p: 520, s: ['vintage', 'chic'] }),
  item('dr_satin_slip', 'Moonlight Satin Slip', 'slip_dress', '#d9d4ef', { fin: 'satin', p: 650, s: ['elegant', 'glam', 'chic'] }),
  item('dr_red_slip', 'Cherry Satin Slip', 'slip_dress', '#d22f4b', { fin: 'satin', p: 700, s: ['glam', 'romantic', 'formal'] }),
  item('dr_black_bodycon', 'Little Black Dress', 'bodycon', '#231d29', { p: 600, s: ['chic', 'elegant', 'edgy', 'formal'] }),
  item('dr_pink_bodycon', 'Hot Pink Party Dress', 'bodycon', '#ff4f9a', { p: 560, s: ['glam', 'street'] }),
  item('dr_sparkle_bodycon', 'Disco Sequin Mini', 'bodycon', '#c9a2ff', { fin: 'glitter', p: 1200, r: 'rare', s: ['glam', 'edgy', 'luxury'], shop: 'luxury' }),
  item('dr_tea_floral', 'Cottage Tea Dress', 'tea_dress', '#fdf3e4', { c2: '#e77ea6', acc: '#ffffff', pat: 'floral', p: 540, s: ['vintage', 'romantic', 'boho'] }),
  item('dr_tea_polka', 'Polka Promenade Dress', 'tea_dress', '#e6334f', { c2: '#ffffff', acc: '#ffffff', pat: 'dots', p: 580, s: ['vintage', 'romantic'] }),
  item('dr_tea_mint', 'Mint Macaron Dress', 'tea_dress', '#bdeedd', { acc: '#ffffff', p: 500, s: ['pastel', 'vintage', 'romantic'] }),
  item('dr_jump_white', 'Côte d\'Azur Jumpsuit', 'jumpsuit', '#fffaf3', { p: 560, s: ['summer', 'chic', 'elegant'] }),
  item('dr_jump_black', 'After-Dark Jumpsuit', 'jumpsuit', '#25202c', { fin: 'satin', p: 640, s: ['edgy', 'chic', 'formal'] }),

  // ---------------- Luxury Designer Boutique ----------------
  item('dr_lux_champagne', 'Champagne Toast Slip', 'slip_dress', '#efd7a8', { fin: 'glitter', p: 1500, r: 'epic', s: ['luxury', 'glam', 'formal'], shop: 'luxury' }),
  item('dr_lux_velvet', 'Velvet Royale Dress', 'bodycon', '#6b1f4a', { fin: 'satin', p: 1400, r: 'rare', s: ['luxury', 'elegant', 'winter', 'formal'], shop: 'luxury' }),
  item('gown_rose_ball', 'Rose Petal Ballgown', 'ballgown', '#ffb7cf', { acc: '#ffffff', fin: 'satin', p: 2200, r: 'epic', s: ['princess', 'romantic', 'formal', 'pastel'] }),
  item('gown_royal_blue', 'Royal Sapphire Gown', 'ballgown', '#3657b8', { acc: '#f2d27a', fin: 'satin', p: 2600, r: 'epic', s: ['princess', 'formal', 'luxury', 'elegant'] }),
  item('gown_snow', 'Snow Queen Gown', 'ballgown', '#e7f3ff', { acc: '#b9d7ff', fin: 'glitter', p: 2800, r: 'epic', s: ['winter', 'princess', 'formal', 'luxury'] }),
  item('gown_red_mermaid', 'Red Carpet Mermaid Gown', 'mermaid_gown', '#c3122f', { acc: '#ff6f86', fin: 'satin', p: 2400, r: 'epic', s: ['glam', 'formal', 'vintage', 'luxury'] }),
  item('gown_gold_mermaid', 'Golden Hour Gown', 'mermaid_gown', '#e6bd62', { acc: '#fff1c4', fin: 'glitter', p: 3000, r: 'epic', s: ['glam', 'luxury', 'formal'] }),
  item('gown_noir_mermaid', 'Midnight Starlet Gown', 'mermaid_gown', '#1e1830', { c2: '#cbb9ff', acc: '#cbb9ff', pat: 'sparkle', p: 2600, r: 'epic', s: ['elegant', 'glam', 'formal', 'vintage'] }),
  item('gown_pastel_princess', 'Pastel Dream Princess Gown', 'princess_gown', '#e3d1ff', { acc: '#ffd1e8', fin: 'glitter', p: 3000, r: 'epic', s: ['princess', 'pastel', 'romantic', 'formal'] }),
  item('gown_starlight', 'Starlight Legend Gown', 'princess_gown', '#fff2d6', { acc: '#f2c86a', fin: 'glitter', g: 60, r: 'legendary', s: ['princess', 'luxury', 'glam', 'formal'] }),
  item('coat_camel_trench', 'Parisian Camel Trench', 'trench_coat', '#c99a63', { acc: '#a8784a', p: 850, s: ['chic', 'vintage', 'elegant', 'winter'] }),
  item('coat_blush_trench', 'Blush Belted Trench', 'trench_coat', '#f2bcd0', { acc: '#e298b5', p: 850, s: ['chic', 'pastel', 'romantic'] }),
  item('coat_white_fur', 'Snow Bunny Faux Fur', 'fur_coat', '#fbf7f4', { acc: '#e9dfd9', p: 1600, r: 'rare', s: ['winter', 'glam', 'luxury'] }),
  item('coat_pink_fur', 'Pink Cloud Faux Fur', 'fur_coat', '#ffc3dc', { acc: '#f39fc2', p: 1600, r: 'rare', s: ['winter', 'glam', 'pastel'] }),

  // ---------------- jackets (everyday) ----------------
  item('jk_denim', 'Vintage Denim Jacket', 'cropped_jacket', '#7397cf', { c2: '#8eb0e0', acc: '#5f84bf', pat: 'denim', p: 380, s: ['casual', 'street', 'vintage'] }),
  item('jk_leather', 'Moto Leather Jacket', 'cropped_jacket', '#2a242e', { acc: '#3a3340', fin: 'satin', p: 560, s: ['edgy', 'street'] }),
  item('jk_pink_blazer', 'Power Pink Blazer', 'blazer', '#ff86b4', { acc: '#ffb9d4', p: 520, s: ['chic', 'glam', 'formal'] }),
  item('jk_black_blazer', 'Tuxedo Blazer', 'blazer', '#211c27', { acc: '#3c3545', fin: 'satin', p: 600, s: ['chic', 'formal', 'elegant'] }),
  item('jk_tweed_blazer', 'Tweed Bouclé Blazer', 'blazer', '#f2e7e9', { c2: '#d87aa0', acc: '#e8c26e', pat: 'plaid', p: 780, r: 'rare', s: ['chic', 'vintage', 'luxury'] }),
  item('jk_cream_cardi', 'Cloud Knit Cardigan', 'cardigan', '#fbf1e2', { acc: '#f7c9d9', p: 280, s: ['casual', 'pastel', 'winter'] }),
  item('jk_lilac_cardi', 'Lilac Pearl Cardigan', 'cardigan', '#cdb5f4', { acc: '#ffffff', p: 300, s: ['pastel', 'vintage', 'romantic'] }),

  // ---------------- Shoe Boutique ----------------
  item('sh_nude_pumps', 'Nude Classic Pumps', 'pumps', '#e8bfa6', { acc: '#c99a83', p: 280, s: ['elegant', 'chic', 'formal'] }),
  item('sh_red_pumps', 'Starlet Red Pumps', 'pumps', '#d4243f', { acc: '#ff8293', fin: 'satin', p: 420, s: ['glam', 'vintage', 'formal'] }),
  item('sh_black_pumps', 'Noir Patent Pumps', 'pumps', '#1c1820', { acc: '#4a4250', fin: 'satin', p: 360, s: ['chic', 'formal', 'edgy'] }),
  item('sh_pink_pumps', 'Peony Pumps', 'pumps', '#ff9cc4', { acc: '#ffd0e3', p: 320, s: ['romantic', 'pastel', 'glam'] }),
  item('sh_gold_sandals', 'Golden Goddess Sandals', 'sandals', '#e8bd5c', { p: 380, s: ['glam', 'summer', 'luxury'] }),
  item('sh_white_sandals', 'Seashell Sandals', 'sandals', '#ffffff', { p: 200, s: ['summer', 'casual', 'boho'] }),
  item('sh_lilac_sneaks', 'Lilac Glow Sneakers', 'sneakers', '#d8c6ff', { acc: '#ffffff', p: 260, s: ['sporty', 'pastel', 'street'] }),
  item('sh_black_boots', 'City Ankle Boots', 'ankle_boots', '#2a232b', { acc: '#4b414d', p: 420, s: ['edgy', 'street', 'winter'] }),
  item('sh_tan_boots', 'Suede Ankle Boots', 'ankle_boots', '#b07c52', { p: 420, s: ['boho', 'casual', 'vintage'] }),
  item('sh_white_kneeboots', 'Go-Go Knee Boots', 'knee_boots', '#fbf8f5', { fin: 'satin', p: 560, s: ['vintage', 'glam', 'street'] }),
  item('sh_black_kneeboots', 'Equestrian Knee Boots', 'knee_boots', '#231e25', { fin: 'satin', p: 600, s: ['chic', 'winter', 'edgy'] }),
  item('sh_red_flats', 'Ruby Mary Janes', 'flats', '#c8213e', { acc: '#ff8a9c', p: 180, s: ['vintage', 'romantic'] }),
  item('sh_mint_flats', 'Mint Bow Flats', 'flats', '#a9e8d2', { acc: '#ffffff', p: 160, s: ['pastel', 'casual'] }),
  item('sh_glass_heels', 'Crystal Glass Slippers', 'glass_heels', '#d9f0ff', { fin: 'glitter', p: 1200, r: 'epic', s: ['princess', 'luxury', 'formal'] }),

  // ---------------- Accessories Shop ----------------
  item('bag_pink_clutch', 'Pink Kiss Clutch', 'clutch', '#ff8fbd', { acc: '#f2c86a', p: 180, s: ['glam', 'romantic', 'formal'] }),
  item('bag_gold_clutch', 'Gilded Minaudière', 'clutch', '#e3b553', { acc: '#ffffff', fin: 'glitter', p: 380, r: 'rare', s: ['luxury', 'glam', 'formal'] }),
  item('bag_black_handbag', 'Classic Top-Handle Bag', 'handbag', '#231d29', { acc: '#e3b553', p: 340, s: ['chic', 'elegant', 'formal'] }),
  item('bag_cream_handbag', 'Vanilla Top-Handle Bag', 'handbag', '#f3e6d2', { acc: '#c99a63', p: 320, s: ['chic', 'vintage', 'elegant'] }),
  item('bag_straw_tote', 'Riviera Straw Tote', 'tote', '#e6c98f', { c2: '#cfae6e', acc: '#2d3d74', pat: 'gingham', p: 220, s: ['summer', 'boho', 'casual'] }),
  item('bag_canvas_tote', 'I ♥ Glamour Tote', 'tote', '#fffaf2', { acc: '#ff7eb6', p: 120, s: ['casual', 'street'] }),
  item('bag_quilt_shoulder', 'Quilted Chain Bag', 'shoulder_bag', '#2a2230', { acc: '#e3b553', p: 400, r: 'rare', s: ['luxury', 'chic', 'elegant'] }),
  item('bag_mint_shoulder', 'Mint Saddle Bag', 'shoulder_bag', '#9fe0cb', { acc: '#ffffff', p: 260, s: ['pastel', 'casual'] }),
  item('bag_heart', 'Love Letter Heart Bag', 'heart_bag', '#ff5c97', { acc: '#ffd1e3', p: 300, s: ['romantic', 'glam', 'pastel'] }),
  item('hacc_pink_bow', 'Satin Bow', 'bow', '#ff8fbd', { acc: '#ffd1e3', p: 80, s: ['romantic', 'pastel', 'princess'] }),
  item('hacc_black_bow', 'Velvet Noir Bow', 'bow', '#231d29', { acc: '#4a4250', p: 90, s: ['vintage', 'chic', 'elegant'] }),
  item('hacc_headband', 'Pearl Headband', 'headband', '#ffffff', { acc: '#e7d7c6', p: 120, s: ['elegant', 'chic', 'vintage'] }),
  item('hacc_pink_headband', 'Candy Headband', 'headband', '#ff9fc6', { acc: '#ffffff', p: 70, s: ['casual', 'pastel'] }),
  item('hacc_daisy_clip', 'Daisy Hair Clip', 'flower_clip', '#ffffff', { acc: '#ffd84d', p: 60, s: ['summer', 'boho', 'casual'] }),
  item('hacc_rose_clip', 'Rose Hair Clip', 'flower_clip', '#e8435f', { acc: '#ffd1a8', p: 90, s: ['romantic', 'vintage'] }),
  item('hacc_beret', 'Montmartre Beret', 'beret', '#c2193a', { p: 220, s: ['chic', 'vintage', 'winter'] }),
  item('hacc_lilac_beret', 'Lilac Artist Beret', 'beret', '#c3a7f0', { p: 220, s: ['pastel', 'chic'] }),
  item('hacc_tiara', 'Debutante Tiara', 'tiara', '#e9edf5', { acc: '#9fd2ff', fin: 'glitter', p: 400, r: 'rare', s: ['princess', 'formal', 'luxury'] }),
  item('hacc_gold_tiara', 'Crown of the City', 'tiara', '#f0c766', { acc: '#ff6f9f', fin: 'glitter', g: 40, r: 'legendary', s: ['princess', 'luxury', 'glam'], shop: 'jewellery' }),

  // ---------------- Jewellery Store ----------------
  item('ear_gold_hoops', 'Golden Hoops', 'hoops', '#e8bd5c', { p: 160, s: ['street', 'glam', 'boho'] }),
  item('ear_silver_hoops', 'Silver Hoops', 'hoops', '#d5d9e4', { p: 140, s: ['street', 'casual', 'edgy'] }),
  item('ear_pearl', 'Pearl Drops', 'pearl_earrings', '#fbf4ea', { p: 200, s: ['elegant', 'vintage', 'formal'] }),
  item('ear_ruby_drops', 'Ruby Teardrops', 'drops', '#d0213f', { p: 260, s: ['glam', 'romantic', 'formal'] }),
  item('ear_sapphire_drops', 'Sapphire Teardrops', 'drops', '#3a5fd0', { p: 260, s: ['elegant', 'luxury'] }),
  item('ear_chandelier', 'Crystal Chandeliers', 'chandelier_earrings', '#f2d27a', { acc: '#bfe6ff', p: 380, r: 'rare', s: ['luxury', 'glam', 'formal'] }),
  item('neck_heart_pendant', 'Locket of Love', 'pendant', '#e8bd5c', { acc: '#ff5c97', p: 180, s: ['romantic', 'casual'] }),
  item('neck_star_pendant', 'Wish Upon a Star', 'pendant', '#dfe3ee', { acc: '#bfe6ff', p: 160, s: ['casual', 'pastel'] }),
  item('neck_pearls', 'Grande Dame Pearls', 'pearls', '#fbf4ea', { p: 340, s: ['elegant', 'vintage', 'formal', 'luxury'] }),
  item('neck_velvet_choker', 'Velvet Choker', 'choker', '#231d29', { acc: '#e3b553', p: 120, s: ['edgy', 'vintage', 'glam'] }),
  item('neck_pink_choker', 'Sugar Choker', 'choker', '#ff8fbd', { acc: '#ffffff', p: 100, s: ['pastel', 'street'] }),
  item('neck_statement', 'Emerald Statement Collar', 'statement_necklace', '#e8bd5c', { acc: '#2f9a6a', p: 400, r: 'rare', s: ['luxury', 'glam', 'formal'] }),
  item('neck_diamond', 'Midnight Diamond Collar', 'statement_necklace', '#e9edf5', { acc: '#bfe6ff', g: 30, r: 'legendary', s: ['luxury', 'formal', 'glam'] }),
  item('br_gold_bangle', 'Gold Bangle', 'bangle', '#e8bd5c', { p: 120, s: ['glam', 'boho'] }),
  item('br_pink_bangle', 'Jelly Bangle', 'bangle', '#ff9fc6', { p: 60, s: ['casual', 'pastel', 'summer'] }),
  item('br_charm', 'Lucky Charm Bracelet', 'charm_bracelet', '#dfe3ee', { acc: '#ff5c97', p: 220, s: ['romantic', 'casual'] }),
  item('br_cuff', 'Statement Gold Cuff', 'cuff', '#e3b553', { p: 300, r: 'rare', s: ['luxury', 'glam', 'edgy'] }),
];

export const CLOTHING_BY_ID = Object.fromEntries(CLOTHING.map((x) => [x.id, x]));
export const STARTER_CLOTHING = CLOTHING.filter((x) => x.starter).map((x) => x.id);
export const SLOTS = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'bag', 'earrings', 'necklace', 'bracelet', 'hairAcc'];
