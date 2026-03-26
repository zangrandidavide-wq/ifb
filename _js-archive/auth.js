import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurazione Client (Sostituisci con le tue chiavi da Project Settings > API)
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Mappatura Nodi DOM
const signupForm = document.getElementById('signup-form');
const nomeInput = document.getElementById('signup-nome');
const cognomeInput = document.getElementById('signup-cognome');
const emailInput = document.getElementById('signup-email');
const passwordInput = document.getElementById('signup-password');
const genderInput = document.getElementById('signup-gender');
const submitBtn = document.getElementById('signup-btn');
const messageEl = document.getElementById('signup-message');

// Event Listener
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Normalizzazione dati
    const nome = nomeInput.value.trim();
    const cognome = cognomeInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const gender = genderInput.value;

    // Gestione UI: Stato di caricamento
    submitBtn.textContent = 'Creazione in corso...';
    submitBtn.disabled = true;
    messageEl.classList.add('hidden');

    try {
        // Chiamata API: Inserimento credenziali e passaggio metadati al Trigger SQL
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: nome, // Richiesti dal Trigger Supabase per il full_name
                    last_name: cognome
                }
            }
        });

        if (error) throw error;

        // Upsert del profilo con ruolo, nome completo e genere
        const userId = data.user?.id;
        if (userId) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: `${nome} ${cognome}`.trim(),
                    role: 'atleta',
                    gender: gender
                }, { onConflict: 'id' });

            if (profileError) {
                console.error('Avviso: impossibile aggiornare il profilo:', profileError.message);
            }
        }

        // Gestione UI: Successo
        messageEl.textContent = 'Profilo creato con successo! Verrai reindirizzato al login...';
        messageEl.className = 'text-center mt-4 text-sm font-medium text-green-500 block';
        signupForm.reset();

        // Reindirizzamento al login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        // Gestione UI: Errore
        console.error('Errore di registrazione:', error.message);
        messageEl.textContent = `Si è verificato un errore: ${error.message}`;
        messageEl.className = 'text-center mt-4 text-sm font-medium text-red-500 block';
    } finally {
        // Ripristino UI
        submitBtn.textContent = 'Registrati';
        submitBtn.disabled = false;
    }

});