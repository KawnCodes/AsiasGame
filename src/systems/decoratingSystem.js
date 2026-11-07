/**
 * DECORATING — room layouts, placement rules and surfaces.
 *
 * Room space is 390 × 420 units (same as the room art):
 *   wall  : y 22 → 280   (wall items hang here; anchor = centre)
 *   floor : y 300 → 416  (floor items stand here; anchor = bottom-centre; rugs lie here)
 * Floor items get a gentle perspective: further back (smaller y) = slightly smaller, and
 * everything is depth-sorted by y so nearer pieces overlap further ones naturally.
 * Positions are always clamped into the right zone, so a sofa can never float up the wall
 * and a painting can never sit on the floor.
 *
 * Layout: state.homes[propertyId].rooms[roomId] = { wallpaper, floor, placed: { uid: {x, y, flip} } }
 */
import { FURNITURE_BY_ID, SURFACE_BY_ID, STARTER_LAYOUT } from '../data/furniture.js';
import { PROPERTY_BY_ID, ROOM_TYPES, UPGRADE_BY_ID } from '../data/properties.js';
import { addFurniture, ownsSurface } from './furnitureInventory.js';
import { recordEvent } from './questSystem.js';

export const ROOM = { W: 390, H: 420, WALL_TOP: 22, WALL_BOTTOM: 280, FLOOR_TOP: 300, FLOOR_BOTTOM: 416 };
export const MAX_ITEMS_PER_ROOM = 40;

export const floorScale = (y) => 0.78 + 0.22 * Math.max(0, Math.min(1, (y - ROOM.FLOOR_TOP) / (ROOM.FLOOR_BOTTOM - ROOM.FLOOR_TOP)));
export const itemScale = (item, y) => (item.placement === 'wall' ? 1 : floorScale(y));

/** Keep a piece inside its zone. Returns integer {x, y}. */
export function clampPosition(item, x, y) {
  const cl = (v, lo, hi) => Math.round(Math.max(lo, Math.min(hi, v)));
  if (item.placement === 'wall') {
    return { x: cl(x, item.w / 2 + 4, ROOM.W - item.w / 2 - 4), y: cl(y, ROOM.WALL_TOP + item.h / 2, ROOM.WALL_BOTTOM - item.h / 2) };
  }
  if (item.placement === 'rug') {
    const yy = cl(y, ROOM.FLOOR_TOP + 14, ROOM.FLOOR_BOTTOM - 14);
    const s = floorScale(yy);
    return { x: cl(x, (item.w * s) / 2 + 2, ROOM.W - (item.w * s) / 2 - 2), y: yy };
  }
  const yy = cl(y, ROOM.FLOOR_TOP, ROOM.FLOOR_BOTTOM);
  const s = floorScale(yy);
  return { x: cl(x, (item.w * s) / 2 + 2, ROOM.W - (item.w * s) / 2 - 2), y: yy };
}

/** Axis-aligned box of a placed piece (for overlap checks and hit areas). */
export function boxOf(item, x, y) {
  const s = itemScale(item, y);
  const w = item.w * s; const h = item.h * s;
  if (item.placement === 'floor') return { x0: x - w / 2, x1: x + w / 2, y0: y - h, y1: y };
  return { x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 };
}

// ------------------------------------------------------------------ rooms
export function roomsOf(state, propertyId) {
  const p = PROPERTY_BY_ID[propertyId];
  if (!p) return [];
  const ups = state.properties.upgrades?.[propertyId] || [];
  const extra = ups.map((u) => UPGRADE_BY_ID[u]).filter((u) => u?.room).map((u) => ({ id: `up_${u.id}`, type: u.room.type, name: u.room.name, upgrade: u.id }));
  return [...p.rooms, ...extra];
}

export function roomDef(state, propertyId, roomId) {
  return roomsOf(state, propertyId).find((r) => r.id === roomId) || null;
}

/** Create layouts for any rooms of a home that don't have one yet. */
export function ensureHome(state, propertyId) {
  if (!state.homes) state.homes = {};
  const home = (state.homes[propertyId] ||= { rooms: {} });
  for (const r of roomsOf(state, propertyId)) {
    if (home.rooms[r.id]) continue;
    const t = ROOM_TYPES[r.type];
    home.rooms[r.id] = { wallpaper: t.outdoor ? null : t.wallpaper, floor: t.floor, placed: {} };
  }
  return home;
}

export function layoutOf(state, propertyId, roomId) {
  return state.homes?.[propertyId]?.rooms?.[roomId] || null;
}

/** Starter Apartment furniture for brand-new players (and Milestone 1–3 saves). */
export function initStarterHome(state) {
  ensureHome(state, 'starter_apartment');
  const room = state.homes.starter_apartment.rooms.bedroom;
  if (Object.keys(room.placed).length) return;
  for (const p of STARTER_LAYOUT) {
    const [uid] = addFurniture(state, p.id, 1);
    const pos = clampPosition(FURNITURE_BY_ID[p.id], p.x, p.y);
    room.placed[uid] = { ...pos, flip: false };
    state.furniture.items[uid].at = { property: 'starter_apartment', room: 'bedroom' };
  }
}

// ------------------------------------------------------------------ placement
function overlapArea(a, b) {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  return w > 0 && h > 0 ? w * h : 0;
}

/** Find the free-est spot in the item's zone (least overlap with same-zone pieces). */
export function findSpot(state, propertyId, roomId, item) {
  const layout = layoutOf(state, propertyId, roomId);
  const others = Object.entries(layout?.placed || {}).map(([uid, p]) => {
    const it = FURNITURE_BY_ID[state.furniture.items[uid]?.id];
    return it && it.placement === item.placement ? boxOf(it, p.x, p.y) : null;
  }).filter(Boolean);
  const ys = item.placement === 'wall' ? [80, 140, 200, 110, 170] : item.placement === 'rug' ? [370, 340, 395] : [360, 330, 395, 310];
  let best = null;
  for (const y0 of ys) {
    for (let x0 = 195, step = 0; step < 13; step++) {
      const x = 195 + (step % 2 ? 1 : -1) * Math.ceil(step / 2) * 28 + (x0 - 195);
      const pos = clampPosition(item, x, y0);
      const box = boxOf(item, pos.x, pos.y);
      const cost = others.reduce((n, b) => n + overlapArea(box, b), 0);
      if (!best || cost < best.cost) best = { ...pos, cost };
      if (cost === 0) return pos;
    }
  }
  return { x: best.x, y: best.y };
}

function checkRoom(state, propertyId, roomId) {
  if (!state.properties.owned.includes(propertyId)) return { ok: false, reason: 'not-owned' };
  if (!roomDef(state, propertyId, roomId)) return { ok: false, reason: 'unknown-room' };
  ensureHome(state, propertyId);
  return null;
}

/** Place a piece (from storage, or moved from another room/home) into a room. */
export function placeItem(state, propertyId, roomId, uid, x, y) {
  const bad = checkRoom(state, propertyId, roomId);
  if (bad) return bad;
  const inst = state.furniture.items[uid];
  if (!inst) return { ok: false, reason: 'unknown-furniture' };
  const item = FURNITURE_BY_ID[inst.id];
  const layout = layoutOf(state, propertyId, roomId);
  const already = inst.at && inst.at.property === propertyId && inst.at.room === roomId;
  if (!already && Object.keys(layout.placed).length >= MAX_ITEMS_PER_ROOM) return { ok: false, reason: 'room-full' };
  if (inst.at && !already) storeItem(state, uid);
  const pos = x === undefined || y === undefined ? findSpot(state, propertyId, roomId, item) : clampPosition(item, x, y);
  layout.placed[uid] = { ...pos, flip: layout.placed[uid]?.flip || false };
  inst.at = { property: propertyId, room: roomId };
  if (!already) recordEvent(state, 'decorate', { room: roomDef(state, propertyId, roomId).type });
  return { ok: true, x: pos.x, y: pos.y };
}

export function moveItem(state, uid, x, y) {
  const inst = state.furniture.items[uid];
  if (!inst?.at) return { ok: false, reason: 'not-placed' };
  const layout = layoutOf(state, inst.at.property, inst.at.room);
  const pos = clampPosition(FURNITURE_BY_ID[inst.id], x, y);
  Object.assign(layout.placed[uid], pos);
  return { ok: true, ...pos };
}

export function flipItem(state, uid) {
  const inst = state.furniture.items[uid];
  if (!inst?.at) return { ok: false, reason: 'not-placed' };
  const p = layoutOf(state, inst.at.property, inst.at.room).placed[uid];
  p.flip = !p.flip;
  return { ok: true, flip: p.flip };
}

/** Put a piece back into storage (never lost). */
export function storeItem(state, uid) {
  const inst = state.furniture.items[uid];
  if (!inst) return { ok: false, reason: 'unknown-furniture' };
  if (inst.at) {
    const layout = layoutOf(state, inst.at.property, inst.at.room);
    if (layout) delete layout.placed[uid];
  }
  inst.at = null;
  return { ok: true };
}

/** Apply an owned wallpaper/paint or floor to a room. Outdoor rooms have no wallpaper. */
export function setSurface(state, propertyId, roomId, surfaceId) {
  const bad = checkRoom(state, propertyId, roomId);
  if (bad) return bad;
  const s = SURFACE_BY_ID[surfaceId];
  if (!s) return { ok: false, reason: 'unknown-item' };
  if (!ownsSurface(state, surfaceId)) return { ok: false, reason: 'not-owned' };
  const outdoor = ROOM_TYPES[roomDef(state, propertyId, roomId).type].outdoor;
  if (s.kind === 'wallpaper' && outdoor) return { ok: false, reason: 'outdoor' };
  layoutOf(state, propertyId, roomId)[s.kind === 'wallpaper' ? 'wallpaper' : 'floor'] = surfaceId;
  return { ok: true };
}

/** Pieces in a room in drawing order: rugs, then wall items, then floor items back→front. */
export function drawOrder(state, layout) {
  const zone = { rug: 0, wall: 1, floor: 2 };
  return Object.entries(layout?.placed || {})
    .map(([uid, p]) => ({ uid, ...p, item: FURNITURE_BY_ID[state.furniture.items[uid]?.id] }))
    .filter((e) => e.item)
    .sort((a, b) => (zone[a.item.placement] - zone[b.item.placement]) || (a.y - b.y));
}

export const placedCount = (layout) => Object.keys(layout?.placed || {}).length;
