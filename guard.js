import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configurazione Supabase (Usa le tue VERE chiavi, come per la navbar)
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Funzione di Protezione
async function requireAuth() {
    // Leggiamo la sessione attuale dal browser
    const { data: { session }, error } = await supabase.auth.getSession();

    // 3. Logica di Espulsione
    if (error || !session) {
        // Se non c'è sessione o c'è un errore nel token, cacciamo l'utente.
        // NOTA TECNICA: Usiamo window.location.replace() invece di .href
        // Questo impedisce all'utente di usare la freccia "Indietro" del browser per aggirare il blocco.
        console.warn('Accesso negato. Reindirizzamento al login...');
        window.location.replace('login.html');
    } else {
        // 4. Accesso Consentito
        console.log('Accesso autorizzato per:', session.user.email);
        
        // (Opzionale per ora) Sveliamo il contenuto della pagina se lo avevamo nascosto
        document.body.classList.remove('hidden');
    }
}

// Eseguiamo la guardia immediatamente al caricamento dello script
requireAuth();