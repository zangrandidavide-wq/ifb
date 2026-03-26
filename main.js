// Importiamo il client ufficiale di Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Inizializzazione Supabase
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// MODULO NEWSLETTER (Eseguito solo se il form esiste)
// ==========================================
const form = document.getElementById('newsletter-form');

if (form) { // <-- IL CONTROLLO SALVAVITA
    const emailInput = document.getElementById('email-input');
    const submitBtn = document.getElementById('submit-btn');
    const messageEl = document.getElementById('form-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const emailValue = emailInput.value.trim();
        
        submitBtn.textContent = 'Invio...';
        submitBtn.disabled = true;
        messageEl.classList.add('hidden');

        try {
            const { data, error } = await supabase
                .from('newsletter') 
                .insert([ { email: emailValue } ]); 

            if (error) throw error;

            messageEl.textContent = 'Iscrizione completata con successo!';
            messageEl.className = 'text-center mt-4 text-sm font-medium text-green-600 dark:text-green-400 block';
            form.reset();

        } catch (error) {
            console.error('Errore Supabase:', error.message);
            messageEl.textContent = 'Si è verificato un errore. Riprova.';
            messageEl.className = 'text-center mt-4 text-sm font-medium text-red-600 dark:text-red-400 block';
        } finally {
            submitBtn.textContent = 'Subscribe';
            submitBtn.disabled = false;
        }
    });
}

// ==========================================
// MODULO COOKIE BANNER (Eseguito solo se il banner esiste)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById('cookie-banner');
    
    if (banner) { // <-- IL SECONDO CONTROLLO SALVAVITA
        const btnAccept = document.getElementById('btn-accept-cookies');
        const btnReject = document.getElementById('btn-reject-cookies');

        const consentStatus = localStorage.getItem('ifb_cookie_consent');

        if (!consentStatus) {
            banner.classList.remove('hidden');
            setTimeout(() => banner.classList.remove('translate-y-full'), 50);
        } else if (consentStatus === 'granted') {
            updateGtagConsent('granted');
        }

        btnAccept.addEventListener('click', () => {
            localStorage.setItem('ifb_cookie_consent', 'granted');
            hideBanner();
            updateGtagConsent('granted');
        });

        btnReject.addEventListener('click', () => {
            localStorage.setItem('ifb_cookie_consent', 'denied');
            hideBanner();
        });

        function hideBanner() {
            banner.classList.add('translate-y-full');
            setTimeout(() => banner.classList.add('hidden'), 500);
        }

        function updateGtagConsent(status) {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
            
            dataLayer.push({ 'event': 'consent_updated' });
        }
    }
});