// Compila il CSS Tailwind di ogni pagina in tailwind-<pagina>.css (nella root,
// accanto alle pagine: così gli url() relativi delle classi tipo bg-[url('foto.webp')]
// si risolvono come prima).
//   npm run build:css   -> compila tutte le pagine (minificato)
//   npm run watch:css   -> ricompila automaticamente mentre modifichi le pagine
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const PAGES = require('./pages');

const ROOT = path.join(__dirname, '..');
const CONFIG = path.join(__dirname, 'tailwind.config.js');
const INPUT = path.join(__dirname, 'input.css');
const output = name => path.join(ROOT, `tailwind-${name}.css`);

// Minificazione senza trasformazioni "approssimate": i colori restano identici
// a quelli che generava il CDN (colormin li arrotonderebbe in hsla).
const minify = () => require('cssnano')({
    preset: ['default', { colormin: false, minifyGradients: false, svgo: false }],
});

async function build() {
    const postcss = require('postcss');
    const tailwindcss = require('tailwindcss');
    const autoprefixer = require('autoprefixer');
    const input = fs.readFileSync(INPUT, 'utf8');
    for (const name of Object.keys(PAGES)) {
        process.env.TW_PAGE = name;
        delete require.cache[CONFIG];
        const { css } = await postcss([tailwindcss(require(CONFIG)), autoprefixer, minify()])
            .process(input, { from: INPUT, to: output(name) });
        fs.writeFileSync(output(name), css);
    }
    console.log(`CSS compilato per ${Object.keys(PAGES).length} pagine`);
}

function watch() {
    const cli = require.resolve('tailwindcss/lib/cli.js');
    for (const name of Object.keys(PAGES)) {
        const child = spawn(process.execPath, [cli, '-c', CONFIG, '-i', INPUT, '-o', output(name), '--watch'], {
            cwd: ROOT,
            env: { ...process.env, TW_PAGE: name },
            stdio: ['ignore', 'inherit', 'pipe'],
        });
        child.stderr.on('data', d => process.stderr.write(`[${name}] ${d}`));
    }
}

if (process.argv.includes('--watch')) watch();
else build().catch(e => { console.error(e); process.exit(1); });
