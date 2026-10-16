// Calendario dei tornei federali FIPAV ospitati nelle sedi IFB.
// Letto da federali.html: per aggiungere una data basta aggiungere una riga a TORNEI_FEDERALI.
//
// Ogni riga = un giorno di torneo (come nel foglio FIPAV):
//   data   'AAAA-MM-GG'
//   sede   una chiave di SEDI_FEDERALI ('basiglio', 'pero', 'corsico')
//   coppie numero di coppie per genere, testo libero (es. '16+9')
//   campi  numero di campi
//   cat    le "x" del foglio: categoria -> 'F', 'M' oppure 'FM'
//          categorie: beginner, bronze, silver, gold, platinum,
//                     under14, under16, under18, under20,
//                     master35, master45, master55
//
// Più tornei nello stesso giorno e nella stessa sede (es. 6 dicembre)? Una riga per ciascuno,
// con le sue coppie: la pagina li unisce in un'unica giornata.
//
// Le date passate si spostano da sole nell'archivio: non serve cancellarle.

window.TORNEI_FEDERALI = [
    { data: '2026-10-24', sede: 'basiglio', coppie: '16+9', campi: 6, cat: { beginner: 'FM', silver: 'FM' } },
    { data: '2026-11-01', sede: 'pero', coppie: '12', campi: 2, cat: { gold: 'FM' } },
    { data: '2026-11-15', sede: 'basiglio', coppie: '16+9', campi: 6, cat: { bronze: 'FM', master35: 'F', master45: 'M' } },
    { data: '2026-11-29', sede: 'basiglio', coppie: '16+9', campi: 6, cat: { beginner: 'FM', silver: 'F', gold: 'FM' } },
    { data: '2026-12-05', sede: 'basiglio', coppie: '12', campi: 6, cat: { bronze: 'FM', gold: 'FM' } },
    // 6 dicembre: due tornei nella stessa giornata
    { data: '2026-12-06', sede: 'basiglio', coppie: '16', campi: 6, cat: { beginner: 'FM', bronze: 'FM' } },
    { data: '2026-12-06', sede: 'basiglio', coppie: '12', campi: 6, cat: { silver: 'FM' } },
    { data: '2026-12-12', sede: 'pero', coppie: '9+9', campi: 2, cat: { silver: 'F' } },
    { data: '2026-12-20', sede: 'basiglio', coppie: '12', campi: 6, cat: { beginner: 'FM', bronze: 'FM' } },
    { data: '2027-01-06', sede: 'basiglio', coppie: '12', campi: 6, cat: { bronze: 'F', silver: 'FM' } },
    { data: '2027-01-17', sede: 'basiglio', coppie: '12', campi: 6, cat: { silver: 'FM', gold: 'FM' } },
];

// Dati fissi dell'organizzazione (uguali per tutte le righe del foglio)
window.FEDERALI_INFO = {
    organizzatore: 'I Follow Beach Volley A.S.D.',
    codiceSocieta: '040180249',
    referente: 'Angelica Ferrau',
    telefono: '+393494633610',
};

window.SEDI_FEDERALI = {
    basiglio: {
        nome: 'Basiglio',
        impianto: 'Beach Town',
        img: 'beachtown.jpg',
        indirizzo: 'Piazza Marco Polo 3, Basiglio (MI)',
        maps: 'Piazza+Marco+Polo,+3,+20079+Basiglio+MI',
        pagina: 'sedi.html#basiglio',
    },
    pero: {
        nome: 'Pero',
        impianto: 'Pero Sporting Club',
        img: 'pero.jpg',
        indirizzo: 'Via Papa Giovanni XXIII 6, Pero (MI)',
        maps: 'Via+Papa+Giovanni+XXIII+6,+20016+Pero,+Lombardia',
        pagina: 'sedi.html#pero',
    },
    corsico: {
        nome: 'Corsico',
        impianto: 'Sport Time Corsico',
        img: 'corsico.webp',
        indirizzo: 'Via Visconti di Modrone 2, Corsico (MI)',
        maps: 'Via+Visconti+di+Modrone+2,+20094+Corsico,+Lombardia',
        pagina: 'sedi.html#corsico',
    },
};
