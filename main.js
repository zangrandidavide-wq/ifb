// Importiamo il client ufficiale di Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Inizializzazione Supabase
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);


// ==========================================
// MODULO MODAL PRENOTAZIONE PROVA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const btnPrenota = document.getElementById('btn-prenota-prova');
    const modal = document.getElementById('modal-prenotazione');
    const btnClose = document.getElementById('modal-prenotazione-close');
    const formPrenotazione = document.getElementById('form-prenotazione');
    const feedbackEl = document.getElementById('prenotazione-feedback');
    const submitBtn = document.getElementById('prenotazione-submit-btn');

    if (!btnPrenota || !modal || !btnClose) return;

    function openModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    btnPrenota.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    if (formPrenotazione) {
        formPrenotazione.addEventListener('submit', async (e) => {
            e.preventDefault();

            submitBtn.disabled = true;
            submitBtn.textContent = 'Invio in corso...';
            if (feedbackEl) {
                feedbackEl.classList.add('hidden');
            }

            try {
                const response = await fetch(formPrenotazione.action, {
                    method: 'POST',
                    body: new FormData(formPrenotazione),
                    headers: { Accept: 'application/json' },
                });

                const data = await response.json();

                if (response.ok) {
                    if (feedbackEl) {
                        feedbackEl.textContent = 'Prenotazione inviata! Ti ricontatteremo a breve.';
                        feedbackEl.className = 'text-sm font-medium text-green-600 dark:text-green-400 block';
                    }
                    formPrenotazione.reset();
                    setTimeout(closeModal, 2000);
                } else {
                    throw new Error(data.error || 'Invio non riuscito');
                }
            } catch (error) {
                if (feedbackEl) {
                    feedbackEl.textContent = 'Si è verificato un errore. Riprova tra poco.';
                    feedbackEl.className = 'text-sm font-medium text-red-600 dark:text-red-400 block';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Invia Prenotazione';
            }
        });
    }
});

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