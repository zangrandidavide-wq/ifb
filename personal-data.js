// Personal con James Martins (personal.html): listino e sessioni del weekend.
// File modificabile a mano: la pagina si aggiorna da sola, non serve toccare l'HTML.
//
//  listino   → le card dei prezzi e la scelta "Tipo di sessione" nel modulo.
//              id: breve, senza spazi. È quello che arriva nell'email e nel database:
//              se ne aggiungi uno nuovo, aggiungilo anche alla lista in supabase/personal.sql.
//              prezzo: numero in euro (null = "Prezzo su richiesta"); unita: es. "a persona".
//  sessioni  → le sessioni di ogni settimana, sabato ('sab') e domenica ('dom').
//              inizio "HH:MM", durata in minuti.
//  chiusure  → weekend o giorni senza sessioni (festività, tornei): date "AAAA-MM-GG".
//  dal / al  → periodo in cui si possono richiedere sessioni.
//  preavviso → ore minime tra la richiesta e l'inizio della sessione.

window.PERSONAL_JAMES = {
    dal: '2026-11-21',
    al: '2027-07-11',
    preavviso: 24,

    // DA COMPLETARE con il listino ufficiale
    listino: [
        { id: 'individuale', nome: 'Individuale', persone: '1 atleta', durata: 60, prezzo: null, unita: '', desc: 'Lavoro tecnico su misura, tutta l\'attenzione di James su di te.' },
        { id: 'coppia', nome: 'In coppia', persone: '2 atleti', durata: 90, prezzo: null, unita: 'a persona', desc: 'Per te e il tuo compagno: tecnica, intesa e situazioni di gioco.' },
        { id: 'gruppo', nome: 'Piccolo gruppo', persone: '3–4 atleti', durata: 90, prezzo: null, unita: 'a persona', desc: 'Esercitazioni a tema e gioco, con correzioni individuali.' },
    ],

    // DA CONFERMARE: orari d'esempio
    sessioni: [
        { giorno: 'sab', inizio: '09:30', durata: 90 },
        { giorno: 'sab', inizio: '11:00', durata: 90 },
        { giorno: 'sab', inizio: '14:30', durata: 90 },
        { giorno: 'sab', inizio: '16:00', durata: 90 },
        { giorno: 'dom', inizio: '09:30', durata: 90 },
        { giorno: 'dom', inizio: '11:00', durata: 90 },
    ],

    chiusure: ['2026-12-26', '2026-12-27', '2027-01-02', '2027-01-03', '2027-03-28'],
};
