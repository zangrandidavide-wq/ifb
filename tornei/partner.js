// Tornei della Rookie League organizzati dai centri partner (es. Argo Sport Waves a Paderno).
// Non stanno nel widget Dink di IFB, perché su Dink sono pubblicati da un'altra organizzazione:
// li elenchiamo qui a mano.
//
// - tornei.html: una scheda per ogni torneo, nella sezione "Anche su Dink" (#dink).
//   La scheda resta visibile fino alla fine del torneo; dopo la chiusura delle iscrizioni
//   il pulsante lascia il posto alla scritta "Iscrizioni chiuse".
// - rookie-league.html: sotto ogni data con iscrizioni aperte compare "Vai al torneo";
//   se la data corrisponde a un torneo di questo elenco porta alla sua scheda,
//   altrimenti alla sezione Dink di tornei.html.
//
// Per aggiungere una tappa copia un blocco qui sotto e cambia i dati.
// Orari in ora italiana ("2026-11-29T14:00"), il link è quello di "Condividi" nell'app Dink.

import { dataLunga, esc } from './config.js';

// Centri della Rookie League gestiti da partner: i loro tornei non sono nel widget Dink di IFB
export const CENTRI_PARTNER = ['paderno'];

export const TORNEI_PARTNER = [
    {
        id: 'rl-paderno-2026-11-29',
        centro: 'paderno',
        tappa: '1ª tappa',
        titolo: 'Rookie League · Paderno',
        inizio: '2026-11-29T14:00',
        fine: '2026-11-29T18:00',
        checkIn: '13:00',
        iscrizioniFino: '2026-11-27T12:00',
        formula: '2x2 misto',
        livello: 'Base / Intermedio',
        tipologia: 'Indoor',
        maxSquadre: 16,
        quota: '25 € a persona',
        luogo: 'Country Village',
        indirizzo: 'Via Guglielmo Pepe, 68 – Paderno Dugnano',
        organizzatore: 'Argo Sport Waves',
        link: 'https://dink.social/events/01a1c59d-32dd-78b7-8ade-451efe036ac6',
    },
];

// "2026-11-29T14:00" in ora italiana → Date (gestisce ora solare e legale)
function oraItaliana(s) {
    const [d, h] = s.split('T');
    const [y, m, g] = d.split('-').map(Number);
    const [hh, mm] = h.split(':').map(Number);
    const utc = Date.UTC(y, m - 1, g, hh, mm);
    const roma = new Date(new Date(utc).toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
    const gmt = new Date(new Date(utc).toLocaleString('en-US', { timeZone: 'UTC' }));
    return new Date(utc - (roma - gmt));
}

const giorno = (s) => s.slice(0, 10);
const ora = (s) => s.slice(11, 16);

function stato(t, adesso = new Date()) {
    if (adesso >= oraItaliana(t.fine)) return 'concluso';
    if (adesso >= oraItaliana(t.inizio)) return 'in-corso';
    if (adesso >= oraItaliana(t.iscrizioniFino)) return 'chiuso';
    return 'aperto';
}

// Torneo partner di un centro che cade fra due date (YYYY-MM-DD), se c'è
export function torneoPartner(centro, dal, al) {
    return TORNEI_PARTNER.find((t) => t.centro === centro && giorno(t.inizio) >= dal && giorno(t.inizio) <= al && stato(t) !== 'concluso');
}

function scadenza(t) {
    const d = oraItaliana(t.iscrizioniFino);
    const s = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Rome' });
    return `${s}, ore ${ora(t.iscrizioniFino)}`;
}

function scheda(t) {
    const st = stato(t);
    const [, mese, gg] = giorno(t.inizio).split('-');
    const nomeMese = new Date(Date.UTC(2000, Number(mese) - 1, 15)).toLocaleDateString('it-IT', { month: 'short' }).replace('.', '');
    const maps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(t.indirizzo.replace('–', ','))}`;
    const chip = (testo) => `<span class="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-purple-200 px-3 py-1 text-xs font-bold">${esc(testo)}</span>`;
    const azione = st === 'aperto'
        ? `<a href="${esc(t.link)}" target="_blank" rel="noopener" data-track="cta_iscrizione_dink_partner"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 shadow-lg shadow-primary/30 transition-colors">
              <span class="material-icons" aria-hidden="true">how_to_reg</span> Iscriviti su Dink
           </a>
           <p class="text-xs text-gray-500 dark:text-gray-400">Iscrizioni entro ${esc(scadenza(t))}.<br>Il link si apre nell'app Dink.</p>`
        : `<span class="inline-flex items-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-wider">${st === 'in-corso' ? 'In corso' : 'Iscrizioni chiuse'}</span>`;

    return `
    <article id="${esc(t.id)}" class="scroll-mt-28 overflow-hidden rounded-[2rem] bg-white dark:bg-gray-900 ring-1 ring-gray-100 dark:ring-gray-800 shadow-sm target:ring-2 target:ring-primary">
        <div class="flex flex-col sm:flex-row">
            <div class="t-art relative shrink-0 sm:w-48 flex sm:flex-col items-center justify-center gap-3 sm:gap-1 px-6 py-5 text-white text-center">
                <span class="text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">${esc(t.tappa)}</span>
                <span class="font-poster text-6xl leading-none">${Number(gg)}</span>
                <span class="text-sm font-bold uppercase tracking-[0.25em]">${esc(nomeMese)}</span>
            </div>
            <div class="flex-1 p-6 md:p-7 flex flex-col gap-4">
                <div>
                    <p class="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">Rookie League 2026/2027</p>
                    <h3 class="mt-1 text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">${esc(t.titolo)}</h3>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">In collaborazione con <b class="text-gray-900 dark:text-white">${esc(t.organizzatore)}</b></p>
                </div>
                <ul class="grid gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <li class="flex items-start gap-2"><span class="material-icons text-primary text-[20px]" aria-hidden="true">event</span>
                        <span>${esc(dataLunga(giorno(t.inizio)))} · ore ${esc(ora(t.inizio))}–${esc(ora(t.fine))}${t.checkIn ? ` <span class="text-gray-500 dark:text-gray-400">(check-in dalle ${esc(t.checkIn)})</span>` : ''}</span></li>
                    <li class="flex items-start gap-2"><span class="material-icons text-primary text-[20px]" aria-hidden="true">location_on</span>
                        <a href="${esc(maps)}" target="_blank" rel="noopener" class="hover:underline"><b>${esc(t.luogo)}</b> · ${esc(t.indirizzo)}</a></li>
                </ul>
                <div class="flex flex-wrap gap-2">
                    ${[t.formula, t.livello, t.tipologia, t.maxSquadre ? `Max ${t.maxSquadre} coppie` : '', t.quota].filter(Boolean).map(chip).join('')}
                </div>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">${azione}</div>
            </div>
        </div>
    </article>`;
}

// tornei.html: schede nella sezione Dink
const box = document.getElementById('tornei-partner');
if (box) {
    const visibili = TORNEI_PARTNER.filter((t) => stato(t) !== 'concluso')
        .sort((a, b) => a.inizio.localeCompare(b.inizio));
    if (visibili.length) {
        box.innerHTML = visibili.map(scheda).join('');
        box.classList.remove('hidden');
        // Arrivando da rookie-league.html con #rl-..., la scheda esiste solo adesso
        const target = location.hash && document.getElementById(location.hash.slice(1));
        if (target && box.contains(target)) target.scrollIntoView({ block: 'start' });
    }
}

// rookie-league.html: "Vai al torneo" sotto ogni data con iscrizioni aperte.
// Lo stato delle date (data-state, data-reg) lo calcola lo script della pagina, che gira prima.
// Per i centri IFB il torneo è nel widget Dink, dove di solito c'è solo la prossima tappa:
// il link compare quindi solo sulla prima data aperta di ogni centro.
// Per i centri partner compare solo se il torneo è in TORNEI_PARTNER.
const giaLinkato = new Set();
document.querySelectorAll('[data-event]').forEach((r) => {
    if (r.dataset.state !== 'future' || !['open', 'last'].includes(r.dataset.reg)) return;
    const testo = r.querySelector('.flex-1');
    if (!testo) return;
    const p = torneoPartner(r.dataset.center, r.dataset.start, r.dataset.end);
    if (CENTRI_PARTNER.includes(r.dataset.center) ? !p : giaLinkato.has(r.dataset.center)) return;
    giaLinkato.add(r.dataset.center);
    const a = document.createElement('a');
    a.href = `tornei.html#${p ? p.id : 'dink'}`;
    a.dataset.track = 'rookie_vai_al_torneo';
    a.className = 'mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary dark:text-purple-300 hover:underline';
    a.innerHTML = 'Vai al torneo <span class="material-icons text-[18px]" aria-hidden="true">arrow_forward</span>';
    testo.appendChild(a);
});
