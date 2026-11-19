// Personal (personal.html): listini, calendario settimanale e richiesta di sessione.
//  - sabato e domenica: Personal con James, mattina o pomeriggio (colore viola);
//  - dal lunedì al venerdì: Personal IFB con gli altri coach, solo la sera, con la sede a scelta (colore verde acqua).
// I dati (prezzi, fasce, sedi, chiusure) sono in personal-data.js. La richiesta va alla funzione
// richiedi_personal() su Supabase (supabase/personal.sql), che la salva e fa partire l'email.
// Non ci sono orari fissi: si sceglie giorno e fascia, lo slot lo assegna IFB alla conferma.
import { rpc, esc, dataLunga } from './tornei/config.js';

const D = window.PERSONAL_JAMES;
const WA = '393494633610';
const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const atleti = (n) => n === 1 ? '1 atleta' : `${n} atleti`;
const linkWhatsApp = (testo) => `https://wa.me/${WA}?text=${encodeURIComponent(testo)}`;

// Indice del giorno nella settimana (0 = lunedì … 6 = domenica) → tipo di personal
const tipoDi = (i) => (i >= 5 ? 'james' : 'ifb');

// Classi dei due tipi: scritte per intero perché Tailwind le trovi nel sorgente
const T = {
    james: {
        testo: 'text-primary',
        tile: 'bg-primary hover:bg-primary-dark shadow-primary/25',
        card: 'border-primary/20 hover:border-primary',
        tondo: 'bg-primary',
        sfondo: 'bg-primary/[0.04] dark:bg-primary/10',
        sel: 'bg-primary text-white shadow-lg shadow-primary/30',
        anello: 'ring-primary/25',
        punto: 'bg-primary',
        scelta: 'has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-primary',
        campo: 'focus:border-primary',
        invio: 'bg-primary hover:bg-primary-dark shadow-[0_14px_34px_-12px_rgba(127,19,236,.8)]',
        alone: 'rgba(127,19,236,.55)',
        chip: 'bg-primary/10 text-primary',
    },
    ifb: {
        testo: 'text-teal-600 dark:text-teal-400',
        tile: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25',
        card: 'border-teal-500/25 hover:border-teal-500',
        tondo: 'bg-teal-600',
        sfondo: 'bg-teal-500/[0.06] dark:bg-teal-400/10',
        sel: 'bg-teal-600 text-white shadow-lg shadow-teal-600/30',
        anello: 'ring-teal-500/30',
        punto: 'bg-teal-500',
        scelta: 'has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50 has-[:focus-visible]:ring-teal-600',
        campo: 'focus:border-teal-600',
        invio: 'bg-teal-600 hover:bg-teal-700 shadow-[0_14px_34px_-12px_rgba(13,148,136,.8)]',
        alone: 'rgba(20,184,166,.5)',
        chip: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    },
};

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

// Stato di un giorno: 'passato', 'chiuso', 'futuro' (richiesta non ancora aperta), 'libero'
function statoGiorno(d) {
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
                    <span class="material-icons text-xl" aria-hidden="true">calendar_month</span> Scegli il weekend</a>
            </div>
        </article>
        <article class="rounded-[2rem] bg-white dark:bg-gray-800 border-2 border-teal-500/30 p-7 sm:p-8 sr-stagger-1" data-reveal>
            <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="inline-flex items-center gap-1.5 bg-teal-600 text-white text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">
                    <span class="material-icons text-sm" aria-hidden="true">nightlight</span> Lun–ven · sera</span>
                <span class="inline-flex items-center gap-1 text-sm font-bold text-gray-500 dark:text-gray-400"><span class="material-icons text-lg" aria-hidden="true">timer</span>${f.durata} minuti</span>
            </div>
            <h3 class="mt-4 text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">${esc(f.nome)}</h3>
            <p class="mt-1 font-semibold text-teal-600 dark:text-teal-400">${esc(f.coach)} · ${esc(f.quando)}</p>
            <div class="text-gray-900 dark:text-white">${tabellaPrezzi(f, false)}</div>
            <a href="#calendario" class="mt-6 w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-full hover:-translate-y-0.5 transition">
                <span class="material-icons text-xl" aria-hidden="true">calendar_month</span> Scegli la sera</a>
        </article>`;
}

// ─── Calendario ───────────────────────────────────────────────────────────
const cal = document.getElementById('cal');
// Si parte dalla settimana corrente (o da quella d'inizio, se il progetto non è ancora partito)
let settimana = lunedi(iso(oggi) > D.dal ? oggi : daIso(D.dal));
let giornoScelto = null;   // telefono: giorno aperto (0 = lun … 6 = dom)

// Righe della griglia desktop: una per fascia, nell'ordine della giornata
const FASCE_TUTTE = [...D.james.fasce, ...D.ifb.fasce];
const RIGA = Object.fromEntries(FASCE_TUTTE.map((f, k) => [f.id, k + 2]));

function etichettaSettimana(lun) {
    const dom = piuGiorni(lun, 6);
    const stessoMese = lun.getMonth() === dom.getMonth();
    return `${lun.getDate()}${stessoMese ? '' : ' ' + MESI[lun.getMonth()]} – ${dom.getDate()} ${MESI[dom.getMonth()]} ${dom.getFullYear()}`;
}

const MSG = {
    passato: ['history', 'Giorno passato'],
    chiuso: ['event_busy', 'Niente personal'],
};
const messaggio = (g, stato) => stato === 'futuro' ? ['hourglass_empty', `Richiedibile dal ${apre(g)}`] : MSG[stato];

function riquadroVuoto(g, stato, extra = '') {
    const [icona, testo] = messaggio(g, stato);
    return `
        <div class="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-3 text-center text-gray-400 ${extra}">
            <span class="material-icons" aria-hidden="true">${icona}</span>
            <span class="text-xs font-bold">${testo}</span>
        </div>`;
}

// Telefono: le fasce del giorno scelto come card grandi
function contenutoGrande(d, i, stato) {
    const g = iso(d), tipo = tipoDi(i), P = D[tipo], t = T[tipo];
    if (stato !== 'libero') return riquadroVuoto(g, stato, 'py-8');
    return '<div class="space-y-3">' + P.fasce.map((f) => `
        <button type="button" data-richiedi="${g}|${f.id}"
            class="w-full flex items-center gap-4 rounded-3xl border-2 ${t.card} bg-white dark:bg-gray-800 p-4 text-left active:scale-[.98] transition">
            <span class="shrink-0 w-12 h-12 rounded-2xl ${t.tondo} text-white flex items-center justify-center"><span class="material-icons" aria-hidden="true">${f.icona}</span></span>
            <span class="flex-1 min-w-0">
                <span class="block font-black text-gray-900 dark:text-white">${f.nome}</span>
                <span class="block text-xs font-semibold text-gray-500 dark:text-gray-400">indicativamente ${f.ore}</span>
            </span>
            <span class="shrink-0 inline-flex items-center gap-1 text-sm font-extrabold ${t.testo}">Richiedi<span class="material-icons text-lg" aria-hidden="true">arrow_forward</span></span>
        </button>`).join('') + '</div>';
}

// Desktop: celle di un giorno nella griglia (colonna = giorno, riga = fascia)
function celleGiorno(d, i, stato) {
    const g = iso(d), tipo = tipoDi(i), P = D[tipo], t = T[tipo];
    const col = i + 2;
    const pos = (righe) => {
        const r = righe.map((id) => RIGA[id]);
        return `grid-column:${col};grid-row:${Math.min(...r)} / ${Math.max(...r) + 1}`;
    };
    const mie = P.fasce.map((f) => f.id);
    const altre = FASCE_TUTTE.map((f) => f.id).filter((id) => !mie.includes(id));
    let html = altre.length ? `<div class="cal-feriale rounded-2xl" style="${pos(altre)}" aria-hidden="true"></div>` : '';
    if (stato !== 'libero') {
        html += `<div class="flex" style="${pos(mie)}">${riquadroVuoto(g, stato, 'flex-1')}</div>`;
    } else {
        html += P.fasce.map((f) => `
            <button type="button" data-richiedi="${g}|${f.id}" style="${pos([f.id])}"
                class="flex flex-col justify-between rounded-2xl ${t.tile} text-white p-3 text-left shadow-lg hover:-translate-y-0.5 transition">
                <span class="flex items-start justify-between gap-1"><span class="font-black text-sm leading-tight">${f.nome}</span><span class="material-icons text-lg text-white/70" aria-hidden="true">${f.icona}</span></span>
                <span class="text-xs font-bold text-white/80">${f.ore}</span>
                <span class="inline-flex items-center text-xs font-extrabold">Richiedi<span class="material-icons text-sm" aria-hidden="true">arrow_forward</span></span>
            </button>`).join('');
    }
    return html;
}

function legenda() {
    const voce = (tipo, testo) => `<span class="inline-flex items-center gap-2 rounded-full ${T[tipo].chip} px-3 py-1.5 text-xs font-extrabold">
        <span class="w-2.5 h-2.5 rounded-full ${T[tipo].punto}" aria-hidden="true"></span>${testo}</span>`;
    return `<div class="mb-5 flex flex-wrap justify-center gap-2">
        ${voce('james', `${esc(D.james.nome)} · sab e dom · ${D.james.durata} min`)}
        ${voce('ifb', `${esc(D.ifb.nome)} · lun–ven sera · ${D.ifb.durata} min`)}
    </div>`;
}

function renderCalendario() {
    const giorni = Array.from({ length: 7 }, (_, i) => piuGiorni(settimana, i));
    const stati = giorni.map(statoGiorno);
    const prima = settimana <= primoLunedi;
    const ultima = settimana >= ultimoLunedi;
    if (giornoScelto == null) {
        giornoScelto = stati.indexOf('libero');
        if (giornoScelto < 0) giornoScelto = Math.max(0, stati.findIndex((s) => s !== 'passato'));
    }

    // Desktop: colonna delle fasce + 7 giorni
    const testate = giorni.map((d, i) => {
        const t = T[tipoDi(i)];
        const eOggi = iso(d) === iso(oggi);
        return `
            <div class="pb-2 text-center" style="grid-column:${i + 2};grid-row:1">
                <span class="block text-[11px] font-black uppercase tracking-[0.2em] ${t.testo}">${GIORNI[i]}</span>
                <span class="mt-1 mx-auto w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${eOggi ? 'bg-secondary text-gray-900' : 'text-gray-900 dark:text-white'}">${d.getDate()}</span>
            </div>`;
    }).join('');
    const etichette = FASCE_TUTTE.map((f) => `
        <div class="flex flex-col justify-center pr-2" style="grid-column:1;grid-row:${RIGA[f.id]}">
            <span class="material-icons text-gray-400" aria-hidden="true">${f.icona}</span>
            <span class="mt-1 text-sm font-black text-gray-900 dark:text-white">${f.nome}</span>
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">${f.ore}</span>
        </div>`).join('');
    const celle = giorni.map((d, i) => celleGiorno(d, i, stati[i])).join('');

    // Telefono: striscia dei giorni + fasce del giorno scelto
    const striscia = giorni.map((d, i) => {
        const t = T[tipoDi(i)];
        const sel = i === giornoScelto;
        const libero = stati[i] === 'libero';
        return `
            <button type="button" data-giorno="${i}" aria-pressed="${sel}" aria-label="${esc(dataLunga(iso(d)))}"
                class="flex flex-col items-center gap-1 rounded-2xl py-2 min-h-[4.25rem] transition ${sel ? t.sel : `bg-white dark:bg-gray-800 ring-2 ${t.anello} ${libero ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}">
                <span class="text-[10px] font-black uppercase tracking-wider">${GIORNI[i]}</span>
                <span class="text-lg font-black leading-none">${d.getDate()}</span>
                <span class="w-1.5 h-1.5 rounded-full ${libero ? (sel ? 'bg-white' : t.punto) : 'bg-gray-300'}"></span>
            </button>`;
    }).join('');
    const tipoScelto = tipoDi(giornoScelto);
    const P = D[tipoScelto];

    cal.innerHTML = `
        <div class="flex items-center justify-between gap-3 mb-5">
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
        ${legenda()}

        <div class="lg:hidden">
            <div class="grid grid-cols-7 gap-1.5">${striscia}</div>
            <div class="mt-5 mb-3">
                <p class="text-sm font-black text-gray-900 dark:text-white">${dataLunga(iso(giorni[giornoScelto]))}</p>
                <p class="text-xs font-bold ${T[tipoScelto].testo}">${esc(P.nome)} · ${esc(P.coach.charAt(0).toLowerCase() + P.coach.slice(1))} · ${P.durata} min</p>
            </div>
            ${contenutoGrande(giorni[giornoScelto], giornoScelto, stati[giornoScelto])}
        </div>

        <div class="hidden lg:grid gap-2" style="grid-template-columns:6.5rem repeat(7,minmax(0,1fr));grid-template-rows:auto repeat(${FASCE_TUTTE.length},minmax(7rem,auto))">
            ${testate}${etichette}${celle}
        </div>

        <p class="mt-6 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="material-icons text-lg text-primary" aria-hidden="true">info</span>
            Scegli giorno e fascia: l'orario preciso te lo proponiamo noi alla conferma. Ogni giorno si può richiedere a partire da una settimana prima.
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
const label = 'block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500';
const LIVELLI = ['Principiante', 'Intermedio', 'Avanzato', 'Agonista'];
const INDIFFERENTE = { id: 'indifferente', nome: 'Indifferente', ore: 'va bene tutto' };

// Scelta della sede per i Personal IFB (nel weekend la sede la decide IFB in base alle richieste)
function sceltaSede(scelta) {
    const voce = (valore, nome, sotto, icona, checked) => `
        <label class="${scelta} p-3">
            <input type="radio" name="sede" value="${esc(valore)}" ${checked ? 'checked' : ''} class="sr-only" />
            <span class="material-icons text-teal-600" aria-hidden="true">${icona}</span>
            <span class="block font-black text-gray-900">${esc(nome)}</span>
            <span class="block text-xs font-semibold text-gray-500">${esc(sotto)}</span>
        </label>`;
    return `
        <fieldset class="min-w-0">
            <legend class="${label}">In quale sede?</legend>
            <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                ${D.sedi.map((s) => voce(s, s, 'sede IFB', 'location_on', false)).join('')}
                ${voce('', 'Indifferente', 'va bene tutto', 'map', true)}
            </div>
        </fieldset>`;
}

function apriRichiesta(data, fasciaScelta) {
    const giorno = dataLunga(data);
    const tipo = tipoDi((daIso(data).getDay() + 6) % 7);
    const P = D[tipo], t = T[tipo];
    const fasce = tipo === 'james' ? [...P.fasce, INDIFFERENTE] : P.fasce;
    const prezzi = Object.keys(P.prezzi).map(Number);
    const input = `mt-1.5 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white ${t.campo} focus:ring-0 transition`;
    const scelta = `relative cursor-pointer rounded-2xl border-2 border-gray-100 text-center transition ${t.scelta} has-[:focus-visible]:ring-2`;
    const unica = fasce.length === 1 ? fasce[0] : null;

    dialog.setAttribute('aria-label', tipo === 'james' ? 'Richiesta di sessione con James' : 'Richiesta di Personal IFB');
    dialog.innerHTML = `
        <div class="relative overflow-hidden bg-slate-950 text-white px-5 sm:px-8 pt-6 pb-7">
            <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(circle at 85% 0%,${t.alone},transparent 60%),radial-gradient(circle at 0% 100%,rgba(255,215,0,.18),transparent 55%)" aria-hidden="true"></div>
            <div class="relative flex items-start justify-between gap-4">
                <span class="inline-flex items-center gap-1.5 ${tipo === 'james' ? 'bg-secondary text-gray-900' : 'bg-teal-500 text-white'} text-[11px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">
                    <span class="material-icons text-sm" aria-hidden="true">event_available</span> ${esc(P.sigla)} · ${P.durata} min</span>
                <button type="button" data-chiudi class="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Chiudi">
                    <span class="material-icons" aria-hidden="true">close</span></button>
            </div>
            <h2 class="relative mt-5 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95]">${tipo === 'james' ? 'Allenati con James' : 'Personal IFB'}</h2>
            <p class="relative mt-2 font-bold ${tipo === 'james' ? 'text-secondary' : 'text-teal-300'}">${esc(giorno)}${unica ? ` · ${esc(unica.nome.toLowerCase())}, ${unica.ore}` : ''}</p>
            <p class="relative mt-1 text-sm text-white/70">È una richiesta: ti contattiamo per confermare ${tipo === 'james' ? `orario e sede (${esc(D.sedi.join(', '))})` : 'orario e allenatore'}. Si paga dopo la conferma.</p>
        </div>
        <form class="px-5 sm:px-8 py-7" novalidate>
            <div class="space-y-5">
                ${unica ? `<input type="hidden" name="fascia" value="${unica.id}" />` : `
                <fieldset>
                    <legend class="${label}">Fascia oraria</legend>
                    <div class="mt-2 grid grid-cols-2 ${fasce.length === 3 ? 'sm:grid-cols-3' : ''} gap-2">
                        ${fasce.map((f, k) => `
                            <label class="${scelta} p-3 ${fasce.length % 2 && k === fasce.length - 1 ? 'col-span-2 sm:col-span-1' : ''}">
                                <input type="radio" name="fascia" value="${f.id}" ${f.id === fasciaScelta ? 'checked' : ''} required class="sr-only" />
                                <span class="block font-black text-gray-900">${f.nome}</span>
                                <span class="block text-xs font-semibold text-gray-500">${f.ore}</span>
                            </label>`).join('')}
                    </div>
                </fieldset>`}
                ${tipo === 'ifb' ? sceltaSede(scelta) : ''}
                <fieldset>
                    <legend class="${label}">Quanti atleti? <span class="normal-case tracking-normal font-semibold text-gray-400">· prezzo a persona, campo incluso</span></legend>
                    <div class="mt-2 grid grid-cols-5 gap-2">
                        ${prezzi.map((n) => `
                            <label class="${scelta} py-2.5 px-1">
                                <input type="radio" name="atleti" value="${n}" ${n === 1 ? 'checked' : ''} required class="sr-only" />
                                <span class="block text-xl font-black text-gray-900">${n}</span>
                                <span class="block text-[11px] font-bold text-gray-500 tabular-nums">${P.prezzi[n]} €</span>
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
                <label class="flex items-start gap-3 rounded-2xl ${tipo === 'james' ? 'bg-primary/5' : 'bg-teal-50'} p-4 text-sm text-gray-700 cursor-pointer">
                    <input name="privacy" type="checkbox" required class="mt-0.5 w-5 h-5 rounded-md border-2 border-gray-300 ${tipo === 'james' ? 'text-primary focus:ring-primary' : 'text-teal-600 focus:ring-teal-600'}" />
                    <span>Ho letto l'<a href="privacy.html#personal" target="_blank" class="${t.testo} font-bold underline">informativa privacy</a> e acconsento all'uso di questi dati per essere ricontattato su questa richiesta.</span>
                </label>
            </div>
            <div data-errore class="hidden mt-5 rounded-xl bg-red-50 text-red-700 text-sm font-bold px-4 py-3" role="alert"></div>
            <button type="submit" class="mt-6 w-full inline-flex items-center justify-center gap-3 ${t.invio} text-white font-black uppercase tracking-wide text-lg px-6 py-4 rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
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
        const fascia = fasce.find((x) => x.id === f.get('fascia'));
        const n = Number(f.get('atleti'));
        const sede = f.get('sede') || null;

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
                ...(tipo === 'ifb' ? { p_sede: sede } : {}),
            });
        } catch (e) {
            const chi = tipo === 'james' ? 'un personal con James' : `un Personal IFB${sede ? ` a ${sede}` : ''}`;
            const testo = `Ciao! Vorrei richiedere ${chi}: ${giorno}, ${fascia.nome.toLowerCase()}, ${atleti(n)}. Livello: ${f.get('livello')}. Sono ${f.get('nome')}.`;
            mostraErrore(e.message, linkWhatsApp(testo));
            btn.disabled = false;
            btn.querySelector('[data-testo]').textContent = 'Invia la richiesta';
            return;
        }
        dialog.innerHTML = `
            <div class="relative overflow-hidden bg-slate-950 text-white px-8 py-12 text-center">
                <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(circle at 50% 0%,${t.alone},transparent 65%)" aria-hidden="true"></div>
                <div class="relative">
                    <span class="mx-auto w-20 h-20 rounded-full bg-secondary flex items-center justify-center shadow-[0_0_60px_rgba(255,215,0,.5)]">
                        <span class="material-icons text-5xl text-gray-900" aria-hidden="true">check</span>
                    </span>
                    <p class="mt-6 text-[11px] font-black uppercase tracking-[0.25em] text-secondary">Richiesta inviata</p>
                    <h2 class="mt-2 text-4xl font-black uppercase leading-none">Ci sentiamo<br>a breve!</h2>
                    <p class="mt-4 text-white/75 max-w-sm mx-auto">Abbiamo ricevuto la tua richiesta per <b class="text-white">${esc(giorno)}</b> (${esc(fascia.nome.toLowerCase())}, ${atleti(n)}${sede ? `, a ${esc(sede)}` : ''}). Ti contattiamo al più presto per confermare ${tipo === 'james' ? 'orario e sede' : 'orario e allenatore'}.</p>
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
