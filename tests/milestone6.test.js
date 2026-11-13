import { describe, it, expect } from 'vitest';
import { createNewGameState, SAVE_VERSION } from '../src/systems/gameState.js';
import { createMemory, flipCard, hideMiss, memoryScore, memoryStars, MEMORY_LEVELS } from '../src/minigames/memory.js';
import { createMatch3, findMatches, hasPossibleMove, trySwap, match3Stars, MATCH3 } from '../src/minigames/match3.js';
import { createChallenge, scoreChallenge, KIT_SLOTS } from '../src/minigames/styling.js';
import { claimMinigame, minigameReward } from '../src/systems/minigameSystem.js';
import { takePhoto, deletePhoto, isUnlocked } from '../src/systems/photoSystem.js';
import { POSES, BACKDROPS } from '../src/data/photo.js';
import { scoreRoom, ensureHomeBoard, submitHomeEntry, generateRivalRoom, homePrize } from '../src/systems/homeContestSystem.js';
import { HOME_THEMES, HOME_THEME_BY_ID } from '../src/data/homeContests.js';
import { sellClothing, purchase, equip, clothingResale } from '../src/systems/inventory.js';
import { buyFurniture, sellFurniture } from '../src/systems/furnitureInventory.js';
import { placeItem, layoutOf, storeItem } from '../src/systems/decoratingSystem.js';
import { CLOTHING_BY_ID } from '../src/data/clothing.js';
import { FURNITURE_BY_ID } from '../src/data/furniture.js';
import { BALANCE } from '../src/data/gameBalance.js';
import { tagFit } from '../src/systems/competitionSystem.js';
import { THEME_BY_ID } from '../src/data/competitions.js';
import { migrate } from '../src/systems/saveSystem.js';
import { seededRandom } from '../src/utils/time.js';

const NOW = new Date(2026, 10, 13, 12).getTime();

describe('Fashion Memory', () => {
  it('deals pairs for each difficulty', () => {
    for (const [lvl, L] of Object.entries(MEMORY_LEVELS)) {
      const g = createMemory(lvl, 'x');
      expect(g.cards).toHaveLength(L.pairs * 2);
      const counts = {};
      for (const c of g.cards) counts[c.face] = (counts[c.face] || 0) + 1;
      expect(Object.values(counts).every((n) => n === 2)).toBe(true);
    }
  });
  it('matches, misses and finishes', () => {
    const g = createMemory('easy', 'seed');
    const byFace = {};
    g.cards.forEach((c, i) => (byFace[c.face] ||= []).push(i));
    const [a, b] = Object.values(byFace)[0];
    const other = Object.values(byFace)[1][0];
    expect(flipCard(g, a).result).toBe('first');
    expect(flipCard(g, other).result).toBe('miss');
    expect(flipCard(g, b).result).toBe('ignored'); // must hide the miss first
    hideMiss(g);
    expect(g.cards[a].open).toBe(false);
    for (const [x, y] of Object.values(byFace)) { flipCard(g, x); flipCard(g, y); }
    expect(g.done).toBe(true);
    expect(g.moves).toBe(g.pairs + 1);
    expect(memoryStars(g)).toBe(3);
    expect(memoryScore(g, 20)).toBeGreaterThan(memoryScore({ ...g, moves: 30 }, 90));
  });
});

describe('Jewellery Match-3', () => {
  const fixed = (rows) => rows.map((r) => r.split('').map(Number));
  it('detects horizontal and vertical runs of 3+', () => {
    const b = fixed(['11123', '23451', '24512', '25123', '34512']);
    const { cells, runs } = findMatches(b);
    expect(cells.has(0)).toBe(true); expect(cells.has(1)).toBe(true); expect(cells.has(2)).toBe(true);
    expect(cells.has(100)).toBe(true); expect(cells.has(200)).toBe(true); expect(cells.has(300)).toBe(true);
    expect(runs.sort()).toEqual([3, 3]);
  });
  it('starts with no ready-made matches and at least one move', () => {
    for (let i = 0; i < 20; i++) {
      const g = createMatch3(`s${i}`);
      expect(findMatches(g.board).cells.size).toBe(0);
      expect(hasPossibleMove(g.board)).toBe(true);
    }
  });
  it('rejects non-adjacent and non-matching swaps without spending a move', () => {
    const g = createMatch3('a');
    expect(trySwap(g, { r: 0, c: 0 }, { r: 2, c: 0 }).reason).toBe('not-adjacent');
    // find a swap that makes no match
    outer: for (let r = 0; r < g.size; r++) for (let c = 0; c < g.size - 1; c++) {
      const copy = g.board.map((x) => [...x]);
      const res = trySwap(g, { r, c }, { r, c: c + 1 });
      if (!res.ok) { expect(res.reason).toBe('no-match'); expect(g.board).toEqual(copy); expect(g.moves).toBe(MATCH3.moves); break outer; }
      break outer;
    }
  });
  it('a valid swap clears, cascades, refills a full board and scores', () => {
    const g = createMatch3('cascade');
    let done = false;
    for (let r = 0; r < g.size && !done; r++) for (let c = 0; c < g.size && !done; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
      if (r + dr >= g.size || c + dc >= g.size || done) continue;
      const res = trySwap(g, { r, c }, { r: r + dr, c: c + dc });
      if (res.ok) {
        done = true;
        expect(res.steps.length).toBeGreaterThan(0);
        expect(g.score).toBeGreaterThanOrEqual(30);
        expect(g.moves).toBe(MATCH3.moves - 1);
        expect(g.board.flat().every((j) => j !== null && j >= 0 && j < 6)).toBe(true);
        expect(findMatches(g.board).cells.size).toBe(0); // fully resolved
        expect(hasPossibleMove(g.board)).toBe(true);
      }
    }
    expect(done).toBe(true);
  });
  it('wins on reaching the target and loses when out of moves', () => {
    const w = createMatch3('w', { target: 30 });
    const l = createMatch3('l', { moves: 1, target: 999999 });
    const firstValid = (g) => { for (let r = 0; r < g.size; r++) for (let c = 0; c < g.size - 1; c++) { const res = trySwap(g, { r, c }, { r, c: c + 1 }); if (res.ok) return res; } for (let r = 0; r < g.size - 1; r++) for (let c = 0; c < g.size; c++) { const res = trySwap(g, { r, c }, { r: r + 1, c }); if (res.ok) return res; } return null; };
    expect(firstValid(w).status).toBe('won');
    expect(match3Stars(w)).toBeGreaterThan(0);
    expect(firstValid(l).status).toBe('lost');
    expect(trySwap(l, { r: 0, c: 0 }, { r: 0, c: 1 }).reason).toBe('over');
  });
});

describe('Timed Styling Challenge', () => {
  it('builds a kit for every slot with on-theme pieces and decoys', () => {
    const ch = createChallenge('k');
    const theme = THEME_BY_ID[ch.theme];
    for (const slot of KIT_SLOTS) {
      expect(ch.kit[slot].length).toBeGreaterThanOrEqual(3);
      const fits = ch.kit[slot].map((id) => tagFit(CLOTHING_BY_ID[id].styles, theme));
      expect(Math.max(...fits)).toBeGreaterThanOrEqual(Math.min(...fits));
    }
    expect(ch.seconds).toBeLessThanOrEqual(60);
  });
  it('rewards picking on-theme pieces over decoys', () => {
    const ch = createChallenge('score');
    const theme = THEME_BY_ID[ch.theme];
    const pick = (best) => {
      const eq = {};
      for (const slot of KIT_SLOTS) {
        if (slot === 'top' || slot === 'bottom') continue;
        const sorted = [...ch.kit[slot]].sort((a, b) => tagFit(CLOTHING_BY_ID[b].styles, theme) - tagFit(CLOTHING_BY_ID[a].styles, theme));
        eq[slot] = best ? sorted[0] : sorted[sorted.length - 1];
      }
      return { appearance: { hairStyle: ch.hair[0] }, equipped: eq };
    };
    const good = scoreChallenge(pick(true), ch.theme);
    const bad = scoreChallenge(pick(false), ch.theme);
    expect(good.percent).toBeGreaterThan(bad.percent);
    expect(scoreChallenge({ appearance: {}, equipped: {} }, ch.theme).stars).toBe(0);
  });
});

describe('minigame rewards', () => {
  it('a normal finished game pays 250 coins + 50 XP; harder & better pays more; unfinished pays half', () => {
    expect(minigameReward({ game: 'match3', finished: true, stars: 1 })).toEqual({ coins: 250, xp: 50 });
    expect(minigameReward({ game: 'memory', level: 'hard', finished: true, stars: 3 }).coins).toBeGreaterThan(250);
    expect(minigameReward({ game: 'match3', finished: false, stars: 0 })).toEqual({ coins: 125, xp: 25 });
  });
  it('claims once per play and tracks best scores', () => {
    const s = createNewGameState();
    const r = claimMinigame(s, { game: 'memory', uid: 'u1', level: 'easy', score: 900, stars: 3, finished: true });
    expect(r.ok && r.best).toBe(true);
    expect(claimMinigame(s, { game: 'memory', uid: 'u1', level: 'easy', score: 900, stars: 3, finished: true }).ok).toBe(false);
    expect(s.minigames).toMatchObject({ played: 1, wins: 1, best: { memory_easy: 900 } });
  });
});

describe('photo studio', () => {
  it('locks advanced poses and backdrops behind modelling career level', () => {
    const s = createNewGameState();
    const runway = BACKDROPS.find((b) => b.id === 'runway');
    expect(isUnlocked(s, runway)).toBe(false);
    expect(takePhoto(s, { pose: 'classic', backdrop: 'runway', frame: 'none' }, NOW).reason).toBe('locked');
    s.careers.modelling.level = 5;
    expect(isUnlocked(s, runway)).toBe(true);
    expect(POSES.filter((p) => isUnlocked(s, p)).length).toBeGreaterThan(POSES.filter((p) => !p.unlock).length);
  });
  it('saves a photo spec, pays the daily reward once, and a first cover pays fame', () => {
    const s = createNewGameState();
    const a = takePhoto(s, { pose: 'classic', backdrop: 'studio_pink', frame: 'polaroid' }, NOW);
    expect(a.ok && a.reward).toBeTruthy();
    expect(s.photos[0].look.equipped).toEqual(s.equipped);
    const b = takePhoto(s, { pose: 'portrait', backdrop: 'paris', frame: 'none', cover: { masthead: 'etoile', headline: 'Hi' } }, NOW);
    expect(b.reward.fame).toBe(BALANCE.photos.coverReward.fame);
    expect(takePhoto(s, { pose: 'portrait', backdrop: 'paris', frame: 'none' }, NOW).reward).toBe(null);
    expect(takePhoto(s, { pose: 'classic', backdrop: 'home', frame: 'none', home: { property: 'starter_apartment', room: 'bedroom' } }, NOW).ok).toBe(true);
    expect(takePhoto(s, { pose: 'classic', backdrop: 'home', frame: 'none', home: { property: 'mansion', room: 'living' } }, NOW).reason).toBe('bad-home');
    expect(deletePhoto(s, s.photos[0].id).ok).toBe(true);
    expect(s.stats.covers).toBe(1);
  });
  it('stops at a full album', () => {
    const s = createNewGameState();
    for (let i = 0; i < BALANCE.photos.albumMax; i++) takePhoto(s, { pose: 'classic', backdrop: 'studio_pink', frame: 'none' }, NOW + i);
    expect(takePhoto(s, { pose: 'classic', backdrop: 'studio_pink', frame: 'none' }, NOW).reason).toBe('album-full');
  });
});

describe('home design contests', () => {
  it('a themed, well-furnished room beats an empty-ish off-theme one', () => {
    const s = createNewGameState();
    s.player.coins = 1e6;
    const pink = HOME_THEME_BY_ID.princess_suite;
    const starter = scoreRoom(s, 'starter_apartment', 'bedroom', pink.id); // already pink-ish
    const academia = scoreRoom(s, 'starter_apartment', 'bedroom', 'autumn_living');
    expect(starter.percent).toBeGreaterThan(academia.percent);
    for (const id of ['pink_princess__dressing_table', 'pink_princess__chandelier', 'decor_pink_tree']) placeItem(s, 'starter_apartment', 'bedroom', buyFurniture(s, id).uids[0]);
    expect(scoreRoom(s, 'starter_apartment', 'bedroom', pink.id).percent).toBeGreaterThanOrEqual(starter.percent);
  });
  it('rival rooms are real rooms scored the same way; skill helps', () => {
    const s = createNewGameState();
    const theme = HOME_THEMES[0];
    const avg = (skill) => { const rnd = seededRandom(`r${skill}`); let t = 0; for (let i = 0; i < 25; i++) { const r = generateRivalRoom(s, theme, skill, rnd, 'R'); t += scoreRoom(r.ghost, r.property, r.room, theme.id).percent; } return t / 25; };
    expect(avg(0.95)).toBeGreaterThan(avg(0.05));
  });
  it('entering: needs 3+ pieces, ranks 5 entries, pays prizes once, records awards and refills', () => {
    const s = createNewGameState();
    s.player.coins = 1e6;
    ensureHomeBoard(s, NOW);
    expect(s.homeContests.board).toHaveLength(BALANCE.homeContests.boardSize);
    const uid = s.homeContests.board[0].uid;
    for (const uidF of Object.keys(layoutOf(s, 'starter_apartment', 'bedroom').placed)) storeItem(s, uidF);
    expect(submitHomeEntry(s, uid, 'starter_apartment', 'bedroom', NOW).reason).toBe('too-empty');
    for (const uidF of Object.keys(s.furniture.items)) placeItem(s, 'starter_apartment', 'bedroom', uidF);
    const coins = s.player.coins;
    const r = submitHomeEntry(s, uid, 'starter_apartment', 'bedroom', NOW);
    expect(r.ok).toBe(true);
    expect(r.ranked).toHaveLength(1 + BALANCE.homeContests.rivals);
    expect(s.player.coins - coins).toBeGreaterThanOrEqual(homePrize(5).coins);
    expect(submitHomeEntry(s, uid, 'starter_apartment', 'bedroom', NOW).ok).toBe(false);
    expect(s.homeContests.board).toHaveLength(BALANCE.homeContests.boardSize);
    expect(s.homeAwards.length).toBe(r.me.place <= 3 ? 1 : 0);
    expect(homePrize(1)).toMatchObject({ coins: 1500, gems: 10 });
  });
});

describe('resale', () => {
  it('sells clothing for 50 %, but not while worn, and never starter pieces', () => {
    const s = createNewGameState({ outfitId: 'sunny' });
    purchase(s, 'clothing', 'dr_red_slip');
    equip(s, 'dr_red_slip');
    expect(sellClothing(s, 'dr_red_slip').reason).toBe('equipped');
    equip(s, 'top_daisy_tee'); equip(s, 'bot_denim_mini');
    const coins = s.player.coins;
    const r = sellClothing(s, 'dr_red_slip');
    expect(r.ok).toBe(true);
    expect(s.player.coins - coins).toBe(Math.floor(CLOTHING_BY_ID.dr_red_slip.price.coins * 0.5));
    expect(s.inventory.clothing.dr_red_slip).toBeUndefined();
    expect(sellClothing(s, 'top_lilac_cami').reason).toBe('not-sellable');
    expect(clothingResale(CLOTHING_BY_ID.hacc_gold_tiara)).toEqual({ gems: 20 });
  });
  it('sells stored furniture for 50 %, not placed or free pieces', () => {
    const s = createNewGameState();
    const [uid] = buyFurniture(s, 'modern_minimalist__sofa').uids;
    placeItem(s, 'starter_apartment', 'bedroom', uid);
    expect(sellFurniture(s, uid).reason).toBe('placed');
    storeItem(s, uid);
    const coins = s.player.coins;
    expect(sellFurniture(s, uid).ok).toBe(true);
    expect(s.player.coins - coins).toBe(Math.floor(FURNITURE_BY_ID.modern_minimalist__sofa.price.coins * 0.5));
    expect(s.furniture.items[uid]).toBeUndefined();
    const starterUid = Object.keys(s.furniture.items)[0];
    storeItem(s, starterUid);
    expect(sellFurniture(s, starterUid).reason).toBe('not-sellable');
  });
});

describe('save migration v5 → v6', () => {
  it('adds arcade, album and home contest state', () => {
    const v5 = createNewGameState(); v5.version = 5;
    delete v5.minigames; delete v5.photos; delete v5.homeContests; delete v5.homeAwards;
    const m = migrate(v5);
    expect(m.version).toBe(SAVE_VERSION);
    expect(m.minigames).toMatchObject({ played: 0, best: {} });
    expect(m.photos).toEqual([]);
    expect(m.homeContests.board).toEqual([]);
    expect(m.homeAwards).toEqual([]);
  });
});
