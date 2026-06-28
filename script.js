// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const totalTasksEl = document.getElementById('totalTasks');
const activeTasksEl = document.getElementById('activeTasks');
const completedTasksEl = document.getElementById('completedTasks');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize
initialize();

function initialize() {
    renderTodos();
    updateStats();
    setupEventListeners();
}

function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.closest('.filter-btn').classList.add('active');
            currentFilter = e.target.closest('.filter-btn').dataset.filter;
            renderTodos();
        });
    });

    clearBtn.addEventListener('click', clearCompletedTodos);
}

function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Masukkan tugas terlebih dahulu!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString('id-ID')
    };

    todos.unshift(todo);
    saveTodos();
    renderTodos();
    updateStats();
    todoInput.value = '';
    todoInput.focus();

    // Animation feedback
    addBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        addBtn.style.transform = 'scale(1)';
    }, 100);
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function clearCompletedTodos() {
    const completedCount = todos.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        alert('Tidak ada tugas yang selesai untuk dihapus.');
        return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus ${completedCount} tugas yang selesai?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <li class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${getEmptyMessage()}</p>
            </li>
        `;
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="todo-delete" onclick="deleteTodo(${todo.id})">
                <i class="fas fa-trash"></i> Hapus
            </button>
        </li>
    `).join('');
}

function getEmptyMessage() {
    switch (currentFilter) {
        case 'active':
            return '🎉 Tidak ada tugas aktif! Kamu hebat!';
        case 'completed':
            return '📋 Belum ada tugas yang selesai.';
        default:
            return '✨ Belum ada tugas. Mulai tambahkan tugas baru!';
    }
}

function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;

    totalTasksEl.textContent = total;
    activeTasksEl.textContent = active;
    completedTasksEl.textContent = completed;

    clearBtn.disabled = completed === 0;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard shortcut: Escape to clear input
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        todoInput.value = '';
        todoInput.focus();
    }
});