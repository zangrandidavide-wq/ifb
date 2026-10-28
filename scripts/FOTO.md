# Foto dei tornei: configurazione

Le foto passano dal Google Drive del fotografo al sito senza interventi manuali:

```
Drive del fotografo ──ogni ora──► GitHub Action (scripts/sync-foto.mjs) ──► Cloudflare R2 ──► foto.ifollowbv.it ──► foto.html
```

Lo script scarica solo le foto nuove delle cartelle dei tornei, le raddrizza, toglie i dati EXIF/GPS e crea due versioni WebP (miniatura da 480px e versione grande da 1600px). La pagina `foto.html` legge `index.json` e `albums/<slug>.json` da foto.ifollowbv.it.

## 1. Google Cloud: service account (tu, una volta)
1. Su https://console.cloud.google.com crea un progetto (es. `ifb-foto`).
2. *API e servizi → Libreria* → abilita **Google Drive API**.
3. *IAM e amministrazione → Service account* → **Crea service account** (es. `foto-sync`), senza ruoli.
4. Apri il service account → *Chiavi* → **Aggiungi chiave → JSON**. Si scarica un file `.json`: è una password, **non va messo nel repo**.
5. Copia l'email del service account (`foto-sync@ifb-foto.iam.gserviceaccount.com`) e mandala al fotografo.

## 2. Drive (il fotografo, una volta)
1. Crea la cartella `IFB_foto` sul suo Drive.
2. *Condividi* → incolla l'email del service account → ruolo **Visualizzatore** → togli la spunta "Invia notifica" → Condividi.
3. Ti manda il link della cartella. L'ID è la parte dopo `/folders/`: `https://drive.google.com/drive/folders/`**`1AbC…xyz`**.

> Se il suo account è di Google Workspace e la condivisione esterna è bloccata, crea tu `IFB_foto` sul tuo Drive, aggiungi lui come Editor e condividila col service account.

## 3. Cloudflare R2 (tu, una volta)
1. Dashboard Cloudflare → **R2** → attiva (serve una carta; fino a 10 GB e con egress gratuito non si paga nulla).
2. **Create bucket** → nome `ifb-foto`.
3. Bucket → *Settings* → **Custom Domains** → `foto.ifollowbv.it` (il dominio è già su Cloudflare, il DNS si crea da solo).
4. Bucket → *Settings* → **CORS policy**:
   ```json
   [{ "AllowedOrigins": ["https://ifollowbv.it", "https://www.ifollowbv.it"], "AllowedMethods": ["GET"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 86400 }]
   ```
5. R2 → **Manage R2 API Tokens** → *Create API token* → permesso **Object Read & Write**, solo sul bucket `ifb-foto`. Annota *Access Key ID*, *Secret Access Key* e l'*Account ID* (è nell'URL dell'endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`).

La regola di cache di 1 mese per le immagini va bene: i file prendono il nome dall'hash del contenuto e non cambiano mai. I `.json` hanno `Cache-Control: max-age=300` e Cloudflare non li mette in cache di default: non aggiungere regole che li tengano in cache più a lungo.

## 4. GitHub secrets (tu, una volta)
Repo → *Settings → Secrets and variables → Actions → New repository secret*:

| Nome | Valore |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | il contenuto intero del file `.json` del punto 1 |
| `DRIVE_ROOT_FOLDER_ID` | l'ID della cartella `IFB_foto` |
| `R2_ACCOUNT_ID` | Account ID Cloudflare |
| `R2_ACCESS_KEY_ID` | dal token R2 |
| `R2_SECRET_ACCESS_KEY` | dal token R2 |
| `R2_BUCKET` | `ifb-foto` |

Poi *Actions → Foto tornei → Run workflow* per il primo giro. Nei log si vedono gli album trovati e le foto elaborate.

## Il fotografo, a ogni torneo
```
IFB_foto/
└── 2026.10.24 | Torneo Silver + Beginner | BeachTown/   ← "AAAA.MM.GG | Nome torneo | Luogo"
    ├── copertina.jpg                                    ← facoltativo: copertina dell'album
    └── …jpg                                             ← TUTTE le foto della cartella vanno online
```
- Il luogo è facoltativo; per la data vanno bene anche `/`, `-` o `_` come separatori.
- Ogni foto messa nella cartella del torneo va online entro un'ora (o subito con *Run workflow*): nella cartella vanno solo le foto già selezionate.
- Eventuali sottocartelle vengono ignorate.
- JPEG o PNG già editati, di qualsiasi dimensione. Non serve rinominarli.
- Per togliere una foto dal sito basta toglierla dalla cartella.
- Niente minori riconoscibili senza liberatoria.

## Sicurezza e casi particolari
- Se la cartella radice non è raggiungibile (condivisione revocata, cestino) il workflow fallisce e **non cancella nulla**: GitHub ti avvisa per email.
- Se un album sparisce o perde più di metà delle foto in un giro (cartella rinominata, album riesportato tutto), il workflow si ferma. Se era voluto, rilancialo con *Run workflow* e la spunta **forza**.
- Rinominare la cartella di un album cambia il suo link (`foto.html?album=…`).
- Max 300 foto nuove per giro: un album enorme si completa nei giri successivi.
- Prova senza scrivere nulla: `node scripts/sync-foto.mjs --prova` (con le stesse variabili d'ambiente).
