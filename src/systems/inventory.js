/**
 * INVENTORY — ownership, purchasing, equipping and saved outfits.
 * Pure functions over a draft game state; each returns {ok, reason?}.
 */
import { CLOTHING_BY_ID, SLOTS } from '../data/clothing.js';
import { HAIRSTYLE, HAIR_COLOR, MAKEUP_BY_ID } from '../data/appearance.js';
import { getEntry, priceOf, INVENTORY_KEY } from './catalog.js';
import { canAfford, spend } from './economy.js';
import { recordEvent } from './questSystem.js';

export const MAX_OUTFITS = 24;

export function owns(state, kind, id) {
  const key = INVENTORY_KEY[kind];
  if (kind === 'clothing') return !!state.inventory.clothing[id];
  const entry = getEntry(kind, id);
  if (entry?.free) return true;
  return state.inventory[key].includes(id);
}

/** Purchase any catalogue entry. Unique items cannot be bought twice. */
export function purchase(state, kind, id) {
  const entry = getEntry(kind, id);
  if (!entry) return { ok: false, reason: 'unknown-item' };
  if (owns(state, kind, id)) return { ok: false, reason: 'already-owned' };
  const price = priceOf(kind, entry);
  if (!canAfford(state, price)) return { ok: false, reason: 'insufficient-funds' };
  if (!spend(state, price)) return { ok: false, reason: 'insufficient-funds' };
  const now = Date.now();
  if (kind === 'clothing') state.inventory.clothing[id] = { acquiredAt: now, favourite: false };
  else state.inventory[INVENTORY_KEY[kind]].push(id);
  state.stats.itemsBought += 1;
  state.ledger.purchases.push({ kind, id, price, at: now });
  if (state.ledger.purchases.length > 200) state.ledger.purchases.shift();
  recordEvent(state, 'buy', { kind, category: entry.category || kind });
  return { ok: true };
}

export function equip(state, itemId) {
  const item = CLOTHING_BY_ID[itemId];
  if (!item) return { ok: false, reason: 'unknown-item' };
  if (!owns(state, 'clothing', itemId)) return { ok: false, reason: 'not-owned' };
  const eq = state.equipped;
  if (item.slot === 'dress') { eq.top = null; eq.bottom = null; }
  if (item.slot === 'top' || item.slot === 'bottom') eq.dress = null;
  eq[item.slot] = itemId;
  return { ok: true };
}

export function unequip(state, slot) {
  if (!SLOTS.includes(slot)) return { ok: false, reason: 'bad-slot' };
  state.equipped[slot] = null;
  return { ok: true };
}

export function toggleEquip(state, itemId) {
  const item = CLOTHING_BY_ID[itemId];
  if (!item) return { ok: false, reason: 'unknown-item' };
  if (state.equipped[item.slot] === itemId) return unequip(state, item.slot);
  return equip(state, itemId);
}

export function isEquipped(state, itemId) {
  return Object.values(state.equipped).includes(itemId);
}

export function toggleFavourite(state, itemId) {
  const rec = state.inventory.clothing[itemId];
  if (!rec) return { ok: false, reason: 'not-owned' };
  rec.favourite = !rec.favourite;
  return { ok: true, favourite: rec.favourite };
}

/** Appearance changes: body/face options are free; hair & makeup must be owned. */
const OWNED_APPEARANCE = { hairStyle: 'hairstyle', hairColor: 'hairColor', eyeshadow: 'makeup', eyeliner: 'makeup', lipstick: 'makeup', blush: 'makeup' };
export function setAppearance(state, patch) {
  for (const [k, v] of Object.entries(patch)) {
    const kind = OWNED_APPEARANCE[k];
    if (kind && !owns(state, kind, v)) return { ok: false, reason: 'not-owned', field: k };
    if (k === 'hairStyle' && !HAIRSTYLE[v]) return { ok: false, reason: 'unknown-item' };
    if (k === 'hairColor' && !HAIR_COLOR[v]) return { ok: false, reason: 'unknown-item' };
    if (kind === 'makeup' && MAKEUP_BY_ID[v]?.kind !== k) return { ok: false, reason: 'wrong-kind' };
  }
  Object.assign(state.appearance, patch);
  return { ok: true };
}

// ---------------- saved outfits ----------------
export function saveOutfit(state, name) {
  if (state.outfits.length >= MAX_OUTFITS) return { ok: false, reason: 'outfit-limit' };
  const clean = String(name || '').trim().slice(0, 24) || `Look ${state.outfits.length + 1}`;
  const outfit = {
    id: `o${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    name: clean,
    equipped: { ...state.equipped },
    hair: { hairStyle: state.appearance.hairStyle, hairColor: state.appearance.hairColor },
    makeup: { eyeshadow: state.appearance.eyeshadow, eyeliner: state.appearance.eyeliner, lipstick: state.appearance.lipstick, blush: state.appearance.blush },
    favourite: false,
    createdAt: Date.now(),
  };
  state.outfits.push(outfit);
  recordEvent(state, 'outfit');
  return { ok: true, outfit };
}

export function applyOutfit(state, outfitId) {
  const o = state.outfits.find((x) => x.id === outfitId);
  if (!o) return { ok: false, reason: 'unknown-outfit' };
  for (const slot of SLOTS) {
    const id = o.equipped[slot];
    state.equipped[slot] = id && owns(state, 'clothing', id) ? id : null;
  }
  const look = { ...o.hair, ...o.makeup };
  for (const [k, v] of Object.entries(look)) setAppearance(state, { [k]: v }); // skips anything no longer owned
  return { ok: true };
}

export function deleteOutfit(state, outfitId) {
  const i = state.outfits.findIndex((x) => x.id === outfitId);
  if (i < 0) return { ok: false, reason: 'unknown-outfit' };
  state.outfits.splice(i, 1);
  return { ok: true };
}

export function toggleOutfitFavourite(state, outfitId) {
  const o = state.outfits.find((x) => x.id === outfitId);
  if (!o) return { ok: false, reason: 'unknown-outfit' };
  o.favourite = !o.favourite;
  return { ok: true };
}

export const wardrobeSize = (state) => Object.keys(state.inventory.clothing).length;
