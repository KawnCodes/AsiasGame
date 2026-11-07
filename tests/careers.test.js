import { describe, it, expect } from 'vitest';
import { createNewGameState } from '../src/systems/gameState.js';
import { startJob, claimJob, remainingMs, isReady, careerLevelForXP, jobLockReason, previewReward, cancelJob, styleMatches } from '../src/systems/careerSystem.js';
import { JOBS, JOB_BY_ID, CAREERS, jobReward } from '../src/data/careers.js';
import { BALANCE } from '../src/data/gameBalance.js';
import { equip, purchase } from '../src/systems/inventory.js';

const T0 = new Date(2026, 10, 6, 12, 0, 0).getTime();
const fresh = () => createNewGameState({ outfitId: 'city' });

describe('job catalogue', () => {
  it('has six jobs per career and respects the duration rules', () => {
    for (const c of CAREERS) expect(JOBS.filter((j) => j.career === c.id).length).toBe(6);
    const ranges = { beginner: [10, 15], standard: [30, 30], higher: [30, 45], celebrity: [45, 60] };
    for (const j of JOBS) {
      expect(j.seconds, j.id).toBeGreaterThanOrEqual(ranges[j.tier][0]);
      expect(j.seconds, j.id).toBeLessThanOrEqual(ranges[j.tier][1]);
      expect(j.seconds).toBeLessThanOrEqual(BALANCE.jobs.maxSeconds);
    }
  });
  it('standard jobs pay 500 coins and 100 XP', () => {
    for (const j of JOBS.filter((x) => x.tier === 'standard')) expect(jobReward(j)).toMatchObject({ coins: 500, xp: 100 });
  });
  it('higher-level jobs pay more than standard ones', () => {
    expect(jobReward(JOB_BY_ID.mod_cover).coins).toBeGreaterThan(jobReward(JOB_BY_ID.mod_runway).coins);
    expect(jobReward(JOB_BY_ID.mod_runway).coins).toBeGreaterThan(jobReward(JOB_BY_ID.mod_magazine).coins);
  });
});

describe('job timers', () => {
  it('runs on wall-clock time and only pays once complete', () => {
    const s = fresh();
    expect(startJob(s, 'mod_catalogue', T0).ok).toBe(true);
    const a = s.activeJobs.modelling;
    expect(remainingMs(a, T0 + 5000)).toBe(7000);
    expect(claimJob(s, 'modelling', T0 + 11999)).toMatchObject({ ok: false, reason: 'not-ready' });
    expect(s.player.coins).toBe(5000);
    const r = claimJob(s, 'modelling', T0 + 12000);
    expect(r.ok).toBe(true);
    expect(s.player.coins).toBe(5000 + r.reward.coins);
    expect(s.player.xp).toBe(r.reward.xp);
    expect(s.player.fame).toBe(r.reward.fame);
    expect(s.activeJobs.modelling).toBeUndefined();
  });
  it('completes while the game is closed (elapsed time from timestamps)', () => {
    const s = fresh();
    startJob(s, 'mod_catalogue', T0);
    const reloaded = JSON.parse(JSON.stringify(s)); // simulate save → restart
    expect(isReady(reloaded.activeJobs.modelling, T0 + 3 * 3600_000)).toBe(true);
    expect(claimJob(reloaded, 'modelling', T0 + 3 * 3600_000).ok).toBe(true);
  });
  it('cannot be claimed twice and is ledger-guarded', () => {
    const s = fresh();
    startJob(s, 'mod_catalogue', T0);
    const stale = structuredClone(s.activeJobs.modelling);
    claimJob(s, 'modelling', T0 + 20000);
    const coins = s.player.coins;
    expect(claimJob(s, 'modelling', T0 + 20000).ok).toBe(false);
    s.activeJobs.modelling = stale; // e.g. an old save re-imported mid-claim
    expect(claimJob(s, 'modelling', T0 + 20000).duplicate).toBe(true);
    expect(s.player.coins).toBe(coins);
  });
  it('allows one job per career, with careers running in parallel', () => {
    const s = fresh();
    s.player.level = 3;
    expect(startJob(s, 'mod_catalogue', T0).ok).toBe(true);
    expect(startJob(s, 'mod_boutique_ad', T0).reason).toBe('busy');
    expect(startJob(s, 'sing_practice', T0).ok).toBe(true);
    expect(startJob(s, 'act_audition', T0).ok).toBe(true);
    expect(Object.keys(s.activeJobs).length).toBe(3);
    expect(cancelJob(s, 'singing').ok).toBe(true);
    expect(s.activeJobs.singing).toBeUndefined();
  });
  it('locks careers by player level and jobs by career level', () => {
    const s = fresh();
    expect(jobLockReason(s, JOB_BY_ID.sing_practice)).toMatch(/level 2/);
    expect(jobLockReason(s, JOB_BY_ID.mod_magazine)).toMatch(/Modelling level 2/);
    expect(startJob(s, 'act_audition', T0).reason).toBe('locked');
  });
  it('applies the style bonus when the outfit matches', () => {
    const s = fresh();
    const job = JOB_BY_ID.mod_catalogue; // casual / winter
    expect(previewReward(s, job).styleBonus).toBe(true); // city casual outfit: cami + jeans + sneakers
    expect(previewReward(s, job).coins).toBe(Math.round(jobReward(job).coins * 1.25));
    purchase(s, 'clothing', 'dr_red_slip');
    equip(s, 'dr_red_slip');
    s.equipped.shoes = null; s.equipped.earrings = null;
    expect(styleMatches(s, job)).toBe(0);
    expect(previewReward(s, job).coins).toBe(jobReward(job).coins);
  });
});

describe('career progression', () => {
  it('maps career XP to levels', () => {
    expect(careerLevelForXP(0)).toBe(1);
    expect(careerLevelForXP(49)).toBe(1);
    expect(careerLevelForXP(50)).toBe(2);
    expect(careerLevelForXP(99999)).toBe(10);
  });
  it('promotes and pays the promotion reward once per level', () => {
    const s = fresh();
    let t = T0;
    const promos = [];
    for (let i = 0; i < 5; i++) {
      startJob(s, 'mod_catalogue', t);
      t += 13000;
      promos.push(...claimJob(s, 'modelling', t).promotions);
    }
    expect(s.careers.modelling.level).toBe(2);
    expect(promos).toHaveLength(1);
    expect(promos[0]).toMatchObject({ level: 2, title: 'Catalogue Model' });
    expect(promos[0].story).toBeTruthy();
    expect(s.ledger.processed['promo:modelling:2']).toBeTruthy();
    expect(s.stats.promotions).toBe(1);
  });
  it('reaches level 5 within a short session of jobs', () => {
    const s = fresh();
    let t = T0;
    let jobs = 0;
    while (s.player.level < 5 && jobs < 200) {
      // play like a person would: best unlocked job in each career, in parallel
      for (const c of CAREERS) {
        const best = JOBS.filter((j) => j.career === c.id && !jobLockReason(s, j)).sort((a, b) => b.seconds - a.seconds)[0];
        if (best && !s.activeJobs[c.id]) startJob(s, best.id, t);
      }
      t += 1000;
      for (const c of CAREERS) if (s.activeJobs[c.id] && isReady(s.activeJobs[c.id], t)) { claimJob(s, c.id, t); jobs++; }
    }
    const minutes = (t - T0) / 60000;
    expect(s.player.level).toBeGreaterThanOrEqual(5);
    expect(minutes).toBeLessThan(15);
  });
});
