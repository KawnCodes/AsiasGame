import { describe, it, expect } from 'vitest';
import { createNewGameState, SAVE_VERSION } from '../src/systems/gameState.js';
import { PROPERTIES, PROPERTY_BY_ID, UPGRADES } from '../src/data/properties.js';
import { FURNITURE, FURNITURE_BY_ID, FURNITURE_KINDS, SURFACES, STARTER_LAYOUT, FURNITURE_SHOPS } from '../src/data/furniture.js';
import { HOME_STYLES } from '../src/data/homeStyles.js';
import { buyProperty, moveIn, buyUpgrade, perks, propertyLockReason } from '../src/systems/propertySystem.js';
import { buyFurniture, buySurface, ownsSurface, storedGroups, instancesOf, addFurniture } from '../src/systems/furnitureInventory.js';
import {
  ROOM, roomsOf, layoutOf, placeItem, moveItem, flipItem, storeItem, setSurface, clampPosition, drawOrder, findSpot, boxOf,
} from '../src/systems/decoratingSystem.js';
import { startJob, previewReward } from '../src/systems/careerSystem.js';
import { JOB_BY_ID } from '../src/data/careers.js';
import { saveOutfit, maxOutfits } from '../src/systems/inventory.js';
import { migrate } from '../src/systems/saveSystem.js';
import { listQuests } from '../src/systems/questSystem.js';

const rich = () => { const s = createNewGameState({ outfitId: 'city' }); s.player.coins = 1_000_000; s.player.level = 20; return s; };

/** Every placed uid appears in exactly one room and its `at` agrees. */
function assertConsistent(s) {
  const seen = new Set();
  for (const [pid, home] of Object.entries(s.homes)) {
    for (const [rid, room] of Object.entries(home.rooms)) {
      for (const uid of Object.keys(room.placed)) {
        expect(seen.has(uid), `${uid} placed twice`).toBe(false);
        seen.add(uid);
        expect(s.furniture.items[uid].at).toEqual({ property: pid, room: rid });
      }
    }
  }
  for (const [uid, v] of Object.entries(s.furniture.items)) if (!seen.has(uid)) expect(v.at).toBe(null);
}

describe('catalogue', () => {
  it('has the eight properties at the specified prices', () => {
    const prices = Object.fromEntries(PROPERTIES.map((p) => [p.name, p.price]));
    expect(prices).toEqual({ 'Starter Apartment': 0, 'Cosy Studio': 5000, 'Chic City Apartment': 15000, 'Luxury Loft': 35000, 'Modern Townhouse': 60000, 'Beach House': 100000, 'Luxury Penthouse': 175000, 'Celebrity Mansion': 300000 });
    for (const p of PROPERTIES) for (const u of p.upgrades) expect(UPGRADES.map((x) => x.id)).toContain(u);
  });
  it('has ten home styles, four furniture shops and unique furniture ids', () => {
    expect(HOME_STYLES).toHaveLength(10);
    expect(FURNITURE_SHOPS.map((s) => s.id).sort()).toEqual(['cosy_living', 'dream_decor', 'glam_interiors', 'luxe_maison']);
    expect(new Set(FURNITURE.map((f) => f.id)).size).toBe(FURNITURE.length);
    expect(FURNITURE.length).toBeGreaterThan(120);
    for (const f of FURNITURE) {
      expect(FURNITURE_KINDS[f.kind], f.id).toBeTruthy();
      expect(['floor', 'wall', 'rug']).toContain(f.placement);
      if (f.shop) expect(f.price.coins, f.id).toBeGreaterThan(0);
    }
  });
  it('every collection offers matching wallpapers or floors', () => {
    for (const st of HOME_STYLES) expect(SURFACES.some((s) => s.styles?.includes(st.id)), st.id).toBe(true);
  });
});

describe('starter home', () => {
  it('new players start with a furnished starter apartment', () => {
    const s = createNewGameState();
    expect(s.properties).toMatchObject({ owned: ['starter_apartment'], current: 'starter_apartment' });
    const layout = layoutOf(s, 'starter_apartment', 'bedroom');
    expect(Object.keys(layout.placed)).toHaveLength(STARTER_LAYOUT.length);
    expect(layout.wallpaper).toBe('wp_pink_stripe');
    assertConsistent(s);
    const funcs = drawOrder(s, layout).map((e) => e.item.func).filter(Boolean);
    for (const f of ['bed', 'wardrobe', 'vanity', 'mirror', 'trophies']) expect(funcs).toContain(f);
  });
});

describe('buying property', () => {
  it('deducts the price, adds the home with rooms, and gifts a plant', () => {
    const s = createNewGameState();
    s.player.level = 2;
    const stored = storedGroups(s).length;
    expect(buyProperty(s, 'cosy_studio').ok).toBe(true);
    expect(s.player.coins).toBe(0);
    expect(s.properties.owned).toContain('cosy_studio');
    expect(Object.keys(s.homes.cosy_studio.rooms)).toEqual(['studio', 'bathroom']);
    expect(storedGroups(s).length).toBe(stored + 1);
  });
  it('enforces level, funds and no duplicates', () => {
    const s = createNewGameState();
    expect(propertyLockReason(s, 'mansion')).toMatch(/level 15/);
    expect(buyProperty(s, 'mansion').reason).toBe('locked');
    s.player.level = 5;
    expect(buyProperty(s, 'luxury_loft').reason).toBe('insufficient-funds');
    s.player.coins = 50000;
    expect(buyProperty(s, 'luxury_loft').ok).toBe(true);
    expect(buyProperty(s, 'luxury_loft').reason).toBe('already-owned');
    expect(buyProperty(s, 'starter_apartment').reason).toBe('already-owned');
  });
  it('lets you own several homes and choose which to live in', () => {
    const s = rich();
    buyProperty(s, 'beach_house');
    buyProperty(s, 'penthouse');
    expect(moveIn(s, 'penthouse').ok).toBe(true);
    expect(s.properties.current).toBe('penthouse');
    expect(moveIn(s, 'mansion').ok).toBe(false);
    expect(s.properties.owned).toEqual(['starter_apartment', 'beach_house', 'penthouse']);
  });
});

describe('upgrades', () => {
  it('apply instantly, add rooms and cannot be bought twice', () => {
    const s = rich();
    buyProperty(s, 'chic_apartment');
    const before = roomsOf(s, 'chic_apartment').length;
    const r = buyUpgrade(s, 'chic_apartment', 'home_studio');
    expect(r.ok).toBe(true);
    expect(roomsOf(s, 'chic_apartment')).toHaveLength(before + 1);
    expect(layoutOf(s, 'chic_apartment', 'up_home_studio')).toBeTruthy();
    expect(buyUpgrade(s, 'chic_apartment', 'home_studio').reason).toBe('already-owned');
    expect(buyUpgrade(s, 'chic_apartment', 'swimming_pool').reason).toBe('not-available');
    expect(buyUpgrade(s, 'mansion', 'home_studio').reason).toBe('not-owned');
  });
  it('studio upgrades boost career coins; vanity boosts contests; wardrobe adds look slots', () => {
    const s = rich();
    const job = JOB_BY_ID.sing_practice;
    s.equipped = { top: null, bottom: null, dress: null, outerwear: null, shoes: null, bag: null, earrings: null, necklace: null, bracelet: null, hairAcc: null };
    const base = previewReward(s, job).coins;
    buyProperty(s, 'chic_apartment');
    buyUpgrade(s, 'chic_apartment', 'home_studio');
    expect(previewReward(s, job).coins).toBe(Math.round(base * 1.1));
    expect(previewReward(s, JOB_BY_ID.mod_catalogue).homeBonus).toBe(false);
    buyUpgrade(s, 'starter_apartment', 'luxury_vanity');
    buyUpgrade(s, 'chic_apartment', 'luxury_vanity');
    expect(perks(s).contestCoins).toBeCloseTo(0.1); // counted once
    expect(instancesOf(s, 'royal_vanity_gift')).toHaveLength(2);
    const slots = maxOutfits(s);
    buyUpgrade(s, 'starter_apartment', 'big_wardrobe');
    expect(maxOutfits(s)).toBe(slots + 12);
    for (let i = 0; i < slots + 5; i++) expect(saveOutfit(s, `L${i}`).ok).toBe(true);
  });
});

describe('furniture inventory', () => {
  it('buys multiple copies into storage', () => {
    const s = createNewGameState();
    const id = 'modern_minimalist__chair';
    const r = buyFurniture(s, id, 4);
    expect(r.ok).toBe(true);
    expect(r.uids).toHaveLength(4);
    expect(s.player.coins).toBe(5000 - 4 * FURNITURE_BY_ID[id].price.coins);
    expect(instancesOf(s, id).every((i) => i.at === null)).toBe(true);
  });
  it('refuses unaffordable, starter-only and unknown pieces', () => {
    const s = createNewGameState();
    expect(buyFurniture(s, 'hollywood_luxury__piano').reason).toBe('insufficient-funds');
    expect(buyFurniture(s, 'starter_bed').reason).toBe('not-for-sale');
    expect(buyFurniture(s, 'nope').reason).toBe('not-for-sale');
  });
  it('surfaces are bought once; free basics are always owned', () => {
    const s = createNewGameState();
    expect(ownsSurface(s, 'fl_oak')).toBe(true);
    expect(ownsSurface(s, 'wp_damask_rose')).toBe(false);
    expect(buySurface(s, 'wp_damask_rose').ok).toBe(true);
    expect(buySurface(s, 'wp_damask_rose').reason).toBe('already-owned');
    expect(buySurface(s, 'fl_oak').reason).toBe('already-owned');
  });
});

describe('decorating', () => {
  it('places, moves, flips and stores furniture without ever losing it', () => {
    const s = rich();
    const [uid] = buyFurniture(s, 'pink_princess__sofa').uids;
    const r = placeItem(s, 'starter_apartment', 'bedroom', uid);
    expect(r.ok).toBe(true);
    assertConsistent(s);
    expect(moveItem(s, uid, 120, 350)).toMatchObject({ ok: true, x: 120, y: 350 });
    expect(flipItem(s, uid).flip).toBe(true);
    expect(storeItem(s, uid).ok).toBe(true);
    expect(s.furniture.items[uid].at).toBe(null);
    expect(storedGroups(s).some((g) => g.uids.includes(uid))).toBe(true);
    assertConsistent(s);
  });
  it('keeps pieces in their zone: floor items on the floor, wall items on the wall', () => {
    const sofa = FURNITURE_BY_ID.pink_princess__sofa;
    const art = FURNITURE_BY_ID.decor_gallery;
    const rug = FURNITURE_BY_ID.starter_rug;
    const up = clampPosition(sofa, 195, 40);
    expect(up.y).toBeGreaterThanOrEqual(ROOM.FLOOR_TOP);
    const down = clampPosition(art, 195, 400);
    expect(down.y + art.h / 2).toBeLessThanOrEqual(ROOM.WALL_BOTTOM);
    const off = clampPosition(sofa, -500, 999);
    const box = boxOf(sofa, off.x, off.y);
    expect(box.x0).toBeGreaterThanOrEqual(0);
    expect(box.y1).toBeLessThanOrEqual(ROOM.FLOOR_BOTTOM);
    expect(clampPosition(rug, 9999, 100).y).toBeGreaterThan(ROOM.FLOOR_TOP);
  });
  it('moves furniture between rooms and between homes', () => {
    const s = rich();
    buyProperty(s, 'chic_apartment');
    const bedUid = Object.keys(layoutOf(s, 'starter_apartment', 'bedroom').placed)[0];
    expect(placeItem(s, 'chic_apartment', 'living', bedUid).ok).toBe(true);
    expect(layoutOf(s, 'starter_apartment', 'bedroom').placed[bedUid]).toBeUndefined();
    expect(layoutOf(s, 'chic_apartment', 'living').placed[bedUid]).toBeTruthy();
    expect(placeItem(s, 'chic_apartment', 'kitchen', bedUid).ok).toBe(true);
    assertConsistent(s);
    expect(placeItem(s, 'mansion', 'living', bedUid).reason).toBe('not-owned');
  });
  it('finds a free spot for new pieces instead of stacking them', () => {
    const s = rich();
    buyProperty(s, 'cosy_studio');
    const uids = buyFurniture(s, 'modern_minimalist__armchair', 3).uids;
    for (const u of uids) placeItem(s, 'cosy_studio', 'studio', u);
    const xs = uids.map((u) => layoutOf(s, 'cosy_studio', 'studio').placed[u].x);
    expect(new Set(xs).size).toBe(3);
    const it = FURNITURE_BY_ID.modern_minimalist__armchair;
    expect(findSpot(s, 'cosy_studio', 'studio', it)).toBeTruthy();
  });
  it('draws rugs first, then wall items, then floor items back to front', () => {
    const s = createNewGameState();
    const order = drawOrder(s, layoutOf(s, 'starter_apartment', 'bedroom'));
    const zones = order.map((e) => e.item.placement);
    expect(zones.indexOf('rug')).toBe(0);
    expect(zones.lastIndexOf('wall')).toBeLessThan(zones.indexOf('floor'));
    const floorYs = order.filter((e) => e.item.placement === 'floor').map((e) => e.y);
    expect(floorYs).toEqual([...floorYs].sort((a, b) => a - b));
  });
  it('applies owned wallpapers and floors; outdoor rooms have no wallpaper', () => {
    const s = rich();
    expect(setSurface(s, 'starter_apartment', 'bedroom', 'wp_damask_gold').reason).toBe('not-owned');
    buySurface(s, 'wp_damask_gold');
    expect(setSurface(s, 'starter_apartment', 'bedroom', 'wp_damask_gold').ok).toBe(true);
    expect(setSurface(s, 'starter_apartment', 'bedroom', 'fl_marble').ok).toBe(true);
    expect(layoutOf(s, 'starter_apartment', 'bedroom')).toMatchObject({ wallpaper: 'wp_damask_gold', floor: 'fl_marble' });
    buyProperty(s, 'beach_house');
    expect(setSurface(s, 'beach_house', 'balcony', 'wp_damask_gold').reason).toBe('outdoor');
    expect(setSurface(s, 'beach_house', 'balcony', 'fl_grass').ok).toBe(true);
  });
  it('limits pieces per room', () => {
    const s = rich();
    const uids = addFurniture(s, 'decor_succulent', 60);
    let refused = 0;
    for (const u of uids) if (!placeItem(s, 'starter_apartment', 'bedroom', u).ok) refused++;
    expect(refused).toBeGreaterThan(0);
    expect(Object.keys(layoutOf(s, 'starter_apartment', 'bedroom').placed).length).toBe(40);
  });
});

describe('quests & saves', () => {
  it('home quests track purchases, decorating and properties', () => {
    const s = rich();
    const uids = buyFurniture(s, 'decor_tulips', 5).uids;
    for (const u of uids.slice(0, 3)) placeItem(s, 'starter_apartment', 'bedroom', u);
    const story = Object.fromEntries(listQuests(s, 'story').map((q) => [q.def.id, q]));
    expect(story.s_furniture5.done).toBe(true);
    expect(story.s_bedroom.done).toBe(true); // 9 starter + 3
    expect(story.s_property.done).toBe(false);
    buyProperty(s, 'cosy_studio');
    expect(listQuests(s, 'story').find((q) => q.def.id === 's_property').done).toBe(true);
  });
  it('migrates Milestone 3 saves by furnishing the starter apartment', () => {
    const v3 = createNewGameState({ name: 'Old' });
    v3.version = 3;
    delete v3.furniture; delete v3.homes; delete v3.properties.upgrades; delete v3.inventory.surfaces;
    const m = migrate(v3);
    expect(m.version).toBe(SAVE_VERSION);
    expect(Object.keys(m.homes.starter_apartment.rooms.bedroom.placed)).toHaveLength(STARTER_LAYOUT.length);
    expect(m.properties.upgrades).toEqual({});
    assertConsistent(m);
  });
  it('round-trips layouts and repairs inconsistent saves', () => {
    const s = rich();
    buyProperty(s, 'cosy_studio');
    const [uid] = buyFurniture(s, 'pastel_dream__sofa').uids;
    placeItem(s, 'cosy_studio', 'studio', uid, 150, 360);
    const m = migrate(JSON.parse(JSON.stringify(s)));
    expect(m.homes.cosy_studio.rooms.studio.placed[uid]).toMatchObject({ x: 150, y: 360 });
    assertConsistent(m);
    const broken = JSON.parse(JSON.stringify(s));
    broken.furniture.items[uid].at = { property: 'starter_apartment', room: 'bedroom' }; // claims a room it isn't in
    broken.homes.cosy_studio.rooms.studio.placed.f99999 = { x: 1, y: 1 }; // ghost entry
    broken.homes.starter_apartment.rooms.bedroom.placed[uid] = { x: 50, y: 320 }; // listed in two rooms
    const fixed = migrate(broken);
    expect(fixed.homes.cosy_studio.rooms.studio.placed.f99999).toBeUndefined();
    assertConsistent(fixed);
    expect(fixed.furniture.nextId).toBeGreaterThan(Number(uid.slice(1)));
  });
});
