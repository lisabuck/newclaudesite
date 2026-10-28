import itertools, io, urllib.request, sys
from PIL import Image
import imagehash
ids = [l.strip() for l in open('.github/probe/pic-ids.txt') if l.strip()]
names = ['p%d' % (i + 1) if i < 7 else 't%d' % (i - 6) for i in range(len(ids))]
hs = {}
for n, i in zip(names, ids):
    h, _, ext = i.partition('.'); ext = ext or 'jpg'
    f = 'b2375c_%s~mv2.%s' % (h, ext)
    url = 'https://static.wixstatic.com/media/%s/v1/fit/w_400,h_400,q_85/%s' % (f, f)
    try:
        im = Image.open(io.BytesIO(urllib.request.urlopen(url, timeout=30).read())).convert('RGB')
        hs[n] = (imagehash.phash(im), imagehash.dhash(im), im.size, h[:8])
        print('OK', n, h[:8], im.size, 'landscape' if im.size[0] > im.size[1] else 'portrait' if im.size[0] < im.size[1] else 'square')
    except Exception as e:
        print('FAIL', n, h[:8], e)
print('--- likely doubles (phash, dhash distance) ---')
for a, b in itertools.combinations(hs, 2):
    dp, dd = hs[a][0] - hs[b][0], hs[a][1] - hs[b][1]
    if dp <= 12 or dd <= 10:
        print('PAIR', a, hs[a][3], b, hs[b][3], dp, dd)
