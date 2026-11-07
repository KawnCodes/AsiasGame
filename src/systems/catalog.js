/**
 * Unified lookup over every purchasable catalogue so shops/inventory can treat
 * clothing, hairstyles, hair dyes and makeup the same way.
 *   kind: 'clothing' | 'hairstyle' | 'hairColor' | 'makeup'
 */
import { CLOTHING_BY_ID } from '../data/clothing.js';
import { HAIRSTYLE, HAIR_COLOR, MAKEUP_BY_ID } from '../data/appearance.js';

export const KIND_TABLE = {
  clothing: CLOTHING_BY_ID,
  hairstyle: HAIRSTYLE,
  hairColor: HAIR_COLOR,
  makeup: MAKEUP_BY_ID,
};

/** Where owned ids live in state.inventory for each kind. */
export const INVENTORY_KEY = { clothing: 'clothing', hairstyle: 'hairstyles', hairColor: 'hairColors', makeup: 'makeup' };

export function getEntry(kind, id) {
  return KIND_TABLE[kind]?.[id] || null;
}

export function priceOf(kind, entry) {
  if (!entry) return null;
  if (kind === 'clothing') return entry.price;
  return entry.free ? { coins: 0 } : entry.price || { coins: 0 };
}
