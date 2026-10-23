hi, i am trying, with 0 experience as a web developer, to develop a working website where people subscribed to our beach volleyball courses can read about new events, 
register an account that lets them see events they signed up for, what courses they follow, with also a calendar view. the site's purpose is that to give a more formal 
look to our company and surpass the standards set by others in italy, where no one can boast having such a website.

## Stili, font e build

Il sito non scarica CSS esterni: il CSS di ogni pagina è scritto direttamente nella pagina
(inline), così il browser può disegnarla subito senza attendere altri file.

Nell'`<head>` delle pagine ci sono dei blocchi `<style data-inline="...">` riempiti
automaticamente dalla build (non modificarne il contenuto a mano, viene sovrascritto):

- `data-inline="tailwind"`: il CSS Tailwind con le sole classi usate dalla pagina e dagli
  script che carica (navbar, footer, tornei...);
- `data-inline="fonts/....css"`, `data-inline="scroll-reveal.css"`, `data-inline="tornei/tornei.css"`:
  il contenuto di quel file.

Dopo aver cambiato classi Tailwind (in HTML o JS) o uno di quei file CSS, ricompila:

```bash
npm install          # solo la prima volta
npm run build:css    # aggiorna tutte le pagine
npm run watch:css    # oppure: aggiorna in automatico mentre lavori
```

e committa le pagine HTML modificate.

- Colori, font, animazioni e plugin Tailwind di ogni pagina sono in `build/pages.js`.
- Per una pagina nuova: aggiungi una voce in `build/pages.js`, metti
  `<style data-inline="tailwind"></style>` come ultimo elemento dell'`<head>` e lancia la build.

### Font e icone

I font (Lexend, Anton, Material Icons, Material Symbols) sono ospitati sul sito, nella
cartella `fonts/`, invece che su Google Fonts. I font delle icone contengono **solo le icone
usate dal sito** (pochi KB invece di 130 KB - 1,1 MB).

Se usi un'icona nuova, `npm run build:css` ti avvisa con un messaggio. In quel caso rigenera
i font delle icone (serve Python 3 con `pip install fonttools brotli`) e poi la build:

```bash
npm run build:icone
npm run build:css
```

Finché non lo fai, l'icona nuova compare come testo (es. "calendar_month").

### Immagini

Le foto più pesanti hanno versioni WebP ridimensionate (`pero-800.webp`, `pero-1400.webp`,
`beachtown-640.webp`, `beachtown.webp`, `eddi-hero-3-860.webp`, `logo-trasparente-mini.webp`)
usate con `srcset`, così ogni dispositivo scarica la dimensione adatta. Gli originali restano
per le anteprime social (og:image) e i dati strutturati.
