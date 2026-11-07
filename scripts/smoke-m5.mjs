/**
 * Milestone 5 browser test: meet people at venues, chat, gifts, flirt, a full date,
 * story scenes, phone messages + replies, partners, inviting someone home (visitor in
 * the room), hosting a party, visiting a friend's home, persistence. Run `npm run build` first.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createNewGameState } from '../src/systems/gameState.js';
import { exportSave } from '../src/systems/saveSystem.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const PORT = 4184;
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
const num = async (sel) => Number((await page.locator(sel).first().textContent()).replace(/[^\d]/g, ''));
const relPoints = async () => { const t = await page.locator('.rel-top small').first().textContent(); return Number(t.split('/')[0]); };
/** Click through modals: dialogue continue buttons, stories, celebrations. */
async function drain(max = 6) {
  for (let i = 0; i < max; i++) {
    await sleep(350);
    if (!(await page.locator('.modal-card').count())) return;
    const cont = page.locator('.modal-card .btn-primary').last();
    if (await cont.count()) await cont.click(); else await page.locator('.modal-x').click();
  }
}
async function talkFirstChoice() {
  await page.waitForSelector('.dl-choice');
  await page.locator('.dl-choice').first().click();
  await page.waitForSelector('.dl-result');
  await page.locator('.modal-card .btn-primary').last().click();
  await drain();
}

try {
  await page.goto(URL);
  await page.getByText('Begin Your Story').click();
  await page.fill('.creator-footer input', 'Rosa');
  await page.getByText('Start my story').click();
  await page.waitForSelector('.modal-x'); await page.locator('.modal-x').click();
  await page.waitForSelector('.day-grid'); await page.locator('.modal-x').click();
  await sleep(500);

  // ---------- meet Leo at the café ----------
  await page.locator('.tab[data-tab="city"]').click();
  await page.waitForSelector('.city-svg');
  await page.locator('.loc[data-id="cafe"]').click({ force: true });
  await page.waitForSelector('.venue-scene');
  await sleep(400);
  await shot('m5-01-cafe');
  const here = await page.locator('.person-card').count();
  check('people are at the café', here >= 3, String(here));
  await page.locator('.person-card').filter({ hasText: 'Singer-songwriter' }).click();
  await page.waitForSelector('.dl-head');
  await sleep(300);
  await shot('m5-02-meet-leo');
  check('meeting shows their intro', (await page.locator('.bubble-npc').textContent()).includes('Leo'));
  await page.getByText('Nice to meet you!').click();
  await page.waitForSelector('.person-hero');
  await sleep(300);
  check('profile shows Acquaintance', (await page.locator('.rel-top b').textContent()).includes('Acquaintance'));
  check('flirt locked until Friend', await page.locator('.person-actions .btn', { hasText: 'Flirt' }).isDisabled());
  await shot('m5-03-leo-profile');

  // ---------- chat + gift ----------
  const p0 = await relPoints();
  await page.locator('.person-actions .btn', { hasText: 'Chat' }).click();
  await page.waitForSelector('.dl-choice');
  await sleep(200);
  await shot('m5-04-chat');
  await page.locator('.dl-choice').first().click();
  await page.waitForSelector('.dl-result');
  await sleep(200);
  await shot('m5-05-chat-reply');
  await page.locator('.modal-card .btn-primary').last().click();
  await drain();
  check('chatting earns points', (await relPoints()) > p0, `${p0}→${await relPoints()}`);
  const coins0 = await num('.pill-coin b');
  await page.locator('.person-actions .btn', { hasText: 'Gift' }).click();
  await page.locator('.gift-opt', { hasText: 'Vintage Vinyl' }).click();
  await page.waitForSelector('.modal-card .ribbon');
  check('Leo loves the vinyl', (await page.locator('.modal-card .ribbon').last().textContent()).includes('love'));
  await drain();
  check('gift cost 300 coins', coins0 - (await num('.pill-coin b')) === 300);
  await page.locator('.person-actions .btn', { hasText: 'Gift' }).click();
  await page.locator('.gift-opt', { hasText: 'Concert Tickets' }).click();
  await drain();
  for (let i = 0; i < 2; i++) { await page.locator('.person-actions .btn', { hasText: 'Chat' }).click(); await talkFirstChoice(); }
  const lvl = await page.locator('.rel-top b').textContent();
  check('reached Friend or better in one visit', /Friend|Crush/.test(lvl), lvl);
  check('flirt unlocked', !(await page.locator('.person-actions .btn', { hasText: 'Flirt' }).isDisabled()));

  // ---------- a date ----------
  const fame0 = await page.evaluate(() => 0);
  void fame0;
  await page.locator('.person-actions .btn', { hasText: 'Date' }).click();
  await page.locator('.venue-opt', { hasText: 'Sugarplum' }).click();
  for (let b = 0; b < 3; b++) {
    await page.waitForSelector('.beat-q');
    if (b === 0) { await sleep(300); await shot('m5-06-date'); }
    await page.locator('.dl-choice').nth(b === 1 ? 0 : 1).click();
    await page.locator('.modal-card .btn-primary').last().click();
    await sleep(300);
  }
  await page.waitForSelector('.hearts');
  await sleep(300);
  await shot('m5-07-date-result');
  check('date ends with hearts and rewards', (await page.locator('.date-result').textContent()).includes('XP'));
  await drain(8);

  // ---------- phone ----------
  await page.waitForSelector('.phone-btn');
  await sleep(1200);
  const badge = await page.locator('.phone-btn .tab-badge').textContent();
  check('phone badge shows unread messages', Number(badge) >= 1, badge);
  await page.locator('.phone-btn').click();
  await page.waitForSelector('.thread');
  await page.locator('.thread').first().click();
  await page.waitForSelector('.conv .msg');
  await sleep(300);
  await shot('m5-08-phone');
  await page.locator('.reply-row .chip').first().click();
  await sleep(400);
  check('replying adds your bubble', (await page.locator('.msg.out').count()) >= 1);

  // ---------- advanced social save (import) ----------
  const s = createNewGameState({ name: 'Rosa' });
  s.player.coins = 50000; s.player.level = 4;
  const day = new Date(); const dk = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  for (const [id, pts, extra] of [['leo', 230, { dates: 1, storiesSeen: [2, 3, 4] }], ['mimi', 90, { storiesSeen: [2] }], ['zara', 90, { storiesSeen: [2] }], ['lottie', 90, { storiesSeen: [2] }]]) {
    s.social.rel[id] = { met: true, points: pts, dates: 0, day: dk, chats: 0, flirts: 0, gifts: 0, dated: false, visited: false, homeVisited: false, storiesSeen: [], ...extra };
  }
  s.social.lastTextDay = dk; s.daily.lastClaimKey = dk; s.daily.streak = 1;
  const file = `${OUT}m5-save.json`;
  writeFileSync(file, exportSave(s));
  await page.locator('.hud .icon-btn[aria-label="Settings"]').click();
  await page.setInputFiles('.settings input[type=file]', file);
  await page.locator('.modal-actions .btn', { hasText: 'Restore' }).click();
  await page.waitForSelector('.home-actions');
  await sleep(600);

  // partners
  await page.locator('.phone-btn').click();
  await page.locator('.chips.seg .chip', { hasText: 'Contacts' }).click();
  await page.locator('.person-card', { hasText: 'Leo' }).click();
  await page.waitForSelector('.person-hero');
  await page.locator('.person-actions .btn', { hasText: 'Ask to be partners' }).click();
  await page.getByText('Ask 💗').click();
  const answer = page.locator('.modal-card .ribbon', { hasText: /official|Not yet/ });
  await answer.waitFor();
  check('Leo says yes', (await answer.textContent()).includes('official'));
  await drain(8);
  check('profile shows partner badge', await page.locator('.partner-badge').isVisible());

  // invite home + party
  await page.locator('.tab[data-tab="home"]').click();
  await page.waitForSelector('.home-actions');
  await sleep(400);
  await page.getByText('💌 Invite').click();
  await page.locator('.guest', { hasText: 'Mimi' }).click();
  await page.waitForSelector('.guest-note');
  await sleep(400);
  await shot('m5-09-visitor');
  check('visitor appears in your room', (await page.locator('.guest-note').textContent()).includes('Mimi'));
  const fameBefore = await page.evaluate(() => 0);
  void fameBefore;
  await page.getByText('🎉 Party').first().click();
  await page.waitForSelector('.guest-grid');
  await page.locator('.modal-actions .btn-gold').click();
  await page.waitForSelector('.party');
  await sleep(400);
  await shot('m5-10-party');
  check('party pays fame & XP', (await page.locator('.party').textContent()).includes('fame'));
  await drain(10);

  // visit a friend's home
  await page.locator('.phone-btn').click();
  await page.locator('.chips.seg .chip', { hasText: 'Contacts' }).click();
  await page.locator('.person-card', { hasText: 'Lottie' }).click();
  await page.locator('.person-actions .btn', { hasText: 'Visit their home' }).click();
  await page.waitForSelector('.tour-room');
  await sleep(300);
  await shot('m5-11-lottie-home');
  check('friend home visit shows their decorated place', (await page.locator('.tour-room .fitem').count()) >= 4);
  await drain(6);

  // persistence
  await sleep(700);
  await page.reload();
  await page.getByText('Continue as Rosa').click();
  await page.waitForSelector('.home-actions');
  await sleep(800);
  await page.locator('.hud-left').click();
  await sleep(400);
  check('relationship status persists', (await page.locator('.screen-profile').textContent()).includes('Dating Leo'));
} catch (e) {
  errors.push(`script: ${e.stack || e.message}`);
  await shot('zz-m5-failure').catch(() => {});
} finally {
  await browser.close();
  stopServer();
}
for (const [s, n, x] of results) console.log(`${s}  ${n}${x ? `  (${x})` : ''}`);
if (errors.length) console.log('\nERRORS:\n' + errors.join('\n'));
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} checks passed, ${errors.length} errors`);
process.exit(failed || errors.length ? 1 : 0);
