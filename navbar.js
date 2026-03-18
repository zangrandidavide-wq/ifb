import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configurazione Supabase (Ricorda di inserire la TUA VERA chiave)
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function renderNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;

    // 2. Controllo Sessione Attiva
    const { data: { session }, error } = await supabase.auth.getSession();

    // 3. Blocco HTML Condizionale per l'autenticazione
    let authSectionHTML = '';
    let mobileAuthSectionHTML = '';

    if (session) {
        let dashboardUrl = 'dashboard-atleta.html'; 
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

        if (profile) {
            if (profile.role === 'presidente') {
                dashboardUrl = 'dashboard-admin.html';
            } else if (profile.role === 'allenatore') {
                dashboardUrl = 'dashboard-allenatore.html';
            }
        }

        // Auth per Desktop
        authSectionHTML = `
            <div class="hidden md:flex items-center gap-2">
                <a href="${dashboardUrl}" class="flex items-center gap-2 text-primary hover:text-white bg-white hover:bg-primary border border-primary font-medium rounded-full text-sm px-4 py-2 transition-all shadow-sm">
                    <span class="material-symbols-outlined text-[18px]">account_circle</span> Area Membri
                </a>
                <button id="logout-btn-desktop" class="text-white bg-red-500 hover:bg-red-600 font-medium rounded-full text-sm px-4 py-2 transition-all shadow-sm">Esci</button>
            </div>
        `;
        // Auth per Mobile (inserita dentro il menu a tendina)
        mobileAuthSectionHTML = `
            <div class="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100">
                <a href="${dashboardUrl}" class="flex justify-center items-center gap-2 w-full text-primary hover:text-white bg-white hover:bg-primary border border-primary font-medium rounded-full text-base px-5 py-3 transition-all shadow-sm">
                    <span class="material-symbols-outlined">account_circle</span> Area Membri
                </a>
                <button id="logout-btn-mobile" class="w-full text-white bg-red-500 hover:bg-red-600 font-medium rounded-full text-base px-5 py-3 transition-all shadow-sm">Esci</button>
            </div>
        `;

    } else {
        // Auth per Desktop
        authSectionHTML = `
            <div class="hidden md:flex items-center gap-2">
                <a href="login.html" class="text-slate-600 hover:text-primary font-medium text-sm px-3 py-2 transition-all">Accedi</a>
                <a href="iscrizione.html" class="text-white bg-primary hover:bg-primary/90 font-medium rounded-full text-sm px-5 py-2.5 transition-all shadow-lg">Registrati</a>
            </div>
        `;
        // Auth per Mobile
        mobileAuthSectionHTML = `
            <div class="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100">
                <a href="login.html" class="w-full text-center text-slate-600 hover:text-primary font-medium text-base px-5 py-3 transition-all border border-gray-200 rounded-full">Accedi</a>
                <a href="iscrizione.html" class="w-full text-center text-white bg-primary hover:bg-primary/90 font-medium rounded-full text-base px-5 py-3 transition-all shadow-lg">Registrati</a>
            </div>
        `;
    }

    // 4. Assemblaggio HTML della Navbar
    navbarPlaceholder.innerHTML = `
    <nav class="fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 py-3">
            
            <div class="flex items-center justify-between">
                
                <a class="flex items-center space-x-2" href="index.html">
                    <img src="logo.jpg" alt="I Follow Beach Volley" class="w-10 h-10 aspect-square rounded-full object-cover shrink-0"/>
                    <span class="self-center text-xl font-bold text-primary dark:text-white">I Follow</span>
                </a>
                
                <div class="hidden md:flex items-center space-x-8 font-medium">
                    <a href="index.html" class="text-gray-900 hover:text-primary transition-colors">Home</a>
                    
                    <div class="relative group">
                        <button type="button" class="flex items-center text-gray-900 hover:text-primary gap-1 transition-colors">
                            <span>Corsi</span> <span class="material-symbols-outlined text-[18px]">expand_more</span>
                        </button>
                        <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full pt-4 z-40 transition-all duration-300">
                            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[200px]">
                                <a href="corsi.html" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                    <span class="material-symbols-outlined text-primary/60">school</span> Tutti i corsi
                                </a>
                                <a href="coaches.html" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all mt-1">
                                    <span class="material-symbols-outlined text-primary/60">sports</span> Allenatori
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <a href="eventi.html" class="text-gray-900 hover:text-primary transition-colors">Eventi</a>
                    
                    <div class="relative group">
                        <button type="button" class="flex items-center text-gray-900 hover:text-primary gap-1 transition-colors">
                            <span>Info</span> <span class="material-symbols-outlined text-[18px]">expand_more</span>
                        </button>
                        <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full pt-4 z-40 transition-all duration-300">
                            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[200px]">
                                <a href="contatti.html" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                    <span class="material-symbols-outlined text-primary/60">mail</span> Contatti
                                </a>
                                <a href="workwith.html" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all mt-1">
                                    <span class="material-symbols-outlined text-primary/60">work</span> Lavora con noi
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                ${authSectionHTML}

                <button id="mobile-menu-btn" type="button" class="md:hidden inline-flex items-center p-2 w-12 h-12 justify-center text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                    <span class="material-symbols-outlined text-3xl" id="menu-icon">menu</span>
                </button>

            </div>

            <div id="mobile-menu-overlay" class="hidden md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 shadow-2xl origin-top">
                <div class="px-6 py-6 h-[calc(100vh-70px)] overflow-y-auto">
                    
                    <ul class="flex flex-col space-y-2 text-lg font-medium">
                        <li><a href="index.html" class="block py-3 text-gray-900 hover:text-primary">Home</a></li>
                        
                        <li class="pt-2 pb-1 border-t border-gray-100 mt-2">
                            <span class="block py-2 text-gray-400 text-sm font-bold uppercase tracking-wider">Formazione</span>
                            <ul class="pl-4 space-y-1 mt-1 border-l-2 border-primary/20">
                                <li><a href="corsi.html" class="block py-2 text-gray-700 hover:text-primary">Tutti i corsi</a></li>
                                <li><a href="coaches.html" class="block py-2 text-gray-700 hover:text-primary">I nostri Allenatori</a></li>
                            </ul>
                        </li>

                        <li><a href="eventi.html" class="block py-3 border-t border-gray-100 mt-2 text-gray-900 hover:text-primary">Eventi</a></li>
                        
                        <li class="pt-2 pb-1 border-t border-gray-100 mt-2">
                            <span class="block py-2 text-gray-400 text-sm font-bold uppercase tracking-wider">Informazioni</span>
                            <ul class="pl-4 space-y-1 mt-1 border-l-2 border-primary/20">
                                <li><a href="contatti.html" class="block py-2 text-gray-700 hover:text-primary">Contatti</a></li>
                                <li><a href="workwith.html" class="block py-2 text-gray-700 hover:text-primary">Lavora con noi</a></li>
                            </ul>
                        </li>
                    </ul>

                    ${mobileAuthSectionHTML}
                    
                </div>
            </div>

        </div>
    </nav>`;

    // 5. Logica di Interazione JS

    // Gestione Logout
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

    // Gestione Hamburger Menu Mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const menuIcon = document.getElementById('menu-icon');

    if (mobileMenuBtn && mobileMenuOverlay && menuIcon) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenuOverlay.classList.contains('hidden');
            
            if (isHidden) {
                // Apri il menu
                mobileMenuOverlay.classList.remove('hidden');
                menuIcon.textContent = 'close'; // Cambia icona in 'X'
                document.body.style.overflow = 'hidden'; // Blocca lo scroll della pagina dietro
            } else {
                // Chiudi il menu
                mobileMenuOverlay.classList.add('hidden');
                menuIcon.textContent = 'menu'; // Ripristina icona hamburger
                document.body.style.overflow = ''; // Sblocca lo scroll
            }
        });
    }
}

renderNavbar();
