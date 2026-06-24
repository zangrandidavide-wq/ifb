import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurazione Supabase (Backend pronto)
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function renderNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;

    const b = window.IFB_NAV_BASE || '';

    navbarPlaceholder.innerHTML = `
    <style>
        #mobile-menu-drawer {
            transition: transform 0.45s cubic-bezier(0.32, 0.72, 0, 1);
        }
        #mobile-menu-backdrop {
            transition: opacity 0.4s ease;
        }
        #mobile-menu-drawer .drawer-item,
        #mobile-menu-drawer .drawer-header,
        #mobile-menu-drawer .drawer-footer {
            opacity: 0;
            transform: translateX(28px);
            transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        #mobile-menu-drawer .drawer-footer {
            transform: translateY(20px);
        }
        #mobile-menu-drawer.is-open .drawer-header {
            opacity: 1;
            transform: translateX(0);
            transition-delay: 0.05s;
        }
        #mobile-menu-drawer.is-open .drawer-item:nth-child(1) { transition-delay: 0.1s; }
        #mobile-menu-drawer.is-open .drawer-item:nth-child(2) { transition-delay: 0.15s; }
        #mobile-menu-drawer.is-open .drawer-item:nth-child(3) { transition-delay: 0.2s; }
        #mobile-menu-drawer.is-open .drawer-item:nth-child(4) { transition-delay: 0.25s; }
        #mobile-menu-drawer.is-open .drawer-item:nth-child(5) { transition-delay: 0.3s; }
        #mobile-menu-drawer.is-open .drawer-item:nth-child(6) { transition-delay: 0.35s; }
        #mobile-menu-drawer.is-open .drawer-item:nth-child(7) { transition-delay: 0.4s; }
        #mobile-menu-drawer.is-open .drawer-item {
            opacity: 1;
            transform: translateX(0);
        }
        #mobile-menu-drawer.is-open .drawer-footer {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 0.45s;
        }
        #mobile-menu-drawer:not(.is-open) .drawer-item,
        #mobile-menu-drawer:not(.is-open) .drawer-header,
        #mobile-menu-drawer:not(.is-open) .drawer-footer {
            transition-delay: 0s;
        }
        #main-menu-trigger .menu-icon-open,
        #main-menu-trigger .menu-icon-close {
            transition: opacity 0.25s ease, transform 0.25s ease;
        }
        #main-menu-trigger .menu-icon-close {
            position: absolute;
            opacity: 0;
            transform: rotate(-90deg) scale(0.6);
        }
        #main-menu-trigger.is-active .menu-icon-open {
            opacity: 0;
            transform: rotate(90deg) scale(0.6);
        }
        #main-menu-trigger.is-active .menu-icon-close {
            opacity: 1;
            transform: rotate(0) scale(1);
        }
    </style>

    <nav class="fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md">
        <!-- Aggiunta la classe relative qui -->
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
            
            <a class="flex items-center justify-center w-[120px] h-10 bg-[#74297c] rounded-xl shadow-md overflow-hidden transform transition hover:scale-105" href="${b}index.html">
                <img src="${b}logo-trasparente.png" alt="Logo IFB" class="h-8 w-auto object-contain" />
            </a>

            <!-- BLOCCO ICONE SOCIAL CENTRATO IN MODO ASSOLUTO (Visibile solo su schermi MD o superiori) -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-3">
                <a href="https://www.instagram.com/ifollowbv?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transform transition hover:scale-110 hover:shadow-lg" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://wa.me/393494633610" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md shadow-[#25D366]/30 transform transition hover:scale-110 hover:shadow-lg">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                </a>
                <a href="https://www.facebook.com/IFOLLOWBV/" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-md shadow-[#1877F2]/30 transform transition hover:scale-110 hover:shadow-lg">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
            </div>

            <!-- MENU TRIGGER (Allineato a destra) -->
            <button
                id="main-menu-trigger"
                type="button"
                class="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary dark:text-primary-300 font-bold text-base hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 transform hover:scale-105"
                aria-expanded="false"
                aria-controls="mobile-menu-drawer"
            >
                <span class="relative w-6 h-6 flex items-center justify-center">
                    <span class="material-symbols-outlined text-2xl menu-icon-open">menu</span>
                    <span class="material-symbols-outlined text-2xl menu-icon-close">close</span>
                </span>
                <span>Menù</span>
            </button>
            
        </div>
    </nav>

    <!-- IL RESTO DEL CODICE DEL MENU MOBILE RIMANE INVARIATO -->
    <div id="mobile-menu-backdrop" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] opacity-0 pointer-events-none transition-opacity duration-300"></div>

    <div id="mobile-menu-drawer" class="fixed top-0 right-0 h-full w-[85%] sm:w-96 max-w-md bg-background-light dark:bg-slate-950 z-[70] shadow-2xl transform translate-x-full flex flex-col overflow-hidden border-l border-gray-200 dark:border-gray-800">
        
        <div class="drawer-header flex justify-end p-6 relative z-10 shrink-0">
            <button id="close-menu-btn" type="button" class="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-primary focus:outline-none transition-colors">
                <span class="material-symbols-outlined text-2xl">close</span>
            </button>
        </div>

        <nav class="flex-1 overflow-y-auto px-6 pb-6 relative z-10" aria-label="Menù principale">
            <ul class="flex flex-col">

                <li class="drawer-item">
                    <a href="${b}index.html" class="drawer-link block py-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:text-primary dark:hover:text-primary transition-colors">
                        Home
                    </a>
                </li>

                <li class="drawer-item">
                    <a href="${b}IFB_corsi.html" class="drawer-link block py-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:text-primary dark:hover:text-primary transition-colors">
                        Corsi
                    </a>
                </li>

                <!-- TEMP: voce Shop rimossa momentaneamente
                <li class="drawer-item">
                    <a href="${b}shop/index.html" class="drawer-link block py-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:text-primary dark:hover:text-primary transition-colors">
                        Shop
                    </a>
                </li>
                -->

                <li class="drawer-item">
                    <button
                        id="sedi-accordion-btn"
                        type="button"
                        class="w-full flex items-center justify-between py-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:text-primary dark:hover:text-primary transition-colors focus:outline-none"
                        aria-expanded="false"
                        aria-controls="sedi-submenu"
                    >
                        <span>Sedi</span>
<span id="sedi-chevron" class="material-symbols-outlined text-2xl text-primary transition-transform duration-300">expand_more</span>
</button>
                    <div id="sedi-submenu" class="overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0" aria-hidden="true">
                        <ul class="pl-4 pb-2 border-l-2 border-primary/20 ml-1">
                            <li>
                                <a href="${b}sedi.html#basiglio" class="drawer-link block py-3 text-xl font-bold text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                                    Basiglio
                                </a>
                            </li>
                            <li>
                                <a href="${b}sedi.html#pero" class="drawer-link block py-3 text-xl font-bold text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                                    Pero
                                </a>
                            </li>
                            <li>
                                <a href="${b}sedi.html#corsico" class="drawer-link block py-3 text-xl font-bold text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                                    Corsico
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>

                <li class="drawer-item">
                    <a href="${b}coaches.html" class="drawer-link block py-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:text-primary dark:hover:text-primary transition-colors">
                        Staff
                    </a>
                </li>

                <!-- TEMP: voce Metodo IFB rimossa momentaneamente
                <li class="drawer-item">
                    <a href="${b}metodo.html" class="drawer-link block py-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:text-primary dark:hover:text-primary transition-colors">
                        Metodo IFB
                    </a>
                </li>
                -->

                <li class="drawer-item">
                    <a href="${b}tornei.html" class="drawer-link block py-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:text-primary dark:hover:text-primary transition-colors">
                        Eventi
                    </a>
                </li>

                <li class="drawer-item">
                    <a href="${b}contatti.html" class="drawer-link block py-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight hover:text-primary dark:hover:text-primary transition-colors">
                        Contatti
                    </a>
                </li>

            </ul>
        </nav>
        
        <div class="drawer-footer shrink-0 p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative z-10">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Connettiti con noi</p>
            <div class="flex justify-center gap-6">
                <a href="https://www.instagram.com/ifollowbv?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" class="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transform transition hover:scale-110" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);">
                    <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://wa.me/393494633610" target="_blank" rel="noopener noreferrer" class="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/30 transform transition hover:scale-110">
                    <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                </a>
                <a href="https://www.facebook.com/IFOLLOWBV/" target="_blank" rel="noopener noreferrer" class="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-lg shadow-[#1877F2]/30 transform transition hover:scale-110">
                    <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
            </div>
        </div>
        
    </div>`;

    const menuTrigger = document.getElementById('main-menu-trigger');
    const closeBtn = document.getElementById('close-menu-btn');
    const drawer = document.getElementById('mobile-menu-drawer');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const sediBtn = document.getElementById('sedi-accordion-btn');
    const sediSubmenu = document.getElementById('sedi-submenu');
    const sediChevron = document.getElementById('sedi-chevron');

    function openMenu() {
        drawer.classList.remove('translate-x-full');
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
        if (menuTrigger) {
            menuTrigger.setAttribute('aria-expanded', 'true');
            menuTrigger.classList.add('is-active');
        }
        requestAnimationFrame(() => {
            requestAnimationFrame(() => drawer.classList.add('is-open'));
        });
    }

    function closeMenu() {
        drawer.classList.remove('is-open');
        drawer.classList.add('translate-x-full');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
        if (menuTrigger) {
            menuTrigger.setAttribute('aria-expanded', 'false');
            menuTrigger.classList.remove('is-active');
        }
    }

    function toggleSediSubmenu() {
        const isOpen = sediSubmenu.classList.contains('max-h-0');

        if (isOpen) {
            sediSubmenu.classList.remove('max-h-0', 'opacity-0');
            sediSubmenu.classList.add('max-h-48', 'opacity-100');
            sediSubmenu.setAttribute('aria-hidden', 'false');
            sediBtn.setAttribute('aria-expanded', 'true');
            sediChevron.classList.add('rotate-180');
        } else {
            sediSubmenu.classList.add('max-h-0', 'opacity-0');
            sediSubmenu.classList.remove('max-h-48', 'opacity-100');
            sediSubmenu.setAttribute('aria-hidden', 'true');
            sediBtn.setAttribute('aria-expanded', 'false');
            sediChevron.classList.remove('rotate-180');
        }
    }

    if (menuTrigger && closeBtn && drawer && backdrop) {
        menuTrigger.addEventListener('click', () => {
            if (drawer.classList.contains('translate-x-full')) {
                openMenu();
            } else {
                closeMenu();
            }
        });
        closeBtn.addEventListener('click', closeMenu);
        backdrop.addEventListener('click', closeMenu);

        document.querySelectorAll('.drawer-link').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });
    }

    if (sediBtn && sediSubmenu && sediChevron) {
        sediBtn.addEventListener('click', toggleSediSubmenu);
    }
}

renderNavbar();