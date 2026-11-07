import { describe, it, expect } from 'vitest';
import { createNewGameState, createStore } from '../src/systems/gameState.js';
import { canAfford, spend, grant } from '../src/systems/economy.js';
import { addXP, requiredXP } from '../src/systems/progression.js';
import { BALANCE } from '../src/data/gameBalance.js';

describe('starting state', () => {
  it('matches the balance sheet', () => {
    const s = createNewGameState({ name: 'Ava' });
    expect(s.player).toMatchObject({ coins: 5000, gems: 100, level: 1, xp: 0, fame: 0, name: 'Ava' });
    expect(s.properties.owned).toEqual(['starter_apartment']);
    expect(Object.keys(s.inventory.clothing).length).toBeGreaterThanOrEqual(5);
  });
});

describe('spending', () => {
  it('deducts coins and refuses when unaffordable', () => {
    const s = createNewGameState();
    expect(spend(s, { coins: 1200 })).toBe(true);
    expect(s.player.coins).toBe(3800);
    expect(canAfford(s, { coins: 3801 })).toBe(false);
    expect(spend(s, { coins: 3801 })).toBe(false);
    expect(s.player.coins).toBe(3800);
  });
  it('handles gem prices separately', () => {
    const s = createNewGameState();
    expect(spend(s, { gems: 60 })).toBe(true);
    expect(s.player.gems).toBe(40);
    expect(s.player.coins).toBe(5000);
  });
});

describe('rewards & XP', () => {
  it('requires 500 XP for level 1 and scales gently', () => {
    expect(requiredXP(1)).toBe(500);
    expect(requiredXP(2)).toBe(560);
    expect(requiredXP(10)).toBe(Math.round(500 * 1.12 ** 9));
  });
  it('levels up and pays the level-up reward exactly once per level', () => {
    const s = createNewGameState();
    const levels = addXP(s, 500 + 560 + 10);
    expect(levels).toEqual([2, 3]);
    expect(s.player.level).toBe(3);
    expect(s.player.xp).toBe(10);
    expect(s.player.coins).toBe(5000 + 2 * BALANCE.levelUpReward.coins);
    expect(s.player.gems).toBe(100 + 2 * BALANCE.levelUpReward.gems);
  });
  it('grant is idempotent per transaction id', () => {
    const s = createNewGameState();
    expect(grant(s, { coins: 1000, gems: 10 }, 'daily:2026-11-06').ok).toBe(true);
    expect(grant(s, { coins: 1000, gems: 10 }, 'daily:2026-11-06').ok).toBe(false);
    expect(s.player.coins).toBe(6000);
    expect(s.player.gems).toBe(110);
  });
  it('level 5 is reachable after ~20 standard jobs', () => {
    const s = createNewGameState();
    for (let i = 0; i < 20; i++) addXP(s, BALANCE.jobs.standardReward.xp);
    expect(s.player.level).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < 5; i++) addXP(s, BALANCE.jobs.standardReward.xp);
    expect(s.player.level).toBeGreaterThanOrEqual(5);
  });
});

describe('store transactions', () => {
  it('discards drafts when the action fails', () => {
    const store = createStore(createNewGameState());
    const before = store.get();
    const r = store.transact((d) => { d.player.coins = 0; return { ok: false }; });
    expect(r.ok).toBe(false);
    expect(store.get()).toBe(before);
    expect(store.get().player.coins).toBe(5000);
  });
  it('commits and notifies on success', () => {
    const store = createStore(createNewGameState());
    let calls = 0;
    store.subscribe(() => calls++);
    store.transact((d) => { d.player.coins += 1; });
    expect(store.get().player.coins).toBe(5001);
    expect(calls).toBe(1);
  });
});
