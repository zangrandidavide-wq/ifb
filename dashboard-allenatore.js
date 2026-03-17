import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurazione Supabase
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// UI Elements
const els = {
    mainContent: document.getElementById('main-content'),
    errorContent: document.getElementById('error-content'),
    coachFirstname: document.getElementById('coach-firstname'),

    coursesContainer: document.getElementById('courses-container'),

    selectedCourseTitle: document.getElementById('selected-course-title'),
    selectedCourseDesc: document.getElementById('selected-course-desc'),
    attendanceEmptyState: document.getElementById('attendance-empty-state'),
    attendanceLoading: document.getElementById('attendance-loading'),
    sessionsContainer: document.getElementById('sessions-container')
};

let currentUser = null;
let currentProfile = null;
let coachCourses = [];

// Initialize
async function initCoachDashboard() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError || new Error("User not authenticated");

        currentUser = user;

        // Check Role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', currentUser.id)
            .single();

        if (profileError || profile.role !== 'allenatore') {
            console.warn("L'utente non è un allenatore.");
            els.errorContent.style.display = 'flex';
            // Opzionale: redirect automatico dopo 3 sec => setTimeout(() => window.location.href='index.html', 3000);
            return;
        }

        currentProfile = profile;
        els.mainContent.style.display = 'block';

        // Set Welcome Name
        if (profile.full_name) {
            els.coachFirstname.textContent = profile.full_name.split(' ')[0];
        }

        // Fetch Data
        await loadCourses();

    } catch (err) {
        console.error("Errore inizializzazione coach dashboard:", err);
    }
}

// FORMAT DATE UTILS
function formatSessionDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'long', day: 'numeric' }; // Es: "Lunedì 15 Maggio"
    const timeOptions = { hour: '2-digit', minute: '2-digit' }; // Es: "18:30"

    return {
        dateStr: date.toLocaleDateString('it-IT', options).replace(/^\w/, (c) => c.toUpperCase()),
        timeStr: date.toLocaleTimeString('it-IT', timeOptions)
    };
}

/* -------------------------------------------
 * COURSES LISTING
 * ------------------------------------------- */
async function loadCourses() {
    const coachId = currentUser.id;

    const { data: courses, error } = await supabase
        .from('courses')
        .select('*, enrollments(id)')
        .eq('coach_id', coachId)
        .order('name');

    if (error) {
        console.error("Errore caricamento corsi:", error);
        els.coursesContainer.innerHTML = '<p class="text-red-500 font-medium p-4 bg-red-50 rounded-lg text-sm text-center">Impossibile caricare i corsi.</p>';
        return;
    }

    coachCourses = courses;
    renderCoursesList();
}

function renderCoursesList() {
    els.coursesContainer.innerHTML = '';

    if (coachCourses.length === 0) {
        els.coursesContainer.innerHTML = `
            <div class="text-center py-8 flex flex-col items-center gap-2">
                <span class="material-icons text-gray-300 text-5xl">event_busy</span>
                <p class="text-gray-500 font-medium text-sm">Nessun corso assegnato al momento.</p>
                <span class="text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 px-3 py-1 rounded-full">Contatta un Presidente</span>
            </div>`;
        return;
    }

    coachCourses.forEach(course => {
        const iscritti = course.enrollments ? course.enrollments.length : 0;
        const startDate = new Date(course.start_time);
        const dayName = new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(startDate);
        const startTime = startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        const btn = document.createElement('button');
        btn.className = `w-full text-left p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between group course-select-btn`;
        btn.dataset.id = course.id;

        btn.innerHTML = `
            <div class="flex flex-col w-full gap-2">
                <div class="flex justify-between items-start w-full">
                    <span class="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors text-left leading-tight pr-2">
                        ${course.name}
                    </span>
                    <span class="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md ${iscritti >= 8 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary/10 text-primary dark:bg-primary/20'}">
                        ${iscritti}/8
                    </span>
                </div>
                <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span class="material-icons text-[14px]">schedule</span>
                    <span>${capitalizedDay}, ${startTime}</span>
                </div>
            </div>
        `;

        btn.addEventListener('click', () => selectCourse(course.id));
        els.coursesContainer.appendChild(btn);
    });
}

// Visual feedback for selected course in sidebar
function highlightSelectedCourse(courseId) {
    document.querySelectorAll('.course-select-btn').forEach(btn => {
        if (btn.dataset.id === courseId) {
            btn.classList.add('border-primary', 'ring-2', 'ring-primary/20', 'bg-primary/5', 'dark:bg-primary/10');
            btn.classList.remove('border-gray-100', 'dark:border-gray-700');
        } else {
            btn.classList.remove('border-primary', 'ring-2', 'ring-primary/20', 'bg-primary/5', 'dark:bg-primary/10');
            btn.classList.add('border-gray-100', 'dark:border-gray-700');
        }
    });
}


/* -------------------------------------------
 * ATTENDANCE ROLL-CALL SECTION
 * ------------------------------------------- */
async function selectCourse(courseId) {
    highlightSelectedCourse(courseId);

    const course = coachCourses.find(c => c.id === courseId);
    if (!course) return;

    els.selectedCourseTitle.textContent = course.name;
    els.selectedCourseDesc.textContent = course.description || 'Appello presenze.';

    els.attendanceEmptyState.classList.add('hidden');
    els.sessionsContainer.classList.add('hidden');
    els.attendanceLoading.classList.remove('hidden');

    await loadRollCall(courseId);
}

async function loadRollCall(courseId) {
    // 1. Fetch attendance for this specific course. Note this uses inner joins through enrollments to get the athlete!
    // Since RLS limits enrollments to those in our courses, and attendance to those in those enrollments, we are safe.
    // However, to be explicit within a given course, we filter on enrollments.course_id.

    // We only fetch today's or future sessions to avoid overwhelming the view.
    // Use an arbitrarily old date if you wanted all history, but for an ongoing appello, typically >= today (start of day).
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const isoDate = startOfToday.toISOString();

    const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
            id,
            session_date,
            status,
            notified_at,
            enrollments!inner (
                course_id,
                profiles (
                   id,
                   full_name
                )
            )
        `)
        .eq('enrollments.course_id', courseId)
        .gte('session_date', isoDate)
        .order('session_date', { ascending: true });

    els.attendanceLoading.classList.add('hidden');

    if (error) {
        console.error("Errore query presenze:", error);
        els.sessionsContainer.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-lg">Errore durante il caricamento delle sessioni: ${error.message}</div>`;
        els.sessionsContainer.classList.remove('hidden');
        return;
    }

    if (!attendanceData || attendanceData.length === 0) {
        els.sessionsContainer.innerHTML = `
            <div class="text-center py-12 flex flex-col items-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <span class="material-icons text-gray-300 text-5xl mb-2">event_busy</span>
                <p class="text-gray-500 font-medium">Nessuna sessione futura o odierna trovata per questo corso.</p>
                <p class="text-sm text-gray-400 mt-1">Potrebbe non esserci nessun iscritto, oppure il corso è terminato.</p>
            </div>`;
        els.sessionsContainer.classList.remove('hidden');
        return;
    }

    renderSessionsGrouped(attendanceData);
}

function processAttendanceData(data) {
    // Group records by exact session_date
    const grouped = {};

    data.forEach(item => {
        const dateKey = item.session_date;
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }

        // Extract inner join data correctly depending on one-to-one returned obj vs array.
        // enrollments -> profiles is Many-to-One so profiles is an object.
        let athlete = { full_name: 'Atleta Sconosciuto' };
        if (item.enrollments) {
            if (item.enrollments.profiles) {
                athlete = item.enrollments.profiles;
            } else if (Array.isArray(item.enrollments) && item.enrollments[0] && item.enrollments[0].profiles) {
                athlete = item.enrollments[0].profiles;
            }
        }

        grouped[dateKey].push({
            attendance_id: item.id,
            status: item.status,
            notified_at: item.notified_at,
            session_date: item.session_date, // passed down just in case
            athlete: athlete
        });
    });

    // Convert object to sorted array of objects
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

    return sortedDates.map(date => ({
        dateISO: date,
        records: grouped[date]
    }));
}

function renderSessionsGrouped(rawAttendanceData) {
    els.sessionsContainer.innerHTML = '';

    const sessionsGroups = processAttendanceData(rawAttendanceData);

    sessionsGroups.forEach((group, index) => {
        const formatted = formatSessionDate(group.dateISO);
        const sessionDateObj = new Date(group.dateISO);

        // Determine if logic is "past", "today" or "future"
        const now = new Date();
        const isPast = sessionDateObj < now && sessionDateObj.toDateString() !== now.toDateString();
        const isToday = sessionDateObj.toDateString() === now.toDateString();

        let badgeHtml = '';
        if (isToday) badgeHtml = `<span class="ml-3 px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs font-bold rounded-md tracking-wide">OGGI</span>`;
        if (isPast) badgeHtml = `<span class="ml-3 px-2.5 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs font-bold rounded-md tracking-wide">PASSATA</span>`;

        const sessionWrapper = document.createElement('div');
        sessionWrapper.className = `bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border ${isToday ? 'border-green-200 dark:border-green-900/50' : 'border-gray-200 dark:border-gray-700'}`;

        // Session Header
        let htmlHeader = `
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center ${isToday ? 'bg-green-50/50 dark:bg-green-900/10' : ''}">
                <div class="flex items-center">
                    <span class="material-icons text-gray-400 mr-2">event_note</span>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white capitalize">${formatted.dateStr} <span class="font-normal text-gray-500 ml-1">ore ${formatted.timeStr}</span></h3>
                    ${badgeHtml}
                </div>
            </div>
        `;

        // Athletes List (Table-like rows)
        let htmlRows = `<ul class="divide-y divide-gray-100 dark:divide-gray-800">`;

        // Sort athletes by name
        group.records.sort((a, b) => a.athlete.full_name.localeCompare(b.athlete.full_name));

        group.records.forEach(rec => {
            const isAssente = rec.status === 'assente';
            const isPresente = rec.status === 'presente';
            const isDaDefinire = rec.status === 'da_definire';

            // Logica per etichettare l'assenza "Giustificata" (cioè notificata >24h prima)
            let giustificataBadge = '';
            let btnDisabed = false; // We disable toggling if user manually marked 'assente' beforehand? Requirements say: 
            // "Se l'atleta si era già segnato 'assente' tramite la regola delle 24h, mostra l'etichetta 'Assenza Giustificata' e disabilita la modifica per quell'utente."
            if (isAssente && rec.notified_at) {
                const notifiedDate = new Date(rec.notified_at);
                const sessionDate = new Date(rec.session_date);
                const diffMs = sessionDate.getTime() - notifiedDate.getTime();
                if (diffMs >= 24 * 60 * 60 * 1000) {
                    giustificataBadge = `<span class="text-[11px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-sm ml-2 font-bold uppercase tracking-wider">Giustificato (24h)</span>`;
                    btnDisabed = true;
                }
            }

            htmlRows += `
                <li class="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                            ${rec.athlete.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-gray-100 leading-none">${rec.athlete.full_name}</p>
                            <div class="mt-1 flex items-center">
                                ${giustificataBadge}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <!-- Bottoni Toggle Stato -->
                        <div class="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner border border-gray-200/50 dark:border-gray-700/50 ${btnDisabed ? 'opacity-50 cursor-not-allowed' : ''}">
                            
                            <button 
                                class="status-btn w-12 h-9 rounded-lg flex items-center justify-center transition-all ${isPresente ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:text-green-600 hover:bg-green-100'}"
                                data-id="${rec.attendance_id}" 
                                data-status="presente"
                                ${btnDisabed ? 'disabled' : ''}
                                title="Segna Presente">
                                <span class="material-icons text-lg">done</span>
                            </button>
                            
                            <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 my-auto mx-1"></div>
                            
                            <button 
                                class="status-btn w-12 h-9 rounded-lg flex items-center justify-center transition-all ${isAssente ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:text-red-600 hover:bg-red-100'}"
                                data-id="${rec.attendance_id}" 
                                data-status="assente"
                                ${btnDisabed ? 'disabled' : ''}
                                title="Segna Assente">
                                <span class="material-icons text-lg">close</span>
                            </button>
                            
                        </div>
                        
                        <!-- Status indicator (dot) -->
                        <div class="w-3 h-3 rounded-full ml-2 flex-shrink-0 
                            ${isPresente ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : ''}
                            ${isAssente ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}
                            ${isDaDefinire ? 'bg-gray-300 dark:bg-gray-600 animate-pulse' : ''}">
                        </div>
                        
                    </div>
                </li>
            `;
        });

        htmlRows += `</ul>`;

        sessionWrapper.innerHTML = htmlHeader + htmlRows;
        els.sessionsContainer.appendChild(sessionWrapper);
    });

    els.sessionsContainer.classList.remove('hidden');

    // Attach Event Listeners
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', handleStatusToggle);
    });
}

async function handleStatusToggle(e) {
    const btn = e.currentTarget;
    if (btn.disabled) return;

    const attendanceId = btn.getAttribute('data-id');
    const newStatus = btn.getAttribute('data-status'); // 'presente' or 'assente'

    // Optimistic UI update could be done here, but let's show a loading state on the button group
    const parentContainer = btn.parentElement;
    parentContainer.style.opacity = '0.5';
    parentContainer.style.pointerEvents = 'none';

    try {
        const { error } = await supabase
            .from('attendance')
            .update({ status: newStatus })
            .eq('id', attendanceId);

        if (error) {
            console.error("Errore aggiornamento attendance:", error);
            alert("Non è stato possibile aggiornare la presenza: " + error.message);
        } else {
            // Optimistic UI Update
            const li = parentContainer.closest('li');
            
            // 1. Reset all buttons in this container to neutral state
            const allBtns = parentContainer.querySelectorAll('.status-btn');
            allBtns.forEach(b => {
                const btnStatus = b.getAttribute('data-status');
                if (btnStatus === 'presente') {
                    b.className = `status-btn w-12 h-9 rounded-lg flex items-center justify-center transition-all text-gray-500 hover:text-green-600 hover:bg-green-100`;
                } else if (btnStatus === 'assente') {
                    b.className = `status-btn w-12 h-9 rounded-lg flex items-center justify-center transition-all text-gray-500 hover:text-red-600 hover:bg-red-100`;
                }
            });

            // 2. Add 'active' classes to clicked button
            if (newStatus === 'presente') {
                btn.className = `status-btn w-12 h-9 rounded-lg flex items-center justify-center transition-all bg-green-500 text-white shadow-md`;
            } else if (newStatus === 'assente') {
                btn.className = `status-btn w-12 h-9 rounded-lg flex items-center justify-center transition-all bg-red-500 text-white shadow-md`;
            }

            // 3. Update the status dot
            // Il dot è l'elemento adiacente al parentContainer se guardiamo la struttura HTML
            const dot = parentContainer.nextElementSibling;
            if (dot) {
                // Rimuoviamo tutte le possibili classi di colore/ombra associate agli stati
                dot.classList.remove(
                    'bg-green-500', 
                    'shadow-[0_0_8px_rgba(34,197,94,0.5)]',
                    'bg-red-500', 
                    'shadow-[0_0_8px_rgba(239,68,68,0.5)]',
                    'bg-gray-300', 
                    'dark:bg-gray-600', 
                    'animate-pulse'
                );

                // Aggiungiamo le nuove classi base al newStatus
                if (newStatus === 'presente') {
                    dot.classList.add('bg-green-500', 'shadow-[0_0_8px_rgba(34,197,94,0.5)]');
                } else if (newStatus === 'assente') {
                    dot.classList.add('bg-red-500', 'shadow-[0_0_8px_rgba(239,68,68,0.5)]');
                }
            }
        }
    } catch (err) {
        console.error("Errore imprevisto:", err);
    } finally {
        parentContainer.style.opacity = '1';
        parentContainer.style.pointerEvents = 'auto';
    }
}


// Start Sequence
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoachDashboard);
} else {
    initCoachDashboard();
}
