/**
 * QUEST SYSTEM — daily / weekly rotations, event-driven progress, idempotent claims.
 * State shape:
 *   quests.daily  = { key:'2026-11-06', ids:[...], progress:{id:n}, claimed:{id:true} }
 *   quests.weekly = { key:'2026-11-02', ids:[...], progress:{}, claimed:{} }
 *   quests.story  = { claimed:{id:true} }
 */
import { DAILY_POOL, WEEKLY_POOL, STORY_QUESTS, QUESTS_PER_DAY, QUESTS_PER_WEEK, ALL_QUESTS } from '../data/quests.js';
import { dateKey, weekKey, seededRandom } from '../utils/time.js';
import { grant } from './economy.js';

export function emptyQuests() {
  return { daily: { key: null, ids: [], progress: {}, claimed: {} }, weekly: { key: null, ids: [], progress: {}, claimed: {} }, story: { claimed: {} } };
}

function pick(pool, n, seedKey, level) {
  const rnd = seededRandom(seedKey);
  const eligible = pool.filter((q) => !q.needsLevel || q.needsLevel <= level);
  const shuffled = eligible.map((q) => [rnd(), q]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  return shuffled.slice(0, n).map((q) => q.id);
}

/** True when the calendar has moved past the stored daily/weekly sets. */
export function questsStale(state, now = Date.now()) {
  return !state.quests || state.quests.daily.key !== dateKey(now) || state.quests.weekly.key !== weekKey(now);
}

/** Roll over daily/weekly quest sets when the calendar moves on. Returns true if changed. */
export function ensureQuests(state, now = Date.now()) {
  if (!state.quests) state.quests = emptyQuests();
  const q = state.quests;
  let changed = false;
  const dk = dateKey(now);
  if (q.daily.key !== dk) {
    q.daily = { key: dk, ids: pick(DAILY_POOL, QUESTS_PER_DAY, `daily:${dk}`, state.player.level), progress: {}, claimed: {} };
    changed = true;
  }
  const wk = weekKey(now);
  if (q.weekly.key !== wk) {
    q.weekly = { key: wk, ids: pick(WEEKLY_POOL, QUESTS_PER_WEEK, `weekly:${wk}`, state.player.level), progress: {}, claimed: {} };
    changed = true;
  }
  return changed;
}

function matches(where, payload) {
  if (!where) return true;
  return Object.entries(where).every(([k, v]) => (Array.isArray(v) ? v.includes(payload[k]) : payload[k] === v));
}

/** Feed a game event into the active daily & weekly quests. */
export function recordEvent(state, type, payload = {}, now = Date.now()) {
  ensureQuests(state, now);
  for (const scope of ['daily', 'weekly']) {
    const set = state.quests[scope];
    for (const id of set.ids) {
      const def = ALL_QUESTS[id];
      if (!def || def.event !== type || set.claimed[id] || !matches(def.where, payload)) continue;
      const inc = def.amount ? Number(payload.amount) || 0 : 1;
      set.progress[id] = Math.min(def.target, (set.progress[id] || 0) + inc);
    }
  }
}

export function questProgress(state, scope, def) {
  const value = def.stat ? def.stat(state) : (state.quests?.[scope]?.progress?.[def.id] || 0);
  return { value: Math.min(def.target, value), target: def.target, done: value >= def.target };
}

export function isClaimed(state, scope, id) {
  return !!state.quests?.[scope]?.claimed?.[id];
}

/** List quests for a scope with progress, ready to render. */
export function listQuests(state, scope) {
  const defs = scope === 'story' ? STORY_QUESTS : (state.quests?.[scope]?.ids || []).map((id) => ALL_QUESTS[id]).filter(Boolean);
  return defs.map((def) => ({ def, scope, ...questProgress(state, scope, def), claimed: isClaimed(state, scope, def.id) }));
}

export function claimableCount(state) {
  return ['daily', 'weekly', 'story'].reduce((n, scope) => n + listQuests(state, scope).filter((q) => q.done && !q.claimed).length, 0);
}

export function claimQuest(state, scope, id, now = Date.now()) {
  ensureQuests(state, now);
  const def = ALL_QUESTS[id];
  if (!def) return { ok: false, reason: 'unknown-quest' };
  if (scope !== 'story' && !state.quests[scope].ids.includes(id)) return { ok: false, reason: 'expired' };
  if (scope === 'story' && !STORY_QUESTS.includes(def)) return { ok: false, reason: 'unknown-quest' };
  if (isClaimed(state, scope, id)) return { ok: false, reason: 'already-claimed' };
  if (!questProgress(state, scope, def).done) return { ok: false, reason: 'not-complete' };
  const periodKey = scope === 'story' ? 'forever' : state.quests[scope].key;
  const r = grant(state, def.reward, `quest:${scope}:${periodKey}:${id}`);
  if (!r.ok) return r;
  state.quests[scope].claimed[id] = true;
  state.stats.questsCompleted = (state.stats.questsCompleted || 0) + 1;
  return { ok: true, reward: def.reward, levels: r.levels, quest: def };
}
