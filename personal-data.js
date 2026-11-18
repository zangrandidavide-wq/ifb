// Personal (personal.html): listini, giorni, fasce orarie e allenatori.
// File modificabile a mano: la pagina si aggiorna da sola, non serve toccare l'HTML.
//
//  james → Personal con James: sabato e domenica, mattina o pomeriggio.
//  ifb   → Personal IFB con gli altri coach: dal lunedì al venerdì, solo la sera.
//          allenatori = elenco tra cui scegliere (nome come nella pagina Staff, foto).
//  In entrambi: prezzi a persona, campo incluso, per numero di atleti.
//  Se cambi numeri di atleti, fasce o allenatori, aggiornali anche in supabase/personal.sql
//  (e i prezzi in supabase/functions/avvisa-personal/index.ts).
//
//  fasce     → fasce orarie tra cui scegliere: lo slot preciso lo assegna IFB alla conferma.
//  apertura  → quanti giorni prima si apre la richiesta di un giorno
//              (7 = si può richiedere dalla settimana prima fino al giorno stesso).
//  dal / al  → periodo in cui si possono richiedere sessioni.
//  chiusure  → giorni senza personal (festività, eventi): date "AAAA-MM-GG".

window.PERSONAL_JAMES = {
    dal: '2026-11-18',
    al: '2027-07-11',
    apertura: 7,
    sedi: ['Basiglio', 'Pero', 'Corsico'],

    james: {
        nome: 'Personal con James',
        sigla: 'HPP by JM',
        coach: 'Con James Martins',
        durata: 90,
        quando: 'Sabato e domenica',
        prezzi: { 1: 130, 2: 75, 3: 55, 4: 45, 6: 30 },
        fasce: [
            { id: 'mattina', nome: 'Mattina', ore: '9–13', icona: 'wb_sunny' },
            { id: 'pomeriggio', nome: 'Pomeriggio', ore: '13–18', icona: 'light' },
        ],
    },
    ifb: {
        nome: 'Personal IFB',
        sigla: 'Coach IFB',
        coach: 'Con i coach IFB',
        durata: 60,
        quando: 'Dal lunedì al venerdì, la sera',
        prezzi: { 1: 80, 2: 50, 3: 35, 4: 30, 6: 20 },
        fasce: [
            { id: 'sera', nome: 'Sera', ore: '18–23', icona: 'nightlight' },
        ],
        allenatori: [
            { nome: 'Sofia Arcaini', foto: 'arcaini.jpeg' },
            { nome: 'Giovanni Latini', foto: 'giovanni-mobile.webp' },
            { nome: 'Edgardo Ceccoli', foto: 'eddi.webp' },
            { nome: 'Davide Lucca', foto: 'noccone.webp' },
            { nome: 'Davide Zangrandi', foto: 'zangrandi.webp' },
            { nome: 'Nicolò Passi', foto: 'passi.webp' },
            { nome: 'Stefania Verrigni', foto: 'verrigni.webp' },
            { nome: 'Antonino Cappadonna', foto: 'cappa.webp' },
            { nome: 'Yari Mannino', foto: 'yari.webp' },
            { nome: 'Alessandro Pesce', foto: 'fish.webp' },
            { nome: 'Mirko Bernini', foto: 'mirko.webp' },
        ],
    },

    chiusure: [
        '2026-12-08', '2026-12-25', '2026-12-26', '2026-12-27',
        '2027-01-01', '2027-01-02', '2027-01-03', '2027-01-06',
        '2027-03-28', '2027-03-29', '2027-06-02',
    ],
};
