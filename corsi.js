import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configurazione Supabase
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Gerarchia fissa dei livelli
const LEVEL_HIERARCHY = ['Bas 1', 'Bas 2', 'Bas 3', 'Int 1', 'Int 2', 'A'];

// 3. Mappatura Elementi DOM
const containerEl = document.getElementById('courses-container');
const loadMoreBtn = document.getElementById('load-more-btn');

// Nodi dei Filtri
const filterLevel = document.getElementById('filter-level');
const filterCoach = document.getElementById('filter-coach');
const filterDate = document.getElementById('filter-date');
const filterGender = document.getElementById('filter-gender');
const btnFilter = document.getElementById('btn-filter');
const btnReset = document.getElementById('btn-reset');

// Stato della Paginazione
let currentOffset = 0;
const limit = 9;

// ==========================================
// CUSTOM MODAL
// ==========================================

const modalEl = document.getElementById('custom-modal');
const modalInner = modalEl?.querySelector('div');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

function showModal(title, message, isSuccess = false) {
    if (!modalEl) return;

    // Aggiorna contenuto
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Colore icona e simbolo
    if (isSuccess) {
        modalIcon.className = 'w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4';
        modalIcon.querySelector('span').textContent = 'check_circle';
    } else {
        modalIcon.className = 'w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4';
        modalIcon.querySelector('span').textContent = 'error';
    }

    // Mostra il modal con animazione
    modalEl.classList.remove('hidden');
    // Forza reflow per attivare la transizione
    void modalEl.offsetWidth;
    modalEl.classList.remove('opacity-0');
    modalInner?.classList.remove('scale-95');
}

function closeModal() {
    if (!modalEl) return;
    modalEl.classList.add('opacity-0');
    modalInner?.classList.add('scale-95');
    // Aspetta la fine della transizione prima di nascondere
    setTimeout(() => {
        modalEl.classList.add('hidden');
    }, 300);
}

if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
}

// Chiudi cliccando sullo sfondo
if (modalEl) {
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
    });
}

// ==========================================
// CARICAMENTO CORSI
// ==========================================

async function loadCourses(isLoadMore = false) {
    try {
        if (!isLoadMore) {
            currentOffset = 0;
            containerEl.innerHTML = `<p class="text-primary font-medium col-span-full text-center">Ricerca in corso...</p>`;
            if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        }

        // ── Recupera livello atleta dalla sessione ──
        const { data: { session } } = await supabase.auth.getSession();
        let allowedLevels = null; // null = nessun filtro per gerarchia (utente non loggato o senza livello)

        if (session) {
            const athleteId = session.user.id;
            const { data: profile } = await supabase
                .from('profiles')
                .select('level')
                .eq('id', athleteId)
                .single();

            if (profile?.level) {
                const athleteIndex = LEVEL_HIERARCHY.indexOf(profile.level);
                if (athleteIndex !== -1) {
                    // Tutti i livelli accessibili all'atleta (dal primo fino al suo, incluso)
                    allowedLevels = LEVEL_HIERARCHY.slice(0, athleteIndex + 1);
                }
                // Se il livello dell'atleta non è in gerarchia → mostra tutto (allowedLevels rimane null)
            }
            // Se l'atleta non ha livello in DB → mostra tutto (allowedLevels rimane null)
        }

        // ── Costruzione dinamica della query ──
        let query = supabase
            .from('courses')
            .select('*, profiles!inner(full_name), target_gender')
            .order('start_time', { ascending: true })
            .range(currentOffset, currentOffset + limit - 1);

        // Filtro gerarchia livelli (se l'atleta ha un livello assegnato)
        if (allowedLevels !== null) {
            query = query.in('level', allowedLevels);
        }

        // ── Applicazione filtri UI ──
        const livelloScelto = filterLevel.value;
        const coachScelto = filterCoach.value;
        const dataScelta = filterDate.value;
        const genderScelto = filterGender.value;

        if (livelloScelto) {
            // Se l'utente sceglie un livello dal filtro, verifica che sia accessibile
            if (allowedLevels !== null && !allowedLevels.includes(livelloScelto)) {
                containerEl.innerHTML = `
                    <div class="col-span-full text-center py-10">
                        <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">block</span>
                        <p class="text-slate-500 font-medium">Non hai accesso ai corsi di questo livello.</p>
                    </div>`;
                if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
                return;
            }
            query = query.eq('level', livelloScelto);
        }

        if (coachScelto) {
            query = query.eq('profiles.full_name', coachScelto);
        }

        if (dataScelta) {
            const startOfDay = `${dataScelta}T00:00:00Z`;
            const endOfDay = `${dataScelta}T23:59:59Z`;
            query = query.gte('start_time', startOfDay).lte('start_time', endOfDay);
        }

        if (genderScelto) {
            query = query.eq('target_gender', genderScelto);
        }

        // ── Esecuzione query ──
        const { data: courses, error } = await query;

        if (error) throw error;

        if (!isLoadMore) containerEl.innerHTML = '';

        if (!courses || courses.length === 0) {
            if (currentOffset === 0) {
                containerEl.innerHTML = `
                    <div class="col-span-full text-center py-10">
                        <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                        <p class="text-slate-500 font-medium">Nessun corso trovato con questi filtri.</p>
                    </div>`;
            }
            if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
            return;
        }

        renderCourses(courses);

        if (courses.length === limit) {
            if (loadMoreBtn) loadMoreBtn.classList.remove('hidden');
        } else {
            if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        }

    } catch (error) {
        console.error('Errore DB:', error.message);
        containerEl.innerHTML = `<p class="text-red-500 col-span-full text-center">Errore nel caricamento del palinsesto.</p>`;
    }
}

function renderCourses(courses) {
    let htmlContent = '';

    courses.forEach(course => {
        const startDate = new Date(course.start_time);
        const endDate = new Date(course.end_time);

        const giornoSettimana = startDate.toLocaleDateString('it-IT', { weekday: 'long' });
        const startTimeStr = startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        const dayStringFormatted = `Ogni ${giornoSettimana.charAt(0).toUpperCase() + giornoSettimana.slice(1)}, dalle ${startTimeStr} alle ${endTimeStr}`;

        const coachName = course.profiles?.full_name || 'Da definire';
        const courseName = course.name || course.title || 'Corso senza nome';

        htmlContent += `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group">
                
                <div class="flex justify-between items-start mb-4">
                    <span class="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        ${course.level || 'Vari'}
                    </span>
                </div>

                <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                    ${courseName}
                </h3>
                
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">sports</span>
                    Coach: <span class="font-semibold">${coachName}</span>
                </p>

                <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
                    <div class="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <span class="material-symbols-outlined text-primary">event_repeat</span>
                        <span class="text-sm font-semibold">${dayStringFormatted}</span>
                    </div>
                </div>

                <button data-course-id="${course.id}" data-start-time="${course.start_time}" data-target-gender="${course.target_gender || 'Mix'}" class="btn-subscribe w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-primary/40 flex justify-center items-center gap-2">
                    <span>Iscriviti</span>
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
        `;
    });

    containerEl.insertAdjacentHTML('beforeend', htmlContent);
}

// ==========================================
// EVENT LISTENERS FILTRI
// ==========================================

if (btnFilter) {
    btnFilter.addEventListener('click', () => {
        loadCourses(false);
    });
}

if (btnReset) {
    btnReset.addEventListener('click', () => {
        filterLevel.value = '';
        filterCoach.value = '';
        filterDate.value = '';
        filterGender.value = '';
        loadCourses(false);
    });
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        currentOffset += limit;
        loadCourses(true);
    });
}

// Avvio automatico al caricamento della pagina
loadCourses(false);

// ==========================================
// LOGICA DI PRENOTAZIONE (INSERT NEL DB)
// ==========================================

containerEl.addEventListener('click', async (event) => {
    const btn = event.target.closest('button.btn-subscribe');
    if (!btn) return;

    const courseId = btn.getAttribute('data-course-id');
    const courseStartTime = btn.getAttribute('data-start-time');
    const targetGender = btn.getAttribute('data-target-gender') || 'Mix';

    // Helper per ripristinare il bottone
    const resetBtn = () => {
        btn.innerHTML = `<span>Iscriviti</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
    };

    try {
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span> Attendere...`;
        btn.disabled = true;
        btn.classList.add('opacity-75', 'cursor-not-allowed');

        // Autenticazione: L'utente è loggato?
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session) {
            showModal('Accesso richiesto', 'Devi accedere al tuo account per poterti iscrivere a un allenamento.');
            resetBtn();
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            return;
        }

        const athleteId = session.user.id;

        // Verifica compatibilità di genere
        if (targetGender !== 'Mix') {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('gender')
                .eq('id', athleteId)
                .single();

            if (profileError) throw profileError;

            if (profile.gender !== targetGender) {
                showModal('Corso non compatibile', `Siamo spiacenti, questo corso è riservato ad atleti di sesso ${targetGender}.`);
                resetBtn();
                return;
            }
        }

        // Verifica se iscritto nella tabella enrollments
        const { data: existingEnrollment, error: checkError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', courseId)
            .eq('athlete_id', athleteId);

        if (checkError) throw checkError;

        if (existingEnrollment && existingEnrollment.length > 0) {
            showModal('Già iscritto', 'Sei già iscritto a questo allenamento!');
            btn.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> Già Iscritto`;
            btn.disabled = false;
            btn.classList.remove('opacity-75', 'cursor-not-allowed');
            btn.classList.replace('bg-primary', 'bg-emerald-500');
            btn.classList.replace('hover:bg-primary/90', 'hover:bg-emerald-600');
            return;
        }

        // Scrittura nel Database (Insert in enrollments)
        const { data: newEnrollmentData, error: insertError } = await supabase
            .from('enrollments')
            .insert([{ course_id: courseId, athlete_id: athleteId }])
            .select();

        if (insertError) {
            throw insertError;
        }

        const newEnrollmentId = newEnrollmentData[0].id;

        // Generazione delle presenze per i cicli di 16 settimane
        const attendancesToInsert = [];
        const baseDate = new Date(courseStartTime);

        for (let i = 0; i < 16; i++) {
            const sessionDate = new Date(baseDate);
            sessionDate.setDate(baseDate.getDate() + (i * 7));

            attendancesToInsert.push({
                enrollment_id: newEnrollmentId,
                session_date: sessionDate.toISOString(),
                status: 'da_definire'
            });
        }

        const { error: attendanceError } = await supabase
            .from('attendance')
            .insert(attendancesToInsert);

        if (attendanceError) {
            console.error('Errore durante la generazione delle 16 lezioni:', attendanceError.message);
        } else {
            console.log('Generazione delle 16 lezioni completata con successo!');
        }

        // Successo: Aggiornamento UI e showModal
        showModal('Iscrizione confermata!', 'La tua iscrizione è avvenuta con successo. Buon allenamento!', true);
        btn.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> Iscritto`;
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
        btn.classList.replace('bg-primary', 'bg-emerald-500');
        btn.classList.replace('hover:bg-primary/90', 'hover:bg-emerald-600');

    } catch (error) {
        console.error('Errore durante la prenotazione:', error.message);
        showModal('Errore', 'Si è verificato un errore durante la prenotazione. Riprova.');
        resetBtn();
    }
});