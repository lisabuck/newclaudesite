import { chromium } from '/tmp/p/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = 'diagnostics/livesync'; fs.mkdirSync(out, { recursive: true });
const L = []; const log = s => { L.push(s); console.log(s); };
const SITE = 'https://www.thornegroup.co.nz';
const browser = await chromium.launch({ channel: 'chrome' });
async function open(path, vp, label) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const bad = [];
  page.on('pageerror', e => log(`${label} PAGEERROR ${e.message.slice(0, 160)}`));
  page.on('response', r => { if (r.status() >= 400 && !/favicon|analytics|collect/.test(r.url())) bad.push(r.status() + ' ' + r.url().slice(0, 140)); });
  await page.goto(SITE + path + (path.includes('?') ? '&' : '?') + 'probe=' + Date.now(), { waitUntil: 'networkidle', timeout: 90000 }).catch(e => log(`${label} goto ${e.message.slice(0, 120)}`));
  return { ctx, page, bad };
}
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  // home
  let { ctx, page, bad } = await open('/', vp, label + ' home');
  const home = await page.evaluate(() => ({
    engine: [...document.scripts].map(s => s.src).find(s => s.includes('thorne-home-page54')) || '',
    tagline: /concept to completion/i.test(document.body.innerText),
    band: (document.querySelector('.tg-band[data-screen-label="Architectural Homes band"] h3') || {}).textContent,
    ctas: [...document.querySelectorAll('.tg-cta3')].map(c => [...c.querySelectorAll('.tg-c3b,.tg-c3link')].map(a => a.textContent.trim()).join('/')),
    brokenImgs: [...document.querySelectorAll('img')].filter(i => i.complete && i.currentSrc && i.naturalWidth === 0).map(i => i.currentSrc.slice(0, 110)),
    popFormId: (document.getElementById('tg-pop') || {}).getAttribute ? document.getElementById('tg-pop').getAttribute('data-form-id') : null,
    popHeading: (document.getElementById('tg-pop-h') || {}).textContent
  }));
  log(`${label} HOME ${JSON.stringify(home)}`);
  await page.screenshot({ path: `${out}/${label}-home.png` });
  await page.evaluate(() => document.querySelector('.tg-band[data-screen-label="Architectural Homes band"]').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${label}-home-band.png` });
  await page.waitForTimeout(31000);
  const pop = await page.evaluate(() => { const e = document.getElementById('tg-pop'); const r = e.getBoundingClientRect(); return { shown: !e.hidden && getComputedStyle(e).opacity > 0.5, right: Math.round(innerWidth - r.right), bottom: Math.round(innerHeight - r.bottom) }; });
  log(`${label} POPUP after 31s ${JSON.stringify(pop)}`);
  await page.screenshot({ path: `${out}/${label}-popup.png` });
  if (bad.length) log(`${label} home failed requests: ${bad.slice(0, 8).join(' | ')}`);
  await ctx.close();
  // service pages
  for (const [p, sel] of [['/services/architectural-homes', '.ah-next'], ['/services/development-collaborations', '.nx-single'], ['/services/renovations', '.nx-boxes']]) {
    ({ ctx, page, bad } = await open(p, vp, label + ' ' + p));
    const r = await page.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 400) : 'MISSING'; }, sel);
    const pricing = await page.evaluate(() => /what specific homes cost/i.test(document.body.innerText));
    log(`${label} ${p} box: ${r}${p.includes('architectural') ? ' | old pricing CTA present: ' + pricing : ''}`);
    await page.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'center' }); }, sel);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${label}-${p.split('/').pop()}.png` });
    if (bad.length) log(`${label} ${p} failed requests: ${bad.slice(0, 6).join(' | ')}`);
    await ctx.close();
  }
  // rural guide
  ({ ctx, page, bad } = await open('/rural-building-guide', vp, label + ' guide'));
  const g = await page.evaluate(() => ({ title: document.title, robots: (document.querySelector('meta[name=robots]') || {}).content, count: (document.querySelector('.gb-count') || {}).textContent, imgs: [...document.querySelectorAll('.gb-book img')].filter(i => i.complete && i.naturalWidth > 0).length }));
  log(`${label} GUIDE ${JSON.stringify(g)}`);
  await page.screenshot({ path: `${out}/${label}-guide.png` });
  if (bad.length) log(`${label} guide failed requests: ${bad.slice(0, 6).join(' | ')}`);
  await ctx.close();
}
for (const f of ['/documents/rural-building-guide.pdf', '/documents/rural-guide/z13.jpg']) {
  const ctx = await browser.newContext(); const r = await ctx.request.get(SITE + f); log(`FILE ${f} ${r.status()} ${r.headers()['content-type']}`); await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
