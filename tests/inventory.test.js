import { describe, it, expect } from 'vitest';
import { createNewGameState } from '../src/systems/gameState.js';
import { purchase, equip, unequip, toggleEquip, owns, saveOutfit, applyOutfit, deleteOutfit, setAppearance, toggleFavourite } from '../src/systems/inventory.js';
import { CLOTHING_BY_ID } from '../src/data/clothing.js';

describe('purchasing', () => {
  it('buys clothing, deducts the price and adds it to the wardrobe', () => {
    const s = createNewGameState();
    const item = CLOTHING_BY_ID.top_rose_tee;
    expect(purchase(s, 'clothing', item.id).ok).toBe(true);
    expect(s.player.coins).toBe(5000 - item.price.coins);
    expect(owns(s, 'clothing', item.id)).toBe(true);
    expect(s.stats.itemsBought).toBe(1);
  });
  it('prevents duplicate purchases of unique items', () => {
    const s = createNewGameState();
    purchase(s, 'clothing', 'top_rose_tee');
    const coins = s.player.coins;
    expect(purchase(s, 'clothing', 'top_rose_tee')).toMatchObject({ ok: false, reason: 'already-owned' });
    expect(s.player.coins).toBe(coins);
  });
  it('refuses when the player cannot afford it', () => {
    const s = createNewGameState();
    s.player.coins = 50;
    expect(purchase(s, 'clothing', 'gown_rose_ball')).toMatchObject({ ok: false, reason: 'insufficient-funds' });
    expect(owns(s, 'clothing', 'gown_rose_ball')).toBe(false);
  });
  it('buys gem-priced items with gems', () => {
    const s = createNewGameState();
    expect(purchase(s, 'clothing', 'hacc_gold_tiara').ok).toBe(true);
    expect(s.player.gems).toBe(60);
    expect(s.player.coins).toBe(5000);
  });
  it('buys hairstyles, dyes and makeup', () => {
    const s = createNewGameState();
    expect(owns(s, 'hairstyle', 'curls')).toBe(false);
    expect(purchase(s, 'hairstyle', 'curls').ok).toBe(true);
    expect(purchase(s, 'hairColor', 'lilac').ok).toBe(true);
    expect(purchase(s, 'makeup', 'lip_red').ok).toBe(true);
    expect(owns(s, 'hairstyle', 'curls') && owns(s, 'hairColor', 'lilac') && owns(s, 'makeup', 'lip_red')).toBe(true);
    expect(purchase(s, 'hairstyle', 'bob')).toMatchObject({ ok: false, reason: 'already-owned' }); // free starter
  });
  it('rejects unknown items', () => {
    const s = createNewGameState();
    expect(purchase(s, 'clothing', 'nope').ok).toBe(false);
  });
});

describe('equipping', () => {
  it('only equips owned items', () => {
    const s = createNewGameState();
    expect(equip(s, 'gown_rose_ball')).toMatchObject({ ok: false, reason: 'not-owned' });
  });
  it('dress replaces top & bottom and vice versa', () => {
    const s = createNewGameState({ outfitId: 'sunny' });
    expect(s.equipped.top).toBe('top_daisy_tee');
    equip(s, 'dr_gingham_sun');
    expect(s.equipped).toMatchObject({ dress: 'dr_gingham_sun', top: null, bottom: null });
    equip(s, 'bot_blue_jeans');
    expect(s.equipped.dress).toBe(null);
    expect(s.equipped.bottom).toBe('bot_blue_jeans');
  });
  it('toggle unequips an equipped item', () => {
    const s = createNewGameState({ outfitId: 'sunny' });
    toggleEquip(s, 'ear_silver_studs');
    expect(s.equipped.earrings).toBe(null);
    toggleEquip(s, 'ear_silver_studs');
    expect(s.equipped.earrings).toBe('ear_silver_studs');
    unequip(s, 'shoes');
    expect(s.equipped.shoes).toBe(null);
  });
  it('favourites owned items', () => {
    const s = createNewGameState();
    expect(toggleFavourite(s, 'top_daisy_tee').favourite).toBe(true);
    expect(toggleFavourite(s, 'gown_rose_ball').ok).toBe(false);
  });
});

describe('appearance', () => {
  it('free features change freely; paid hair must be owned', () => {
    const s = createNewGameState();
    expect(setAppearance(s, { skin: 'cocoa', eyes: 'cat' }).ok).toBe(true);
    expect(setAppearance(s, { hairStyle: 'updo' }).ok).toBe(false);
    purchase(s, 'hairstyle', 'updo');
    expect(setAppearance(s, { hairStyle: 'updo' }).ok).toBe(true);
    expect(setAppearance(s, { lipstick: 'es_gold' }).ok).toBe(false); // wrong makeup kind
  });
});

describe('outfits', () => {
  it('saves, applies and deletes outfits', () => {
    const s = createNewGameState({ outfitId: 'city' });
    const { outfit } = saveOutfit(s, 'Brunch');
    equip(s, 'dr_gingham_sun');
    applyOutfit(s, outfit.id);
    expect(s.equipped.top).toBe('top_lilac_cami');
    expect(s.equipped.dress).toBe(null);
    expect(deleteOutfit(s, outfit.id).ok).toBe(true);
    expect(s.outfits.length).toBe(0);
  });
});
