// --- DOM ELEMENTS ---
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Auth Buttons
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const linkToRegister = document.getElementById('link-to-register');
const linkToLogin = document.getElementById('link-to-login');
const btnLogout = document.getElementById('btn-logout');

// App Elements
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const type = document.getElementById('type');
const balanceEl = document.getElementById('balance');
const moneyPlusEl = document.getElementById('money-plus');
const moneyMinusEl = document.getElementById('money-minus');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const editIdInput = document.getElementById('edit-id');
const welcomeUserEl = document.getElementById('welcome-user');

// --- STATE VARIABLES ---
let currentUser = null;
let transactions = [];

// --- INITIALIZATION ---
window.onload = () => {
    // Cek apakah ada user yang tersimpan di session
    const savedUser = localStorage.getItem('finance_current_user');
    if (savedUser) {
        currentUser = savedUser;
        loadUserData();
        showApp();
    }
};

// --- AUTHENTICATION LOGIC ---

// Toggle antara Login dan Register
linkToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

linkToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Fungsi Register
btnRegister.addEventListener('click', () => {
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    if (!user || !pass) return alert("Isi username dan password!");

    // Ambil database user dari localstorage
    const usersDB = JSON.parse(localStorage.getItem('finance_users_db')) || {};
    
    if (usersDB[user]) {
        alert("Username sudah terpakai, pilih yang lain.");
    } else {
        usersDB[user] = pass; 
        localStorage.setItem('finance_users_db', JSON.stringify(usersDB));
        alert("Akun berhasil dibuat! Silakan Login.");
        // Kembali ke tampilan login
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
});

// Fungsi Login
btnLogin.addEventListener('click', () => {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    const usersDB = JSON.parse(localStorage.getItem('finance_users_db')) || {};

    if (usersDB[user] && usersDB[user] === pass) {
        currentUser = user;
        localStorage.setItem('finance_current_user', user);
        loadUserData();
        showApp();
    } else {
        alert("Username atau Password salah!");
    }
});

// Fungsi Logout
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('finance_current_user');
    currentUser = null;
    transactions = [];
    // Reset View
    appScreen.classList.add('hidden');
    appScreen.classList.remove('active');
    authScreen.classList.remove('hidden');
    authScreen.classList.add('active');
    
    // Reset Form Login
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
});

// Pindah ke Tampilan Aplikasi
function showApp() {
    authScreen.classList.add('hidden');
    authScreen.classList.remove('active');
    
    appScreen.classList.remove('hidden');
    appScreen.classList.add('active');
    
    welcomeUserEl.innerText = `Halo, ${currentUser}`;
}

// --- DATA LOGIC (CRUD) ---

// 1. Load Data dari LocalStorage
function loadUserData() {
    // Key penyimpanan dibedakan berdasarkan nama user agar tidak tertukar
    const data = localStorage.getItem(`finance_data_${currentUser}`);
    transactions = data ? JSON.parse(data) : [];
    initApp();
}

// 2. Simpan Data ke LocalStorage
function saveData() {
    localStorage.setItem(`finance_data_${currentUser}`, JSON.stringify(transactions));
    initApp();
}

// 3. Tambah / Update Transaksi
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Mohon isi keterangan dan jumlah uang');
        return;
    }

    const idToEdit = editIdInput.value;

    if (idToEdit) {
        // MODE EDIT
        const index = transactions.findIndex(t => t.id == idToEdit);
        if (index !== -1) {
            transactions[index].text = text.value;
            transactions[index].amount = +amount.value; // ubah string ke number
            transactions[index].type = type.value;
        }
    } else {
        // MODE TAMBAH BARU
        const transaction = {
            id: generateID(),
            text: text.value,
            amount: +amount.value,
            type: type.value,
            date: new Date().toISOString() // Simpan tanggal
        };
        transactions.push(transaction);
    }

    saveData();
    resetForm();
});

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// 4. Hapus Transaksi (Harus di-expose ke window karena dipanggil lewat HTML onclick)
window.removeTransaction = function(id) {
    if(confirm("Hapus transaksi ini?")) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveData();
    }
}

// 5. Persiapan Edit (Isi form dengan data lama)
window.prepareEdit = function(id) {
    const item = transactions.find(t => t.id === id);
    if (!item) return;

    text.value = item.text;
    amount.value = item.amount;
    type.value = item.type;
    editIdInput.value = item.id;

    submitBtn.innerText = "Update Transaksi";
    submitBtn.classList.add('btn-sec');
    cancelEditBtn.classList.remove('hidden');
}

// 6. Reset Form Batal Edit
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    text.value = '';
    amount.value = '';
    type.value = 'income';
    editIdInput.value = '';
    
    submitBtn.innerText = "Tambah Transaksi";
    submitBtn.classList.remove('btn-sec');
    cancelEditBtn.classList.add('hidden');
}

// --- UI RENDERING ---

function initApp() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

function addTransactionDOM(transaction) {
    const sign = transaction.type === 'expense' ? '-' : '+';
    const itemClass = transaction.type === 'expense' ? 'minus' : 'plus';
    const dateFormatted = new Date(transaction.date || Date.now()).toLocaleDateString('id-ID');

    const item = document.createElement('li');
    item.classList.add(itemClass);

    item.innerHTML = `
        <div class="trans-info">
            <span>${transaction.text}</span>
            <span class="trans-date">${dateFormatted}</span>
        </div>
        <span class="trans-amount">${sign}Rp ${formatMoney(transaction.amount)}</span>
        <div class="action-btn">
            <button class="btn-edit" onclick="prepareEdit(${transaction.id})">Edit</button>
            <button class="btn-del" onclick="removeTransaction(${transaction.id})">X</button>
        </div>
    `;

    list.appendChild(item);
}

function updateValues() {
    const amounts = transactions.map(t => t.type === 'expense' ? -t.amount : t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => (acc += t.amount), 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => (acc += t.amount), 0);

    balanceEl.innerText = `Rp ${formatMoney(total)}`;
    moneyPlusEl.innerText = `+Rp ${formatMoney(income)}`;
    moneyMinusEl.innerText = `-Rp ${formatMoney(expense)}`;
}

function formatMoney(num) {
    return num.toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&.');
}
