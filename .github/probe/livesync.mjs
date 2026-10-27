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
  const res = await page.goto(SITE + '/projects?probe=' + Date.now(), { waitUntil: 'networkidle', timeout: 90000 });
  const info = await page.evaluate(() => {
    const c = [...document.querySelectorAll('thorne-gallery .card')].find(c => /On the dunes/.test(c.getAttribute('aria-label')));
    const v = [...document.scripts].map(s => s.src).find(s => /GALLERY6/.test(s)) || '';
    return { meta: c ? c.querySelector('.card-meta').textContent : 'NO CARD', v: v.split('?')[1] };
  });
  await page.evaluate(() => { [...document.querySelectorAll('thorne-gallery .card')].find(c => /On the dunes/.test(c.getAttribute('aria-label'))).click(); });
  await page.waitForTimeout(1500);
  const seq = []; const notLoaded = [];
  for (let k = 0; k < 26; k++) {
    await page.waitForTimeout(1200);
    const st = await page.evaluate(() => {
      const th = document.querySelector('.th'), stg = th.querySelector('.th-stage');
      const a = stg.querySelector('.th-img:not(.th-img2)'), b = stg.querySelector('.th-img2');
      const pair = stg.classList.contains('th-pair');
      const ok = x => x.complete && x.naturalWidth > 0;
      return { t: th.querySelector('.th-title').textContent, c: th.querySelector('.th-counter').textContent, pair, okA: ok(a), okB: !pair || ok(b), on: th.querySelectorAll('.th-thumbs .tt.on').length, cta: !!document.querySelector('.th-endcta.on') };
    });
    if (st.t !== 'On the dunes') break;
    seq.push(st.c.replace(' of 23', '') + (st.pair ? 'P' : '') + (st.cta ? '[cta]' : ''));
    if (!st.okA || !st.okB) notLoaded.push(st.c);
    if (label === 'desktop' && /^15-16/.test(st.c)) await page.screenshot({ path: `${out}/dunes-bathroom-pair.png` });
    if (label === 'desktop' && /^2-3/.test(st.c)) await page.screenshot({ path: `${out}/dunes-pair-2-3.png` });
    if (label === 'phone' && /^15 of/.test(st.c)) await page.screenshot({ path: `${out}/dunes-phone-15.png` });
    await page.keyboard.press('ArrowRight');
  }
  log(`${label}: HTTP ${res.status()} | card "${info.meta}" | GALLERY6 ${info.v} | ${seq.join(' ')}`);
  log(`  photos not loaded: ${notLoaded.length ? notLoaded.join(', ') : 'none'} | errors ${errs.length ? errs.join(' ; ') : 'none'} | failed requests ${bad.length ? bad.slice(0, 5).join(' ; ') : 'none'}`);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
