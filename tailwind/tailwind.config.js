// Config Tailwind usata da tailwind/build.js: la pagina da compilare arriva
// nella variabile d'ambiente TW_PAGE (es. TW_PAGE=index).
const fs = require('fs');
const path = require('path');
const PAGES = require('./pages');

const ROOT = path.join(__dirname, '..');
const PLUGINS = {
    'forms': require('@tailwindcss/forms'),
    'container-queries': require('@tailwindcss/container-queries'),
};

const name = process.env.TW_PAGE;
const page = PAGES[name];
if (!page) throw new Error(`TW_PAGE sconosciuta: "${name}" (vedi tailwind/pages.js)`);

// Script locali caricati da un file (<script src> e import), seguiti ricorsivamente,
// così le classi aggiunte via JavaScript (navbar, footer, card dei tornei...) finiscono nel CSS.
function localScripts(file, seen = new Set()) {
    const src = fs.readFileSync(file, 'utf8');
    const refs = file.endsWith('.html')
        ? [...src.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1])
        : [...src.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g)].map(m => m[1]);
    for (const ref of refs) {
        if (/^(https?:)?\/\//.test(ref)) continue;
        const dep = path.resolve(path.dirname(file), ref.split(/[?#]/)[0]);
        if (seen.has(dep) || !fs.existsSync(dep)) continue;
        seen.add(dep);
        localScripts(dep, seen);
    }
    return seen;
}

const html = path.join(ROOT, `${name}.html`);
const { plugins, ...config } = page;

module.exports = {
    ...config,
    content: [html, ...localScripts(html)],
    plugins: plugins.map(p => PLUGINS[p]),
};
