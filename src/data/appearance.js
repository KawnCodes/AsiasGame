/**
 * Appearance catalogue: body/face options (always free) plus hairstyles, hair colours
 * and makeup (some free starter options, the rest sold at the Salon & Makeup Studio).
 *
 * Shapes reference keys understood by the art modules in src/components/art/.
 */

export const SKIN_TONES = [
  { id: 'porcelain', name: 'Porcelain', base: '#fde7dc', shade: '#efc3b2' },
  { id: 'peach', name: 'Peach', base: '#f9d6c1', shade: '#e8af93' },
  { id: 'honey', name: 'Honey', base: '#eebf98', shade: '#d39672' },
  { id: 'golden', name: 'Golden', base: '#dba57a', shade: '#bb7f57' },
  { id: 'caramel', name: 'Caramel', base: '#c48a5f', shade: '#a06a44' },
  { id: 'mocha', name: 'Mocha', base: '#9f6a45', shade: '#7e4f31' },
  { id: 'cocoa', name: 'Cocoa', base: '#7c4f33', shade: '#5f3a24' },
  { id: 'ebony', name: 'Ebony', base: '#5a3825', shade: '#432818' },
];

export const FACE_SHAPES = [
  { id: 'oval', name: 'Oval' },
  { id: 'heart', name: 'Heart' },
  { id: 'round', name: 'Round' },
  { id: 'soft_square', name: 'Soft Square' },
];

export const EYE_SHAPES = [
  { id: 'doe', name: 'Doe' },
  { id: 'almond', name: 'Almond' },
  { id: 'cat', name: 'Cat Eye' },
  { id: 'round', name: 'Round' },
];

export const EYE_COLORS = [
  { id: 'hazel', name: 'Hazel', color: '#8a5a2b' },
  { id: 'brown', name: 'Brown', color: '#5b3420' },
  { id: 'dark', name: 'Espresso', color: '#2e1a12' },
  { id: 'blue', name: 'Sky Blue', color: '#4a8fd6' },
  { id: 'green', name: 'Emerald', color: '#2f9a6a' },
  { id: 'grey', name: 'Storm Grey', color: '#7f8aa0' },
  { id: 'violet', name: 'Violet', color: '#8c5bd6' },
  { id: 'amber', name: 'Amber', color: '#c98a1c' },
];

export const BROWS = [
  { id: 'soft_arch', name: 'Soft Arch' },
  { id: 'straight', name: 'Straight' },
  { id: 'high_arch', name: 'High Arch' },
  { id: 'feathered', name: 'Feathered' },
];

export const NOSES = [
  { id: 'button', name: 'Button' },
  { id: 'slim', name: 'Slim' },
  { id: 'soft', name: 'Soft' },
];

export const LIPS = [
  { id: 'full', name: 'Full' },
  { id: 'heart', name: 'Heart' },
  { id: 'smile', name: 'Sweet Smile' },
  { id: 'pout', name: 'Pout' },
];

/** Hair colours: natural shades are free; fantasy dyes are sold at the Salon. */
export const HAIR_COLORS = [
  { id: 'black', name: 'Jet Black', color: '#231a22', free: true },
  { id: 'dark_brown', name: 'Dark Brown', color: '#4a2c20', free: true },
  { id: 'chestnut', name: 'Chestnut', color: '#7a4428', free: true },
  { id: 'auburn', name: 'Auburn', color: '#9c3f24', free: true },
  { id: 'honey_blonde', name: 'Honey Blonde', color: '#c8964f', free: true },
  { id: 'platinum', name: 'Platinum', color: '#ece0c6', free: true },
  { id: 'strawberry', name: 'Strawberry', color: '#d9774f', free: true },
  { id: 'bubblegum', name: 'Bubblegum Pink', color: '#f58fbf', price: { coins: 250 } },
  { id: 'lilac', name: 'Lilac Dream', color: '#b79be8', price: { coins: 250 } },
  { id: 'mint', name: 'Mint Sorbet', color: '#8fd9c2', price: { coins: 250 } },
  { id: 'ocean', name: 'Ocean Blue', color: '#5a8de0', price: { coins: 300 } },
  { id: 'silver', name: 'Moon Silver', color: '#c9ccd8', price: { coins: 350 } },
  { id: 'rose_gold', name: 'Rose Gold', color: '#e3a08f', price: { coins: 400 } },
];

/** Hairstyles. `free` ones are part of the starter collection. */
export const HAIRSTYLES = [
  { id: 'long_straight', name: 'Silky Long', free: true, styles: ['elegant', 'casual'] },
  { id: 'bob', name: 'Chic Bob', free: true, styles: ['chic', 'street'] },
  { id: 'ponytail', name: 'High Pony', free: true, styles: ['sporty', 'casual'] },
  { id: 'long_waves', name: 'Mermaid Waves', free: true, styles: ['romantic', 'summer'] },
  { id: 'top_bun', name: 'Ballerina Bun', price: { coins: 300 }, styles: ['elegant', 'chic'] },
  { id: 'curls', name: 'Cloud Curls', price: { coins: 450 }, styles: ['glam', 'boho'] },
  { id: 'pixie', name: 'Pixie Cut', price: { coins: 250 }, styles: ['edgy', 'chic'] },
  { id: 'twin_tails', name: 'Twin Tails', price: { coins: 350 }, styles: ['pastel', 'casual'] },
  { id: 'side_braid', name: 'Fairytale Braid', price: { coins: 500 }, styles: ['princess', 'romantic', 'boho'] },
  { id: 'hollywood', name: 'Hollywood Curls', price: { coins: 750 }, styles: ['vintage', 'glam', 'formal'] },
  { id: 'updo', name: 'Royal Updo', price: { coins: 800 }, styles: ['princess', 'formal', 'elegant'] },
];

/**
 * Makeup products. kind: eyeshadow | eyeliner | lipstick | blush.
 * `none_*` entries let the player remove a layer.
 */
export const MAKEUP = [
  // eyeshadow
  { id: 'es_none', kind: 'eyeshadow', name: 'No Shadow', color: null, free: true },
  { id: 'es_champagne', kind: 'eyeshadow', name: 'Champagne', color: '#e9c9a0', free: true },
  { id: 'es_rose', kind: 'eyeshadow', name: 'Rosé', color: '#e79bb0', free: true },
  { id: 'es_lilac', kind: 'eyeshadow', name: 'Lilac Haze', color: '#b79be8', price: { coins: 120 }, styles: ['pastel'] },
  { id: 'es_smoky', kind: 'eyeshadow', name: 'Smoky Night', color: '#5a4a5e', price: { coins: 150 }, styles: ['edgy', 'glam'] },
  { id: 'es_gold', kind: 'eyeshadow', name: 'Liquid Gold', color: '#e3b553', price: { coins: 200 }, styles: ['glam', 'luxury'] },
  { id: 'es_aqua', kind: 'eyeshadow', name: 'Lagoon', color: '#6fc7d6', price: { coins: 150 }, styles: ['summer'] },
  { id: 'es_bronze', kind: 'eyeshadow', name: 'Bronze Goddess', color: '#a8673f', price: { coins: 180 }, styles: ['boho', 'glam'] },
  // eyeliner
  { id: 'el_none', kind: 'eyeliner', name: 'No Liner', style: 'none', free: true },
  { id: 'el_thin', kind: 'eyeliner', name: 'Soft Line', style: 'thin', free: true },
  { id: 'el_wing', kind: 'eyeliner', name: 'Kitten Wing', style: 'wing', price: { coins: 150 }, styles: ['vintage', 'chic'] },
  { id: 'el_dramatic', kind: 'eyeliner', name: 'Dramatic Wing', style: 'dramatic', price: { coins: 250 }, styles: ['glam', 'edgy'] },
  // lipstick
  { id: 'lip_natural', kind: 'lipstick', name: 'Natural', color: null, free: true },
  { id: 'lip_pink', kind: 'lipstick', name: 'Petal Pink', color: '#ee7fa6', free: true },
  { id: 'lip_nude', kind: 'lipstick', name: 'Nude Satin', color: '#c98a7a', free: true },
  { id: 'lip_red', kind: 'lipstick', name: 'Starlet Red', color: '#d4243f', price: { coins: 200 }, styles: ['vintage', 'glam', 'formal'] },
  { id: 'lip_berry', kind: 'lipstick', name: 'Berry Kiss', color: '#9c2a5a', price: { coins: 180 }, styles: ['edgy', 'winter'] },
  { id: 'lip_coral', kind: 'lipstick', name: 'Coral Crush', color: '#f27a62', price: { coins: 150 }, styles: ['summer'] },
  { id: 'lip_gloss', kind: 'lipstick', name: 'Crystal Gloss', color: '#f6b3c8', gloss: true, price: { coins: 220 }, styles: ['pastel', 'princess'] },
  { id: 'lip_plum', kind: 'lipstick', name: 'Velvet Plum', color: '#6e2a52', price: { coins: 250 }, styles: ['luxury', 'elegant'] },
  // blush
  { id: 'bl_none', kind: 'blush', name: 'No Blush', color: null, free: true },
  { id: 'bl_pink', kind: 'blush', name: 'Baby Pink', color: '#f59bb5', free: true },
  { id: 'bl_peach', kind: 'blush', name: 'Peach Glow', color: '#f7a77f', price: { coins: 100 }, styles: ['summer'] },
  { id: 'bl_rose', kind: 'blush', name: 'Rose Flush', color: '#e46f8f', price: { coins: 120 }, styles: ['romantic'] },
  { id: 'bl_berry', kind: 'blush', name: 'Berry Stain', color: '#c45a86', price: { coins: 150 }, styles: ['winter'] },
];

export const DEFAULT_APPEARANCE = {
  skin: 'peach',
  face: 'oval',
  eyes: 'doe',
  eyeColor: 'hazel',
  brows: 'soft_arch',
  nose: 'button',
  lips: 'full',
  hairStyle: 'long_waves',
  hairColor: 'chestnut',
  eyeshadow: 'es_rose',
  eyeliner: 'el_thin',
  lipstick: 'lip_pink',
  blush: 'bl_pink',
};

export const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
export const SKIN = byId(SKIN_TONES);
export const EYE_COLOR = byId(EYE_COLORS);
export const HAIR_COLOR = byId(HAIR_COLORS);
export const HAIRSTYLE = byId(HAIRSTYLES);
export const MAKEUP_BY_ID = byId(MAKEUP);
