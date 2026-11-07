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
