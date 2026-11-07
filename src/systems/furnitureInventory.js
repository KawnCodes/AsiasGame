/**
 * FURNITURE INVENTORY — every piece of furniture is an *instance* with its own uid, so a
 * player can own several identical chairs and place them in different rooms or homes.
 *   state.furniture = { nextId, items: { uid: { id: itemId, at: null | { property, room } } } }
 * at === null means the piece is in storage. Surfaces (wallpapers / paints / floors) are
 * bought once and can be used in any room: state.inventory.surfaces = [ids].
 */
import { FURNITURE_BY_ID, SURFACE_BY_ID } from '../data/furniture.js';
import { canAfford, spend } from './economy.js';
import { recordEvent } from './questSystem.js';

export const MAX_BUY_QTY = 10;

export function emptyFurniture() {
  return { nextId: 1, items: {} };
}

/** Add instances to storage (no payment). Returns the new uids. */
export function addFurniture(state, itemId, qty = 1) {
  if (!FURNITURE_BY_ID[itemId]) throw new Error(`Unknown furniture ${itemId}`);
  if (!state.furniture) state.furniture = emptyFurniture();
  const uids = [];
  for (let i = 0; i < qty; i++) {
    const uid = `f${state.furniture.nextId++}`;
    state.furniture.items[uid] = { id: itemId, at: null };
    uids.push(uid);
  }
  return uids;
}

export function isForSale(item) {
  return !!item && !!item.shop && !item.starter && !item.hidden;
}

export function buyFurniture(state, itemId, qty = 1) {
  const item = FURNITURE_BY_ID[itemId];
  if (!isForSale(item)) return { ok: false, reason: 'not-for-sale' };
  const n = Math.max(1, Math.min(MAX_BUY_QTY, Math.floor(qty)));
  const price = { coins: item.price.coins * n };
  if (!canAfford(state, price)) return { ok: false, reason: 'insufficient-funds' };
  spend(state, price);
  const uids = addFurniture(state, itemId, n);
  state.stats.itemsBought += n;
  state.stats.furnitureBought = (state.stats.furnitureBought || 0) + n;
  state.ledger.purchases.push({ kind: 'furniture', id: itemId, qty: n, price, at: Date.now() });
  if (state.ledger.purchases.length > 200) state.ledger.purchases.shift();
  recordEvent(state, 'buyFurniture', { amount: n, category: item.category });
  return { ok: true, uids };
}

export function ownsSurface(state, surfaceId) {
  const s = SURFACE_BY_ID[surfaceId];
  if (!s) return false;
  return !!s.free || (state.inventory.surfaces || []).includes(surfaceId);
}

export function buySurface(state, surfaceId) {
  const s = SURFACE_BY_ID[surfaceId];
  if (!s) return { ok: false, reason: 'unknown-item' };
  if (ownsSurface(state, surfaceId)) return { ok: false, reason: 'already-owned' };
  const price = { coins: s.price };
  if (!canAfford(state, price)) return { ok: false, reason: 'insufficient-funds' };
  spend(state, price);
  state.inventory.surfaces = [...(state.inventory.surfaces || []), surfaceId];
  state.stats.itemsBought += 1;
  recordEvent(state, 'buyFurniture', { amount: 1, category: s.kind });
  return { ok: true };
}

/** All owned instances of an item: [{uid, at}] */
export function instancesOf(state, itemId) {
  return Object.entries(state.furniture?.items || {}).filter(([, v]) => v.id === itemId).map(([uid, v]) => ({ uid, at: v.at }));
}

/** Stored (unplaced) pieces grouped by item: [{ item, uids }] sorted by name. */
export function storedGroups(state) {
  const groups = {};
  for (const [uid, v] of Object.entries(state.furniture?.items || {})) {
    if (v.at) continue;
    (groups[v.id] ||= []).push(uid);
  }
  return Object.entries(groups).map(([id, uids]) => ({ item: FURNITURE_BY_ID[id], uids })).filter((g) => g.item).sort((a, b) => a.item.name.localeCompare(b.item.name));
}

export const furnitureCount = (state) => Object.keys(state.furniture?.items || {}).length;
