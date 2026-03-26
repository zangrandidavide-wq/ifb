import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configurazione Supabase
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Mappatura DOM - Profilo
const nameEl = document.getElementById('profile-fullname');
const emailEl = document.getElementById('profile-email');
const dateEl = document.getElementById('profile-date');
const initialsEl = document.getElementById('profile-initials');
const sidebarNameEl = document.getElementById('sidebar-fullname');

// 3. Mappatura DOM - I Miei Corsi
const myCoursesContainer = document.getElementById('my-courses-container');

async function loadUserProfile() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Nessuna sessione attiva');

        // Caricamento Dati Anagrafici (Come prima)
        const { data: profile, error: dbError } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, created_at')
            .eq('id', user.id)
            .single();

        if (dbError) throw dbError;

        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
        
        const joinDate = new Date(profile.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });

        if (nameEl) nameEl.textContent = fullName || 'Atleta';
        if (emailEl) emailEl.textContent = profile.email;
        if (dateEl) dateEl.textContent = joinDate;
        if (initialsEl) initialsEl.textContent = initials;
        if (sidebarNameEl) sidebarNameEl.textContent = fullName || 'Atleta';

        const headerGreeting = document.querySelector('header h2');
        if (headerGreeting && firstName) headerGreeting.textContent = `Pronta a scendere sulla sabbia, ${firstName}? 🏐`;

        // ==========================================
        // NOVITÀ: Avviamo il caricamento dei corsi personali
        // ==========================================
        if (myCoursesContainer) {
            await loadMyCourses(user.id);
        }

    } catch (error) {
        console.error('Errore Profilo:', error.message);
    }
}

// Funzione dedicata alla lettura della tabella ponte
async function loadMyCourses(userId) {
    try {
        const now = new Date().toISOString();

        // QUERY CON INNER JOIN: Estraiamo i corsi filtrando in base alla tabella ponte
        const { data: myCourses, error } = await supabase
            .from('courses')
            // course_registrations!inner(...) è la sintassi Supabase per forzare la Join Relazionale
            .select('*, course_registrations!inner(id)') 
            .eq('course_registrations.user_id', userId)
            .gte('start_time', now) // Mostriamo solo le prenotazioni da oggi in poi
            .order('start_time', { ascending: true });

        if (error) throw error;

        // Gestione stato vuoto
        if (!myCourses || myCourses.length === 0) {
            myCoursesContainer.innerHTML = `
                <div class="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                    <span class="material-symbols-outlined text-4xl text-slate-300 mb-3">sports_volleyball</span>
                    <p class="text-slate-500 font-medium mb-4">Non hai ancora prenotato nessun allenamento futuro.</p>
                    <a href="corsi.html" class="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all shadow-md gap-2">
                        Vai al Palinsesto
                    </a>
                </div>`;
            return;
        }

        let htmlContent = '';

        myCourses.forEach(course => {
            const startDate = new Date(course.start_time);
            const endDate = new Date(course.end_time);
            
            // Strictly UTC per gli orari
            const dayString = startDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
            const startTimeStr = startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
            const endTimeStr = endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
            
            // Salviamo l'ID esatto della registrazione (dalla tabella ponte) per poterla cancellare
            const registrationId = course.course_registrations[0].id;

            htmlContent += `
                <div class="bg-white dark:bg-slate-900 border border-primary/20 dark:border-primary/30 rounded-2xl p-5 shadow-md flex flex-col relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-primary group-hover:bg-primary-dark transition-colors"></div>
                    
                    <h4 class="text-lg font-black text-slate-900 dark:text-white mb-1 pl-2">${course.title}</h4>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 pl-2">${course.level} • Coach: ${course.coach || 'Da def.'}</p>
                    
                    <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4 flex-grow">
                        <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-1">
                            <span class="material-symbols-outlined text-primary text-sm">calendar_today</span>
                            <span class="text-sm font-semibold capitalize">${dayString}</span>
                        </div>
                        <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <span class="material-symbols-outlined text-primary text-sm">schedule</span>
                            <span class="text-sm font-semibold">${startTimeStr} - ${endTimeStr}</span>
                        </div>
                    </div>

                    <button data-reg-id="${registrationId}" class="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-2.5 rounded-xl transition-all text-sm flex justify-center items-center gap-2 btn-annulla">
                        <span class="material-symbols-outlined text-sm">cancel</span> Annulla Prenotazione
                    </button>
                </div>
            `;
        });

        myCoursesContainer.innerHTML = htmlContent;

    } catch (err) {
        console.error('Errore caricamento corsi personali:', err.message);
        myCoursesContainer.innerHTML = `<p class="text-red-500 font-medium">Impossibile caricare i tuoi allenamenti al momento.</p>`;
    }
}

// ==========================================
// LOGICA DI CANCELLAZIONE (DELETE DAL DB)
// ==========================================
if (myCoursesContainer) {
    myCoursesContainer.addEventListener('click', async (event) => {
        const btn = event.target.closest('button[data-reg-id]');
        if (!btn) return;

        // Chiediamo conferma per evitare click accidentali
        const conferma = confirm("Sei sicuro di voler annullare l'iscrizione a questo allenamento? Il posto tornerà disponibile per gli altri.");
        if (!conferma) return;

        const regId = btn.getAttribute('data-reg-id');

        try {
            // Animazione caricamento
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span> Annullamento in corso...`;
            btn.disabled = true;

            // Eseguiamo l'operazione DELETE nella tabella ponte
            const { error } = await supabase
                .from('course_registrations')
                .delete()
                .eq('id', regId);

            if (error) throw error;

            // Ricarichiamo dinamicamente l'interfaccia eliminando la card
            const cardElement = btn.closest('.bg-white');
            cardElement.remove();

            // Se abbiamo svuotato l'elenco, ricarichiamo la funzione per mostrare il messaggio di "stato vuoto"
            if (myCoursesContainer.children.length === 0) {
                const { data: { user } } = await supabase.auth.getUser();
                loadMyCourses(user.id);
            }

        } catch (error) {
            console.error('Errore durante la cancellazione:', error.message);
            alert('Si è verificato un errore. Riprova più tardi.');
            btn.innerHTML = `<span class="material-symbols-outlined text-sm">cancel</span> Annulla Prenotazione`;
            btn.disabled = false;
        }
    });
}

// Avvio
loadUserProfile();