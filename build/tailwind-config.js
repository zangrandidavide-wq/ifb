// Config Tailwind di una pagina, a partire da build/pages.js.
const fs = require('fs');
const path = require('path');
const PAGES = require('./pages');

const ROOT = path.join(__dirname, '..');
const PLUGINS = {
    'forms': require('@tailwindcss/forms'),
    'container-queries': require('@tailwindcss/container-queries'),
};

// Blocchi <style data-inline="..."> che la build riempie: vanno svuotati prima di
// cercare le classi, altrimenti Tailwind leggerebbe il CSS già generato.
const INLINE_BLOCK = /(<style\b[^>]*\bdata-inline="([^"]+)"[^>]*>)[\s\S]*?(<\/style>)/g;
const stripInline = html => html.replace(INLINE_BLOCK, '$1$3');

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

function configFor(name) {
    const page = PAGES[name];
    if (!page) throw new Error(`Pagina sconosciuta: "${name}" (vedi build/pages.js)`);
    const html = path.join(ROOT, `${name}.html`);
    const { plugins, ...config } = page;
    return {
        ...config,
        content: [
            { raw: stripInline(fs.readFileSync(html, 'utf8')), extension: 'html' },
            ...localScripts(html),
        ],
        plugins: plugins.map(p => PLUGINS[p]),
    };
}

module.exports = { configFor, localScripts, INLINE_BLOCK, ROOT };
