// Footer di I Follow Beach Volley: <ifbv-footer></ifbv-footer> su ogni pagina.
// Contiene: fascia CTA, link di navigazione, sedi con indicazioni, contatti, social,
// stato della stagione calcolato dalla data e pulsante "torna su".

(function () {
    var PROVA_GRATUITA_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdehZERFZJbABXxK9IsS5zgzaIZMo165lyDfuz3PG4UORf8Kw/viewform';
    var WHATSAPP_URL = 'https://wa.me/393494633610';

    // Date della stagione sportiva (aggiornare a ogni nuova stagione)
    var SEASON = { label: '2026/2027', start: new Date(2026, 8, 14), end: new Date(2027, 6, 16) };

    var ICONS = {
        instagram: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>',
        whatsapp: '<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>',
        facebook: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>'
    };

    var SOCIALS = [
        { label: 'Instagram', href: 'https://www.instagram.com/ifollowbv/', icon: ICONS.instagram, hover: 'hover:bg-[#dc2743]' },
        { label: 'WhatsApp', href: WHATSAPP_URL, icon: ICONS.whatsapp, hover: 'hover:bg-[#25D366]' },
        { label: 'Facebook', href: 'https://www.facebook.com/IFOLLOWBV/', icon: ICONS.facebook, hover: 'hover:bg-[#1877F2]' }
    ];

    var LINK_GROUPS = [
        { title: 'Allenati', links: [
            { label: 'Corsi e prezzi', href: 'IFB_corsi.html' },
            { label: 'High Performance', href: 'IFB_corsi.html#hpp' },
            { label: 'Staff tecnico', href: 'coaches.html' }
        ] },
        { title: 'Gioca', links: [
            { label: 'Calendario eventi', href: 'tornei.html' },
            { label: 'Rookie League', href: 'rookie-league.html', badge: 'Nuovo' }
        ] },
        { title: 'Info', links: [
            { label: 'FAQ', href: 'faq.html' },
            { label: 'Contatti', href: 'contatti.html' },
            { label: 'Privacy Policy', href: 'privacy.html' },
            { label: 'Termini di Servizio', href: 'servizio.html' }
        ] }
    ];

    var SEDI = [
        { name: 'Basiglio', place: 'BeachTown – Sporting Milano 3', anchor: 'basiglio', maps: 'Piazza+Marco+Polo,+3,+20079+Basiglio+MI', tag: 'Sede storica' },
        { name: 'Pero', place: 'Pero Sporting Club', anchor: 'pero', maps: 'Via+Papa+Giovanni+XXIII+6,+20016+Pero,+Lombardia' },
        { name: 'Corsico', place: 'Sport Time Corsico', anchor: 'corsico', maps: 'Via+Visconti+di+Modrone+2,+20094+Corsico,+Lombardia' }
    ];

    function seasonStatus(now) {
        var day = 86400000;
        if (now < SEASON.start) {
            var days = Math.ceil((SEASON.start - now) / day);
            return { live: false, text: 'Stagione ' + SEASON.label + ' al via tra ' + days + (days === 1 ? ' giorno' : ' giorni') };
        }
        if (now <= SEASON.end) {
            var total = SEASON.end - SEASON.start;
            var pct = Math.round(((now - SEASON.start) / total) * 100);
            return { live: true, text: 'Stagione ' + SEASON.label + ' in corso', pct: pct };
        }
        return { live: false, text: 'Iscrizioni aperte per la prossima stagione' };
    }

    function linkGroups(b, page) {
        return LINK_GROUPS.map(function (g) {
            return '' +
                '<div>' +
                    '<p class="text-[11px] font-bold uppercase tracking-[0.25em] text-secondary mb-4">' + g.title + '</p>' +
                    '<ul class="space-y-2.5">' +
                        g.links.map(function (l) {
                            var active = l.href === page;
                            return '<li><a href="' + b + l.href + '" ' + (active ? 'aria-current="page"' : '') +
                                ' class="group inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 ' + (active ? 'text-white' : 'text-gray-400 hover:text-white') + '">' +
                                    '<span class="h-0.5 rounded-full bg-primary transition-all duration-200 ' + (active ? 'w-3 bg-secondary' : 'w-0 group-hover:w-3') + '" aria-hidden="true"></span>' +
                                    l.label +
                                    (l.badge ? '<span class="bg-secondary text-gray-900 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">' + l.badge + '</span>' : '') +
                                '</a></li>';
                        }).join('') +
                    '</ul>' +
                '</div>';
        }).join('');
    }

    function sedi(b) {
        return SEDI.map(function (s, i) {
            return '' +
                '<li class="group flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/60 hover:bg-white/10 p-3 transition-all duration-200 ease-out">' +
                    '<span class="w-9 h-9 shrink-0 rounded-full bg-primary/20 text-secondary text-[11px] font-black flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">0' + (i + 1) + '</span>' +
                    '<a href="' + b + 'sedi.html#' + s.anchor + '" class="flex-1 min-w-0">' +
                        '<span class="block text-sm font-extrabold text-white">' + s.name +
                            (s.tag ? ' <span class="ml-1 align-middle bg-secondary text-gray-900 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">' + s.tag + '</span>' : '') +
                        '</span>' +
                        '<span class="block text-xs text-gray-400 truncate">' + s.place + '</span>' +
                    '</a>' +
                    '<a href="https://www.google.com/maps/dir/?api=1&amp;destination=' + s.maps + '" target="_blank" rel="noopener noreferrer" aria-label="Indicazioni per ' + s.name + '"' +
                        ' class="w-9 h-9 shrink-0 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-secondary hover:text-gray-900 transition-colors">' +
                        '<span class="material-icons text-lg" aria-hidden="true">directions</span>' +
                    '</a>' +
                '</li>';
        }).join('');
    }

    function socials() {
        return SOCIALS.map(function (s) {
            return '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.label + '"' +
                ' class="w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center ' + s.hover + ' hover:-translate-y-0.5 transition-all duration-200 ease-out">' +
                '<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">' + s.icon + '</svg></a>';
        }).join('');
    }

    function ticker() {
        var items = '<span class="px-6">Corsi per tutti i livelli</span><span class="material-icons align-middle text-base">sports_volleyball</span>' +
                    '<span class="px-6">Basiglio · Pero · Corsico</span><span class="material-icons align-middle text-base">place</span>' +
                    '<span class="px-6">Tornei, eventi e Rookie League</span><span class="material-icons align-middle text-base">emoji_events</span>' +
                    '<span class="px-6">#1 Beach Volley Community a Milano</span><span class="material-icons align-middle text-base">favorite</span>';
        return items + items + items + items;
    }

    class IfbvFooter extends HTMLElement {
        connectedCallback() {
            var b = window.IFB_NAV_BASE || '';
            var page = window.location.pathname.split('/').pop() || 'index.html';
            var status = seasonStatus(new Date());
            var year = new Date().getFullYear();
            // cta="off": per le pagine che finiscono già con una propria CTA su sfondo scuro
            // (es. index, corsi). Evita due blocchi scuri e due inviti identici uno dopo l'altro.
            var showCta = this.getAttribute('cta') !== 'off';
            var statusBadge = '<span class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-full">' +
                '<span class="w-1.5 h-1.5 rounded-full ' + (status.live ? 'bg-[#25D366] animate-pulse' : 'bg-secondary') + '"></span>' +
                status.text + '</span>';
            var seasonBar = status.live
                ? '<div class="mt-4 max-w-xs" aria-hidden="true">' +
                      '<div class="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1.5"><span>Set</span><span>Lug</span></div>' +
                      '<div class="h-1.5 rounded-full bg-white/10 overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-secondary to-primary" style="width:' + status.pct + '%"></div></div>' +
                  '</div>'
                : '';

            this.innerHTML = `
            <style>
                .ifbv-ticker-track { display: flex; width: max-content; animation: ifbv-ticker 40s linear infinite; }
                .ifbv-ticker:hover .ifbv-ticker-track { animation-play-state: paused; }
                @keyframes ifbv-ticker { to { transform: translateX(-50%); } }
                #ifbv-top { transition: opacity .3s ease, transform .3s ease; }
                @media (prefers-reduced-motion: reduce) { .ifbv-ticker-track { animation: none; } }
            </style>

            <footer class="relative mt-auto bg-slate-950 text-gray-300 overflow-hidden" aria-labelledby="ifbv-footer-title">
                <h2 id="ifbv-footer-title" class="sr-only">I Follow Beach Volley: informazioni e contatti</h2>

                <!-- Ticker -->
                <div class="ifbv-ticker relative z-10 overflow-hidden bg-secondary text-gray-900" aria-hidden="true">
                    <div class="ifbv-ticker-track py-2.5 font-extrabold text-sm uppercase tracking-wide whitespace-nowrap">${ticker()}</div>
                </div>

                <div class="absolute -top-10 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary/30 blur-3xl pointer-events-none" aria-hidden="true"></div>
                <div class="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" aria-hidden="true"></div>

                <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    ${showCta ? `
                    <!-- CTA -->
                    <div class="py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-white/10">
                        <div class="lg:col-span-7">
                            <div class="mb-5">${statusBadge}</div>
                            <p class="font-black uppercase tracking-tight leading-[0.92] text-white text-[clamp(2.2rem,6vw,4.5rem)]">
                                Pronto a scendere<br /><span class="text-secondary">in sabbia?</span>
                            </p>
                            ${seasonBar}
                        </div>
                        <div class="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col lg:items-end gap-3">
                            <a href="${PROVA_GRATUITA_URL}" target="_blank" rel="noopener noreferrer" data-track="cta_prova_gratuita" data-track-pos="footer"
                               class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-extrabold px-7 py-4 rounded-full whitespace-nowrap shadow-xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 hover:-translate-y-0.5">
                                <span class="material-icons" aria-hidden="true">sports_volleyball</span> Prenota la prova gratuita
                            </a>
                            <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer"
                               class="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-[#25D366] border border-white/20 hover:border-[#25D366] text-white font-extrabold px-7 py-4 rounded-full whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5">
                                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">${ICONS.whatsapp}</svg> WhatsApp
                            </a>
                        </div>
                    </div>` : ''}

                    <!-- Colonne -->
                    <div class="${showCta ? 'py-12' : 'pt-14 pb-12'} grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10">
                        <div class="col-span-2 lg:col-span-3">
                            <a href="${b}index.html" class="inline-flex items-center justify-center w-[132px] h-11 bg-[#74297c] rounded-full shadow-lg hover:-translate-y-0.5 transition-transform duration-200" aria-label="I Follow Beach Volley, home">
                                <img src="${b}logo-trasparente.png" alt="Logo IFB" class="h-8 w-auto object-contain" loading="lazy" />
                            </a>
                            <p class="mt-5 text-sm leading-relaxed text-gray-400 max-w-xs">
                                Scuola e community di beach volley a Milano dal 2013: corsi per ogni livello, tornei, eventi e un percorso fino al campionato italiano.
                            </p>
                            <div class="mt-6 flex items-center gap-2">${socials()}</div>
                            ${showCta ? '' : `<div class="mt-6">${statusBadge}${seasonBar}</div>`}
                        </div>

                        <nav class="col-span-2 lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6" aria-label="Link del footer">
                            ${linkGroups(b, page)}
                        </nav>

                        <div class="col-span-2 lg:col-span-4">
                            <p class="text-[11px] font-bold uppercase tracking-[0.25em] text-secondary mb-4">Le nostre sedi</p>
                            <ul class="space-y-2">${sedi(b)}</ul>
                            <div class="mt-5 space-y-2 text-sm">
                                <a href="tel:+393494633610" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><span class="material-icons text-base text-primary" aria-hidden="true">call</span> +39 349 463 3610</a>
                                <a href="mailto:mulan@ifollowbv.it" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><span class="material-icons text-base text-primary" aria-hidden="true">mail</span> mulan@ifollowbv.it</a>
                            </div>
                        </div>
                    </div>

                    <!-- Barra finale -->
                    <div class="py-6 border-t border-white/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                        <p>© ${year} I Follow Beach Volley A.S.D. Tutti i diritti riservati.</p>
                        <div class="flex items-center gap-4">
                            <a href="${b}privacy.html" class="hover:text-white transition-colors">Privacy</a>
                            <span class="w-1 h-1 rounded-full bg-gray-700" aria-hidden="true"></span>
                            <a href="${b}servizio.html" class="hover:text-white transition-colors">Termini</a>
                            <span class="w-1 h-1 rounded-full bg-gray-700" aria-hidden="true"></span>
                            <button type="button" id="ifbv-cookie-prefs" class="hover:text-white transition-colors">Preferenze cookie</button>
                            <button type="button" id="ifbv-top" class="ml-2 inline-flex items-center gap-1 bg-white/10 hover:bg-secondary hover:text-gray-900 text-white font-bold px-3 py-2 rounded-full transition-colors">
                                <span class="material-icons text-base" aria-hidden="true">north</span> Torna su
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Scritta gigante decorativa -->
                <p class="relative text-center font-black uppercase tracking-tighter leading-[0.8] whitespace-nowrap text-white/[0.04] text-[12.5vw] select-none pointer-events-none -mb-[1.5vw]" aria-hidden="true">I Follow BV</p>
            </footer>`;

            var prefsBtn = this.querySelector('#ifbv-cookie-prefs');
            prefsBtn.addEventListener('click', function () {
                if (window.IFBConsent) window.IFBConsent.open();
            });
            // Sulle pagine senza tracciamento (non incluse consent.js) non ci sono preferenze da gestire
            if (!window.IFBConsent) prefsBtn.previousElementSibling.remove(), prefsBtn.remove();

            var topBtn = this.querySelector('#ifbv-top');
            topBtn.addEventListener('click', function () {
                var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
            });
        }
    }

    // Definisce il tag HTML personalizzato
    customElements.define('ifbv-footer', IfbvFooter);
})();
