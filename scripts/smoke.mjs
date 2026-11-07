/**
 * End-to-end smoke test: builds nothing itself — run `npm run build` first.
 * Starts `vite preview`, plays through Milestone 1 in Chromium at iPhone size,
 * verifies purchases & persistence across a reload, checks offline launch,
 * and writes screenshots to ./screenshots.
 *   node scripts/smoke.mjs
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const { chromium } = createRequire(import.meta.url)('playwright');
const PORT = 4179;
const URL = `http://localhost:${PORT}/`;
const OUT = new globalThis.URL('../screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe', detached: true });
const stopServer = () => { try { process.kill(-server.pid); } catch { /* already stopped */ } };
await new Promise((res, rej) => {
  server.stdout.on('data', (d) => { if (String(d).includes('Local')) res(); });
  server.on('exit', () => rej(new Error('preview server exited')));
  setTimeout(() => rej(new Error('preview timeout')), 15000);
});

const errors = [];
const results = [];
const check = (name, cond, extra = '') => { results.push([cond ? 'PASS' : 'FAIL', name, extra]); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: Number(process.env.DSF || 1), hasTouch: true, isMobile: true });
const page = await context.newPage();
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
const shot = (n) => page.screenshot({ path: `${OUT}${n}.png` });
const coins = async () => Number((await page.locator('.pill-coin b').textContent()).replace(/,/g, ''));

try {
  await page.goto(URL);
  await page.waitForSelector('.welcome-actions .btn');
  await sleep(900);
  await shot('01-welcome');
  check('welcome shows new-game button', await page.getByText('Begin Your Story').isVisible());

  await page.getByText('Begin Your Story').click();
  await page.waitForSelector('.creator');
  await sleep(500);
  await shot('02-creator');
  await page.locator('.creator-tabs .chip', { hasText: 'Hairstyle' }).click();
  await page.locator('.opt', { hasText: 'Chic Bob' }).click();
  await page.locator('.creator-tabs .chip', { hasText: 'Hair Colour' }).click();
  await page.locator('.opt', { hasText: 'Jet Black' }).click();
  await page.locator('.creator-tabs .chip', { hasText: 'Makeup' }).click();
  await sleep(300);
  await shot('03-creator-makeup');
  // locked option shows a toast and does not apply
  await page.locator('.opt.locked').first().click();
  check('locked makeup is refused in creator', await page.locator('.toast').first().isVisible());
  await page.locator('.creator-tabs .chip', { hasText: 'Outfit' }).click();
  await page.locator('.opt-outfit', { hasText: 'City Casual' }).click();
  await page.getByText('Start my story').click();
  check('name is required', await page.locator('.toast-error').first().isVisible());
  await page.fill('.creator-footer input', 'Aurora');
  await page.getByText('Start my story').click();

  await page.waitForSelector('.room');
  await sleep(1000);
  await shot('04-home-welcome-gift');
  check('starting coins 5000', (await coins()) === 5000);
  await page.getByText("Let's go shopping!").click();
  await page.waitForSelector('.mall-card');
  await sleep(500);
  await shot('05-mall');

  await page.locator('.mall-card', { hasText: 'Petal & Thread' }).click();
  await page.waitForSelector('.shop-banner');
  await sleep(500);
  const card = page.locator('.screen-shop .card', { hasText: 'Peony Silk Blouse' });
  await card.click();
  await sleep(300);
  await shot('06-shop-tryon');
  await page.locator('.buy-btn').click();
  await page.waitForSelector('.modal-card');
  await sleep(300);
  await shot('07-buy-confirm');
  await page.getByText('Buy it!').click();
  await sleep(800);
  check('coins deducted by 280', (await coins()) === 4720, String(await coins()));
  check('item marked owned', await page.locator('.detail-card .owned-tag').isVisible());
  await page.getByText('Wear it now').click();
  await sleep(300);
  // a second item from a different shop paid in gems
  await page.getByText('Leave').click();
  await page.waitForSelector('.mall-card');
  await page.locator('.mall-card', { hasText: 'Glimmer Jewellers' }).click();
  await page.waitForSelector('.shop-banner');
  await page.locator('.screen-shop .card', { hasText: 'Crown of the City' }).click();
  await page.locator('.buy-btn').click();
  await page.getByText('Buy it!').click();
  await sleep(600);
  check('gems deducted by 40', (await page.locator('.pill-gem b').textContent()) === '60');
  await page.getByText('Wear it now').click();
  await sleep(300);
  await shot('08-jewellery');

  // salon: buy a hairstyle and wear it
  await page.locator('.tab[data-tab="mall"]').click();
  await page.locator('.mall-card', { hasText: 'Silk & Curl' }).click();
  await page.waitForSelector('.shop-banner');
  await page.locator('.screen-shop .card', { hasText: 'Hollywood Curls' }).click();
  await page.locator('.buy-btn').click();
  await page.getByText('Buy it!').click();
  await sleep(500);
  await page.getByText('Wear it now').click();
  await sleep(300);
  await shot('09-salon');

  await page.locator('.tab[data-tab="wardrobe"]').click();
  await page.waitForSelector('.screen-wardrobe .grid .card');
  await sleep(400);
  const wardrobeCount = await page.locator('.screen-wardrobe .grid .card').count();
  check('wardrobe shows starter + bought items', wardrobeCount >= 10, String(wardrobeCount));
  await page.locator('.screen-wardrobe .card', { hasText: 'Strawberry Gingham' }).click();
  await sleep(300);
  await shot('10-wardrobe');
  await page.getByText('Save look').click();
  await page.fill('.modal-card input', 'Picnic Queen');
  await page.locator('.modal-actions .btn-primary').click();
  await sleep(500);
  check('outfit saved', (await page.locator('.side-panel').textContent()).includes('Looks (1)'));

  await page.locator('.tab[data-tab="city"]').click();
  await page.waitForSelector('.city-svg');
  await sleep(800);
  await shot('11-city');
  await page.locator('.loc[data-id="pageant"]').click({ force: true });
  await sleep(300);
  check('coming-soon building explains itself', (await page.locator('.toast').last().textContent()).includes('opens in'));
  await page.locator('.district-jump .chip', { hasText: 'Star Boulevard' }).click();
  await sleep(800);
  await shot('12-city-star-boulevard');

  await page.locator('.hud-left').click();
  await sleep(500);
  await shot('13-profile');

  // ---- persistence across reload ----
  await sleep(700); // allow debounced autosave
  await page.reload();
  await page.waitForSelector('.welcome-actions .btn');
  check('continue button after reload', await page.getByText('Continue as Aurora').isVisible());
  await page.getByText('Continue as Aurora').click();
  await page.waitForSelector('.room');
  check('coins persisted after reload', (await coins()) === 4720 - 750, String(await coins()));
  // Milestone 2: the daily gift pops up on returning home — dismiss it for this flow
  await page.waitForSelector('.modal-card', { timeout: 3000 }).then(() => page.locator('.modal-x').click()).catch(() => {});
  await sleep(300);
  await page.locator('.tab[data-tab="wardrobe"]').click();
  await page.waitForSelector('.screen-wardrobe .grid .card');
  check('purchased blouse persisted', await page.locator('.screen-wardrobe .card', { hasText: 'Peony Silk Blouse' }).isVisible());
  check('equipped dress persisted', (await page.locator('.screen-wardrobe .card', { hasText: 'Strawberry Gingham' }).getAttribute('aria-label')).includes('wearing'));
  check('saved look persisted', (await page.locator('.side-panel').textContent()).includes('Looks (1)'));

  // ---- offline launch via service worker ----
  await page.goto(URL);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await sleep(800);
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('.welcome-actions .btn', { timeout: 8000 });
  check('loads offline after first visit', await page.getByText('Continue as Aurora').isVisible());
  await context.setOffline(false);
} catch (e) {
  errors.push(`script: ${e.stack || e.message}`);
  await shot('zz-failure').catch(() => {});
} finally {
  await browser.close();
  stopServer();
}

for (const [s, n, x] of results) console.log(`${s}  ${n}${x ? `  (${x})` : ''}`);
if (errors.length) console.log('\nERRORS:\n' + errors.join('\n'));
const failed = results.filter((r) => r[0] === 'FAIL').length + errors.length;
console.log(`\n${results.length - results.filter((r) => r[0] === 'FAIL').length}/${results.length} checks passed, ${errors.length} errors`);
process.exit(failed ? 1 : 0);
