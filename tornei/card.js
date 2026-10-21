// Card "biglietto" di un torneo: la usano tornei.html e l'anteprima in gestione-tornei.html,
// così gli organizzatori vedono esattamente quello che vedrà il pubblico.
import { locandinaUrl, SESSO, formula, dataOra, esc } from './config.js';

// Colore di ogni categoria (accento della card)
export const COLORE_SESSO = { maschile: '#38bdf8', femminile: '#ff4fa3', misto: '#FFD700' };

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const GIORNI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

export function statoTorneo(t) {
    const mancano = new Date(t.chiusura_iscrizioni) - Date.now();
    const posti = t.max_squadre ? t.max_squadre - t.squadre_iscritte : null;
    if (mancano <= 0) return { aperto: false, label: 'Iscrizioni chiuse', timbro: 'Chiuso' };
    if (posti !== null && posti <= 0) return { aperto: false, label: 'Posti esauriti', timbro: 'Sold out' };
    if (mancano < 48 * 3600e3) return { aperto: true, scade: true, urgenza: mancano < 24 * 3600e3 ? 'Ultime ore!' : 'Chiude a breve' };
    if (posti !== null && posti <= 3) return { aperto: true, urgenza: posti === 1 ? 'Ultimo posto!' : `Ultimi ${posti} posti` };
    return { aperto: true };
}

// "2g 14h 05m" fino alla chiusura delle iscrizioni
export function countdown(iso) {
    const ms = new Date(iso) - Date.now();
    if (ms <= 0) return 'Chiuse';
    const m = Math.floor(ms / 60000);
    const g = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = String(m % 60).padStart(2, '0');
    return g > 0 ? `${g}g ${h}h ${mm}m` : `${h}h ${mm}m`;
}

// Aggiorna i conti alla rovescia presenti in una porzione di pagina
export function aggiornaCountdown(root = document) {
    root.querySelectorAll('[data-countdown]').forEach((el) => { el.textContent = countdown(el.dataset.countdown); });
}

function dataBlocco(isoDate, grande) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const giorno = GIORNI[new Date(y, m - 1, d).getDay()];
    return `
        <div class="shrink-0 rounded-2xl bg-white text-gray-900 overflow-hidden text-center shadow-xl ${grande ? 'w-20' : 'w-16'}">
            <div class="text-[10px] font-black uppercase tracking-[0.2em] py-1 text-gray-900" style="background:var(--acc)">${MESI[m - 1]}</div>
            <div class="font-poster leading-none pt-1.5 ${grande ? 'text-5xl' : 'text-4xl'}">${d}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-gray-500 pb-1.5">${giorno}</div>
        </div>`;
}

function locandina(t, img, stato) {
    const media = img
        ? `<img src="${esc(img)}" alt="Locandina: ${esc(t.titolo)}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${stato.aperto ? '' : 'grayscale'}" />`
        : `<div class="t-art absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
               <span class="font-poster text-outline-white text-[9rem] leading-none opacity-70 -rotate-6 select-none">${esc(formula(t.giocatori_per_squadra).replace('x', '×'))}</span>
           </div>`;
    return media;
}

/**
 * @param t torneo come restituito da tornei_pubblici()
 * @param opts.evidenza  card larga per il prossimo torneo
 * @param opts.img       sovrascrive la locandina (anteprima nell'editor)
 * @param opts.anteprima disattiva il pulsante
 */
export function cardTorneo(t, opts = {}) {
    const stato = statoTorneo(t);
    const img = opts.img ?? locandinaUrl(t.locandina_path);
    const acc = COLORE_SESSO[t.sesso] || '#FFD700';
    const ev = !!opts.evidenza;
    const pct = t.max_squadre ? Math.min(100, Math.round((t.squadre_iscritte / t.max_squadre) * 100)) : 0;
    const formulaTxt = formula(t.giocatori_per_squadra).replace('x', '×');

    const badge = `
        <div class="flex flex-col items-end gap-2">
            <span class="font-poster text-3xl leading-none bg-secondary text-gray-900 px-3 py-1.5 rounded-xl shadow-lg -rotate-3">${esc(formulaTxt)}</span>
            <span class="text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full text-gray-900 shadow" style="background:var(--acc)">${esc(SESSO[t.sesso] || t.sesso)}</span>
        </div>`;

    const urgenza = stato.urgenza
        ? `<span class="inline-flex items-center gap-2 bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full shadow-lg shadow-red-500/40">
               <span class="relative flex w-2 h-2"><span class="t-ping absolute inset-0 rounded-full bg-white"></span><span class="relative w-2 h-2 rounded-full bg-white"></span></span>${esc(stato.urgenza)}</span>`
        : '';

    const timbro = stato.timbro
        ? `<div class="absolute inset-0 flex items-center justify-center bg-black/30"><span class="t-stamp font-poster uppercase text-4xl text-white px-5 py-2 rounded-xl">${esc(stato.timbro)}</span></div>`
        : '';

    const posti = t.max_squadre
        ? `<div>
               <div class="flex items-baseline justify-between text-sm">
                   <span class="font-bold text-white/60 uppercase tracking-wider text-[11px]">Squadre</span>
                   <span><span class="font-poster text-2xl text-white">${t.squadre_iscritte}</span><span class="font-poster text-lg text-white/40"> / ${t.max_squadre}</span></span>
               </div>
               <div class="mt-1.5 h-2.5 rounded-full bg-white/10 overflow-hidden"><div class="t-bar h-full rounded-full" style="width:${Math.max(pct, 4)}%"></div></div>
           </div>`
        : `<div class="flex items-center gap-3">
               <span class="font-poster text-3xl text-white leading-none">${t.squadre_iscritte}</span>
               <span class="text-[11px] font-bold uppercase tracking-wider text-white/60 leading-tight">${t.squadre_iscritte === 1 ? 'squadra<br>già iscritta' : 'squadre<br>già iscritte'}</span>
           </div>`;

    const cta = stato.aperto
        ? `<button type="button" data-iscriviti="${esc(t.id)}" ${opts.anteprima ? 'tabindex="-1"' : ''}
               class="t-shine group/btn w-full inline-flex items-center justify-center gap-3 bg-secondary text-gray-900 font-poster uppercase text-xl tracking-wide px-6 py-4 rounded-2xl shadow-[0_12px_30px_-10px_rgba(255,215,0,.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(255,215,0,.9)] active:translate-y-0">
               Iscrivi la squadra
               <span class="w-8 h-8 rounded-full bg-gray-900 text-secondary flex items-center justify-center transition-transform group-hover/btn:translate-x-1 group-hover/btn:-rotate-45">
                   <span class="material-icons text-lg" aria-hidden="true">arrow_forward</span></span>
           </button>`
        : `<div class="w-full text-center font-poster uppercase text-xl tracking-wide px-6 py-4 rounded-2xl bg-white/5 text-white/40 border border-white/10">${esc(stato.label)}</div>`;

    const scadenza = `
        <div class="flex items-end justify-between gap-3">
            <div>
                <p class="text-[11px] font-bold uppercase tracking-wider text-white/60">${stato.aperto ? 'Iscrizioni chiudono tra' : 'Iscrizioni'}</p>
                <p class="font-poster text-2xl leading-tight tabular-nums ${stato.scade ? 'text-red-400' : 'text-white'}" ${stato.aperto ? `data-countdown="${esc(t.chiusura_iscrizioni)}"` : ''}>${stato.aperto ? countdown(t.chiusura_iscrizioni) : 'Chiuse'}</p>
                <p class="text-xs text-white/50">${esc(dataOra(t.chiusura_iscrizioni))}</p>
            </div>
            ${t.quota ? `<span class="text-right"><span class="block text-[11px] font-bold uppercase tracking-wider text-white/60">Quota</span><span class="block font-black text-white max-w-[9rem] leading-tight">${esc(t.quota)}</span></span>` : ''}
        </div>`;

    const descr = t.descrizione
        ? `<p class="text-sm text-white/70 whitespace-pre-line ${ev ? 'line-clamp-5' : 'line-clamp-2'}">${esc(t.descrizione)}</p>`
        : '';

    // In evidenza (schermi larghi): locandina a sinistra, informazioni a destra
    return `
        <article class="t-card group relative flex flex-col ${ev ? 'lg:col-span-2 lg:flex-row' : ''} rounded-[2rem] bg-[#21172d] text-white shadow-2xl shadow-black/40"
                 style="--acc:${acc}" ${opts.anteprima ? '' : 'data-tilt'}>
            <div class="relative ${ev ? 'aspect-[4/5] lg:aspect-auto lg:w-[46%] lg:shrink-0 lg:min-h-[580px]' : 'aspect-[4/5]'} overflow-hidden rounded-t-[2rem] ${ev ? 'lg:rounded-tr-none lg:rounded-l-[2rem]' : ''}">
                ${locandina(t, img, stato)}
                <div class="absolute inset-0 bg-gradient-to-t from-[#21172d] via-[#21172d]/20 to-black/30"></div>
                <div class="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
                    ${dataBlocco(t.data, ev)}
                    ${badge}
                </div>
                ${timbro}
                <div class="absolute left-5 right-5 bottom-5 ${ev ? 'lg:hidden' : ''}">
                    ${urgenza ? `<div class="mb-3">${urgenza}</div>` : ''}
                    <h3 class="font-poster uppercase text-[2rem] leading-[0.95] drop-shadow-lg">${esc(t.titolo)}</h3>
                    <p class="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-white/85"><span class="material-icons text-base" style="color:var(--acc)" aria-hidden="true">place</span>${esc(t.luogo)}</p>
                </div>
            </div>

            ${ev ? '' : '<div class="t-cut" aria-hidden="true"><span></span></div>'}

            <div class="flex flex-col flex-grow gap-5 p-5 sm:p-6 ${ev ? 'lg:p-10 lg:justify-center' : ''}">
                ${ev ? `
                <div class="hidden lg:block">
                    <p class="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em]" style="color:var(--acc)"><span class="w-6 h-px" style="background:var(--acc)"></span>Prossimo torneo</p>
                    ${urgenza ? `<div class="mt-4">${urgenza}</div>` : ''}
                    <h3 class="mt-3 font-poster uppercase text-6xl leading-[0.92]">${esc(t.titolo)}</h3>
                    <p class="mt-3 inline-flex items-center gap-1.5 font-bold text-white/85"><span class="material-icons text-lg" style="color:var(--acc)" aria-hidden="true">place</span>${esc(t.luogo)}</p>
                </div>` : ''}
                ${descr}
                ${scadenza}
                ${posti}
                <div class="mt-auto pt-1">${cta}</div>
            </div>
        </article>`;
}

// Leggera inclinazione 3D della card seguendo il puntatore (solo mouse, rispetta "riduci movimento")
export function attivaTilt(root) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
    root.addEventListener('pointermove', (ev) => {
        const card = ev.target.closest('[data-tilt]');
        if (!card) return;
        const r = card.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1100px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
    });
    root.addEventListener('pointerout', (ev) => {
        const card = ev.target.closest('[data-tilt]');
        if (card && !card.contains(ev.relatedTarget)) card.style.transform = '';
    });
}
