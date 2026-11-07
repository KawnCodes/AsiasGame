/**
 * PROPERTIES & HOME UPGRADES — data only.
 *
 * property.rooms   → base rooms {id, type, name}. Room type picks default wallpaper/floor
 *                    and whether the room is outdoors.
 * property.view    → what the windows look out on (city, garden, skyline, ocean, night, hills)
 * property.upgrades→ upgrade ids that can be bought for this home.
 * Upgrades apply instantly: they add a room and/or a perk (data/upgrade.perk).
 */
export const ROOM_TYPES = {
  bedroom: { name: 'Bedroom', wallpaper: 'wp_pink_stripe', floor: 'fl_oak' },
  living: { name: 'Living Room', wallpaper: 'wp_cream', floor: 'fl_oak' },
  studio: { name: 'Studio Room', wallpaper: 'wp_cream', floor: 'fl_oak' },
  kitchen: { name: 'Kitchen', wallpaper: 'wp_white_tile', floor: 'fl_checker' },
  bathroom: { name: 'Bathroom', wallpaper: 'wp_white_tile', floor: 'fl_marble' },
  dressing: { name: 'Dressing Room', wallpaper: 'wp_blush_paint', floor: 'fl_oak' },
  beauty: { name: 'Beauty Room', wallpaper: 'wp_blush_paint', floor: 'fl_marble' },
  office: { name: 'Home Office', wallpaper: 'wp_cream', floor: 'fl_walnut' },
  dining: { name: 'Dining Room', wallpaper: 'wp_cream', floor: 'fl_oak' },
  music: { name: 'Recording Studio', wallpaper: 'wp_plum_paint', floor: 'fl_walnut' },
  photo: { name: 'Photo Studio', wallpaper: 'wp_white_paint', floor: 'fl_white_wood' },
  cinema: { name: 'Screening Room', wallpaper: 'wp_plum_paint', floor: 'fl_walnut' },
  balcony: { name: 'Balcony', outdoor: true, floor: 'fl_deck' },
  garden: { name: 'Garden', outdoor: true, floor: 'fl_grass' },
  pool: { name: 'Pool Terrace', outdoor: true, floor: 'fl_deck', pool: true },
};

const R = (id, type, name) => ({ id, type, name: name || ROOM_TYPES[type].name });

export const PROPERTIES = [
  {
    id: 'starter_apartment', name: 'Starter Apartment', price: 0, level: 1, view: 'city', exterior: 'apartment',
    address: '12 Rosewood Street', blurb: 'Your cosy first home in the city — small, sweet and all yours.',
    rooms: [R('bedroom', 'bedroom', 'Bedroom')],
    upgrades: ['luxury_vanity', 'big_wardrobe', 'balcony'],
  },
  {
    id: 'cosy_studio', name: 'Cosy Studio', price: 5000, level: 2, view: 'garden', exterior: 'studio',
    address: '3 Lavender Mews', blurb: 'A light-filled studio above a flower shop, with its own little bathroom.',
    rooms: [R('studio', 'studio'), R('bathroom', 'bathroom')],
    upgrades: ['luxury_vanity', 'big_wardrobe', 'balcony', 'photo_studio'],
  },
  {
    id: 'chic_apartment', name: 'Chic City Apartment', price: 15000, level: 3, view: 'city', exterior: 'apartment_tall',
    address: '88 Boutique Avenue', blurb: 'Right above the shops — wake up to the buzz of Boutique Avenue.',
    rooms: [R('living', 'living'), R('bedroom', 'bedroom'), R('kitchen', 'kitchen')],
    upgrades: ['luxury_vanity', 'big_wardrobe', 'balcony', 'expanded_kitchen', 'photo_studio', 'home_studio'],
  },
  {
    id: 'luxury_loft', name: 'Luxury Loft', price: 35000, level: 5, view: 'skyline', exterior: 'loft',
    address: 'The Foundry, Star Boulevard', blurb: 'Exposed brick, double-height windows and a walk-in dressing room.',
    rooms: [R('living', 'living'), R('bedroom', 'bedroom'), R('kitchen', 'kitchen'), R('dressing', 'dressing')],
    upgrades: ['luxury_vanity', 'balcony', 'expanded_kitchen', 'photo_studio', 'home_studio', 'home_cinema', 'luxury_bathroom'],
  },
  {
    id: 'townhouse', name: 'Modern Townhouse', price: 60000, level: 7, view: 'street', exterior: 'townhouse',
    address: '7 Magnolia Row', blurb: 'Three storeys of modern living with a home office and a proper bathroom.',
    rooms: [R('living', 'living'), R('bedroom', 'bedroom'), R('kitchen', 'kitchen'), R('bathroom', 'bathroom'), R('office', 'office')],
    upgrades: ['luxury_vanity', 'big_wardrobe', 'extra_bedroom', 'garden', 'expanded_kitchen', 'photo_studio', 'home_studio', 'home_cinema', 'luxury_bathroom'],
  },
  {
    id: 'beach_house', name: 'Beach House', price: 100000, level: 9, view: 'ocean', exterior: 'beach',
    address: '1 Seashell Point', blurb: 'Sea breeze, sunsets and a balcony right over the waves.',
    rooms: [R('living', 'living'), R('bedroom', 'bedroom'), R('kitchen', 'kitchen'), R('bathroom', 'bathroom'), R('balcony', 'balcony', 'Ocean Balcony')],
    upgrades: ['luxury_vanity', 'big_wardrobe', 'extra_bedroom', 'swimming_pool', 'expanded_kitchen', 'photo_studio', 'home_studio', 'home_cinema', 'luxury_bathroom'],
  },
  {
    id: 'penthouse', name: 'Luxury Penthouse', price: 175000, level: 12, view: 'night', exterior: 'penthouse',
    address: 'Top Floor, Starlight Tower', blurb: 'The whole city sparkles below your floor-to-ceiling windows.',
    rooms: [R('living', 'living'), R('bedroom', 'bedroom'), R('kitchen', 'kitchen'), R('bathroom', 'bathroom'), R('dressing', 'dressing'), R('beauty', 'beauty'), R('balcony', 'balcony', 'Sky Terrace')],
    upgrades: ['luxury_vanity', 'extra_bedroom', 'swimming_pool', 'expanded_kitchen', 'photo_studio', 'home_studio', 'home_cinema', 'luxury_bathroom'],
  },
  {
    id: 'mansion', name: 'Celebrity Mansion', price: 300000, level: 15, view: 'hills', exterior: 'mansion',
    address: '1 Luxury Hills Drive', blurb: 'Gates, gardens, a pool and room for every dream. You\'ve made it.',
    rooms: [R('living', 'living', 'Grand Salon'), R('bedroom', 'bedroom', 'Master Suite'), R('kitchen', 'kitchen'), R('bathroom', 'bathroom'), R('dressing', 'dressing'), R('beauty', 'beauty'), R('office', 'office'), R('garden', 'garden'), R('pool', 'pool')],
    upgrades: ['luxury_vanity', 'extra_bedroom', 'expanded_kitchen', 'photo_studio', 'home_studio', 'home_cinema', 'luxury_bathroom'],
  },
];

/**
 * Upgrades. room → added as a new decoratable room. perk → gameplay effect (applies while
 * you own the upgrade in any home). gift → furniture item added to storage.
 */
export const UPGRADES = [
  { id: 'luxury_vanity', name: 'Luxury Vanity', icon: '💄', price: 4000, gift: 'royal_vanity_gift', perk: { contestCoins: 0.1 }, blurb: 'A Hollywood-bulb vanity delivered to your storage. +10% contest coins.' },
  { id: 'big_wardrobe', name: 'Walk-in Wardrobe', icon: '👗', price: 6000, room: { type: 'dressing', name: 'Walk-in Wardrobe' }, perk: { outfitSlots: 12 }, blurb: 'A whole room for your clothes. Save 12 more looks.' },
  { id: 'extra_bedroom', name: 'Extra Bedroom', icon: '🛏️', price: 8000, room: { type: 'bedroom', name: 'Guest Bedroom' }, blurb: 'A guest bedroom for friends (and more decorating!).' },
  { id: 'expanded_kitchen', name: 'Dining Room', icon: '🍽️', price: 7500, room: { type: 'dining', name: 'Dining Room' }, blurb: 'Knock through for a dining room fit for dinner parties.' },
  { id: 'home_studio', name: 'Home Recording Studio', icon: '🎙️', price: 12000, room: { type: 'music', name: 'Recording Studio' }, perk: { careerCoins: { singing: 0.1 } }, blurb: 'Soundproofed booth. +10% coins from singing jobs.' },
  { id: 'photo_studio', name: 'Photography Room', icon: '📷', price: 12000, room: { type: 'photo', name: 'Photo Studio' }, perk: { careerCoins: { modelling: 0.1 } }, blurb: 'Lights, backdrops, action. +10% coins from modelling jobs.' },
  { id: 'home_cinema', name: 'Screening Room', icon: '🎬', price: 12000, room: { type: 'cinema', name: 'Screening Room' }, perk: { careerCoins: { acting: 0.1 } }, blurb: 'Rehearse your scenes on the big screen. +10% coins from acting jobs.' },
  { id: 'balcony', name: 'Balcony', icon: '🌇', price: 5000, room: { type: 'balcony', name: 'Balcony' }, blurb: 'A pretty balcony with a view.' },
  { id: 'garden', name: 'Garden', icon: '🌷', price: 9000, room: { type: 'garden', name: 'Garden' }, blurb: 'A private garden to fill with flowers.' },
  { id: 'swimming_pool', name: 'Swimming Pool', icon: '🏊', price: 25000, room: { type: 'pool', name: 'Pool Terrace' }, blurb: 'Your very own pool terrace.' },
  { id: 'luxury_bathroom', name: 'Spa Bathroom', icon: '🛁', price: 8000, room: { type: 'bathroom', name: 'Spa Bathroom' }, blurb: 'Marble, gold taps and a soaking tub.' },
];

export const PROPERTY_BY_ID = Object.fromEntries(PROPERTIES.map((p) => [p.id, p]));
export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));
