/**
 * DAILY REWARD — once per local calendar day, with a 7-day streak that repeats.
 * Missing a calendar day resets the streak to day 1. Claims are ledger-guarded
 * (`daily:YYYY-MM-DD`) so a double tap, reload or re-imported save can't pay twice.
 */
import { BALANCE } from '../data/gameBalance.js';
import { dateKey, previousDateKey } from '../utils/time.js';
import { grant } from './economy.js';
import { recordEvent } from './questSystem.js';

export function emptyDaily() {
  return { lastClaimKey: null, streak: 0, history: [] };
}

export function dailyStatus(state, now = Date.now()) {
  const d = state.daily || emptyDaily();
  const key = dateKey(now);
  const claimedToday = d.lastClaimKey === key;
  const continues = d.lastClaimKey === previousDateKey(now);
  const nextStreak = claimedToday ? d.streak : continues ? d.streak + 1 : 1;
  const dayIndex = (nextStreak - 1) % BALANCE.daily.streak.length;
  return { key, claimedToday, streak: nextStreak, dayIndex, reward: BALANCE.daily.streak[dayIndex], table: BALANCE.daily.streak, brokeStreak: !claimedToday && !continues && d.streak > 0 };
}

export function claimDaily(state, now = Date.now()) {
  const st = dailyStatus(state, now);
  if (st.claimedToday) return { ok: false, reason: 'already-claimed' };
  const r = grant(state, st.reward, `daily:${st.key}`);
  if (!r.ok) return r;
  state.daily = state.daily || emptyDaily();
  state.daily.lastClaimKey = st.key;
  state.daily.streak = st.streak;
  state.daily.history = [...state.daily.history, st.key].slice(-30);
  recordEvent(state, 'daily', {}, now);
  return { ok: true, reward: st.reward, streak: st.streak, day: st.dayIndex + 1, levels: r.levels };
}
