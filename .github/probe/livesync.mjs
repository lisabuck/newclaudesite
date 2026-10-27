import fs from 'fs';
const out = 'diagnostics/livesync/proc'; fs.mkdirSync(out, { recursive: true });
const URLS = ["https://static.wixstatic.com/media/b2375c_ae9ee23419f446479ba4a6adaf5bd50f~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_20efe99371704e3f942f240180e49d96~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_b83542c653a8446394a0a7f9e7b2c29b~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_c46c6927effa4f0db72de39115f08181~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_618f94572ecf441caf07f75db87c7b5d~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_c5ed6abd028143e49255a78721ddef76~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_bdadd0a0b6bb4d58b71dedfe64e09241~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg", "https://static.wixstatic.com/media/b2375c_50c35f23740d479fa4cea38b82dc9da7~mv2.jpg/v1/fit/w_480,h_480,q_80/p.jpg"];
const L = [];
for (let i = 0; i < URLS.length; i++) {
  try { const r = await fetch(URLS[i]); const b = Buffer.from(await r.arrayBuffer()); fs.writeFileSync(`${out}/${String(i + 1).padStart(2, '0')}.jpg`, b); L.push(`${i + 1} ${r.status} ${b.length}`); }
  catch (e) { L.push(`${i + 1} ERR ${e.message}`); }
}
fs.writeFileSync('diagnostics/livesync/report.txt', L.join('\n') + '\n');
