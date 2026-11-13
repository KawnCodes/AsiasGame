/**
 * SAVE SYSTEM — IndexedDB persistence with versioned schemas, migrations,
 * a rolling backup slot, and manual export/import.
 *
 *  DB  "glamour-city" → object store "saves"
 *    key "slot1"       current save
 *    key "slot1-prev"  previous save (written in the SAME transaction → crash-safe)
 *
 * If IndexedDB is unavailable (some private-browsing modes) we fall back to
 * localStorage so the game is still playable; the UI shows no difference.
 */
import { SAVE_VERSION, createNewGameState, emptyEquipped } from './gameState.js';
import { initStarterHome, ensureHome } from './decoratingSystem.js';
import { FURNITURE_BY_ID } from '../data/furniture.js';
import { PROPERTY_BY_ID } from '../data/properties.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { CLOTHING_BY_ID } from '../data/clothing.js';

const DB_NAME = 'glamour-city';
const STORE = 'saves';
const KEY = 'slot1';
const PREV = 'slot1-prev';
const LS_KEY = 'glamour-city:slot1';

// ----------------------------- migrations -----------------------------
/**
 * MIGRATIONS[n] upgrades a save from version n → n+1. Add a function here whenever
 * SAVE_VERSION is bumped. Version 0 represents pre-release prototype saves.
 */
export const MIGRATIONS = {
  0: (s) => {
    s.ledger = s.ledger || { processed: {}, purchases: [] };
    s.stats = s.stats || {};
    s.version = 1;
    return s;
  },
  // v1 → v2 (Milestone 2): careers, job timers, daily rewards and quests.
  // Missing structures are created by fillDefaults(); nothing to transform.
  1: (s) => {
    s.version = 2;
    return s;
  },
  // v2 → v3 (Milestone 3): fashion contests & trophies — created by fillDefaults().
  2: (s) => {
    s.version = 3;
    return s;
  },
  // v3 → v4 (Milestone 4): properties, furniture instances, room layouts. The Starter
  // Apartment's fixed art becomes real, movable starter furniture (see fillDefaults).
  3: (s) => {
    s.version = 4;
    return s;
  },
  // v4 → v5 (Milestone 5): relationships, messages and visitors — created by fillDefaults().
  4: (s) => {
    s.version = 5;
    return s;
  },
  // v5 → v6 (Milestone 6): minigames, photo album, home design contests — via fillDefaults().
  5: (s) => {
    s.version = 6;
    return s;
  },
};

/** Fill in any missing fields from a fresh state so older saves never crash new code. */
function fillDefaults(s) {
  const fresh = createNewGameState({ name: s.player?.name });
  const out = { ...fresh, ...s };
  out.player = { ...fresh.player, ...s.player };
  out.appearance = { ...fresh.appearance, ...s.appearance };
  out.equipped = { ...emptyEquipped(), ...s.equipped };
  out.inventory = { ...fresh.inventory, ...s.inventory };
  out.inventory.clothing = { ...(s.inventory?.clothing || fresh.inventory.clothing) };
  out.properties = { ...fresh.properties, ...s.properties };
  out.ledger = { processed: {}, purchases: [], ...s.ledger };
  out.stats = { ...fresh.stats, ...s.stats };
  out.flags = { ...fresh.flags, ...s.flags };
  out.careers = { ...fresh.careers };
  for (const [id, c] of Object.entries(s.careers || {})) if (out.careers[id]) out.careers[id] = { ...out.careers[id], ...c };
  out.activeJobs = {};
  for (const [id, a] of Object.entries(s.activeJobs || {})) if (out.careers[id] && a?.jobId && a.endsAt) out.activeJobs[id] = a;
  out.daily = { ...fresh.daily, ...s.daily };
  out.quests = {
    daily: { ...fresh.quests.daily, ...s.quests?.daily },
    weekly: { ...fresh.quests.weekly, ...s.quests?.weekly },
    story: { ...fresh.quests.story, ...s.quests?.story },
  };
  out.contests = { ...fresh.contests, ...s.contests, judge: { ...fresh.contests.judge, ...s.contests?.judge } };
  out.contests.board = Array.isArray(s.contests?.board) ? s.contests.board : [];
  out.contests.history = Array.isArray(s.contests?.history) ? s.contests.history : [];
  out.trophies = Array.isArray(s.trophies) ? s.trophies : [];
  // ---- homes & furniture (v4) ----
  out.properties.owned = (out.properties.owned || []).filter((id) => PROPERTY_BY_ID[id]);
  if (!out.properties.owned.includes('starter_apartment')) out.properties.owned.unshift('starter_apartment');
  if (!out.properties.owned.includes(out.properties.current)) out.properties.current = 'starter_apartment';
  out.properties.upgrades = { ...(s.properties?.upgrades || {}) };
  out.inventory.surfaces = Array.isArray(s.inventory?.surfaces) ? s.inventory.surfaces : [];
  if (s.furniture?.items) {
    out.furniture = { nextId: s.furniture.nextId || 1, items: {} };
    for (const [uid, v] of Object.entries(s.furniture.items)) if (FURNITURE_BY_ID[v?.id]) out.furniture.items[uid] = { id: v.id, at: v.at || null };
    out.homes = s.homes || {};
    // Room layouts are the source of truth: rebuild every piece's `at` from them, dropping
    // ghost entries (unknown furniture) and any piece listed in two rooms.
    for (const v of Object.values(out.furniture.items)) v.at = null;
    for (const [pid, home] of Object.entries(out.homes)) {
      if (!PROPERTY_BY_ID[pid]) { delete out.homes[pid]; continue; }
      for (const [rid, room] of Object.entries(home.rooms || {})) {
        room.placed = room.placed || {};
        for (const uid of Object.keys(room.placed)) {
          const inst = out.furniture.items[uid];
          if (!inst || inst.at) { delete room.placed[uid]; continue; }
          inst.at = { property: pid, room: rid };
        }
      }
    }
    const maxId = Math.max(0, ...Object.keys(out.furniture.items).map((u) => Number(u.slice(1)) || 0));
    out.furniture.nextId = Math.max(out.furniture.nextId, maxId + 1);
  } else {
    out.furniture = { nextId: 1, items: {} };
    out.homes = {};
    initStarterHome(out); // pre-Milestone-4 saves: furnish the starter apartment
  }
  for (const pid of out.properties.owned) ensureHome(out, pid);
  // ---- social (v5) ----
  const soc = s.social || {};
  out.social = { ...fresh.social, ...soc, hosting: { ...fresh.social.hosting, ...soc.hosting } };
  out.social.rel = {};
  for (const [id, r] of Object.entries(soc.rel || {})) if (CHARACTER_BY_ID[id]) out.social.rel[id] = { storiesSeen: [], ...r };
  out.social.messages = Array.isArray(soc.messages) ? soc.messages.filter((m) => CHARACTER_BY_ID[m.from]) : [];
  if (out.social.partner && !CHARACTER_BY_ID[out.social.partner]) out.social.partner = null;
  // ---- arcade, photos, home contests (v6) ----
  out.minigames = { ...fresh.minigames, ...s.minigames, best: { ...(s.minigames?.best || {}) } };
  out.photos = Array.isArray(s.photos) ? s.photos.filter((p) => p && p.id && p.look) : [];
  out.homeContests = { ...fresh.homeContests, ...s.homeContests };
  out.homeContests.board = Array.isArray(s.homeContests?.board) ? s.homeContests.board : [];
  out.homeContests.history = Array.isArray(s.homeContests?.history) ? s.homeContests.history : [];
  out.homeAwards = Array.isArray(s.homeAwards) ? s.homeAwards : [];
  out.settings = { ...fresh.settings, ...s.settings };
  out.outfits = Array.isArray(s.outfits) ? s.outfits : [];
  // drop equipped references to items that no longer exist in the catalogue
  for (const [slot, id] of Object.entries(out.equipped)) if (id && !CLOTHING_BY_ID[id]) out.equipped[slot] = null;
  return out;
}

export function migrate(raw) {
  if (!raw || typeof raw !== 'object' || !raw.player) throw new Error('Not a Glamour City save');
  let s = structuredClone(raw);
  let v = Number.isInteger(s.version) ? s.version : 0;
  if (v > SAVE_VERSION) throw new Error(`Save is from a newer version (${v}) of the game`);
  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`No migration from save version ${v}`);
    s = step(s);
    v = s.version;
  }
  return fillDefaults(s);
}

// ----------------------------- IndexedDB -----------------------------
let dbPromise = null;
function idb() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('no-idb'));
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('idb-blocked'));
    }).catch((e) => { dbPromise = null; throw e; });
  }
  return dbPromise;
}

function tx(mode, fn) {
  return idb().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const os = t.objectStore(STORE);
    let result;
    Promise.resolve(fn(os, (v) => { result = v; })).catch(reject);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('aborted'));
  }));
}

const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export async function loadGame() {
  let raw = null;
  try {
    raw = await tx('readonly', async (os, set) => set(await reqP(os.get(KEY))));
  } catch {
    try { raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { raw = null; }
  }
  if (!raw) return null;
  try {
    return migrate(raw);
  } catch (e) {
    console.warn('[save] current save unreadable, trying backup', e);
    try {
      const prev = await tx('readonly', async (os, set) => set(await reqP(os.get(PREV))));
      return prev ? migrate(prev) : null;
    } catch { return null; }
  }
}

let writing = Promise.resolve();
/** Serialised writes: never two overlapping transactions for the same save. */
export function saveGame(state) {
  const snapshot = structuredClone(state);
  snapshot.version = SAVE_VERSION;
  writing = writing.then(async () => {
    try {
      await tx('readwrite', async (os) => {
        const prev = await reqP(os.get(KEY));
        if (prev) os.put(prev, PREV);
        os.put(snapshot, KEY);
      });
    } catch {
      try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot)); } catch (e) { console.error('[save] failed', e); throw e; }
    }
  });
  return writing;
}

export async function hasSave() {
  return !!(await loadGame());
}

export async function deleteSave() {
  try { await tx('readwrite', (os) => { os.delete(KEY); os.delete(PREV); }); } catch { /* ignore */ }
  try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
}

// ----------------------------- export / import -----------------------------
const EXPORT_MAGIC = 'GLAMOUR-CITY-SAVE';

export function exportSave(state) {
  return JSON.stringify({ magic: EXPORT_MAGIC, exportedAt: new Date().toISOString(), save: state }, null, 1);
}

export function importSave(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('That file is not a valid save backup.'); }
  if (parsed?.magic !== EXPORT_MAGIC || !parsed.save) throw new Error('That file is not a Glamour City save backup.');
  return migrate(parsed.save);
}

/** For tests: reset the cached DB connection. */
export function _resetForTests() { dbPromise = null; writing = Promise.resolve(); }
