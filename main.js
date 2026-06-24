// Importiamo il client ufficiale di Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Inizializzazione Supabase
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);


// ==========================================
// MODULO POPUP PROVA GRATUITA (solo index.html)
// ──────────────────────────────────────────
// Per disattivare: commenta questo intero blocco
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup-prova-gratuita');
    const btnClose = document.getElementById('popup-prova-close');
    const btnDismiss = document.getElementById('popup-prova-dismiss');
    const locandina = document.getElementById('popup-prova-locandina');
    const locandinaPlaceholder = document.getElementById('popup-prova-locandina-placeholder');
    
    // Chiave per la sessione corrente
    const STORAGE_KEY = 'ifb_popup_prova_dismissed';
    // Ritardo ridotto per un'apertura quasi immediata (0.8 secondi)
    const DELAY_MS = 800; 

    if (!popup || !btnClose || !btnDismiss) return;

    const locandinaSrc = locandina?.getAttribute('src')?.trim();
    if (locandina && locandinaSrc) {
        locandina.classList.remove('hidden');
        locandinaPlaceholder?.classList.add('hidden');
    }

    function closePopup(persist = true) {
        popup.classList.add('hidden');
        document.body.style.overflow = '';
        if (persist) {
            // Usiamo sessionStorage invece di localStorage
            // Così si riaprirà alla prossima visita (quando l'utente riapre il browser/scheda)
            sessionStorage.setItem(STORAGE_KEY, 'true');
        }
    }

    function openPopup() {
        popup.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Controlliamo il sessionStorage invece del localStorage
    if (!sessionStorage.getItem(STORAGE_KEY)) {
        setTimeout(openPopup, DELAY_MS);
    }

    btnClose.addEventListener('click', () => closePopup(true));
    btnDismiss.addEventListener('click', () => closePopup(true));

    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup(true);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !popup.classList.contains('hidden')) {
            closePopup(true);
        }
    });
});

// ==========================================
// MODULO MODAL PRENOTAZIONE PROVA (disattivato)
// ==========================================
/*
document.addEventListener('DOMContentLoaded', () => {
    const btnPrenota = document.getElementById('btn-prenota-prova');
    const modal = document.getElementById('modal-prenotazione');
    ...
});
*/

// ==========================================
// MODULO COOKIE BANNER (Eseguito solo se il banner esiste)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById('cookie-banner');
    
    if (banner) { 
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