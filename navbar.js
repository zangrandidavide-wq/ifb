// Navbar di I Follow Beach Volley, iniettata in #navbar-placeholder su ogni pagina.
//
// Due soluzioni distinte:
//  - Desktop (lg, ≥1024px): barra bianca in alto con tutte le voci in orizzontale + CTA. Nessun hamburger.
//  - Mobile/tablet (<1024px): nessuna barra in alto, solo la tab bar in basso,
//    raggiungibile col pollice (così la pagina usa tutto lo schermo). Le voci secondarie stanno in un foglio "Altro" che viene
//    costruito solo al primo tocco, così il caricamento iniziale resta leggero.

const PROVA_GRATUITA_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdehZERFZJbABXxK9IsS5zgzaIZMo165lyDfuz3PG4UORf8Kw/viewform';
const WHATSAPP_URL = 'https://wa.me/393494633610';

const ICON_INSTAGRAM = '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>';
const ICON_WHATSAPP = '<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>';
const ICON_FACEBOOK = '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>';

const SOCIALS = [
    { label: 'Instagram', href: 'https://www.instagram.com/ifollowbv?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', icon: ICON_INSTAGRAM, style: 'background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);', cls: '' },
    { label: 'WhatsApp', href: WHATSAPP_URL, icon: ICON_WHATSAPP, style: '', cls: 'bg-[#25D366]' },
    { label: 'Facebook', href: 'https://www.facebook.com/IFOLLOWBV/', icon: ICON_FACEBOOK, style: '', cls: 'bg-[#1877F2]' },
];

const SEDI = [
    { label: 'Basiglio', href: 'sedi.html#basiglio' },
    { label: 'Pero', href: 'sedi.html#pero' },
    { label: 'Corsico', href: 'sedi.html#corsico' },
];

// Barra desktop: tutte le voci, in orizzontale.
// Home è esplicita (non solo il logo): tra 1024 e 1279px mostra solo l'icona per non affollare la barra.
// Per nascondere temporaneamente una voce basta commentarla.
const DESKTOP_LINKS = [
    { label: 'Home', href: 'index.html', icon: 'home', compactIcon: true },
    { label: 'Corsi', href: 'IFB_corsi.html' },
    { label: 'Sedi', href: 'sedi.html', children: SEDI },
    { label: 'Staff', href: 'coaches.html' },
    // { label: 'Metodo', href: 'metodo.html' },
    { label: 'Eventi', href: 'tornei.html' },
    { label: 'Rookie League', href: 'rookie-league.html', badge: true },
    { label: 'FAQ', href: 'faq.html' },
    { label: 'Contatti', href: 'contatti.html' },
];

// Tab bar mobile: le 4 destinazioni più frequenti + "Altro". Al centro la CTA.
const MOBILE_TABS = [
    { label: 'Home', href: 'index.html', icon: 'home' },
    { label: 'Corsi', href: 'IFB_corsi.html', icon: 'sports_volleyball' },
    { cta: true },
    { label: 'Eventi', href: 'tornei.html', icon: 'emoji_events' },
    { more: true },
];

// Foglio "Altro" su mobile
const MOBILE_SHEET = [
    { label: 'Sedi', href: 'sedi.html', icon: 'location_on', children: SEDI, wide: true },
    { label: 'Rookie League', href: 'rookie-league.html', icon: 'military_tech', badge: 'Nuovo' },
    { label: 'Staff', href: 'coaches.html', icon: 'groups' },
    { label: 'FAQ', href: 'faq.html', icon: 'help' },
    { label: 'Contatti', href: 'contatti.html', icon: 'mail' },
];

function currentPage() {
    const file = window.location.pathname.split('/').pop();
    return file === '' ? 'index.html' : file;
}

function socialLinks() {
    return SOCIALS.map((s) => `
        <a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}"
           class="w-10 h-10 ${s.cls} rounded-full flex items-center justify-center text-white" ${s.style ? `style="${s.style}"` : ''}>
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">${s.icon}</svg>
        </a>`).join('');
}

function renderDesktopLinks(b, page) {
    return DESKTOP_LINKS.map((link) => {
        const active = link.href === page;
        const cls = `relative inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ease-out ${active
            ? 'text-primary bg-primary/10'
            : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'}`;
        const dot = active ? '<span class="absolute left-1/2 -bottom-0.5 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-secondary" aria-hidden="true"></span>' : '';
        const badge = link.badge ? '<span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" aria-hidden="true"></span>' : '';
        const current = active ? 'aria-current="page"' : '';

        if (link.compactIcon) {
            return `<a href="${b}${link.href}" class="${cls}" ${current} title="${link.label}">` +
                `<span class="material-symbols-outlined text-xl" style="${active ? "font-variation-settings:'FILL' 1" : ''}" aria-hidden="true">${link.icon}</span>` +
                `<span class="sr-only xl:not-sr-only">${link.label}</span>${dot}</a>`;
        }

        if (!link.children) {
            return `<a href="${b}${link.href}" class="${cls}" ${current}>${link.label}${badge}${dot}</a>`;
        }

        // Tendina in solo CSS: si apre in hover e con il focus da tastiera
        return `
            <div class="relative group/dd">
                <a href="${b}${link.href}" class="${cls}" ${current}>
                    ${link.label}
                    <span class="material-symbols-outlined text-lg transition-transform duration-200 group-hover/dd:rotate-180 group-focus-within/dd:rotate-180" aria-hidden="true">expand_more</span>
                    ${dot}
                </a>
                <div class="absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 invisible translate-y-1 group-hover/dd:opacity-100 group-hover/dd:visible group-hover/dd:translate-y-0 group-focus-within/dd:opacity-100 group-focus-within/dd:visible group-focus-within/dd:translate-y-0 transition-all duration-200 ease-out">
                    <ul class="min-w-[12rem] bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl shadow-primary/10 p-2">
                        ${link.children.map((c, i) => `
                            <li>
                                <a href="${b}${c.href}" class="group/it flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary transition-colors">
                                    <span class="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center group-hover/it:bg-primary group-hover/it:text-white transition-colors">0${i + 1}</span>
                                    ${c.label}
                                </a>
                            </li>`).join('')}
                    </ul>
                </div>
            </div>`;
    }).join('');
}

function renderMobileTabs(b, page) {
    const sheetPages = MOBILE_SHEET.map((i) => i.href);
    return MOBILE_TABS.map((tab) => {
        if (tab.cta) {
            return `
                <li class="flex justify-center">
                    <a href="${PROVA_GRATUITA_URL}" target="_blank" rel="noopener noreferrer" data-track="cta_prova_gratuita" data-track-pos="tabbar"
                       class="-mt-6 flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        <span class="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 ring-4 ring-white dark:ring-background-dark active:scale-95 transition-transform">
                            <span class="material-symbols-outlined text-[28px]" aria-hidden="true">sports_volleyball</span>
                        </span>
                        Prova
                    </a>
                </li>`;
        }
        if (tab.more) {
            const active = sheetPages.includes(page);
            return `
                <li>
                    <button id="mobile-more-btn" type="button" aria-expanded="false" aria-controls="mobile-sheet"
                            class="relative w-full flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold uppercase tracking-wide ${active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}">
                        <span class="material-symbols-outlined text-2xl" aria-hidden="true">menu</span>
                        Altro
                        ${active ? '<span class="absolute top-0 right-1/4 w-1.5 h-1.5 rounded-full bg-secondary" aria-hidden="true"></span>' : ''}
                    </button>
                </li>`;
        }
        const active = tab.href === page;
        return `
            <li>
                <a href="${b}${tab.href}" ${active ? 'aria-current="page"' : ''}
                   class="relative flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold uppercase tracking-wide ${active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}">
                    <span class="material-symbols-outlined text-2xl" style="${active ? "font-variation-settings:'FILL' 1" : ''}" aria-hidden="true">${tab.icon}</span>
                    ${tab.label}
                    ${active ? '<span class="absolute -top-1 w-6 h-1 rounded-full bg-secondary" aria-hidden="true"></span>' : ''}
                </a>
            </li>`;
    }).join('');
}

function renderMobileSheet(b, page) {
    const tiles = MOBILE_SHEET.map((item) => {
        const active = item.href === page;
        const base = `rounded-3xl border p-4 ${active ? 'bg-primary/10 border-primary/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`;
        const head = `
            <span class="w-10 h-10 rounded-full ${active ? 'bg-primary text-white' : 'bg-primary/10 text-primary'} flex items-center justify-center mb-3">
                <span class="material-symbols-outlined text-xl" aria-hidden="true">${item.icon}</span>
            </span>
            <span class="block font-black uppercase tracking-tight text-lg leading-none ${active ? 'text-primary' : 'text-gray-900 dark:text-white'}">${item.label}</span>
            ${item.badge ? `<span class="mt-2 inline-flex bg-secondary text-gray-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">${item.badge}</span>` : ''}`;

        if (item.children) {
            return `
                <li class="col-span-2 ${base}">
                    <a href="${b}${item.href}" class="sheet-link block" ${active ? 'aria-current="page"' : ''}>${head}</a>
                    <div class="mt-3 flex flex-wrap gap-2">
                        ${item.children.map((c) => `<a href="${b}${c.href}" class="sheet-link inline-flex items-center gap-1 bg-background-light dark:bg-gray-900 text-sm font-bold text-gray-700 dark:text-gray-200 px-3 py-2 rounded-full active:bg-primary active:text-white">${c.label}<span class="material-symbols-outlined text-base text-primary" aria-hidden="true">south_east</span></a>`).join('')}
                    </div>
                </li>`;
        }
        return `
            <li class="${base}">
                <a href="${b}${item.href}" class="sheet-link block" ${active ? 'aria-current="page"' : ''}>${head}</a>
            </li>`;
    }).join('');

    return `
        <div class="mx-auto w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mb-4" aria-hidden="true"></div>
        <div class="flex items-center justify-between mb-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">Esplora IFB</p>
            <button id="mobile-sheet-close" type="button" aria-label="Chiudi" class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 flex items-center justify-center">
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
        </div>
        <ul class="grid grid-cols-2 gap-3">${tiles}</ul>
        <div class="mt-5 flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Seguici</p>
            <div class="flex items-center gap-2">${socialLinks()}</div>
        </div>`;
}

function renderNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;

    const b = window.IFB_NAV_BASE || '';
    const page = currentPage();

    navbarPlaceholder.innerHTML = `
    <style>
        #ifb-nav .nav-inner { transition: padding .3s ease; }
        #ifb-nav.is-scrolled { box-shadow: 0 12px 30px -18px rgba(127,19,236,.45); }
        @media (min-width: 1024px) { #ifb-nav.is-scrolled .nav-inner { padding-top: .5rem; padding-bottom: .5rem; } }
        #nav-progress { transform-origin: left; transform: scaleX(0); }
        /* Finché il font delle icone non è caricato, nasconde il nome testuale (es. "sports_volleyball") */
        #navbar-placeholder .material-symbols-outlined { display: inline-block; width: 1em; overflow: hidden; white-space: nowrap; }

        /* Mobile: spazio per la tab bar in basso e banner cookie sopra di essa */
        @media (max-width: 1023.98px) {
            body { padding-bottom: calc(4.25rem + env(safe-area-inset-bottom)); }
            #cookie-banner { bottom: calc(4.25rem + env(safe-area-inset-bottom)); }
        }
        #mobile-sheet { transition: transform .3s cubic-bezier(.32,.72,0,1); }
        #mobile-sheet-backdrop { transition: opacity .25s ease; }
        @media (prefers-reduced-motion: reduce) { #mobile-sheet, #mobile-sheet-backdrop { transition: none; } }
    </style>

    <!-- BARRA SUPERIORE -->
    <nav id="ifb-nav" class="max-lg:hidden fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md" aria-label="Navigazione principale">
        <div class="nav-inner max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

            <a class="group shrink-0 flex items-center justify-center w-[120px] h-10 bg-[#74297c] rounded-full shadow-md overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30" href="${b}index.html" aria-label="I Follow Beach Volley, home">
                <img src="${b}logo-trasparente.png" alt="Logo IFB" class="h-8 w-auto object-contain" />
            </a>

            <!-- Desktop: tutte le voci in orizzontale -->
            <div class="flex items-center gap-0.5 xl:gap-1 [&>a:first-child]:mr-1 [&>a:first-child]:after:content-[''] [&>a:first-child]:after:absolute [&>a:first-child]:after:-right-1 [&>a:first-child]:after:top-1/2 [&>a:first-child]:after:-translate-y-1/2 [&>a:first-child]:after:h-5 [&>a:first-child]:after:w-px [&>a:first-child]:after:bg-gray-200 dark:[&>a:first-child]:after:bg-gray-700">
                ${renderDesktopLinks(b, page)}
            </div>

            <a href="${PROVA_GRATUITA_URL}" target="_blank" rel="noopener noreferrer" data-track="cta_prova_gratuita" data-track-pos="navbar"
               class="inline-flex shrink-0 items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-extrabold pl-4 pr-5 py-2.5 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-200 ease-out hover:-translate-y-0.5">
                <span class="material-symbols-outlined text-lg" aria-hidden="true">sports_volleyball</span>
                Prova gratuita
            </a>
        </div>

        <!-- Barra di avanzamento della lettura -->
        <div class="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden" aria-hidden="true">
            <div id="nav-progress" class="h-full bg-gradient-to-r from-secondary via-primary to-secondary"></div>
        </div>
    </nav>

    <!-- MOBILE: TAB BAR IN BASSO -->
    <nav class="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]" aria-label="Navigazione rapida">
        <ul class="grid grid-cols-5 items-end h-[4.25rem] px-1">
            ${renderMobileTabs(b, page)}
        </ul>
    </nav>

    <!-- MOBILE: FOGLIO "ALTRO" (contenuto creato al primo tocco) -->
    <div id="mobile-sheet-backdrop" class="lg:hidden fixed inset-0 z-[60] bg-gray-900/50 opacity-0 pointer-events-none"></div>
    <div id="mobile-sheet" role="dialog" aria-modal="true" aria-label="Altre pagine" inert
         class="lg:hidden fixed inset-x-0 bottom-0 z-[70] max-h-[85svh] overflow-y-auto bg-background-light dark:bg-slate-950 rounded-t-[2rem] px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl translate-y-full"></div>`;

    // Scroll (solo desktop, dove la barra è visibile): navbar compatta + barra di avanzamento
    const nav = document.getElementById('ifb-nav');
    const progress = document.getElementById('nav-progress');
    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            nav.classList.toggle('is-scrolled', y > 12);
            progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
            ticking = false;
        });
    }
    const desktopMq = window.matchMedia('(min-width: 1024px)');
    function syncScrollListener() {
        if (desktopMq.matches) {
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        } else {
            window.removeEventListener('scroll', onScroll);
        }
    }
    desktopMq.addEventListener('change', syncScrollListener);
    syncScrollListener();

    // Foglio "Altro" (solo mobile)
    const moreBtn = document.getElementById('mobile-more-btn');
    const sheet = document.getElementById('mobile-sheet');
    const backdrop = document.getElementById('mobile-sheet-backdrop');
    if (!moreBtn || !sheet || !backdrop) return;

    function openSheet() {
        if (!sheet.childElementCount) {
            sheet.innerHTML = renderMobileSheet(b, page);
            sheet.querySelectorAll('.sheet-link').forEach((a) => a.addEventListener('click', closeSheet));
            document.getElementById('mobile-sheet-close').addEventListener('click', closeSheet);
        }
        sheet.removeAttribute('inert');
        sheet.classList.remove('translate-y-full');
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        moreBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeSheet() {
        sheet.classList.add('translate-y-full');
        sheet.setAttribute('inert', '');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        moreBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    moreBtn.addEventListener('click', () => {
        if (sheet.classList.contains('translate-y-full')) openSheet();
        else closeSheet();
    });
    backdrop.addEventListener('click', closeSheet);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !sheet.classList.contains('translate-y-full')) {
            closeSheet();
            moreBtn.focus();
        }
    });
    // Se si ruota/allarga lo schermo fino al desktop, il foglio si chiude
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) closeSheet(); });
}

renderNavbar();
