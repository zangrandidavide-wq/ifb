-- Personal con James Martins (personal.html): richieste di sessione nel weekend.
-- Da eseguire una volta in Supabase → SQL Editor (progetto gwqtkuwfipgvegeipygh). Si può rieseguire senza danni.
--
-- Come funziona:
--  - la pagina chiama richiedi_personal() con la chiave pubblica (anon): la funzione controlla i dati e salva la richiesta;
--  - non ci sono orari fissi: il corsista indica giorno (sabato o domenica) e fascia, IFB assegna lo slot alla conferma;
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

create or replace function public.richiedi_personal(
    p_data      date,
    p_fascia    text,
    p_atleti    int,
    p_livello   text,
    p_nome      text,
    p_email     text,
    p_telefono  text,
    p_note      text default null,
    p_privacy   boolean default false
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_id   uuid;
    v_oggi date := (now() at time zone 'Europe/Rome')::date;
begin
    if not coalesce(p_privacy, false) then
        raise exception 'Per inviare la richiesta devi accettare l''informativa privacy.' using errcode = 'P0001';
    end if;

    p_nome     := btrim(coalesce(p_nome, ''));
    p_email    := lower(btrim(coalesce(p_email, '')));
    p_telefono := btrim(coalesce(p_telefono, ''));
    p_note     := nullif(btrim(coalesce(p_note, '')), '');

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

    -- Stessi numeri di atleti del listino in personal-data.js (james.prezzi)
    if p_atleti is null or p_atleti not in (1, 2, 3, 4, 6) then
        raise exception 'Scegli quanti atleti siete.' using errcode = 'P0001';
    end if;
    if p_fascia is null or p_fascia not in ('mattina', 'pomeriggio', 'sera', 'indifferente') then
        raise exception 'Scegli la fascia oraria.' using errcode = 'P0001';
    end if;
    if p_livello is null or p_livello not in ('Principiante', 'Intermedio', 'Avanzato', 'Agonista') then
        raise exception 'Scegli il tuo livello.' using errcode = 'P0001';
    end if;

    if p_data is null or extract(isodow from p_data) not in (6, 7) then
        raise exception 'I personal con James sono solo il sabato e la domenica.' using errcode = 'P0001';
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

    insert into personal_richieste (data, fascia, atleti, livello, nome, email, telefono, note)
    values (p_data, p_fascia, p_atleti, p_livello, p_nome, p_email, p_telefono, p_note)
    returning id into v_id;

    return v_id;
end;
$$;

revoke all on function public.richiedi_personal(date, text, int, text, text, text, text, text, boolean) from public;
grant execute on function public.richiedi_personal(date, text, int, text, text, text, text, text, boolean) to anon, authenticated;

-- Pulizia (privacy: conservazione 12 mesi). Da lanciare ogni tanto, o con pg_cron:
--   delete from public.personal_richieste where creata < now() - interval '12 months';
