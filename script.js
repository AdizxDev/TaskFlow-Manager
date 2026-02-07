// DOM Elements
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const addTaskBtn = document.getElementById('add-task-btn');
const modal = document.getElementById('task-modal');
const closeModal = document.querySelector('.close-modal');
const closeModalBtn = document.querySelector('.close-modal-btn');
const modalTitle = document.getElementById('modal-title');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const themeToggle = document.getElementById('theme-toggle');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Inputs
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskCategoryInput = document.getElementById('task-category'); // Renamed from course
const taskTypeInput = document.getElementById('task-type'); // New field
const taskDescInput = document.getElementById('task-desc');
const taskDeadlineInput = document.getElementById('task-deadline');
const taskStatusInput = document.getElementById('task-status');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentSearch = '';

// --- Initialization ---

// Check Theme
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="bx bx-sun"></i>';
    }
}

// Render Initial Tasks
renderTasks();

// --- Event Listeners ---

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="bx bx-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="bx bx-sun"></i>';
    }
});

// Mobile Menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Scroll Spy & Active Link State
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });

    // Navbar Glass Effect on Scroll
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = 'var(--shadow-md)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

addTaskBtn.addEventListener('click', () => {
    openModal();
});

closeModal.addEventListener('click', closeModalFunc);
closeModalBtn.addEventListener('click', closeModalFunc);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFunc();
    }
});

// Form Submission (Add/Edit)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveTask();
});

// Filter & Search
searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderTasks();
});

filterStatus.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderTasks();
});

// --- Functions ---

function openModal(editMode = false, task = null) {
    modal.classList.add('active'); // Use class for animation
    modal.style.display = 'flex'; // Ensure flex display

    // Tiny timeout to allow display:flex to apply before opacity transition
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    if (editMode && task) {
        modalTitle.textContent = 'Edit Data';
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskCategoryInput.value = task.category || task.course; // Fallback for old data
        taskTypeInput.value = task.type || 'kuliah'; // Fallback
        taskDescInput.value = task.description;
        taskDeadlineInput.value = task.deadline;
        taskStatusInput.value = task.status;
    } else {
        modalTitle.textContent = 'Tambah Data Baru';
        taskForm.reset();
        taskIdInput.value = '';
        taskTypeInput.value = 'kuliah'; // Default
    }
}

function closeModalFunc() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        taskForm.reset();
    }, 300); // Wait for transition
}

function saveTask() {
    const id = taskIdInput.value;
    const title = taskTitleInput.value;
    const category = taskCategoryInput.value;
    const type = taskTypeInput.value;
    const description = taskDescInput.value;
    const deadline = taskDeadlineInput.value;
    const status = taskStatusInput.value;

    if (!title || !category || !deadline) {
        alert('Mohon lengkapi data wajib!');
        return;
    }

    const taskData = {
        id: id ? parseInt(id) : Date.now(),
        title,
        category,
        type,
        description,
        deadline,
        status,
        createdAt: id ? undefined : new Date().toISOString()
    };

    if (id) {
        // Edit existing
        const index = tasks.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
        }
    } else {
        // Add new
        tasks.push(taskData);
    }

    saveToLocalStorage();
    renderTasks();
    closeModalFunc();
}

function deleteTask(id) {
    if (confirm('Yakin ingin menghapus data ini?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage();
        renderTasks();
    }
}

function markAsDone(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index].status = 'completed';
        saveToLocalStorage();
        renderTasks();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        const categoryVal = task.category || task.course; // Fallback
        const matchesSearch = task.title.toLowerCase().includes(currentSearch) ||
            categoryVal.toLowerCase().includes(currentSearch);
        const matchesFilter = currentFilter === 'all' || task.status === currentFilter;
        return matchesSearch && matchesFilter;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-color); opacity: 0.7;">
                <i class='bx bx-clipboard' style="font-size: 4rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                <p style="font-size: 1.2rem;">Belum ada data tugas atau proyek.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Klik "Tambah Tugas" untuk memulai.</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';

        const badgeClass = task.status === 'completed' ? 'completed' : 'pending';
        const badgeText = task.status === 'completed' ? 'Selesai' : 'Belum Selesai';

        // Type Badge Logic
        const type = task.type || 'kuliah';
        const typeClass = type === 'project' ? 'type-project' : 'type-college';
        const typeIcon = type === 'project' ? '<i class="bx bx-briefcase-alt"></i>' : '<i class="bx bxs-graduation"></i>';
        const typeLabel = type === 'project' ? 'Project' : 'Kuliah';

        // Fix for old data structure
        const category = task.category || task.course;

        card.innerHTML = `
            <div class="task-top-badges">
                <span class="type-badge ${typeClass}">${typeIcon} ${typeLabel}</span>
                <span class="task-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="task-header mb-2">
                <h3 class="task-title">${task.title}</h3>
                <span class="task-course">${category}</span>
            </div>
            <p class="task-desc">${task.description || 'Tidak ada deskripsi.'}</p>
            <div class="task-meta">
                <span><i class='bx bx-calendar'></i> ${formatDate(task.deadline)}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-edit" onclick="editTask(${task.id})"><i class='bx bx-edit'></i> Edit</button>
                <button class="btn btn-sm btn-delete" onclick="deleteTask(${task.id})"><i class='bx bx-trash'></i> Hapus</button>
                ${task.status !== 'completed' ? `<button class="btn btn-sm btn-done" onclick="markAsDone(${task.id})"><i class='bx bx-check'></i> Selesai</button>` : ''}
            </div>
        `;
        taskList.appendChild(card);
    });
}

// Global scope for onclick handlers in HTML string
window.editTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        openModal(true, task);
    }
};

window.deleteTask = deleteTask;
window.markAsDone = markAsDone;

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}
