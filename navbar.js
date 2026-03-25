import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurazione Supabase (Backend pronto)
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function renderNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;

    navbarPlaceholder.innerHTML = `
    
    <nav class="hidden md:block fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            
<a class="flex items-center justify-center w-[120px] h-10 bg-[#74297c] rounded-xl shadow-md overflow-hidden transform transition hover:scale-105" href="index.html">
    <img src="logo-trasparente.png" alt="Logo IFB" class="h-8 w-auto object-contain" />
</a>

            <div class="flex items-center space-x-12 font-bold text-lg">
                <a href="index.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Home</a>
                <a href="clinic.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Eventi</a>
                <a href="coaches.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Staff Tecnico</a>
                <a href="contatti.html" class="text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">Contatti</a>
            </div>
            
            <div class="flex items-center justify-end space-x-3 w-32">
                <a href="https://www.instagram.com/ifollowbv?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transform transition hover:scale-110 hover:shadow-lg" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://wa.me/393923002516" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md shadow-[#25D366]/30 transform transition hover:scale-110 hover:shadow-lg">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                </a>
                <a href="https://www.facebook.com/IFOLLOWBV/" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-md shadow-[#1877F2]/30 transform transition hover:scale-110 hover:shadow-lg">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
            </div>
            
        </div>
    </nav>

    <div class="md:hidden fixed top-4 right-4 z-[55]">
        <button id="floating-menu-btn" type="button" class="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 text-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all transform hover:scale-105">
            <span id="floating-menu-icon" class="material-symbols-outlined text-3xl">menu</span>
        </button>
    </div>

    <div id="mobile-menu-backdrop" class="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] opacity-0 pointer-events-none transition-opacity duration-300"></div>

    <div id="mobile-menu-drawer" class="md:hidden fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background-light dark:bg-slate-950 z-[70] shadow-2xl transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col overflow-hidden border-l border-gray-200 dark:border-gray-800">
        
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        </div>

        <div class="flex justify-end p-6 relative z-10">
            <button id="close-menu-btn" type="button" class="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-primary focus:outline-none">
                <span class="material-symbols-outlined text-2xl">close</span>
            </button>
        </div>

        <div class="px-6 py-2 flex flex-col space-y-4 relative z-10">
            
            <a href="index.html" class="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
                <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <span class="material-icons">home</span>
                </div>
                <span class="text-xl font-black text-gray-900 dark:text-white tracking-tight">Home</span>
            </a>

            <a href="clinic.html" class="flex items-center gap-4 p-4 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 hover:scale-[1.02] transition-transform">
                <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                    <span class="material-icons">emoji_events</span>
                </div>
                <span class="text-xl font-black text-primary dark:text-primary-300 tracking-tight">Eventi</span>
            </a>

            <a href="coaches.html" class="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
                <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <span class="material-icons">groups</span>
                </div>
                <span class="text-xl font-black text-gray-900 dark:text-white tracking-tight">Staff Tecnico</span>
            </a>

            <a href="contatti.html" class="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
                <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <span class="material-icons">chat_bubble</span>
                </div>
                <span class="text-xl font-black text-gray-900 dark:text-white tracking-tight">Contatti</span>
            </a>

        </div>
        
        <div class="mt-auto p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative z-10">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Connettiti con noi</p>
            <div class="flex justify-center gap-6">
                <a href="https://www.instagram.com/ifollowbv?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" class="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transform transition hover:scale-110" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);">
                    <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://wa.me/393923002516" target="_blank" rel="noopener noreferrer" class="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/30 transform transition hover:scale-110">
                    <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                </a>
                <a href="https://www.facebook.com/IFOLLOWBV/" target="_blank" rel="noopener noreferrer" class="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-lg shadow-[#1877F2]/30 transform transition hover:scale-110">
                    <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
            </div>
        </div>
        
    </div>`;

    // LOGICA JAVASCRIPT (Invariata)
    const floatingBtn = document.getElementById('floating-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const drawer = document.getElementById('mobile-menu-drawer');
    const backdrop = document.getElementById('mobile-menu-backdrop');

    function openMenu() {
        drawer.classList.remove('translate-x-full');
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
        floatingBtn.classList.add('scale-0', 'opacity-0');
    }

    function closeMenu() {
        drawer.classList.add('translate-x-full');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
        floatingBtn.classList.remove('scale-0', 'opacity-0');
    }

    if (floatingBtn && closeBtn && drawer && backdrop) {
        floatingBtn.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        backdrop.addEventListener('click', closeMenu); 
    }
}

renderNavbar();