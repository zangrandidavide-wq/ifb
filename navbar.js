import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configurazione Supabase (Chiavi invariate)
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function renderNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;

    // 2. Controllo Sessione
    const { data: { session } } = await supabase.auth.getSession();

    // 3. Predisposizione HTML Condizionale (Auth)
    let authSectionDesktopHTML = '';
    let authSectionMobileHTML = '';

    if (session) {
        // Logica URL Dashboard invariata...
        let dashboardUrl = 'dashboard-atleta.html'; 
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (profile) {
            if (profile.role === 'presidente') dashboardUrl = 'dashboard-admin.html';
            else if (profile.role === 'allenatore') dashboardUrl = 'dashboard-allenatore.html';
        }

        authSectionDesktopHTML = `
            <div class="flex items-center gap-2">
                <a href="${dashboardUrl}" class="flex items-center gap-2 text-primary hover:text-white bg-white hover:bg-primary border border-primary font-medium rounded-full text-sm px-4 py-2 transition-all shadow-sm">
                    <span class="material-symbols-outlined text-[18px]">account_circle</span> Area Membri
                </a>
                <button id="logout-btn-desktop" class="text-white bg-red-500 hover:bg-red-600 font-medium rounded-full text-sm px-4 py-2 transition-all shadow-sm">Esci</button>
            </div>`;

        authSectionMobileHTML = `
            <div class="flex flex-col gap-3 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                <a href="${dashboardUrl}" class="flex justify-center items-center gap-2 w-full text-primary hover:text-white bg-white hover:bg-primary border border-primary font-medium rounded-full text-base px-5 py-3.5 transition-all shadow-lg">
                    <span class="material-symbols-outlined">account_circle</span> Vai alla Tua Area Membri
                </a>
                <button id="logout-btn-mobile" class="w-full text-white bg-red-500 hover:bg-red-600 font-medium rounded-full text-base px-5 py-3.5 transition-all shadow-md">Esci dal Account</button>
            </div>`;
    } else {
        authSectionDesktopHTML = `
            <div class="flex items-center gap-2">
                <a href="login.html" class="text-slate-600 hover:text-primary font-medium text-sm px-3 py-2 transition-all">Accedi</a>
                <a href="iscrizione.html" class="text-white bg-primary hover:bg-primary/90 font-medium rounded-full text-sm px-5 py-2.5 transition-all shadow-lg">Registrati</a>
            </div>`;

        authSectionMobileHTML = `
            <div class="flex flex-col gap-3 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                <a href="login.html" class="w-full text-center text-slate-600 dark:text-gray-300 hover:text-primary font-medium text-base px-5 py-3.5 transition-all border border-gray-200 dark:border-gray-700 rounded-full">Accedi</a>
                <a href="iscrizione.html" class="w-full text-center text-white bg-primary hover:bg-primary/90 font-medium rounded-full text-base px-5 py-3.5 transition-all shadow-lg">Registrati Ora</a>
            </div>`;
    }

    // 4. Assemblaggio HTML finale (Separazione Netta Desktop/Mobile)
    navbarPlaceholder.innerHTML = `
    
    <nav class="hidden md:block fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            
            <a class="flex items-center space-x-2" href="index.html">
                <img src="logo.jpg" alt="Logo" class="w-10 h-10 rounded-full object-cover shrink-0"/>
                <span class="self-center text-xl font-bold text-primary dark:text-white">I Follow</span>
            </a>
            
            <div class="flex items-center space-x-8 font-medium">
                <a href="index.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Home</a>
                <div class="relative group">
                    <button type="button" class="flex items-center text-gray-900 dark:text-gray-100 hover:text-primary gap-1 transition-colors">
                        <span>Corsi</span> <span class="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                    <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full pt-4 z-40 transition-all duration-300">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 min-w-[200px]">
                            <a href="corsi.html" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                <span class="material-symbols-outlined text-primary/60">school</span> Tutti i corsi
                            </a>
                            <a href="coaches.html" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5 rounded-xl transition-all mt-1">
                                <span class="material-symbols-outlined text-primary/60">sports</span> Allenatori
                            </a>
                        </div>
                    </div>
                </div>
                <a href="eventi.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Eventi</a>
                <div class="relative group">
                    <button type="button" class="flex items-center text-gray-900 dark:text-gray-100 hover:text-primary gap-1 transition-colors">
                        <span>Info</span> <span class="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                    <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full pt-4 z-40 transition-all duration-300">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 min-w-[200px]">
                            <a href="contatti.html" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                <span class="material-symbols-outlined text-primary/60">mail</span> Contatti
                            </a>
                            <a href="workwith.html" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5 rounded-xl transition-all mt-1">
                                <span class="material-symbols-outlined text-primary/60">work</span> Lavora con noi
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            ${authSectionDesktopHTML}
        </div>
    </nav>

    <div class="md:hidden fixed top-4 right-4 z-50">
        <button id="floating-menu-btn" type="button" class="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 text-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all transform hover:scale-105">
            <span id="floating-menu-icon" class="material-symbols-outlined text-3xl">menu</span>
        </button>
    </div>

    <div id="mobile-menu-overlay" class="hidden md:hidden fixed inset-0 z-[60] bg-white/98 dark:bg-background-dark/98 backdrop-blur-lg origin-top transition-all duration-300">
        
        <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <a class="flex items-center space-x-2" href="index.html">
                <img src="logo.jpg" alt="Logo" class="w-10 h-10 rounded-full object-cover shrink-0"/>
                <span class="self-center text-xl font-bold text-primary dark:text-white">I Follow B.V.</span>
            </a>
            <button id="close-menu-btn" type="button" class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>

        <div class="px-8 py-10 h-[calc(100vh-80px)] overflow-y-auto">
            <ul class="flex flex-col space-y-4 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                <li><a href="index.html" class="block py-2 hover:text-primary">Home</a></li>
                
                <li class="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span class="block text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Formazione</span>
                    <ul class="pl-4 space-y-2 border-l-2 border-primary/20">
                        <li><a href="corsi.html" class="block py-2 text-xl font-bold text-gray-700 dark:text-gray-200 hover:text-primary">Tutti i corsi</a></li>
                        <li><a href="coaches.html" class="block py-2 text-xl font-bold text-gray-700 dark:text-gray-200 hover:text-primary">Allenatori</a></li>
                    </ul>
                </li>

                <li><a href="eventi.html" class="block py-2 hover:text-primary border-t border-gray-100 dark:border-gray-800 pt-4">Eventi</a></li>
                
                <li class="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span class="block text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Informazioni</span>
                    <ul class="pl-4 space-y-2 border-l-2 border-primary/20">
                        <li><a href="contatti.html" class="block py-2 text-xl font-bold text-gray-700 dark:text-gray-200 hover:text-primary">Contatti</a></li>
                        <li><a href="workwith.html" class="block py-2 text-xl font-bold text-gray-700 dark:text-gray-200 hover:text-primary">Lavora con noi</a></li>
                    </ul>
                </li>
            </ul>

            ${authSectionMobileHTML}
        </div>
    </div>`;

    // 5. Logica JavaScript Aggiornata

    // A. Gestione Logout (Invariata)
    if (session) {
        const handleLogout = async () => {
            await supabase.auth.signOut();
            window.location.reload();
        };
        const btnDesktop = document.getElementById('logout-btn-desktop');
        const btnMobile = document.getElementById('logout-btn-mobile');
        if (btnDesktop) btnDesktop.addEventListener('click', handleLogout);
        if (btnMobile) btnMobile.addEventListener('click', handleLogout);
    }

    // B. Gestione Floating Menu Mobile
    const floatingBtn = document.getElementById('floating-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (floatingBtn && closeBtn && overlay) {
        // Funzione Apri
        floatingBtn.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Blocca scroll pagina sotto
            floatingBtn.classList.add('scale-0', 'opacity-0'); // Nasconde il bottone fluttuante con animazione
        });

        // Funzione Chiudi
        closeBtn.addEventListener('click', () => {
            overlay.classList.add('hidden');
            document.body.style.overflow = ''; // Sblocca scroll
            floatingBtn.classList.remove('scale-0', 'opacity-0'); // Fa riapparire il bottone
        });
    }
}

renderNavbar();
