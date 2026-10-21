// Collegamento al progetto Supabase usato dalla pagina Tornei (tornei.html) e da gestione-tornei.html.
// È indipendente dall'area riservata (area/js/config.js): si può cambiare l'una senza toccare l'altra.
//
// Valori in Supabase → Project Settings → API:
//  - SUPABASE_URL:      "Project URL"
//  - SUPABASE_ANON_KEY: chiave "anon" / "publishable" (è pubblica per definizione: i dati li proteggono
//    le regole RLS di supabase/migrations/20261021000005_tornei.sql). Non inserire MAI la chiave "service_role".

export const SUPABASE_URL = 'https://gwqtkuwfipgvegeipygh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cXRrdXdmaXBndmVnZWlweWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTM4ODIsImV4cCI6MjEwODA2OTg4Mn0.5-8Yrf1oThUc6rLxhgxymWmJISzcxqP-hLF2wN7G1XU';

export const LOCANDINE_BUCKET = 'locandine';

export function locandinaUrl(path) {
    return path ? `${SUPABASE_URL}/storage/v1/object/public/${LOCANDINE_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}` : '';
}

// ─── Formattazione condivisa ──────────────────────────────────────────────
export const SESSO = { maschile: 'Maschile', femminile: 'Femminile', misto: 'Misto' };

// Livello del torneo: etichetta e numero di "tacche" dell'indicatore (1 = Base … 3 = Open)
export const LIVELLO = {
    base: { label: 'Base', tacche: 1 },
    intermedio: { label: 'Intermedio', tacche: 2 },
    open: { label: 'Open', tacche: 3 },
};

// Indicatore a tre barrette, come il segnale del telefono. Eredita il colore dal testo.
export function barreLivello(livello) {
    const n = LIVELLO[livello]?.tacche || 0;
    return `<span class="inline-flex items-end gap-[2px] h-3" aria-hidden="true">${[1, 2, 3].map((i) =>
        `<span class="w-[3px] rounded-sm bg-current ${i <= n ? '' : 'opacity-25'}" style="height:${i * 33}%"></span>`).join('')}</span>`;
}

export function formula(n) {
    return n === 1 ? 'Individuale' : `${n}x${n}`;
}

const TZ = 'Europe/Rome';

// "sabato 8 novembre 2026" (la data del torneo è un giorno, senza ora)
export function dataLunga(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const s = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Orario di inizio del torneo: "09:30:00" (dal database) → "9:30". Stringa vuota se non indicato.
export function orario(hms) {
    if (!hms) return '';
    const [h, m] = hms.split(':');
    return `${Number(h)}:${m}`;
}

// "Domenica 8 novembre 2026 · ore 9:30"
export function dataEOra(t) {
    return dataLunga(t.data) + (t.ora_inizio ? ` · ore ${orario(t.ora_inizio)}` : '');
}

export function dataCorta(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: TZ });
}

// "mer 5 nov, 23:59"
export function dataOra(isoTs) {
    return new Date(isoTs).toLocaleString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ });
}

export function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
