// Personal con James Martins (personal.html): listino, fasce orarie e giorni del weekend.
// File modificabile a mano: la pagina si aggiorna da sola, non serve toccare l'HTML.
//
//  james / ifb → i due listini (prezzi a persona, campo incluso), per numero di atleti.
//                Si richiede dal sito solo il personal con James; per i Personal IFB si scrive alla segreteria.
//                Se cambi i numeri di atleti di James, aggiornali anche in supabase/personal.sql.
//  fasce       → fasce orarie tra cui scegliere: lo slot preciso lo assegna IFB alla conferma.
//  anticipo    → giorni minimi tra oggi e la sessione richiesta.
//  dal / al    → periodo in cui si possono richiedere sessioni.
//  chiusure    → sabati o domeniche senza sessioni (festività, eventi): date "AAAA-MM-GG".

window.PERSONAL_JAMES = {
    dal: '2026-11-21',
    al: '2027-07-11',
    anticipo: 7,
    sedi: ['Basiglio', 'Pero', 'Corsico'],

    james: {
        nome: 'Personal con James',
        sigla: 'HPP by JM',
        coach: 'Con James Martins',
        durata: 90,
        quando: 'Sabato e domenica',
        prezzi: { 1: 130, 2: 75, 3: 55, 4: 45, 6: 30 },
    },
    ifb: {
        nome: 'Personal IFB',
        coach: 'Con i coach IFB',
        durata: 60,
        quando: 'In settimana',
        prezzi: { 1: 80, 2: 50, 3: 35, 4: 30, 6: 20 },
    },

    fasce: [
        { id: 'mattina', nome: 'Mattina', ore: '9–13', icona: 'wb_sunny' },
        { id: 'pomeriggio', nome: 'Pomeriggio', ore: '13–18', icona: 'light' },
        { id: 'sera', nome: 'Sera', ore: '18–21', icona: 'nightlight' },
    ],

    chiusure: ['2026-12-26', '2026-12-27', '2027-01-02', '2027-01-03', '2027-03-28'],
};
