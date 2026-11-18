// Email di avviso per ogni nuova richiesta di Personal con James (tabella personal_richieste).
// La chiama il Database Webhook "avvisa-personal" (INSERT su personal_richieste): vedi README.md qui accanto.
//
// Secret richiesti (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY        chiave API di Resend
//   PERSONAL_FROM         mittente verificato su Resend, es. "IFB Personal <personal@tuodominio.it>"
//   PERSONAL_DESTINATARI  indirizzi da avvisare, separati da virgola
//   WEBHOOK_SECRET        stringa casuale, uguale all'header x-webhook-secret del Database Webhook

const SESSIONI: Record<string, string> = {
    individuale: 'Individuale',
    coppia: 'In coppia',
    gruppo: 'Piccolo gruppo',
};

const esc = (s: unknown) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function dataLunga(iso: string) {
    const s = new Date(`${iso}T12:00:00Z`).toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome',
    });
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function fascia(ora: string, durata: number) {
    const [h, m] = ora.split(':').map(Number);
    const fine = h * 60 + m + durata;
    const f = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
    return `${f(h * 60 + m)}–${f(fine)}`;
}

// Numero per il link WhatsApp: solo cifre, con prefisso italiano se manca
function numeroWa(tel: string) {
    let n = tel.replace(/\D/g, '');
    if (n.startsWith('00')) n = n.slice(2);
    if (n.length === 10 && n.startsWith('3')) n = '39' + n;
    return n;
}

Deno.serve(async (req) => {
    if (req.method !== 'POST') return new Response('Metodo non ammesso', { status: 405 });
    if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
        return new Response('Non autorizzato', { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    const r = payload?.record;
    if (payload?.type !== 'INSERT' || payload?.table !== 'personal_richieste' || !r) {
        return new Response('Evento ignorato', { status: 200 });
    }

    const destinatari = (Deno.env.get('PERSONAL_DESTINATARI') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const quando = `${dataLunga(r.data)} · ${fascia(r.ora_inizio, r.durata)}`;
    const sessione = SESSIONI[r.sessione] || r.sessione;
    const wa = `https://wa.me/${numeroWa(r.telefono)}?text=${encodeURIComponent(`Ciao ${r.nome}, siamo IFB: abbiamo ricevuto la tua richiesta per il personal con James (${quando}).`)}`;

    const righe: [string, string][] = [
        ['Quando', quando],
        ['Sessione', sessione],
        ['Livello', r.livello],
        ['Nome', r.nome],
        ['Email', r.email],
        ['Telefono', r.telefono],
        ['Note', r.note || '—'],
    ];

    const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#191022">
  <div style="background:#7f13ec;color:#fff;padding:24px;border-radius:16px 16px 0 0">
    <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#FFD700;font-weight:bold">Nuova richiesta</p>
    <h1 style="margin:6px 0 0;font-size:24px">Personal con James</h1>
    <p style="margin:6px 0 0;font-size:16px">${esc(quando)}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#f7f6f8;border-radius:0 0 16px 16px">
    ${righe.map(([k, v]) => `<tr><td style="padding:10px 16px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;width:110px;vertical-align:top">${k}</td><td style="padding:10px 16px;font-size:15px;font-weight:bold;white-space:pre-line">${esc(v)}</td></tr>`).join('')}
  </table>
  <p style="margin:20px 0 0">
    <a href="${esc(wa)}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px">Scrivi su WhatsApp</a>
    <a href="mailto:${esc(r.email)}" style="display:inline-block;margin-left:8px;background:#191022;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px">Rispondi via email</a>
  </p>
  <p style="margin:16px 0 0;font-size:12px;color:#6b7280">Rispondendo a questa email scrivi direttamente a ${esc(r.nome)}. È una richiesta da confermare: sede e orario definitivi vanno comunicati a chi l'ha inviata.</p>
</div>`;

    const text = [
        `Nuova richiesta - Personal con James`,
        '',
        ...righe.map(([k, v]) => `${k}: ${v}`),
        '',
        `WhatsApp: ${wa}`,
    ].join('\n');

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: Deno.env.get('PERSONAL_FROM'),
            to: destinatari,
            reply_to: r.email,
            subject: `Personal con James: ${r.nome}, ${quando}`,
            html,
            text,
        }),
    });

    if (!res.ok) {
        const errore = await res.text();
        console.error('Resend', res.status, errore);
        return new Response(`Invio non riuscito: ${errore}`, { status: 502 });
    }
    return new Response('ok', { status: 200 });
});
