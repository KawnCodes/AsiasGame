// Renders public/icons/icon.svg to the PNG sizes needed for PWA + iOS home screen.
import { createRequire } from 'node:module';
// Playwright is used only for dev tooling (pre-installed globally in CI/dev containers).
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
const svg = readFileSync(new URL('../public/icons/icon.svg', import.meta.url), 'utf8');
const sizes = [[192, 'icon-192.png'], [512, 'icon-512.png'], [180, 'apple-touch-icon.png'], [512, 'icon-maskable-512.png']];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [size, name] of sizes) {
  const pad = name.includes('maskable') ? 0.12 : 0;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${pad ? '#f0559b' : 'transparent'}"><div style="padding:${size * pad}px">${svg.replace('<svg', `<svg width="${size * (1 - 2 * pad)}" height="${size * (1 - 2 * pad)}"`)}</div></body></html>`);
  await page.screenshot({ path: new URL(`../public/icons/${name}`, import.meta.url).pathname, omitBackground: !pad });
}
await browser.close();
console.log('icons written');
