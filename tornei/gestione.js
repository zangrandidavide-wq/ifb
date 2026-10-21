// Pagina degli organizzatori (gestione-tornei.html): accesso, tornei, locandine, iscritti ed esportazione.
// La versione della libreria è fissata: aggiornarla di proposito, non lasciarla flottare.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, LOCANDINE_BUCKET, locandinaUrl, SESSO, formula, dataLunga, dataEOra, dataOra, esc } from './config.js';
import { cardTorneo, countdown, aggiornaCountdown, COLORE_SESSO } from './card.js';

// storageKey proprio: la sessione degli organizzatori non si mescola con quella dell'area riservata
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'ifb-tornei-auth' },
});

const $ = (id) => document.getElementById(id);
const VISTE = ['caricamento', 'vista-login', 'vista-negato', 'vista-tornei'];
let tornei = [];

function mostra(vista) {
    VISTE.forEach((v) => $(v).classList.toggle('hidden', v !== vista));
}

function errore(el, msg) {
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
}

const iscritteDi = (t) => t.tornei_iscrizioni?.[0]?.count ?? 0;

// ─── Accesso ──────────────────────────────────────────────────────────────
async function avvia(session) {
    if (!session) {
        mostra('vista-login');
        return;
    }
    const { data: org, error } = await supabase.from('tornei_organizzatori').select('nome').eq('user_id', session.user.id).maybeSingle();
    if (error) {
        console.error('Verifica organizzatore fallita:', error);
        await supabase.auth.signOut();
        mostra('vista-login');
        errore($('login-errore'), `Accesso riuscito, ma il database ha risposto con un errore: ${error.message}`);
        return;
    }
    if (!org) {
        mostra('vista-negato');
        return;
    }
    $('utente-nome').textContent = org.nome.split(' ')[0];
    mostra('vista-tornei');
    try {
        await caricaTornei();
    } catch (e) {
        console.error('Caricamento tornei fallito:', e);
    }
}

// Messaggi di Supabase Auth tradotti. Gli altri si mostrano così come arrivano:
// un generico "riprova" nasconderebbe il motivo vero (es. account mai confermato).
const ERRORI_ACCESSO = {
    invalid_credentials: 'Email o password non corrette.',
    email_not_confirmed: 'Questo account non è ancora confermato. Chiedi a Davide di confermarlo da Supabase (Authentication → Users).',
    user_banned: 'Questo account è stato disattivato.',
    over_request_rate_limit: 'Troppi tentativi ravvicinati: aspetta qualche minuto e riprova.',
};

function messaggioAccesso(error) {
    if (ERRORI_ACCESSO[error.code]) return ERRORI_ACCESSO[error.code];
    if (/invalid login credentials/i.test(error.message)) return ERRORI_ACCESSO.invalid_credentials;
    if (/email not confirmed/i.test(error.message)) return ERRORI_ACCESSO.email_not_confirmed;
    if (error.name === 'AuthRetryableFetchError' || error.status === 0) return 'Supabase non raggiungibile: controlla la connessione e riprova.';
    return `Accesso non riuscito: ${error.message}`;
}

$('login-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = ev.target.querySelector('[type=submit]');
    errore($('login-errore'), '');
    btn.disabled = true;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: $('login-email').value.trim(),
            password: $('login-password').value,
        });
        if (error) {
            console.error('Accesso fallito:', error);
            errore($('login-errore'), messaggioAccesso(error));
            return;
        }
        await avvia(data.session);
    } catch (e) {
        console.error('Accesso fallito:', e);
        errore($('login-errore'), `Accesso non riuscito: ${e.message}`);
    } finally {
        btn.disabled = false;
    }
});

document.querySelectorAll('[data-esci]').forEach((b) => b.addEventListener('click', async () => {
    await supabase.auth.signOut();
    avvia(null);
}));

$('btn-password').addEventListener('click', () => {
    $('form-password').reset();
    errore($('password-msg'), '');
    $('dlg-password').showModal();
});

$('form-password').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const form = ev.target;
    const msg = $('password-msg');
    if (!form.checkValidity()) {
        msg.className = 'text-sm font-bold text-red-600';
        errore(msg, 'La password deve avere almeno 8 caratteri.');
        return;
    }
    const { error } = await supabase.auth.updateUser({ password: form.password.value });
    msg.className = `text-sm font-bold ${error ? 'text-red-600' : 'text-green-700'}`;
    errore(msg, error ? 'Non è stato possibile cambiarla. Prova una password diversa.' : 'Password aggiornata.');
    if (!error) form.reset();
});

// ─── Plancia ──────────────────────────────────────────────────────────────
function oggi() {
    return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' }); // AAAA-MM-GG
}

function stato(t) {
    if (!t.pubblicato) return { k: 'bozza', html: '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border-2 border-dashed border-gray-300 text-gray-500">Bozza</span>' };
    if (t.data < oggi()) return { k: 'concluso', html: '<span class="inline-flex px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gray-100 text-gray-500">Concluso</span>' };
    if (new Date(t.chiusura_iscrizioni) <= new Date()) return { k: 'chiuso', html: '<span class="inline-flex px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">Iscrizioni chiuse</span>' };
    return {
        k: 'aperto',
        html: `<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-green-100 text-green-800">
                   <span class="relative flex w-2 h-2"><span class="t-ping absolute inset-0 rounded-full bg-green-500"></span><span class="relative w-2 h-2 rounded-full bg-green-500"></span></span>Iscrizioni aperte</span>`,
    };
}

function renderStats() {
    const futuri = tornei.filter((t) => t.data >= oggi());
    const aperti = futuri.filter((t) => stato(t).k === 'aperto');
    const squadre = futuri.reduce((n, t) => n + iscritteDi(t), 0);
    const tile = (n, label, icona, cls) => `
        <div class="relative overflow-hidden rounded-3xl p-4 sm:p-6 shadow-xl ${cls}">
            <span class="material-symbols-outlined absolute -right-2 -bottom-3 text-[5.5rem] sm:text-[7rem] opacity-10" aria-hidden="true">${icona}</span>
            <dd class="relative font-poster text-5xl sm:text-6xl leading-none">${n}</dd>
            <dt class="relative mt-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] opacity-75">${label}</dt>
        </div>`;
    $('stats').innerHTML =
        tile(futuri.length, 'In programma', 'calendar_month', 'bg-white text-gray-900') +
        tile(aperti.length, 'Iscrizioni aperte', 'how_to_reg', 'bg-primary text-white shadow-primary/30') +
        tile(squadre, 'Squadre iscritte', 'groups', 'bg-secondary text-gray-900 shadow-secondary/40');
}

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

function riga(t) {
    const n = iscritteDi(t);
    const s = stato(t);
    const img = locandinaUrl(t.locandina_path);
    const acc = COLORE_SESSO[t.sesso];
    const [, m, d] = t.data.split('-').map(Number);
    const pct = t.max_squadre ? Math.min(100, Math.round((n / t.max_squadre) * 100)) : null;

    return `
        <article class="group bg-white rounded-[1.75rem] shadow-sm hover:shadow-xl transition-shadow p-3 sm:p-4 grid grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)_auto] gap-4 sm:gap-5 items-center" style="--acc:${acc}">
            <div class="relative w-24 sm:w-32 aspect-[4/5] rounded-2xl overflow-hidden ${img ? 'bg-gray-100' : 't-art'}">
                ${img ? `<img src="${esc(img)}" alt="" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />` : ''}
                <div class="absolute top-2 left-2 rounded-xl bg-white text-gray-900 text-center overflow-hidden shadow-lg w-11">
                    <div class="text-[8px] font-black uppercase tracking-wider py-0.5" style="background:var(--acc)">${MESI[m - 1]}</div>
                    <div class="font-poster text-2xl leading-none py-1">${d}</div>
                </div>
            </div>

            <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                    ${s.html}
                    <span class="font-poster text-lg leading-none bg-secondary px-2 py-0.5 rounded-md">${esc(formula(t.giocatori_per_squadra).replace('x', '×'))}</span>
                    <span class="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full" style="background:color-mix(in srgb, var(--acc) 22%, white)">${esc(SESSO[t.sesso])}</span>
                </div>
                <h3 class="mt-2 font-poster uppercase text-2xl sm:text-3xl leading-none truncate">${esc(t.titolo)}</h3>
                <p class="mt-1.5 text-sm text-gray-600 truncate">${esc(dataEOra(t))} · <b>${esc(t.luogo)}</b></p>
                <p class="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm" aria-hidden="true">timer</span>
                    ${s.k === 'aperto' ? `Chiude tra <b class="text-gray-900 tabular-nums" data-countdown="${esc(t.chiusura_iscrizioni)}">${countdown(t.chiusura_iscrizioni)}</b> · ` : ''}${esc(dataOra(t.chiusura_iscrizioni))}
                </p>
            </div>

            <div class="col-span-2 md:col-span-1 flex md:flex-col items-stretch gap-3 md:w-56">
                <button type="button" data-azione="iscritti" data-id="${t.id}"
                    class="flex-grow md:flex-grow-0 text-left rounded-2xl bg-stage text-white px-4 py-3 hover:bg-primary transition-colors">
                    <span class="flex items-baseline justify-between gap-2">
                        <span class="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Iscritti</span>
                        <span><span class="font-poster text-3xl leading-none">${n}</span>${t.max_squadre ? `<span class="font-poster text-lg text-white/40"> / ${t.max_squadre}</span>` : ''}</span>
                    </span>
                    ${pct !== null ? `<span class="mt-2 block h-1.5 rounded-full bg-white/15 overflow-hidden"><span class="t-bar block h-full rounded-full" style="width:${Math.max(pct, 3)}%"></span></span>` : '<span class="mt-1 block text-[11px] text-white/50">Nessun limite di squadre</span>'}
                </button>
                <div class="flex md:justify-end gap-1.5">
                    <button type="button" data-azione="modifica" data-id="${t.id}" class="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-background-light font-bold text-sm hover:bg-primary hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-lg" aria-hidden="true">edit</span>Modifica</button>
                    <button type="button" data-azione="elimina" data-id="${t.id}" class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-background-light text-red-600 hover:bg-red-600 hover:text-white transition-colors" aria-label="Elimina ${esc(t.titolo)}">
                        <span class="material-symbols-outlined text-lg" aria-hidden="true">delete</span></button>
                </div>
            </div>
        </article>`;
}

async function caricaTornei() {
    const { data, error } = await supabase.from('tornei').select('*, tornei_iscrizioni(count)').order('data', { ascending: true }).order('ora_inizio', { ascending: true, nullsFirst: false });
    if (error) {
        $('lista').innerHTML = '<p class="rounded-3xl bg-red-50 text-red-700 font-bold p-6">Non è stato possibile caricare i tornei. Ricarica la pagina.</p>';
        return;
    }
    tornei = data;
    const d = oggi();
    const futuri = tornei.filter((t) => t.data >= d);
    const passati = tornei.filter((t) => t.data < d).reverse();
    renderStats();
    $('lista').innerHTML = futuri.length
        ? futuri.map(riga).join('')
        : `<button type="button" data-azione="nuovo" class="w-full rounded-[1.75rem] border-2 border-dashed border-gray-300 hover:border-primary hover:bg-white transition-colors p-12 text-center">
               <span class="material-symbols-outlined text-6xl text-primary" aria-hidden="true">add_circle</span>
               <span class="block mt-3 font-poster uppercase text-3xl">Nessun torneo in programma</span>
               <span class="block mt-1 text-gray-500">Tocca qui per crearne uno nuovo</span>
           </button>`;
    $('passati-box').classList.toggle('hidden', !passati.length);
    $('lista-passati').innerHTML = passati.map(riga).join('');
}

$('vista-tornei').addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-azione]');
    if (!btn) return;
    if (btn.dataset.azione === 'nuovo') { apriEditor(); return; }
    const t = tornei.find((x) => x.id === btn.dataset.id);
    if (!t) return;
    if (btn.dataset.azione === 'modifica') apriEditor(t);
    if (btn.dataset.azione === 'iscritti') apriIscritti(t);
    if (btn.dataset.azione === 'elimina') {
        const n = iscritteDi(t);
        const avviso = n ? `\n\nATTENZIONE: verranno eliminate anche le ${n} iscrizioni ricevute.` : '';
        if (!confirm(`Eliminare definitivamente "${t.titolo}"?${avviso}`)) return;
        const { error } = await supabase.from('tornei').delete().eq('id', t.id);
        if (error) { alert('Eliminazione non riuscita. Riprova.'); return; }
        if (t.locandina_path) await supabase.storage.from(LOCANDINE_BUCKET).remove([t.locandina_path]);
        caricaTornei();
    }
});

// ─── Crea / modifica ──────────────────────────────────────────────────────
const form = $('form-torneo');
let inModifica = null;       // torneo aperto nell'editor (null = nuovo)
let nuovaLocandina = null;   // Blob già ridimensionato, da caricare al salvataggio
let rimuoviLocandina = false;
let anteprimaUrl = '';       // immagine mostrata nell'editor e nell'anteprima della card

// "2026-11-07T23:59" nel fuso del browser, per l'input datetime-local
function aDatetimeLocal(iso) {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function anteprima(url) {
    anteprimaUrl = url;
    $('locandina-anteprima').classList.toggle('hidden', !url);
    $('locandina-vuota').classList.toggle('hidden', !!url);
    $('locandina-rimuovi').classList.toggle('hidden', !url);
    if (url) $('locandina-anteprima').src = url;
    else $('locandina-anteprima').removeAttribute('src');
    aggiornaAnteprima();
}

// La card come apparirà su tornei.html, aggiornata a ogni modifica del modulo
function aggiornaAnteprima() {
    const f = form.elements;
    const traUnaSettimana = new Date(Date.now() + 7 * 864e5);
    const t = {
        id: 'anteprima',
        titolo: f.titolo.value.trim() || 'Nome del torneo',
        sesso: f.sesso.value || 'misto',
        giocatori_per_squadra: Number(f.giocatori_per_squadra.value) || 2,
        data: f.data.value || traUnaSettimana.toLocaleDateString('sv-SE'),
        ora_inizio: f.ora_inizio.value || null,
        luogo: f.luogo.value.trim() || 'Luogo',
        chiusura_iscrizioni: f.chiusura_iscrizioni.value ? new Date(f.chiusura_iscrizioni.value).toISOString() : traUnaSettimana.toISOString(),
        max_squadre: f.max_squadre.value ? Number(f.max_squadre.value) : null,
        quota: f.quota.value.trim() || null,
        descrizione: f.descrizione.value.trim() || null,
        squadre_iscritte: inModifica ? iscritteDi(inModifica) : 0,
    };
    $('anteprima').innerHTML = cardTorneo(t, { anteprima: true, img: anteprimaUrl });
    const pubblicato = f.pubblicato.checked;
    $('pubblica-label').textContent = pubblicato ? 'Pubblicato' : 'Bozza';
    $('pubblica-label').nextElementSibling.textContent = pubblicato ? 'Visibile su tornei.html' : 'Visibile solo agli organizzatori';
}

form.addEventListener('input', aggiornaAnteprima);
form.addEventListener('change', aggiornaAnteprima);

function apriEditor(t = null) {
    inModifica = t;
    nuovaLocandina = null;
    rimuoviLocandina = false;
    form.reset();
    errore($('torneo-errore'), '');
    $('locandina-file').value = '';
    $('dlg-torneo-titolo').textContent = t ? 'Modifica torneo' : 'Nuovo torneo';
    if (t) {
        for (const k of ['titolo', 'sesso', 'giocatori_per_squadra', 'data', 'luogo', 'quota', 'max_squadre', 'descrizione']) {
            form.elements[k].value = t[k] ?? '';
        }
        form.elements.ora_inizio.value = t.ora_inizio ? t.ora_inizio.slice(0, 5) : '';
        form.elements.chiusura_iscrizioni.value = aDatetimeLocal(t.chiusura_iscrizioni);
        form.elements.pubblicato.checked = t.pubblicato;
    }
    anteprima(t ? locandinaUrl(t.locandina_path) : '');
    $('dlg-torneo').showModal();
    form.querySelector('.overflow-y-auto').scrollTop = 0;
}

$('btn-nuovo').addEventListener('click', () => apriEditor());

// Scelta la data del torneo, propone la chiusura iscrizioni alle 23:59 del giorno prima
form.elements.data.addEventListener('change', () => {
    const c = form.elements.chiusura_iscrizioni;
    if (c.value || !form.elements.data.value) return;
    const [y, m, d] = form.elements.data.value.split('-').map(Number);
    c.value = aDatetimeLocal(new Date(y, m - 1, d - 1, 23, 59));
});

// Le foto da telefono pesano diversi MB: le riduciamo a 1600px prima di caricarle
async function ridimensiona(file) {
    const img = await createImageBitmap(file);
    const scala = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scala);
    canvas.height = Math.round(img.height * scala);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.85));
    // Alcuni Safari non sanno creare WebP e restituiscono PNG: in quel caso meglio JPEG
    return blob && blob.type === 'image/webp' ? blob : new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.88));
}

async function usaFile(file) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        errore($('torneo-errore'), 'Usa un\'immagine JPG, PNG o WebP.');
        return;
    }
    try {
        nuovaLocandina = await ridimensiona(file);
    } catch {
        errore($('torneo-errore'), 'Immagine non leggibile. Usa un file JPG, PNG o WebP.');
        return;
    }
    errore($('torneo-errore'), '');
    rimuoviLocandina = false;
    anteprima(URL.createObjectURL(nuovaLocandina));
}

$('locandina-file').addEventListener('change', (ev) => usaFile(ev.target.files[0]));

// Trascinamento della locandina dal computer
const drop = $('drop');
['dragenter', 'dragover'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((e) => drop.addEventListener(e, () => drop.classList.remove('over')));
drop.addEventListener('drop', (ev) => { ev.preventDefault(); usaFile(ev.dataTransfer.files[0]); });

$('locandina-rimuovi').addEventListener('click', () => {
    nuovaLocandina = null;
    rimuoviLocandina = true;
    $('locandina-file').value = '';
    anteprima('');
});

form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const err = $('torneo-errore');
    errore(err, '');
    if (!form.checkValidity()) {
        const primo = form.querySelector(':invalid');
        errore(err, 'Completa i campi obbligatori.');
        primo?.focus();
        return;
    }
    const f = form.elements;
    const chiusura = new Date(f.chiusura_iscrizioni.value);
    const [y, m, d] = f.data.value.split('-').map(Number);
    if (chiusura >= new Date(y, m - 1, d + 1)) {
        errore(err, 'La chiusura delle iscrizioni deve essere entro il giorno del torneo.');
        return;
    }

    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Salvo…';
    try {
        const vecchia = inModifica?.locandina_path || null;
        let locandina_path = vecchia;
        if (nuovaLocandina) {
            const ext = nuovaLocandina.type === 'image/webp' ? 'webp' : 'jpg';
            const path = `${crypto.randomUUID()}.${ext}`;
            const { error } = await supabase.storage.from(LOCANDINE_BUCKET).upload(path, nuovaLocandina, { contentType: nuovaLocandina.type, cacheControl: '31536000' });
            if (error) throw new Error('Caricamento della locandina non riuscito.');
            locandina_path = path;
        } else if (rimuoviLocandina) {
            locandina_path = null;
        }

        const record = {
            titolo: f.titolo.value.trim(),
            sesso: f.sesso.value,
            giocatori_per_squadra: Number(f.giocatori_per_squadra.value),
            data: f.data.value,
            ora_inizio: f.ora_inizio.value || null,
            chiusura_iscrizioni: chiusura.toISOString(),
            luogo: f.luogo.value.trim(),
            quota: f.quota.value.trim() || null,
            max_squadre: f.max_squadre.value ? Number(f.max_squadre.value) : null,
            descrizione: f.descrizione.value.trim() || null,
            pubblicato: f.pubblicato.checked,
            locandina_path,
        };
        const { error } = inModifica
            ? await supabase.from('tornei').update(record).eq('id', inModifica.id)
            : await supabase.from('tornei').insert(record);
        if (error) {
            if (locandina_path && locandina_path !== vecchia) await supabase.storage.from(LOCANDINE_BUCKET).remove([locandina_path]);
            throw new Error('Salvataggio non riuscito. Controlla i dati e riprova.');
        }
        // La vecchia locandina non serve più
        if (vecchia && vecchia !== locandina_path) await supabase.storage.from(LOCANDINE_BUCKET).remove([vecchia]);
        $('dlg-torneo').close();
        caricaTornei();
    } catch (e) {
        errore(err, e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Salva';
    }
});

// ─── Iscritti ─────────────────────────────────────────────────────────────
let torneoIscritti = null;
let iscritti = [];

function nomeGiocatori(i) {
    return i.giocatori.map((g) => `${g.nome} ${g.cognome}`).join(', ');
}

function renderTestaIscritti() {
    const t = torneoIscritti;
    const n = iscritti.length;
    const img = locandinaUrl(t.locandina_path);
    const pct = t.max_squadre ? Math.min(100, Math.round((n / t.max_squadre) * 100)) : null;
    $('iscritti-testa').innerHTML = `
        ${img ? `<img src="${esc(img)}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-25 blur-md scale-110" />` : '<div class="t-art absolute inset-0 opacity-50"></div>'}
        <div class="absolute inset-0 bg-gradient-to-r from-stage via-stage/85 to-stage/50"></div>
        <div class="relative flex items-start justify-between gap-4">
            <div class="min-w-0">
                <p class="text-[11px] font-black uppercase tracking-[0.25em] text-secondary">Iscritti</p>
                <h2 class="mt-1 font-poster uppercase text-4xl sm:text-5xl leading-[0.95]">${esc(t.titolo)}</h2>
                <p class="mt-2 text-sm text-white/70">${esc(dataEOra(t))} · ${esc(t.luogo)}</p>
            </div>
            <button type="button" data-chiudi class="shrink-0 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Chiudi"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
        </div>
        <div class="relative mt-6 flex items-end gap-4">
            <p class="font-poster leading-none"><span class="text-7xl text-secondary">${n}</span>${t.max_squadre ? `<span class="text-3xl text-white/40"> / ${t.max_squadre}</span>` : ''}</p>
            <p class="pb-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/60">${n === 1 ? 'squadra iscritta' : 'squadre iscritte'}</p>
        </div>
        ${pct !== null ? `<div class="relative mt-3 h-2.5 rounded-full bg-white/10 overflow-hidden"><div class="t-bar h-full rounded-full" style="width:${Math.max(pct, 2)}%"></div></div>` : ''}`;
}

function renderIscritti() {
    renderTestaIscritti();
    $('btn-scarica').disabled = !iscritti.length;
    $('btn-copia-email').disabled = !iscritti.length;
    if (!iscritti.length) {
        $('iscritti-lista').innerHTML = `
            <div class="rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center">
                <span class="material-symbols-outlined text-5xl text-gray-300" aria-hidden="true">hourglass_empty</span>
                <p class="mt-2 font-poster uppercase text-2xl text-gray-400">Ancora nessuna iscrizione</p>
            </div>`;
        return;
    }
    $('iscritti-lista').innerHTML = `
        <ol class="space-y-3">
            ${iscritti.map((i, n) => `
                <li class="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex gap-4 items-start">
                    <span class="font-poster text-4xl leading-none text-primary w-10 text-center shrink-0">${n + 1}</span>
                    <div class="min-w-0 flex-grow">
                        ${i.nome_squadra ? `<p class="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">${esc(i.nome_squadra)}</p>` : ''}
                        <p class="font-black text-lg leading-snug">${i.giocatori.map((g) => esc(`${g.nome} ${g.cognome}`)).join('<span class="text-secondary mx-1.5">●</span>')}</p>
                        <div class="mt-2 flex flex-wrap gap-2 text-sm">
                            <a class="inline-flex items-center gap-1.5 rounded-full bg-background-light px-3 py-1.5 font-semibold hover:bg-primary hover:text-white transition-colors break-all" href="mailto:${esc(i.email)}"><span class="material-symbols-outlined text-base" aria-hidden="true">mail</span>${esc(i.email)}</a>
                            <a class="inline-flex items-center gap-1.5 rounded-full bg-background-light px-3 py-1.5 font-semibold hover:bg-primary hover:text-white transition-colors" href="tel:${esc(i.telefono)}"><span class="material-symbols-outlined text-base" aria-hidden="true">call</span>${esc(i.telefono)}</a>
                        </div>
                        ${i.note ? `<p class="mt-2 text-sm text-gray-600 whitespace-pre-line border-l-4 border-secondary pl-3">${esc(i.note)}</p>` : ''}
                        <p class="mt-2 text-xs text-gray-400">Iscritti il ${esc(dataOra(i.created_at))}</p>
                    </div>
                    <button type="button" data-elimina-iscrizione="${i.id}" class="shrink-0 w-10 h-10 rounded-xl text-gray-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors" aria-label="Elimina iscrizione">
                        <span class="material-symbols-outlined text-lg" aria-hidden="true">delete</span></button>
                </li>`).join('')}
        </ol>`;
}

async function apriIscritti(t) {
    torneoIscritti = t;
    iscritti = [];
    renderTestaIscritti();
    $('iscritti-lista').innerHTML = '<p class="text-gray-500">Caricamento…</p>';
    $('btn-scarica').disabled = true;
    $('btn-copia-email').disabled = true;
    $('dlg-iscritti').showModal();
    const { data, error } = await supabase.from('tornei_iscrizioni').select('*').eq('torneo_id', t.id).order('created_at');
    if (error) {
        $('iscritti-lista').innerHTML = '<p class="rounded-2xl bg-red-50 text-red-700 font-bold p-4">Non è stato possibile caricare le iscrizioni.</p>';
        return;
    }
    iscritti = data;
    renderIscritti();
}

$('iscritti-lista').addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-elimina-iscrizione]');
    if (!btn) return;
    const i = iscritti.find((x) => x.id === btn.dataset.eliminaIscrizione);
    if (!confirm(`Eliminare l'iscrizione di ${nomeGiocatori(i)}?`)) return;
    const { error } = await supabase.from('tornei_iscrizioni').delete().eq('id', i.id);
    if (error) { alert('Eliminazione non riuscita. Riprova.'); return; }
    iscritti = iscritti.filter((x) => x.id !== i.id);
    renderIscritti();
    caricaTornei();
});

// Email separate da virgola: si incollano direttamente nel campo "A" o "Ccn" della posta
$('btn-copia-email').addEventListener('click', async (ev) => {
    const testo = ev.currentTarget.querySelector('span:last-child');
    try {
        await navigator.clipboard.writeText([...new Set(iscritti.map((i) => i.email))].join(', '));
        testo.textContent = 'Email copiate!';
    } catch {
        testo.textContent = 'Copia non riuscita';
    }
    setTimeout(() => { testo.textContent = 'Copia tutte le email'; }, 2000);
});

// CSV con ";" e BOM: Excel in italiano lo apre direttamente in colonne, con gli accenti giusti
function csvCella(v) {
    const s = String(v ?? '');
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

$('btn-scarica').addEventListener('click', () => {
    const t = torneoIscritti;
    const n = t.giocatori_per_squadra;
    const intestazione = ['N.', 'Data iscrizione', 'Nome squadra'];
    for (let g = 1; g <= n; g++) intestazione.push(`Giocatore ${g} - Nome`, `Giocatore ${g} - Cognome`);
    intestazione.push('Email', 'Telefono', 'Note');

    const righe = iscritti.map((i, idx) => {
        const r = [idx + 1, new Date(i.created_at).toLocaleString('it-IT', { timeZone: 'Europe/Rome' }), i.nome_squadra];
        for (let g = 0; g < n; g++) r.push(i.giocatori[g]?.nome, i.giocatori[g]?.cognome);
        r.push(i.email, i.telefono, i.note);
        return r;
    });

    const csv = '﻿' + [intestazione, ...righe].map((r) => r.map(csvCella).join(';')).join('\r\n');
    const slug = t.titolo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `iscritti-${slug}-${t.data}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// ─── Finestre ─────────────────────────────────────────────────────────────
document.querySelectorAll('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (ev) => {
        // Clic fuori dal riquadro: chiude, tranne l'editor (si perderebbe quanto scritto)
        if (ev.target.closest('[data-chiudi]') || (ev.target === dlg && dlg.id !== 'dlg-torneo')) dlg.close();
    });
});

setInterval(() => aggiornaCountdown($('lista')), 30000);

// Sessione salvata da una visita precedente. Se è scaduta o non valida si torna al login
// invece di restare bloccati su "Caricamento…".
try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    await avvia(session);
} catch (e) {
    console.error('Ripristino della sessione fallito:', e);
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    mostra('vista-login');
}
