// Personal con James Martins (personal.html): listini, calendario dei weekend e richiesta di sessione.
// I dati (prezzi, fasce, chiusure) sono in personal-data.js. La richiesta va alla funzione
// richiedi_personal() su Supabase (supabase/personal.sql), che la salva e fa partire l'email.
// Non ci sono orari fissi: si sceglie giorno e fascia, lo slot lo assegna IFB alla conferma.
import { rpc, esc, dataLunga } from './tornei/config.js';

const D = window.PERSONAL_JAMES;
const WA = '393494633610';
const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const ATLETI = Object.keys(D.james.prezzi).map(Number);
const atleti = (n) => n === 1 ? '1 atleta' : `${n} atleti`;
const linkWhatsApp = (testo) => `https://wa.me/${WA}?text=${encodeURIComponent(testo)}`;

// ─── Date (ora locale, giorni come "AAAA-MM-GG") ──────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daIso = (s) => { const [y, m, g] = s.split('-').map(Number); return new Date(y, m - 1, g); };
const piuGiorni = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const lunedi = (d) => piuGiorni(d, -((d.getDay() + 6) % 7));
const oggi = new Date();
const ultimaData = iso(piuGiorni(oggi, D.apertura));   // ultimo giorno già richiedibile
const corta = (s) => { const d = daIso(s); return `${d.getDate()} ${MESI[d.getMonth()]}`; };
// Giorno in cui si apre la richiesta per una certa data
const apre = (g) => corta(iso(piuGiorni(daIso(g), -D.apertura)));

const primoLunedi = lunedi(oggi);
const ultimoLunedi = lunedi(daIso(D.al));

// Stato di un giorno: null (feriale), 'passato', 'chiuso', 'futuro' (richiesta non ancora aperta), 'libero'
function statoGiorno(d, i) {
    if (i < 5) return null;
    const g = iso(d);
    if (g < iso(oggi)) return 'passato';
    if (g < D.dal || g > D.al || D.chiusure.includes(g)) return 'chiuso';
    if (g > ultimaData) return 'futuro';
    return 'libero';
}

// ─── Listini ──────────────────────────────────────────────────────────────
function tabellaPrezzi(p, scuro) {
    return `<dl class="mt-5 divide-y ${scuro ? 'divide-white/10' : 'divide-gray-100 dark:divide-gray-700'}">` +
        Object.entries(p.prezzi).map(([n, euro]) => `
            <div class="flex items-baseline justify-between py-2.5">
                <dt class="font-semibold ${scuro ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}">${atleti(Number(n))}</dt>
                <dd class="text-xl font-black tabular-nums">${euro} €</dd>
            </div>`).join('') + '</dl>';
}

function renderListino() {
    const j = D.james, f = D.ifb;
    document.getElementById('listino-card').innerHTML = `
        <article class="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-7 sm:p-8 shadow-2xl shadow-primary/30" data-reveal>
            <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(circle at 100% 0%,rgba(127,19,236,.55),transparent 55%)" aria-hidden="true"></div>
            <div class="relative">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <span class="inline-flex items-center gap-1.5 bg-secondary text-gray-900 text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">${esc(j.sigla)}</span>
                    <span class="inline-flex items-center gap-1 text-sm font-bold text-white/80"><span class="material-icons text-lg" aria-hidden="true">timer</span>${j.durata} minuti</span>
                </div>
                <h3 class="mt-4 text-3xl font-black uppercase tracking-tight">${esc(j.nome)}</h3>
                <p class="mt-1 font-semibold text-secondary">${esc(j.coach)} · ${esc(j.quando)}</p>
                ${tabellaPrezzi(j, true)}
                <a href="#calendario" class="mt-6 w-full inline-flex items-center justify-center gap-2 bg-secondary text-gray-900 font-extrabold py-3.5 rounded-full hover:-translate-y-0.5 transition">
                    <span class="material-icons text-xl" aria-hidden="true">calendar_month</span> Scegli il giorno</a>
            </div>
        </article>
        <article class="rounded-[2rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-7 sm:p-8 sr-stagger-1" data-reveal>
            <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">Anche in settimana</span>
                <span class="inline-flex items-center gap-1 text-sm font-bold text-gray-500 dark:text-gray-400"><span class="material-icons text-lg" aria-hidden="true">timer</span>${f.durata} minuti</span>
            </div>
            <h3 class="mt-4 text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">${esc(f.nome)}</h3>
            <p class="mt-1 font-semibold text-primary">${esc(f.coach)} · ${esc(f.quando)}</p>
            <div class="text-gray-900 dark:text-white">${tabellaPrezzi(f, false)}</div>
            <a href="${linkWhatsApp('Ciao! Vorrei informazioni su un Personal IFB in settimana.')}" target="_blank" rel="noopener"
                class="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-extrabold py-3.5 rounded-full hover:bg-primary dark:hover:bg-secondary transition">
                <span class="material-icons text-xl" aria-hidden="true">chat</span> Chiedi alla segreteria</a>
        </article>`;
}

// ─── Calendario ───────────────────────────────────────────────────────────
const cal = document.getElementById('cal');
// Si parte dalla settimana corrente (o da quella d'inizio, se il progetto non è ancora partito)
let settimana = lunedi(iso(oggi) > D.dal ? oggi : daIso(D.dal));
let giornoScelto = null;   // telefono: giorno aperto (5 = sab, 6 = dom)

function etichettaSettimana(lun) {
    const dom = piuGiorni(lun, 6);
    const stessoMese = lun.getMonth() === dom.getMonth();
    return `${lun.getDate()}${stessoMese ? '' : ' ' + MESI[lun.getMonth()]} – ${dom.getDate()} ${MESI[dom.getMonth()]} ${dom.getFullYear()}`;
}

const MSG = {
    passato: ['history', 'Giorno passato'],
    chiuso: ['event_busy', 'Niente personal in questo giorno'],
};

// Contenuto di un giorno del weekend: le fasce da scegliere, oppure il motivo per cui non si può
function contenutoGiorno(d, stato, grande) {
    const g = iso(d);
    if (stato !== 'libero') {
        const [icona, testo] = stato === 'futuro' ? ['hourglass_empty', `Richiedibile dal ${apre(g)}`] : MSG[stato];
        return `
            <div class="h-full flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-center text-gray-400 ${grande ? 'py-8' : ''}">
                <span class="material-icons" aria-hidden="true">${icona}</span>
                <span class="text-xs font-bold">${testo}</span>
            </div>`;
    }
    return `<div class="${grande ? 'space-y-3' : 'h-full flex flex-col gap-2'}">` + D.fasce.map((f) => grande
        ? `
            <button type="button" data-richiedi="${g}|${f.id}"
                class="w-full flex items-center gap-4 rounded-3xl border-2 border-primary/20 bg-white dark:bg-gray-800 p-4 text-left hover:border-primary active:scale-[.98] transition">
                <span class="shrink-0 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center"><span class="material-icons" aria-hidden="true">${f.icona}</span></span>
                <span class="flex-1 min-w-0">
                    <span class="block font-black text-gray-900 dark:text-white">${f.nome}</span>
                    <span class="block text-xs font-semibold text-gray-500 dark:text-gray-400">indicativamente ${f.ore}</span>
                </span>
                <span class="shrink-0 inline-flex items-center gap-1 text-sm font-extrabold text-primary">Richiedi<span class="material-icons text-lg" aria-hidden="true">arrow_forward</span></span>
            </button>`
        : `
            <button type="button" data-richiedi="${g}|${f.id}"
                class="flex-1 flex flex-col justify-between rounded-2xl bg-primary text-white p-3 text-left shadow-lg shadow-primary/25 hover:bg-primary-dark hover:-translate-y-0.5 transition">
                <span class="flex items-center justify-between gap-2"><span class="font-black">${f.nome}</span><span class="material-icons text-lg text-white/70" aria-hidden="true">${f.icona}</span></span>
                <span class="flex items-center justify-between gap-2 text-xs font-bold text-white/80"><span>${f.ore}</span><span class="inline-flex items-center">Richiedi<span class="material-icons text-sm" aria-hidden="true">arrow_forward</span></span></span>
            </button>`).join('') + '</div>';
}

function renderCalendario() {
    const giorni = Array.from({ length: 7 }, (_, i) => piuGiorni(settimana, i));
    const stati = giorni.map(statoGiorno);
    const prima = settimana <= primoLunedi;
    const ultima = settimana >= ultimoLunedi;
    if (giornoScelto == null) giornoScelto = stati[5] === 'libero' || stati[6] !== 'libero' ? 5 : 6;

    // Desktop: 7 colonne, i feriali "Corsi IFB", sabato e domenica con le fasce
    const colonne = giorni.map((d, i) => {
        const weekend = i >= 5;
        const eOggi = iso(d) === iso(oggi);
        const testa = `
            <div class="pb-3 text-center">
                <span class="block text-[11px] font-black uppercase tracking-[0.2em] ${weekend ? 'text-primary' : 'text-gray-400'}">${GIORNI[i]}</span>
                <span class="mt-1 mx-auto w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${eOggi ? 'bg-secondary text-gray-900' : weekend ? 'text-gray-900 dark:text-white' : 'text-gray-400'}">${d.getDate()}</span>
            </div>`;
        const corpo = weekend
            ? `<div class="flex-1 rounded-2xl bg-primary/[0.04] dark:bg-primary/10 p-1.5">${contenutoGiorno(d, stati[i], false)}</div>`
            : '<div class="cal-feriale flex-1 rounded-2xl flex items-center justify-center"><span class="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">Corsi IFB</span></div>';
        return `<div class="flex flex-col ${weekend ? 'col-span-2' : ''}">${testa}${corpo}</div>`;
    }).join('');

    // Telefono: striscia dei giorni + fasce del giorno scelto
    const striscia = giorni.map((d, i) => {
        const weekend = i >= 5;
        const sel = weekend && i === giornoScelto;
        const libero = stati[i] === 'libero';
        return `
            <button type="button" ${weekend ? `data-giorno="${i}" aria-pressed="${sel}"` : 'disabled aria-hidden="true" tabindex="-1"'}
                class="flex flex-col items-center gap-1 rounded-2xl py-2 min-h-[4.25rem] transition ${sel ? 'bg-primary text-white shadow-lg shadow-primary/30' : weekend ? 'bg-white dark:bg-gray-800 ring-2 ring-primary/20 text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}">
                <span class="text-[10px] font-black uppercase tracking-wider">${GIORNI[i]}</span>
                <span class="text-lg font-black leading-none">${d.getDate()}</span>
                <span class="w-1.5 h-1.5 rounded-full ${weekend ? (libero ? (sel ? 'bg-secondary' : 'bg-primary') : 'bg-gray-300') : 'bg-current'}"></span>
            </button>`;
    }).join('');

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
            ${contenutoGiorno(giorni[giornoScelto], stati[giornoScelto], true)}
        </div>

        <div class="hidden lg:grid grid-cols-9 gap-2 min-h-[22rem]">${colonne}</div>

        <p class="mt-6 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="material-icons text-lg text-primary" aria-hidden="true">info</span>
            Scegli giorno e fascia: l'orario preciso te lo proponiamo noi alla conferma. Ogni sabato e domenica si può richiedere a partire da una settimana prima.
        </p>`;
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
    } else if ((b = e.target.closest('[data-richiedi]'))) {
        const [data, fascia] = b.dataset.richiedi.split('|');
        apriRichiesta(data, fascia);
    }
});

// ─── Modulo di richiesta ──────────────────────────────────────────────────
const dialog = document.getElementById('richiesta-dialog');
const input = 'mt-1.5 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:border-primary focus:ring-0 transition';
const label = 'block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500';
const scelta = 'cursor-pointer rounded-2xl border-2 border-gray-100 text-center transition has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary';
const LIVELLI = ['Principiante', 'Intermedio', 'Avanzato', 'Agonista'];
const FASCE = [...D.fasce, { id: 'indifferente', nome: 'Indifferente', ore: 'va bene tutto' }];

function apriRichiesta(data, fasciaScelta) {
    const giorno = dataLunga(data);
    dialog.innerHTML = `
        <div class="relative overflow-hidden bg-slate-950 text-white px-5 sm:px-8 pt-6 pb-7">
            <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(circle at 85% 0%,rgba(127,19,236,.55),transparent 60%),radial-gradient(circle at 0% 100%,rgba(255,215,0,.18),transparent 55%)" aria-hidden="true"></div>
            <div class="relative flex items-start justify-between gap-4">
                <span class="inline-flex items-center gap-1.5 bg-secondary text-gray-900 text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">
                    <span class="material-icons text-sm" aria-hidden="true">event_available</span> ${esc(D.james.sigla)} · ${D.james.durata} min</span>
                <button type="button" data-chiudi class="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Chiudi">
                    <span class="material-icons" aria-hidden="true">close</span></button>
            </div>
            <h2 class="relative mt-5 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95]">Allenati con James</h2>
            <p class="relative mt-2 font-bold text-secondary">${esc(giorno)}</p>
            <p class="relative mt-1 text-sm text-white/70">È una richiesta: ti contattiamo per confermare orario e sede (${esc(D.sedi.join(', '))}). Si paga dopo la conferma.</p>
        </div>
        <form class="px-5 sm:px-8 py-7" novalidate>
            <div class="space-y-5">
                <fieldset>
                    <legend class="${label}">Fascia oraria</legend>
                    <div class="mt-2 grid grid-cols-2 gap-2">
                        ${FASCE.map((f) => `
                            <label class="${scelta} p-3">
                                <input type="radio" name="fascia" value="${f.id}" ${f.id === fasciaScelta ? 'checked' : ''} required class="sr-only" />
                                <span class="block font-black text-gray-900">${f.nome}</span>
                                <span class="block text-xs font-semibold text-gray-500">${f.ore}</span>
                            </label>`).join('')}
                    </div>
                </fieldset>
                <fieldset>
                    <legend class="${label}">Quanti atleti? <span class="normal-case tracking-normal font-semibold text-gray-400">· prezzo a persona, campo incluso</span></legend>
                    <div class="mt-2 grid grid-cols-5 gap-2">
                        ${ATLETI.map((n) => `
                            <label class="${scelta} py-2.5 px-1">
                                <input type="radio" name="atleti" value="${n}" ${n === 1 ? 'checked' : ''} required class="sr-only" />
                                <span class="block text-xl font-black text-gray-900">${n}</span>
                                <span class="block text-[11px] font-bold text-gray-500 tabular-nums">${D.james.prezzi[n]} €</span>
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
                    <textarea name="note" rows="2" maxlength="500" class="${input}" placeholder="Con chi vieni, cosa vuoi migliorare, sede preferita…"></textarea>
                </label>
                <!-- Campo trappola per i bot: invisibile alle persone -->
                <label class="hidden" aria-hidden="true">Sito web<input name="sito" tabindex="-1" autocomplete="off" /></label>
                <label class="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 text-sm text-gray-700 cursor-pointer">
                    <input name="privacy" type="checkbox" required class="mt-0.5 w-5 h-5 rounded-md border-2 border-gray-300 text-primary focus:ring-primary" />
                    <span>Ho letto l'<a href="privacy.html#personal" target="_blank" class="text-primary font-bold underline">informativa privacy</a> e acconsento all'uso di questi dati per essere ricontattato su questa richiesta.</span>
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
        const fascia = FASCE.find((x) => x.id === f.get('fascia'));
        const n = Number(f.get('atleti'));

        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        btn.querySelector('[data-testo]').textContent = 'Invio in corso…';
        try {
            await rpc('richiedi_personal', {
                p_data: data,
                p_fascia: fascia.id,
                p_atleti: n,
                p_livello: f.get('livello'),
                p_nome: f.get('nome'),
                p_email: f.get('email'),
                p_telefono: f.get('telefono'),
                p_note: f.get('note') || null,
                p_privacy: true,
            });
        } catch (e) {
            const testo = `Ciao! Vorrei richiedere un personal con James: ${giorno}, ${fascia.nome.toLowerCase()}, ${atleti(n)}. Livello: ${f.get('livello')}. Sono ${f.get('nome')}.`;
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
                    <p class="mt-4 text-white/75 max-w-sm mx-auto">Abbiamo ricevuto la tua richiesta per <b class="text-white">${esc(giorno)}</b> (${esc(fascia.nome.toLowerCase())}, ${atleti(n)}). Ti contattiamo al più presto per confermare orario e sede.</p>
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
