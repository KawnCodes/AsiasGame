/**
 * HOME DESIGN CONTESTS — decorate a room to a theme; judged on theme, colour harmony,
 * furniture coordination, layout and variety.
 * styles: home-style collections that suit the theme (weights 0..1)
 * roomTypes: rooms that suit the brief (a matching room type earns theme points)
 * palette: colours the judges want to see
 */
export const HOME_THEMES = [
  { id: 'dream_bedroom', name: 'Dream Bedroom', icon: '🛏️', blurb: 'The bedroom of your dreams — cosy, pretty and totally you.', roomTypes: ['bedroom'], styles: { pink_princess: 1, pastel_dream: 1, romantic_cottage: 0.8, parisian_chic: 0.6 }, palette: ['#ffc2dc', '#dccbff', '#fff6ee', '#ffffff'], wantsFunc: 'bed' },
  { id: 'autumn_living', name: 'Cosy Autumn Living Room', icon: '🍂', blurb: 'Warm woods, soft throws and somewhere to curl up with a book.', roomTypes: ['living', 'studio'], styles: { dark_academia: 1, romantic_cottage: 1, vintage_glamour: 0.6 }, palette: ['#4a362b', '#b08a4a', '#c99a6b', '#6b2f2f'] },
  { id: 'luxury_penthouse', name: 'Luxury Penthouse', icon: '🌃', blurb: 'Black, gold and glamour — a living space fit for a celebrity.', roomTypes: ['living', 'dining'], styles: { hollywood_luxury: 1, royal_palace: 0.7, modern_minimalist: 0.5 }, palette: ['#262030', '#e6c27a', '#efe3c8', '#e3b553'] },
  { id: 'princess_suite', name: 'Pink Princess Suite', icon: '👑', blurb: 'Pink, gold and sparkle in every corner.', roomTypes: ['bedroom', 'dressing', 'beauty'], styles: { pink_princess: 1, royal_palace: 0.6, pastel_dream: 0.6 }, palette: ['#ffc2dc', '#ff8fbd', '#f2c86a', '#ffffff'] },
  { id: 'mansion_salon', name: 'Celebrity Mansion Salon', icon: '🏛️', blurb: 'A grand room that says "red carpet, but at home".', roomTypes: ['living', 'dining'], styles: { royal_palace: 1, hollywood_luxury: 0.9, vintage_glamour: 0.6 }, palette: ['#3657b8', '#f0c766', '#8a2342', '#f5ede0'] },
  { id: 'beachfront', name: 'Beachfront Paradise', icon: '🏖️', blurb: 'Sea breeze, blue and white, and sunshine all day.', roomTypes: ['living', 'balcony', 'pool', 'bedroom'], styles: { coastal_beach: 1, modern_minimalist: 0.5 }, palette: ['#f6f1e7', '#5a8de0', '#bfe3f2', '#d8b98d'] },
  { id: 'parisian_studio', name: 'Parisian Studio', icon: '🗼', blurb: 'Toile, navy and brass — très chic.', roomTypes: ['studio', 'living', 'bedroom'], styles: { parisian_chic: 1, vintage_glamour: 0.5 }, palette: ['#f7efe6', '#2d3d74', '#c9a24e', '#c9b8d8'] },
  { id: 'pastel_dream', name: 'Pastel Dreamland', icon: '🦄', blurb: 'Lilac clouds, mint and candyfloss pink.', roomTypes: ['bedroom', 'beauty', 'dressing', 'studio'], styles: { pastel_dream: 1, pink_princess: 0.6 }, palette: ['#dccbff', '#a9e8d2', '#ffd6e5', '#fff3e6'] },
];
export const HOME_THEME_BY_ID = Object.fromEntries(HOME_THEMES.map((t) => [t.id, t]));
