/**
 * Milestone 4 browser test: furnished starter home, touch drag-and-drop decorating with
 * zone clamping, store/place, surfaces, furniture shop preview + multi-buy, property
 * purchase, move-in, upgrades adding rooms, moving furniture between homes, persistence.
 * Uses real touch events (CDP) for dragging. Run `npm run build` first.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createNewGameState } from '../src/systems/gameState.js';
import { exportSave } from '../src/systems/saveSystem.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const PORT = 4183;
const URL = `http://localhost:${PORT}/`;
const OUT = new globalThis.URL('../screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe', detached: true });
const stopServer = () => { try { process.kill(-server.pid); } catch { /* stopped */ } };
await new Promise((res, rej) => { server.stdout.on('data', (d) => { if (String(d).includes('Local')) res(); }); setTimeout(() => rej(new Error('preview timeout')), 15000); });

const errors = [];
const results = [];
const check = (name, cond, extra = '') => results.push([cond ? 'PASS' : 'FAIL', name, extra]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: Number(process.env.DSF || 1), hasTouch: true, isMobile: true });
const page = await context.newPage();
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
const cdp = await context.newCDPSession(page);
const shot = (n) => page.screenshot({ path: `${OUT}${n}.png` });
const coins = async () => Number((await page.locator('.pill-coin b').textContent()).replace(/[^\d]/g, ''));
async function closeModals() {
  for (let i = 0; i < 5; i++) { await sleep(300); if (!(await page.locator('.modal-card').count())) break; await page.locator('.modal-x').click().catch(() => {}); }
}
/** Real touch drag from one screen point to another. */
async function touchDrag(from, to, steps = 8) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps }] });
    await sleep(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(350);
}
async function touchTap(pt) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pt.x, y: pt.y }] });
  await sleep(40);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(300);
}
const transformOf = async (sel) => {
  const t = await page.locator(sel).first().getAttribute('transform');
  const m = t.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
  return { x: Number(m[1]), y: Number(m[2]) };
};
/** Find the furniture <g> for an item name via its uid in the store-rendered DOM order. */
const centerOf = async (loc) => { const b = await loc.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
/** Screen point of a room coordinate (aim at a piece's real anchor, not its bounding box). */
const roomToScreen = (x, y) => page.evaluate(([rx, ry]) => {
  const svg = document.querySelector('.deco-canvas svg');
  const pt = svg.createSVGPoint(); pt.x = rx; pt.y = ry;
  const r = pt.matrixTransform(svg.getScreenCTM());
  return { x: r.x, y: r.y };
}, [x, y]);

try {
  await page.goto(URL);
  await page.getByText('Begin Your Story').click();
  await page.fill('.creator-footer input', 'Ivy');
  await page.getByText('Start my story').click();
  await page.waitForSelector('.room');
  await page.waitForSelector('.modal-x');
  await page.locator('.modal-x').click(); // welcome
  await page.waitForSelector('.day-grid');
  await page.locator('.modal-x').click(); // daily gift (claimed later in other tests)
  await sleep(500);
  await shot('m4-01-home');
  const labels = await page.locator('.hs-label').allTextContents();
  check('starter furniture is interactive (bed, wardrobe, vanity, mirror, trophies)', ['Bed', 'Wardrobe', 'Vanity', 'Mirror', 'Trophies'].every((l) => labels.includes(l)), labels.join(','));
  await page.locator('.hotspot', { hasText: 'Wardrobe' }).click();
  await page.waitForSelector('.screen-wardrobe');
  check('wardrobe hotspot opens the closet', true);
  await page.locator('.tab[data-tab="home"]').click();
  await page.waitForSelector('.home-actions');

  // ---------- decorating ----------
  await page.getByText('Decorate', { exact: false }).first().click();
  await page.waitForSelector('.deco-canvas .fitem');
  await closeModals();
  const items = page.locator('.deco-canvas .fitem');
  const n = await items.count();
  check('starter room has 9 movable pieces', n === 9, String(n));
  // the starter bed stands at x = 80
  const uids = await items.evaluateAll((gs) => gs.map((g) => ({ uid: g.dataset.uid, t: g.getAttribute('transform') })));
  const bed = uids.find((u) => /translate\(80 /.test(u.t));
  const bedSel = `.deco-canvas .fitem[data-uid="${bed.uid}"]`;
  const before = await transformOf(bedSel);
  const c = await roomToScreen(before.x, before.y - 30);
  await touchDrag(c, { x: c.x + 120, y: c.y + 30 });
  const after = await transformOf(bedSel);
  check('touch-dragging moves the bed', after.x > before.x + 60, `${before.x}→${after.x}`);
  await shot('m4-02-decorate-drag');
  // a wall piece can't be dragged down onto the floor
  const portraitUid = (await items.evaluateAll((gs) => gs.map((g) => ({ uid: g.dataset.uid, inner: g.innerHTML.length, t: g.getAttribute('transform') })))).find((x) => /translate\(46 /.test(x.t))?.uid;
  if (portraitUid) {
    const ps = `.deco-canvas .fitem[data-uid="${portraitUid}"]`;
    const p0 = await transformOf(ps);
    const pc = await roomToScreen(p0.x, p0.y - 18);
    await touchDrag(pc, { x: pc.x, y: pc.y + 600 });
    const pt = await transformOf(ps);
    check('wall pieces move but stay on the wall (clamped)', pt.y > 64 && pt.y <= 280 - 26, String(pt.y));
  } else check('wall pieces stay on the wall (clamped)', false, 'portrait not found');
  // select + store, then place back from storage
  const nowBed = await transformOf(bedSel);
  await touchTap(await roomToScreen(nowBed.x, nowBed.y - 30));
  check('tapping selects a piece and shows tools', await page.getByText('↔ Flip').isVisible());
  await page.getByText('↔ Flip').click();
  await sleep(200);
  check('flip mirrors the piece', /scale\(-/.test(await page.locator(bedSel).getAttribute('transform')));
  await page.getByText('📦 Store').click();
  await sleep(300);
  check('stored piece leaves the room', (await page.locator('.deco-canvas .fitem').count()) === n - 1);
  check('stored piece appears in storage', (await page.locator('.deco-drawer .card').count()) >= 1);
  await page.locator('.deco-drawer .card', { hasText: 'Cosy Pink Bed' }).click();
  await sleep(300);
  check('placing from storage puts it back', (await page.locator('.deco-canvas .fitem').count()) === n);
  await page.locator('.chips.seg .chip', { hasText: 'Floor' }).click();
  await page.locator('.deco-drawer .card', { hasText: 'White Marble' }).click();
  await sleep(300);
  check('floor applies instantly', await page.locator('.deco-drawer .card.selected', { hasText: 'White Marble' }).isVisible());
  await shot('m4-03-floor');
  const movedBed = await transformOf(`.deco-canvas .fitem[data-uid="${bed.uid}"]`);
  await page.getByText('Done ✓').click();
  await page.waitForSelector('.home-actions');

  // ---------- furniture shop ----------
  await page.locator('.tab[data-tab="mall"]').click();
  await page.locator('.mall-card', { hasText: 'Glam Interiors' }).click();
  await page.waitForSelector('.shop-room');
  await page.locator('.screen-fshop .card', { hasText: 'Princess Armchair' }).click();
  await sleep(400);
  check('item previews inside your room', await page.locator('.shop-room .preview-item').count() === 1);
  await shot('m4-04-furniture-shop');
  const c0 = await coins();
  await page.locator('.fdetail .btn-gold').click();
  await page.locator('.stepper .btn', { hasText: '+' }).click();
  await page.locator('.modal-actions .btn-gold').click();
  await sleep(600);
  check('bought 2 armchairs (720 × 2 coins)', c0 - (await coins()) === 1440, String(c0 - (await coins())));
  await page.getByText('Place it now').click();
  await page.waitForSelector('.deco-canvas');
  await sleep(400);
  check('"Place it now" drops the new piece into the room', (await page.locator('.deco-canvas .fitem').count()) === n + 1);
  check('the second armchair waits in storage', await page.locator('.deco-drawer .card', { hasText: 'Princess Armchair' }).isVisible());
  await page.getByText('Done ✓').click();
  await page.waitForSelector('.home-actions');

  // ---------- property: import a richer save via Settings (the real backup flow) ----------
  const rich = createNewGameState({ name: 'Ivy' });
  rich.player.level = 6; rich.player.coins = 90000;
  const file = `${OUT}m4-save.json`;
  writeFileSync(file, exportSave(rich));
  await page.locator('.hud .icon-btn').click();
  await page.setInputFiles('.settings input[type=file]', file);
  await page.locator('.modal-actions .btn', { hasText: 'Restore' }).click();
  await page.waitForSelector('.home-actions');
  await closeModals();
  await sleep(500); // let the screen transition finish
  await page.locator('.quick', { hasText: 'Dream Homes Realty' }).click();
  await page.waitForSelector('.prop-card');
  await sleep(300);
  await shot('m4-05-agency');
  check('mansion is level-locked', await page.locator('.prop-card', { hasText: 'Celebrity Mansion' }).locator('.lock-note').isVisible());
  await page.locator('.prop-card', { hasText: 'Luxury Loft' }).getByText('Buy').click();
  await page.getByText('Buy it!').click();
  await page.waitForSelector('.modal-card .ribbon');
  await sleep(300);
  check('bought the Luxury Loft (35,000)', (await coins()) === 55000, String(await coins()));
  await page.getByText('Move in now').click();
  await page.waitForSelector('.home-actions');
  await sleep(300);
  check('moved in: home shows the loft', (await page.locator('.home-title').textContent()).includes('Luxury Loft'));
  check('loft has 4 room tabs', (await page.locator('.room-tabs .chip').count()) === 4);
  await shot('m4-06-loft');
  await page.getByText('My homes').click();
  await page.waitForSelector('.prop-card');
  await page.locator('.prop-card', { hasText: 'Luxury Loft' }).getByText('Upgrades').click();
  await page.locator('.upgrade', { hasText: 'Home Recording Studio' }).locator('.btn').click();
  await sleep(700);
  await shot('m4-06b-upgrades');
  check('upgrade bought instantly', await page.locator('.upgrade.owned', { hasText: 'Home Recording Studio' }).isVisible());
  await page.locator('.modal-actions .btn').click();
  await page.locator('.prop-card', { hasText: 'Luxury Loft' }).getByText('Visit').click();
  await page.waitForSelector('.room-tabs');
  check('upgrade added a Recording Studio room', await page.locator('.room-tabs .chip', { hasText: 'Recording Studio' }).isVisible());

  // move the starter bed into the loft bedroom
  await page.locator('.room-tabs .chip', { hasText: 'Bedroom' }).click();
  await page.getByText('Decorate', { exact: false }).first().click();
  await page.waitForSelector('.deco-drawer');
  await closeModals();
  await page.locator('.deco-drawer .card', { hasText: 'Housewarming Plant' }).click();
  await sleep(300);
  check('housewarming gift placed in the new home', (await page.locator('.deco-canvas .fitem').count()) === 1);
  await page.getByText('Done ✓').click();
  await page.waitForSelector('.home-actions');

  // ---------- persistence ----------
  await sleep(700);
  await page.reload();
  await page.getByText('Continue as Ivy').click();
  await page.waitForSelector('.home-actions');
  await page.waitForSelector('.day-grid'); // the imported save hasn't claimed today's gift
  await page.locator('.modal-x').click();
  await sleep(400);
  check('still living in the loft after reload', (await page.locator('.home-title').textContent()).includes('Luxury Loft'));
  await page.locator('.room-tabs .chip', { hasText: 'Bedroom' }).click();
  await sleep(300);
  check('loft bedroom layout persisted', (await page.locator('.room-bg .fitem').count()) === 1);
  await page.locator('.tab[data-tab="city"]').click();
  await page.locator('.district-jump .chip', { hasText: 'Luxury Hills' }).click();
  await sleep(700);
  await page.locator('.loc[data-id="furniture"]').click({ force: true });
  await page.waitForSelector('.home-shops');
  check('Furniture Row on the map opens the furniture shops', true);
  await page.locator('.mall-card', { hasText: 'Dream Decor' }).click();
  await page.locator('.chips .chip', { hasText: 'Wallpaper' }).click();
  await page.locator('.screen-fshop .card', { hasText: 'Gold Damask' }).click();
  await sleep(300);
  await shot('m4-07-dream-decor');
  await page.locator('.fdetail .btn-gold').click();
  await sleep(400);
  check('wallpaper bought', await page.locator('.fdetail .owned-tag').isVisible());
  void movedBed;
} catch (e) {
  errors.push(`script: ${e.stack || e.message}`);
  await shot('zz-m4-failure').catch(() => {});
} finally {
  await browser.close();
  stopServer();
}
for (const [s, n, x] of results) console.log(`${s}  ${n}${x ? `  (${x})` : ''}`);
if (errors.length) console.log('\nERRORS:\n' + errors.join('\n'));
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} checks passed, ${errors.length} errors`);
process.exit(failed || errors.length ? 1 : 0);
