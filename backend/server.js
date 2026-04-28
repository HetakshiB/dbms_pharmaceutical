const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "dbms_project"
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL");
});

// ============================================================
// DASHBOARD STATS API
// ============================================================

app.get("/api/stats", (req, res) => {
    const queries = {
        totalMedicines: "SELECT COUNT(*) as count FROM MEDICINE",
        totalStores: "SELECT COUNT(*) as count FROM STORES",
        totalDealers: "SELECT COUNT(*) as count FROM DEALER",
        totalPatients: "SELECT COUNT(*) as count FROM PATIENT",
        totalHospitals: "SELECT COUNT(*) as count FROM HOSPITAL",
        totalDoctors: "SELECT COUNT(*) as count FROM DOCTOR",
        totalSales: "SELECT COALESCE(SUM(total), 0) as total FROM TRANSACTIONS",
        lowStock: "SELECT COUNT(*) as count FROM QUANT WHERE quantity < 20"
    };

    let results = {};
    let completed = 0;
    const keys = Object.keys(queries);

    keys.forEach(key => {
        db.query(queries[key], (err, result) => {
            if (!err) results[key] = result[0].count;
            completed++;
            if (completed === keys.length) res.json(results);
        });
    });
});

// ============================================================
// MEDICINE CRUD APIs
// ============================================================

// GET all medicines
app.get("/api/medicines", (req, res) => {
    db.query("SELECT * FROM MEDICINE ORDER BY med_id DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// GET single medicine
app.get("/api/medicines/:id", (req, res) => {
    db.query("SELECT * FROM MEDICINE WHERE med_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0] || null);
    });
});

// CREATE medicine
app.post("/api/medicines", (req, res) => {
    const { name, composition, mfg_date, exp_date, cost_per_tab } = req.body;
    
    if (!name || !mfg_date || !exp_date || !cost_per_tab) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "INSERT INTO MEDICINE (name, composition, mfg_date, exp_date, cost_per_tab) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, composition, mfg_date, exp_date, cost_per_tab], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Medicine added successfully", id: result.insertId });
    });
});

// UPDATE medicine
app.put("/api/medicines/:id", (req, res) => {
    const { name, composition, mfg_date, exp_date, cost_per_tab } = req.body;
    const sql = "UPDATE MEDICINE SET name = ?, composition = ?, mfg_date = ?, exp_date = ?, cost_per_tab = ? WHERE med_id = ?";
    
    db.query(sql, [name, composition, mfg_date, exp_date, cost_per_tab, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Medicine updated successfully" });
    });
});

// DELETE medicine
app.delete("/api/medicines/:id", (req, res) => {
    db.query("DELETE FROM MEDICINE WHERE med_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Medicine deleted successfully" });
    });
});

// ============================================================
// PATIENT CRUD APIs
// ============================================================

app.get("/api/patients", (req, res) => {
    db.query("SELECT * FROM PATIENT ORDER BY pat_id DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.get("/api/patients/:id", (req, res) => {
    db.query("SELECT * FROM PATIENT WHERE pat_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0] || null);
    });
});

app.post("/api/patients", (req, res) => {
    const { name, address, phone, email } = req.body;
    
    if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone are required" });
    }

    const sql = "INSERT INTO PATIENT (name, address, phone, email) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, address, phone, email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Patient added successfully", id: result.insertId });
    });
});

app.put("/api/patients/:id", (req, res) => {
    const { name, address, phone, email } = req.body;
    const sql = "UPDATE PATIENT SET name = ?, address = ?, phone = ?, email = ? WHERE pat_id = ?";
    
    db.query(sql, [name, address, phone, email, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Patient updated successfully" });
    });
});

app.delete("/api/patients/:id", (req, res) => {
    db.query("DELETE FROM PATIENT WHERE pat_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Patient deleted successfully" });
    });
});

// ============================================================
// HOSPITAL CRUD APIs
// ============================================================

app.get("/api/hospitals", (req, res) => {
    db.query("SELECT * FROM HOSPITAL ORDER BY hos_id", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.get("/api/hospitals/:id", (req, res) => {
    db.query("SELECT * FROM HOSPITAL WHERE hos_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0] || null);
    });
});

app.post("/api/hospitals", (req, res) => {
    const { hos_id, name, address, phone } = req.body;
    
    if (!hos_id || !name) {
        return res.status(400).json({ error: "Hospital ID and name are required" });
    }

    const sql = "INSERT INTO HOSPITAL (hos_id, name, address, phone) VALUES (?, ?, ?, ?)";
    db.query(sql, [hos_id, name, address, phone], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Hospital added successfully" });
    });
});

app.put("/api/hospitals/:id", (req, res) => {
    const { name, address, phone } = req.body;
    const sql = "UPDATE HOSPITAL SET name = ?, address = ?, phone = ? WHERE hos_id = ?";
    
    db.query(sql, [name, address, phone, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Hospital updated successfully" });
    });
});

app.delete("/api/hospitals/:id", (req, res) => {
    db.query("DELETE FROM HOSPITAL WHERE hos_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Hospital deleted successfully" });
    });
});

// ============================================================
// DEALER CRUD APIs
// ============================================================

app.get("/api/dealers", (req, res) => {
    db.query("SELECT * FROM DEALER ORDER BY dealer_id DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.post("/api/dealers", (req, res) => {
    const { name, address, phone } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: "Dealer name is required" });
    }

    const sql = "INSERT INTO DEALER (name, address, phone) VALUES (?, ?, ?)";
    db.query(sql, [name, address, phone], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Dealer added successfully", id: result.insertId });
    });
});

app.put("/api/dealers/:id", (req, res) => {
    const { name, address, phone } = req.body;
    const sql = "UPDATE DEALER SET name = ?, address = ?, phone = ? WHERE dealer_id = ?";
    
    db.query(sql, [name, address, phone, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Dealer updated successfully" });
    });
});

app.delete("/api/dealers/:id", (req, res) => {
    db.query("DELETE FROM DEALER WHERE dealer_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Dealer deleted successfully" });
    });
});

// ============================================================
// STORES CRUD APIs
// ============================================================

app.get("/api/stores", (req, res) => {
    db.query("SELECT * FROM STORES ORDER BY store_id", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.post("/api/stores", (req, res) => {
    const { store_id, name, address, contact, store_man, license_no } = req.body;
    
    if (!store_id || !name) {
        return res.status(400).json({ error: "Store ID and name are required" });
    }

    const sql = "INSERT INTO STORES (store_id, name, address, contact, store_man, license_no) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [store_id, name, address, contact, store_man, license_no], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Store added successfully" });
    });
});

app.put("/api/stores/:id", (req, res) => {
    const { name, address, contact, store_man, license_no } = req.body;
    const sql = "UPDATE STORES SET name = ?, address = ?, contact = ?, store_man = ?, license_no = ? WHERE store_id = ?";
    
    db.query(sql, [name, address, contact, store_man, license_no, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Store updated successfully" });
    });
});

app.delete("/api/stores/:id", (req, res) => {
    db.query("DELETE FROM STORES WHERE store_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Store deleted successfully" });
    });
});

// ============================================================
// DOCTOR CRUD APIs
// ============================================================

app.get("/api/doctors", (req, res) => {
    db.query("SELECT * FROM DOCTOR ORDER BY doc_id, hos_id", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.post("/api/doctors", (req, res) => {
    const { doc_id, hos_id, doc_name, specialization } = req.body;
    
    if (!doc_id || !hos_id || !doc_name) {
        return res.status(400).json({ error: "Doctor ID, Hospital ID and name are required" });
    }

    const sql = "INSERT INTO DOCTOR (doc_id, hos_id, doc_name, specialization) VALUES (?, ?, ?, ?)";
    db.query(sql, [doc_id, hos_id, doc_name, specialization], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Doctor added successfully" });
    });
});

app.put("/api/doctors/:id/:hosId", (req, res) => {
    const { doc_name, specialization } = req.body;
    const sql = "UPDATE DOCTOR SET doc_name = ?, specialization = ? WHERE doc_id = ? AND hos_id = ?";
    
    db.query(sql, [doc_name, specialization, req.params.id, req.params.hosId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Doctor updated successfully" });
    });
});

app.delete("/api/doctors/:id/:hosId", (req, res) => {
    db.query("DELETE FROM DOCTOR WHERE doc_id = ? AND hos_id = ?", [req.params.id, req.params.hosId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Doctor deleted successfully" });
    });
});

// ============================================================
// TRANSACTIONS CRUD APIs (with business logic)
// ============================================================

app.get("/api/transactions", (req, res) => {
    const sql = `
        SELECT T.*, M.name as med_name, P.name as pat_name, S.name as store_name 
        FROM TRANSACTIONS T 
        LEFT JOIN MEDICINE M ON T.med_id = M.med_id 
        LEFT JOIN PATIENT P ON T.pat_id = P.pat_id 
        LEFT JOIN STORES S ON T.store_id = S.store_id
        ORDER BY T.pur_date DESC, T.bill_id DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// CREATE transaction with validation
app.post("/api/transactions", (req, res) => {
    const { bill_id, pat_id, store_id, med_id, quantity, pur_date } = req.body;
    
    // Validate required fields
    if (!bill_id || !pat_id || !store_id || !med_id || !quantity || !pur_date) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check stock availability
    const checkStock = "SELECT quantity FROM QUANT WHERE med_id = ? AND store_id = ?";
    db.query(checkStock, [med_id, store_id], (err, stockResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const availableStock = stockResult.length > 0 ? stockResult[0].quantity : 0;
        
        if (availableStock < quantity) {
            return res.status(400).json({ error: `Insufficient stock! Available: ${availableStock}` });
        }

        // Check medicine expiry
        const checkExpiry = "SELECT exp_date, cost_per_tab FROM MEDICINE WHERE med_id = ?";
        db.query(checkExpiry, [med_id], (err, medResult) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const expDate = new Date(medResult[0].exp_date);
            const today = new Date();
            
            if (expDate < today) {
                return res.status(400).json({ error: "Cannot sell expired medicine!" });
            }

            const total = quantity * medResult[0].cost_per_tab;

            // Insert transaction
            const insertSql = "INSERT INTO TRANSACTIONS (bill_id, pat_id, store_id, med_id, quantity, pur_date, total) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db.query(insertSql, [bill_id, pat_id, store_id, med_id, quantity, pur_date, total], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                
                // Update stock (subtract quantity)
                const updateStock = "UPDATE QUANT SET quantity = quantity - ? WHERE med_id = ? AND store_id = ?";
                db.query(updateStock, [quantity, med_id, store_id], (err) => {
                    if (err) console.error("Stock update error:", err);
                });
                
                res.json({ message: "Transaction completed successfully!", total });
            });
        });
    });
});

app.delete("/api/transactions/:billId/:patId/:medId", (req, res) => {
    const { billId, patId, medId } = req.params;
    
    // First get the transaction to restore stock
    db.query("SELECT * FROM TRANSACTIONS WHERE bill_id = ? AND pat_id = ? AND med_id = ?", 
        [billId, patId, medId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Transaction not found" });
        
        const trans = result[0];
        
        // Restore stock
        db.query("UPDATE QUANT SET quantity = quantity + ? WHERE med_id = ? AND store_id = ?",
            [trans.quantity, trans.med_id, trans.store_id], (err) => {
            if (err) console.error("Stock restore error:", err);
        });
        
        // Delete transaction
        db.query("DELETE FROM TRANSACTIONS WHERE bill_id = ? AND pat_id = ? AND med_id = ?",
            [billId, patId, medId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Transaction deleted successfully" });
        });
    });
});

// ============================================================
// INVENTORY (QUANT) APIs
// ============================================================

app.get("/api/inventory", (req, res) => {
    const sql = `
        SELECT Q.*, M.name as med_name, M.cost_per_tab, M.exp_date, S.name as store_name
        FROM QUANT Q
        LEFT JOIN MEDICINE M ON Q.med_id = M.med_id
        LEFT JOIN STORES S ON Q.store_id = S.store_id
        ORDER BY Q.quantity ASC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Update stock manually
app.put("/api/inventory/:medId/:storeId", (req, res) => {
    const { quantity } = req.body;
    const sql = "UPDATE QUANT SET quantity = ? WHERE med_id = ? AND store_id = ?";
    
    db.query(sql, [quantity, req.params.medId, req.params.storeId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Stock updated successfully" });
    });
});

// ============================================================
// LOW STOCK ALERT
// ============================================================

app.get("/api/low-stock", (req, res) => {
    const sql = `
        SELECT Q.*, M.name as med_name, S.name as store_name
        FROM QUANT Q
        LEFT JOIN MEDICINE M ON Q.med_id = M.med_id
        LEFT JOIN STORES S ON Q.store_id = S.store_id
        WHERE Q.quantity < 20
        ORDER BY Q.quantity ASC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// ============================================================
// SEARCH APIs
// ============================================================

app.get("/api/search/medicines", (req, res) => {
    const query = req.query.q || "";
    const sql = "SELECT * FROM MEDICINE WHERE name LIKE ? OR composition LIKE ?";
    db.query(sql, [`%${query}%`, `%${query}%`], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.get("/api/search/patients", (req, res) => {
    const query = req.query.q || "";
    const sql = "SELECT * FROM PATIENT WHERE name LIKE ? OR phone LIKE ?";
    db.query(sql, [`%${query}%`, `%${query}%`], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// ============================================================
// Default route
// ============================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

// Start server
app.listen(PORT, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
