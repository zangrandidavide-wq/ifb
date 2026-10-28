// Galleria foto dei tornei (foto.html).
// Le foto le pubblica scripts/sync-foto.mjs su Cloudflare R2: qui si leggono solo i manifest JSON.
//   foto.html              → elenco degli album (index.json)
//   foto.html?album=<slug> → griglia di miniature (albums/<slug>.json), lightbox PhotoSwipe al clic
//   …#foto-12              → apre direttamente la foto 12 (link condivisibile)

import { esc, dataLunga } from './tornei/config.js';

const params = new URLSearchParams(location.search);
// In locale si può puntare a una copia dei manifest: foto.html?base=/percorso
const BASE = (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && params.get('base')) || 'https://foto.ifollowbv.it';
const PSWP = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/';

const app = document.getElementById('foto-app');
const mini = (k) => `${BASE}/t/${k}.webp`;
const grande = (k) => `${BASE}/l/${k}.webp`;

async function carica(path) {
    const res = await fetch(`${BASE}/${path}`);
    // Prima della prima sincronizzazione index.json non esiste ancora: nessun album
    if (res.status === 404 && path === 'index.json') return { album: [] };
    if (!res.ok) throw new Error(res.status);
    return res.json();
}

const luogo = (a) => a.luogo ? `<span class="inline-flex items-center gap-1"><span class="material-symbols-outlined text-[1.1em]" aria-hidden="true">location_on</span>${esc(a.luogo)}</span>` : '';

function nFoto(n) {
    return n === 1 ? '1 foto' : `${n} foto`;
}

function renderVuoto(icona, titolo, testo, link = '') {
    app.innerHTML = `
        <div class="max-w-md mx-auto text-center py-20">
            <span class="material-symbols-outlined text-6xl text-secondary" aria-hidden="true">${icona}</span>
            <p class="mt-4 font-poster uppercase text-4xl">${titolo}</p>
            <p class="mt-3 text-white/70">${testo}</p>
            ${link}
        </div>`;
}

const LINK_ALBUM = `<a href="foto.html" class="mt-8 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 px-6 py-3 rounded-full font-bold transition-colors">
    <span class="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span> Tutti gli album</a>`;

// ─── Elenco album ─────────────────────────────────────────────────────────
function renderElenco({ album }) {
    if (!album.length) {
        renderVuoto('photo_camera', 'Presto online', 'Le foto del prossimo torneo arriveranno qui pochi giorni dopo l\'evento.');
        return;
    }
    app.innerHTML = `
        <div class="mb-12 md:mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
                <p class="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-full pl-3 pr-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-secondary">
                    <span class="material-symbols-outlined text-base" aria-hidden="true">photo_camera</span> Staff media IFB
                </p>
                <h1 class="mt-5 font-poster uppercase leading-[0.88] text-[clamp(3.5rem,11vw,8.5rem)]">
                    <span class="text-outline-white">Le foto</span><br />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-[#ff8a1f] to-[#ff4fa3]">dei tornei</span>
                </h1>
            </div>
            <p class="max-w-xs text-white/70 text-lg leading-snug">Ritrovati in campo: <b class="text-white">${album.length === 1 ? 'un album' : `${album.length} album`}</b>, torneo per torneo.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            ${album.map((a, i) => `
                <a href="?album=${encodeURIComponent(a.slug)}" class="group relative block aspect-[4/3] rounded-[2rem] overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-secondary/60 shadow-xl transition-all duration-300 hover:-translate-y-1 animate-card-in" style="animation-delay:${Math.min(i, 8) * 60}ms">
                    <img src="${mini(a.cover.k)}" alt="" width="${a.cover.w}" height="${a.cover.h}" ${i > 2 ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true"></div>
                    <span class="absolute top-4 right-4 inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full">
                        <span class="material-symbols-outlined text-sm" aria-hidden="true">photo</span> ${nFoto(a.n)}
                    </span>
                    <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <p class="text-xs font-bold uppercase tracking-[0.2em] text-secondary">${esc(dataLunga(a.data))}</p>
                        <h2 class="mt-1 font-poster uppercase text-3xl leading-[0.95]">${esc(a.titolo)}</h2>
                        ${a.luogo ? `<p class="mt-1.5 text-sm font-semibold text-white/80">${luogo(a)}</p>` : ''}
                    </div>
                </a>`).join('')}
        </div>`;
}

// ─── Album ────────────────────────────────────────────────────────────────
function renderAlbum(a) {
    document.title = `${a.titolo}: foto | I Follow Beach Volley`;
    app.innerHTML = `
        <a href="foto.html" class="inline-flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-secondary transition-colors">
            <span class="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span> Tutti gli album
        </a>
        <div class="mt-6 mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-secondary">${esc(dataLunga(a.data))}</p>
                <h1 class="mt-2 font-poster uppercase leading-[0.9] text-[clamp(2.75rem,8vw,6rem)]">${esc(a.titolo)}</h1>
                ${a.luogo ? `<p class="mt-3 text-lg font-semibold text-white/80">${luogo(a)}</p>` : ''}
            </div>
            <p class="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 rounded-full px-4 py-2 text-sm font-bold">
                <span class="material-symbols-outlined text-lg text-secondary" aria-hidden="true">photo</span> ${nFoto(a.foto.length)}
            </p>
        </div>
        <div id="griglia" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-2">
            ${a.foto.map((f, i) => `
                <a href="${grande(f.k)}" data-i="${i}" class="group relative block aspect-square overflow-hidden rounded-md sm:rounded-[10px] bg-white/5">
                    <img src="${mini(f.k)}" alt="${esc(a.titolo)}, foto ${i + 1}" width="${f.w}" height="${f.h}" ${i > 14 ? 'loading="lazy"' : ''} decoding="async"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </a>`).join('')}
        </div>
        <p class="mt-10 text-sm text-white/50 max-w-xl">Sei in una foto e preferisci che venga tolta? Scrivici indicando l'album e il numero della foto: trovi come fare nella <a href="privacy.html#foto" class="underline hover:text-secondary">privacy</a>.</p>`;

    const griglia = document.getElementById('griglia');
    griglia.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-i]');
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        apriLightbox(a, Number(link.dataset.i), griglia);
    });

    const m = location.hash.match(/^#foto-(\d+)$/);
    if (m && a.foto[m[1] - 1]) apriLightbox(a, m[1] - 1, griglia);
}

// PhotoSwipe si scarica solo al primo clic: chi guarda solo la griglia non lo paga
let caricaPhotoSwipe;
function photoSwipe() {
    caricaPhotoSwipe ??= Promise.all([
        import(`${PSWP}photoswipe.esm.min.js`),
        new Promise((ok) => {
            const css = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${PSWP}photoswipe.css`, onload: ok, onerror: ok });
            document.head.append(css);
        }),
    ]).then(([mod]) => mod.default);
    return caricaPhotoSwipe;
}

async function apriLightbox(a, index, griglia) {
    const PhotoSwipe = await photoSwipe();
    const pswp = new PhotoSwipe({
        dataSource: a.foto.map((f, i) => ({ src: grande(f.k), msrc: mini(f.k), width: f.w, height: f.h, alt: `${a.titolo}, foto ${i + 1}` })),
        index,
        bgOpacity: 0.96,
        showHideAnimationType: 'zoom',
        imageClickAction: 'zoom-or-close',
        tapAction: 'toggle-controls',
        closeTitle: 'Chiudi', zoomTitle: 'Zoom', arrowPrevTitle: 'Precedente', arrowNextTitle: 'Successiva',
        errorMsg: 'Impossibile caricare la foto',
    });

    // Animazione di apertura/chiusura dalla miniatura nella griglia
    pswp.addFilter('thumbEl', (el, data, i) => griglia.querySelector(`[data-i="${i}"] img`) || el);

    pswp.on('uiRegister', () => {
        pswp.ui.registerElement({
            name: 'scarica',
            order: 8,
            isButton: true,
            title: 'Scarica',
            html: '<span class="material-symbols-outlined" aria-hidden="true">download</span>',
            onClick: () => scarica(a, pswp.currIndex),
        });
    });

    // Il link nella barra degli indirizzi punta alla foto aperta, così si può condividere
    pswp.on('change', () => history.replaceState(null, '', `#foto-${pswp.currIndex + 1}`));
    pswp.on('close', () => history.replaceState(null, '', location.pathname + location.search));
    pswp.init();
    history.replaceState(null, '', `#foto-${index + 1}`);
}

async function scarica(a, i) {
    const nome = `IFB ${a.titolo} ${i + 1}.webp`;
    try {
        const blob = await (await fetch(grande(a.foto[i].k))).blob();
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement('a'), { href: url, download: nome }).click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
        window.open(grande(a.foto[i].k), '_blank', 'noopener');
    }
}

// ─── Avvio ────────────────────────────────────────────────────────────────
const slug = params.get('album');
try {
    if (slug) renderAlbum(await carica(`albums/${encodeURIComponent(slug)}.json`));
    else renderElenco(await carica('index.json'));
} catch (e) {
    console.error(e);
    if (slug) renderVuoto('search_off', 'Album non trovato', 'Forse è stato rinominato o non è più online.', LINK_ALBUM);
    else renderVuoto('cloud_off', 'Foto non disponibili', 'Non riusciamo a caricare gli album in questo momento. Riprova tra poco.');
}
