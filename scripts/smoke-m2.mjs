/**
 * Milestone 2 browser test: careers, wall-clock job timers (incl. across reloads),
 * level-ups, promotions, daily gift + streak, quests. Uses Playwright's fake clock so
 * timers can be fast-forwarded. Run `npm run build` first.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const { chromium } = createRequire(import.meta.url)('playwright');
const PORT = 4181;
const URL = `http://localhost:${PORT}/`;
const OUT = new globalThis.URL('../screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe', detached: true });
const stopServer = () => { try { process.kill(-server.pid); } catch { /* stopped */ } };
await new Promise((res, rej) => {
  server.stdout.on('data', (d) => { if (String(d).includes('Local')) res(); });
  setTimeout(() => rej(new Error('preview timeout')), 15000);
});

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
const num = async (sel) => Number((await page.locator(sel).textContent()).replace(/[^\d]/g, ''));
const coins = () => num('.pill-coin b');
const ff = async (secs) => { await page.clock.fastForward(secs * 1000); await sleep(400); };
/** Click through any celebration modals (level up, promotion). Returns their titles. */
async function closeModals(snap) {
  const seen = [];
  for (let i = 0; i < 6; i++) {
    const m = page.locator('.modal-card');
    if (!(await m.count())) { await sleep(250); if (!(await m.count())) break; }
    const title = (await page.locator('.modal-card .ribbon').textContent().catch(() => '')) || '';
    seen.push(title.trim());
    if (snap && !seen.slice(0, -1).includes(title.trim())) await shot(`${snap}-${title.trim().replace(/\W+/g, '').toLowerCase()}`);
    await page.locator('.modal-actions .btn').last().click();
    await sleep(350);
  }
  return seen;
}

try {
  await page.clock.install({ time: new Date(2026, 10, 6, 10, 0, 0) });
  await page.goto(URL);
  await page.getByText('Begin Your Story').click();
  await page.fill('.creator-footer input', 'Nova');
  await page.getByText('Start my story').click();
  await page.waitForSelector('.room');
  await page.waitForSelector('.modal-x');
  await page.locator('.modal-x').click(); // close welcome → daily gift appears
  await page.waitForSelector('.day-grid', { timeout: 4000 });
  await sleep(300);
  await shot('m2-01-daily');
  await page.locator('.modal-actions .btn-gold').click();
  await sleep(600);
  check('daily gift pays 1,000 coins', (await coins()) === 6000, String(await coins()));
  check('daily gift pays 10 gems', (await num('.pill-gem b')) === 110);

  // ---- first job ----
  await page.locator('.tab[data-tab="work"]').click();
  await page.waitForSelector('.career-card');
  await sleep(300);
  await shot('m2-02-work-hub');
  check('singing locked at level 1', await page.locator('.career-card.locked', { hasText: 'Singing' }).isVisible());
  await page.locator('.career-card', { hasText: 'Modelling' }).click();
  await page.waitForSelector('.job-card');
  await page.locator('.job-card', { hasText: 'Catalogue Shoot' }).getByText('Start').click();
  await sleep(500);
  check('job timer is running', /\d+s/.test(await page.locator('.aj-time').textContent()));
  await shot('m2-03-job-running');
  check('other modelling jobs are blocked while busy', await page.locator('.job-card', { hasText: 'Boutique Advert' }).getByText('Busy').isVisible());

  // timer keeps running while elsewhere, then notifies
  await page.locator('.tab[data-tab="city"]').click();
  await ff(13);
  check('job-finished toast while on another screen', (await page.locator('#toasts').textContent()).includes('Catalogue Shoot is done'));
  check('work tab badge shows a ready job', (await page.locator('.tab[data-tab="work"] .tab-badge').textContent()) === '1');
  await page.locator('.tab[data-tab="work"]').click();
  await page.waitForSelector('.cstatus.ready');
  await shot('m2-04-ready');
  const before = await coins();
  await page.locator('.cstatus.ready .collect').click();
  await sleep(700);
  await closeModals();
  check('collect pays coins incl. style bonus (220 × 1.25)', (await coins()) - before === 275, String((await coins()) - before));
  check('XP shown in HUD', (await page.locator('.xp-text').textContent()).startsWith('45 /'));

  // ---- timer survives a reload ----
  await page.locator('.career-card', { hasText: 'Modelling' }).click();
  await page.locator('.job-card', { hasText: 'Boutique Advert' }).getByText('Start').click();
  await sleep(300);
  await ff(5);
  await page.reload();
  await page.getByText('Continue as Nova').click();
  await page.waitForSelector('.room');
  await sleep(700);
  check('no daily popup after already claiming today', !(await page.locator('.day-grid').count()));
  await page.locator('.tab[data-tab="work"]').click();
  const t = await page.locator('.cstatus.working .ctime').textContent();
  check('job still running after reload', /^\d+s$/.test(t) && Number(t.replace('s', '')) <= 10, t);
  await ff(11);
  await page.waitForSelector('.cstatus.ready');
  await page.locator('.cstatus.ready .collect').click();
  await sleep(600);
  await closeModals();

  // ---- grind to level 2 (with a promotion on the way) ----
  const titles = [];
  for (let i = 0; i < 12 && (await page.locator('.lvl-badge b').textContent()) === '1'; i++) {
    await page.locator('.career-card', { hasText: 'Modelling' }).click();
    await page.locator('.job-card', { hasText: 'Boutique Advert' }).getByText('Start').click();
    await sleep(200);
    await ff(16);
    await page.locator('.active-job .collect').click();
    await sleep(700);
    titles.push(...(await closeModals('m2-05')));
    await page.locator('.back-btn').click();
    await sleep(300);
  }
  check('reached level 2', (await page.locator('.lvl-badge b').textContent()) === '2');
  check('level-up celebration shown', titles.includes('Level up!'), titles.join(','));
  check('promotion celebration shown', titles.includes('Promotion!'), titles.join(','));
  check('singing unlocked at level 2', !(await page.locator('.career-card.locked', { hasText: 'Singing' }).count()));
  await page.locator('.career-card', { hasText: 'Modelling' }).click();
  await sleep(300);
  check('magazine photoshoot unlocked by promotion', await page.locator('.job-card', { hasText: 'Magazine Photoshoot' }).getByText('Start').isVisible());
  await page.locator('.job-card', { hasText: 'Magazine Photoshoot' }).getByText('Start').click();
  await sleep(400);
  await shot('m2-06-studio');

  // ---- quests ----
  await page.locator('.tab[data-tab="quests"]').click();
  await page.waitForSelector('.quest');
  await shot('m2-07-quests-daily');
  await page.locator('.chips.seg .chip', { hasText: 'Milestones' }).click();
  await sleep(300);
  const q = page.locator('.quest', { hasText: 'First Day on the Job' });
  const c0 = await coins();
  await q.getByText('Claim').click();
  await sleep(600);
  await closeModals();
  check('story quest pays 500 coins', (await coins()) - c0 === 500, String((await coins()) - c0));
  check('claimed quest shows a tick', await page.locator('.quest.claimed', { hasText: 'First Day on the Job' }).isVisible());
  await shot('m2-08-quests-story');

  // ---- next day: streak day 2 ----
  await ff(24 * 3600);
  await sleep(1200);
  check('quests badge flags the new daily gift', Number(await page.locator('.tab[data-tab="quests"] .tab-badge').textContent()) >= 1);
  await page.locator('.gift-card').click();
  await page.waitForSelector('.day-grid');
  const c1 = await coins();
  await page.locator('.modal-actions .btn-gold').click();
  await sleep(600);
  await closeModals();
  check('day-2 streak gift pays 1,200 coins', (await coins()) - c1 === 1200, String((await coins()) - c1));

  await page.locator('.tab[data-tab="home"]').click();
  await sleep(400);
  await page.locator('.hud-left').click();
  await sleep(500);
  await shot('m2-09-profile');
} catch (e) {
  errors.push(`script: ${e.stack || e.message}`);
  await shot('zz-m2-failure').catch(() => {});
} finally {
  await browser.close();
  stopServer();
}

for (const [s, n, x] of results) console.log(`${s}  ${n}${x ? `  (${x})` : ''}`);
if (errors.length) console.log('\nERRORS:\n' + errors.join('\n'));
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} checks passed, ${errors.length} errors`);
process.exit(failed || errors.length ? 1 : 0);
