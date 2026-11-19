-- Personal (personal.html): richieste di sessione.
--  - sabato e domenica: Personal con James (tipo 'james'), mattina o pomeriggio;
--  - dal lunedì al venerdì: Personal IFB con gli altri coach (tipo 'ifb'), solo la sera, con la sede a scelta (facoltativa).
-- Da eseguire una volta in Supabase → SQL Editor (progetto gwqtkuwfipgvegeipygh). Si può rieseguire senza danni.
--
-- Come funziona:
--  - la pagina chiama richiedi_personal() con la chiave pubblica (anon): la funzione controlla i dati e salva la richiesta;
--  - non ci sono orari fissi: il corsista indica giorno e fascia, IFB assegna lo slot alla conferma;
--  - il tipo lo decide il giorno della settimana, non la pagina;
--  - la tabella non è leggibile né modificabile con la chiave pubblica (RLS attiva, nessuna regola per anon):
--    le richieste si vedono nell'email di avviso e in Supabase → Table Editor;
--  - l'email di avviso la manda la Edge Function avvisa-personal, chiamata da un Database Webhook
--    (vedi supabase/functions/avvisa-personal/README.md).

create table if not exists public.personal_richieste (
    id          uuid primary key default gen_random_uuid(),
    creata      timestamptz not null default now(),
    data        date not null,
    fascia      text not null check (fascia in ('mattina', 'pomeriggio', 'sera', 'indifferente')),
    atleti      smallint not null,
    livello     text not null,
    nome        text not null,
    email       text not null,
    telefono    text not null,
    note        text,
    stato       text not null default 'nuova' check (stato in ('nuova', 'confermata', 'annullata'))
);

create index if not exists personal_richieste_email_idx on public.personal_richieste (email, creata);
create index if not exists personal_richieste_data_idx on public.personal_richieste (data);

alter table public.personal_richieste enable row level security;
revoke all on public.personal_richieste from anon, authenticated;

-- Personal IFB in settimana (aggiunti dopo: su una tabella già creata si aggiungono qui)
alter table public.personal_richieste add column if not exists tipo text not null default 'james';
alter table public.personal_richieste add column if not exists allenatore text;
alter table public.personal_richieste add column if not exists sede text;
alter table public.personal_richieste drop constraint if exists personal_richieste_tipo_check;
alter table public.personal_richieste add constraint personal_richieste_tipo_check check (tipo in ('james', 'ifb'));

-- Le versioni precedenti della funzione vanno tolte, altrimenti ne restano più di una
drop function if exists public.richiedi_personal(date, text, int, text, text, text, text, text, boolean);
drop function if exists public.richiedi_personal(date, text, int, text, text, text, text, text, boolean, text);

create or replace function public.richiedi_personal(
    p_data      date,
    p_fascia    text,
    p_atleti    int,
    p_livello   text,
    p_nome      text,
    p_email     text,
    p_telefono  text,
    p_note      text default null,
    p_privacy   boolean default false,
    p_sede      text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_id   uuid;
    v_oggi date := (now() at time zone 'Europe/Rome')::date;
    v_tipo text;
begin
    if not coalesce(p_privacy, false) then
        raise exception 'Per inviare la richiesta devi accettare l''informativa privacy.' using errcode = 'P0001';
    end if;

    p_nome     := btrim(coalesce(p_nome, ''));
    p_email    := lower(btrim(coalesce(p_email, '')));
    p_telefono := btrim(coalesce(p_telefono, ''));
    p_note     := nullif(btrim(coalesce(p_note, '')), '');
    p_sede     := nullif(btrim(coalesce(p_sede, '')), '');

    if length(p_nome) < 2 or length(p_nome) > 80 then
        raise exception 'Scrivi nome e cognome.' using errcode = 'P0001';
    end if;
    if length(p_email) > 200 or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
        raise exception 'Controlla l''indirizzo email.' using errcode = 'P0001';
    end if;
    if length(p_telefono) > 25 or regexp_replace(p_telefono, '[^0-9]', '', 'g') !~ '^[0-9]{6,15}$' then
        raise exception 'Controlla il numero di telefono.' using errcode = 'P0001';
    end if;
    if p_note is not null and length(p_note) > 500 then
        raise exception 'Le note possono essere lunghe al massimo 500 caratteri.' using errcode = 'P0001';
    end if;

    -- Stessi numeri di atleti dei listini in personal-data.js (james.prezzi e ifb.prezzi)
    if p_atleti is null or p_atleti not in (1, 2, 3, 4, 6) then
        raise exception 'Scegli quanti atleti siete.' using errcode = 'P0001';
    end if;
    if p_livello is null or p_livello not in ('Principiante', 'Intermedio', 'Avanzato', 'Agonista') then
        raise exception 'Scegli il tuo livello.' using errcode = 'P0001';
    end if;

    if p_data is null then
        raise exception 'Scegli il giorno.' using errcode = 'P0001';
    end if;

    -- Sabato e domenica: James, mattina o pomeriggio. Dal lunedì al venerdì: coach IFB, solo la sera.
    -- (fasce e sedi come in personal-data.js)
    if extract(isodow from p_data) in (6, 7) then
        v_tipo := 'james';
        if p_fascia is null or p_fascia not in ('mattina', 'pomeriggio', 'indifferente') then
            raise exception 'Nel weekend si può scegliere la mattina o il pomeriggio.' using errcode = 'P0001';
        end if;
        p_sede := null;   -- nel weekend la sede la decide IFB
    else
        v_tipo := 'ifb';
        if p_fascia is distinct from 'sera' then
            raise exception 'In settimana i personal sono solo la sera.' using errcode = 'P0001';
        end if;
        if p_sede is not null and p_sede not in ('Basiglio', 'Pero', 'Corsico') then
            raise exception 'Scegli una sede dall''elenco.' using errcode = 'P0001';
        end if;
    end if;
    -- La richiesta si apre una settimana prima e resta aperta fino al giorno stesso
    -- (la pagina usa "apertura: 7" in personal-data.js)
    if p_data < v_oggi then
        raise exception 'Questa data è già passata.' using errcode = 'P0001';
    end if;
    if p_data > v_oggi + 7 then
        raise exception 'Le richieste si aprono una settimana prima: per questa data torna dal %.', to_char(p_data - 7, 'DD/MM') using errcode = 'P0001';
    end if;

    -- Limiti contro invii ripetuti e spam
    if exists (select 1 from personal_richieste where email = p_email and data = p_data and stato <> 'annullata') then
        raise exception 'Hai già inviato una richiesta per questo giorno: ti ricontattiamo noi.' using errcode = 'P0001';
    end if;
    if (select count(*) from personal_richieste where email = p_email and creata > now() - interval '1 day') >= 3 then
        raise exception 'Hai già inviato diverse richieste oggi: ti ricontattiamo al più presto.' using errcode = 'P0001';
    end if;
    if (select count(*) from personal_richieste where creata > now() - interval '1 hour') >= 30 then
        raise exception 'Stiamo ricevendo molte richieste: riprova tra poco o scrivici su WhatsApp.' using errcode = 'P0001';
    end if;

    insert into personal_richieste (tipo, data, fascia, sede, atleti, livello, nome, email, telefono, note)
    values (v_tipo, p_data, p_fascia, p_sede, p_atleti, p_livello, p_nome, p_email, p_telefono, p_note)
    returning id into v_id;

    return v_id;
end;
$$;

revoke all on function public.richiedi_personal(date, text, int, text, text, text, text, text, boolean, text) from public;
grant execute on function public.richiedi_personal(date, text, int, text, text, text, text, text, boolean, text) to anon, authenticated;

-- Pulizia (privacy: conservazione 12 mesi). Da lanciare ogni tanto, o con pg_cron:
--   delete from public.personal_richieste where creata < now() - interval '12 months';
