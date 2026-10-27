import { chromium } from '/tmp/p/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = 'diagnostics/livesync'; fs.mkdirSync(out, { recursive: true });
const L = []; const log = s => { L.push(s); console.log(s); };
const SITE = 'https://www.thornegroup.co.nz';
const browser = await chromium.launch({ channel: 'chrome' });
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  for (const proj of ['Coastal Sanctuary', 'On the dunes']) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
    const bad = [], errs = [];
    page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
    page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().slice(0, 150)); });
    const res = await page.goto(SITE + '/projects?probe=' + Date.now(), { waitUntil: 'networkidle', timeout: 90000 });
    const info = await page.evaluate(name => {
      const c = [...document.querySelectorAll('thorne-gallery .card')].find(c => (c.getAttribute('aria-label') || '').indexOf(name) !== -1);
      const v = [...document.scripts].map(s => s.src).find(s => /GALLERY6/.test(s)) || '';
      if (c) c.click();
      return { meta: c ? c.querySelector('.card-meta').textContent : 'NO CARD', v: v.split('?')[1] };
    }, proj);
    await page.waitForTimeout(1500);
    const seq = [], notLoaded = [];
    for (let k = 0; k < 26; k++) {
      await page.waitForTimeout(1100);
      const st = await page.evaluate(() => {
        const th = document.querySelector('.th'), stg = th.querySelector('.th-stage');
        const a = stg.querySelector('.th-img:not(.th-img2)'), b = stg.querySelector('.th-img2'), pair = stg.classList.contains('th-pair');
        const ok = x => x.complete && x.naturalWidth > 0;
        return { t: th.querySelector('.th-title').textContent, c: th.querySelector('.th-counter').textContent, pair, ok: ok(a) && (!pair || ok(b)) };
      });
      if (st.t !== proj) break;
      seq.push(st.c.replace(/ of \d+/, '') + (st.pair ? 'P' : ''));
      if (!st.ok) notLoaded.push(st.c);
      if (label === 'desktop' && proj === 'Coastal Sanctuary' && /^6-7/.test(st.c)) await page.screenshot({ path: `${out}/cs-pair-6-7.png` });
      await page.keyboard.press('ArrowRight');
    }
    log(`${label} ${proj}: HTTP ${res.status()} | card "${info.meta}" | GALLERY6 ${info.v} | ${seq.join(' ')}`);
    log(`  photos not loaded: ${notLoaded.length ? notLoaded.join(', ') : 'none'} | errors ${errs.length ? errs.join(' ; ') : 'none'} | failed requests ${bad.length ? bad.slice(0, 5).join(' ; ') : 'none'}`);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
