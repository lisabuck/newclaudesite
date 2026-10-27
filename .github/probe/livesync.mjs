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
  const res = await page.goto(SITE + '/our-process?probe=' + Date.now(), { waitUntil: 'networkidle', timeout: 90000 });
  /* scroll through so every lazy photo loads */
  for (let y = 0; y < 12000; y += 600) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(250); }
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    title: document.title,
    robots: (document.querySelector('meta[name=robots]') || {}).content,
    cards: document.querySelectorAll('.rb-card').length,
    dark: [...document.querySelectorAll('.rb-item.price')].map(x => x.id).join(','),
    notLoaded: [...document.querySelectorAll('.rb-ph img')].filter(i => !(i.complete && i.naturalWidth)).map(i => i.closest('li').id),
    wide: document.scrollingElement.scrollWidth > innerWidth,
    logo: (() => { const i = document.querySelector('.op-logo'); return i && i.complete && i.naturalWidth > 0; })()
  }));
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/our-process-${label}.png`, fullPage: true });
  await page.click('#step-4 .rb-card'); await page.waitForTimeout(1500);
  const d4 = await page.evaluate(() => { const d = document.querySelector('.rb-dlg'), i = d.querySelector('img'); return { open: d.open, h2: d.querySelector('h2').textContent, img: i.complete && i.naturalWidth > 0 }; });
  await page.screenshot({ path: `${out}/our-process-${label}-popup.png` });
  await page.click('.rb-nav [data-d="1"]'); await page.waitForTimeout(800);
  const d5 = await page.evaluate(() => document.querySelector('.rb-dlg h2').textContent);
  log(`${label}: HTTP ${res.status()} | "${info.title}" | robots ${info.robots} | cards ${info.cards} | dark ${info.dark} | logo ${info.logo ? 'ok' : 'MISSING'} | sideways scroll ${info.wide}`);
  log(`  photos not loaded: ${info.notLoaded.length ? info.notLoaded.join(', ') : 'none'} | pop-up ${d4.open ? 'open' : 'SHUT'} "${d4.h2}" photo ${d4.img ? 'ok' : 'MISSING'} | next "${d5}"`);
  log(`  errors ${errs.length ? errs.join(' ; ') : 'none'} | failed requests ${bad.length ? bad.slice(0, 5).join(' ; ') : 'none'}`);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
