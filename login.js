import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configurazione Supabase
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Mappatura Elementi DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const submitBtn = document.getElementById('login-btn');
const messageEl = document.getElementById('login-message');

// 3. Gestione Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Stato di caricamento
    const btnText = submitBtn.querySelector('span:first-child');
    btnText.textContent = 'Accesso...';
    submitBtn.disabled = true;
    messageEl.classList.add('hidden');

    try {
        // Chiamata API per il login
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Se il login è valido, preleviamo il ruolo.
        // Usiamo maybeSingle() in modo che se la riga in profile non esiste (non è scattato il trigger),
        // non lancia un errore SQL ma restituisce semplicemente null.
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

        if (profileError) {
            console.error("Errore recupero ruolo profilo:", profileError);
            // Se c'e' un errore vero (es. permessi) lo stampiamo, ma continuiamo senza bloccarci
        }

        // Reindirizzamento in base al ruolo
        const userRole = profile?.role;
        btnText.textContent = 'Reindirizzamento...';

        switch (userRole) {
            case 'presidente':
                window.location.href = 'dashboard-admin.html';
                break;
            case 'allenatore':
                window.location.href = 'dashboard-allenatore.html';
                break;
            case 'atleta':
                window.location.href = 'dashboard-atleta.html';
                break;
            default:
                // Se non ha ruolo, la riga non esiste o il ruolo non è conosciuto,
                // lo mandiamo alla home (oppure potremmo mandarlo a una eventuale pagina "completa_profilo")
                window.location.href = 'index.html';
        }

    } catch (error) {
        // Gestione errori (es. credenziali errate)
        console.error('Errore di Login:', error.message);

        // Traduciamo l'errore per l'utente
        if (error.message === 'Invalid login credentials') {
            messageEl.textContent = 'Email o password non validi.';
        } else {
            messageEl.textContent = `Errore: ${error.message}`;
        }

        messageEl.classList.remove('hidden');
        btnText.textContent = 'Accedi';
        submitBtn.disabled = false;
    }
});