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
    enrollAlert: document.getElementById('enroll-alert')
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
                        <p class="text-xs text-gray-400 mt-0.5" title="${user.id}">ID: ${user.id.substring(0,8)}...</p>
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
        .select('*, profiles(full_name)')
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
        // profile inner join structure handling
        let coachName = "Sconosciuto";
        if (course.profiles) {
            coachName = course.profiles.full_name || coachName;
        }

        const div = document.createElement('div');
        div.className = "p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-colors flex justify-between items-center group";
        
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span class="material-icons">sports_volleyball</span>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 dark:text-white leading-tight">${course.name}</h4>
                    <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span class="material-icons text-[12px]">person</span> ${coachName}
                    </p>
                </div>
            </div>
            <div>
                <button class="delete-course-btn w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" data-id="${course.id}" title="Elimina corso">
                    <span class="material-icons text-sm">delete</span>
                </button>
            </div>
        `;
        
        els.coursesListContainer.appendChild(div);
    });
    
    // Delete bindings
    document.querySelectorAll('.delete-course-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const courseId = e.currentTarget.getAttribute('data-id');
            if (confirm("Eliminare definitivamente questo corso? Tutte le iscrizioni e le presenze associate andranno perse.")) {
                await deleteCourse(courseId);
            }
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
    
    const { error } = await supabase
        .from('enrollments')
        .insert([{
            course_id: courseId,
            athlete_id: athleteId
        }]);
        
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
        alertEl.classList.add('bg-green-100', 'text-green-800');
        alertEl.textContent = "Iscrizione completata con successo!";
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
