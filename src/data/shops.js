/**
 * SHOPS — each shop lists what it sells via `sells` (kind + filter) and a visual theme
 * used by the shop interior renderer. Add a shop here + a location in locations.js.
 */
export const SHOPS = [
  {
    id: 'everyday', name: 'Petal & Thread', type: 'Everyday Fashion Boutique',
    tagline: 'Cute everyday looks at sweet prices.',
    sells: [{ kind: 'clothing', shop: 'everyday' }],
    theme: { wall: '#ffe3ee', wall2: '#ffd0e2', floor: '#f6d7c3', accent: '#ff7eb6', trim: '#ffffff', sign: '#d14e8b' },
    keeper: { name: 'Poppy', appearance: { skin: 'peach', hairStyle: 'twin_tails', hairColor: 'strawberry', eyes: 'round', lipstick: 'lip_pink' }, equipped: { top: 'top_heart_tee', bottom: 'bot_pink_mini', earrings: 'ear_silver_studs' } },
    greeting: 'Welcome in, darling! New arrivals every season.',
  },
  {
    id: 'luxury', name: 'Maison Étoile', type: 'Luxury Designer Boutique',
    tagline: 'Couture gowns, statement coats & red-carpet glamour.',
    sells: [{ kind: 'clothing', shop: 'luxury' }],
    theme: { wall: '#2f2340', wall2: '#3b2c52', floor: '#e9d8b4', accent: '#e8c26e', trim: '#f6e7c1', sign: '#e8c26e', dark: true },
    keeper: { name: 'Madame Céleste', appearance: { skin: 'golden', hairStyle: 'updo', hairColor: 'black', eyes: 'cat', eyeliner: 'el_dramatic', lipstick: 'lip_red' }, equipped: { dress: 'dr_black_bodycon', necklace: 'neck_pearls', earrings: 'ear_pearl' } },
    greeting: 'Bienvenue. Only the finest for a future icon.',
  },
  {
    id: 'shoes', name: 'Stiletto Lane', type: 'Shoe Boutique',
    tagline: 'Heels, boots, flats & sneakers.',
    sells: [{ kind: 'clothing', shop: 'shoes' }],
    theme: { wall: '#e9f4ff', wall2: '#d6e9ff', floor: '#f3e6d6', accent: '#6fa8ff', trim: '#ffffff', sign: '#3d6fc4' },
    keeper: { name: 'Jade', appearance: { skin: 'mocha', hairStyle: 'pixie', hairColor: 'dark_brown', eyes: 'almond' }, equipped: { top: 'top_stripe_tee', bottom: 'bot_white_jeans', earrings: 'ear_gold_hoops' } },
    greeting: 'Every great look starts from the ground up!',
  },
  {
    id: 'jewellery', name: 'Glimmer Jewellers', type: 'Jewellery Store',
    tagline: 'Earrings, necklaces & bracelets that sparkle.',
    sells: [{ kind: 'clothing', shop: 'jewellery' }],
    theme: { wall: '#f3ecff', wall2: '#e6dbff', floor: '#efe6f6', accent: '#b48cff', trim: '#ffffff', sign: '#7d55d6' },
    keeper: { name: 'Opal', appearance: { skin: 'porcelain', hairStyle: 'long_straight', hairColor: 'platinum', eyes: 'doe', eyeshadow: 'es_rose' }, equipped: { top: 'top_satin_cami', outerwear: 'jk_lilac_cardi', necklace: 'neck_star_pendant', earrings: 'ear_pearl' } },
    greeting: 'A little sparkle never hurt anyone.',
  },
  {
    id: 'accessories', name: 'The Ribbon Box', type: 'Accessories Shop',
    tagline: 'Handbags, bows, berets & hair treasures.',
    sells: [{ kind: 'clothing', shop: 'accessories' }],
    theme: { wall: '#fff3dd', wall2: '#ffe8c2', floor: '#f2dcc0', accent: '#ffa95e', trim: '#ffffff', sign: '#d97a2b' },
    keeper: { name: 'Marigold', appearance: { skin: 'caramel', hairStyle: 'side_braid', hairColor: 'auburn', eyes: 'doe' }, equipped: { top: 'top_off_coral', bottom: 'bot_floral_midi', hairAcc: 'hacc_daisy_clip', earrings: 'ear_gold_hoops' } },
    greeting: 'The perfect finishing touch is waiting for you.',
  },
  {
    id: 'salon', name: 'Silk & Curl Salon', type: 'Hair Salon',
    tagline: 'New styles and dreamy dyes.',
    sells: [{ kind: 'hairstyle' }, { kind: 'hairColor' }],
    theme: { wall: '#e5fbf3', wall2: '#cdf3e6', floor: '#f6efe8', accent: '#3fbf9a', trim: '#ffffff', sign: '#24977a' },
    keeper: { name: 'Coco', appearance: { skin: 'cocoa', hairStyle: 'curls', hairColor: 'lilac', eyes: 'almond', lipstick: 'lip_berry' }, equipped: { top: 'top_black_tank', bottom: 'bot_black_jeans', earrings: 'ear_silver_hoops' } },
    greeting: 'Sit down, relax — let\'s find your signature hair!',
  },
  {
    id: 'makeup', name: 'Blush Studio', type: 'Makeup Studio',
    tagline: 'Shadows, liners, lipsticks & blush.',
    sells: [{ kind: 'makeup' }],
    theme: { wall: '#ffe9e4', wall2: '#ffd9d1', floor: '#f6e0d6', accent: '#ff7d6e', trim: '#ffffff', sign: '#d4544a' },
    keeper: { name: 'Bijou', appearance: { skin: 'honey', hairStyle: 'hollywood', hairColor: 'honey_blonde', eyes: 'cat', eyeshadow: 'es_gold', eyeliner: 'el_wing', lipstick: 'lip_coral', blush: 'bl_peach' }, equipped: { top: 'top_pink_blouse', bottom: 'bot_cream_midi', earrings: 'ear_ruby_drops' } },
    greeting: 'Glow up time! Try any colour on before you buy.',
  },
];

export const SHOP_BY_ID = Object.fromEntries(SHOPS.map((s) => [s.id, s]));
