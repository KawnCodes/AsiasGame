import { describe, it, expect } from 'vitest';
import { createNewGameState } from '../src/systems/gameState.js';
import { THEMES, THEME_BY_ID, JUDGES, CATEGORIES } from '../src/data/competitions.js';
import { BALANCE } from '../src/data/gameBalance.js';
import {
  scoreLook, judgeLook, generateRival, tagFit, ensureBoard, submitEntry, prizeFor, spotlightTheme, tierAvailable,
  canEnter, lookSignature, ensureJudgeRound, answerJudgeRound, CATEGORY_IDS,
} from '../src/systems/competitionSystem.js';
import { purchase, equip } from '../src/systems/inventory.js';
import { listQuests } from '../src/systems/questSystem.js';
import { migrate } from '../src/systems/saveSystem.js';
import { SAVE_VERSION } from '../src/systems/gameState.js';
import { seededRandom } from '../src/utils/time.js';

const NOW = new Date(2026, 10, 7, 12, 0, 0).getTime();
const total = (look, theme) => judgeLook(scoreLook(look, theme), seededRandom('t')).reduce((n, j) => n + j.score, 0);
const redCarpet = THEME_BY_ID.red_carpet;
const glamLook = {
  appearance: { hairStyle: 'hollywood', lipstick: 'lip_red', eyeliner: 'el_wing', eyeshadow: 'es_gold', blush: 'bl_rose' },
  equipped: { dress: 'gown_red_mermaid', shoes: 'sh_red_pumps', bag: 'bag_gold_clutch', earrings: 'ear_chandelier', necklace: 'neck_statement' },
};
const casualLook = { appearance: { hairStyle: 'ponytail' }, equipped: { top: 'top_sport_tank', bottom: 'bot_denim_shorts', shoes: 'sh_cloud_sneaks' } };

describe('theme data', () => {
  it('has the ten required themes with palettes and style weights', () => {
    const names = THEMES.map((t) => t.name);
    for (const n of ['Red Carpet Glamour', 'Summer Chic', 'Royal Princess', 'Romantic Date', 'Vintage Hollywood', 'Elegant Evening', 'Winter Wonderland', 'Street Style', 'Pastel Princess', 'Luxury Fashion']) expect(names).toContain(n);
    for (const t of THEMES) { expect(t.palette.length).toBeGreaterThanOrEqual(4); expect(Object.keys(t.styles).length).toBeGreaterThanOrEqual(3); }
  });
  it('every judge weighs only known categories', () => {
    for (const j of JUDGES) for (const k of Object.keys(j.weights)) expect(Object.keys(CATEGORIES)).toContain(k);
  });
});

describe('scoring', () => {
  it('rates all eight categories between 0 and 10', () => {
    const r = scoreLook(glamLook, redCarpet);
    expect(Object.keys(r.categories).sort()).toEqual([...CATEGORY_IDS].sort());
    for (const v of Object.values(r.categories)) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(10); }
  });
  it('an on-theme look beats an off-theme one in every judge\'s eyes', () => {
    const a = judgeLook(scoreLook(glamLook, redCarpet), seededRandom('x'));
    const b = judgeLook(scoreLook(casualLook, redCarpet), seededRandom('x'));
    a.forEach((j, i) => expect(j.score).toBeGreaterThan(b[i].score));
  });
  it('the same casual look does better in Street Style than on the red carpet', () => {
    expect(total(casualLook, THEME_BY_ID.street_style)).toBeGreaterThan(total(casualLook, redCarpet));
  });
  it('penalises a missing base outfit and missing shoes', () => {
    const noShoes = { ...glamLook, equipped: { ...glamLook.equipped, shoes: null } };
    const noBase = { appearance: glamLook.appearance, equipped: { shoes: 'sh_red_pumps', top: 'top_satin_cami' } };
    const base = scoreLook(glamLook, redCarpet).categories.theme;
    expect(scoreLook(noShoes, redCarpet).categories.theme).toBeLessThan(base);
    expect(scoreLook(noBase, redCarpet).categories.theme).toBeLessThan(base / 2);
    expect(canEnter(noBase).ok).toBe(false);
  });
  it('signature makeup, accessories and rarity each move their category', () => {
    const plain = { appearance: { hairStyle: 'hollywood', lipstick: 'lip_natural', eyeliner: 'el_none', eyeshadow: 'es_none', blush: 'bl_none' }, equipped: { dress: 'gown_red_mermaid', shoes: 'sh_red_pumps' } };
    const p = scoreLook(plain, redCarpet).categories;
    const g = scoreLook(glamLook, redCarpet).categories;
    expect(g.makeup).toBeGreaterThan(p.makeup);
    expect(g.accessories).toBeGreaterThan(p.accessories);
    const commonLook = { ...glamLook, equipped: { ...glamLook.equipped, dress: 'dr_red_slip' } };
    expect(scoreLook(glamLook, redCarpet).categories.rarity).toBeGreaterThan(scoreLook(commonLook, redCarpet).categories.rarity);
  });
  it('rewards a theme palette over clashing colours', () => {
    const onPalette = { appearance: {}, equipped: { dress: 'dr_red_slip', shoes: 'sh_red_pumps', bag: 'bag_gold_clutch' } };
    const clash = { appearance: {}, equipped: { dress: 'dr_red_slip', shoes: 'sh_mint_flats', bag: 'bag_mint_shoulder', hairAcc: 'hacc_lilac_beret', earrings: 'ear_sapphire_drops' } };
    expect(scoreLook(onPalette, redCarpet).categories.colour).toBeGreaterThan(scoreLook(clash, redCarpet).categories.colour);
  });
  it('re-entering the identical look costs creativity', () => {
    const fresh = scoreLook(glamLook, redCarpet).categories.creativity;
    const repeat = scoreLook(glamLook, redCarpet, { lastSignature: lookSignature(glamLook) }).categories.creativity;
    expect(repeat).toBeLessThan(fresh);
  });
  it('the three judges comment on three different things', () => {
    for (const look of [glamLook, casualLook]) {
      const js = judgeLook(scoreLook(look, redCarpet), seededRandom('c'));
      expect(new Set(js.map((j) => j.focus)).size).toBe(3);
      expect(new Set(js.map((j) => j.comment)).size).toBe(3);
    }
  });
  it('judging is deterministic for a given seed', () => {
    const s = scoreLook(glamLook, redCarpet);
    expect(judgeLook(s, seededRandom('same'))).toEqual(judgeLook(s, seededRandom('same')));
  });
});

describe('rivals & difficulty', () => {
  const avgRival = (skill) => {
    const rnd = seededRandom(`skill${skill}`);
    let sum = 0;
    for (const t of THEMES) for (let i = 0; i < 6; i++) sum += total(generateRival(t, skill, rnd, 'R'), t);
    return sum / (THEMES.length * 6);
  };
  it('more skilled rivals dress better', () => {
    expect(avgRival(0.9)).toBeGreaterThan(avgRival(0.1) + 2);
  });
  it('rivals always wear a complete base outfit', () => {
    const rnd = seededRandom('base');
    for (const t of THEMES) expect(canEnter(generateRival(t, rnd(), rnd, 'R')).ok).toBe(true);
  });
  it('tiers unlock by level', () => {
    const s = createNewGameState();
    expect(tierAvailable(s, 'rising')).toBe(true);
    expect(tierAvailable(s, 'city')).toBe(false);
    s.player.level = BALANCE.contests.tiers.gala.minLevel;
    expect(tierAvailable(s, 'gala')).toBe(true);
  });
});

describe('contest board & entry', () => {
  const ready = () => {
    const s = createNewGameState({ outfitId: 'sunny' });
    ensureBoard(s, NOW);
    return s;
  };
  it('offers four distinct themes including the theme of the day, only in unlocked tiers', () => {
    const s = ready();
    expect(s.contests.board).toHaveLength(BALANCE.contests.boardSize);
    expect(new Set(s.contests.board.map((b) => b.theme)).size).toBe(s.contests.board.length);
    expect(s.contests.board.map((b) => b.theme)).toContain(spotlightTheme(NOW));
    for (const b of s.contests.board) expect(b.tier).toBe('rising');
  });
  it('pays at least the entry prize, records history and replaces the board slot', () => {
    const s = ready();
    const uid = s.contests.board[1].uid;
    const coins = s.player.coins;
    const r = submitEntry(s, uid, NOW);
    expect(r.ok).toBe(true);
    expect(r.contestants).toHaveLength(1 + BALANCE.contests.tiers.rising.rivals);
    expect(r.ranked.map((c) => c.place)).toEqual([1, 2, 3, 4, 5]);
    expect(s.player.coins - coins).toBeGreaterThanOrEqual(BALANCE.contests.prizes.entry.coins);
    expect(s.player.coins - coins).toBe(r.reward.coins);
    expect(s.contests.entries).toBe(1);
    expect(s.contests.history[0].uid).toBe(uid);
    expect(s.contests.board.some((b) => b.uid === uid)).toBe(false);
    expect(s.contests.board).toHaveLength(BALANCE.contests.boardSize);
  });
  it('cannot be entered twice', () => {
    const s = ready();
    const uid = s.contests.board[0].uid;
    submitEntry(s, uid, NOW);
    expect(submitEntry(s, uid, NOW).ok).toBe(false);
  });
  it('requires an outfit', () => {
    const s = ready();
    s.equipped.top = null; s.equipped.bottom = null; s.equipped.dress = null;
    expect(submitEntry(s, s.contests.board[0].uid, NOW)).toMatchObject({ ok: false, reason: 'no-outfit' });
    expect(s.contests.entries).toBe(0);
  });
  it('a carefully styled look wins and earns a gold trophy, prizes and quest progress', () => {
    const s = ready();
    s.player.coins = 100000; s.player.gems = 1000;
    for (const id of Object.values(glamLook.equipped)) { purchase(s, 'clothing', id); equip(s, id); }
    purchase(s, 'hairstyle', 'hollywood');
    for (const id of ['lip_red', 'el_wing', 'es_gold', 'bl_rose']) purchase(s, 'makeup', id);
    Object.assign(s.appearance, glamLook.appearance);
    s.contests.board[0] = { uid: 'test-red', theme: 'red_carpet', tier: 'rising' };
    const gems = s.player.gems;
    const r = submitEntry(s, 'test-red', NOW);
    expect(r.me.place).toBe(1);
    expect(r.reward.coins).toBeGreaterThanOrEqual(BALANCE.contests.prizes[1].coins);
    expect(s.player.gems - gems).toBe(BALANCE.contests.prizes[1].gems);
    expect(s.trophies).toHaveLength(1);
    expect(s.trophies[0]).toMatchObject({ place: 1, theme: 'red_carpet' });
    expect(s.contests.wins).toBe(1);
    expect(listQuests(s, 'story').find((q) => q.def.id === 's_firstwin').done).toBe(true);
  });
  it('the same contest uid always produces the same rivals and scores', () => {
    const a = ready(); const b = ready();
    a.contests.board[0] = { uid: 'fixed', theme: 'summer_chic', tier: 'rising' };
    b.contests.board[0] = { uid: 'fixed', theme: 'summer_chic', tier: 'rising' };
    const ra = submitEntry(a, 'fixed', NOW); const rb = submitEntry(b, 'fixed', NOW);
    expect(ra.contestants.map((c) => c.total)).toEqual(rb.contestants.map((c) => c.total));
  });
  it('prizes follow the balance sheet: win 1,500 + 20 gems, entry ≥ 200, tiers multiply, spotlight adds coins', () => {
    expect(prizeFor(1, 'rising')).toMatchObject({ coins: 1500, gems: 20 });
    expect(prizeFor(5, 'rising').coins).toBe(200);
    expect(prizeFor(1, 'gala').coins).toBeGreaterThan(prizeFor(1, 'city').coins);
    expect(prizeFor(1, 'rising', true).coins).toBe(2250);
  });
});

describe('guest judge', () => {
  it('pays for correct calls, up to the daily limit', () => {
    const s = createNewGameState();
    let paid = 0;
    for (let i = 0; i < 15; i++) {
      const round = ensureJudgeRound(s, NOW);
      const best = round.totals[0] >= round.totals[1] ? 0 : 1;
      const r = answerJudgeRound(s, best, NOW);
      expect(r.correct).toBe(true);
      if (r.reward) paid++;
    }
    expect(paid).toBe(BALANCE.contests.guestJudge.paidRoundsPerDay);
    const round = ensureJudgeRound(s, NOW + 86400000);
    expect(answerJudgeRound(s, round.totals[0] >= round.totals[1] ? 0 : 1, NOW + 86400000).reward).not.toBe(null);
  });
  it('wrong calls pay nothing', () => {
    const s = createNewGameState();
    const round = ensureJudgeRound(s, NOW);
    const wrong = round.totals[0] >= round.totals[1] ? 1 : 0;
    const coins = s.player.coins;
    expect(answerJudgeRound(s, wrong, NOW)).toMatchObject({ correct: false, reward: null });
    expect(s.player.coins).toBe(coins);
  });
});

describe('save migration v2 → v3', () => {
  it('adds contest state and trophies to older saves', () => {
    const v2 = createNewGameState();
    v2.version = 2;
    delete v2.contests; delete v2.trophies;
    const m = migrate(v2);
    expect(m.version).toBe(SAVE_VERSION);
    expect(m.contests).toMatchObject({ entries: 0, wins: 0, board: [] });
    expect(m.trophies).toEqual([]);
  });
});
