# Personal con James: messa in funzione su Supabase

Progetto Supabase: `gwqtkuwfipgvegeipygh` (lo stesso dei tornei). Da fare una volta sola.

## 1. Database
Supabase → **SQL Editor** → incolla ed esegui `supabase/personal.sql`.

## 2. Edge Function `avvisa-personal`
Da terminale, con la [CLI di Supabase](https://supabase.com/docs/guides/cli):

```bash
npx supabase login
npx supabase functions deploy avvisa-personal --project-ref gwqtkuwfipgvegeipygh
```

In alternativa: Supabase → **Edge Functions** → *Deploy a new function* → *Via Editor*,
nome `avvisa-personal`, incolla `index.ts`.

## 3. Secret della funzione
Supabase → **Edge Functions** → **Secrets** (oppure `npx supabase secrets set NOME=valore --project-ref gwqtkuwfipgvegeipygh`):

| Nome | Valore |
| --- | --- |
| `RESEND_API_KEY` | la chiave API di Resend |
| `PERSONAL_FROM` | mittente su un dominio verificato in Resend, `IFB Personal <personal@ifollowbv.it>` (il dominio ifollowbv.it è già verificato su Resend) |
| `PERSONAL_DESTINATARI` | `zangrandi.davide@gmail.com,ifollowbv@gmail.com` (per aggiungere James basta aggiungere il suo indirizzo) |
| `WEBHOOK_SECRET` | una stringa casuale lunga, la stessa del punto 4 |
| `PERSONAL_EMAIL_ALLENATORI` | *facoltativo*: email dei coach IFB in JSON, con i nomi scritti come in `personal-data.js`, ad esempio `{"Sofia Arcaini":"sofia@esempio.it"}`. Quando un corsista sceglie quel coach per un Personal IFB, l'avviso arriva anche a lui. Si può aggiungere o cambiare in qualsiasi momento, senza ripubblicare la funzione. |

## 4. Database Webhook
Supabase → **Database** → **Webhooks** → *Create a new hook*:

- Nome: `avvisa-personal`
- Tabella: `personal_richieste`, evento **Insert**
- Tipo: **Supabase Edge Functions** → `avvisa-personal`, metodo POST
- Header HTTP: lascia quello di autorizzazione proposto e aggiungi `x-webhook-secret` = il valore di `WEBHOOK_SECRET`

## 5. Prova
Invia una richiesta dalla pagina `personal.html` (con una data di prova) e controlla:
- che arrivi l'email a tutti i destinatari (guardare anche nello spam);
- la riga in **Table Editor → personal_richieste**;
- in caso di problemi: **Edge Functions → avvisa-personal → Logs**.
