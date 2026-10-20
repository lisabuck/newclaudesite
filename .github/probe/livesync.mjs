import { chromium } from '/tmp/p/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = 'diagnostics/livesync'; fs.mkdirSync(out, { recursive: true });
const L = []; const log = s => { L.push(s); console.log(s); };
const SITE = 'https://www.thornegroup.co.nz';
const browser = await chromium.launch({ channel: 'chrome' });
// address variants
for (const path of ['/client-guides', '/client-guides/', '/client-guide', '/Client-Guides', '/clientguides']) {
  const ctx = await browser.newContext(); const r = await ctx.request.get(SITE + path, { maxRedirects: 0 }).catch(e => null);
  log(`ADDRESS ${path} -> ${r ? r.status() + (r.headers()['location'] ? ' redirect to ' + r.headers()['location'] : '') : 'request failed'}`); await ctx.close();
}
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
  const bad = [], errs = [], cons = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') cons.push(m.text().slice(0, 200)); });
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().slice(0, 150)); });
  const res = await page.goto(SITE + '/client-guides?probe=' + Date.now(), { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    title: document.title, h: (document.querySelector('h1,h2') || {}).textContent,
    tabs: [...document.querySelectorAll('.cg-tab')].map(t => t.textContent.trim()),
    visibleGuide: [...document.querySelectorAll('.cg-guide[data-guide]')].filter(g => g.offsetParent !== null).map(g => g.getAttribute('data-guide')),
    imgs: [...document.querySelectorAll('img')].length,
    broken: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).map(i => (i.currentSrc || i.src).slice(0, 120)),
    bodyLen: document.body.innerText.length
  }));
  log(`${label}: HTTP ${res.status()} | ${JSON.stringify(info)}`);
  await page.screenshot({ path: `${out}/client-${label}-top.png` });
  for (const id of ['02', '03', '01']) {
    const btn = await page.$(`.cg-tab[data-tab="${id}"]`);
    if (!btn) { log(`${label}: tab ${id} MISSING`); continue; }
    await btn.click(); await page.waitForTimeout(1200);
    const st = await page.evaluate(id => ({ selected: document.querySelector(`.cg-tab[data-tab="${id}"]`).getAttribute('aria-selected'), shown: [...document.querySelectorAll('.cg-guide[data-guide]')].filter(g => g.offsetParent !== null).map(g => g.getAttribute('data-guide')), broken: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0 && i.offsetParent !== null).length }), id);
    log(`${label}: click tab ${id} -> ${JSON.stringify(st)}`);
    await page.screenshot({ path: `${out}/client-${label}-tab${id}.png` });
  }
  if (errs.length) log(`${label} PAGE ERRORS: ${errs.join(' || ')}`);
  if (cons.length) log(`${label} CONSOLE ERRORS: ${cons.slice(0, 5).join(' || ')}`);
  if (bad.length) log(`${label} FAILED REQUESTS: ${bad.slice(0, 10).join(' || ')}`);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
