// --- Configuration ---
const STORAGE_KEY = 'acodeExpenseTrackerData';
const MONTHLY_BUDGET = 20000.00; 
let currentLang = 'hi'; 
let isEditing = false; 
let editId = null;

// --- Translation Data ---
const translations = {
    hi: {
        title: "SkTech", 
        h2_health: "मासिक वित्तीय स्वास्थ्य",
        p_income: "कुल आय:",
        p_spent: "कुल खर्च:",
        p_balance: "वर्तमान शेष:",
        p_remaining: "बजट शेष:",
        h4_chart: "खर्चों का वितरण",
        h3_new: "नया लेनदेन दर्ज करें",
        ph_amount: "राशि (₹)",
        ph_desc: "विवरण (जैसे: मेट्रो किराया)",
        opt_select: "श्रेणी चुनें",
        opt_food: "भोजन (Food)",
        opt_transport: "परिवहन (Transport)",
        opt_bills: "बिल (Bills)",
        opt_shopping: "खरीदारी (Shopping)",
        opt_income: "आय (Income)",
        opt_all_cat: "सभी श्रेणियाँ", 
        opt_all_type: "आय और खर्च", 
        opt_expense_type: "केवल खर्च", 
        opt_income_type: "केवल आय", 
        h3_full_summary: "सभी लेनदेन और फ़िल्टर", 
        btn_add: "लेनदेन जोड़ें",
        btn_update: "अपडेट करें",
        btn_view_all: "सभी देखें", 
        btn_close_summary: "वापस जाएं", 
        h3_recent: "हाल की गतिविधियाँ",
        li_none: "कोई लेनदेन नहीं",
        alert_fill: "कृपया राशि, श्रेणी और तारीख भरें।",
        confirm_del: "क्या आप इस लेनदेन को हटाना चाहते हैं?",
        chart_none: "कोई खर्च दर्ज नहीं किया गया है।",
        filtered_total_label: "कुल फ़िल्टर राशि: ", 
    },
    en: {
        title: "SkTech", 
        h2_health: "Monthly Financial Health",
        p_income: "Total Income:",
        p_spent: "Total Spent:",
        p_balance: "Current Balance:",
        p_remaining: "Budget Remaining:",
        h4_chart: "Spending Distribution",
        h3_new: "Log New Transaction",
        ph_amount: "Amount (₹)",
        ph_desc: "Description (e.g., Metro Fare)",
        opt_select: "Select Category",
        opt_food: "Food",
        opt_transport: "Transport",
        opt_bills: "Bills",
        opt_shopping: "Shopping",
        opt_income: "Income",
        opt_all_cat: "All Categories", 
        opt_all_type: "Income and Expense", 
        opt_expense_type: "Only Expense", 
        opt_income_type: "Only Income", 
        h3_full_summary: "All Transactions & Filter", 
        btn_add: "Add Transaction",
        btn_update: "Update",
        btn_view_all: "View All", 
        btn_close_summary: "Go Back", 
        h3_recent: "Recent Activity",
        li_none: "No transactions",
        alert_fill: "Please fill in Amount, Category, and Date.",
        confirm_del: "Do you want to delete this transaction?",
        chart_none: "No expenses recorded.",
        filtered_total_label: "Total Filtered Amount: ", 
    }
};

// --- DOM Elements ---
const totalIncomeEl = document.getElementById('total-income');
const totalSpentEl = document.getElementById('total-spent');
const totalBalanceEl = document.getElementById('total-balance');
const budgetRemainingEl = document.getElementById('budget-remaining');
const transactionsListEl = document.getElementById('transactions');
const chartContainerEl = document.getElementById('chart-container');
const expenseForm = document.getElementById('add-expense-form');
const dateInput = document.getElementById('date');
const langSelect = document.getElementById('lang-select');
const appTitleEl = document.querySelector('h1');
const formButtonEl = document.querySelector('.form-card button');
const recentListSectionEl = document.getElementById('expense-list'); 
const summarySectionEl = document.getElementById('full-summary-section'); 
const fullTransactionsListEl = document.getElementById('full-transactions-list'); 
const filteredTotalEl = document.getElementById('filtered-total'); 
const filterCategoryEl = document.getElementById('filter-category'); 
const filterTypeEl = document.getElementById('filter-type'); 

// --- Data Structure ---
let expenses = []; 

if (dateInput) {
    dateInput.value = new Date().toISOString().substring(0, 10);
}


// --- 1. Local Storage Functions ---

function loadExpenses() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            expenses = JSON.parse(storedData);
        } else {
            expenses = [
                { id: Date.now() + 1, amount: 25000.00, category: 'Income', description: 'Monthly Salary', date: '2025-12-01' },
                { id: Date.now() + 2, amount: 5000.00, category: 'Bills', description: 'Rent/EMI', date: '2025-12-05' },
                { id: Date.now() + 3, amount: 250.00, category: 'Food', description: 'Coffee Shop', date: '2025-12-10' },
            ];
        }
    } catch (error) {
        console.error("Local Storage से खर्च लोड करने में त्रुटि:", error);
    }
}

function saveExpenses() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
        console.error("Local Storage में खर्च सेव करने में त्रुटि:", error);
    }
}


// --- Language Switching Function ---

function populateCategoryFilters() {
    const t = translations[currentLang];
    
    // Get unique categories 
    const categories = [...new Set(expenses.map(e => e.category))];

    // Clear existing options (keep the default "All Categories")
    filterCategoryEl.innerHTML = `<option value="all">${t.opt_all_cat}</option>`;
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        // Translate category for display
        const categoryKey = 'opt_' + cat.toLowerCase();
        option.textContent = t[categoryKey] || cat;
        filterCategoryEl.appendChild(option);
    });
}

function updateText(lang) {
    const t = translations[lang];

    // Dashboard Headers
    document.querySelector('.dashboard-card h2').textContent = t.h2_health;
    
    // Summary Paragraphs (Update Text Node)
    document.querySelector('.summary p:nth-child(1)').childNodes[0].nodeValue = t.p_income + ' ₹';
    document.querySelector('.summary p:nth-child(2)').childNodes[0].nodeValue = t.p_spent + ' ₹';
    document.querySelector('.summary p:nth-child(3)').childNodes[0].nodeValue = t.p_balance + ' ₹';
    document.querySelector('.summary p:nth-child(4)').childNodes[0].nodeValue = t.p_remaining + ' ₹';
    
    // Form
    document.querySelector('.form-card h3').textContent = t.h3_new;
    document.getElementById('amount').placeholder = t.ph_amount;
    document.getElementById('description').placeholder = t.ph_desc;
    
    // Update button text based on mode
    formButtonEl.textContent = isEditing ? t.btn_update : t.btn_add;

    // Category Options
    document.querySelector('#category option[value=""]').textContent = t.opt_select;
    document.querySelector('#category option[value="Food"]').textContent = t.opt_food;
    document.querySelector('#category option[value="Transport"]').textContent = t.opt_transport;
    document.querySelector('#category option[value="Bills"]').textContent = t.opt_bills;
    document.querySelector('#category option[value="Shopping"]').textContent = t.opt_shopping;
    document.querySelector('#category option[value="Income"]').textContent = t.opt_income;
    
    // Filter Options
    document.querySelector('#filter-category option[value="all"]').textContent = t.opt_all_cat;
    document.querySelector('#filter-type option[value="all"]').textContent = t.opt_all_type;
    document.querySelector('#filter-type option[value="expense"]').textContent = t.opt_expense_type;
    document.querySelector('#filter-type option[value="income"]').textContent = t.opt_income_type;

    // List
    document.querySelector('.list-card h3').textContent = t.h3_recent;
    
    // Full Summary
    document.querySelector('#full-summary-section h3').textContent = t.h3_full_summary;
    document.getElementById('close-summary-btn').textContent = t.btn_close_summary;
    
    // Re-render transactions and chart to update internal texts
    populateCategoryFilters(); 
    renderTransactions(); 
    renderChart(expenses.filter(e => e.category !== 'Income').reduce((sum, e) => sum + e.amount, 0));
    
    // If summary is visible, re-render it
    if (summarySectionEl && summarySectionEl.style.display !== 'none') {
        renderFullSummary();
    }
}


// --- 2. Calculation and Display Functions ---

function updateDashboard() {
    const totalIncome = expenses.filter(e => e.category === 'Income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.filter(e => e.category !== 'Income').reduce((sum, e) => sum + e.amount, 0);
    const totalBalance = totalIncome - totalExpense;
    const budgetRemaining = MONTHLY_BUDGET - totalExpense;

    if (totalIncomeEl) totalIncomeEl.textContent = totalIncome.toFixed(2);
    if (totalSpentEl) totalSpentEl.textContent = totalExpense.toFixed(2);
    if (totalBalanceEl) {
        totalBalanceEl.textContent = totalBalance.toFixed(2);
        totalBalanceEl.style.color = totalBalance >= 0 ? '#27ae60' : '#e74c3c';
    }
    if (budgetRemainingEl) {
        budgetRemainingEl.textContent = budgetRemaining.toFixed(2);
        budgetRemainingEl.style.color = budgetRemaining >= 0 ? '#3498db' : '#e74c3c';
    }

    populateCategoryFilters(); 
    renderTransactions();
    renderChart(totalExpense);
    
    if (summarySectionEl && summarySectionEl.style.display !== 'none') {
        renderFullSummary();
    }
}

function createTransactionListItem(expense, t, showActions = true) {
    const listItem = document.createElement('li');
    const isIncome = expense.category === 'Income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'plus' : 'minus';

    listItem.className = isIncome ? 'income-item' : 'expense-item';
    
    const categoryKey = 'opt_' + expense.category.toLowerCase();
    const translatedCategory = t[categoryKey] || expense.category;
    
    let actionsHTML = '';
    if (showActions) {
        actionsHTML = `<button class="edit-btn" data-id="${expense.id}">✏️</button><button class="delete-btn" data-id="${expense.id}">🗑️</button>`;
    }
    
    listItem.innerHTML = `
        <div class="list-date">${expense.date}</div>
        <div class="list-details">
            <span class="list-category">${translatedCategory}</span>
            <span class="list-description">${expense.description || 'N/A'}</span>
        </div>
        <span class="list-amount ${amountClass}">
            ${sign}₹${expense.amount.toFixed(2)}
        </span>
        ${actionsHTML}
    `;
    return listItem;
}

function renderTransactions() {
    if (!transactionsListEl) return;
    const t = translations[currentLang]; 

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    transactionsListEl.innerHTML = ''; 

    if (sortedExpenses.length === 0) {
        transactionsListEl.innerHTML = `<li data-key="li_none">${t.li_none}</li>`;
        return;
    }

    const displayCount = 5;
    const itemsToDisplay = sortedExpenses.slice(0, displayCount);

    itemsToDisplay.forEach(expense => {
        const listItem = createTransactionListItem(expense, t);
        transactionsListEl.appendChild(listItem);
    });

    // Add View All Button 
    if (sortedExpenses.length > displayCount) {
        const viewAllLi = document.createElement('li');
        viewAllLi.style.justifyContent = 'center';
        viewAllLi.style.borderBottom = 'none';
        viewAllLi.innerHTML = `<button id="view-all-btn" style="background-color: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 6px;">${t.btn_view_all}</button>`;
        transactionsListEl.appendChild(viewAllLi);
        
        document.getElementById('view-all-btn').addEventListener('click', showFullSummary);
    }
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', startEdit);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteExpense);
    });
}

function renderChart(totalExpense) {
    if (!chartContainerEl) return;
    const t = translations[currentLang]; 

    const categorySpending = expenses
        .filter(e => e.category !== 'Income')
        .reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});
    
    const chartData = Object.keys(categorySpending).map(category => ({
        category: category,
        amount: categorySpending[category],
        percentage: totalExpense > 0 ? (categorySpending[category] / totalExpense) * 100 : 0,
    }));
    
    chartData.sort((a, b) => b.amount - a.amount);

    let chartHTML = `<h4>${t.h4_chart}</h4>`;
    if (chartData.length === 0 || totalExpense === 0) {
        chartHTML += `<p>${t.chart_none}</p>`;
    } else {
        chartData.forEach(data => {
            const categoryKey = 'opt_' + data.category.toLowerCase();
            const translatedCategory = t[categoryKey] || data.category;

            chartHTML += `
                <div class="chart-bar-item">
                    <span class="chart-label">${translatedCategory} (${data.percentage.toFixed(0)}%)</span>
                    <div class="chart-bar" style="width: ${data.percentage}%"></div>
                    <span class="chart-value">₹${data.amount.toFixed(2)}</span>
                </div>
            `;
        });
    }
    chartContainerEl.innerHTML = chartHTML;
}

function renderFullSummary() {
    if (!fullTransactionsListEl) return;
    const t = translations[currentLang]; 
    
    const selectedCategory = filterCategoryEl.value;
    const selectedType = filterTypeEl.value;

    // 1. Apply Filters
    let filteredExpenses = expenses.filter(expense => {
        const categoryMatch = selectedCategory === 'all' || expense.category === selectedCategory;
        const typeMatch = selectedType === 'all' || (selectedType === 'income' && expense.category === 'Income') || (selectedType === 'expense' && expense.category !== 'Income');
        return categoryMatch && typeMatch;
    });

    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 2. Calculate Filtered Total
    const filteredTotal = filteredExpenses.reduce((sum, e) => {
        return sum + (e.category === 'Income' ? e.amount : -e.amount);
    }, 0);
    
    // Display total
    filteredTotalEl.textContent = `${t.filtered_total_label} ₹${filteredTotal.toFixed(2)}`;
    filteredTotalEl.style.color = filteredTotal >= 0 ? '#27ae60' : '#e74c3c';

    // 3. Render List
    fullTransactionsListEl.innerHTML = '';
    
    if (filteredExpenses.length === 0) {
        fullTransactionsListEl.innerHTML = `<li data-key="li_none">${t.li_none}</li>`;
        return;
    }
    
    filteredExpenses.forEach(expense => {
        const listItem = createTransactionListItem(expense, t, true); 
        fullTransactionsListEl.appendChild(listItem);
    });
    
    // Attach event listeners for edit and delete (on the full list)
    fullTransactionsListEl.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', startEdit);
    });
    fullTransactionsListEl.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteExpense);
    });
}


function showFullSummary() {
    document.querySelector('.app-container').style.display = 'none';
    summarySectionEl.style.display = 'block';
    renderFullSummary(); 
}

function hideFullSummary() {
    summarySectionEl.style.display = 'none';
    document.querySelector('.app-container').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
}


// --- 3. Event Handlers ---

function startEdit(e) {
    hideFullSummary(); 

    const idToEdit = parseInt(e.target.dataset.id);
    const expenseToEdit = expenses.find(exp => exp.id === idToEdit);

    if (!expenseToEdit) return;

    isEditing = true;
    editId = idToEdit;
    
    document.getElementById('amount').value = expenseToEdit.amount;
    document.getElementById('category').value = expenseToEdit.category;
    document.getElementById('date').value = expenseToEdit.date;
    document.getElementById('description').value = expenseToEdit.description;

    updateText(currentLang); 
    
    document.getElementById('expense-form').scrollIntoView({ behavior: 'smooth' });
}


function addOrUpdateExpense(e) {
    e.preventDefault();
    const t = translations[currentLang]; 

    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;

    if (!amount || !category || !date) {
        alert(t.alert_fill); 
        return;
    }

    if (isEditing) {
        // --- UPDATE LOGIC ---
        expenses = expenses.map(exp => {
            if (exp.id === editId) {
                return {
                    id: exp.id,
                    amount, category, date, description
                };
            }
            return exp;
        });

        isEditing = false;
        editId = null;

    } else {
        // --- ADD LOGIC ---
        const newExpense = {
            id: Date.now(),
            amount, category, date, description,
        };
        expenses.push(newExpense);
    }
    
    updateDashboard();
    saveExpenses();
    
    expenseForm.reset();
    if (dateInput) {
        dateInput.value = new Date().toISOString().substring(0, 10);
    }
    updateText(currentLang); 
}

function deleteExpense(e) {
    const t = translations[currentLang]; 
    const idToDelete = parseInt(e.target.dataset.id);
    
    if (!confirm(t.confirm_del)) { 
        return;
    }
    
    expenses = expenses.filter(expense => expense.id !== idToDelete);
    
    if (summarySectionEl && summarySectionEl.style.display !== 'none') {
        renderFullSummary();
    }
    
    updateDashboard();
    saveExpenses();
}

// --- Initialization ---

function initApp() {
    loadExpenses();

    // 1. Language Switcher Event Listener
    if (langSelect) {
        const storedLang = localStorage.getItem('appLang') || 'hi';
        currentLang = storedLang;
        langSelect.value = storedLang;

        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('appLang', currentLang);
            updateText(currentLang); 
            updateDashboard(); 
        });
    }

    // 2. Initial UI Render
    updateText(currentLang);
    updateDashboard(); 

    // 3. Form Submission
    if (expenseForm) {
        expenseForm.addEventListener('submit', addOrUpdateExpense);
    }
    
    // 4. Filter and Close Listeners
    if (filterCategoryEl) {
        filterCategoryEl.addEventListener('change', renderFullSummary);
    }
    if (filterTypeEl) {
        filterTypeEl.addEventListener('change', renderFullSummary);
    }
    if (document.getElementById('close-summary-btn')) {
        document.getElementById('close-summary-btn').addEventListener('click', hideFullSummary);
    }
}

initApp(); // Start the application
