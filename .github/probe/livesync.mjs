import fs from 'fs';
const out = 'diagnostics/livesync/proc2'; fs.mkdirSync(out, { recursive: true });
const URLS = ["https://static.wixstatic.com/media/b2375c_1c8bb5882e124aaa9fb80ee64c5fd9b5~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_fa5aa998cdd846dba68d503cf06a382b~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_bf9767de7fb540e092fce8ce7840b078~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_cd2fa2239e4546808be129a3a1c9ea3b~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_70854ba20b7d4ce4ae68d390bd3e5cb1~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg"];
const L = [];
for (let i = 0; i < URLS.length; i++) {
  try { const r = await fetch(URLS[i]); const b = Buffer.from(await r.arrayBuffer()); fs.writeFileSync(`${out}/${String(i + 1).padStart(2, '0')}.jpg`, b); L.push(`${i + 1} ${r.status} ${b.length}`); }
  catch (e) { L.push(`${i + 1} ERR ${e.message}`); }
}
fs.writeFileSync('diagnostics/livesync/report.txt', L.join('\n') + '\n');
