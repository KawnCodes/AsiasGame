/**
 * Milestone 3 browser test: Grand Pavilion lobby, dressing room, runway show, judges,
 * results & prizes, trophies, guest judging and persistence. Run `npm run build` first.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const { chromium } = createRequire(import.meta.url)('playwright');
const PORT = 4182;
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
const shot = (n) => page.screenshot({ path: `${OUT}${n}.png` });
const coins = async () => Number((await page.locator('.pill-coin b').textContent()).replace(/[^\d]/g, ''));
async function closeModals() {
  for (let i = 0; i < 6; i++) {
    await sleep(300);
    if (!(await page.locator('.modal-card').count())) break;
    await page.locator('.modal-actions .btn').last().click().catch(() => page.locator('.modal-x').click());
  }
}

try {
  await page.goto(URL);
  await page.getByText('Begin Your Story').click();
  await page.fill('.creator-footer input', 'Stella');
  await page.getByText('Start my story').click();
  await page.waitForSelector('.room');
  await page.locator('.modal-x').click();
  await page.waitForSelector('.day-grid');
  await page.locator('.modal-x').click(); // skip the daily gift for this run
  await sleep(400);

  // lobby via the home shortcut
  await page.locator('.quick', { hasText: 'Fashion contests' }).click();
  await page.waitForSelector('.contest-card');
  await sleep(500);
  await shot('m3-01-lobby');
  check('board shows 4 contests', (await page.locator('.contest-card').count()) === 4);
  check('theme of the day is highlighted', (await page.locator('.contest-card.spot').count()) === 1);

  // dressing room
  await page.locator('.contest-card').nth(1).click();
  await page.waitForSelector('.theme-card');
  await sleep(400);
  await shot('m3-02-dressing-room');
  check('judges checklist shown', (await page.locator('.cl').count()) === 6);
  // undress and try to enter → refused
  const worn = page.locator('.screen-contest .card .badge');
  await page.locator('.chips .chip', { hasText: 'All' }).click();
  await sleep(200);
  while (await worn.count()) { await worn.first().locator('xpath=..').click(); await sleep(150); }
  await page.locator('.walk-btn').click();
  check('cannot walk without an outfit', (await page.locator('#toasts').textContent()).includes('before walking the runway'));
  await page.locator('.screen-contest .card', { hasText: 'Strawberry Gingham' }).click();
  await page.locator('.screen-contest .card', { hasText: 'Blush Ballet Flats' }).click();
  await page.locator('.screen-contest .card', { hasText: 'Silver Star Studs' }).click();
  await page.locator('.chips .chip', { hasText: 'Hair & makeup' }).click();
  await sleep(300);
  await page.locator('.bopt', { hasText: 'Petal Pink' }).click();
  await sleep(200);
  await shot('m3-03-beauty');
  check('checklist marks the full look', await page.locator('.cl.ok', { hasText: 'Full look' }).isVisible());

  // runway
  const before = await coins();
  await page.locator('.walk-btn').click();
  await page.waitForSelector('.runway');
  await sleep(1300);
  await shot('m3-04-runway');
  check('runway show plays', (await page.locator('.walker-name').textContent()).length > 0);
  await page.locator('.skip-btn').click();
  await page.waitForSelector('.jcard');
  await sleep(1500);
  await shot('m3-05-judges');
  check('three judges score you', (await page.locator('.jcard').count()) === 3);
  check('eight-category breakdown', (await page.locator('.cat-bar').count()) === 8);
  await page.getByText('See the results').click();
  await page.waitForSelector('.podium');
  await sleep(900);
  await shot('m3-06-results');
  await closeModals();
  const gained = (await coins()) - before;
  check('prize of at least 200 coins paid', gained >= 200, String(gained));
  check('ranking lists you and 4 rivals', (await page.locator('.rank').count()) === 5);
  const place = (await page.locator('.rank.me .rk').textContent()).trim();

  // lobby history & board refill
  await page.getByText('Lobby').click();
  await page.waitForSelector('.hist');
  check('result appears in history', (await page.locator('.hist').count()) === 1);
  check('board refilled to 4', (await page.locator('.contest-card').count()) === 4);

  // guest judge
  await page.locator('.judge-card').click();
  await page.waitForSelector('.gj-look');
  await sleep(300);
  await shot('m3-07-guest-judge');
  await page.locator('.gj-look').first().click();
  await page.waitForSelector('.modal-card .ribbon');
  await sleep(300);
  const verdict = (await page.locator('.modal-card .ribbon').textContent()).trim();
  check('guest judge gives a verdict', ['Great eye!', 'Not quite!'].includes(verdict), verdict);
  await page.getByText('Done').click();
  await sleep(300);

  // persistence + trophy shelf
  await sleep(700);
  await page.reload();
  await page.getByText('Continue as Stella').click();
  await page.waitForSelector('.room');
  await sleep(700);
  await closeModals();
  const shelf = await page.locator('.room-bg').innerHTML();
  if (['🥇', '🥈', '🥉'].includes(place)) check('podium trophy is on the apartment shelf', shelf.includes('1 trophies'), place);
  else check('empty shelf shows the hint', shelf.includes('win contests to fill me'), place);
  await page.locator('.hud-left').click();
  await sleep(400);
  check('profile counts the contest entry', (await page.locator('.screen-profile').textContent()).includes('Best contest score'));
  await page.locator('.tab[data-tab="city"]').click();
  await page.locator('.district-jump .chip', { hasText: 'Star Boulevard' }).click();
  await sleep(700);
  await page.locator('.loc[data-id="pageant"]').click({ force: true });
  await page.waitForSelector('.contest-card');
  check('Grand Pavilion opens from the city map', true);
  check('entries persisted after reload', (await page.locator('.pav-stats').textContent()).includes('1entries'));
} catch (e) {
  errors.push(`script: ${e.stack || e.message}`);
  await shot('zz-m3-failure').catch(() => {});
} finally {
  await browser.close();
  stopServer();
}
for (const [s, n, x] of results) console.log(`${s}  ${n}${x ? `  (${x})` : ''}`);
if (errors.length) console.log('\nERRORS:\n' + errors.join('\n'));
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} checks passed, ${errors.length} errors`);
process.exit(failed || errors.length ? 1 : 0);
