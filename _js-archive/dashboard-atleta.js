import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurazione Supabase 
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// UI Elements
const els = {
    firstName: document.getElementById('athlete-firstname'),
    tokenCount: document.getElementById('token-count'),
    profileForm: document.getElementById('profile-form'),
    fullNameInput: document.getElementById('full_name'),
    profileAlert: document.getElementById('profile-alert'),
    saveProfileBtn: document.getElementById('save-profile-btn'),

    coursesLoading: document.getElementById('courses-loading'),
    coursesEmpty: document.getElementById('courses-empty'),
    coursesList: document.getElementById('courses-list'),

    trainingsLoading: document.getElementById('trainings-loading'),
    trainingsEmpty: document.getElementById('trainings-empty'),
    trainingsList: document.getElementById('trainings-list'),

    // Recovery Modal
    btnSpendToken: document.getElementById('btn-spend-token'),
    recoveryModal: document.getElementById('recovery-modal'),
    recoveryModalBackdrop: document.getElementById('recovery-modal-backdrop'),
    recoveryCourseSelect: document.getElementById('recovery-course-select'),
    recoveryDateSelect: document.getElementById('recovery-date-select'),
    recoveryAlert: document.getElementById('recovery-alert'),
    btnCancelRecovery: document.getElementById('btn-cancel-recovery'),
    btnConfirmRecovery: document.getElementById('btn-confirm-recovery'),

    // Custom Modals
    customAlertModal: document.getElementById('custom-alert-modal'),
    customAlertPanel: document.getElementById('custom-alert-panel'),
    alertIconContainer: document.getElementById('alert-icon-container'),
    alertIcon: document.getElementById('alert-icon'),
    alertTitle: document.getElementById('alert-title'),
    alertMessage: document.getElementById('alert-message'),
    btnAlertOk: document.getElementById('btn-alert-ok'),

    customConfirmModal: document.getElementById('custom-confirm-modal'),
    customConfirmPanel: document.getElementById('custom-confirm-panel'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
    btnConfirmOk: document.getElementById('btn-confirm-ok')
};

let currentUser = null;

/* -------------------------------------------
 * CUSTOM MODALS HELPERS
 * ------------------------------------------- */
function showCustomAlert(title, message, isSuccess = true) {
    els.alertTitle.textContent = title;
    els.alertMessage.textContent = message;

    if (isSuccess) {
        els.alertIconContainer.className = 'w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 flex-shrink-0';
        els.alertIcon.textContent = 'check_circle';
        els.btnAlertOk.className = 'w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 text-sm';
    } else {
        els.alertIconContainer.className = 'w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 mb-4 flex-shrink-0';
        els.alertIcon.textContent = 'error';
        els.btnAlertOk.className = 'w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md shadow-red-600/20 text-sm';
    }

    els.customAlertModal.classList.remove('hidden');
    els.customAlertModal.classList.add('flex');
    setTimeout(() => {
        els.customAlertModal.classList.remove('opacity-0');
        els.customAlertPanel.classList.remove('scale-95');
        els.customAlertPanel.classList.add('scale-100');
    }, 10);

    const closeModal = () => {
        els.customAlertModal.classList.add('opacity-0');
        els.customAlertPanel.classList.add('scale-95');
        els.customAlertPanel.classList.remove('scale-100');
        setTimeout(() => {
            els.customAlertModal.classList.add('hidden');
            els.customAlertModal.classList.remove('flex');
        }, 300);
        els.btnAlertOk.removeEventListener('click', closeModal);
    };
    els.btnAlertOk.addEventListener('click', closeModal);
}

function showCustomConfirm(title, message) {
    return new Promise((resolve) => {
        els.confirmTitle.textContent = title;
        els.confirmMessage.textContent = message;

        els.customConfirmModal.classList.remove('hidden');
        els.customConfirmModal.classList.add('flex');
        setTimeout(() => {
            els.customConfirmModal.classList.remove('opacity-0');
            els.customConfirmPanel.classList.remove('scale-95');
            els.customConfirmPanel.classList.add('scale-100');
        }, 10);

        const closeModal = (result) => {
            els.customConfirmModal.classList.add('opacity-0');
            els.customConfirmPanel.classList.add('scale-95');
            els.customConfirmPanel.classList.remove('scale-100');
            setTimeout(() => {
                els.customConfirmModal.classList.add('hidden');
                els.customConfirmModal.classList.remove('flex');
                resolve(result);
            }, 300);

            els.btnConfirmCancel.removeEventListener('click', handleCancel);
            els.btnConfirmOk.removeEventListener('click', handleOk);
        };

        const handleCancel = () => closeModal(false);
        const handleOk = () => closeModal(true);

        els.btnConfirmCancel.addEventListener('click', handleCancel);
        els.btnConfirmOk.addEventListener('click', handleOk);
    });
}

// Initialize Dashboard
async function initDashboard() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError || new Error("User not authenticated");

        currentUser = user;

        // Fetch data concurrently
        await Promise.all([
            loadProfile(),
            loadCourses(),
            loadTrainings()
        ]);

    } catch (err) {
        console.error("Errore inizializzazione dashboard:", err);
    }
}

// FORMAT DATE UTILS
function formatSessionDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('it-IT', options).replace(/^\w/, (c) => c.toUpperCase());
}

/* -------------------------------------------
 * PROFILE & TOKENS SECTION 
 * ------------------------------------------- */
async function loadProfile() {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, recovery_tokens')
        .eq('id', currentUser.id)
        .single();

    if (error) {
        console.error("Errore caricamento profilo:", error);
        return;
    }

    // Update Tokens
    els.tokenCount.textContent = profile.recovery_tokens || 0;

    // Update Form and Greeting
    els.fullNameInput.value = profile.full_name || '';
    if (profile.full_name) {
        els.firstName.textContent = profile.full_name.split(' ')[0];
    }
}

els.profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalBtnHtml = els.saveProfileBtn.innerHTML;
    els.saveProfileBtn.innerHTML = '<span class="material-icons animate-spin">autorenew</span> Salvataggio...';
    els.saveProfileBtn.disabled = true;

    const newFullName = els.fullNameInput.value.trim();

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: newFullName })
        .eq('id', currentUser.id);

    els.saveProfileBtn.disabled = false;
    els.saveProfileBtn.innerHTML = originalBtnHtml;

    const alertEl = els.profileAlert;
    alertEl.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');

    if (error) {
        console.error("Errore aggiornamento profilo:", error);
        alertEl.classList.add('bg-red-100', 'text-red-800');
        alertEl.textContent = 'Si è verificato un errore durante il salvataggio.';
    } else {
        alertEl.classList.add('bg-green-100', 'text-green-800');
        alertEl.textContent = 'Profilo aggiornato con successo!';

        // Update greeting
        els.firstName.textContent = newFullName.split(' ')[0];
    }

    setTimeout(() => {
        alertEl.classList.add('hidden');
    }, 4000);
});

/* -------------------------------------------
 * COURSES SECTION
 * ------------------------------------------- */
async function loadCourses() {
    els.coursesLoading.classList.remove('hidden');
    els.coursesList.classList.add('hidden');
    els.coursesEmpty.classList.add('hidden');

    const athleteId = currentUser.id;

    const { data: myCourses, error } = await supabase
        .from('courses')
        .select('*, enrollments!inner(id), profiles(full_name)')
        .eq('enrollments.athlete_id', athleteId)
        .eq('enrollments.status', 'active');

    els.coursesLoading.classList.add('hidden');

    if (error) {
        console.error('Errore caricamento corsi:', error);
        els.coursesEmpty.innerHTML = `<p class="text-red-500 font-medium bg-red-50 p-4 rounded-xl">Impossibile caricare i corsi al momento. Dettagli: ${error.message}</p>`;
        els.coursesEmpty.classList.remove('hidden');
        return;
    }

    if (!myCourses || myCourses.length === 0) {
        els.coursesEmpty.classList.remove('hidden');
        return;
    }

    renderCourses(myCourses);
}

function renderCourses(courses) {
    els.coursesList.innerHTML = '';

    courses.forEach(course => {
        const coachName = course.profiles?.full_name || 'Allenatore non assegnato';
        const startDate = new Date(course.start_time);
        const dayName = new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(startDate);
        const startTime = startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const endDate = new Date(startDate.getTime() + (course.duration_minutes || 60) * 60 * 1000);
        const endTime = endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        const card = document.createElement('div');
        card.className = 'p-5 rounded-2xl border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all group';
        card.innerHTML = `
            <div class="flex items-center gap-3 mb-3">
                <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <span class="material-icons">school</span>
                </span>
                <div>
                    <h3 class="font-bold text-gray-900 dark:text-white leading-tight">${course.name || 'Corso'}</h3>
                    <p class="text-xs text-primary font-semibold uppercase tracking-wide">${course.level || ''}</p>
                </div>
            </div>
            <div class="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                <p class="flex items-center gap-2">
                    <span class="material-icons text-[16px] text-primary/60">event_repeat</span>
                    Ogni ${capitalizedDay}, dalle ${startTime} alle ${endTime}
                </p>
                <p class="flex items-center gap-2">
                    <span class="material-icons text-[16px] text-primary/60">person</span>
                    ${coachName}
                </p>
            </div>
        `;
        els.coursesList.appendChild(card);
    });

    els.coursesList.classList.remove('hidden');
}

/* -------------------------------------------
 * TRAININGS & ABSENCE SECTION 
 * ------------------------------------------- */
async function loadTrainings() {
    els.trainingsLoading.classList.remove('hidden');
    els.trainingsList.classList.add('hidden');
    els.trainingsEmpty.classList.add('hidden');

    const nowISO = new Date().toISOString();

    const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
            id,
            session_date,
            status,
            enrollments!inner (
                athlete_id,
                courses (
                    name,
                    description
                )
            )
        `)
        .eq('enrollments.athlete_id', currentUser.id)
        .gte('session_date', nowISO)
        .order('session_date', { ascending: true });

    els.trainingsLoading.classList.add('hidden');

    if (error) {
        console.error("Errore caricamento allenamenti:", error);
        els.trainingsEmpty.innerHTML = `<p class="text-red-500 font-medium bg-red-50 p-4 rounded-xl">Impossibile caricare gli allenamenti al momento. Dettagli: ${error.message}</p>`;
        els.trainingsEmpty.classList.remove('hidden');
        return;
    }

    if (!attendanceData || attendanceData.length === 0) {
        els.trainingsEmpty.classList.remove('hidden');
        return;
    }

    renderTrainings(attendanceData);
}

function renderTrainings(trainings) {
    els.trainingsList.innerHTML = '';

    trainings.forEach(item => {
        // Handle join structure carefully depending on one-to-one mapping returning obj vs array
        let course = { name: 'Corso Sconosciuto' };
        if (item.enrollments) {
            // Supabase inner join returns single object or array depending on relation setup, usually array or object if one-to-many. 
            // In attendance -> enrollments, it's Many-to-One so `item.enrollments` is an object.
            // In enrollments -> courses, it's Many-to-One so `item.enrollments.courses` is an object.
            if (item.enrollments.courses) {
                course = item.enrollments.courses;
            } else if (Array.isArray(item.enrollments) && item.enrollments[0] && item.enrollments[0].courses) {
                // Safeguard just in case
                course = item.enrollments[0].courses;
            }
        }

        const isAssente = item.status === 'assente';
        const sessionDateObj = new Date(item.session_date);

        const msIn24h = 24 * 60 * 60 * 1000;
        const timeDiff = sessionDateObj.getTime() - new Date().getTime();
        const qualifiesForToken = timeDiff >= msIn24h;

        const li = document.createElement('li');
        li.className = `p-5 rounded-2xl border ${isAssente ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100/50 dark:border-red-900/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-lg shadow-sm hover:border-primary/20'} transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 group`;

        li.innerHTML = `
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl ${isAssente ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'} group-hover:scale-110 transition-transform">
                        <span class="material-icons">${isAssente ? 'event_busy' : 'sports_volleyball'}</span>
                    </span>
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg leading-none ${isAssente ? 'line-through decoration-red-400 opacity-60' : ''}">${course.name}</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-1 font-medium">
                            <span class="material-icons text-[14px]">schedule</span>
                            ${formatSessionDate(item.session_date)}
                        </p>
                    </div>
                </div>
                <div class="ml-14 mt-1">
                    ${(qualifiesForToken && !isAssente) ? `<p class="flex items-center gap-1 text-[13px] text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded inline-flex"><span class="material-icons text-[14px]">generating_tokens</span> Assenza idonea (+1 token)</p>` : ''}
                    ${(!qualifiesForToken && !isAssente) ? `<p class="flex items-center gap-1 text-[13px] text-amber-600 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded inline-flex"><span class="material-icons text-[14px]">warning</span> Entro 24h: niente token rimborso</p>` : ''}
                    ${isAssente ? `<p class="flex items-center gap-1 text-[13px] text-red-500 font-bold bg-white/50 px-2 py-0.5 rounded inline-flex"><span class="material-icons text-[14px]">how_to_reg</span> Assenza Registrata</p>` : ''}
                </div>
            </div>
            
            <div class="sm:text-right shrink-0 mt-2 sm:mt-0 pl-14 sm:pl-0">
                ${isAssente
                ? `<span class="bg-red-100 text-red-800 text-sm font-bold px-4 py-2 rounded-xl dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">Assente</span>`
                : `<button data-id="${item.id}" data-date="${item.session_date}" class="action-absent-btn px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 focus:ring-4 focus:ring-red-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:border-red-900/50 dark:hover:text-red-400 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                          <span class="material-icons text-[18px]">block</span> Segnala Assenza
                       </button>`
            }
            </div>
        `;

        els.trainingsList.appendChild(li);
    });

    els.trainingsList.classList.remove('hidden');

    document.querySelectorAll('.action-absent-btn').forEach(btn => {
        btn.addEventListener('click', handleAbsenceClick);
    });
}

async function handleAbsenceClick(e) {
    const btn = e.currentTarget;
    const attendanceId = btn.getAttribute('data-id');
    const sessionDateStr = btn.getAttribute('data-date');

    const isConfirmed = await showCustomConfirm("Attenzione", "Sei sicuro di voler segnalare l'assenza per questo allenamento? Non potrai annullare l'operazione.");
    if (!isConfirmed) {
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons animate-spin text-[18px]">autorenew</span> Attendere...';
    btn.disabled = true;

    // --- RECOVERY TOKEN LOGIC ---
    const msIn24h = 24 * 60 * 60 * 1000;
    const timeDiff = new Date(sessionDateStr).getTime() - new Date().getTime();
    const earnedToken = timeDiff >= msIn24h;

    if (earnedToken) {
        const { data: profileData, error: fetchErr } = await supabase
            .from('profiles')
            .select('recovery_tokens')
            .eq('id', currentUser.id)
            .single();

        if (!fetchErr && profileData) {
            const currentTokens = profileData.recovery_tokens || 0;
            await supabase
                .from('profiles')
                .update({ recovery_tokens: currentTokens + 1 })
                .eq('id', currentUser.id);
        }
    }
    // ----------------------------

    const nowISO = new Date().toISOString();

    const { error } = await supabase
        .from('attendance')
        .update({ status: 'assente', notified_at: nowISO })
        .eq('id', attendanceId);

    if (error) {
        console.error("Errore registrazione assenza:", error);
        showCustomAlert("Errore", "Errore durante la segnalazione dell'assenza. Riprova più tardi.", false);
        btn.innerHTML = originalText;
        btn.disabled = false;
    } else {
        showCustomAlert("Successo", earnedToken
            ? 'Assenza segnalata! Hai guadagnato 1 Recovery Token.'
            : 'Assenza segnalata con successo!'
        );
        await Promise.all([
            loadProfile(),
            loadTrainings()
        ]);
    }
}

// Ensure execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}


/* -------------------------------------------
 * RECOVERY TOKEN MODAL
 * ------------------------------------------- */

function openRecoveryModal() {
    els.recoveryModal.classList.remove('hidden');
    els.recoveryModal.classList.add('flex');
}

function closeRecoveryModal() {
    els.recoveryModal.classList.add('hidden');
    els.recoveryModal.classList.remove('flex');
    els.recoveryCourseSelect.innerHTML = '<option value="">Caricamento corsi...</option>';
    els.recoveryCourseSelect.disabled = true;
    els.recoveryDateSelect.innerHTML = '<option value="">Seleziona prima un corso</option>';
    els.recoveryDateSelect.disabled = true;
    els.recoveryAlert.classList.add('hidden');
    els.recoveryAlert.textContent = '';
    els.btnConfirmRecovery.disabled = false;
    els.btnConfirmRecovery.innerHTML = '<span class="material-icons text-[18px]">check_circle</span> Conferma Recupero';
}

function showRecoveryAlert(message, isError = true) {
    els.recoveryAlert.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');
    els.recoveryAlert.classList.add(
        isError ? 'bg-red-100' : 'bg-green-100',
        isError ? 'text-red-800' : 'text-green-800'
    );
    els.recoveryAlert.textContent = message;
}

// Open modal: check token balance first
els.btnSpendToken.addEventListener('click', async () => {
    const currentTokens = parseInt(els.tokenCount.textContent, 10) || 0;
    if (currentTokens <= 0) {
        showCustomAlert("Token Esauriti", "Non hai Recovery Token disponibili. Segnala un'assenza con almeno 24h di anticipo per guadagnarne uno!", false);
        return;
    }
    openRecoveryModal();
    await loadRecoveryCourses();
});

// Close on Annulla or backdrop click
els.btnCancelRecovery.addEventListener('click', closeRecoveryModal);
els.recoveryModalBackdrop.addEventListener('click', closeRecoveryModal);

// Load all courses into the course select
// Load all courses into the course select (CON FILTRI)
// Costante di gerarchia (puoi metterla fuori dalla funzione o qui dentro)
const LEVEL_HIERARCHY = ['Base 1', 'Base 2', 'Base 3', 'Intermedio 1', 'Intermedio 2', 'Avanzato'];

// Load all courses into the course select (CON FILTRI GENERE + LIVELLO)
async function loadRecoveryCourses() {
    els.recoveryCourseSelect.innerHTML = '<option value="" disabled selected>Caricamento corsi...</option>';
    els.recoveryCourseSelect.disabled = true;

    // 1. Recuperiamo il genere e livello dell'atleta
    const { data: profile } = await supabase
        .from('profiles')
        .select('gender, level')
        .eq('id', currentUser.id)
        .single();

    // 2. Costruiamo la query di base
    let query = supabase
        .from('courses')
        .select('id, name, start_time, target_gender, level')
        .order('name', { ascending: true });

    // 3. Applichiamo la Business Logic (Filtri incrociati)
    if (profile) {

        // A. Filtro Genere
        if (profile.gender) {
            query = query.in('target_gender', [profile.gender, 'Mix']);
        }

        // B. Filtro Livello
        if (profile.level) {
            const userLevelIndex = LEVEL_HIERARCHY.indexOf(profile.level);

            // Se troviamo il livello nell'array, estraiamo i livelli consentiti
            if (userLevelIndex !== -1) {
                // Prende da indice 0 fino all'indice dell'utente (compreso)
                const allowedLevels = LEVEL_HIERARCHY.slice(0, userLevelIndex + 1);
                query = query.in('level', allowedLevels);
            }
        }
    }

    const { data: courses, error } = await query;

    if (error || !courses || courses.length === 0) {
        els.recoveryCourseSelect.innerHTML = '<option value="">Nessun corso compatibile disponibile</option>';
        return;
    }

    els.recoveryCourseSelect.innerHTML = '<option value="" disabled selected>-- Scegli un corso --</option>';

    courses.forEach(course => {
        const opt = document.createElement('option');
        opt.value = course.id;
        opt.textContent = `${course.name} (${course.level || 'Tutti i livelli'})`;
        opt.dataset.start = course.start_time || '';
        els.recoveryCourseSelect.appendChild(opt);
    });

    els.recoveryCourseSelect.disabled = false;
}

// Compute the next 4 dates matching the course's weekday
function getNext4Dates(startTimeISO) {
    const base = new Date(startTimeISO);
    const targetDay = base.getDay();
    const hours = base.getHours();
    const minutes = base.getMinutes();

    const dates = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (dates.length < 4) {
        cursor.setDate(cursor.getDate() + 1); // always start from tomorrow
        if (cursor.getDay() === targetDay) {
            const session = new Date(cursor);
            session.setHours(hours, minutes, 0, 0);
            dates.push(new Date(session));
        }
    }
    return dates;
}

// Populate date select when a course is chosen
els.recoveryCourseSelect.addEventListener('change', () => {
    const selectedOpt = els.recoveryCourseSelect.options[els.recoveryCourseSelect.selectedIndex];
    const startISO = selectedOpt.dataset.start;

    els.recoveryAlert.classList.add('hidden');
    els.recoveryDateSelect.disabled = true;

    if (!startISO) {
        els.recoveryDateSelect.innerHTML = '<option value="">Orario non disponibile per questo corso</option>';
        return;
    }

    const dates = getNext4Dates(startISO);
    els.recoveryDateSelect.innerHTML = '<option value="" disabled selected>-- Scegli una data --</option>';
    dates.forEach(date => {
        const opt = document.createElement('option');
        opt.value = date.toISOString();
        const label = date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
        const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        opt.textContent = label.charAt(0).toUpperCase() + label.slice(1) + ' - ' + time;
        els.recoveryDateSelect.appendChild(opt);
    });
    els.recoveryDateSelect.disabled = false;
});

// Confirm: decrement token, create ghost enrollment, insert attendance
els.btnConfirmRecovery.addEventListener('click', async () => {
    const courseId = els.recoveryCourseSelect.value;
    const sessionDateISO = els.recoveryDateSelect.value;

    if (!courseId) { showRecoveryAlert('Seleziona un corso.'); return; }
    if (!sessionDateISO) { showRecoveryAlert('Seleziona una data di recupero.'); return; }

    const originalBtnHtml = els.btnConfirmRecovery.innerHTML;
    els.btnConfirmRecovery.disabled = true;
    els.btnConfirmRecovery.innerHTML = '<span class="material-icons animate-spin text-[18px]">autorenew</span>';

    const resetBtn = () => {
        els.btnConfirmRecovery.disabled = false;
        els.btnConfirmRecovery.innerHTML = originalBtnHtml;
    };

    // Step 1: decrement token
    const currentTokens = parseInt(els.tokenCount.textContent, 10) || 1;
    const { error: tokenError } = await supabase
        .from('profiles')
        .update({ recovery_tokens: currentTokens - 1 })
        .eq('id', currentUser.id);

    if (tokenError) {
        showRecoveryAlert('Errore durante il decremento del token: ' + tokenError.message);
        resetBtn();
        return;
    }

    // Step 2: ghost enrollment with status 'recovery'
    const { data: newEnrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert([{ course_id: courseId, athlete_id: currentUser.id, status: 'recovery' }])
        .select('id')
        .single();

    if (enrollError || !newEnrollment) {
        showRecoveryAlert("Errore durante la creazione dell'iscrizione: " + (enrollError?.message || 'sconosciuto'));
        resetBtn();
        return;
    }

    // Step 3: single attendance record for the chosen date
    const { error: attError } = await supabase
        .from('attendance')
        .insert([{ enrollment_id: newEnrollment.id, session_date: sessionDateISO, status: 'da_definire' }]);

    if (attError) {
        showRecoveryAlert('Errore durante la creazione della presenza: ' + attError.message);
        resetBtn();
        return;
    }

    // All good!
    closeRecoveryModal();
    showCustomAlert('Recupero Prenotato', 'Recupero prenotato con successo! La sessione apparirà nel tuo calendario.');
    await Promise.all([loadProfile(), loadTrainings()]);
});
