// Importiamo il client ufficiale di Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Inizializzazione
// Sostituisci con i dati presi da Supabase: Project Settings > API
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Selezione degli elementi del DOM
const form = document.getElementById('newsletter-form');
const emailInput = document.getElementById('email-input');
const submitBtn = document.getElementById('submit-btn');
const messageEl = document.getElementById('form-message');

// 3. Gestione dell'evento Submit
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita il refresh della pagina
    
    const emailValue = emailInput.value.trim();
    
    // Stato di caricamento UI
    submitBtn.textContent = 'Invio...';
    submitBtn.disabled = true;
    messageEl.classList.add('hidden');

    try {
        // Query a Supabase: inserimento nella tabella (es. 'newsletter')
        const { data, error } = await supabase
            .from('newsletter') // Sostituisci con il nome reale della tua tabella
            .insert([ { email: emailValue } ]); // La chiave 'email' deve combaciare con la colonna in DB

        if (error) throw error;

        // Successo
        messageEl.textContent = 'Iscrizione completata con successo!';
        messageEl.className = 'text-center mt-4 text-sm font-medium text-green-600 dark:text-green-400 block';
        form.reset();

    } catch (error) {
        // Gestione Errore
        console.error('Errore Supabase:', error.message);
        messageEl.textContent = 'Si è verificato un errore. Riprova.';
        messageEl.className = 'text-center mt-4 text-sm font-medium text-red-600 dark:text-red-400 block';
    } finally {
        // Ripristino bottone
        submitBtn.textContent = 'Subscribe';
        submitBtn.disabled = false;
    }
});