/**
 * GAME STATE — the single source of truth plus a tiny observable store.
 *
 * Mutations go through `store.transact(fn, label)`: fn receives a structured clone
 * ("draft"); if it returns {ok:false} the draft is discarded, otherwise it is
 * committed atomically and subscribers (UI + autosave) are notified.
 */
import { BALANCE } from '../data/gameBalance.js';
import { STARTER_CLOTHING, SLOTS } from '../data/clothing.js';
import { DEFAULT_APPEARANCE } from '../data/appearance.js';
import { emptyCareers } from './careerSystem.js';
import { emptyDaily } from './dailySystem.js';
import { emptyQuests } from './questSystem.js';
import { emptyContests } from './competitionSystem.js';
import { emptyFurniture } from './furnitureInventory.js';
import { initStarterHome } from './decoratingSystem.js';
import { emptySocial } from './relationshipSystem.js';

export const SAVE_VERSION = 5;

export const STARTER_OUTFITS = [
  { id: 'sunny', name: 'Sunny Day', equipped: { top: 'top_daisy_tee', bottom: 'bot_denim_mini', shoes: 'sh_blush_flats', earrings: 'ear_silver_studs' } },
  { id: 'picnic', name: 'Picnic Sweetheart', equipped: { dress: 'dr_gingham_sun', shoes: 'sh_blush_flats', earrings: 'ear_silver_studs' } },
  { id: 'city', name: 'City Casual', equipped: { top: 'top_lilac_cami', bottom: 'bot_blue_jeans', shoes: 'sh_cloud_sneaks', earrings: 'ear_silver_studs' } },
];

export function emptyEquipped() {
  return Object.fromEntries(SLOTS.map((s) => [s, null]));
}

export function createNewGameState({ name = 'Star', appearance = {}, outfitId = 'sunny' } = {}) {
  const now = Date.now();
  const outfit = STARTER_OUTFITS.find((o) => o.id === outfitId) || STARTER_OUTFITS[0];
  const clothing = {};
  for (const id of STARTER_CLOTHING) clothing[id] = { acquiredAt: now, favourite: false, starter: true };
  const state = {
    version: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    player: {
      name: String(name).trim().slice(0, 18) || 'Star',
      level: BALANCE.start.level,
      xp: BALANCE.start.xp,
      fame: BALANCE.start.fame,
      coins: BALANCE.start.coins,
      gems: BALANCE.start.gems,
    },
    appearance: { ...DEFAULT_APPEARANCE, ...appearance },
    equipped: { ...emptyEquipped(), ...outfit.equipped },
    inventory: {
      clothing,
      hairstyles: [], // purchased (free starter styles are always owned)
      hairColors: [],
      makeup: [],
      surfaces: [], // purchased wallpapers / paints / floors (free basics are always owned)
    },
    outfits: [],
    properties: { owned: [BALANCE.start.property], current: BALANCE.start.property, upgrades: {} },
    furniture: emptyFurniture(), // furniture instances (placed or in storage)
    homes: {}, // room layouts per property
    social: emptySocial(), // relationships, messages, visitors (Milestone 5)
    ledger: { processed: {}, purchases: [] },
    careers: emptyCareers(),
    activeJobs: {}, // careerId → { uid, jobId, startedAt, endsAt, reward }
    daily: emptyDaily(),
    quests: emptyQuests(),
    contests: emptyContests(), // board, history, wins… (Milestone 3)
    trophies: [], // { id, theme, tier, place, at } for top-3 finishes
    stats: { itemsBought: 0, coinsSpent: 0, gemsSpent: 0, coinsEarned: 0, gemsEarned: 0, outfitsSaved: 0, playSeconds: 0, jobsCompleted: 0, jobCoins: 0, promotions: 0, questsCompleted: 0 },
    flags: { cityHintSeen: false, homeHintSeen: false, workHintSeen: false, decoHintSeen: false, phoneHintSeen: false },
    settings: { sound: true, reducedMotion: false },
  };
  initStarterHome(state);
  return state;
}

export function createStore(initial = null) {
  let state = initial;
  const subs = new Set();
  const emit = (meta) => subs.forEach((fn) => fn(state, meta));
  return {
    get: () => state,
    /** Replace the whole state (new game / load / import). */
    replace(next, label = 'replace') { state = next; emit({ label }); },
    transact(fn, label = 'update') {
      if (!state) throw new Error('No game loaded');
      const draft = structuredClone(state);
      const result = fn(draft) ?? { ok: true };
      if (result.ok === false) return result;
      draft.updatedAt = Date.now();
      state = draft;
      emit({ label, result });
      return result;
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}

/** The app-wide store instance. */
export const store = createStore(null);
