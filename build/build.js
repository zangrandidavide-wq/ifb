// Build del CSS del sito. Per ogni pagina (elenco in build/pages.js):
// - compila il CSS Tailwind con le sole classi usate dalla pagina e dagli script che carica;
// - riempie i blocchi <style data-inline="..."> della pagina:
//     data-inline="tailwind"          -> il CSS Tailwind appena compilato
//     data-inline="percorso/file.css" -> il contenuto (minificato) di quel file
//   Il CSS inline non richiede download separati, quindi non blocca il rendering.
//
//   npm run build:css   -> compila tutte le pagine
//   npm run watch:css   -> ricompila in automatico le pagine mentre le modifichi
//
// Non modificare a mano il contenuto dei blocchi data-inline: viene sovrascritto.
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const PAGES = require('./pages');
const { configFor, localScripts, INLINE_BLOCK, ROOT } = require('./tailwind-config');

const TAILWIND_INPUT = '@tailwind base;@tailwind components;@tailwind utilities;';

// Minificazione senza trasformazioni "approssimate": i colori restano identici
// (colormin li arrotonderebbe in hsla).
const minify = () => require('cssnano')({
    preset: ['default', { colormin: false, minifyGradients: false, svgo: false }],
});

const pageFile = name => path.join(ROOT, `${name}.html`);
const inlineKeys = html => [...html.matchAll(INLINE_BLOCK)].map(m => m[2]);
const inlineFiles = html => inlineKeys(html).filter(f => f !== 'tailwind');

// Gli url() relativi di un file CSS (es. fonts/x.css -> url(x.woff2)) vanno riscritti
// rispetto alla pagina in cui il CSS viene inserito (-> url(fonts/x.woff2)).
function rebaseUrls(css, cssFile, htmlFile) {
    return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, url) => {
        if (/^(data:|[a-z]+:|\/|#)/i.test(url)) return m;
        const rebased = path.relative(path.dirname(htmlFile), path.join(path.dirname(cssFile), url));
        return `url(${q}${rebased.split(path.sep).join('/')}${q})`;
    });
}

async function buildPage(name) {
    const file = pageFile(name);
    const html = fs.readFileSync(file, 'utf8');
    if (!inlineKeys(html).includes('tailwind')) {
        throw new Error(`${name}.html: manca <style data-inline="tailwind"></style> nell'<head>`);
    }
    const css = { tailwind: (await postcss([tailwindcss(configFor(name)), autoprefixer, minify()])
        .process(TAILWIND_INPUT, { from: undefined })).css };
    for (const f of inlineFiles(html)) {
        const src = path.join(ROOT, f);
        if (!fs.existsSync(src)) throw new Error(`${name}.html: file inline inesistente "${f}"`);
        css[f] = (await postcss([minify()]).process(rebaseUrls(fs.readFileSync(src, 'utf8'), src, file), { from: src })).css;
    }
    const out = html.replace(INLINE_BLOCK, (_, open, key, close) => open + css[key] + close);
    if (out !== html) fs.writeFileSync(file, out);
    return out !== html;
}

// Avvisa se nel sito compare il nome di un'icona che non è nei font ridotti (fonts/).
function checkIcons() {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'icone.json'), 'utf8'));
    const files = fs.readdirSync(ROOT).filter(f => /\.(html|js|css)$/.test(f))
        .concat(fs.readdirSync(path.join(ROOT, 'tornei')).map(f => `tornei/${f}`));
    const tokens = new Set();
    for (const f of files) {
        const text = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(INLINE_BLOCK, '$1$3');
        for (const t of text.match(/[a-z0-9_]+/g) || []) tokens.add(t);
    }
    for (const [font, { incluse, disponibili }] of Object.entries(data)) {
        const have = new Set(incluse);
        const missing = disponibili.filter(n => tokens.has(n) && !have.has(n));
        if (missing.length) {
            console.warn(`\n⚠  Icone non incluse nel font ${font}: ${missing.join(', ')}`);
            console.warn('   Lancia "npm run build:icone" per aggiornare i font delle icone (vedi README).\n');
        }
    }
}

async function buildAll() {
    const changed = [];
    for (const name of Object.keys(PAGES)) if (await buildPage(name)) changed.push(name);
    console.log(`CSS aggiornato in ${changed.length} pagine su ${Object.keys(PAGES).length}` +
        (changed.length ? `: ${changed.join(', ')}` : ''));
    checkIcons();
}

function watch() {
    const deps = name => {
        const html = pageFile(name);
        return new Set([html, ...localScripts(html),
            ...inlineFiles(fs.readFileSync(html, 'utf8')).map(f => path.join(ROOT, f))]);
    };
    let timer = null;
    const pending = new Set();
    const onChange = dir => (event, f) => {
        if (!f || !/\.(html|js|css)$/.test(f)) return;
        pending.add(path.join(dir, f));
        clearTimeout(timer);
        timer = setTimeout(async () => {
            const files = [...pending];
            pending.clear();
            for (const name of Object.keys(PAGES)) {
                const d = deps(name);
                if (!files.some(f => d.has(f))) continue;
                try {
                    if (await buildPage(name)) console.log(`aggiornato ${name}.html`);
                } catch (e) { console.error(e.message); }
            }
        }, 200);
    };
    for (const dir of [ROOT, path.join(ROOT, 'tornei'), path.join(ROOT, 'fonts')]) fs.watch(dir, onChange(dir));
    console.log('In ascolto delle modifiche (Ctrl+C per uscire)...');
}

buildAll()
    .then(() => { if (process.argv.includes('--watch')) watch(); })
    .catch(e => { console.error(e.message || e); process.exit(1); });
