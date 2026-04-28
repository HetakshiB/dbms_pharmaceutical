3# Pharmacy Management System

A comprehensive full-stack pharmacy management system built with MySQL, Node.js, and vanilla JavaScript. Manage medicines, inventory, patients, transactions, and more with full CRUD operations.

![PharmaFlow](https://img.shields.io/badge/Version-2.0-brightgreen)
![MySQL](https://img.shields.io/badge/Database-MySQL-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)

---

## 📋 Project Description

PharmaFlow is a robust Pharmacy Management System designed to streamline pharmaceutical operations. It provides complete control over medicine inventory, patient records, dealer management, hospital integrations, and billing transactions.

### Key Capabilities:
- **Medicine Management**: Add, edit, delete medicines with full tracking
- **Inventory Control**: Real-time stock management with low-stock alerts
- **Patient Records**: Complete patient database with purchase history
- **Billing System**: Automated bill generation with INR currency
- **Hospital Integration**: Manage contracts with hospitals and doctors
- **Dealer Management**: Track suppliers and supply chains

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| **CRUD Operations** | Full Create, Read, Update, Delete for all entities |
| **Inventory Management** | Automatic stock updates via database triggers |
| **Billing System** | Auto-calculated bills with INR currency (₹) |
| **Validation** | Stock check & expiry date validation before sales |
| **Reports** | Dashboard with sales stats, low-stock alerts |
| **Search** | Real-time filtering across all tables |

### Entities Managed
- 🏥 **Hospitals** - Hospital contracts and integrations
- 👨‍⚕️ **Doctors** - Doctor specialization and assignments
- 💊 **Medicines** - Medicine catalog with pricing
- 📦 **Inventory** - Stock levels across stores
- 👥 **Patients** - Patient records and history
- 🚚 **Dealers** - Supplier management
- 🏪 **Stores** - Pharmacy store management
- 🧾 **Transactions** - Sales and billing records

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Database** | MySQL 8.0 |
| **Backend** | Node.js + Express.js |
| **Frontend** | HTML5 + CSS3 + Vanilla JavaScript |
| **API** | RESTful JSON API |

---

## 🗄️ Database Structure

### Main Tables

| Table | Purpose |
|-------|---------|
| `MEDICINE` | Medicine catalog (name, composition, cost, expiry) |
| `PATIENT` | Patient records (name, phone, email, address) |
| `HOSPITAL` | Hospital information |
| `DOCTOR` | Doctor details with hospital associations |
| `DEALER` | Supplier/dealer information |
| `STORES` | Pharmacy store details |
| `TRANSACTIONS` | Sales/billing records |
| `QUANT` | Inventory stock (medicine + store) |
| `RETAIL` | Dealer supply records |
| `CONTRACT` | Hospital-Store contracts |
| `TREATMENT` | Patient treatment records |

### Advanced Tables
- `BATCH` - Batch tracking for medicines
- `PRESCRIPTION` - Patient prescriptions
- `PAYMENT` - Payment records
- `AUDIT_LOG` - System audit trail

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MySQL (v8.0+)
- npm or yarn

### Step 1: Clone & Navigate
```bash
cd your-project-folder
```

### Step 2: Setup MySQL Database
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS dbms_project;
USE dbms_project;

-- Run the SQL schema (located in SQL/Proj-INIT-IMPROVED.sql)
SOURCE SQL/Proj-INIT-IMPROVED.sql;

-- Load sample data
SOURCE SQL/Proj-INSERT-BULK.sql;
-- or use the procedural seed file
-- SOURCE SQL/Proj-SEED-TEST-DATA.sql;
```

### Step 3: Configure Database Connection
Set your MySQL credentials before starting the backend.

PowerShell:
```powershell
$env:DB_HOST="localhost"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="dbms_project"
```

You can also copy `backend/.env.example` into a local `.env`-style note for yourself, but do not commit real passwords to GitHub.

### Step 4: Install Dependencies
```bash
cd backend
npm install
```

### Step 5: Start Server
```bash
node server.js
```

Expected output:
```
🚀 Server running on http://localhost:3000
✅ Connected to MySQL
```

### Step 6: Open Application
Open your browser and navigate to:
```
http://localhost:3000
```

### Quick Run Order
```text
1. Run SQL/Proj-INIT-IMPROVED.sql
2. Run SQL/Proj-INSERT-BULK.sql
3. Start backend with node backend/server.js
4. Open http://localhost:3000
```

---

## 📖 Usage Guide

### Adding a Medicine
1. Click **Medicines** in the sidebar
2. Click **Add Medicine** button
3. Fill in: Name, Composition, Mfg Date, Expiry Date, Cost (INR)
4. Click **Save**

### Performing a Transaction
1. Click **Transactions** in the sidebar
2. Click **New Transaction**
3. Enter: Bill ID, Patient ID, Store ID, Medicine ID, Quantity, Date
4. System validates:
   - ✅ Sufficient stock available?
   - ✅ Medicine not expired?
5. Click **Save** - Stock automatically reduces

### Viewing Reports
1. **Dashboard**: Shows total sales, low-stock items, recent transactions
2. **Inventory**: View stock levels across all stores
3. **Low Stock Alert**: Items with <20 units highlighted in red

### Where New Records Appear
If you add a medicine from the frontend, it is inserted into the MySQL `MEDICINE` table of the `dbms_project` database through the backend API.

You can see the new row in:
1. The **Medicines** page in the app after refresh/reload.
2. **MySQL Workbench** by refreshing the schema or running:
```sql
USE dbms_project;
SELECT * FROM MEDICINE ORDER BY med_id DESC;
```

There is no separate sync step. If the backend is connected to MySQL, frontend changes are written directly to the database immediately.

### View Tables From Terminal
If `mysql` is not working from PATH, use the helper script in the project root:

```powershell
cd d:\pharamceutical
.\view-table.ps1 MEDICINE
.\view-table.ps1 HOSPITAL -Limit 20
.\view-table.ps1 PATIENT -Limit 5
.\view-table.ps1 TRANSACTIONS -Limit 15
```

Supported table names:
`MEDICINE`, `PATIENT`, `DEALER`, `STORES`, `HOSPITAL`, `DOCTOR`, `CONTRACT`, `RETAIL`, `TRANSACTIONS`, `QUANT`, `TREATMENT`, `PRESCRIPTION`, `BATCH`, `PAYMENT`, `AUDIT_LOG`

---

## GitHub Push

Before pushing:
1. Keep real database passwords out of tracked files.
2. Verify `node_modules`, shortcut files, and temporary files are not staged.
3. Review changes with `git status`.

Basic push flow:
```bash
git status
git add .
git commit -m "Update PharmaFlow project"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

If `origin` already exists:
```bash
git remote -v
git push -u origin main
```

---

## 💰 Currency

All monetary values are in **Indian Rupees (INR)**:
- Displayed as **₹** symbol
- Format: ₹1,234.56 (Indian numbering system)

---

## 📸 Screenshots

> Add your screenshots here:
> - Dashboard overview
> - Medicine list
> - Transaction form
> - Inventory management

---

## 🔧 Future Enhancements

Planned features:
- [ ] Payment gateway integration (UPI, Cards)
- [ ] Prescription management system
- [ ] Advanced analytics dashboard
- [ ] SMS/Email notifications
- [ ] Mobile app (React Native)
- [ ] Multi-store support
- [ ] Expiry alert system

---

## 📁 Project Structure

```
pharamceutical/
├── backend/
│   ├── server.js          # Express server with all APIs
│   └── package.json       # Node dependencies
├── frontend/
│   ├── dashboard.html    # Main UI
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── script.js     # Frontend logic
├── SQL/
│   ├── Proj-INIT-IMPROVED.sql  # Database schema
│   ├── Proj-INSERT-BULK.sql    # Sample data
│   └── Proj-QUERY.sql          # Sample queries
└── README.md
```

---

## 🤝 Credits

**Author**: PharmaFlow Development Team

**Database Schema**: Based on DBMS academic project requirements

**Technologies Used**:
- MySQL (Database)
- Node.js (Backend)
- Express.js (Framework)
- HTML/CSS/JS (Frontend)

---

## 📄 License

This project is for educational purposes.

---

*Last Updated: April 2026*
