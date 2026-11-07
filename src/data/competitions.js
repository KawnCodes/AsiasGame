/**
 * FASHION CONTESTS — themes, judges and rival contestants (data only).
 *
 * theme.styles   → style tags the judges look for, with weights (0..1)
 * theme.palette  → colours that read as "on theme" for colour-harmony scoring
 * theme.makeup   → makeup product ids that earn a signature-look bonus
 * theme.hairColors → hair colour ids that suit the theme (optional)
 * theme.preferDress → full-length looks (dress/gown/jumpsuit) suit this theme best
 */
export const THEMES = [
  {
    id: 'red_carpet', name: 'Red Carpet Glamour', icon: '🌹',
    blurb: 'Flashbulbs, velvet ropes and show-stopping gowns. Sparkle like a true star.',
    styles: { glam: 1, formal: 1, luxury: 0.8, elegant: 0.6 },
    palette: ['#c3122f', '#d22f4b', '#e6bd62', '#231d29', '#efd7a8'],
    makeup: ['lip_red', 'el_wing', 'el_dramatic', 'es_gold'], preferDress: true,
  },
  {
    id: 'summer_chic', name: 'Summer Chic', icon: '☀️',
    blurb: 'Sunshine, sea breeze and effortless seaside style.',
    styles: { summer: 1, chic: 0.8, casual: 0.6, boho: 0.6 },
    palette: ['#fff3a6', '#ff9a86', '#a9e8d2', '#ffffff', '#7cc6f2', '#e6c98f'],
    makeup: ['lip_coral', 'bl_peach', 'es_aqua'],
  },
  {
    id: 'royal_princess', name: 'Royal Princess', icon: '👑',
    blurb: 'A ball at the palace. Tiaras, ballgowns and storybook elegance.',
    styles: { princess: 1, formal: 0.8, elegant: 0.7, luxury: 0.6 },
    palette: ['#3657b8', '#ffb7cf', '#f0c766', '#e7f3ff', '#e3d1ff'],
    makeup: ['lip_gloss', 'es_lilac', 'bl_pink'], preferDress: true,
  },
  {
    id: 'romantic_date', name: 'Romantic Date', icon: '💕',
    blurb: 'Candlelight dinner for two. Sweet, soft and irresistibly charming.',
    styles: { romantic: 1, chic: 0.6, pastel: 0.5, elegant: 0.5 },
    palette: ['#ff8fbd', '#d22f4b', '#ffd6e5', '#fffaf2', '#e8789f'],
    makeup: ['lip_pink', 'bl_rose', 'lip_red'],
  },
  {
    id: 'vintage_hollywood', name: 'Vintage Hollywood', icon: '🎞️',
    blurb: 'Old-school silver-screen glamour: victory curls, red lips and pearls.',
    styles: { vintage: 1, glam: 0.7, elegant: 0.6, formal: 0.5 },
    palette: ['#c3122f', '#231d29', '#fbf4ea', '#e6334f', '#e6bd62'],
    makeup: ['lip_red', 'el_wing'],
  },
  {
    id: 'elegant_evening', name: 'Elegant Evening', icon: '🥂',
    blurb: 'An exclusive soirée. Refined, polished and quietly breathtaking.',
    styles: { elegant: 1, formal: 0.9, chic: 0.6, luxury: 0.5 },
    palette: ['#231d29', '#d9d4ef', '#1e1830', '#efd7a8', '#6b1f4a'],
    makeup: ['lip_plum', 'es_smoky', 'el_wing'], preferDress: true,
  },
  {
    id: 'winter_wonderland', name: 'Winter Wonderland', icon: '❄️',
    blurb: 'Snowflakes and sparkle. Cosy luxury with an icy-queen twist.',
    styles: { winter: 1, glam: 0.5, princess: 0.5, luxury: 0.4 },
    palette: ['#e7f3ff', '#fbf7f4', '#c9ccd8', '#b9d7ff', '#6b1f4a'],
    makeup: ['bl_berry', 'lip_berry', 'es_lilac'], hairColors: ['silver', 'platinum'],
  },
  {
    id: 'street_style', name: 'Street Style', icon: '🛹',
    blurb: 'Bold, cool and totally you. Denim, leather and attitude.',
    styles: { street: 1, edgy: 0.8, sporty: 0.6, casual: 0.5 },
    palette: ['#2b2833', '#7fa6d9', '#ff4f9a', '#ffffff', '#1f1a24'],
    makeup: ['el_dramatic', 'es_smoky', 'lip_berry'],
  },
  {
    id: 'pastel_princess', name: 'Pastel Princess', icon: '🦄',
    blurb: 'Candy colours, ribbons and dreamy fairytale softness.',
    styles: { pastel: 1, princess: 0.8, romantic: 0.6 },
    palette: ['#ffc6de', '#c9b2f2', '#a9e8d2', '#fff3a6', '#e3d1ff'],
    makeup: ['lip_gloss', 'es_lilac', 'bl_pink'], hairColors: ['bubblegum', 'lilac', 'mint', 'rose_gold'],
  },
  {
    id: 'luxury_fashion', name: 'Luxury Fashion', icon: '💎',
    blurb: 'Designer labels only. Gold, couture and serious statement pieces.',
    styles: { luxury: 1, glam: 0.8, chic: 0.6, elegant: 0.6 },
    palette: ['#e3b553', '#231d29', '#efd7a8', '#fbf4ea', '#6b1f4a'],
    makeup: ['es_gold', 'lip_plum', 'el_wing'],
  },
];

export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t]));

/** Score categories (each 0..10) and their display names. */
export const CATEGORIES = {
  theme: 'Theme', coordination: 'Coordination', colour: 'Colour harmony', hair: 'Hairstyle',
  makeup: 'Makeup', accessories: 'Accessories', rarity: 'Rarity', creativity: 'Creativity',
};

/** The judging panel — original NPCs. Weights say what each judge cares about. */
export const JUDGES = [
  {
    id: 'celeste', name: 'Madame Céleste', role: 'Couture designer',
    look: { appearance: { skin: 'golden', hairStyle: 'updo', hairColor: 'black', eyes: 'cat', eyeliner: 'el_dramatic', lipstick: 'lip_red' }, equipped: { dress: 'dr_black_bodycon', necklace: 'neck_pearls', earrings: 'ear_pearl' } },
    weights: { theme: 2, rarity: 2, colour: 1, coordination: 1, accessories: 1, hair: 1, makeup: 1, creativity: 0.5 },
  },
  {
    id: 'rio', name: 'Rio Vega', role: 'Street-style photographer',
    look: { appearance: { skin: 'caramel', hairStyle: 'pixie', hairColor: 'ocean', eyes: 'almond', eyeshadow: 'es_smoky' }, equipped: { outerwear: 'jk_leather', top: 'top_black_tank', earrings: 'ear_silver_hoops', necklace: 'neck_velvet_choker' } },
    weights: { theme: 1.5, creativity: 2.5, accessories: 2, colour: 1, coordination: 0.5, hair: 1, makeup: 0.5, rarity: 0.5 },
  },
  {
    id: 'primrose', name: 'Lady Primrose Ashby', role: 'Etiquette & style icon',
    look: { appearance: { skin: 'porcelain', hairStyle: 'hollywood', hairColor: 'silver', eyes: 'doe', lipstick: 'lip_nude' }, equipped: { top: 'top_poet_blouse', bottom: 'bot_cream_midi', necklace: 'neck_pearls', earrings: 'ear_pearl', hairAcc: 'hacc_headband' } },
    weights: { theme: 2, colour: 2, coordination: 2, hair: 1.5, makeup: 1.5, accessories: 0.5, rarity: 0.5, creativity: 0.5 },
  },
];

/** What judges say about their best / weakest category for your look. */
export const JUDGE_LINES = {
  good: {
    theme: ['This is the theme brought to life!', 'You understood the brief perfectly.'],
    coordination: ['Every piece works together beautifully.', 'So pulled-together — not a thread out of place.'],
    colour: ['Those colours sing together!', 'A gorgeous, harmonious palette.'],
    hair: ['That hair is a total moment.', 'Your hairstyle frames the look perfectly.'],
    makeup: ['Flawless makeup — camera-ready!', 'The makeup elevates everything.'],
    accessories: ['The accessories are the cherry on top.', 'Love how you finished the look.'],
    rarity: ['Ooh, rare pieces. Very exclusive!', 'Those are collector-level pieces, darling.'],
    creativity: ['So original — I\'ve never seen it styled this way!', 'Fresh, fun and full of personality.'],
  },
  bad: {
    theme: ['I\'m not sure this fits the theme…', 'Re-read the brief next time, sweetie.'],
    coordination: ['The pieces feel a little mismatched.', 'It doesn\'t quite come together yet.'],
    colour: ['The colours are fighting each other.', 'Try a palette closer to the theme.'],
    hair: ['The hair doesn\'t match the mood.', 'A different hairstyle would lift this.'],
    makeup: ['The makeup needs more drama for this theme.', 'Don\'t forget your signature makeup!'],
    accessories: ['It feels unfinished without accessories.', 'Add some jewellery or a bag next time.'],
    rarity: ['A few statement pieces would elevate this.', 'Invest in something special.'],
    creativity: ['Safe… maybe a little too safe.', 'Take a fashion risk next time!'],
  },
};

/** Rival contestant names (original characters). */
export const RIVAL_NAMES = [
  'Bella Rosewood', 'Kiki Lune', 'Sasha Bright', 'Mimi Haru', 'Zara Vale', 'Lottie Pearl', 'Ivy Moss', 'Nadia Starling',
  'Priya Belle', 'Amara Sol', 'Juniper Fay', 'Valentina Rue', 'Hazel Quinn', 'Sienna Dove', 'Ruby Lark', 'Marisol Day',
];
