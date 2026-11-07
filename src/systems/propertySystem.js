/**
 * PROPERTY SYSTEM — buying homes, moving in, and instant home upgrades with perks.
 *   state.properties = { owned: [ids], current: id, upgrades: { propertyId: [upgradeIds] } }
 * Homes are permanent once bought. Upgrades apply immediately (no construction timers).
 */
import { PROPERTY_BY_ID, UPGRADE_BY_ID } from '../data/properties.js';
import { HOUSEWARMING_GIFT } from '../data/furniture.js';
import { canAfford, spend } from './economy.js';
import { recordEvent } from './questSystem.js';
import { ensureHome } from './decoratingSystem.js';
import { addFurniture } from './furnitureInventory.js';

export const ownsProperty = (state, id) => state.properties.owned.includes(id);

export function propertyLockReason(state, id) {
  const p = PROPERTY_BY_ID[id];
  if (!p) return 'Unknown property';
  if (state.player.level < p.level) return `Reach level ${p.level} to buy`;
  return null;
}

export function buyProperty(state, id) {
  const p = PROPERTY_BY_ID[id];
  if (!p) return { ok: false, reason: 'unknown-property' };
  if (ownsProperty(state, id)) return { ok: false, reason: 'already-owned' };
  if (propertyLockReason(state, id)) return { ok: false, reason: 'locked', message: propertyLockReason(state, id) };
  const price = { coins: p.price };
  if (!canAfford(state, price)) return { ok: false, reason: 'insufficient-funds' };
  spend(state, price);
  state.properties.owned.push(id);
  ensureHome(state, id);
  addFurniture(state, HOUSEWARMING_GIFT, 1);
  state.ledger.purchases.push({ kind: 'property', id, price, at: Date.now() });
  recordEvent(state, 'property', { id });
  return { ok: true, property: p };
}

export function moveIn(state, id) {
  if (!ownsProperty(state, id)) return { ok: false, reason: 'not-owned' };
  state.properties.current = id;
  return { ok: true };
}

export const upgradesOf = (state, propertyId) => state.properties.upgrades?.[propertyId] || [];

export function buyUpgrade(state, propertyId, upgradeId) {
  const p = PROPERTY_BY_ID[propertyId];
  const u = UPGRADE_BY_ID[upgradeId];
  if (!p || !u) return { ok: false, reason: 'unknown' };
  if (!ownsProperty(state, propertyId)) return { ok: false, reason: 'not-owned' };
  if (!p.upgrades.includes(upgradeId)) return { ok: false, reason: 'not-available' };
  if (upgradesOf(state, propertyId).includes(upgradeId)) return { ok: false, reason: 'already-owned' };
  const price = { coins: u.price };
  if (!canAfford(state, price)) return { ok: false, reason: 'insufficient-funds' };
  spend(state, price);
  state.properties.upgrades = { ...(state.properties.upgrades || {}), [propertyId]: [...upgradesOf(state, propertyId), upgradeId] };
  ensureHome(state, propertyId); // new rooms appear instantly
  if (u.gift) addFurniture(state, u.gift, 1);
  recordEvent(state, 'upgrade', { id: upgradeId });
  return { ok: true, upgrade: u, newRoom: u.room ? `up_${u.id}` : null };
}

/** Combined perks from every upgrade the player owns (in any home). */
export function perks(state) {
  const out = { contestCoins: 0, outfitSlots: 0, careerCoins: {} };
  // each upgrade type counts once, however many homes have it
  const ids = new Set(Object.values(state.properties?.upgrades || {}).flat());
  {
    for (const id of ids) {
      const perk = UPGRADE_BY_ID[id]?.perk;
      if (!perk) continue;
      out.contestCoins += perk.contestCoins || 0;
      out.outfitSlots += perk.outfitSlots || 0;
      for (const [c, v] of Object.entries(perk.careerCoins || {})) out.careerCoins[c] = (out.careerCoins[c] || 0) + v;
    }
  }
  return out;
}
