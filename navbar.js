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

    // 3. Blocco HTML Condizionale
    let authSectionHTML = '';

    if (session) {
        // Estrai il ruolo dalla tabella profiles
        let dashboardUrl = 'dashboard-atleta.html'; // Default di sicurezza
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

        authSectionHTML = `
            <a href="${dashboardUrl}" class="flex items-center gap-2 text-primary hover:text-white bg-white hover:bg-primary border border-primary font-medium rounded-full text-sm px-4 py-2 transition-all shadow-sm">
                <span class="material-symbols-outlined text-[18px]">account_circle</span>
                Area Membri
            </a>
            <button id="logout-btn" class="text-white bg-red-500 hover:bg-red-600 font-medium rounded-full text-sm px-4 py-2 transition-all shadow-sm">
                Esci
            </button>
        `;
    } else {
        authSectionHTML = `
            <a href="login.html" class="text-slate-600 hover:text-primary font-medium text-sm px-3 py-2 transition-all">
                Accedi
            </a>
            <a href="iscrizione.html" class="text-white bg-primary hover:bg-primary/90 font-medium rounded-full text-sm px-5 py-2.5 transition-all shadow-lg">
                Registrati
            </a>
        `;
    }

    // 4. Assemblaggio nel DOM
    navbarPlaceholder.innerHTML = `
    <nav class="fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 py-3">
            
            <a class="flex items-center space-x-2" href="index.html">
                <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                    <span class="material-symbols-outlined">sports_volleyball</span>
                </div>
                <span class="self-center text-xl font-bold text-primary dark:text-white">I Follow Beach Volley</span>
            </a>
            
            <div class="flex md:order-2 space-x-2 items-center">
                
                ${authSectionHTML}
                
                <button data-collapse-toggle="navbar-sticky" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 17 14"><path d="M1 1h15M1 7h15M1 13h15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                </button>
            </div>
            
            <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                <ul class="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                    <li><a href="index.html" class="block py-2 px-3 text-primary">Home</a></li>
                    <li><a href="corsi.html" class="block py-2 px-3 text-gray-900 hover:text-primary">Corsi</a></li>
                    <li><a href="eventi.html" class="block py-2 px-3 text-gray-900 hover:text-primary">Eventi</a></li>
                    <li><a href="contatti.html" class="block py-2 px-3 text-gray-900 hover:text-primary">Contatti</a></li>
                </ul>
            </div>
        </div>
    </nav>`;

    // 5. Aggancio dell'Evento di Logout
    if (session) {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await supabase.auth.signOut();
                window.location.reload(); 
            });
        }
    }
}

renderNavbar();