// Consenso cookie e analytics di I Follow Beach Volley.
// Va incluso come PRIMO script nel <head> di ogni pagina pubblica:
//   <script src="consent.js"></script>
//
// - Google Consent Mode v2: tutto negato di default, aggiornato in base alla scelta salvata.
// - GA4 + Google Tag Manager: caricati sempre, ma rispettano il Consent Mode.
// - Microsoft Clarity: caricato SOLO dopo il consenso esplicito.
// - Banner: mostrato finché l'utente non sceglie; riapribile con window.IFBConsent.open()
//   (es. dal link "Preferenze cookie" nel footer).
(function () {
    var STORAGE_KEY = 'ifb_cookie_consent'; // 'granted' | 'denied'
    var GA_ID = 'G-VPB635BSN3';
    var GTM_ID = 'GTM-P7VLDV3W';
    var CLARITY_ID = 'w1rk4uvro4';

    function readChoice() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }
    function saveChoice(value) {
        try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage non disponibile */ }
    }

    // ── Consent Mode ──────────────────────────────────────────────
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
    });
    window.dataLayer.push({ event: 'default_consent' });

    function applyConsent(status) {
        gtag('consent', 'update', {
            ad_storage: status,
            ad_user_data: status,
            ad_personalization: status,
            analytics_storage: status
        });
        window.dataLayer.push({ event: 'consent_updated' });
    }

    var choice = readChoice();
    if (choice === 'granted') applyConsent('granted');

    // ── Google tag + Tag Manager ─────────────────────────────────
    function loadScript(src) {
        var s = document.createElement('script');
        s.async = true;
        s.src = src;
        document.head.appendChild(s);
    }
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
    gtag('js', new Date());
    gtag('config', GA_ID);

    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    loadScript('https://www.googletagmanager.com/gtm.js?id=' + GTM_ID);

    // ── Microsoft Clarity (solo con consenso) ─────────────────────
    var clarityLoaded = false;
    function loadClarity() {
        if (clarityLoaded) return;
        clarityLoaded = true;
        window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
        loadScript('https://www.clarity.ms/tag/' + CLARITY_ID + '?ref=bwt');
        window.clarity('consent');
    }
    if (choice === 'granted') loadClarity();

    // ── Banner ────────────────────────────────────────────────────
    var banner = null;

    function buildBanner() {
        banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'Preferenze cookie');
        banner.className = 'fixed bottom-0 inset-x-0 z-50 px-4 pb-4 sm:pb-6 translate-y-full opacity-0 transition-all duration-500';
        banner.innerHTML =
            '<div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-primary/20 border border-gray-100 dark:border-gray-700 border-l-4 border-l-primary p-5 flex flex-col md:flex-row md:items-center gap-4">' +
                '<div class="flex items-start gap-3 flex-1">' +
                    '<span class="w-11 h-11 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center"><span class="material-icons" aria-hidden="true">cookie</span></span>' +
                    '<p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">' +
                        'Usiamo cookie tecnici e, solo con il tuo consenso, strumenti di analisi (Google Analytics e Microsoft Clarity) per capire come viene usato il sito. ' +
                        '<a href="privacy.html#cookie" class="font-bold text-primary underline underline-offset-2">Leggi l\'informativa</a>.' +
                    '</p>' +
                '</div>' +
                '<div class="flex gap-2 shrink-0">' +
                    '<button type="button" id="btn-reject-cookies" class="flex-1 md:flex-none px-5 py-3 rounded-full border-2 border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary transition-colors">Solo necessari</button>' +
                    '<button type="button" id="btn-accept-cookies" class="flex-1 md:flex-none px-5 py-3 rounded-full bg-primary hover:bg-primary-dark text-sm font-extrabold text-white shadow-lg shadow-primary/30 transition-colors">Accetta tutti</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(banner);

        banner.querySelector('#btn-accept-cookies').addEventListener('click', function () { decide('granted'); });
        banner.querySelector('#btn-reject-cookies').addEventListener('click', function () { decide('denied'); });
    }

    function showBanner() {
        if (!banner) buildBanner();
        banner.classList.remove('hidden');
        requestAnimationFrame(function () {
            banner.classList.remove('translate-y-full', 'opacity-0');
        });
    }

    function hideBanner() {
        if (!banner) return;
        banner.classList.add('translate-y-full', 'opacity-0');
        setTimeout(function () { banner.classList.add('hidden'); }, 500);
    }

    function decide(status) {
        var previous = readChoice();
        saveChoice(status);
        applyConsent(status);
        hideBanner();
        if (status === 'granted') {
            loadClarity();
        } else if (previous === 'granted' && clarityLoaded) {
            // Clarity non si può "spegnere" a caldo: si ricarica la pagina senza caricarlo
            window.clarity('consent', false);
            location.reload();
        }
    }

    window.IFBConsent = {
        open: showBanner,
        get: readChoice
    };

    if (!choice) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showBanner);
        } else {
            showBanner();
        }
    }
})();
