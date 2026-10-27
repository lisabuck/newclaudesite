import fs from 'fs';
const out = 'diagnostics/livesync/proc3'; fs.mkdirSync(out, { recursive: true });
const URLS = ["https://static.wixstatic.com/media/b2375c_00ae9c1519984a5b948de996e25c7f3c~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_e0d5d5f8178541ac9e30fb42cb2700cc~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg"];
const L = [];
for (let i = 0; i < URLS.length; i++) {
  try { const r = await fetch(URLS[i]); const b = Buffer.from(await r.arrayBuffer()); fs.writeFileSync(`${out}/${String(i + 1).padStart(2, '0')}.jpg`, b); L.push(`${i + 1} ${r.status} ${b.length}`); }
  catch (e) { L.push(`${i + 1} ERR ${e.message}`); }
}
fs.writeFileSync('diagnostics/livesync/report.txt', L.join('\n') + '\n');
