// Personal con James Martins (personal.html): listino, calendario settimanale e richiesta di sessione.
// I dati (listino, orari, chiusure) sono in personal-data.js. La richiesta va alla funzione
// richiedi_personal() su Supabase (supabase/personal.sql), che la salva e fa partire l'email.
import { rpc, esc, dataLunga } from './tornei/config.js';

const D = window.PERSONAL_JAMES;
const WA = '393494633610';
const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const CHIAVE_GIORNO = { 5: 'sab', 6: 'dom' };   // indice nella settimana (lun = 0)
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

// ─── Date (sempre in ora locale, giorni come "AAAA-MM-GG") ────────────────
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daIso = (s) => { const [y, m, g] = s.split('-').map(Number); return new Date(y, m - 1, g); };
const piuGiorni = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const lunedi = (d) => piuGiorni(d, -((d.getDay() + 6) % 7));
const minuti = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const ora = (min) => `${Math.floor(min / 60)}:${pad(min % 60)}`;
const fascia = (s) => `${ora(minuti(s.inizio))}–${ora(minuti(s.inizio) + s.durata)}`;

const primoLunedi = lunedi(new Date() > daIso(D.dal) ? new Date() : daIso(D.dal));
const ultimoLunedi = lunedi(daIso(D.al));
const sessioni = [...D.sessioni].sort((a, b) => minuti(a.inizio) - minuti(b.inizio));

// Stato di una sessione in un certo giorno: 'libera', 'passata' (troppo vicina o già fatta)
function statoSessione(giorno, s) {
    const inizio = daIso(giorno);
    inizio.setMinutes(minuti(s.inizio));
    return inizio - Date.now() > D.preavviso * 3600e3 ? 'libera' : 'passata';
}

// Cosa c'è in un giorno della settimana: null (feriale), 'chiuso', oppure l'elenco delle sessioni
function giornata(d, i) {
    const chiave = CHIAVE_GIORNO[i];
    if (!chiave) return null;
    const g = iso(d);
    if (g < D.dal || g > D.al || D.chiusure.includes(g)) return 'chiuso';
    const lista = sessioni.filter((s) => s.giorno === chiave);
    return lista.length ? lista.map((s) => ({ ...s, data: g, stato: statoSessione(g, s) })) : 'chiuso';
}

// ─── Listino ──────────────────────────────────────────────────────────────
function prezzo(t) {
    if (t.prezzo == null) return '<span class="text-2xl font-black">Su richiesta</span>';
    return `<span class="text-5xl font-black tabular-nums leading-none">${t.prezzo}€</span>${t.unita ? `<span class="ml-1.5 text-sm font-bold text-gray-500 dark:text-gray-400">${esc(t.unita)}</span>` : ''}`;
}

function renderListino() {
    const el = document.getElementById('listino-card');
    el.innerHTML = D.listino.map((t, i) => `
        <article class="relative flex flex-col rounded-[2rem] p-7 ${i === 1 ? 'bg-gray-900 text-white shadow-2xl shadow-primary/30 lg:-translate-y-3' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}" data-reveal>
            <div class="flex items-center justify-between gap-3">
                <span class="text-[11px] font-black uppercase tracking-[0.2em] ${i === 1 ? 'text-secondary' : 'text-primary'}">${esc(t.persone)}</span>
                <span class="inline-flex items-center gap-1 text-xs font-bold ${i === 1 ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}"><span class="material-icons text-base" aria-hidden="true">timer</span>${t.durata} min</span>
            </div>
            <h3 class="mt-3 text-2xl font-black uppercase tracking-tight">${esc(t.nome)}</h3>
            <p class="mt-2 text-sm leading-relaxed ${i === 1 ? 'text-white/75' : 'text-gray-600 dark:text-gray-300'}">${esc(t.desc)}</p>
            <p class="mt-auto pt-6 ${i === 1 ? '[&_span]:text-white' : 'text-gray-900 dark:text-white'}">${prezzo(t)}</p>
        </article>`).join('');
}

// ─── Calendario ───────────────────────────────────────────────────────────
const cal = document.getElementById('cal');
let settimana = primoLunedi;
let giornoScelto = null;   // telefono: indice del giorno aperto (5 = sab, 6 = dom)

function etichettaSettimana(lun) {
    const dom = piuGiorni(lun, 6);
    const stessoMese = lun.getMonth() === dom.getMonth();
    return `${lun.getDate()}${stessoMese ? '' : ' ' + MESI[lun.getMonth()]} – ${dom.getDate()} ${MESI[dom.getMonth()]} ${dom.getFullYear()}`;
}

function bottoneSessione(s, grande) {
    const libera = s.stato === 'libera';
    const testo = libera ? 'Richiedi' : 'Non disponibile';
    if (grande) {
        return `
            <button type="button" ${libera ? `data-sessione="${s.data}|${s.inizio}"` : 'disabled'}
                class="sess w-full flex items-center gap-4 rounded-3xl border-2 p-4 text-left transition ${libera ? 'border-primary/20 bg-white dark:bg-gray-800 hover:border-primary active:scale-[.98]' : 'border-transparent bg-gray-100 dark:bg-gray-800/50 text-gray-400'}">
                <span class="shrink-0 w-14 h-14 rounded-2xl ${libera ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'} flex flex-col items-center justify-center leading-none">
                    <span class="text-base font-black tabular-nums">${ora(minuti(s.inizio))}</span>
                </span>
                <span class="flex-1 min-w-0">
                    <span class="block font-black ${libera ? 'text-gray-900 dark:text-white' : ''}">${fascia(s)}</span>
                    <span class="block text-xs font-semibold ${libera ? 'text-gray-500 dark:text-gray-400' : ''}">${s.durata} minuti con James</span>
                </span>
                <span class="shrink-0 inline-flex items-center gap-1 text-sm font-extrabold ${libera ? 'text-primary' : ''}">${testo}${libera ? '<span class="material-icons text-lg" aria-hidden="true">arrow_forward</span>' : ''}</span>
            </button>`;
    }
    return `
        <button type="button" ${libera ? `data-sessione="${s.data}|${s.inizio}"` : 'disabled'} title="${fascia(s)}${libera ? '' : ' · non disponibile'}"
            class="sess absolute inset-x-1.5 top-1 bottom-1 flex flex-col justify-between rounded-2xl p-2.5 text-left text-sm transition ${libera ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:-translate-y-0.5' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}">
            <span class="font-black leading-tight">${fascia(s)}</span>
            <span class="inline-flex items-center gap-1 text-xs font-bold ${libera ? 'text-white/85' : ''}">${testo}${libera ? '<span class="material-icons text-sm" aria-hidden="true">arrow_forward</span>' : ''}</span>
        </button>`;
}

function renderCalendario() {
    const giorni = Array.from({ length: 7 }, (_, i) => piuGiorni(settimana, i));
    const contenuti = giorni.map(giornata);
    const oggi = iso(new Date());
    const prima = settimana <= primoLunedi;
    const ultima = settimana >= ultimoLunedi;

    // Telefono: giorno aperto = il primo del weekend con sessioni libere, altrimenti sabato
    if (giornoScelto == null) {
        giornoScelto = [5, 6].find((i) => Array.isArray(contenuti[i]) && contenuti[i].some((s) => s.stato === 'libera')) ?? 5;
    }

    // Griglia desktop: righe da 15 minuti tra la prima e l'ultima sessione
    const inizio = Math.min(...sessioni.map((s) => minuti(s.inizio)));
    const fine = Math.max(...sessioni.map((s) => minuti(s.inizio) + s.durata));
    const righe = Math.ceil((fine - inizio) / 15);
    const riga = (min) => Math.floor((min - inizio) / 15) + 2;   // riga 1 = intestazione
    const ore = [];
    for (let m = Math.ceil(inizio / 60) * 60; m < fine; m += 60) ore.push(m);

    const testa = giorni.map((d, i) => {
        const weekend = i >= 5;
        const eOggi = iso(d) === oggi;
        return `
            <div class="px-2 pb-3 text-center" style="grid-column:${i + 2};grid-row:1">
                <span class="block text-[11px] font-black uppercase tracking-[0.2em] ${weekend ? 'text-primary' : 'text-gray-400'}">${GIORNI[i]}</span>
                <span class="mt-1 mx-auto w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${eOggi ? 'bg-secondary text-gray-900' : weekend ? 'text-gray-900 dark:text-white' : 'text-gray-400'}">${d.getDate()}</span>
            </div>`;
    }).join('');

    // Ordine nella griglia: sfondi delle colonne, poi le linee delle ore, poi le sessioni sopra a tutto
    const sfondi = contenuti.map((c, i) => {
        const col = `grid-column:${i + 2};grid-row:2 / span ${righe}`;
        if (c === null) {
            return `<div class="cal-feriale rounded-2xl flex items-center justify-center" style="${col}"><span class="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">Corsi IFB</span></div>`;
        }
        if (c === 'chiuso') {
            return `<div class="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-400" style="${col}"><span class="material-icons" aria-hidden="true">event_busy</span><span class="text-xs font-bold">Niente sessioni</span></div>`;
        }
        return `<div class="rounded-2xl bg-primary/[0.04] dark:bg-primary/10" style="${col}"></div>`;
    }).join('');
    const blocchi = contenuti.map((c, i) => Array.isArray(c)
        ? c.map((s) => `<div class="relative" style="grid-column:${i + 2};grid-row:${riga(minuti(s.inizio))} / span ${Math.round(s.durata / 15)}">${bottoneSessione(s)}</div>`).join('')
        : '').join('');

    const assi = ore.map((m) => `
        <div class="-mt-2 pr-3 text-right text-xs font-bold text-gray-400 tabular-nums" style="grid-column:1;grid-row:${riga(m)}">${ora(m)}</div>
        <div class="border-t border-dashed border-gray-300/70 dark:border-gray-700 pointer-events-none" style="grid-column:2 / -1;grid-row:${riga(m)}"></div>`).join('');
    const colonne = sfondi + assi + blocchi;

    // Telefono: striscia dei giorni + sessioni del giorno scelto
    const striscia = giorni.map((d, i) => {
        const weekend = i >= 5;
        const sel = weekend && i === giornoScelto;
        const libere = Array.isArray(contenuti[i]) ? contenuti[i].filter((s) => s.stato === 'libera').length : 0;
        return `
            <button type="button" ${weekend ? `data-giorno="${i}" aria-pressed="${sel}"` : 'disabled aria-hidden="true" tabindex="-1"'}
                class="flex flex-col items-center gap-1 rounded-2xl py-2 min-h-[4.25rem] transition ${sel ? 'bg-primary text-white shadow-lg shadow-primary/30' : weekend ? 'bg-white dark:bg-gray-800 ring-2 ring-primary/20 text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}">
                <span class="text-[10px] font-black uppercase tracking-wider">${GIORNI[i]}</span>
                <span class="text-lg font-black leading-none">${d.getDate()}</span>
                ${weekend ? `<span class="text-[10px] font-bold ${sel ? 'text-white/80' : 'text-primary'}">${libere ? libere + ' libere' : '—'}</span>` : '<span class="w-1 h-1 rounded-full bg-current"></span>'}
            </button>`;
    }).join('');
    const scelto = contenuti[giornoScelto];
    const elenco = Array.isArray(scelto)
        ? scelto.map((s) => bottoneSessione(s, true)).join('')
        : `<p class="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center text-sm font-semibold text-gray-500"><span class="material-icons block text-3xl mb-1" aria-hidden="true">event_busy</span>Niente sessioni in questo giorno. Prova la settimana successiva.</p>`;

    cal.innerHTML = `
        <div class="flex items-center justify-between gap-3 mb-6">
            <button type="button" data-sett="-1" ${prima ? 'disabled' : ''} aria-label="Settimana precedente"
                class="w-12 h-12 shrink-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition">
                <span class="material-icons" aria-hidden="true">chevron_left</span></button>
            <p class="text-center" aria-live="polite">
                <span class="block text-[11px] font-black uppercase tracking-[0.25em] text-primary">${prima ? 'Questa settimana' : 'Settimana'}</span>
                <span class="block font-black text-lg sm:text-2xl text-gray-900 dark:text-white">${etichettaSettimana(settimana)}</span>
            </p>
            <button type="button" data-sett="1" ${ultima ? 'disabled' : ''} aria-label="Settimana successiva"
                class="w-12 h-12 shrink-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition">
                <span class="material-icons" aria-hidden="true">chevron_right</span></button>
        </div>

        <div class="lg:hidden">
            <div class="grid grid-cols-7 gap-1.5">${striscia}</div>
            <p class="mt-5 mb-3 text-sm font-black text-gray-900 dark:text-white">${dataLunga(iso(giorni[giornoScelto]))}</p>
            <div class="space-y-3">${elenco}</div>
        </div>

        <div class="hidden lg:grid gap-x-2" style="grid-template-columns:3.5rem repeat(7,minmax(0,1fr));grid-template-rows:auto repeat(${righe},1.15rem)">
            ${testa}${colonne}
        </div>`;
}

cal.addEventListener('click', (e) => {
    let b;
    if ((b = e.target.closest('[data-sett]'))) {
        settimana = piuGiorni(settimana, 7 * Number(b.dataset.sett));
        giornoScelto = null;
        renderCalendario();
    } else if ((b = e.target.closest('[data-giorno]'))) {
        giornoScelto = Number(b.dataset.giorno);
        renderCalendario();
    } else if ((b = e.target.closest('[data-sessione]'))) {
        const [data, inizio] = b.dataset.sessione.split('|');
        apriRichiesta(sessioni.find((s) => s.inizio === inizio && s.giorno === CHIAVE_GIORNO[(daIso(data).getDay() + 6) % 7]), data);
    }
});

// ─── Modulo di richiesta ──────────────────────────────────────────────────
const dialog = document.getElementById('richiesta-dialog');
const input = 'mt-1.5 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:border-primary focus:ring-0 transition';
const label = 'block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500';
const LIVELLI = ['Principiante', 'Intermedio', 'Avanzato', 'Agonista'];

function linkWhatsApp(testo) {
    return `https://wa.me/${WA}?text=${encodeURIComponent(testo)}`;
}

function apriRichiesta(s, data) {
    if (!s) return;
    const quando = `${dataLunga(data)} · ${fascia(s)}`;
    dialog.innerHTML = `
        <div class="relative overflow-hidden bg-slate-950 text-white px-5 sm:px-8 pt-6 pb-7">
            <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(circle at 85% 0%,rgba(127,19,236,.55),transparent 60%),radial-gradient(circle at 0% 100%,rgba(255,215,0,.18),transparent 55%)" aria-hidden="true"></div>
            <div class="relative flex items-start justify-between gap-4">
                <span class="inline-flex items-center gap-1.5 bg-secondary text-gray-900 text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">
                    <span class="material-icons text-sm" aria-hidden="true">event_available</span> Richiesta di sessione</span>
                <button type="button" data-chiudi class="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Chiudi">
                    <span class="material-icons" aria-hidden="true">close</span></button>
            </div>
            <h2 class="relative mt-5 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95]">Allenati con James</h2>
            <p class="relative mt-2 font-bold text-secondary">${esc(quando)}</p>
            <p class="relative mt-1 text-sm text-white/70">È una richiesta: ti contattiamo per confermare sede e orario. Si paga sul posto.</p>
        </div>
        <form class="px-5 sm:px-8 py-7" novalidate>
            <div class="space-y-5">
                <fieldset>
                    <legend class="${label}">Tipo di sessione</legend>
                    <div class="mt-2 grid gap-2">
                        ${D.listino.map((t, i) => `
                            <label class="flex items-center gap-3 rounded-2xl border-2 border-gray-100 p-3.5 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition">
                                <input type="radio" name="sessione" value="${esc(t.id)}" ${i === 0 ? 'checked' : ''} required class="w-5 h-5 border-2 border-gray-300 text-primary focus:ring-primary" />
                                <span class="flex-1 min-w-0">
                                    <span class="block font-black text-gray-900">${esc(t.nome)}</span>
                                    <span class="block text-xs font-semibold text-gray-500">${esc(t.persone)} · ${t.durata} min</span>
                                </span>
                                <span class="shrink-0 text-sm font-black text-gray-900">${t.prezzo == null ? '' : `${t.prezzo}€${t.unita ? `<span class="font-semibold text-gray-500"> ${esc(t.unita)}</span>` : ''}`}</span>
                            </label>`).join('')}
                    </div>
                </fieldset>
                <label class="${label}">Il tuo livello
                    <select name="livello" required class="${input}">
                        <option value="">Scegli…</option>
                        ${LIVELLI.map((l) => `<option>${l}</option>`).join('')}
                    </select>
                </label>
                <label class="${label}">Nome e cognome<input name="nome" class="${input}" required maxlength="80" autocomplete="name" /></label>
                <div class="grid sm:grid-cols-2 gap-3">
                    <label class="${label}">Email<input name="email" type="email" class="${input}" required maxlength="200" autocomplete="email" placeholder="nome@email.it" /></label>
                    <label class="${label}">Telefono<input name="telefono" type="tel" class="${input}" required maxlength="25" autocomplete="tel" inputmode="tel" placeholder="333 1234567" /></label>
                </div>
                <label class="${label}">Note <span class="normal-case tracking-normal font-semibold text-gray-400">· facoltative</span>
                    <textarea name="note" rows="2" maxlength="500" class="${input}" placeholder="Con chi vieni, cosa vuoi migliorare, orari alternativi…"></textarea>
                </label>
                <!-- Campo trappola per i bot: invisibile alle persone -->
                <label class="hidden" aria-hidden="true">Sito web<input name="sito" tabindex="-1" autocomplete="off" /></label>
                <label class="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 text-sm text-gray-700 cursor-pointer">
                    <input name="privacy" type="checkbox" required class="mt-0.5 w-5 h-5 rounded-md border-2 border-gray-300 text-primary focus:ring-primary" />
                    <span>Ho letto l'<a href="privacy.html#dati" target="_blank" class="text-primary font-bold underline">informativa privacy</a> e acconsento all'uso di questi dati per essere ricontattato su questa richiesta.</span>
                </label>
            </div>
            <div data-errore class="hidden mt-5 rounded-xl bg-red-50 text-red-700 text-sm font-bold px-4 py-3" role="alert"></div>
            <button type="submit" class="mt-6 w-full inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-wide text-lg px-6 py-4 rounded-2xl shadow-[0_14px_34px_-12px_rgba(127,19,236,.8)] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                <span data-testo>Invia la richiesta</span>
                <span class="material-icons" aria-hidden="true">send</span>
            </button>
        </form>`;

    const form = dialog.querySelector('form');
    const errore = dialog.querySelector('[data-errore]');
    const mostraErrore = (msg, wa) => {
        errore.innerHTML = `<p class="flex items-center gap-2"><span class="material-icons text-lg" aria-hidden="true">error</span>${esc(msg)}</p>` +
            (wa ? `<a href="${wa}" target="_blank" rel="noopener" class="mt-2 inline-flex items-center gap-1 underline">Oppure manda la richiesta su WhatsApp<span class="material-icons text-base" aria-hidden="true">arrow_forward</span></a>` : '');
        errore.classList.remove('hidden');
    };

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        errore.classList.add('hidden');
        if (!form.checkValidity()) {
            const primo = form.querySelector(':invalid');
            mostraErrore(primo?.name === 'privacy' ? 'Per inviare la richiesta devi accettare l\'informativa privacy.' : 'Completa tutti i campi obbligatori.');
            primo?.focus();
            return;
        }
        const f = new FormData(form);
        if (f.get('sito')) return; // bot
        const tipo = D.listino.find((t) => t.id === f.get('sessione'));

        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        btn.querySelector('[data-testo]').textContent = 'Invio in corso…';
        try {
            await rpc('richiedi_personal', {
                p_data: data,
                p_ora: s.inizio,
                p_durata: s.durata,
                p_sessione: tipo.id,
                p_livello: f.get('livello'),
                p_nome: f.get('nome'),
                p_email: f.get('email'),
                p_telefono: f.get('telefono'),
                p_note: f.get('note') || null,
                p_privacy: true,
            });
        } catch (e) {
            const testo = `Ciao! Vorrei richiedere una sessione con James: ${quando}, ${tipo.nome}. Livello: ${f.get('livello')}. Sono ${f.get('nome')}.`;
            mostraErrore(e.message, linkWhatsApp(testo));
            btn.disabled = false;
            btn.querySelector('[data-testo]').textContent = 'Invia la richiesta';
            return;
        }
        dialog.innerHTML = `
            <div class="relative overflow-hidden bg-slate-950 text-white px-8 py-12 text-center">
                <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(circle at 50% 0%,rgba(127,19,236,.6),transparent 65%)" aria-hidden="true"></div>
                <div class="relative">
                    <span class="mx-auto w-20 h-20 rounded-full bg-secondary flex items-center justify-center shadow-[0_0_60px_rgba(255,215,0,.5)]">
                        <span class="material-icons text-5xl text-gray-900" aria-hidden="true">check</span>
                    </span>
                    <p class="mt-6 text-[11px] font-black uppercase tracking-[0.25em] text-secondary">Richiesta inviata</p>
                    <h2 class="mt-2 text-4xl font-black uppercase leading-none">Ci sentiamo<br>a breve!</h2>
                    <p class="mt-4 text-white/75 max-w-sm mx-auto">Abbiamo ricevuto la tua richiesta per <b class="text-white">${esc(quando)}</b> (${esc(tipo.nome)}). Ti contattiamo al più presto per confermare sede e orario.</p>
                    <button type="button" data-chiudi class="mt-8 inline-flex bg-secondary text-gray-900 font-black uppercase tracking-wide px-10 py-3.5 rounded-2xl">Chiudi</button>
                </div>
            </div>`;
    });

    dialog.showModal();
    dialog.scrollTop = 0;
}

dialog.addEventListener('click', (ev) => {
    // Chiusura col pulsante o cliccando fuori dal riquadro
    if (ev.target.closest('[data-chiudi]') || ev.target === dialog) dialog.close();
});

renderListino();
renderCalendario();
