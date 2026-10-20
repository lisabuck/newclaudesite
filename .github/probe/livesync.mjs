import { chromium } from '/tmp/p/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = 'diagnostics/livesync'; fs.mkdirSync(out, { recursive: true });
const L = []; const log = s => { L.push(s); console.log(s); };
const SITE = 'https://www.thornegroup.co.nz';
const browser = await chromium.launch({ channel: 'chrome' });
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
  const bad = [], errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().slice(0, 150)); });
  const res = await page.goto(SITE + '/renovation-guide?probe=' + Date.now(), { waitUntil: 'networkidle', timeout: 90000 });
  const info = await page.evaluate(() => ({ title: document.title, robots: (document.querySelector('meta[name=robots]') || {}).content, count: document.querySelector('.gb-count').textContent }));
  const steps = [info.count];
  for (let i = 0; i < 8; i++) { if (await page.evaluate(() => document.querySelector('.gb-next').disabled)) break; await page.evaluate(() => document.querySelector('.gb-next').click()); await page.waitForTimeout(1000); steps.push(await page.textContent('.gb-count')); }
  const loaded = await page.evaluate(() => { const im = [...document.querySelectorAll('.gb-book img')].filter(i => i.offsetParent !== null || i.closest('.gb-single')); return im.filter(i => i.complete && i.naturalWidth > 0).length + '/' + im.length; });
  await page.evaluate(() => document.querySelector('.gb-zoom').click()); await page.waitForTimeout(2500);
  const zoom = await page.evaluate(() => [...document.querySelectorAll('.gb-zpages img')].map(i => i.src.split('/').pop() + (i.naturalWidth > 0 ? ' ok' : ' NOT LOADED')).join(', '));
  await page.screenshot({ path: `${out}/reno-${label}-zoom.png` });
  log(`${label}: HTTP ${res.status()} | ${info.title} | robots ${info.robots} | ${steps.join(' > ')} | images loaded ${loaded} | zoom ${zoom}${errs.length ? ' | ERR ' + errs.join(';') : ''}${bad.length ? ' | FAILED ' + bad.slice(0, 5).join(' ; ') : ''}`);
  await ctx.close();
}
for (const f of ['p06.jpg?v=2', 'z06.jpg?v=2', 'p04.jpg?v=2']) {
  const ctx = await browser.newContext(); const r = await ctx.request.get(SITE + '/documents/renovation-guide/' + f); const body = await r.body();
  log(`FILE ${f} ${r.status()} ${body.length} bytes`); await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
