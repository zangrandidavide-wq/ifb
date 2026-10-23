hi, i am trying, with 0 experience as a web developer, to develop a working website where people subscribed to our beach volleyball courses can read about new events, 
register an account that lets them see events they signed up for, what courses they follow, with also a calendar view. the site's purpose is that to give a more formal 
look to our company and surpass the standards set by others in italy, where no one can boast having such a website.

## Stili (Tailwind CSS)

Il sito non usa più il CDN di Tailwind (`cdn.tailwindcss.com`): ogni pagina carica un
CSS già compilato, `tailwind-<pagina>.css`, collegato come ultimo elemento dell'`<head>`.

Dopo aver aggiunto o cambiato classi Tailwind in una pagina HTML o in un file JS,
ricompila il CSS e committa anche i file `tailwind-*.css`:

```bash
npm install          # solo la prima volta
npm run build:css    # compila tutte le pagine
npm run watch:css    # oppure: ricompila in automatico mentre lavori
```

- Colori, font, animazioni e plugin di ogni pagina sono in `tailwind/pages.js`
  (sostituiscono i vecchi blocchi `tailwind.config = {...}` dentro le pagine).
- Gli script locali caricati dalla pagina (navbar, footer, tornei...) vengono letti
  automaticamente, quindi le classi aggiunte via JavaScript sono incluse.
- Per una pagina nuova: aggiungi una voce in `tailwind/pages.js`, lancia
  `npm run build:css` e aggiungi `<link rel="stylesheet" href="tailwind-<pagina>.css" />`
  prima di `</head>`.
