/**
 * CITY LOCATIONS — data for the illustrated city map.
 *
 * status: 'open' → tappable and functional now (optionally gated by requires.level)
 *         'soon' → drawn on the map with a "Coming soon" ribbon; tapping explains
 *                  which update opens it (we never fake a working screen).
 * art: parameters for the procedural building renderer (components/art/cityArt.js)
 */
export const DISTRICTS = [
  { id: 'home_street', name: 'Rosewood Street', y: 18 },
  { id: 'boutique_avenue', name: 'Boutique Avenue', y: 328 },
  { id: 'star_boulevard', name: 'Star Boulevard', y: 816 },
  { id: 'riverside', name: 'Romance Riverside', y: 1176 },
  { id: 'luxury_hills', name: 'Luxury Hills', y: 1474 },
];

export const LOCATIONS = [
  // Rosewood Street — home
  { id: 'home', name: 'My Apartment', district: 'home_street', status: 'open', action: { type: 'screen', screen: 'home' }, x: 18, y: 70, art: { kind: 'apartment', w: 150, h: 200, wall: '#ffd8e6', trim: '#ffffff', roof: '#c96f9a' } },
  { id: 'cafe', name: 'Sugarplum Café', district: 'home_street', status: 'soon', soon: 'Dating & social update', x: 214, y: 120, art: { kind: 'cafe', w: 158, h: 140, wall: '#fff1d6', awning: '#ff8fb8', trim: '#ffffff' } },

  // Boutique Avenue
  { id: 'shop_everyday', name: 'Petal & Thread', district: 'boutique_avenue', status: 'open', action: { type: 'shop', shop: 'everyday' }, x: 16, y: 380, art: { kind: 'boutique', w: 112, h: 150, wall: '#ffe3ee', awning: '#ff7eb6', trim: '#fff' } },
  { id: 'shop_luxury', name: 'Maison Étoile', district: 'boutique_avenue', status: 'open', action: { type: 'shop', shop: 'luxury' }, x: 140, y: 360, art: { kind: 'luxury', w: 112, h: 170, wall: '#3b2c52', awning: '#e8c26e', trim: '#f6e7c1' } },
  { id: 'shop_shoes', name: 'Stiletto Lane', district: 'boutique_avenue', status: 'open', action: { type: 'shop', shop: 'shoes' }, x: 264, y: 384, art: { kind: 'boutique', w: 108, h: 146, wall: '#e3f0ff', awning: '#6fa8ff', trim: '#fff' } },
  { id: 'shop_jewellery', name: 'Glimmer Jewellers', district: 'boutique_avenue', status: 'open', action: { type: 'shop', shop: 'jewellery' }, x: 16, y: 600, art: { kind: 'boutique', w: 112, h: 150, wall: '#efe6ff', awning: '#b48cff', trim: '#fff' } },
  { id: 'shop_accessories', name: 'The Ribbon Box', district: 'boutique_avenue', status: 'open', action: { type: 'shop', shop: 'accessories' }, x: 140, y: 606, art: { kind: 'boutique', w: 112, h: 144, wall: '#fff0d6', awning: '#ffa95e', trim: '#fff' } },
  { id: 'salon', name: 'Silk & Curl Salon', district: 'boutique_avenue', status: 'open', action: { type: 'shop', shop: 'salon' }, x: 264, y: 596, art: { kind: 'salon', w: 108, h: 154, wall: '#dcf8ee', awning: '#3fbf9a', trim: '#fff' } },

  // Star Boulevard — careers & pageants
  { id: 'makeup', name: 'Blush Studio', district: 'star_boulevard', status: 'open', action: { type: 'shop', shop: 'makeup' }, x: 16, y: 870, art: { kind: 'boutique', w: 112, h: 146, wall: '#ffe6e0', awning: '#ff7d6e', trim: '#fff' } },
  { id: 'agency', name: 'Belle Model Agency', district: 'star_boulevard', status: 'open', action: { type: 'career', career: 'modelling' }, x: 140, y: 850, art: { kind: 'tower', w: 112, h: 170, wall: '#f4f0ff', trim: '#b48cff', roof: '#8c6be0' } },
  { id: 'studio_music', name: 'Starlight Records', district: 'star_boulevard', status: 'open', requires: { level: 2 }, action: { type: 'career', career: 'singing' }, x: 264, y: 872, art: { kind: 'studio', w: 108, h: 148, wall: '#2f2a44', trim: '#ff7eb6', roof: '#ff7eb6' } },
  { id: 'studio_film', name: 'Silver Screen Studios', district: 'star_boulevard', status: 'open', requires: { level: 3 }, action: { type: 'career', career: 'acting' }, x: 16, y: 1046, art: { kind: 'studio', w: 168, h: 76, wall: '#fff4d6', trim: '#e8c26e', roof: '#d9a640' } },
  { id: 'pageant', name: 'Grand Pavilion', district: 'star_boulevard', status: 'soon', soon: 'Fashion contests update (Milestone 3)', x: 200, y: 1030, art: { kind: 'pavilion', w: 172, h: 92, wall: '#fff', trim: '#e8c26e', roof: '#ffb3cf' } },

  // Romance Riverside
  { id: 'restaurant', name: 'La Rosette', district: 'riverside', status: 'soon', soon: 'Dating update (Milestone 5)', x: 16, y: 1220, art: { kind: 'cafe', w: 150, h: 130, wall: '#fff6ee', awning: '#c2193a', trim: '#fff' } },
  { id: 'park', name: 'Heart Lake Park', district: 'riverside', status: 'soon', soon: 'Dating update (Milestone 5)', x: 184, y: 1226, art: { kind: 'park', w: 188, h: 124 } },
  { id: 'arcade', name: 'Glitter Arcade', district: 'riverside', status: 'soon', soon: 'Minigames update (Milestone 6)', x: 16, y: 1382, art: { kind: 'studio', w: 150, h: 64, wall: '#3a2c5c', trim: '#7ce0ff', roof: '#ff7eb6' } },
  { id: 'social', name: 'The Social Club', district: 'riverside', status: 'soon', soon: 'Social update (Milestone 5)', x: 184, y: 1376, art: { kind: 'boutique', w: 188, h: 70, wall: '#e8f7ff', awning: '#7cc6f2', trim: '#fff' } },

  // Luxury Hills
  { id: 'property', name: 'Dream Homes Realty', district: 'luxury_hills', status: 'soon', soon: 'Property update (Milestone 4)', x: 16, y: 1510, art: { kind: 'house', w: 150, h: 130, wall: '#fffaf0', trim: '#e8c26e', roof: '#6f8fd8' } },
  { id: 'furniture', name: 'Cosy Living & Glam Interiors', district: 'luxury_hills', status: 'soon', soon: 'Home decorating update (Milestone 4)', x: 184, y: 1510, art: { kind: 'boutique', w: 188, h: 130, wall: '#f5ece2', awning: '#b08a6a', trim: '#fff' } },
];
