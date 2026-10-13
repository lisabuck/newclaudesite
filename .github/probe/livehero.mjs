import { chromium } from '/tmp/p/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = 'diagnostics/livehero'; fs.mkdirSync(out, { recursive: true });
const lines = [];
const browser = await chromium.launch({ channel: 'chrome' });
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: label === 'phone' ? 3 : 1 });
  await ctx.addInitScript(() => { try { sessionStorage.tgPreSeen = '1'; localStorage.tgPreSeen = String(Date.now()); } catch (e) {} });
  const page = await ctx.newPage();
  page.on('response', r => { if (r.request().resourceType() === 'image' && r.status() >= 400) lines.push(`${label} IMAGE ${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => { if (r.resourceType() === 'image') lines.push(`${label} FAILED ${r.failure()?.errorText} ${r.url()}`); });
  page.on('console', m => { if (m.type() === 'error') lines.push(`${label} CONSOLE ${m.text().slice(0, 200)}`); });
  await page.goto('https://www.thornegroup.co.nz/?probe=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  for (let i = 0; i < 12; i++) {
    const s = await page.evaluate(() => {
      const h = document.querySelector('thorne-home-page');
      const cls = innerWidth < 751 ? '.tg-hslm' : '.tg-hsl';
      return {
        ready: !!h && h.hasAttribute('data-hero-ready'),
        imgs: [...document.querySelectorAll('.tg-hero-slides ' + cls)].map(i => ({
          id: (i.currentSrc || i.src).match(/(2d7300|b2375c)_(.{8})/)?.[0] || i.currentSrc.slice(0, 40),
          op: +getComputedStyle(i).opacity, w: i.naturalWidth, done: i.complete, src: (i.currentSrc || '').slice(0, 160)
        }))
      };
    });
    lines.push(`${label} t=${(i * 1.25).toFixed(2)}s ready=${s.ready} ` + s.imgs.map(x => `${x.id}[op${x.op.toFixed(1)} w${x.w}${x.done ? '' : ' loading'}]`).join(' '));
    if (i === 0) s.imgs.forEach(x => lines.push(`${label} SRC ${x.id} ${x.src}`));
    await page.locator('.tg-hero-frame').screenshot({ path: `${out}/${label}-${String(i).padStart(2, '0')}.png` });
    await page.waitForTimeout(1250);
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, lines.join('\n') + '\n');
console.log(lines.join('\n'));
