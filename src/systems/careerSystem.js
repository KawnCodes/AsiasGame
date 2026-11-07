/**
 * CAREER SYSTEM — modelling, singing & acting jobs with wall-clock timers.
 *
 * A running job stores absolute timestamps { startedAt, endsAt } in the save, so the
 * countdown keeps going while the player navigates, closes the tab, or restarts the
 * phone: remaining time is always `endsAt - now`. Claiming pays through `grant()` with
 * a unique ledger id (`job:<uid>`) so rewards can never be paid twice.
 */
import { BALANCE } from '../data/gameBalance.js';
import { CAREERS, CAREER_BY_ID, JOB_BY_ID, jobReward } from '../data/careers.js';
import { CLOTHING_BY_ID } from '../data/clothing.js';
import { grant } from './economy.js';
import { recordEvent } from './questSystem.js';
import { perks } from './propertySystem.js';

export function emptyCareers() {
  return Object.fromEntries(CAREERS.map((c) => [c.id, { xp: 0, level: 1, jobsDone: 0 }]));
}

export function careerLevelForXP(xp) {
  const t = BALANCE.careerLevels;
  let lvl = 1;
  for (let i = 0; i < t.length; i++) if (xp >= t[i]) lvl = i + 1;
  return lvl;
}

/** Progress within the current career level, for progress bars. */
export function careerProgress(state, careerId) {
  const c = state.careers[careerId];
  const t = BALANCE.careerLevels;
  if (c.level >= t.length) return { ratio: 1, current: c.xp - t[t.length - 1], need: 0, max: true };
  const base = t[c.level - 1];
  const next = t[c.level];
  return { ratio: (c.xp - base) / (next - base), current: c.xp - base, need: next - base, max: false };
}

export const careerTitle = (careerId, level) => CAREER_BY_ID[careerId].titles[Math.min(level, 10) - 1];

export function isCareerUnlocked(state, careerId) {
  return state.player.level >= CAREER_BY_ID[careerId].unlockLevel;
}

/** Why a job can't be started right now (or null if it can). */
export function jobLockReason(state, job) {
  const career = CAREER_BY_ID[job.career];
  if (!isCareerUnlocked(state, job.career)) return `Reach level ${career.unlockLevel} to start your ${career.name.toLowerCase()} career`;
  if (state.careers[job.career].level < job.careerLevel) return `Needs ${career.name} level ${job.careerLevel}`;
  if (state.player.level < job.level) return `Needs level ${job.level}`;
  return null;
}

/** How many worn items share a style tag with the job. */
export function styleMatches(state, job) {
  return Object.values(state.equipped).filter((id) => id && CLOTHING_BY_ID[id]?.styles.some((t) => job.styles.includes(t))).length;
}

export function previewReward(state, job) {
  const base = jobReward(job);
  const bonus = styleMatches(state, job) >= BALANCE.jobs.styleMatchesNeeded;
  const homePerk = perks(state).careerCoins[job.career] || 0; // home studio upgrades
  const mult = (bonus ? 1 + BALANCE.jobs.styleBonus : 1) + homePerk;
  return { ...base, coins: Math.round(base.coins * mult), styleBonus: bonus, homeBonus: homePerk > 0 };
}

export function startJob(state, jobId, now = Date.now()) {
  const job = JOB_BY_ID[jobId];
  if (!job) return { ok: false, reason: 'unknown-job' };
  const lock = jobLockReason(state, job);
  if (lock) return { ok: false, reason: 'locked', message: lock };
  if (state.activeJobs[job.career]) return { ok: false, reason: 'busy', message: `You're already working a ${CAREER_BY_ID[job.career].name.toLowerCase()} job` };
  const seconds = Math.min(job.seconds, BALANCE.jobs.maxSeconds);
  const uid = `${jobId}-${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  state.activeJobs[job.career] = { uid, jobId, startedAt: now, endsAt: now + seconds * 1000, reward: previewReward(state, job) };
  return { ok: true, active: state.activeJobs[job.career] };
}

export function remainingMs(active, now = Date.now()) {
  return Math.max(0, active.endsAt - now);
}

export const isReady = (active, now = Date.now()) => !!active && now >= active.endsAt;

export function readyJobs(state, now = Date.now()) {
  return Object.values(state.activeJobs || {}).filter((a) => isReady(a, now));
}

export function cancelJob(state, careerId) {
  if (!state.activeJobs[careerId]) return { ok: false, reason: 'no-job' };
  delete state.activeJobs[careerId];
  return { ok: true };
}

export function claimJob(state, careerId, now = Date.now()) {
  const active = state.activeJobs[careerId];
  if (!active) return { ok: false, reason: 'no-job' };
  if (!isReady(active, now)) return { ok: false, reason: 'not-ready' };
  const job = JOB_BY_ID[active.jobId];
  const levelBefore = state.player.level;
  delete state.activeJobs[careerId];
  const reward = active.reward;
  const g = grant(state, { coins: reward.coins, xp: reward.xp, fame: reward.fame }, `job:${active.uid}`);
  if (!g.ok) return { ok: true, duplicate: true, reward: null, levels: [], promotions: [] }; // already paid: just clear the timer

  const career = state.careers[careerId];
  career.jobsDone += 1;
  career.xp += reward.careerXP;
  state.stats.jobsCompleted = (state.stats.jobsCompleted || 0) + 1;
  state.stats.jobCoins = (state.stats.jobCoins || 0) + reward.coins;

  const promotions = [];
  const newLevel = careerLevelForXP(career.xp);
  while (career.level < newLevel) {
    career.level += 1;
    const promo = grant(state, BALANCE.rewards.careerPromotion, `promo:${careerId}:${career.level}`);
    if (promo.ok) {
      state.stats.promotions = (state.stats.promotions || 0) + 1;
      g.levels.push(...promo.levels);
      recordEvent(state, 'promotion', { career: careerId }, now);
    }
    promotions.push({ career: careerId, level: career.level, title: careerTitle(careerId, career.level), story: CAREER_BY_ID[careerId].story[career.level] || null, reward: BALANCE.rewards.careerPromotion });
  }

  recordEvent(state, 'job', { career: careerId, tier: job?.tier }, now);
  recordEvent(state, 'jobCoins', { amount: reward.coins }, now);
  const unlockedCareers = CAREERS.filter((c) => c.unlockLevel > levelBefore && c.unlockLevel <= state.player.level).map((c) => c.id);
  return { ok: true, job, reward, levels: g.levels, promotions, unlockedCareers };
}
