import { chromium } from '/tmp/p/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = 'diagnostics/livesync'; fs.mkdirSync(out, { recursive: true });
const L = []; const log = s => { L.push(s); console.log(s); };
const SITE = 'https://www.thornegroup.co.nz';
const q = () => '?probe=' + Date.now();
const browser = await chromium.launch({ channel: 'chrome' });
const vis = p => p.evaluate(() => { const e = document.getElementById('tg-pop'); return !!e && !e.hidden && getComputedStyle(e).opacity > 0.5; });
async function ctxNew(vp) { const c = await browser.newContext({ viewport: vp }); await c.addInitScript(() => { try { sessionStorage.tgPreSeen = '1'; } catch (e) {} }); return c; }
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  // A: E-Newsletter button opens the pop-up, no navigation; then no automatic pop-up later in the session
  let ctx = await ctxNew(vp); let page = await ctx.newPage();
  page.on('pageerror', e => log(`${label} PAGEERROR ${e.message.slice(0, 160)}`));
  await page.goto(SITE + '/' + q(), { waitUntil: 'networkidle', timeout: 90000 });
  const home = await page.evaluate(() => {
    const band = document.querySelector('.tg-band[data-screen-label="Architectural Homes band"]'); const c = band.querySelector('.tg-band-copy').getBoundingClientRect(), m = band.querySelector('.tg-band-media').getBoundingClientRect();
    return { engine: [...document.scripts].map(s => s.src).find(s => s.includes('thorne-home-page54')) || '', heroBtn: (document.querySelector('.tg-hb-fill') || {}).textContent, panel: innerWidth > 750 ? (c.left > m.left + m.width / 2 ? 'right side' : 'left side') : 'below photo (phone)' };
  });
  log(`${label} HOME ${JSON.stringify(home)}`);
  await page.evaluate(() => document.querySelector('.tg-band[data-screen-label="Architectural Homes band"]').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500); await page.screenshot({ path: `${out}/${label}-band.png` });
  const url0 = page.url();
  await page.click('.tg-news-cta'); await page.waitForTimeout(900);
  log(`${label} E-NEWSLETTER click: pop-up shown ${await vis(page)}, same page ${page.url() === url0}, tabs ${ctx.pages().length}, cursor in ${await page.evaluate(() => document.activeElement.id)}, form id ${await page.evaluate(() => document.getElementById('tg-pop').getAttribute('data-form-id'))}`);
  await page.screenshot({ path: `${out}/${label}-newsletter-click.png` });
  await page.click('.tg-pop-x'); await page.waitForTimeout(600);
  await page.goto(SITE + '/about' + q(), { waitUntil: 'domcontentloaded', timeout: 90000 }); await page.waitForTimeout(36000);
  log(`${label} after using the button, automatic pop-up on next page within 36s: ${await vis(page)}`);
  await ctx.close();
  // B: automatic once per session
  ctx = await ctxNew(vp); page = await ctx.newPage();
  await page.goto(SITE + '/about' + q(), { waitUntil: 'domcontentloaded', timeout: 90000 }); await page.waitForTimeout(33000);
  const first = await vis(page);
  await page.click('.tg-pop-x').catch(() => {}); await page.waitForTimeout(600);
  await page.goto(SITE + '/projects' + q(), { waitUntil: 'domcontentloaded', timeout: 90000 }); await page.waitForTimeout(36000);
  log(`${label} automatic pop-up: first page after 33s ${first}, second page after 36s ${await vis(page)}`);
  await ctx.close();
}
const ctx = await ctxNew({ width: 1440, height: 900 }); const page = await ctx.newPage();
await page.goto(SITE + '/rural-building-guide' + q(), { waitUntil: 'networkidle', timeout: 90000 });
log(`GUIDE controls: ${await page.evaluate(() => [...document.querySelectorAll('.gb-ctrls > *')].map(e => e.textContent.trim() || e.getAttribute('aria-label')).join(' | '))}; download link present: ${await page.evaluate(() => !!document.querySelector('a[download], a[href$=".pdf"]'))}`);
await page.screenshot({ path: `${out}/guide.png` });
await ctx.close(); await browser.close();
fs.writeFileSync(`${out}/report.txt`, L.join('\n') + '\n');
