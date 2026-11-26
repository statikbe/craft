#!/usr/bin/env python3
"""Builds the review page (one view per video) from scripts/*/script.md + walkthrough.md.
Usage: python3 build-review.py <out.html> [--external]
--external: copy the screenshots next to the page (shots/<folder>/<file>) instead of embedding them as base64, for
pages that would get too big (publish them as the artifact's supporting files)."""
import base64, json, os, re, shutil, sys

EXTERNAL = '--external' in sys.argv
OUT = [a for a in sys.argv[1:] if not a.startswith('--')][0]
SHOTS = []  # (published path, source path) when EXTERNAL

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'videos')
PARTS = {
    1: 'Aan de slag', 2: 'Een pagina maken', 3: 'Tekst en links', 4: 'De contentbuilder: rijen en kolommen',
    5: 'Afbeeldingen en bestanden', 6: 'Publiceren en samenwerken', 7: 'Vindbaarheid', 8: 'Navigatie en algemene inhoud',
    9: 'Nieuws en agenda', 10: 'Formulieren', 11: 'Gebruikers', 12: 'Meertaligheid', 13: 'Na de lancering',
}

def parse_script(text):
    lines = text.splitlines()
    title = lines[0].lstrip('# ').strip()
    meta, scenes, cur = [], [], None
    for ln in lines[1:]:
        m = re.match(r'^## (\d+)\.\s*(.*)', ln)
        if m:
            cur = {'caption': m.group(2).strip(), 'voice': '', 'screen': ''}
            scenes.append(cur)
        elif cur is None and ln.startswith('- '):
            meta.append(ln[2:])
        elif cur is not None and ln.startswith('Voice:'):
            cur['voice'] = ln[6:].strip()
        elif cur is not None and ln.startswith('Screen:'):
            cur['screen'] = ln[7:].strip()
        elif cur is not None and ln.strip() and cur['screen']:
            cur['screen'] += ' ' + ln.strip()
    return title, meta, scenes

def walkthrough(text, folder):
    # Screenshot placeholders: ![alt](screenshots/x.png) + <!-- screenshot: note --> → a figure; real files are embedded
    def fig(m):
        alt, src, note = m.group(1), m.group(2), (m.group(3) or '').strip()
        path = os.path.join(BASE, folder, src)
        if os.path.exists(path):
            if EXTERNAL:
                rel = f'shots/{folder}/{os.path.basename(src)}'
                dest = os.path.join(os.path.dirname(os.path.abspath(OUT)), rel)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                shutil.copyfile(path, dest)
                SHOTS.append(rel)
                img = rel
            else:
                img = 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
            return f'\n<figure class="shot real"><img src="{img}" alt="{alt}" loading="lazy"><figcaption>{alt}</figcaption></figure>\n'
        return (f'\n<figure class="shot"><div class="ph"><span class="ph-label">Screenshot</span>'
                f'<span class="ph-file">{os.path.basename(src)}</span></div><figcaption><strong>Alt:</strong> {alt}'
                + (f'<br><strong>Vastleggen:</strong> {note}' if note else '') + '</figcaption></figure>\n')
    text = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)\s*(?:<!--\s*screenshot:\s*(.*?)-->)?', fig, text, flags=re.S)
    text = re.sub(r'^# .*\n', '', text, count=1)
    return text

videos = []
for folder in sorted(os.listdir(BASE)):
    m = re.match(r'^(\d\d)-(\d\d)-', folder)
    if not m or not os.path.isdir(os.path.join(BASE, folder)):
        continue
    s = open(os.path.join(BASE, folder, 'script.md'), encoding='utf8').read()
    w = open(os.path.join(BASE, folder, 'walkthrough.md'), encoding='utf8').read()
    title, meta, scenes = parse_script(s)
    part, nr = int(m.group(1)), int(m.group(2))
    videos.append({'id': f'v{part}-{nr}', 'part': part, 'nr': nr, 'folder': folder, 'title': title, 'meta': meta,
                   'scenes': scenes, 'walk': walkthrough(w, folder),
                   'words': len(re.sub(r'<[^>]+>', ' ', w).split())})

tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'review-template.html'), encoding='utf8').read()
out = tpl.replace('/*DATA*/', json.dumps({'parts': PARTS, 'videos': videos}, ensure_ascii=False).replace('</', '<\\/'))
open(OUT, 'w', encoding='utf8').write(out)
print(len(videos), 'videos,', round(len(out) / 1024), 'KB', f'+ {len(SHOTS)} screenshots in shots/' if EXTERNAL else '')
if EXTERNAL:
    json.dump(SHOTS, open(os.path.join(os.path.dirname(os.path.abspath(OUT)), 'shots.json'), 'w'))
