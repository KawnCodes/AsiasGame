import { describe, it, expect } from 'vitest';
import { createNewGameState } from '../src/systems/gameState.js';
import { claimDaily, dailyStatus } from '../src/systems/dailySystem.js';
import { ensureQuests, recordEvent, claimQuest, listQuests, claimableCount } from '../src/systems/questSystem.js';
import { startJob, claimJob } from '../src/systems/careerSystem.js';
import { purchase, saveOutfit } from '../src/systems/inventory.js';
import { migrate } from '../src/systems/saveSystem.js';
import { SAVE_VERSION } from '../src/systems/gameState.js';
import { DAILY_POOL, ALL_QUESTS } from '../src/data/quests.js';
import { BALANCE } from '../src/data/gameBalance.js';
import { dateKey, weekKey, previousDateKey } from '../src/utils/time.js';

const day = (d, h = 12) => new Date(2026, 10, d, h, 0, 0).getTime();

describe('calendar helpers', () => {
  it('uses local calendar days and Monday weeks', () => {
    expect(dateKey(day(6))).toBe('2026-11-06');
    expect(dateKey(new Date(2026, 10, 6, 23, 59).getTime())).toBe('2026-11-06');
    expect(dateKey(new Date(2026, 10, 7, 0, 1).getTime())).toBe('2026-11-07');
    expect(previousDateKey(new Date(2026, 11, 1).getTime())).toBe('2026-11-30');
    expect(weekKey(day(6))).toBe('2026-11-02'); // Fri → Mon 2 Nov
    expect(weekKey(day(9))).toBe('2026-11-09');
  });
});

describe('daily reward', () => {
  it('pays 1,000 coins + 10 gems once per day', () => {
    const s = createNewGameState();
    const r = claimDaily(s, day(6, 9));
    expect(r).toMatchObject({ ok: true, day: 1 });
    expect(s.player.coins).toBe(6000);
    expect(s.player.gems).toBe(110);
    expect(claimDaily(s, day(6, 23)).ok).toBe(false);
    expect(s.player.coins).toBe(6000);
    expect(dailyStatus(s, day(6, 23)).claimedToday).toBe(true);
  });
  it('builds a 7-day streak, cycles, and resets after a missed day', () => {
    const s = createNewGameState();
    for (let d = 1; d <= 8; d++) expect(claimDaily(s, day(d)).day).toBe(((d - 1) % 7) + 1);
    expect(s.daily.streak).toBe(8);
    const st = dailyStatus(s, day(10));
    expect(st.brokeStreak).toBe(true);
    expect(claimDaily(s, day(10)).day).toBe(1);
    expect(s.daily.streak).toBe(1);
  });
  it('the day-7 reward is the biggest', () => {
    const t = BALANCE.daily.streak;
    expect(t[6].coins).toBe(Math.max(...t.map((x) => x.coins)));
    expect(t[0]).toEqual({ coins: BALANCE.daily.coins, gems: BALANCE.daily.gems });
  });
});

describe('quests', () => {
  it('rotates a deterministic daily set of 3 and keeps it all day', () => {
    const a = createNewGameState();
    const b = createNewGameState();
    ensureQuests(a, day(6, 8));
    ensureQuests(b, day(6, 20));
    expect(a.quests.daily.ids).toHaveLength(3);
    expect(a.quests.daily.ids).toEqual(b.quests.daily.ids);
    const before = [...a.quests.daily.ids];
    expect(ensureQuests(a, day(6, 22))).toBe(false);
    expect(a.quests.daily.ids).toEqual(before);
    ensureQuests(a, day(7));
    expect(a.quests.daily.key).toBe('2026-11-07');
  });
  it('only offers level-gated quests to players who can do them', () => {
    for (let d = 1; d <= 30; d++) {
      const s = createNewGameState();
      ensureQuests(s, day(d));
      for (const id of s.quests.daily.ids) expect(ALL_QUESTS[id].needsLevel || 1).toBe(1);
    }
  });
  it('counts events, completes and pays once', () => {
    const s = createNewGameState();
    ensureQuests(s, day(6));
    s.quests.daily.ids = ['d_jobs3', 'd_buy1', 'd_earn2k'];
    let t = day(6);
    for (let i = 0; i < 3; i++) { startJob(s, 'mod_catalogue', t); t += 15000; claimJob(s, 'modelling', t); }
    purchase(s, 'clothing', 'top_rose_tee');
    const daily = listQuests(s, 'daily');
    expect(daily.find((q) => q.def.id === 'd_jobs3').done).toBe(true);
    expect(daily.find((q) => q.def.id === 'd_buy1').done).toBe(true);
    expect(daily.find((q) => q.def.id === 'd_earn2k').value).toBeGreaterThan(0);
    const coins = s.player.coins;
    expect(claimQuest(s, 'daily', 'd_jobs3', t).ok).toBe(true);
    expect(s.player.coins).toBe(coins + ALL_QUESTS.d_jobs3.reward.coins);
    expect(claimQuest(s, 'daily', 'd_jobs3', t).ok).toBe(false);
    expect(claimQuest(s, 'daily', 'd_earn2k', t)).toMatchObject({ ok: false, reason: 'not-complete' });
  });
  it('expires daily quests at midnight', () => {
    const s = createNewGameState();
    ensureQuests(s, day(6));
    const id = s.quests.daily.ids[0];
    s.quests.daily.progress[id] = 999;
    ensureQuests(s, day(7));
    if (!s.quests.daily.ids.includes(id)) expect(claimQuest(s, 'daily', id, day(7)).reason).toBe('expired');
    expect(s.quests.daily.progress[id]).toBeUndefined();
  });
  it('story quests read live state', () => {
    const s = createNewGameState();
    expect(listQuests(s, 'story').find((q) => q.def.id === 's_firstbuy').done).toBe(false);
    purchase(s, 'clothing', 'top_rose_tee');
    saveOutfit(s, 'x');
    expect(claimableCount(s)).toBeGreaterThanOrEqual(1);
    expect(claimQuest(s, 'story', 's_firstbuy').ok).toBe(true);
    expect(claimQuest(s, 'story', 's_firstbuy').ok).toBe(false);
  });
  it('quest rewards stay inside the configured range', () => {
    for (const q of DAILY_POOL) {
      expect(q.reward.coins).toBeGreaterThanOrEqual(BALANCE.rewards.questRange[0]);
      expect(q.reward.coins).toBeLessThanOrEqual(BALANCE.rewards.questRange[1]);
    }
  });
});

describe('save migration v1 → v2', () => {
  it('adds careers, timers, daily and quest state to Milestone 1 saves', () => {
    const v1 = createNewGameState({ name: 'Old' });
    v1.version = 1;
    delete v1.careers; delete v1.activeJobs; delete v1.daily; delete v1.quests;
    const m = migrate(v1);
    expect(m.version).toBe(SAVE_VERSION);
    expect(m.careers.modelling).toEqual({ xp: 0, level: 1, jobsDone: 0 });
    expect(m.activeJobs).toEqual({});
    expect(m.daily.streak).toBe(0);
    expect(m.quests.story.claimed).toEqual({});
  });
  it('keeps running job timers across a save round-trip', () => {
    const s = createNewGameState();
    startJob(s, 'mod_catalogue', day(6));
    const m = migrate(JSON.parse(JSON.stringify(s)));
    expect(m.activeJobs.modelling.endsAt).toBe(s.activeJobs.modelling.endsAt);
  });
});
