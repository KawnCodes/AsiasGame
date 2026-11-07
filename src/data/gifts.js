/** GIFTS — bought and given in one step from a character's profile. */
export const GIFTS = [
  { id: 'roses', name: 'Bouquet of Roses', icon: '🌹', price: 150 },
  { id: 'chocolates', name: 'Luxury Chocolates', icon: '🍫', price: 120 },
  { id: 'cupcakes', name: 'Box of Cupcakes', icon: '🧁', price: 100 },
  { id: 'vinyl', name: 'Vintage Vinyl Record', icon: '💿', price: 300 },
  { id: 'film_roll', name: 'Camera Film Set', icon: '🎞️', price: 200 },
  { id: 'silk_scarf', name: 'Silk Scarf', icon: '🧣', price: 450 },
  { id: 'perfume', name: 'Designer Fragrance', icon: '🫧', price: 600 },
  { id: 'sketchbook', name: 'Leather Sketchbook', icon: '📓', price: 180 },
  { id: 'cookbook', name: 'Pâtisserie Cookbook', icon: '📖', price: 220 },
  { id: 'tickets', name: 'Concert Tickets', icon: '🎟️', price: 500 },
  { id: 'teddy', name: 'Cuddly Teddy', icon: '🧸', price: 250 },
  { id: 'candle', name: 'Scented Candle', icon: '🕯️', price: 140 },
  { id: 'succulent', name: 'Little Succulent', icon: '🪴', price: 120 },
  { id: 'surf_wax', name: 'Coconut Surf Wax', icon: '🥥', price: 90 },
];
export const GIFT_BY_ID = Object.fromEntries(GIFTS.map((g) => [g.id, g]));
