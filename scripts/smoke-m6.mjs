/**
 * Milestone 6 browser test: Glitter Arcade (Fashion Memory, Jewellery Match-3, Styling
 * Challenge), photo studio + magazine cover + album + PNG export, home design awards,
 * clothing & furniture resale, persistence. Run `npm run build` first.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { findMatches, JEWELS } from '../src/minigames/match3.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const PORT = 4185;
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
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: Number(process.env.DSF || 1), hasTouch: true, isMobile: true, acceptDownloads: true });
const page = await context.newPage();
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
const shot = (n) => page.screenshot({ path: `${OUT}${n}.png` });
const coins = async () => Number((await page.locator('.pill-coin').first().textContent()).replace(/[^\d]/g, ''));
const gameState = () => page.evaluate(() => new Promise((res) => {
  const r = indexedDB.open('glamour-city');
  r.onsuccess = () => { const tx = r.result.transaction('saves'); const g = tx.objectStore('saves').get('slot1'); g.onsuccess = () => res(g.result?.data || g.result); };
}));
async function drain(max = 6) {
  for (let i = 0; i < max; i++) {
    await sleep(350);
    if (!(await page.locator('.modal-card').count())) return;
    const cont = page.locator('.modal-card .btn-primary').last();
    if (await cont.count()) await cont.click(); else await page.locator('.modal-x').last().click();
  }
}
async function resultChoice(label) {
  await page.waitForSelector('.mg-result');
  await sleep(300);
  await page.locator('.mg-result button', { hasText: label }).last().click();
  await drain(3);
}

try {
  await page.goto(URL);
  await page.getByText('Begin Your Story').click();
  await page.fill('.creator-footer input', 'Rosa');
  await page.getByText('Start my story').click();
  await page.waitForSelector('.modal-x'); await page.locator('.modal-x').click();
  await page.waitForSelector('.day-grid'); await page.locator('.modal-x').click();
  await sleep(500);

  // ---------- arcade is open in the city ----------
  await page.locator('.tab[data-tab="city"]').click();
  await sleep(400);
  await page.waitForSelector('.city-svg'); await sleep(600);
  await page.locator('.loc[data-id="arcade"]').click({ force: true });
  await sleep(500);
  if (await page.locator('.modal-card').count()) { const go = page.locator('.modal-card .btn-primary').last(); if (await go.count()) await go.click(); }
  await page.waitForSelector('.arc-card', { timeout: 5000 });
  check('Glitter Arcade opens from the city', (await page.locator('.arc-card').count()) === 3);
  await shot('m6-arcade');

  // ---------- Fashion Memory (solve perfectly by reading the card fronts) ----------
  await page.locator('.arc-card[data-game="memory"]').click();
  await page.locator('.modal-card button', { hasText: 'Easy' }).last().click();
  await page.waitForSelector('.mem-card');
  const fronts = await page.locator('.mem-front').evaluateAll((els) => els.map((e) => e.innerHTML.replace(/(id="|url\(#|href="#)[^"\)]*/g, '')));
  check('memory deals 12 cards on easy', fronts.length === 12);
  // one deliberate miss, then perfect
  const firstB = fronts.findIndex((f, i) => i > 0 && f !== fronts[0]);
  await page.locator('.mem-card').nth(0).click(); await page.locator('.mem-card').nth(firstB).click();
  await sleep(150);
  check('a miss shows both cards', (await page.locator('.mem-card.open').count()) === 2);
  await sleep(900);
  check('a miss flips back', (await page.locator('.mem-card.open').count()) === 0);
  const c0 = await coins();
  const done = new Set();
  for (let i = 0; i < fronts.length; i++) {
    if (done.has(i)) continue;
    const j = fronts.findIndex((f, k) => k !== i && f === fronts[i]);
    done.add(i); done.add(j);
    await page.locator('.mem-card').nth(i).click(); await page.locator('.mem-card').nth(j).click();
    await sleep(120);
  }
  await page.waitForSelector('.mg-result');
  const stars = await page.locator('.mg-result .mstar.on').count();
  check('memory finished with 3 stars', stars === 3, `stars ${stars}`);
  await shot('m6-memory');
  await resultChoice('Arcade');
  await sleep(500);
  check('memory paid at least 250 coins', (await coins()) - c0 >= 250, `+${(await coins()) - c0}`);

  // ---------- Jewellery Match-3 ----------
  await page.locator('.arc-card[data-game="match3"]').click();
  await page.waitForSelector('.gem');
  const readBoard = async () => {
    const labels = await page.locator('.gem').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    const n = Math.round(Math.sqrt(labels.length));
    const ids = labels.map((l) => JEWELS.findIndex((j) => l.startsWith(j.name)));
    return Array.from({ length: n }, (_, r) => ids.slice(r * n, r * n + n));
  };
  // invalid swap costs nothing
  const movesTxt = async () => (await page.locator('.mg-bar span').nth(2).textContent());
  const b0 = await readBoard();
  let invalid = null;
  for (let r = 0; r < b0.length && !invalid; r++) for (let c = 0; c < b0.length - 1 && !invalid; c++) {
    const t = b0.map((x) => [...x]); [t[r][c], t[r][c + 1]] = [t[r][c + 1], t[r][c]];
    if (!findMatches(t).cells.size) invalid = [r, c];
  }
  const gemAt = (r, c, n) => page.locator('.gem').nth(r * n + c);
  await gemAt(invalid[0], invalid[1], b0.length).click(); await gemAt(invalid[0], invalid[1] + 1, b0.length).click();
  await sleep(400);
  check('invalid swap costs no move', (await movesTxt()).includes('20'), await movesTxt());
  let played = 0;
  for (let turn = 0; turn < 25; turn++) {
    if (await page.locator('.mg-result').count()) break;
    const b = await readBoard(); const n = b.length;
    let best = null;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
      if (r + dr >= n || c + dc >= n) continue;
      const t = b.map((x) => [...x]); [t[r][c], t[r + dr][c + dc]] = [t[r + dr][c + dc], t[r][c]];
      const m = findMatches(t).cells.size;
      if (m && (!best || m > best[0])) best = [m, r, c, dr, dc];
    }
    if (!best) break;
    const [, r, c, dr, dc] = best;
    if (turn % 2) { // swipe
      const box = await gemAt(r, c, n).boundingBox();
      const cx = box.x + box.width / 2; const cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + dc * 40, cy + dr * 40, { steps: 4 }); await page.mouse.up();
    } else { await gemAt(r, c, n).click(); await gemAt(r + dr, c + dc, n).click(); }
    played++;
    for (let w = 0; w < 30; w++) { await sleep(150); if (!(await page.locator('.gem.pop').count()) && !(await page.locator('.m3-board.drop').count())) break; }
    await sleep(150);
  }
  await page.waitForSelector('.mg-result', { timeout: 10000 });
  check('match-3 plays to an end with tap and swipe', played > 0, `${played} moves`);
  await shot('m6-match3');
  await resultChoice('Arcade');

  // ---------- Styling Challenge ----------
  await page.locator('.arc-card[data-game="styling"]').click();
  await page.locator('.sty-go').click();
  await page.waitForSelector('.sty-timer');
  for (const slot of ['Dress', 'Shoes', 'Bag', 'Earrings', 'Necklace']) {
    await page.locator('.sty-tabs .chip', { hasText: slot }).first().click();
    await page.locator('.sty-grid .card').first().click();
  }
  check('styling look builds on the model', (await page.locator('.sty-count').textContent()).startsWith('5'));
  await shot('m6-styling');
  await page.locator('.sty-done').click();
  await page.waitForSelector('.mg-result');
  await resultChoice('Arcade');
  const st = await gameState();
  check('three minigames recorded in the save', st.minigames.played === 3, JSON.stringify(st.minigames));

  // ---------- photo studio ----------
  await page.locator('.tab[data-tab="home"]').click();
  await page.waitForSelector('.photo-btn');
  await sleep(700);
  await drain(2);
  await page.locator('.photo-btn').click();
  await page.waitForSelector('.pst-preview svg');
  check('home photo starts on your own room', (await page.locator('.pst-preview .room-svg').count()) === 1);
  await page.locator('.pst-tabs .chip', { hasText: 'Pose' }).click();
  await page.locator('.pst-opt[data-id="editorial"]').click();
  await sleep(300);
  check('advanced pose is locked behind modelling', (await page.locator('.toast').last().textContent()).includes('Modelling'));
  await page.locator('.pst-opt[data-id="over_shoulder"]').click();
  await page.locator('.pst-tabs .chip', { hasText: 'Frame' }).click();
  await page.locator('.pst-opt[data-id="polaroid"]').click();
  await shot('m6-photo-home');
  const fame0 = (await gameState()).player.fame;
  await page.locator('.pst-snap').click();
  await sleep(800); await drain(3);
  // magazine cover on a studio backdrop
  await page.locator('.pst-tabs .chip', { hasText: 'Backdrop' }).click();
  await page.locator('.pst-opt[data-id="paris"]').click();
  await page.locator('.pst-tabs .chip', { hasText: 'Cover' }).click();
  await page.locator('.pst-toggle input').check();
  await page.locator('.pst-opt[data-id="gloss"]').click();
  await page.locator('.pst-head').nth(3).click();
  await page.locator('.pst-tabs .chip', { hasText: 'Frame' }).click();
  await page.locator('.pst-opt[data-id="none"]').click();
  check('cover preview shows the masthead', (await page.locator('.pst-preview svg text').first().textContent()).includes('GLOSS'));
  await shot('m6-cover');
  await page.locator('.pst-snap').click();
  await sleep(800); await drain(3);
  const ps = await gameState();
  check('two photos saved, one a cover', ps.photos.length === 2 && ps.photos.filter((p) => p.cover).length === 1);
  check('first photo + first cover pay fame', ps.player.fame > fame0, `${fame0} → ${ps.player.fame}`);

  // ---------- album & PNG export ----------
  await page.locator('.pst-album').click();
  await page.waitForSelector('.album-pic');
  check('album lists both photos', (await page.locator('.album-pic').count()) === 2);
  await shot('m6-album');
  await page.locator('.album-pic').first().click();
  await page.waitForSelector('.photo-view');
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.locator('.photo-view button', { hasText: 'Save PNG' }).click()]);
  const pngPath = `${OUT}m6-export.png`;
  await download.saveAs(pngPath);
  const { readFileSync } = await import('node:fs');
  const png = readFileSync(pngPath);
  check('PNG export downloads a real 600×800 image', png.slice(1, 4).toString() === 'PNG' && png.readUInt32BE(16) === 600 && png.readUInt32BE(20) === 800, `${png.length} bytes`);
  await sleep(400);
  await page.locator('.album-pic').first().click();
  await page.locator('.photo-view button', { hasText: 'Favourite' }).click();
  await sleep(300);
  check('favourite marks the photo', (await page.locator('.album-pic.fav').count()) === 1);

  // ---------- home design awards ----------
  await page.locator('.screen-album .back-btn').last().click(); await sleep(450);
  await page.locator('.screen-photo .back-btn').last().click(); await sleep(450);
  await page.waitForSelector('.awards-btn'); await sleep(500); await drain(2);
  await page.locator('.awards-btn').click();
  await page.waitForSelector('.hd-card');
  check('awards board shows two briefs', (await page.locator('.hd-card').count()) === 2);
  await shot('m6-awards');
  const coinsBefore = await coins();
  await page.locator('.hd-enter').first().click();
  await page.waitForSelector('.hd-room');
  await shot('m6-awards-pick');
  await page.locator('.hd-submit:not([disabled])').first().click();
  await page.waitForSelector('.hd-entry', { timeout: 8000 });
  check('judging shows you + 4 rival rooms', (await page.locator('.hd-entry').count()) === 5 && (await page.locator('.hd-entry.me').count()) === 1);
  check('rival rooms are drawn', (await page.locator('.hd-entry .room-svg').count()) === 5);
  await sleep(400);
  await shot('m6-awards-results');
  await drain(3);
  await sleep(500);
  check('every entry pays', (await coins()) - coinsBefore >= 150, `+${(await coins()) - coinsBefore}`);
  await page.locator('.hd-done').click();
  await page.waitForSelector('.hd-card');
  check('board refills after entering', (await page.locator('.hd-card').count()) === 2);

  // ---------- resale: clothing ----------
  await page.locator('.tab[data-tab="mall"]').click();
  await page.locator('.mall-card', { hasText: 'Petal & Thread' }).click();
  await page.waitForSelector('.shop-banner'); await sleep(400);
  await page.locator('.screen-shop .card', { hasText: 'Peony Silk Blouse' }).click();
  await page.locator('.buy-btn').click();
  await page.getByText('Buy it!').click();
  await sleep(600); await drain(2);
  await page.locator('.tab[data-tab="wardrobe"]').click();
  await page.waitForSelector('.screen-wardrobe .card'); await sleep(400);
  // a starter piece cannot be sold
  await page.locator('.screen-wardrobe .card', { hasText: 'Daisy White Tee' }).click();
  await sleep(200);
  const firstCanSell = await page.locator('.sell-btn').count();
  await page.locator('.screen-wardrobe .card', { hasText: 'Peony Silk Blouse' }).click();
  await sleep(200);
  const wearing = (await page.locator('.detail-card .btn', { hasText: 'Take off' }).count()) > 0;
  if (wearing) { await page.locator('.detail-card .btn', { hasText: 'Take off' }).click(); await sleep(200); }
  check('blouse resale is 50% (140 coins)', (await page.locator('.sell-btn').textContent()).includes('140'), await page.locator('.sell-btn').textContent());
  const cs0 = await coins();
  await page.locator('.sell-btn').click();
  await page.locator('.modal-card .btn', { hasText: 'Sell' }).last().click();
  await sleep(600);
  check('selling clothing pays 140 coins and removes it', (await coins()) - cs0 === 140 && (await page.locator('.screen-wardrobe .card', { hasText: 'Peony Silk Blouse' }).count()) === 0, `+${(await coins()) - cs0}`);
  check('starter piece shows no sell button', firstCanSell === 0);

  // ---------- resale: furniture ----------
  await page.locator('.tab[data-tab="mall"]').click();
  await page.locator('.mall-card', { hasText: 'Glam Interiors' }).click();
  await page.waitForSelector('.shop-room');
  await page.locator('.screen-fshop .card', { hasText: 'Princess Armchair' }).click();
  await page.locator('.fdetail .btn-gold').click();
  await page.locator('.modal-actions .btn-gold').click();
  await sleep(600);
  await page.getByText('Keep shopping').click().catch(() => {});
  await drain(2);
  await page.locator('.tab[data-tab="home"]').click();
  await page.waitForSelector('.home-actions'); await sleep(400); await drain(2);
  await page.getByText('Decorate').first().click();
  await page.waitForSelector('.deco-canvas');
  await page.locator('.sell-mode').click();
  await sleep(200);
  const cf0 = await coins();
  await page.locator('.deco-drawer .card.sellable', { hasText: 'Princess Armchair' }).click();
  await page.locator('.modal-card .btn', { hasText: 'Sell' }).last().click();
  await sleep(600);
  check('selling stored furniture pays 360 coins', (await coins()) - cf0 === 360, `+${(await coins()) - cf0}`);
  await shot('m6-sell-furniture');
  await page.getByText('Done ✓').click();
  await page.waitForSelector('.home-actions');

  // ---------- profile + persistence ----------
  await sleep(800);
  await page.reload();
  await page.getByText('Continue').first().click().catch(() => {});
  await sleep(800); await drain(2);
  const fin = await gameState();
  check('save v6 persists arcade, album, awards and sales', fin.version === 6 && fin.minigames.played === 3 && fin.photos.length === 2 && fin.homeContests.entries === 1 && fin.stats.itemsSold === 2,
    JSON.stringify({ v: fin.version, mg: fin.minigames.played, ph: fin.photos.length, hc: fin.homeContests.entries, sold: fin.stats.itemsSold }));
  await page.locator('.hud-left').click();
  await page.waitForSelector('.stat-grid'); await sleep(400);
  check('profile shows design awards & photos', (await page.locator('.screen-profile').textContent()).includes('Home design awards') && (await page.locator('.screen-profile').textContent()).includes('magazine covers'));
  await shot('m6-profile');
} catch (e) {
  errors.push(`script: ${e.stack}`);
  await shot('m6-error').catch(() => {});
} finally {
  await browser.close();
  stopServer();
}
for (const r of results) console.log(r.join('  '));
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
const failed = results.filter((r) => r[0] === 'FAIL').length + errors.length;
console.log(failed ? `${failed} problem(s)` : 'ALL PASS');
process.exit(failed ? 1 : 0);
