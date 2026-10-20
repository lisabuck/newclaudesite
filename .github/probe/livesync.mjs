import { chromium } from '/tmp/p/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = 'diagnostics/livesync'; fs.mkdirSync(out, { recursive: true });
const L = []; const log = s => { L.push(s); console.log(s); };
const SITE = 'https://www.thornegroup.co.nz';
const browser = await chromium.launch({ channel: 'chrome' });
for (const g of ['rural-building-guide', 'coastal-building-guide', 'space-optimising-guide', 'client-guides']) {
  for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
    const bad = [];
    page.on('pageerror', e => log(`${g} ${label} PAGEERROR ${e.message.slice(0, 160)}`));
    page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().slice(0, 120)); });
    const res = await page.goto(SITE + '/' + g + '?probe=' + Date.now(), { waitUntil: 'networkidle', timeout: 90000 });
    const info = await page.evaluate(() => ({ title: document.title, robots: (document.querySelector('meta[name=robots]') || {}).content, count: (document.querySelector('.gb-count') || {}).textContent || '', logoOk: [...document.querySelectorAll('img')].slice(0, 1).every(i => i.naturalWidth > 0) }));
    let steps = [], zoom = '';
    if (info.count) {
      steps.push(info.count);
      for (let i = 0; i < 16; i++) { if (await page.evaluate(() => document.querySelector('.gb-next').disabled)) break; await page.evaluate(() => document.querySelector('.gb-next').click()); await page.waitForTimeout(1000); steps.push(await page.textContent('.gb-count')); }
      const loaded = await page.evaluate(() => { const im = [...document.querySelectorAll('.gb-book img')].filter(i => i.offsetParent !== null || i.closest('.gb-single')); return im.filter(i => i.complete && i.naturalWidth > 0).length + '/' + im.length; });
      await page.evaluate(() => document.querySelector('.gb-zoom').click()); await page.waitForTimeout(2500);
      zoom = await page.evaluate(() => [...document.querySelectorAll('.gb-zpages img')].map(i => i.src.split('/').slice(-1)[0] + (i.naturalWidth > 0 ? ' ok' : ' NOT LOADED')).join(', '));
      await page.screenshot({ path: `${out}/${g}-${label}-end-zoom.png` });
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/${g}-${label}-end.png` });
      log(`${g} ${label}: HTTP ${res.status()} | ${info.title} | robots ${info.robots} | ${steps[0]} … ${steps.slice(-1)[0]} (${steps.length} steps) | images loaded ${loaded} | zoom: ${zoom}${bad.length ? ' | FAILED ' + bad.slice(0, 4).join(' ; ') : ''}`);
    } else {
      log(`${g} ${label}: HTTP ${res.status()} | ${info.title} | robots ${info.robots}${bad.length ? ' | FAILED ' + bad.slice(0, 4).join(' ; ') : ''}`);
    }
    await ctx.close();
  }
}
for (const f of ['coastal-guide/p02.jpg?v=2', 'coastal-guide/z02.jpg?v=2', 'space-guide/p08.jpg?v=2', 'space-guide/z08.jpg?v=2', 'space-guide/p03.jpg?v=2']) {
  const ctx = await browser.newContext(); const r = await ctx.request.get(SITE + '/documents/' + f); const body = await r.body();
  log(`FILE ${f} ${r.status()} ${body.length} bytes`); await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
