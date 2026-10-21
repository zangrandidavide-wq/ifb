// Calendario tornei di tornei.html: card dei tornei pubblicati e modulo di iscrizione.
// Parla con Supabase via fetch (senza libreria) per tenere la pagina leggera:
// le uniche due chiamate sono le funzioni tornei_pubblici() e iscrivi_torneo().
import { SUPABASE_URL, SUPABASE_ANON_KEY, locandinaUrl, SESSO, LIVELLO, barreLivello, formula, dataEOra, esc } from './config.js';
import { cardTorneo, statoTorneo, aggiornaCountdown, attivaTilt, COLORE_SESSO } from './card.js';

const grid = document.getElementById('tornei-grid');
const conteggio = document.getElementById('tornei-conteggio');
const dialog = document.getElementById('iscrizione-dialog');
let tornei = [];

async function rpc(name, body = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        // I messaggi di iscrivi_torneo() sono già scritti per chi si iscrive (P0001 = "raise exception")
        throw new Error(data?.code === 'P0001' ? data.message : 'Qualcosa è andato storto. Riprova tra poco.');
    }
    return data;
}

function renderVuoto(icona, titolo, testo) {
    grid.className = 'grid';
    grid.innerHTML = `
        <div class="rounded-[2rem] border-2 border-dashed border-white/15 px-6 py-16 text-center">
            <span class="material-symbols-outlined text-6xl text-secondary" aria-hidden="true">${icona}</span>
            <p class="mt-4 font-poster uppercase text-4xl text-white">${titolo}</p>
            <p class="mt-3 max-w-md mx-auto text-white/60">${testo}</p>
        </div>`;
}

async function carica() {
    try {
        tornei = await rpc('tornei_pubblici');
    } catch {
        renderVuoto('wifi_off', 'Calendario non disponibile', 'Non riusciamo a caricare i tornei in questo momento. Riprova tra poco o scrivici su <a class="text-secondary font-bold underline" href="https://wa.me/393494633610">WhatsApp</a>.');
        return;
    }
    const aperti = tornei.filter((t) => statoTorneo(t).aperto).length;
    if (conteggio) conteggio.textContent = aperti ? `${aperti} ${aperti === 1 ? 'torneo aperto' : 'tornei aperti'}` : 'Nuove date in arrivo';
    if (!tornei.length) {
        renderVuoto('sports_volleyball', 'Nuovi tornei in arrivo', 'Stiamo preparando i prossimi eventi: seguici su <a class="text-secondary font-bold underline" href="https://www.instagram.com/ifollowbv" target="_blank" rel="noopener">Instagram</a> per non perderli.');
        return;
    }
    // Tutti i tornei con lo stesso peso, affiancati nel carosello (in ordine di data)
    grid.className = '';
    grid.innerHTML = carosello(tornei);
    attivaCarosello();
}

// ─── Carosello ────────────────────────────────────────────────────────────
function carosello(lista) {
    const freccia = (dir, icona, label) => `
        <button type="button" data-car="${dir}" aria-label="${label}"
            class="w-12 h-12 rounded-full bg-white/10 hover:bg-secondary hover:text-gray-900 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white">
            <span class="material-icons" aria-hidden="true">${icona}</span></button>`;
    return `
        <div>
            <div class="flex items-end justify-between gap-4 mb-6">
                <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.25em] text-secondary">Calendario</p>
                    <h3 class="mt-1 font-poster uppercase text-4xl sm:text-5xl leading-none">Tutti i tornei <span class="text-white/30">${lista.length}</span></h3>
                </div>
                <div class="hidden sm:flex gap-2">${freccia('prev', 'arrow_back', 'Tornei precedenti')}${freccia('next', 'arrow_forward', 'Tornei successivi')}</div>
            </div>
            <div data-car-track tabindex="0" role="region" aria-label="Elenco dei tornei, scorri di lato"
                class="t-track flex gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-1 pt-2 pb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-[2rem]">
                ${lista.map((t) => `<div class="snap-start shrink-0 w-[84%] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3rem)/3)]">${cardTorneo(t)}</div>`).join('')}
            </div>
            <div class="mt-2 h-1 rounded-full bg-white/10 overflow-hidden" aria-hidden="true"><div data-car-bar class="h-full rounded-full bg-secondary transition-[width] duration-200" style="width:0"></div></div>
        </div>`;
}

function attivaCarosello() {
    const track = grid.querySelector('[data-car-track]');
    if (!track) return;
    const bar = grid.querySelector('[data-car-bar]');
    const prev = grid.querySelector('[data-car="prev"]'), next = grid.querySelector('[data-car="next"]');
    const aggiorna = () => {
        const max = track.scrollWidth - track.clientWidth;
        // La barra mostra quanta parte dell'elenco è già passata sullo schermo
        bar.style.width = `${max > 0 ? ((track.scrollLeft + track.clientWidth) / track.scrollWidth) * 100 : 100}%`;
        prev.disabled = track.scrollLeft <= 4;
        next.disabled = track.scrollLeft >= max - 4;
        bar.parentElement.classList.toggle('invisible', max <= 0);
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.9 }));
    next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.9 }));
    track.addEventListener('scroll', aggiorna, { passive: true });
    addEventListener('resize', aggiorna);
    aggiorna();
}

// ─── Modulo di iscrizione ─────────────────────────────────────────────────
const input = 'mt-1.5 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:border-primary focus:ring-0 transition';
const label = 'block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500';

function campo(name, text, attrs = '') {
    return `<label class="${label}">${text}<input name="${name}" class="${input}" ${attrs} /></label>`;
}

function apriIscrizione(t) {
    const n = t.giocatori_per_squadra;
    const acc = COLORE_SESSO[t.sesso] || '#FFD700';
    const img = locandinaUrl(t.locandina_path);
    const giocatori = Array.from({ length: n }, (_, i) => `
        <div class="relative rounded-2xl border-2 border-gray-100 p-4 pt-5">
            <span class="absolute -top-3 left-4 inline-flex items-center gap-1.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full">
                <span class="font-poster text-sm text-secondary">${i + 1}</span>Giocatore</span>
            <div class="grid grid-cols-2 gap-3">
                ${campo(`nome_${i}`, 'Nome', 'required maxlength="60" autocomplete="off"')}
                ${campo(`cognome_${i}`, 'Cognome', 'required maxlength="60" autocomplete="off"')}
            </div>
        </div>`).join('');

    dialog.innerHTML = `
        <div class="relative overflow-hidden bg-[#191022] text-white px-5 sm:px-8 pt-6 pb-7" style="--acc:${acc}">
            ${img ? `<img src="${esc(img)}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-30 blur-md scale-110" />` : '<div class="t-art absolute inset-0 opacity-60"></div>'}
            <div class="absolute inset-0 bg-gradient-to-t from-[#191022] to-[#191022]/40"></div>
            <div class="relative flex items-start justify-between gap-4">
                <div class="flex flex-wrap gap-2">
                    <span class="font-poster text-xl leading-none bg-secondary text-gray-900 px-2.5 py-1 rounded-lg -rotate-2">${esc(formula(n).replace('x', '×'))}</span>
                    <span class="text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full text-gray-900" style="background:var(--acc)">${esc(SESSO[t.sesso] || '')}</span>
                    ${LIVELLO[t.livello] ? `<span class="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full bg-white/15 text-white">${barreLivello(t.livello)}${esc(LIVELLO[t.livello].label)}</span>` : ''}
                </div>
                <button type="button" data-chiudi class="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Chiudi">
                    <span class="material-icons" aria-hidden="true">close</span>
                </button>
            </div>
            <p class="relative mt-5 text-[11px] font-black uppercase tracking-[0.25em] text-secondary">Iscrizione squadra</p>
            <h2 class="relative mt-1 font-poster uppercase text-4xl sm:text-5xl leading-[0.95]">${esc(t.titolo)}</h2>
            <p class="relative mt-2 text-sm font-semibold text-white/75">${esc(dataEOra(t))} · ${esc(t.luogo)}</p>
            ${t.descrizione ? `<details class="relative mt-3 text-sm text-white/75"><summary class="cursor-pointer font-bold text-white">Dettagli del torneo</summary><p class="mt-2 whitespace-pre-line">${esc(t.descrizione)}</p></details>` : ''}
        </div>
        <form class="px-5 sm:px-8 py-7" novalidate>
            <div class="space-y-5">
                ${n > 1 ? campo('nome_squadra', 'Nome squadra <span class="normal-case tracking-normal font-semibold text-gray-400">· facoltativo</span>', 'maxlength="60" autocomplete="off" placeholder="Es. I Muri di Basiglio"') : ''}
                ${giocatori}
                <div class="grid sm:grid-cols-2 gap-3">
                    ${campo('email', 'Email di contatto', 'type="email" required maxlength="200" autocomplete="email" placeholder="nome@email.it"')}
                    ${campo('telefono', 'Telefono', 'type="tel" required maxlength="25" autocomplete="tel" inputmode="tel" placeholder="333 1234567"')}
                </div>
                <label class="${label}">Note <span class="normal-case tracking-normal font-semibold text-gray-400">· facoltative</span>
                    <textarea name="note" rows="2" maxlength="500" class="${input}" placeholder="Richieste, orari, livello…"></textarea>
                </label>
                <!-- Campo trappola per i bot: invisibile alle persone -->
                <label class="hidden" aria-hidden="true">Sito web<input name="sito" tabindex="-1" autocomplete="off" /></label>
                <label class="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 text-sm text-gray-700 cursor-pointer">
                    <input name="privacy" type="checkbox" required class="mt-0.5 w-5 h-5 rounded-md border-2 border-gray-300 text-primary focus:ring-primary" />
                    <span>Ho letto l'<a href="privacy.html" target="_blank" class="text-primary font-bold underline">informativa privacy</a> e acconsento all'uso di questi dati per l'organizzazione del torneo.</span>
                </label>
            </div>

            <p data-errore class="hidden mt-5 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm font-bold px-4 py-3" role="alert"></p>
            <button type="submit" class="t-shine mt-6 w-full inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-poster uppercase text-xl tracking-wide px-6 py-4 rounded-2xl shadow-[0_14px_34px_-12px_rgba(127,19,236,.8)] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                <span data-testo>Conferma iscrizione</span>
                <span class="material-icons" aria-hidden="true">sports_volleyball</span>
            </button>
        </form>`;

    const form = dialog.querySelector('form');
    const errore = dialog.querySelector('[data-errore]');
    const mostraErrore = (msg) => { errore.innerHTML = `<span class="material-icons text-lg" aria-hidden="true">error</span>${esc(msg)}`; errore.classList.remove('hidden'); };

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        errore.classList.add('hidden');
        if (!form.checkValidity()) {
            const primo = form.querySelector(':invalid');
            mostraErrore(primo?.name === 'privacy' ? 'Per iscriverti devi accettare l\'informativa privacy.' : 'Completa tutti i campi obbligatori.');
            primo?.focus();
            return;
        }
        const f = new FormData(form);
        if (f.get('sito')) return; // bot

        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        btn.querySelector('[data-testo]').textContent = 'Invio in corso…';
        try {
            await rpc('iscrivi_torneo', {
                p_torneo_id: t.id,
                p_giocatori: Array.from({ length: n }, (_, i) => ({ nome: f.get(`nome_${i}`), cognome: f.get(`cognome_${i}`) })),
                p_email: f.get('email'),
                p_telefono: f.get('telefono'),
                p_nome_squadra: f.get('nome_squadra') || null,
                p_note: f.get('note') || null,
                p_privacy: true,
            });
        } catch (e) {
            mostraErrore(e.message);
            btn.disabled = false;
            btn.querySelector('[data-testo]').textContent = 'Conferma iscrizione';
            return;
        }
        dialog.innerHTML = `
            <div class="relative overflow-hidden bg-[#191022] text-white px-8 py-12 text-center">
                <div class="t-art absolute inset-0 opacity-50"></div>
                <div class="relative">
                    <span class="mx-auto w-20 h-20 rounded-full bg-secondary flex items-center justify-center shadow-[0_0_60px_rgba(255,215,0,.6)]">
                        <span class="material-icons text-5xl text-gray-900" aria-hidden="true">check</span>
                    </span>
                    <p class="mt-6 text-[11px] font-black uppercase tracking-[0.25em] text-secondary">Iscrizione ricevuta</p>
                    <h2 class="mt-2 font-poster uppercase text-5xl leading-none">Ci vediamo<br>in campo!</h2>
                    <p class="mt-4 text-white/75 max-w-sm mx-auto">Sei iscritto a <b class="text-white">${esc(t.titolo)}</b>. Gli organizzatori ti contatteranno all'email o al telefono indicati.</p>
                    <button type="button" data-chiudi class="mt-8 inline-flex bg-secondary text-gray-900 font-poster uppercase text-lg tracking-wide px-10 py-3.5 rounded-2xl">Chiudi</button>
                </div>
            </div>`;
        coriandoli();
        carica();
    });

    dialog.showModal();
    dialog.scrollTop = 0;
}

function coriandoli() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colori = ['#7f13ec', '#FFD700', '#ff4fa3', '#38bdf8', '#ffffff'];
    for (let i = 0; i < 90; i++) {
        const c = document.createElement('span');
        c.className = 't-confetti';
        c.style.left = `${Math.random() * 100}vw`;
        c.style.background = colori[i % colori.length];
        c.style.borderRadius = i % 3 ? '2px' : '9999px';
        c.style.setProperty('--dx', `${(Math.random() - 0.5) * 240}px`);
        c.style.setProperty('--rot', `${Math.random() * 900 - 450}deg`);
        c.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
        c.style.animationDelay = `${Math.random() * 0.4}s`;
        // Dentro la finestra aperta, altrimenti resterebbero sotto lo sfondo sfocato del <dialog>
        (dialog.open ? dialog : document.body).appendChild(c);
        c.addEventListener('animationend', () => c.remove());
    }
}

grid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-iscriviti]');
    if (!btn) return;
    const t = tornei.find((x) => x.id === btn.dataset.iscriviti);
    if (t && statoTorneo(t).aperto) apriIscrizione(t);
});

dialog.addEventListener('click', (ev) => {
    // Chiusura col pulsante o cliccando fuori dal riquadro
    if (ev.target.closest('[data-chiudi]') || ev.target === dialog) dialog.close();
});

attivaTilt(grid);
setInterval(() => aggiornaCountdown(grid), 30000);
carica();
