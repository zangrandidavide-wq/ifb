import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurazione Supabase (mantenuta per quando riattiverai l'autenticazione)
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function renderNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;

    // Generazione della Navbar "MVP" (Solo Home ed Eventi)
    navbarPlaceholder.innerHTML = `
    
    <nav class="hidden md:block fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            
            <a class="flex items-center space-x-2" href="index.html">
                <img src="logo.jpg" alt="Logo" class="w-10 h-10 rounded-full object-cover shrink-0"/>
              
            </a>
            
            <div class="flex items-center space-x-12 font-bold text-lg">
                <a href="index.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Home</a>
                <a href="clinic.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Eventi</a>
                <a href="coaches.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Staff Tecnico</a>
                <a href="contatti.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Contatti</a>
            </div>

            <div class="w-24"></div>
        </div>
    </nav>

    <div class="md:hidden fixed top-4 right-4 z-50">
        <button id="floating-menu-btn" type="button" class="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 text-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all transform hover:scale-105">
            <span id="floating-menu-icon" class="material-symbols-outlined text-3xl">menu</span>
        </button>
    </div>

   <div id="mobile-menu-overlay" class="hidden md:hidden fixed inset-0 z-[60] bg-white dark:bg-background-dark origin-top transition-all duration-300">
        
        <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <a class="flex items-center space-x-2" href="index.html">
                <img src="logo.jpg" alt="Logo" class="w-10 h-10 rounded-full object-cover shrink-0"/>
                <span class="self-center text-xl font-bold text-primary dark:text-white">I Follow B.V.</span>
            </a>
            <button id="close-menu-btn" type="button" class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>

        <div class="px-6 h-[calc(100vh-88px)] flex flex-col justify-center items-center pb-16">
            
            <ul class="flex flex-col space-y-8 text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white text-center">
                <li><a href="index.html" class="block hover:text-primary transition-transform duration-300 hover:scale-110">Home</a></li>
                <li><a href="clinic.html" class="block hover:text-primary transition-transform duration-300 hover:scale-110">Eventi</a></li>
                <li><a href="coaches.html" class="block hover:text-primary transition-transform duration-300 hover:scale-110">Staff Tecnico</a></li>
                <li><a href="contatti.html" class="block hover:text-primary transition-transform duration-300 hover:scale-110">Contatti</a></li>
            </ul>
            
        </div>
    </div>`;
    // Logica JavaScript per il Mobile Menu
    const floatingBtn = document.getElementById('floating-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (floatingBtn && closeBtn && overlay) {
        floatingBtn.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; 
            floatingBtn.classList.add('scale-0', 'opacity-0'); 
        });

        closeBtn.addEventListener('click', () => {
            overlay.classList.add('hidden');
            document.body.style.overflow = ''; 
            floatingBtn.classList.remove('scale-0', 'opacity-0'); 
        });
    }
}

renderNavbar();
