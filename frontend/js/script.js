// ========================================
// PharmaFlow - CRUD JavaScript
// Currency: Indian Rupees (INR ₹)
// ========================================

const API_BASE = "/api";

// Currency formatter for INR
function formatINR(amount) {
    if (!amount) return "₹0.00";
    const num = parseFloat(amount);
    return "₹" + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Current page and edit mode
let currentPage = "dashboard";
let editMode = null;
let editId = null;

// ========================================
// Navigation
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    // Setup navigation
    document.querySelectorAll(".sidebar li").forEach(li => {
        li.addEventListener("click", () => {
            const page = li.dataset.page;
            navigateTo(page);
        });
    });

    // Load initial data
    loadDashboard();
});

// Navigate to page
function navigateTo(page) {
    // Update sidebar
    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
        if (li.dataset.page === page) li.classList.add("active");
    });

    // Hide all pages
    document.querySelectorAll(".page-content").forEach(p => p.classList.add("hidden"));

    // Show selected page
    document.getElementById(page).classList.remove("hidden");

    // Update title
    const titles = {
        dashboard: "Dashboard",
        medicines: "Medicines",
        patients: "Patients",
        hospitals: "Hospitals",
        dealers: "Dealers",
        stores: "Stores",
        doctors: "Doctors",
        transactions: "Transactions",
        inventory: "Inventory",
        analytics: "Advanced Analytics"
    };
    document.getElementById("pageTitle").textContent = titles[page] || page;

    currentPage = page;

    // Load data for page
    switch (page) {
        case "dashboard": loadDashboard(); break;
        case "medicines": loadMedicines(); break;
        case "patients": loadPatients(); break;
        case "hospitals": loadHospitals(); break;
        case "dealers": loadDealers(); break;
        case "stores": loadStores(); break;
        case "doctors": loadDoctors(); break;
        case "transactions": loadTransactions(); break;
        case "inventory": loadInventory(); break;
        case "analytics": loadAnalytics(); break;
    }
}

// ========================================
// Dashboard
// ========================================

function loadDashboard() {
    fetch(`${API_BASE}/stats`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("totalMedicines").textContent = data.totalMedicines || 0;
            document.getElementById("totalStores").textContent = data.totalStores || 0;
            document.getElementById("totalDealers").textContent = data.totalDealers || 0;
            document.getElementById("totalPatients").textContent = data.totalPatients || 0;
            document.getElementById("totalSales").textContent = formatINR(data.totalSales || 0);
            document.getElementById("lowStock").textContent = data.lowStock || 0;
        });

    // Load low stock items
    fetch(`${API_BASE}/low-stock`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("lowStockTable");
            if (data.length === 0) {
                container.innerHTML = "<p style='color: #27ae60;'>No low stock items!</p>";
            } else {
                container.innerHTML = data.slice(0, 5).map(item => `
                    <div class="low-stock-item">
                        <span class="med-name">${item.med_name}</span>
                        <span class="stock-qty">${item.quantity} units</span>
                    </div>
                `).join("");
            }
        });

    // Load recent transactions
    fetch(`${API_BASE}/transactions`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("recentTransactions");
            if (data.length === 0) {
                container.innerHTML = "<p>No transactions yet.</p>";
            } else {
                container.innerHTML = data.slice(0, 5).map(t => `
                    <div class="trans-item">
                        <div class="trans-info">
                            <span class="pat-name">${t.pat_name || 'Unknown'}</span>
                            <span class="med-name">${t.med_name || 'Unknown'}</span>
                        </div>
                        <span class="trans-amount">${formatINR(t.total)}</span>
                    </div>
                `).join("");
            }
        });
}

// ========================================
// Medicines CRUD
// ========================================

function loadMedicines() {
    fetch(`${API_BASE}/medicines`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("medicineTable");
            tbody.innerHTML = data.map(med => `
                <tr>
                    <td>${med.med_id}</td>
                    <td>${med.name}</td>
                    <td>${med.composition || '-'}</td>
                    <td>${formatINR(med.cost_per_tab)}</td>
                    <td>${med.mfg_date}</td>
                    <td>${med.exp_date}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" onclick="editRecord('medicine', ${med.med_id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteRecord('medicine', ${med.med_id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        });
}

// ========================================
// Patients CRUD
// ========================================

function loadPatients() {
    fetch(`${API_BASE}/patients`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("patientTable");
            tbody.innerHTML = data.map(pat => `
                <tr>
                    <td>${pat.pat_id}</td>
                    <td>${pat.name}</td>
                    <td>${pat.address || '-'}</td>
                    <td>${pat.phone}</td>
                    <td>${pat.email || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" onclick="editRecord('patient', ${pat.pat_id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteRecord('patient', ${pat.pat_id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        });
}

// ========================================
// Hospitals CRUD
// ========================================

function loadHospitals() {
    fetch(`${API_BASE}/hospitals`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("hospitalTable");
            tbody.innerHTML = data.map(h => `
                <tr>
                    <td>${h.hos_id}</td>
                    <td>${h.name}</td>
                    <td>${h.address || '-'}</td>
                    <td>${h.phone || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" onclick="editRecord('hospital', '${h.hos_id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteRecord('hospital', '${h.hos_id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        });
}

// ========================================
// Dealers CRUD
// ========================================

function loadDealers() {
    fetch(`${API_BASE}/dealers`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("dealerTable");
            tbody.innerHTML = data.map(d => `
                <tr>
                    <td>${d.dealer_id}</td>
                    <td>${d.name}</td>
                    <td>${d.address || '-'}</td>
                    <td>${d.phone || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" onclick="editRecord('dealer', ${d.dealer_id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteRecord('dealer', ${d.dealer_id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        });
}

// ========================================
// Stores CRUD
// ========================================

function loadStores() {
    fetch(`${API_BASE}/stores`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("storeTable");
            tbody.innerHTML = data.map(s => `
                <tr>
                    <td>${s.store_id}</td>
                    <td>${s.name}</td>
                    <td>${s.address || '-'}</td>
                    <td>${s.contact || '-'}</td>
                    <td>${s.store_man || '-'}</td>
                    <td>${s.license_no || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" onclick="editRecord('store', '${s.store_id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteRecord('store', '${s.store_id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        });
}

// ========================================
// Doctors CRUD
// ========================================

function loadDoctors() {
    fetch(`${API_BASE}/doctors`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("doctorTable");
            tbody.innerHTML = data.map(d => `
                <tr>
                    <td>${d.doc_id}</td>
                    <td>${d.hos_id}</td>
                    <td>${d.doc_name}</td>
                    <td>${d.specialization || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" onclick="editRecord('doctor', '${d.doc_id}/${d.hos_id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteRecord('doctor', '${d.doc_id}/${d.hos_id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        });
}

// ========================================
// Transactions CRUD
// ========================================

function loadTransactions() {
    fetch(`${API_BASE}/transactions`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("transactionTable");
            tbody.innerHTML = data.map(t => `
                <tr>
                    <td>${t.bill_id}</td>
                    <td>${t.pat_name || t.pat_id}</td>
                    <td>${t.med_name || t.med_id}</td>
                    <td>${t.store_name || t.store_id}</td>
                    <td>${t.quantity}</td>
                    <td>${formatINR(t.total)}</td>
                    <td>${t.pur_date}</td>
                    <td>
                        <div class="action-btns">
                            <button class="delete-btn" onclick="deleteRecord('transaction', '${t.bill_id}/${t.pat_id}/${t.med_id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        });
}

// ========================================
// Inventory
// ========================================

function loadInventory() {
    fetch(`${API_BASE}/inventory`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("inventoryTable");
            tbody.innerHTML = data.map(i => {
                let status = i.quantity < 20 ? 'critical' : i.quantity < 50 ? 'low' : 'ok';
                let statusText = i.quantity < 20 ? 'Critical' : i.quantity < 50 ? 'Low' : 'OK';
                return `
                    <tr>
                        <td>${i.med_name}</td>
                        <td>${i.store_name}</td>
                        <td>${i.quantity}</td>
                        <td>${i.exp_date || '-'}</td>
                        <td><span class="stock-badge ${status}">${statusText}</span></td>
                        <td>
                            <div class="action-btns">
                                <button class="edit-btn" onclick="editRecord('inventory', '${i.med_id}/${i.store_id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        });
}

// ========================================
// Form Handling
// ========================================

function showForm(type) {
    editMode = null;
    editId = null;

    const forms = {
        medicine: {
            title: "Add Medicine",
            fields: [
                { name: "name", label: "Medicine Name", type: "text", required: true },
                { name: "composition", label: "Composition", type: "text" },
                { name: "mfg_date", label: "Manufacturing Date", type: "date", required: true },
                { name: "exp_date", label: "Expiry Date", type: "date", required: true },
                { name: "cost_per_tab", label: "Cost per Tablet", type: "number", step: "0.01", required: true }
            ]
        },
        patient: {
            title: "Add Patient",
            fields: [
                { name: "name", label: "Patient Name", type: "text", required: true },
                { name: "address", label: "Address", type: "textarea" },
                { name: "phone", label: "Phone", type: "text", required: true },
                { name: "email", label: "Email", type: "email" }
            ]
        },
        hospital: {
            title: "Add Hospital",
            fields: [
                { name: "hos_id", label: "Hospital ID", type: "text", required: true },
                { name: "name", label: "Hospital Name", type: "text", required: true },
                { name: "address", label: "Address", type: "textarea" },
                { name: "phone", label: "Phone", type: "text" }
            ]
        },
        dealer: {
            title: "Add Dealer",
            fields: [
                { name: "name", label: "Dealer Name", type: "text", required: true },
                { name: "address", label: "Address", type: "textarea" },
                { name: "phone", label: "Phone", type: "text" }
            ]
        },
        store: {
            title: "Add Store",
            fields: [
                { name: "store_id", label: "Store ID", type: "text", required: true },
                { name: "name", label: "Store Name", type: "text", required: true },
                { name: "address", label: "Address", type: "textarea" },
                { name: "contact", label: "Contact", type: "text" },
                { name: "store_man", label: "Manager", type: "text" },
                { name: "license_no", label: "License Number", type: "text" }
            ]
        },
        doctor: {
            title: "Add Doctor",
            fields: [
                { name: "doc_id", label: "Doctor ID", type: "number", required: true },
                { name: "hos_id", label: "Hospital ID", type: "text", required: true },
                { name: "doc_name", label: "Doctor Name", type: "text", required: true },
                { name: "specialization", label: "Specialization", type: "text" }
            ]
        },
        transaction: {
            title: "New Transaction",
            fields: [
                { name: "bill_id", label: "Bill ID", type: "number", required: true },
                { name: "pat_id", label: "Patient ID", type: "number", required: true },
                { name: "store_id", label: "Store ID", type: "text", required: true },
                { name: "med_id", label: "Medicine ID", type: "number", required: true },
                { name: "quantity", label: "Quantity", type: "number", required: true },
                { name: "pur_date", label: "Date", type: "date", required: true }
            ]
        },
        inventory: {
            title: "Update Stock",
            fields: [
                { name: "med_id", label: "Medicine ID", type: "number", required: true },
                { name: "store_id", label: "Store ID", type: "text", required: true },
                { name: "quantity", label: "Quantity", type: "number", required: true }
            ]
        }
    };

    const form = forms[type];
    if (!form) return;

    document.getElementById("modalTitle").textContent = form.title;

    let fieldsHtml = form.fields.map(f => `
        <div class="form-group">
            <label>${f.label}${f.required ? ' *' : ''}</label>
            <${f.type === 'textarea' ? 'textarea' : 'input'}
                name="${f.name}"
                type="${f.type}"
                ${f.step ? `step="${f.step}"` : ''}
                ${f.required ? 'required' : ''}>
            </${f.type === 'textarea' ? 'textarea' : 'input'}>
        </div>
    `).join("");

    document.getElementById("formFields").innerHTML = fieldsHtml;
    document.getElementById("modal").classList.remove("hidden");
}

function editRecord(type, id) {
    editMode = type;
    editId = id;

    // Map type to API endpoint
    const endpoints = {
        medicine: `medicines/${id}`,
        patient: `patients/${id}`,
        hospital: `hospitals/${id}`,
        dealer: `dealers/${id}`,
        store: `stores/${id}`,
        inventory: `inventory/${id}`
    };

    // Handle special cases
    if (type === "doctor") {
        const [docId, hosId] = id.split("/");
        fetch(`${API_BASE}/doctors`)
            .then(res => res.json())
            .then(data => {
                const doc = data.find(d => d.doc_id == docId && d.hos_id == hosId);
                if (doc) populateForm("doctor", doc);
            });
        return;
    }

    if (type === "transaction") return; // Transactions are immutable

    fetch(`${API_BASE}/${endpoints[type]}`)
        .then(res => res.json())
        .then(data => {
            if (data) populateForm(type, data);
        });
}

function populateForm(type, data) {
    const forms = {
        medicine: {
            title: "Edit Medicine",
            fields: [
                { name: "name", label: "Medicine Name", type: "text", required: true },
                { name: "composition", label: "Composition", type: "text" },
                { name: "mfg_date", label: "Manufacturing Date", type: "date", required: true },
                { name: "exp_date", label: "Expiry Date", type: "date", required: true },
                { name: "cost_per_tab", label: "Cost per Tablet", type: "number", step: "0.01", required: true }
            ]
        },
        patient: {
            title: "Edit Patient",
            fields: [
                { name: "name", label: "Patient Name", type: "text", required: true },
                { name: "address", label: "Address", type: "textarea" },
                { name: "phone", label: "Phone", type: "text", required: true },
                { name: "email", label: "Email", type: "email" }
            ]
        },
        hospital: {
            title: "Edit Hospital",
            fields: [
                { name: "name", label: "Hospital Name", type: "text", required: true },
                { name: "address", label: "Address", type: "textarea" },
                { name: "phone", label: "Phone", type: "text" }
            ]
        },
        dealer: {
            title: "Edit Dealer",
            fields: [
                { name: "name", label: "Dealer Name", type: "text", required: true },
                { name: "address", label: "Address", type: "textarea" },
                { name: "phone", label: "Phone", type: "text" }
            ]
        },
        store: {
            title: "Edit Store",
            fields: [
                { name: "name", label: "Store Name", type: "text", required: true },
                { name: "address", label: "Address", type: "textarea" },
                { name: "contact", label: "Contact", type: "text" },
                { name: "store_man", label: "Manager", type: "text" },
                { name: "license_no", label: "License Number", type: "text" }
            ]
        },
        inventory: {
            title: "Update Stock",
            fields: [
                { name: "quantity", label: "Quantity", type: "number", required: true }
            ]
        }
    };

    const form = forms[type];
    if (!form) return;

    document.getElementById("modalTitle").textContent = form.title;

    let fieldsHtml = form.fields.map(f => {
        let value = data[f.name] || '';
        if (f.type === 'textarea') {
            return `
                <div class="form-group">
                    <label>${f.label}${f.required ? ' *' : ''}</label>
                    <textarea name="${f.name}" ${f.required ? 'required' : ''}>${value}</textarea>
                </div>
            `;
        }
        return `
            <div class="form-group">
                <label>${f.label}${f.required ? ' *' : ''}</label>
                <input name="${f.name}" type="${f.type}" value="${value}" ${f.step ? `step="${f.step}"` : ''} ${f.required ? 'required' : ''}>
            </div>
        `;
    }).join("");

    document.getElementById("formFields").innerHTML = fieldsHtml;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
    editMode = null;
    editId = null;
}

function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Determine endpoint and method
    let endpoint, method;

    if (editMode) {
        // Update
        if (editMode === "inventory") {
            endpoint = `${API_BASE}/inventory/${editId}`;
            method = "PUT";
        } else {
            endpoint = `${API_BASE}/${editMode}s/${editId}`;
            method = "PUT";
        }
    } else {
        // Create - determine type from current page
        const page = currentPage;
        endpoint = `${API_BASE}/${page}`;
        method = "POST";
    }

    fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, "error");
        } else {
            showMessage(result.message || "Operation successful!", "success");
            closeModal();
            navigateTo(currentPage);
        }
    })
    .catch(err => {
        showMessage("Error: " + err.message, "error");
    });
}

// ========================================
// Delete
// ========================================

let deleteType = null;
let deleteId = null;

function deleteRecord(type, id) {
    deleteType = type;
    deleteId = id;
    document.getElementById("deleteModal").classList.remove("hidden");

    document.getElementById("confirmDeleteBtn").onclick = () => confirmDelete();
}

function confirmDelete() {
    let endpoint;

    if (deleteType === "medicine") endpoint = `${API_BASE}/medicines/${deleteId}`;
    else if (deleteType === "patient") endpoint = `${API_BASE}/patients/${deleteId}`;
    else if (deleteType === "hospital") endpoint = `${API_BASE}/hospitals/${deleteId}`;
    else if (deleteType === "dealer") endpoint = `${API_BASE}/dealers/${deleteId}`;
    else if (deleteType === "store") endpoint = `${API_BASE}/stores/${deleteId}`;
    else if (deleteType === "doctor") {
        const [docId, hosId] = deleteId.split("/");
        endpoint = `${API_BASE}/doctors/${docId}/${hosId}`;
    }
    else if (deleteType === "transaction") {
        const [billId, patId, medId] = deleteId.split("/");
        endpoint = `${API_BASE}/transactions/${billId}/${patId}/${medId}`;
    }

    fetch(endpoint, { method: "DELETE" })
        .then(res => res.json())
        .then(result => {
            showMessage(result.message || "Deleted successfully!", "success");
            closeDeleteModal();
            navigateTo(currentPage);
        })
        .catch(err => {
            showMessage("Error: " + err.message, "error");
        });
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.add("hidden");
    deleteType = null;
    deleteId = null;
}

// ========================================
// Utilities
// ========================================

function showMessage(msg, type) {
    const container = document.getElementById("messageContainer");
    const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

    container.innerHTML = `
        <div class="message ${type}">
            <i class="fas ${icon}"></i>
            ${msg}
        </div>
    `;

    // Auto hide after 3 seconds
    setTimeout(() => {
        container.innerHTML = "";
    }, 3000);
}

function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName("tr");

    searchTerm = searchTerm.toLowerCase();

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let found = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].textContent.toLowerCase().indexOf(searchTerm) > -1) {
                found = true;
                break;
            }
        }

        rows[i].style.display = found ? "" : "none";
    }
}

// Global search
document.getElementById("globalSearch").addEventListener("keyup", (e) => {
    const term = e.target.value.toLowerCase();
    if (term.length < 2) return;

    // Search in current page table
    const activePage = document.querySelector(".page-content:not(.hidden)");
    if (activePage) {
        const table = activePage.querySelector("table tbody");
        if (table) {
            const rows = table.getElementsByTagName("tr");
            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName("td");
                let found = false;
                for (let j = 0; j < cells.length; j++) {
                    if (cells[j].textContent.toLowerCase().indexOf(term) > -1) {
                        found = true;
                        break;
                    }
                }
                rows[i].style.display = found ? "" : "none";
            }
        }
    }
});

// ========================================
// Advanced Analytics Dashboard
// ========================================

function loadAnalytics() {
    // 1. Fetch Top Medicines
    fetch(`${API_BASE}/analytics/top-medicines`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("topMedicinesTable");
            tbody.innerHTML = "";
            data.forEach(med => {
                tbody.innerHTML += `
                    <tr>
                        <td><strong>#${med.sales_rank}</strong></td>
                        <td>${med.name}</td>
                        <td>${med.total_sold} units</td>
                        <td style="color: green; font-weight: bold;">${formatINR(med.total_revenue)}</td>
                    </tr>`;
            });
        });

    // 2. Fetch Top Spending Patients
    fetch(`${API_BASE}/analytics/patient-spending`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("topPatientsTable");
            tbody.innerHTML = "";
            data.forEach(pat => {
                tbody.innerHTML += `
                    <tr>
                        <td><strong>#${pat.spending_rank}</strong></td>
                        <td>${pat.name}</td>
                        <td>${pat.visit_count}</td>
                        <td style="color: green; font-weight: bold;">${formatINR(pat.total_spent)}</td>
                    </tr>`;
            });
        });

    // 3. Monthly Revenue Trend
    fetch(`${API_BASE}/analytics/revenue-trend`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("revenueTrendTable");
            tbody.innerHTML = "";
            data.forEach(trend => {
                const isPositive = trend.revenue_change >= 0;
                const changeColor = isPositive ? "green" : "red";
                const changeIcon = isPositive ? "▲" : "▼";

                tbody.innerHTML += `
                    <tr>
                        <td>${trend.month}</td>
                        <td>${trend.total_bills}</td>
                        <td>${formatINR(trend.revenue)}</td>
                        <td style="color: ${changeColor};">
                            ${changeIcon} ${formatINR(Math.abs(trend.revenue_change))}
                        </td>
                    </tr>`;
            });
        });
}