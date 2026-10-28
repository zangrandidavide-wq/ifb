// Sincronizza le foto dei tornei dal Google Drive del fotografo a Cloudflare R2 (servite da foto.ifollowbv.it).
// Gira su GitHub Actions (.github/workflows/foto.yml); in locale: `node scripts/sync-foto.mjs --prova` elenca senza scrivere.
//
// Struttura attesa sul Drive (cartella radice condivisa con il service account, come Visualizzatore):
//   IFB_foto/
//     2026.10.24 | Torneo Silver + Beginner | BeachTown/   ← data | titolo | luogo (il luogo è facoltativo)
//       *.jpg                ← tutte le foto della cartella vanno online
//       copertina.jpg        ← facoltativo
//
// Per ogni foto nuova: download, orientamento EXIF, due versioni WebP (miniatura e grande) senza metadati (niente GPS).
// I file prendono il nome dall'hash del contenuto, quindi non cambiano mai e si possono tenere in cache a lungo.
// Il sito legge solo index.json e albums/<slug>.json.
//
// Variabili d'ambiente: GOOGLE_SERVICE_ACCOUNT_JSON, DRIVE_ROOT_FOLDER_ID,
//                       R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
//                       FORZA=true per consentire eliminazioni massicce (vedi controllaEliminazioni).

import { GoogleAuth } from 'google-auth-library';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { createHash } from 'node:crypto';

const PROVA = process.argv.includes('--prova');
const FORZA = process.env.FORZA === 'true';

const LATO_MINIATURA = 480;   // lato corto della miniatura (le celle della griglia sono quadrate)
const LATO_GRANDE = 1600;     // lato lungo della versione per la lightbox
const MAX_NUOVE_PER_GIRO = 300;  // il resto al giro successivo, per restare nel timeout del workflow
const PARALLELE = 4;

const CACHE_IMMAGINI = 'public, max-age=31536000, immutable';
const CACHE_MANIFEST = 'public, max-age=300';
const FILE_STATO = '_stato.json';

function env(nome) {
    const v = process.env[nome];
    if (!v) throw new Error(`Manca la variabile d'ambiente ${nome}`);
    return v;
}

// ─── Google Drive ─────────────────────────────────────────────────────────
const auth = new GoogleAuth({
    credentials: JSON.parse(env('GOOGLE_SERVICE_ACCOUNT_JSON')),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const driveClient = await auth.getClient();

async function drive(path, params = {}, responseType = 'json') {
    const url = new URL(`https://www.googleapis.com/drive/v3/${path}`);
    for (const [k, v] of Object.entries({ supportsAllDrives: true, ...params })) url.searchParams.set(k, v);
    const res = await driveClient.request({ url: url.toString(), responseType });
    return res.data;
}

async function figli(folderId, filtro) {
    const out = [];
    let pageToken;
    do {
        const r = await drive('files', {
            q: `'${folderId}' in parents and trashed = false${filtro ? ` and ${filtro}` : ''}`,
            fields: 'nextPageToken, files(id, name, mimeType, md5Checksum, modifiedTime, imageMediaMetadata(time))',
            pageSize: 1000,
            includeItemsFromAllDrives: true,
            ...(pageToken ? { pageToken } : {}),
        });
        out.push(...r.files);
        pageToken = r.nextPageToken;
    } while (pageToken);
    return out;
}

const MIME_CARTELLA = 'application/vnd.google-apps.folder';
const CARTELLA = `mimeType = '${MIME_CARTELLA}'`;

// ─── R2 (API compatibile S3) ──────────────────────────────────────────────
const BUCKET = env('R2_BUCKET');
const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env('R2_ACCESS_KEY_ID'), secretAccessKey: env('R2_SECRET_ACCESS_KEY') },
});

async function leggiJson(key, vuoto) {
    try {
        const r = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        return JSON.parse(await r.Body.transformToString());
    } catch (e) {
        if (e.name === 'NoSuchKey') return vuoto;
        throw e;
    }
}

function scrivi(key, body, contentType, cacheControl) {
    if (PROVA) return Promise.resolve();
    return r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType, CacheControl: cacheControl }));
}

const scriviJson = (key, dati) => scrivi(key, JSON.stringify(dati), 'application/json; charset=utf-8', CACHE_MANIFEST);

async function elimina(keys) {
    if (PROVA) return;
    for (let i = 0; i < keys.length; i += 1000) {
        await r2.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })) } }));
    }
}

// ─── Lettura del Drive ────────────────────────────────────────────────────
function slugify(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Nome del file su R2: hash del contenuto (md5 di Drive), così se una foto viene sostituita cambia anche l'URL
function chiave(f) {
    const base = f.md5Checksum || createHash('sha1').update(f.id + f.modifiedTime).digest('hex');
    return base.slice(0, 16);
}

const IMMAGINE = /^image\/(jpeg|png|webp|tiff)$/;

async function leggiDrive(rootId) {
    // Se la radice non è raggiungibile (condivisione revocata, cestino) ci si ferma qui, senza toccare nulla su R2
    const root = await drive(`files/${rootId}`, { fields: 'id, name, trashed' }).catch((e) => {
        throw new Error(`Cartella radice non raggiungibile (${e.response?.status ?? e.message}). È ancora condivisa con il service account?`);
    });
    if (root.trashed) throw new Error(`La cartella radice "${root.name}" è nel cestino`);

    const album = [];
    const slugUsati = new Set();
    for (const cartella of await figli(rootId, CARTELLA)) {
        // "2026.10.24 | Torneo Silver + Beginner | BeachTown": la data accetta come separatore . / - _,
        // poi titolo e, dopo un'altra |, il luogo
        const m = cartella.name.trim().match(/^(\d{4})[-/._](\d{1,2})[-/._](\d{1,2})(?!\d)[\s_|–-]*(.+)$/);
        if (!m) {
            console.warn(`⚠ Ignoro "${cartella.name}": il nome deve essere "AAAA.MM.GG | Nome torneo | Luogo"`);
            continue;
        }
        // Solo le immagini direttamente nella cartella del torneo; eventuali sottocartelle non vanno online
        const files = (await figli(cartella.id)).filter((f) => {
            if (IMMAGINE.test(f.mimeType)) return true;
            if (f.mimeType !== MIME_CARTELLA) console.warn(`⚠ Ignoro "${cartella.name}/${f.name}" (${f.mimeType}): usa JPEG o PNG`);
            return false;
        });
        if (!files.length) continue;

        // Ordine: orario di scatto, poi nome. La copertina va in testa.
        files.sort((a, b) => (a.imageMediaMetadata?.time || '').localeCompare(b.imageMediaMetadata?.time || '') || a.name.localeCompare(b.name, 'it', { numeric: true }));
        const cop = files.findIndex((f) => /^copertina\./i.test(f.name));
        if (cop > 0) files.unshift(files.splice(cop, 1)[0]);

        const [, anno, mese, giorno, resto] = m;
        const data = `${anno}-${mese.padStart(2, '0')}-${giorno.padStart(2, '0')}`;
        const [titolo, ...luogo] = resto.split('|').map((x) => x.trim()).filter(Boolean);
        if (!titolo) {
            console.warn(`⚠ Ignoro "${cartella.name}": manca il nome del torneo dopo la data`);
            continue;
        }
        let slug = slugify(`${data} ${resto}`);
        for (let i = 2; slugUsati.has(slug); i++) slug = slugify(`${data} ${resto} ${i}`);
        slugUsati.add(slug);
        album.push({ slug, data, titolo, luogo: luogo.join(' · '), files });
    }
    return album;
}

// ─── Controlli di sicurezza sulle eliminazioni ────────────────────────────
// Le eliminazioni vere (una foto tolta dalla cartella) sono piccole. Un album che sparisce o perde
// più di metà delle foto in un colpo solo fa pensare a un errore (cartella spostata, rinominata male):
// in quel caso ci si ferma, a meno di rilanciare il workflow con FORZA=true.
function controllaEliminazioni(stato, album) {
    const nuovi = new Map(album.map((a) => [a.slug, new Set(a.files.map(chiave))]));
    const problemi = [];
    for (const [slug, vecchio] of Object.entries(stato.album)) {
        const ora = nuovi.get(slug);
        if (!ora) {
            problemi.push(`l'album "${slug}" (${vecchio.foto.length} foto) non c'è più`);
            continue;
        }
        const tolte = vecchio.foto.filter((f) => !ora.has(f.k)).length;
        if (tolte > 5 && tolte > vecchio.foto.length / 2) problemi.push(`dall'album "${slug}" spariscono ${tolte} foto su ${vecchio.foto.length}`);
    }
    if (problemi.length && !FORZA) {
        throw new Error(`Eliminazione bloccata per sicurezza:\n  - ${problemi.join('\n  - ')}\n` +
            `Se è voluto (album rinominato o tolto), rilancia il workflow con "forza" attivo.`);
    }
    if (problemi.length) console.log(`FORZA attivo, procedo comunque:\n  - ${problemi.join('\n  - ')}`);
}

// ─── Elaborazione delle immagini ──────────────────────────────────────────
async function elabora(f) {
    const originale = Buffer.from(await drive(`files/${f.id}`, { alt: 'media' }, 'arraybuffer'));
    const img = sharp(originale, { failOn: 'none' }).rotate();  // rotate() senza argomenti applica l'orientamento EXIF
    const k = chiave(f);

    const grande = await img.clone()
        .resize({ width: LATO_GRANDE, height: LATO_GRANDE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });
    const mini = await img.clone()
        .resize({ width: LATO_MINIATURA, height: LATO_MINIATURA, fit: 'outside', withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer();

    // sharp non copia i metadati (EXIF, GPS) se non lo si chiede con withMetadata()
    await Promise.all([
        scrivi(`l/${k}.webp`, grande.data, 'image/webp', CACHE_IMMAGINI),
        scrivi(`t/${k}.webp`, mini, 'image/webp', CACHE_IMMAGINI),
    ]);
    return { k, w: grande.info.width, h: grande.info.height };
}

async function inParallelo(lista, n, fn) {
    const coda = [...lista];
    await Promise.all(Array.from({ length: n }, async () => {
        while (coda.length) await fn(coda.shift());
    }));
}

// ─── Main ─────────────────────────────────────────────────────────────────
// Stato: per ogni album le foto già pubblicate, nello stesso ordine del Drive
const stato = await leggiJson(FILE_STATO, { album: {} });
const album = await leggiDrive(env('DRIVE_ROOT_FOLDER_ID'));
if (!album.length && Object.keys(stato.album).length) {
    throw new Error('Il Drive non contiene nessun album pubblicabile, ma il sito sì: mi fermo per sicurezza.');
}
controllaEliminazioni(stato, album);

// Dimensioni delle foto già elaborate (una stessa foto può stare in più album)
const note = new Map(Object.values(stato.album).flatMap((a) => a.foto.map((f) => [f.k, f])));

const daFare = [];
for (const a of album) {
    for (const f of a.files) {
        if (!note.has(chiave(f)) && !daFare.some((x) => chiave(x) === chiave(f))) daFare.push(f);
    }
}
const giro = daFare.slice(0, MAX_NUOVE_PER_GIRO);
console.log(`${album.length} album, ${daFare.length} foto nuove${daFare.length > giro.length ? ` (ne elaboro ${giro.length}, il resto al prossimo giro)` : ''}`);

if (PROVA) {
    for (const a of album) console.log(`  ${a.slug}: ${a.files.length} foto`);
    console.log('Modalità prova: nessuna scrittura su R2.');
    process.exit(0);
}

let fatte = 0;
await inParallelo(giro, PARALLELE, async (f) => {
    try {
        note.set(chiave(f), await elabora(f));
        if (++fatte % 20 === 0) console.log(`  ${fatte}/${giro.length}`);
    } catch (e) {
        // Una foto rovinata non deve bloccare le altre: la si riprova al prossimo giro
        console.warn(`⚠ Non riesco a elaborare "${f.name}" (${f.id}): ${e.message}`);
    }
});

// Nuovo stato e manifest: solo foto elaborate con successo
const nuovoStato = { album: {} };
for (const a of album) {
    const foto = a.files.map((f) => note.get(chiave(f))).filter(Boolean).map(({ k, w, h }) => ({ k, w, h }))
        .filter((f, i, arr) => arr.findIndex((x) => x.k === f.k) === i);
    if (foto.length) nuovoStato.album[a.slug] = { titolo: a.titolo, luogo: a.luogo, data: a.data, foto };
}

for (const [slug, a] of Object.entries(nuovoStato.album)) {
    const prima = stato.album[slug];
    if (JSON.stringify(prima) !== JSON.stringify(a)) await scriviJson(`albums/${slug}.json`, { slug, ...a });
}
await scriviJson('index.json', {
    aggiornato: new Date().toISOString(),
    album: Object.entries(nuovoStato.album)
        .sort(([, x], [, y]) => y.data.localeCompare(x.data))
        .map(([slug, a]) => ({ slug, titolo: a.titolo, luogo: a.luogo, data: a.data, n: a.foto.length, cover: a.foto[0] })),
});

// Pulizia: immagini non più usate da nessun album, manifest di album spariti
const usate = new Set(Object.values(nuovoStato.album).flatMap((a) => a.foto.map((f) => f.k)));
const orfane = [...new Set(Object.values(stato.album).flatMap((a) => a.foto.map((f) => f.k)))].filter((k) => !usate.has(k));
const albumTolti = Object.keys(stato.album).filter((s) => !nuovoStato.album[s]);
await elimina([...orfane.flatMap((k) => [`l/${k}.webp`, `t/${k}.webp`]), ...albumTolti.map((s) => `albums/${s}.json`)]);

// Lo stato si salva per ultimo: se qualcosa si rompe prima, il giro successivo rifà il lavoro
await scriviJson(FILE_STATO, nuovoStato);
console.log(`Fatto: ${fatte} foto nuove, ${orfane.length} eliminate, ${albumTolti.length} album tolti.`);
