"""Rigenera i font delle icone (fonts/material-*.woff2) con le sole icone usate dal sito.

I font completi pesano 130 KB - 1,1 MB; ridotti alle icone usate pesano pochi KB.
Lo script cerca nei file del sito (html, js, css) tutte le parole che sono nomi di
icone e scarica/crea i font con solo quelle.

Uso (serve Python 3 e: pip install fonttools brotli):
    npm run build:icone
"""
import glob
import io
import json
import os
import re
import urllib.parse
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FONTS = os.path.join(ROOT, 'fonts')
# Google sceglie il formato del font in base al browser: chiediamo woff2 come Chrome
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36')

MATERIAL_ICONS = 'https://fonts.googleapis.com/icon?family=Material+Icons'
SYMBOLS = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:'
# Varianti di Material Symbols usate dalle pagine -> file locale
SYMBOLS_VARIANTS = {
    'wght,FILL@100..700,0..1': 'material-symbols-outlined.woff2',
    'opsz,wght,FILL,GRAD@24,400,0,0': 'material-symbols-outlined-24-400.woff2',
}


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req) as r:
        return r.read()


def font_from_css(css_url):
    css = get(css_url).decode()
    return get(re.search(r'url\(([^)]+)\)', css).group(1))


def ligatures(font):
    """Nome icona -> glyph, letti dalla tabella delle legature del font."""
    cmap = {g: chr(c) for c, g in font.getBestCmap().items()}
    out = {}
    for lookup in font['GSUB'].table.LookupList.Lookup:
        for st in lookup.SubTable:
            if lookup.LookupType == 7:
                st = st.ExtSubTable
            if getattr(st, 'LookupType', None) != 4:
                continue
            for first, ligs in st.ligatures.items():
                for lig in ligs:
                    try:
                        out[''.join(cmap[g] for g in [first] + lig.Component)] = lig.LigGlyph
                    except KeyError:
                        pass
    return out


def site_words():
    files = [f for pattern in ('*.html', '*.js', '*.css', 'tornei/*')
             for f in glob.glob(os.path.join(ROOT, pattern))]
    words = set()
    for f in files:
        text = open(f, encoding='utf-8').read()
        # il CSS inline generato dalla build non conta
        text = re.sub(r'(<style\b[^>]*\bdata-inline="[^"]+"[^>]*>)[\s\S]*?(</style>)', r'\1\2', text)
        words |= set(re.findall(r'[a-z0-9_]+', text))
    return words


def main():
    words = site_words()
    report = {}

    # Material Icons: Google non sa ridurlo, lo riduciamo noi con fonttools
    full = TTFont(io.BytesIO(font_from_css(MATERIAL_ICONS)))
    ligs = ligatures(full)
    wanted = sorted(w for w in words if w in ligs)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.layout_closure = False  # altrimenti tornerebbero tutte le icone componibili con le lettere
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.notdef_outline = True
    opts.glyph_names = True
    opts.hinting = True
    sub = subset.Subsetter(opts)
    letters = [c for c in full.getBestCmap() if not (0xE000 <= c <= 0xF8FF or c >= 0xF0000)]
    sub.populate(glyphs=[ligs[w] for w in wanted], unicodes=letters)
    sub.subset(full)
    full.save(os.path.join(FONTS, 'material-icons.woff2'))
    report['Material Icons'] = {'incluse': wanted, 'disponibili': sorted(ligs)}
    print(f'Material Icons: {len(wanted)} icone')

    # Material Symbols: Google crea direttamente il font ridotto (parametro icon_names)
    ligs = ligatures(TTFont(io.BytesIO(font_from_css(SYMBOLS + next(iter(SYMBOLS_VARIANTS))))))
    wanted = sorted(w for w in words if w in ligs)
    for axes, filename in SYMBOLS_VARIANTS.items():
        url = SYMBOLS + axes + '&icon_names=' + urllib.parse.quote(','.join(wanted), safe=',')
        data = font_from_css(url)
        missing = [w for w in wanted if w not in ligatures(TTFont(io.BytesIO(data)))]
        if missing:
            raise SystemExit(f'{filename}: Google non ha incluso {missing}')
        open(os.path.join(FONTS, filename), 'wb').write(data)
    report['Material Symbols Outlined'] = {'incluse': wanted, 'disponibili': sorted(ligs)}
    print(f'Material Symbols Outlined: {len(wanted)} icone')

    with open(os.path.join(ROOT, 'build', 'icone.json'), 'w') as f:
        json.dump(report, f, indent=0)
    print('Fatto. Ora lancia "npm run build:css" e committa i file in fonts/ e build/icone.json.')


if __name__ == '__main__':
    main()
