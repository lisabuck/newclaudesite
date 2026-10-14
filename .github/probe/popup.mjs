import { chromium } from '/tmp/p/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = 'diagnostics/popup'; fs.mkdirSync(out, { recursive: true });
const lines = [];
const browser = await chromium.launch({ channel: 'chrome' });
for (const [label, vp, url] of [['desktop', { width: 1440, height: 900 }, 'https://thornesite1234.vercel.app/'], ['phone', { width: 390, height: 844 }, 'https://thornesite1234.vercel.app/projects']]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  page.on('pageerror', e => lines.push(`${label} PAGEERROR ${e.message.slice(0, 200)}`));
  page.on('console', m => { if (m.type() === 'error') lines.push(`${label} CONSOLE ${m.text().slice(0, 200)}`); });
  await page.goto(url + '?probe=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  const has = await page.evaluate(() => !!document.getElementById('tg-pop'));
  lines.push(`${label} pop-up markup present: ${has}`);
  for (const t of [5, 20, 29, 32, 36]) {
    await page.waitForTimeout((t === 5 ? 5 : t - [5, 20, 29, 32, 36][[5, 20, 29, 32, 36].indexOf(t) - 1]) * 1000);
    const s = await page.evaluate(() => { const e = document.getElementById('tg-pop'); return e ? { hidden: e.hidden, op: getComputedStyle(e).opacity, cls: e.className } : null; });
    lines.push(`${label} t=${t}s ${JSON.stringify(s)}`);
  }
  await page.screenshot({ path: `${out}/${label}.png` });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, lines.join('\n') + '\n');
console.log(lines.join('\n'));
