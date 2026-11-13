/**
 * HOME DESIGN CONTESTS — submit one of your decorated rooms to a themed contest.
 * scoreRoom() rates a room 0–10 on theme, colour harmony, coordination, layout and variety.
 * Rival entries are real generated rooms scored by the same function (and can be shown).
 */
import { BALANCE } from '../data/gameBalance.js';
import { HOME_THEMES, HOME_THEME_BY_ID } from '../data/homeContests.js';
import { HOME_STYLES, HOME_STYLE_BY_ID } from '../data/homeStyles.js';
import { FURNITURE, FURNITURE_BY_ID, SURFACE_BY_ID } from '../data/furniture.js';
import { PROPERTIES, ROOM_TYPES } from '../data/properties.js';
import { RIVAL_NAMES } from '../data/competitions.js';
import { hexToRgb } from '../utils/color.js';
import { seededRandom } from '../utils/time.js';
import { drawOrder, layoutOf, roomDef, boxOf, clampPosition } from './decoratingSystem.js';
import { grant } from './economy.js';
import { recordEvent } from './questSystem.js';

export const HOME_CATS = { theme: 'Theme', colour: 'Colour harmony', coordination: 'Coordination', layout: 'Layout', variety: 'Variety' };
const WEIGHTS = { theme: 3, colour: 2, coordination: 2, layout: 1.5, variety: 1.5 };

export function emptyHomeContests() {
  return { board: [], history: [], entries: 0, wins: 0 };
}

const dist = (a, b) => { const A = hexToRgb(a); const B = hexToRgb(b); return Math.sqrt(((A.r - B.r) / 255) ** 2 + ((A.g - B.g) / 255) ** 2 + ((A.b - B.b) / 255) ** 2) / Math.sqrt(3); };
const closeness = (c, palette) => Math.max(0, 1 - Math.min(...palette.map((p) => dist(c, p))) / 0.4);
const styleFit = (item, theme) => Math.max(0, ...item.styles.map((s) => theme.styles[s] || 0));

export function scoreRoom(state, propertyId, roomId, themeId) {
  const theme = HOME_THEME_BY_ID[themeId];
  const def = roomDef(state, propertyId, roomId);
  const layout = layoutOf(state, propertyId, roomId);
  const pieces = drawOrder(state, layout);
  const items = pieces.map((p) => p.item);
  const n = items.length;
  const cat = {};
  // THEME — room type + how well the pieces' collections suit the brief
  const typeOk = theme.roomTypes.includes(def?.type);
  const fit = n ? items.reduce((s, it) => s + styleFit(it, theme), 0) / n : 0;
  cat.theme = (typeOk ? 3 : 0.5) + 7 * fit - (theme.wantsFunc && !items.some((it) => it.func === theme.wantsFunc) ? 1.5 : 0);
  // COLOUR — furniture + walls/floor close to the theme palette
  const colours = items.flatMap((it) => [it.palette.main, it.palette.fabric]);
  const wall = SURFACE_BY_ID[layout?.wallpaper]; const floor = SURFACE_BY_ID[layout?.floor];
  if (wall) colours.push(wall.c1, wall.c1);
  if (floor) colours.push(floor.c1);
  cat.colour = colours.length ? 10 * (colours.reduce((s, c) => s + closeness(c, theme.palette), 0) / colours.length) : 0;
  // COORDINATION — a dominant collection
  const counts = {};
  for (const it of items) for (const s of it.styles) counts[s] = (counts[s] || 0) + 1;
  const dominant = n ? Math.max(0, ...Object.values(counts)) / n : 0;
  cat.coordination = 10 * dominant * Math.min(1, n / 6);
  // LAYOUT — enough pieces, wall + floor + rug, spread across the room, little overlap
  const floorP = pieces.filter((p) => p.item.placement === 'floor');
  const hasWall = pieces.some((p) => p.item.placement === 'wall');
  const hasRug = pieces.some((p) => p.item.placement === 'rug');
  const xs = pieces.map((p) => p.x);
  const spread = n > 1 ? Math.min(1, (Math.max(...xs) - Math.min(...xs)) / 280) : 0;
  let overlap = 0;
  for (let i = 0; i < floorP.length; i++) for (let j = i + 1; j < floorP.length; j++) {
    const a = boxOf(floorP[i].item, floorP[i].x, floorP[i].y); const b = boxOf(floorP[j].item, floorP[j].x, floorP[j].y);
    const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0); const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    if (w > 0 && h > 0) overlap += (w * h) / Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0));
  }
  const amount = n < 4 ? n / 4 : n <= 20 ? 1 : Math.max(0.5, 1 - (n - 20) / 20);
  cat.layout = 10 * (0.35 * amount + 0.2 * (hasWall ? 1 : 0) + 0.15 * (hasRug ? 1 : 0) + 0.3 * spread) - Math.min(4, overlap * 1.5);
  // VARIETY — different kinds of pieces, including plants & décor
  const kinds = new Set(items.map((it) => it.category));
  const deco = items.some((it) => ['Plants', 'Décor', 'Wall décor', 'Lighting'].includes(it.category));
  cat.variety = 10 * Math.min(1, kinds.size / 6) * (deco ? 1 : 0.8);
  for (const k of Object.keys(cat)) cat[k] = Math.round(Math.max(0, Math.min(10, cat[k])) * 10) / 10;
  let sum = 0; let tw = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) { sum += cat[k] * w; tw += w; }
  return { categories: cat, percent: Math.round((sum / tw) * 10), pieces: n };
}

// ------------------------------------------------------------------ rival rooms
function propertyWithRoomType(type) {
  for (const p of PROPERTIES) { const r = p.rooms.find((x) => x.type === type); if (r) return { property: p.id, room: r.id }; }
  return { property: 'chic_apartment', room: 'living' };
}

/** A self-contained state holding one furnished room (used for rivals and friends' homes). */
export function ghostRoom(base, propertyId, roomId, { wallpaper, floor, pieces }) {
  const items = {}; const placed = {};
  pieces.forEach(([itemId, x, y], i) => {
    const it = FURNITURE_BY_ID[itemId];
    if (!it) return;
    const uid = `g${i}`;
    items[uid] = { id: itemId, at: { property: propertyId, room: roomId } };
    placed[uid] = { ...clampPosition(it, x, y), flip: false };
  });
  return { appearance: base.appearance, equipped: base.equipped, trophies: [], careers: base.careers, player: base.player,
    properties: { owned: [propertyId], current: propertyId, upgrades: {} }, furniture: { items }, homes: { [propertyId]: { rooms: { [roomId]: { wallpaper, floor, placed } } } } };
}

const SPOTS = { floor: [[90, 330], [300, 330], [200, 405], [40, 380], [350, 395], [150, 360], [250, 350]], wall: [[70, 110], [320, 110], [195, 60], [195, 150]], rug: [[200, 380]] };

export function generateRivalRoom(base, theme, skill, rnd, name) {
  const best = Object.entries(theme.styles).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const styleId = rnd() < skill ? best[Math.floor(rnd() * Math.min(2, best.length))] : HOME_STYLES[Math.floor(rnd() * HOME_STYLES.length)].id;
  const roomType = rnd() < 0.4 + skill * 0.6 ? theme.roomTypes[0] : 'living';
  const { property, room } = propertyWithRoomType(roomType);
  const pool = FURNITURE.filter((f) => f.styles.includes(styleId));
  const extras = FURNITURE.filter((f) => f.shop === 'dream_decor' && f.placement !== 'rug');
  const count = Math.round(3 + skill * 7 + rnd() * 2);
  const used = { floor: 0, wall: 0, rug: 0 };
  const pieces = [];
  for (let i = 0; i < count; i++) {
    const src = i < count * (0.5 + skill * 0.4) ? pool : extras;
    const it = src[Math.floor(rnd() * src.length)];
    if (!it || used[it.placement] >= SPOTS[it.placement].length) continue;
    const [x, y] = SPOTS[it.placement][used[it.placement]++];
    pieces.push([it.id, x + (rnd() - 0.5) * 20, y]);
  }
  const surfaces = Object.values(SURFACE_BY_ID);
  const pick = (kind) => {
    const list = surfaces.filter((s) => s.kind === kind);
    const match = list.filter((s) => s.styles?.includes(styleId));
    const from = rnd() < skill && match.length ? match : list;
    return from[Math.floor(rnd() * from.length)].id;
  };
  const outdoor = ROOM_TYPES[roomType]?.outdoor;
  const ghost = ghostRoom(base, property, room, { wallpaper: outdoor ? null : pick('wallpaper'), floor: pick('floor'), pieces });
  return { name, style: HOME_STYLE_BY_ID[styleId].name, ghost, property, room };
}

// ------------------------------------------------------------------ board & entry
export function ensureHomeBoard(state, now = Date.now()) {
  if (!state.homeContests) state.homeContests = emptyHomeContests();
  const c = state.homeContests;
  c.board = c.board.filter((b) => HOME_THEME_BY_ID[b.theme]);
  const rnd = seededRandom(`hboard:${now}:${c.entries}`);
  let changed = false;
  while (c.board.length < BALANCE.homeContests.boardSize) {
    const used = new Set(c.board.map((b) => b.theme));
    const options = HOME_THEMES.filter((t) => !used.has(t.id));
    c.board.push({ uid: `h${now.toString(36)}${Math.floor(rnd() * 1e9).toString(36)}`, theme: options[Math.floor(rnd() * options.length)].id });
    changed = true;
  }
  return changed;
}

export function homePrize(place) {
  const P = BALANCE.homeContests.prizes;
  return { ...(P[place] || P.entry) };
}

export function submitHomeEntry(state, uid, propertyId, roomId, now = Date.now()) {
  ensureHomeBoard(state, now);
  const c = state.homeContests;
  const idx = c.board.findIndex((b) => b.uid === uid);
  if (idx < 0) return { ok: false, reason: 'unknown-contest' };
  if (!state.properties.owned.includes(propertyId) || !roomDef(state, propertyId, roomId)) return { ok: false, reason: 'bad-room' };
  const layout = layoutOf(state, propertyId, roomId);
  if (Object.keys(layout?.placed || {}).length < BALANCE.homeContests.minItems) return { ok: false, reason: 'too-empty', message: `Place at least ${BALANCE.homeContests.minItems} pieces in this room first.` };
  const contest = c.board[idx];
  const theme = HOME_THEME_BY_ID[contest.theme];
  const rnd = seededRandom(`homecontest:${uid}`);
  const H = BALANCE.homeContests;
  const names = [...RIVAL_NAMES].sort(() => rnd() - 0.5);
  const entries = [{ name: state.player.name, isPlayer: true, property: propertyId, room: roomId, ghost: null, ...scoreRoom(state, propertyId, roomId, theme.id) }];
  for (let i = 0; i < H.rivals; i++) {
    const r = generateRivalRoom(state, theme, H.skill[0] + rnd() * (H.skill[1] - H.skill[0]), rnd, names[i]);
    entries.push({ name: r.name, style: r.style, isPlayer: false, property: r.property, room: r.room, ghost: r.ghost, ...scoreRoom(r.ghost, r.property, r.room, theme.id) });
  }
  const ranked = [...entries].sort((a, b) => (b.percent - a.percent) || (a.isPlayer ? -1 : b.isPlayer ? 1 : 0));
  ranked.forEach((e, i) => { e.place = i + 1; });
  const me = entries[0];
  const reward = homePrize(me.place);
  const g = grant(state, reward, `homecontest:${uid}`);
  if (!g.ok) return { ok: false, reason: 'already-entered' };
  c.entries += 1;
  if (me.place === 1) c.wins += 1;
  c.history = [{ uid, theme: theme.id, place: me.place, percent: me.percent, at: now, property: propertyId, room: roomId }, ...c.history].slice(0, 20);
  if (me.place <= 3) state.homeAwards = [...(state.homeAwards || []), { id: uid, theme: theme.id, place: me.place, at: now }];
  c.board.splice(idx, 1);
  ensureHomeBoard(state, now + 1);
  recordEvent(state, 'homeContest', { place: me.place }, now);
  return { ok: true, theme, entries, ranked, me, reward, levels: g.levels };
}
