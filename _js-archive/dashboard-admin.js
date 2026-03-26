import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurazione Supabase
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg0MjAsImV4cCI6MjA4ODEyNDQyMH0.g4GWIipczNkacTHbb3QMEqQYWi020VwZQ4xo1UaxLNw';
const supabase = createClient(supabaseUrl, supabaseKey);

// UI Elements
const els = {
    mainContent: document.getElementById('main-content'),
    errorContent: document.getElementById('error-content'),
    adminFirstname: document.getElementById('admin-firstname'),

    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Users Tab
    usersTableBody: document.getElementById('users-table-body'),
    userSearchInput: document.getElementById('user-search'),

    // Courses Tab
    createCourseForm: document.getElementById('create-course-form'),
    courseNameInput: document.getElementById('course-name'),
    courseDescInput: document.getElementById('course-desc'),
    courseCoachSelect: document.getElementById('course-coach'),
    coursesListContainer: document.getElementById('courses-list-container'),
    createCourseBtn: document.getElementById('create-course-btn'),

    // Enrollments Tab
    enrollmentForm: document.getElementById('enrollment-form'),
    enrollAthleteSelect: document.getElementById('enroll-athlete'),
    enrollCourseSelect: document.getElementById('enroll-course'),
    enrollBtn: document.getElementById('enroll-btn'),
    enrollAlert: document.getElementById('enroll-alert'),

    // Manage Enrollments Tab
    manageCourseSelect: document.getElementById('manage-course-select'),
    courseEnrollmentsList: document.getElementById('course-enrollments-list')
};

let currentUser = null;
let allUsers = [];
let allCourses = [];
let allCoaches = [];
let allAthletes = [];

// Initialize
async function initAdminDashboard() {
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

        if (profileError || profile.role !== 'presidente') {
            console.warn("L'utente non è un presidente.");
            els.errorContent.style.display = 'flex';
            return;
        }

        els.mainContent.style.display = 'block';
        if (profile.full_name) {
            els.adminFirstname.textContent = profile.full_name.split(' ')[0];
        }

        // Setup Tabs
        setupTabs();

        // Initial Data Load (Triggering concurrent fetches)
        loadAllData();

    } catch (err) {
        console.error("Errore inizializzazione admin dashboard:", err);
    }
}

function setupTabs() {
    els.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            els.tabBtns.forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white', 'shadow-md', 'shadow-primary/20');
                b.classList.add('text-gray-600', 'dark:text-gray-400');
            });
            els.tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active', 'bg-primary', 'text-white', 'shadow-md', 'shadow-primary/20');
            btn.classList.remove('text-gray-600', 'dark:text-gray-400');

            // Show corresponding content
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// FORMAT DATE UTILS
function formatShortDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' });
}


/* -------------------------------------------
 * DATA LOADING MASTER
 * ------------------------------------------- */
async function loadAllData() {
    await Promise.all([
        fetchUsers(),
        fetchCourses()
    ]);

    renderUsersTable(allUsers);
    renderCoursesList();
    populateSelects();
}

/* -------------------------------------------
 * TAB 1: USERS (PROFILES)
 * ------------------------------------------- */
async function fetchUsers() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Errore fetch profiles:", error);
        return;
    }

    allUsers = profiles;
    allCoaches = profiles.filter(p => p.role === 'allenatore');
    allAthletes = profiles.filter(p => p.role === 'atleta');
}

function renderUsersTable(usersData) {
    els.usersTableBody.innerHTML = '';

    if (!usersData || usersData.length === 0) {
        els.usersTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">Nessun utente trovato.</td></tr>`;
        return;
    }

    usersData.forEach(user => {
        const isPres = user.role === 'presidente';

        let roleBadgeClass = '';
        if (user.role === 'presidente') roleBadgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        else if (user.role === 'allenatore') roleBadgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        else roleBadgeClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';

        const tr = document.createElement('tr');
        tr.className = "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors";

        tr.innerHTML = `
            <td class="p-4 pl-6">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-xs">
                        ${user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <p class="font-bold text-gray-900 dark:text-white leading-tight">${user.full_name || 'Senza Nome'}</p>
                        <p class="text-xs text-gray-400 mt-0.5" title="${user.id}">ID: ${user.id.substring(0, 8)}...</p>
                    </div>
                </div>
            </td>
            <td class="p-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${roleBadgeClass}">${user.role}</span>
            </td>
            <td class="p-4 text-center">
                <select data-id="${user.id}" class="role-select px-3 py-1.5 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${isPres ? 'opacity-50 cursor-not-allowed' : ''}" ${isPres ? 'disabled title="Non puoi degradare un presidente"' : ''}>
                    <option value="atleta" ${user.role === 'atleta' ? 'selected' : ''}>Atleta</option>
                    <option value="allenatore" ${user.role === 'allenatore' ? 'selected' : ''}>Allenatore</option>
                </select>
            </td>
            <td class="p-4 text-center text-sm text-gray-500">
                ${formatShortDate(user.created_at)}
            </td>
        `;

        els.usersTableBody.appendChild(tr);
    });

    // Attach change listeners
    document.querySelectorAll('.role-select').forEach(select => {
        select.addEventListener('change', handleRoleChange);
    });
}

async function handleRoleChange(e) {
    const select = e.target;
    const userId = select.getAttribute('data-id');
    const newRole = select.value;

    select.disabled = true;

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    select.disabled = false;

    if (error) {
        console.error("Errore update ruolo:", error);
        alert("Errore durante l'aggiornamento del ruolo.");
        // Revert UI theoretically, but reloadData is safer
        await loadAllData();
    } else {
        // Success
        await loadAllData(); // Refresh all lists since coaches list might have changed
    }
}

// User Search logic
els.userSearchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    if (!term) {
        renderUsersTable(allUsers);
        return;
    }
    const filtered = allUsers.filter(u => u.full_name && u.full_name.toLowerCase().includes(term));
    renderUsersTable(filtered);
});


/* -------------------------------------------
 * TAB 2: COURSES
 * ------------------------------------------- */
async function fetchCourses() {
    const { data: courses, error } = await supabase
        .from('courses')
        .select('*, profiles(full_name), enrollments(id)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Errore fetch courses:", error);
        return;
    }

    allCourses = courses;
}

function renderCoursesList() {
    els.coursesListContainer.innerHTML = '';

    if (allCourses.length === 0) {
        els.coursesListContainer.innerHTML = `<p class="text-gray-500 text-center py-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">Nessun corso creato.</p>`;
        return;
    }

    allCourses.forEach(course => {
        // Coach name
        let coachName = "Sconosciuto";
        if (course.profiles) {
            coachName = course.profiles.full_name || coachName;
        }

        // Schedule formatting
        let scheduleLabel = 'Orario N/D';
        if (course.start_time) {
            const dt = new Date(course.start_time);
            const dayName = new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(dt);
            const timeStr = dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            scheduleLabel = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${timeStr}`;
        }

        // Enrollments count
        const iscritti = course.enrollments ? course.enrollments.length : 0;
        const maxParticipants = course.max_participants || 8;
        const isFull = iscritti >= maxParticipants;
        const badgeClass = isFull
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : iscritti >= maxParticipants * 0.75
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

        const div = document.createElement('div');
        div.className = "p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:shadow-md transition-all flex justify-between items-center group cursor-pointer";
        div.setAttribute('data-course-id', course.id);

        div.innerHTML = `
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span class="material-icons">sports_volleyball</span>
                </div>
                <div class="min-w-0">
                    <h4 class="font-bold text-gray-900 dark:text-white leading-tight truncate">${course.name}</h4>
                    <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <span class="material-icons text-[12px]">person</span> ${coachName}
                    </p>
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                        <p class="text-xs text-gray-400 flex items-center gap-1">
                            <span class="material-icons text-[12px]">schedule</span> ${scheduleLabel}
                        </p>
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}">
                            <span class="material-icons text-[12px]">group</span> ${iscritti}/${maxParticipants} iscritti
                        </span>
                    </div>
                </div>
            </div>
            <div class="flex-shrink-0 ml-3">
                <button class="delete-course-btn w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" data-id="${course.id}" title="Elimina corso">
                    <span class="material-icons text-sm">delete</span>
                </button>
            </div>
        `;

        els.coursesListContainer.appendChild(div);
    });

    // Delete bindings (with stopPropagation to avoid triggering card click)
    document.querySelectorAll('.delete-course-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const courseId = e.currentTarget.getAttribute('data-id');
            if (confirm("Eliminare definitivamente questo corso? Tutte le iscrizioni e le presenze associate andranno perse.")) {
                await deleteCourse(courseId);
            }
        });
    });

    // Card click → navigate to Iscrizioni tab and pre-select the course
    document.querySelectorAll('[data-course-id]').forEach(card => {
        card.addEventListener('click', () => {
            const courseId = card.getAttribute('data-course-id');

            // 1. Switch to Iscrizioni tab
            document.querySelector('[data-target="tab-iscrizioni"]').click();

            // 2. Pre-select the course in the manage select
            const manageSelect = document.getElementById('manage-course-select');
            manageSelect.value = courseId;

            // 3. Trigger change event to load the enrollments list
            manageSelect.dispatchEvent(new Event('change'));
        });
    });
}

async function deleteCourse(courseId) {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (!error) {
        await loadAllData();
    } else {
        alert("Errore eliminazione: " + error.message);
    }
}

// Create Course Submit
els.createCourseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = els.courseNameInput.value.trim();
    const desc = els.courseDescInput.value.trim();
    const coachId = els.courseCoachSelect.value;

    if (!name || !coachId) return;

    const originalBtn = els.createCourseBtn.innerHTML;
    els.createCourseBtn.innerHTML = '<span class="material-icons animate-spin">autorenew</span> Creazione...';
    els.createCourseBtn.disabled = true;

    const { error } = await supabase
        .from('courses')
        .insert([{
            name: name,
            description: desc,
            coach_id: coachId
        }]);

    els.createCourseBtn.innerHTML = originalBtn;
    els.createCourseBtn.disabled = false;

    if (error) {
        alert("Errore creazione corso: " + error.message);
    } else {
        els.createCourseForm.reset();
        await loadAllData();
    }
});


/* -------------------------------------------
 * TAB 3: ENROLLMENTS
 * ------------------------------------------- */
function populateSelects() {
    // Populate Course Coach select (only roles = allenatore)
    els.courseCoachSelect.innerHTML = '<option value="" disabled selected>-- Seleziona Allenatore --</option>';
    allCoaches.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.full_name;
        els.courseCoachSelect.appendChild(opt);
    });

    // Populate Enroll Athletes
    els.enrollAthleteSelect.innerHTML = '<option value="" disabled selected>-- Scegli Atleta --</option>';
    allAthletes.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.full_name;
        els.enrollAthleteSelect.appendChild(opt);
    });

    // Populate Enroll Courses
    els.enrollCourseSelect.innerHTML = '<option value="" disabled selected>-- Scegli Corso --</option>';
    allCourses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        els.enrollCourseSelect.appendChild(opt);
    });

    // Populate Manage Course Select
    els.manageCourseSelect.innerHTML = '<option value="" disabled selected>-- Scegli un corso per vedere gli iscritti --</option>';
    allCourses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        els.manageCourseSelect.appendChild(opt);
    });
}

/* -------------------------------------------
 * MANAGE ENROLLMENTS PANEL
 * ------------------------------------------- */
els.manageCourseSelect.addEventListener('change', async () => {
    const courseId = els.manageCourseSelect.value;
    if (!courseId) return;

    els.courseEnrollmentsList.innerHTML = `
        <div class="flex items-center justify-center py-6 gap-2 text-gray-400">
            <span class="material-icons animate-spin text-primary">autorenew</span>
            <span class="text-sm">Caricamento iscritti...</span>
        </div>`;

    const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('id, status, profiles!inner(full_name, level)')
        .eq('course_id', courseId)
        .order('status', { ascending: true }); // active first

    if (error) {
        console.error('Errore fetch iscritti:', error);
        els.courseEnrollmentsList.innerHTML = `<p class="text-red-500 text-sm text-center py-4">Errore nel caricamento degli iscritti.</p>`;
        return;
    }

    renderEnrollmentsList(enrollments, courseId);
});

function renderEnrollmentsList(enrollments, courseId) {
    const container = els.courseEnrollmentsList;

    if (!enrollments || enrollments.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-sm text-center py-6">Nessun iscritto per questo corso.</p>`;
        return;
    }

    container.innerHTML = '';
    enrollments.forEach(enrollment => {
        const profile = enrollment.profiles;
        const isCancelled = enrollment.status === 'cancelled';

        const row = document.createElement('div');
        row.className = `flex items-center justify-between p-3 rounded-xl border transition-colors ${isCancelled
                ? 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 opacity-60'
                : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`;

        row.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full ${isCancelled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary/10'} flex items-center justify-center font-bold ${isCancelled ? 'text-gray-400' : 'text-primary'} text-xs">
                    ${profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                    <p class="font-semibold text-sm ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'} leading-tight">${profile.full_name || 'Senza Nome'}</p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                        <p class="text-xs text-gray-400">${profile.level || 'Livello N/D'}</p>
                        ${isCancelled ? '<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-semibold"><span class="material-icons text-[10px]">block</span> Ritirato</span>' : ''}
                    </div>
                </div>
            </div>
            ${!isCancelled ? `<button
                class="remove-enrollment-btn px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                data-enrollment-id="${enrollment.id}"
                data-name="${profile.full_name || 'questo atleta'}">
                <span class="material-icons text-[14px]">person_remove</span> Rimuovi
            </button>` : '<div></div>'}
        `;
        container.appendChild(row);
    });

    // Bind remove buttons — soft delete flow
    container.querySelectorAll('.remove-enrollment-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const enrollmentId = btn.getAttribute('data-enrollment-id');
            const name = btn.getAttribute('data-name');
            if (!confirm(`Ritirare ${name} da questo corso? Verranno eliminate solo le presenze future non ancora svolte.`)) return;

            btn.disabled = true;
            btn.innerHTML = '<span class="material-icons animate-spin text-[14px]">autorenew</span>';

            // Step 1: soft delete — mark enrollment as cancelled
            const { error: cancelError } = await supabase
                .from('enrollments')
                .update({ status: 'cancelled' })
                .eq('id', enrollmentId);

            if (cancelError) {
                console.error('Errore annullamento iscrizione:', cancelError);
                alert('Errore nell\'aggiornamento: ' + cancelError.message);
                btn.disabled = false;
                btn.innerHTML = '<span class="material-icons text-[14px]">person_remove</span> Rimuovi';
                return;
            }

            // Step 2: delete only future attendance records
            const { error: attError } = await supabase
                .from('attendance')
                .delete()
                .eq('enrollment_id', enrollmentId)
                .gt('session_date', new Date().toISOString());

            if (attError) {
                console.error('Errore eliminazione presenze future:', attError);
                // Non blocchiamo l'UI: l'iscrizione è già cancelled
            } else {
                console.log(`🗑️ Presenze future eliminate per enrollment_id: ${enrollmentId}`);
            }

            // Reload list preserving history
            const { data: updatedEnrollments } = await supabase
                .from('enrollments')
                .select('id, status, profiles!inner(full_name, level)')
                .eq('course_id', courseId)
                .order('status', { ascending: true });
            renderEnrollmentsList(updatedEnrollments || [], courseId);
        });
    });
}

// Enroll Submit
els.enrollmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const athleteId = els.enrollAthleteSelect.value;
    const courseId = els.enrollCourseSelect.value;

    if (!athleteId || !courseId) return;

    const originalBtn = els.enrollBtn.innerHTML;
    els.enrollBtn.innerHTML = '<span class="material-icons animate-spin">autorenew</span> Iscrizione...';
    els.enrollBtn.disabled = true;

    const { data: insertedEnrollment, error } = await supabase
        .from('enrollments')
        .insert([{
            course_id: courseId,
            athlete_id: athleteId
        }])
        .select('id')
        .single();

    els.enrollBtn.innerHTML = originalBtn;
    els.enrollBtn.disabled = false;

    const alertEl = els.enrollAlert;
    alertEl.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');

    if (error) {
        console.error("Errore iscrizione:", error);
        alertEl.classList.add('bg-red-100', 'text-red-800');
        // Unique violation handling (Supabase code 23505)
        if (error.code === '23505') {
            alertEl.textContent = "Questo atleta è già iscritto a questo corso.";
        } else {
            alertEl.textContent = "Errore durante l'iscrizione: " + error.message;
        }
    } else {
        // --- GENERAZIONE 16 PRESENZE ---
        const enrollmentId = insertedEnrollment.id;
        const selectedCourse = allCourses.find(c => c.id === courseId);

        if (selectedCourse && selectedCourse.start_time) {
            const attendanceRecords = [];
            const startDate = new Date(selectedCourse.start_time);

            for (let i = 0; i < 16; i++) {
                const sessionDate = new Date(startDate);
                sessionDate.setDate(startDate.getDate() + i * 7);
                attendanceRecords.push({
                    enrollment_id: enrollmentId,
                    session_date: sessionDate.toISOString(),
                    status: 'da_definire'
                });
            }

            const { error: attError } = await supabase
                .from('attendance')
                .insert(attendanceRecords);

            if (attError) {
                console.error('Errore generazione presenze:', attError);
            } else {
                console.log(`✅ 16 presenze generate per enrollment_id: ${enrollmentId}`);
            }
        } else {
            console.warn('start_time non trovato per il corso, presenze non generate.');
        }
        // --------------------------------

        alertEl.classList.add('bg-green-100', 'text-green-800');
        alertEl.textContent = "Iscrizione completata con successo! 16 sessioni generate.";
        els.enrollmentForm.reset();
    }

    setTimeout(() => {
        alertEl.classList.add('hidden');
    }, 4000);
});


// Start Sequence
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
    initAdminDashboard();
}
