/**
 * FURNITURE & SURFACES — data-driven catalogue.
 *
 * FURNITURE_KINDS define the art template (components/art/furnitureArt.js), footprint
 * (w × h in room units at full scale), placement zone and base price.
 *   placement: 'floor' (anchor = bottom-centre, stands on the floor)
 *              'wall'  (anchor = centre, hangs on the wall)
 *              'rug'   (anchor = centre, lies flat on the floor, drawn under everything)
 *   func: optional home interaction (wardrobe, vanity, mirror, bed, trophies)
 *
 * FURNITURE items = kind + palette + name + price + shop + style tags. Most are generated
 * from the ten home-style collections; extra décor, kitchen, bathroom and outdoor pieces
 * are listed by hand. Furniture is NOT unique — buy as many copies as you like.
 *
 * SURFACES are wallpapers, paints and floors: buy once, use in any room.
 */
import { HOME_STYLES } from './homeStyles.js';

export const FURNITURE_KINDS = {
  bed: { name: 'Bed', price: 1200, placement: 'floor', w: 150, h: 104, func: 'bed', cat: 'Beds' },
  sofa: { name: 'Sofa', price: 900, placement: 'floor', w: 140, h: 74, cat: 'Sofas & chairs' },
  armchair: { name: 'Armchair', price: 450, placement: 'floor', w: 62, h: 70, cat: 'Sofas & chairs' },
  chair: { name: 'Chair', price: 180, placement: 'floor', w: 36, h: 64, cat: 'Sofas & chairs' },
  coffee_table: { name: 'Coffee Table', price: 300, placement: 'floor', w: 84, h: 34, cat: 'Tables' },
  dining_table: { name: 'Dining Table', price: 600, placement: 'floor', w: 116, h: 50, cat: 'Tables' },
  desk: { name: 'Writing Desk', price: 600, placement: 'floor', w: 100, h: 62, cat: 'Tables' },
  dressing_table: { name: 'Vanity', price: 900, placement: 'floor', w: 80, h: 116, func: 'vanity', cat: 'Dressing' },
  floor_mirror: { name: 'Floor Mirror', price: 350, placement: 'floor', w: 36, h: 116, func: 'mirror', cat: 'Dressing' },
  wardrobe: { name: 'Wardrobe', price: 1000, placement: 'floor', w: 88, h: 200, func: 'wardrobe', cat: 'Storage' },
  bookshelf: { name: 'Bookcase', price: 600, placement: 'floor', w: 80, h: 160, cat: 'Storage' },
  tv_stand: { name: 'TV & Console', price: 900, placement: 'floor', w: 110, h: 80, cat: 'Entertainment' },
  piano: { name: 'Grand Piano', price: 5000, placement: 'floor', w: 140, h: 92, cat: 'Entertainment' },
  floor_lamp: { name: 'Floor Lamp', price: 250, placement: 'floor', w: 32, h: 124, cat: 'Lighting' },
  chandelier: { name: 'Chandelier', price: 800, placement: 'wall', w: 76, h: 62, cat: 'Lighting' },
  rug: { name: 'Rug', price: 300, placement: 'rug', w: 170, h: 52, cat: 'Rugs' },
  curtains: { name: 'Curtains', price: 350, placement: 'wall', w: 130, h: 168, cat: 'Wall décor' },
  wall_art: { name: 'Wall Art', price: 200, placement: 'wall', w: 54, h: 44, cat: 'Wall décor' },
  wall_mirror: { name: 'Wall Mirror', price: 300, placement: 'wall', w: 48, h: 60, func: 'mirror', cat: 'Wall décor' },
  wall_shelf: { name: 'Wall Shelf', price: 150, placement: 'wall', w: 92, h: 30, cat: 'Wall décor' },
  trophy_shelf: { name: 'Trophy Shelf', price: 200, placement: 'wall', w: 110, h: 40, func: 'trophies', cat: 'Wall décor' },
  portrait_frame: { name: 'Portrait Frame', price: 150, placement: 'wall', w: 44, h: 52, cat: 'Wall décor' },
  neon_sign: { name: 'Neon Sign', price: 400, placement: 'wall', w: 90, h: 42, cat: 'Wall décor' },
  plant_big: { name: 'Potted Plant', price: 220, placement: 'floor', w: 46, h: 78, cat: 'Plants' },
  plant_small: { name: 'Flower Pot', price: 90, placement: 'floor', w: 26, h: 40, cat: 'Plants' },
  hanging_plant: { name: 'Hanging Plant', price: 160, placement: 'wall', w: 40, h: 64, cat: 'Plants' },
  vase: { name: 'Flower Vase', price: 120, placement: 'floor', w: 26, h: 48, cat: 'Décor' },
  teddy: { name: 'Teddy Bear', price: 120, placement: 'floor', w: 34, h: 38, cat: 'Décor' },
  candles: { name: 'Candle Trio', price: 80, placement: 'floor', w: 34, h: 30, cat: 'Décor' },
  globe: { name: 'Globe', price: 250, placement: 'floor', w: 34, h: 56, cat: 'Décor' },
  kitchen_counter: { name: 'Kitchen Counter', price: 1400, placement: 'floor', w: 150, h: 96, cat: 'Kitchen' },
  fridge: { name: 'Fridge', price: 900, placement: 'floor', w: 54, h: 136, cat: 'Kitchen' },
  bathtub: { name: 'Bathtub', price: 1600, placement: 'floor', w: 134, h: 62, cat: 'Bathroom' },
  sink_vanity: { name: 'Sink Vanity', price: 700, placement: 'floor', w: 72, h: 98, cat: 'Bathroom' },
  towel_rail: { name: 'Towel Rail', price: 120, placement: 'wall', w: 60, h: 44, cat: 'Bathroom' },
  sun_lounger: { name: 'Sun Lounger', price: 500, placement: 'floor', w: 124, h: 44, cat: 'Outdoor' },
  parasol: { name: 'Parasol', price: 300, placement: 'floor', w: 90, h: 128, cat: 'Outdoor' },
  patio_set: { name: 'Patio Set', price: 700, placement: 'floor', w: 96, h: 64, cat: 'Outdoor' },
  lantern: { name: 'Garden Lantern', price: 150, placement: 'floor', w: 22, h: 60, cat: 'Outdoor' },
};

export const FURNITURE_CATEGORIES = [...new Set(Object.values(FURNITURE_KINDS).map((k) => k.cat))];

const TIER_MULT = { cosy: 1, glam: 1.6, luxe: 3.2 };

/** Which pieces each collection offers. */
const COLLECTION_KINDS = {
  pink_princess: ['bed', 'sofa', 'armchair', 'dressing_table', 'wardrobe', 'chandelier', 'rug', 'curtains', 'floor_mirror', 'wall_mirror', 'floor_lamp'],
  modern_minimalist: ['bed', 'sofa', 'armchair', 'chair', 'coffee_table', 'dining_table', 'desk', 'wardrobe', 'bookshelf', 'tv_stand', 'floor_lamp', 'rug', 'wall_art'],
  vintage_glamour: ['bed', 'sofa', 'armchair', 'dressing_table', 'chandelier', 'rug', 'curtains', 'wall_mirror', 'floor_lamp', 'piano'],
  parisian_chic: ['bed', 'sofa', 'armchair', 'chair', 'coffee_table', 'dining_table', 'dressing_table', 'floor_mirror', 'curtains', 'wall_art', 'rug'],
  hollywood_luxury: ['bed', 'sofa', 'armchair', 'dressing_table', 'wardrobe', 'chandelier', 'tv_stand', 'piano', 'rug', 'wall_mirror', 'floor_lamp', 'neon_sign'],
  pastel_dream: ['bed', 'sofa', 'armchair', 'chair', 'dressing_table', 'wardrobe', 'rug', 'curtains', 'floor_lamp', 'wall_art'],
  coastal_beach: ['bed', 'sofa', 'armchair', 'chair', 'dining_table', 'coffee_table', 'bookshelf', 'rug', 'curtains', 'wall_art', 'sun_lounger', 'parasol'],
  royal_palace: ['bed', 'sofa', 'armchair', 'chair', 'dining_table', 'dressing_table', 'wardrobe', 'chandelier', 'rug', 'curtains', 'wall_mirror', 'piano'],
  romantic_cottage: ['bed', 'sofa', 'armchair', 'chair', 'dining_table', 'dressing_table', 'bookshelf', 'rug', 'curtains', 'wall_art', 'floor_lamp'],
  dark_academia: ['bed', 'sofa', 'armchair', 'chair', 'desk', 'bookshelf', 'wardrobe', 'rug', 'floor_lamp', 'wall_art', 'globe'],
};

function F(id, name, kind, palette, price, shop, styles, extra = {}) {
  const k = FURNITURE_KINDS[kind];
  if (!k) throw new Error(`Unknown furniture kind ${kind}`);
  return { id, name, kind, palette, price: { coins: price }, shop, styles, placement: k.placement, w: k.w, h: k.h, func: k.func || null, category: k.cat, sellable: extra.sellable !== false, starter: !!extra.starter, hidden: !!extra.hidden };
}

const round10 = (n) => Math.round(n / 10) * 10;

const generated = [];
for (const style of HOME_STYLES) {
  for (const kind of COLLECTION_KINDS[style.id]) {
    const k = FURNITURE_KINDS[kind];
    generated.push(F(`${style.id}__${kind}`, `${style.prefix} ${k.name}`, kind, style.palette, round10(k.price * TIER_MULT[style.tier]), style.shop, [style.id]));
  }
}

const NEUTRAL = { main: '#ffffff', accent: '#f2c86a', wood: '#d9b48c', fabric: '#f3e6ee', metal: '#c9ccd8' };
const P = (main, accent, fabric = main, wood = '#d9b48c', metal = '#c9ccd8') => ({ main, accent, wood, fabric, metal });

const extras = [
  // Dream Decor — plants & décor
  F('decor_monstera', 'Monstera Plant', 'plant_big', P('#ffffff', '#5fb37f'), 220, 'dream_decor', ['modern_minimalist', 'coastal_beach']),
  F('decor_fig', 'Fiddle-Leaf Fig', 'plant_big', P('#c99a6b', '#4f9a68'), 260, 'dream_decor', ['romantic_cottage', 'dark_academia']),
  F('decor_pink_tree', 'Blossom Tree', 'plant_big', P('#ffffff', '#ff9fc6'), 380, 'dream_decor', ['pink_princess', 'pastel_dream']),
  F('decor_tulips', 'Tulip Pot', 'plant_small', P('#ffffff', '#ff7eb6'), 90, 'dream_decor', ['romantic_cottage', 'pink_princess']),
  F('decor_succulent', 'Succulent Pot', 'plant_small', P('#e9dccb', '#7fcf98'), 80, 'dream_decor', ['modern_minimalist']),
  F('decor_ivy', 'Hanging Ivy', 'hanging_plant', P('#f2e6d6', '#5fb37f'), 160, 'dream_decor', ['romantic_cottage', 'coastal_beach']),
  F('decor_roses', 'Rose Vase', 'vase', P('#ffffff', '#e8435f'), 120, 'dream_decor', ['vintage_glamour', 'romantic_cottage']),
  F('decor_peonies', 'Peony Vase', 'vase', P('#f2c86a', '#ff9fc6'), 160, 'dream_decor', ['parisian_chic', 'pink_princess']),
  F('decor_teddy', 'Teddy Bear', 'teddy', P('#c99a6b', '#ff7eb6'), 120, 'dream_decor', ['pink_princess', 'romantic_cottage']),
  F('decor_pink_teddy', 'Candyfloss Teddy', 'teddy', P('#ffc2dc', '#ffffff'), 140, 'dream_decor', ['pastel_dream', 'pink_princess']),
  F('decor_candles', 'Candle Trio', 'candles', P('#fff6e0', '#f2c86a'), 80, 'dream_decor', ['romantic_cottage', 'dark_academia', 'vintage_glamour']),
  F('decor_neon_heart', 'Neon Heart Sign', 'neon_sign', P('#ff4f9a', '#ffd0e6'), 400, 'dream_decor', ['hollywood_luxury', 'pink_princess']),
  F('decor_neon_star', 'Neon "Star" Sign', 'neon_sign', P('#7ce0ff', '#e9f9ff'), 400, 'dream_decor', ['hollywood_luxury', 'pastel_dream']),
  F('decor_gallery', 'Fashion Sketch Print', 'wall_art', P('#ffffff', '#ff7eb6'), 200, 'dream_decor', ['parisian_chic', 'pink_princess']),
  F('decor_portrait', 'Portrait of You', 'portrait_frame', P('#f2c86a', '#ffffff'), 150, 'dream_decor', []),
  F('decor_trophy_shelf', 'Trophy Shelf', 'trophy_shelf', P('#ffffff', '#e8c26e'), 200, 'dream_decor', []),
  F('decor_shelf', 'Floating Shelf', 'wall_shelf', P('#ffffff', '#ff9fc6'), 150, 'dream_decor', ['modern_minimalist', 'pastel_dream']),
  F('decor_lantern', 'Garden Lantern', 'lantern', P('#2b2b2f', '#fff3b0'), 150, 'dream_decor', ['romantic_cottage', 'coastal_beach']),
  F('decor_patio', 'Bistro Patio Set', 'patio_set', P('#ffffff', '#ff9fc6'), 700, 'dream_decor', ['parisian_chic', 'romantic_cottage']),
  F('decor_lounger', 'Pink Sun Lounger', 'sun_lounger', P('#ffffff', '#ff9fc6'), 500, 'dream_decor', ['pink_princess', 'coastal_beach']),
  F('decor_parasol', 'Striped Parasol', 'parasol', P('#ff7eb6', '#ffffff'), 300, 'dream_decor', ['coastal_beach']),
  // Cosy Living — kitchen & bathroom basics
  F('kit_white', 'White Shaker Kitchen', 'kitchen_counter', P('#fbfbf8', '#c9ccd8', '#e9e9e4', '#d9c3a5'), 1400, 'cosy_living', ['modern_minimalist', 'coastal_beach']),
  F('kit_pink', 'Strawberry Milk Kitchen', 'kitchen_counter', P('#ffc2dc', '#ffffff', '#fff0f6', '#fff0f6', '#f2c86a'), 2200, 'glam_interiors', ['pink_princess', 'pastel_dream']),
  F('kit_navy', 'Navy & Brass Kitchen', 'kitchen_counter', P('#2d3d74', '#c9a24e', '#e8dccb', '#e8dccb', '#c9a24e'), 2200, 'glam_interiors', ['parisian_chic', 'royal_palace']),
  F('fridge_white', 'Retro Fridge', 'fridge', P('#fbfbf8', '#c9ccd8'), 900, 'cosy_living', ['modern_minimalist']),
  F('fridge_mint', 'Mint Retro Fridge', 'fridge', P('#a9e8d2', '#ffffff'), 1100, 'glam_interiors', ['pastel_dream', 'vintage_glamour']),
  F('bath_white', 'Clawfoot Bathtub', 'bathtub', P('#ffffff', '#c9ccd8', '#ffffff', '#c9ccd8', '#c9ccd8'), 1600, 'cosy_living', ['romantic_cottage', 'parisian_chic']),
  F('bath_gold', 'Gilded Bathtub', 'bathtub', P('#fffaf0', '#e3b553', '#fffaf0', '#e3b553', '#e3b553'), 4800, 'luxe_maison', ['hollywood_luxury', 'royal_palace']),
  F('sink_white', 'Marble Sink Vanity', 'sink_vanity', P('#f6f3ee', '#c9ccd8'), 700, 'cosy_living', ['modern_minimalist']),
  F('sink_pink', 'Blush Sink Vanity', 'sink_vanity', P('#ffc2dc', '#f2c86a'), 1100, 'glam_interiors', ['pink_princess']),
  F('towels', 'Fluffy Towel Rail', 'towel_rail', P('#c9ccd8', '#ff9fc6'), 120, 'cosy_living', ['romantic_cottage']),
  F('lounger_white', 'Teak Sun Lounger', 'sun_lounger', P('#d8b98d', '#ffffff'), 500, 'cosy_living', ['coastal_beach', 'modern_minimalist']),
  // Free starter pieces (given with the Starter Apartment; not sold)
  F('starter_bed', 'Cosy Pink Bed', 'bed', P('#ffffff', '#ff7eb6', '#c9a7ff', '#ffffff'), 0, null, ['pink_princess'], { starter: true }),
  F('starter_wardrobe', 'Cream Wardrobe', 'wardrobe', P('#fff8f0', '#f2c86a', '#ffe9f2', '#fff8f0'), 0, null, ['parisian_chic'], { starter: true }),
  F('starter_vanity', 'Little Vanity', 'dressing_table', P('#ffffff', '#f2c86a', '#ffe3ef', '#ffffff'), 0, null, ['pink_princess'], { starter: true }),
  F('starter_mirror', 'Gold Floor Mirror', 'floor_mirror', P('#f2c86a', '#ffffff'), 0, null, ['vintage_glamour'], { starter: true }),
  F('starter_rug', 'Lilac Oval Rug', 'rug', P('#c9a7ff', '#ffffff'), 0, null, ['pastel_dream'], { starter: true }),
  F('starter_plant', 'Housewarming Plant', 'plant_big', P('#ffffff', '#7fcf98'), 0, null, [], { starter: true }),
  F('starter_trophies', 'Trophy Shelf', 'trophy_shelf', P('#ffffff', '#e8c26e'), 0, null, [], { starter: true }),
  F('starter_portrait', 'Portrait of You', 'portrait_frame', P('#f2c86a', '#ffffff'), 0, null, [], { starter: true }),
  F('starter_curtains', 'Pink Curtains', 'curtains', P('#ff8fbd', '#f2c86a'), 0, null, ['pink_princess'], { starter: true }),
  // Upgrade gift
  F('royal_vanity_gift', 'Hollywood Bulb Vanity', 'dressing_table', P('#fffaf0', '#e3b553', '#ffe3ef', '#fffaf0', '#e3b553'), 0, null, ['hollywood_luxury'], { starter: true, hidden: true }),
];

export const FURNITURE = [...generated, ...extras];
export const FURNITURE_BY_ID = Object.fromEntries(FURNITURE.map((f) => [f.id, f]));

/** Starter apartment layout: item id → position in the 390 × 420 room. */
export const STARTER_LAYOUT = [
  { id: 'starter_rug', x: 200, y: 372 },
  { id: 'starter_curtains', x: 184, y: 106 },
  { id: 'starter_portrait', x: 46, y: 64 },
  { id: 'starter_trophies', x: 72, y: 128 },
  { id: 'starter_bed', x: 80, y: 330 },
  { id: 'starter_wardrobe', x: 342, y: 300 },
  { id: 'starter_vanity', x: 266, y: 302 },
  { id: 'starter_mirror', x: 163, y: 318 },
  { id: 'starter_plant', x: 30, y: 396 },
];

/** Gift added to storage with every property you buy. */
export const HOUSEWARMING_GIFT = 'starter_plant';

// ---------------------------------------------------------------------------- surfaces
export const SURFACES = [
  // wallpapers
  { id: 'wp_pink_stripe', kind: 'wallpaper', name: 'Pink Heart Stripe', pattern: 'stripes_hearts', c1: '#ffe3ef', c2: '#ffd6e7', c3: '#ffffff', free: true },
  { id: 'wp_cream', kind: 'wallpaper', name: 'Cream Panelling', pattern: 'panel', c1: '#fbf3e8', c2: '#f0e2cf', c3: '#ffffff', free: true },
  { id: 'wp_white_tile', kind: 'wallpaper', name: 'White Metro Tile', pattern: 'tiles', c1: '#fbfbfb', c2: '#dfe3ea', free: true },
  { id: 'wp_blush_paint', kind: 'wallpaper', name: 'Blush Paint', pattern: 'paint', c1: '#ffe0ea', free: true },
  { id: 'wp_white_paint', kind: 'wallpaper', name: 'Gallery White Paint', pattern: 'paint', c1: '#f9f8f6', free: true },
  { id: 'wp_plum_paint', kind: 'wallpaper', name: 'Velvet Plum Paint', pattern: 'paint', c1: '#5a2a5e', free: true },
  { id: 'wp_lilac_paint', kind: 'wallpaper', name: 'Lilac Paint', pattern: 'paint', c1: '#e7dcff', price: 120, styles: ['pastel_dream'] },
  { id: 'wp_mint_paint', kind: 'wallpaper', name: 'Mint Paint', pattern: 'paint', c1: '#d8f5ea', price: 120, styles: ['pastel_dream', 'coastal_beach'] },
  { id: 'wp_sky_paint', kind: 'wallpaper', name: 'Sky Blue Paint', pattern: 'paint', c1: '#dcecff', price: 120, styles: ['coastal_beach'] },
  { id: 'wp_sage_paint', kind: 'wallpaper', name: 'Sage Paint', pattern: 'paint', c1: '#dfe7d6', price: 120, styles: ['romantic_cottage', 'modern_minimalist'] },
  { id: 'wp_charcoal_paint', kind: 'wallpaper', name: 'Charcoal Paint', pattern: 'paint', c1: '#3a3540', price: 150, styles: ['hollywood_luxury', 'modern_minimalist'] },
  { id: 'wp_forest_paint', kind: 'wallpaper', name: 'Library Green Paint', pattern: 'paint', c1: '#2f4a3a', price: 150, styles: ['dark_academia'] },
  { id: 'wp_damask_rose', kind: 'wallpaper', name: 'Rose Damask', pattern: 'damask', c1: '#f6d3dd', c2: '#e9a8bb', price: 450, styles: ['vintage_glamour', 'royal_palace'] },
  { id: 'wp_damask_gold', kind: 'wallpaper', name: 'Gold Damask', pattern: 'damask', c1: '#2a2230', c2: '#c9a24e', price: 650, styles: ['hollywood_luxury', 'royal_palace'] },
  { id: 'wp_damask_blue', kind: 'wallpaper', name: 'Palace Blue Damask', pattern: 'damask', c1: '#dbe4fb', c2: '#9fb4ea', price: 450, styles: ['royal_palace'] },
  { id: 'wp_floral', kind: 'wallpaper', name: 'Rosebud Floral', pattern: 'floral', c1: '#fff7f0', c2: '#f2a2b8', c3: '#9fd6a8', price: 380, styles: ['romantic_cottage'] },
  { id: 'wp_toile', kind: 'wallpaper', name: 'Parisian Toile', pattern: 'floral', c1: '#f7f3ee', c2: '#7d8cc4', c3: '#7d8cc4', price: 420, styles: ['parisian_chic'] },
  { id: 'wp_candy_stripe', kind: 'wallpaper', name: 'Candy Stripe', pattern: 'stripes', c1: '#ffffff', c2: '#ffc2dc', price: 300, styles: ['pink_princess'] },
  { id: 'wp_pastel_stripe', kind: 'wallpaper', name: 'Pastel Rainbow Stripe', pattern: 'stripes', c1: '#e7dcff', c2: '#d8f5ea', price: 300, styles: ['pastel_dream'] },
  { id: 'wp_navy_stripe', kind: 'wallpaper', name: 'Nautical Stripe', pattern: 'stripes', c1: '#ffffff', c2: '#c4d6f5', price: 300, styles: ['coastal_beach'] },
  { id: 'wp_stars', kind: 'wallpaper', name: 'Starry Night', pattern: 'stars', c1: '#2b2552', c2: '#ffe08a', price: 420, styles: ['hollywood_luxury', 'pastel_dream'] },
  { id: 'wp_hearts', kind: 'wallpaper', name: 'Sweetheart Print', pattern: 'hearts', c1: '#fff0f6', c2: '#ff9fc6', price: 350, styles: ['pink_princess'] },
  { id: 'wp_brick', kind: 'wallpaper', name: 'Loft Brick', pattern: 'brick', c1: '#b8664f', c2: '#9a5240', price: 400, styles: ['modern_minimalist', 'dark_academia'] },
  { id: 'wp_wood_panel', kind: 'wallpaper', name: 'Walnut Panelling', pattern: 'panel', c1: '#6b4a36', c2: '#55392a', c3: '#8a6a4a', price: 450, styles: ['dark_academia'] },
  // floors
  { id: 'fl_oak', kind: 'floor', name: 'Honey Oak', pattern: 'planks', c1: '#e9c9a8', c2: '#d7b08d', free: true },
  { id: 'fl_walnut', kind: 'floor', name: 'Dark Walnut', pattern: 'planks', c1: '#7a5238', c2: '#62412c', free: true },
  { id: 'fl_white_wood', kind: 'floor', name: 'Whitewashed Wood', pattern: 'planks', c1: '#f3ece4', c2: '#e2d8cc', free: true },
  { id: 'fl_checker', kind: 'floor', name: 'Checkerboard Tile', pattern: 'checker', c1: '#ffffff', c2: '#2b2b2f', free: true },
  { id: 'fl_marble', kind: 'floor', name: 'White Marble', pattern: 'marble', c1: '#f7f5f2', c2: '#d8d4ce', free: true },
  { id: 'fl_deck', kind: 'floor', name: 'Teak Decking', pattern: 'planks', c1: '#c99a6b', c2: '#ad7f54', free: true },
  { id: 'fl_grass', kind: 'floor', name: 'Lawn', pattern: 'grass', c1: '#9fdcae', c2: '#86cc97', free: true },
  { id: 'fl_herringbone', kind: 'floor', name: 'Herringbone Parquet', pattern: 'herringbone', c1: '#d8a878', c2: '#c08f60', price: 500, styles: ['parisian_chic', 'dark_academia'] },
  { id: 'fl_pink_carpet', kind: 'floor', name: 'Fluffy Pink Carpet', pattern: 'carpet', c1: '#ffc8de', price: 350, styles: ['pink_princess'] },
  { id: 'fl_lilac_carpet', kind: 'floor', name: 'Lilac Cloud Carpet', pattern: 'carpet', c1: '#ddd0ff', price: 350, styles: ['pastel_dream'] },
  { id: 'fl_black_marble', kind: 'floor', name: 'Black & Gold Marble', pattern: 'marble', c1: '#2a2630', c2: '#c9a24e', price: 800, styles: ['hollywood_luxury'] },
  { id: 'fl_pink_marble', kind: 'floor', name: 'Rose Quartz Marble', pattern: 'marble', c1: '#fbe3ea', c2: '#e8b7c6', price: 650, styles: ['pink_princess', 'royal_palace'] },
  { id: 'fl_blue_tile', kind: 'floor', name: 'Azure Tiles', pattern: 'checker', c1: '#ffffff', c2: '#9fc3ef', price: 400, styles: ['coastal_beach'] },
  { id: 'fl_sand', kind: 'floor', name: 'Sandy Boardwalk', pattern: 'planks', c1: '#ecd9b4', c2: '#dcc59a', price: 300, styles: ['coastal_beach'] },
  { id: 'fl_royal_carpet', kind: 'floor', name: 'Royal Red Carpet', pattern: 'carpet', c1: '#a3263e', price: 600, styles: ['royal_palace', 'vintage_glamour'] },
];

export const SURFACE_BY_ID = Object.fromEntries(SURFACES.map((s) => [s.id, s]));

export const FURNITURE_SHOPS = [
  { id: 'cosy_living', name: 'Cosy Living', type: 'Affordable Furniture', tagline: 'Comfy basics, kitchens and bathrooms at friendly prices.', theme: { accent: '#c08f60', wall: '#f7ede2', sign: '#8a5a2e' } },
  { id: 'glam_interiors', name: 'Glam Interiors', type: 'Pink, Gold & Cream Furniture', tagline: 'Pretty pieces in pink, pastel, Parisian and vintage styles.', theme: { accent: '#ff7eb6', wall: '#ffe3ef', sign: '#c23477' } },
  { id: 'luxe_maison', name: 'Luxe Maison', type: 'Premium Luxury Interiors', tagline: 'Hollywood glamour and royal splendour for grand homes.', theme: { accent: '#e3b553', wall: '#2f2340', sign: '#e3b553', dark: true } },
  { id: 'dream_decor', name: 'Dream Decor', type: 'Wallpaper, Floors & Décor', tagline: 'Wallpapers, paints, floors, plants and finishing touches.', theme: { accent: '#9a6ee8', wall: '#f1e9ff', sign: '#6b45c0' } },
];
export const FURNITURE_SHOP_BY_ID = Object.fromEntries(FURNITURE_SHOPS.map((s) => [s.id, s]));
