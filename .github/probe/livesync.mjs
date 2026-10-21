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
  const res = await page.goto(SITE + '/brief?probe=' + Date.now(), { waitUntil: 'networkidle', timeout: 90000 });
  const head = await page.evaluate(() => ({ title: document.title, robots: (document.querySelector('meta[name=robots]') || {}).content, endpoint: document.querySelector('.bf') && document.querySelector('.bf').dataset.endpoint, popup: !!document.querySelector('.tg-pop, .tg-news-cta'), prog: (document.querySelector('.bf-prog') || {}).textContent }));
  log(`${label}: HTTP ${res.status()} | ${head.title} | robots ${head.robots} | endpoint ${head.endpoint} | progress ${head.prog} | site pop-up on page ${head.popup}`);
  await page.screenshot({ path: `${out}/brief-${label}-intro.png` });
  for (const s of [1, 4, 5, 6, 14, 15]) {
    await page.evaluate(n => { const b = document.querySelector(`[data-go="${n}"]`); if (b) b.click(); else { const sec = [...document.querySelectorAll('.bf-sec')]; sec.forEach(x => x.hidden = +x.dataset.sec !== n); } }, s);
    await page.waitForTimeout(400);
    for (let y = 0; y < 5000; y += 600) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(150); }
    const r = await page.evaluate(() => { const sec = document.querySelector('.bf-sec:not([hidden])'); const imgs = [...sec.querySelectorAll('img')]; return { n: sec.dataset.sec, loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length + '/' + imgs.length, hscroll: document.scrollingElement.scrollWidth > innerWidth }; });
    log(`  screen ${r.n}: images ${r.loaded}${r.hscroll ? ' | SIDEWAYS SCROLL' : ''}`);
    await page.evaluate(() => scrollTo(0, 0));
    if (s === 4 || s === 1) await page.screenshot({ path: `${out}/brief-${label}-s${s}.png`, fullPage: true });
  }
  log(`  errors ${errs.length ? errs.join(' ; ') : 'none'} | failed requests ${bad.length ? bad.slice(0, 5).join(' ; ') : 'none'}`);
  await ctx.close();
}
// the two server routes, called so that nothing is created: a brief with no
// name or email is refused, and an upload that is not an image is refused
const api = async (path, init) => { try { const r = await fetch(SITE + path, init); return r.status + ' ' + (await r.text()).slice(0, 160); } catch (e) { return 'ERR ' + e.message; } };
log('api/brief (empty): ' + await api('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }));
log('api/brief-upload (not an image): ' + await api('/api/brief-upload', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'x' }));
await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
