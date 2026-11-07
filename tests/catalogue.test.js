import { describe, it, expect } from 'vitest';
import { CLOTHING, CLOTHING_BY_ID, STARTER_CLOTHING, CATEGORIES } from '../src/data/clothing.js';
import { HAIRSTYLES, MAKEUP, HAIR_COLORS } from '../src/data/appearance.js';
import { SHOPS } from '../src/data/shops.js';
import { LOCATIONS } from '../src/data/locations.js';
import { BALANCE } from '../src/data/gameBalance.js';
import { renderAvatar, renderItemThumb } from '../src/components/avatarRenderer.js';
import { STARTER_OUTFITS } from '../src/systems/gameState.js';

const band = (item) => {
  const b = BALANCE.priceBands;
  if (item.category === 'tops') return b.top;
  if (['skirts', 'trousers', 'shorts'].includes(item.category)) return b.bottom;
  if (item.category === 'dresses') return item.rarity === 'common' ? b.dress : b.premiumDress;
  if (item.category === 'special') return b.premiumDress;
  if (item.category === 'shoes') return b.shoes;
  if (['jackets', 'coats'].includes(item.category)) return b.outerwear;
  return b.accessory;
};

describe('clothing catalogue', () => {
  it('has unique ids and valid categories', () => {
    expect(new Set(CLOTHING.map((c) => c.id)).size).toBe(CLOTHING.length);
    const cats = new Set(CATEGORIES.map((c) => c.id));
    for (const c of CLOTHING) expect(cats.has(c.category), c.id).toBe(true);
    expect(CLOTHING.length).toBeGreaterThanOrEqual(100);
  });
  it('keeps coin prices inside the balance bands (rare items may exceed by the markup)', () => {
    for (const c of CLOTHING) {
      if (c.starter || c.price.gems) continue;
      const [lo, hi] = band(c);
      const max = c.rarity === 'common' ? hi : hi * BALANCE.rareMarkup;
      expect(c.price.coins, c.id).toBeGreaterThanOrEqual(lo);
      expect(c.price.coins, c.id).toBeLessThanOrEqual(max);
    }
  });
  it('starter items are free and every starter outfit uses owned items', () => {
    for (const id of STARTER_CLOTHING) expect(CLOTHING_BY_ID[id].price.coins).toBe(0);
    for (const o of STARTER_OUTFITS) for (const id of Object.values(o.equipped)) expect(STARTER_CLOTHING).toContain(id);
  });
  it('every item is sold in a shop that exists', () => {
    const shopIds = new Set(SHOPS.map((s) => s.id));
    for (const c of CLOTHING.filter((x) => !x.starter)) expect(shopIds.has(c.shop), c.id).toBe(true);
  });
  it('hairstyle and makeup prices sit in their bands', () => {
    for (const h of HAIRSTYLES.filter((x) => !x.free)) {
      expect(h.price.coins).toBeGreaterThanOrEqual(BALANCE.priceBands.hairstyle[0]);
      expect(h.price.coins).toBeLessThanOrEqual(BALANCE.priceBands.hairstyle[1]);
    }
    for (const m of MAKEUP.filter((x) => !x.free)) expect(m.price.coins).toBeLessThanOrEqual(BALANCE.priceBands.makeup[1]);
    for (const h of HAIR_COLORS.filter((x) => !x.free)) expect(h.price.coins).toBeLessThanOrEqual(BALANCE.priceBands.hairColor[1]);
  });
  it('a few jobs buy several items (affordability check)', () => {
    const fiveJobs = 5 * BALANCE.jobs.standardReward.coins;
    const cheap = CLOTHING.filter((c) => !c.starter && c.price.coins && c.price.coins <= 300);
    expect(cheap.length).toBeGreaterThan(30);
    expect(fiveJobs / 250).toBeGreaterThanOrEqual(10);
  });
});

describe('locations', () => {
  it('every open location points at a real screen or shop', () => {
    const shopIds = new Set(SHOPS.map((s) => s.id));
    for (const l of LOCATIONS) {
      if (l.status !== 'open') continue;
      if (l.action.type === 'shop') expect(shopIds.has(l.action.shop), l.id).toBe(true);
    }
  });
});

describe('avatar renderer', () => {
  it('renders every clothing item without throwing', () => {
    for (const c of CLOTHING) {
      const svg = renderAvatar({}, { [c.slot]: c.id });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(renderItemThumb(c)).toContain('<svg');
    }
  });
  it('renders every hairstyle', () => {
    for (const h of HAIRSTYLES) expect(renderAvatar({ hairStyle: h.id }, {})).toContain('hair-front');
  });
  it('hides top & bottom when a dress is worn', () => {
    const svg = renderAvatar({}, { dress: 'dr_gingham_sun', top: 'top_daisy_tee', bottom: 'bot_denim_mini' });
    expect(svg).toContain('g-dress');
    expect(svg).not.toContain('g-top');
    expect(svg).not.toContain('g-bottom');
  });
});
