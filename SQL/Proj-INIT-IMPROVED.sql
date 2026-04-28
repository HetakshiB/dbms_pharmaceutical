-- =============================================================
-- PHARMAFLOW: Enhanced & Optimized Schema
-- Pharmacy Management System — Advanced DBMS Project
-- Version 2.0 - With Performance Optimizations
-- =============================================================

CREATE DATABASE IF NOT EXISTS dbms_project;
USE dbms_project;

SET SQL_SAFE_UPDATES = 0;

-- =============================================================
-- CLEANUP: Drop existing objects in correct order
-- =============================================================

-- Drop triggers
DROP TRIGGER IF EXISTS sub_quant;
DROP TRIGGER IF EXISTS add_quant;
DROP TRIGGER IF EXISTS check_expiry_before_sale;
DROP TRIGGER IF EXISTS check_stock_before_sale;
DROP TRIGGER IF EXISTS calc_total_before_insert;
DROP TRIGGER IF EXISTS low_stock_alert;
DROP TRIGGER IF EXISTS prevent_negative_stock;
DROP TRIGGER IF EXISTS auto_update_batch_quantity;
DROP TRIGGER IF EXISTS log_prescription_insert;
DROP TRIGGER IF EXISTS update_payment_status;

-- Drop procedures
DROP PROCEDURE IF EXISTS sp_generate_bill;
DROP PROCEDURE IF EXISTS sp_restock;
DROP PROCEDURE IF EXISTS sp_expiring_soon;
DROP PROCEDURE IF EXISTS sp_add_transaction;
DROP PROCEDURE IF EXISTS sp_update_stock;
DROP PROCEDURE IF EXISTS sp_low_stock_report;
DROP PROCEDURE IF EXISTS sp_patient_analysis;

-- Drop views
DROP VIEW IF EXISTS v_store_inventory;
DROP VIEW IF EXISTS v_monthly_revenue;
DROP VIEW IF EXISTS v_patient_history;
DROP VIEW IF EXISTS v_store_sales;
DROP VIEW IF EXISTS v_daily_transactions;
DROP VIEW IF EXISTS v_low_stock;
DROP VIEW IF EXISTS v_expired_medicines;
DROP VIEW IF EXISTS v_dealer_performance;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS AUDIT_LOG;
DROP TABLE IF EXISTS PAYMENT;
DROP TABLE IF EXISTS PRESCRIPTION;
DROP TABLE IF EXISTS BATCH;
DROP TABLE IF EXISTS TRANSACTIONS;
DROP TABLE IF EXISTS RETAIL;
DROP TABLE IF EXISTS QUANT;
DROP TABLE IF EXISTS TREATMENT;
DROP TABLE IF EXISTS CONTRACT;
DROP TABLE IF EXISTS DOCTOR;
DROP TABLE IF EXISTS PATIENT;
DROP TABLE IF EXISTS DEALER;
DROP TABLE IF EXISTS STORES;
DROP TABLE IF EXISTS HOSPITAL;
DROP TABLE IF EXISTS MEDICINE;

SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================
-- CORE TABLES
-- =============================================================

-- Currency: Indian Rupees (INR ₹)
-- All monetary values are in INR

CREATE TABLE MEDICINE(
    med_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    composition VARCHAR(100),
    mfg_date DATE NOT NULL,
    exp_date DATE NOT NULL,
    cost_per_tab DECIMAL(8,2) NOT NULL CHECK(cost_per_tab > 0),  -- Cost in INR
    CHECK(exp_date > mfg_date),
    CHECK(mfg_date >= '2018-01-01')
);


CREATE TABLE STORES(
    store_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100),
    contact VARCHAR(20),
    store_man VARCHAR(50),
    license_no VARCHAR(30)
);


CREATE TABLE DEALER(
    dealer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    address VARCHAR(100),
    phone VARCHAR(20)
);


CREATE TABLE HOSPITAL(
    hos_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50),
    address VARCHAR(100),
    phone VARCHAR(20)
);


CREATE TABLE CONTRACT(
    contract_id VARCHAR(20) UNIQUE,
    hos_id VARCHAR(20),
    store_id VARCHAR(20),
    PRIMARY KEY(hos_id, store_id),
    FOREIGN KEY(hos_id) REFERENCES HOSPITAL(hos_id),
    FOREIGN KEY(store_id) REFERENCES STORES(store_id)
);


CREATE TABLE DOCTOR(
    doc_id INT,
    hos_id VARCHAR(20),
    doc_name VARCHAR(50),
    specialization VARCHAR(50),
    PRIMARY KEY(doc_id, hos_id),
    FOREIGN KEY(hos_id) REFERENCES HOSPITAL(hos_id)
);


CREATE TABLE PATIENT(
    pat_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100),
    phone VARCHAR(20) NOT NULL CHECK(phone REGEXP '^[0-9]{10,15}$'),
    email VARCHAR(100) CHECK(email IS NULL OR email LIKE '%_@__%.__%')
);


CREATE TABLE RETAIL(
    retail_id VARCHAR(20),
    med_id INT,
    store_id VARCHAR(20),
    dealer_id INT,
    batchno INT,
    quantity_supplied INT,
    supply_date DATE DEFAULT (CURRENT_DATE),
    PRIMARY KEY(retail_id, med_id, store_id, dealer_id),
    CHECK(quantity_supplied <= 500),
    FOREIGN KEY(med_id) REFERENCES MEDICINE(med_id) ON DELETE CASCADE,
    FOREIGN KEY(store_id) REFERENCES STORES(store_id) ON DELETE CASCADE,
    FOREIGN KEY(dealer_id) REFERENCES DEALER(dealer_id) ON DELETE CASCADE
);


CREATE TABLE TRANSACTIONS(
    bill_id INT,
    pat_id INT NOT NULL,
    store_id VARCHAR(20) NOT NULL,
    med_id INT NOT NULL,
    quantity INT NOT NULL CHECK(quantity > 0),
    pur_date DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL CHECK(total > 0),  -- Total in INR
    PRIMARY KEY(bill_id, pat_id, med_id),
    CHECK(quantity <= 150),
    FOREIGN KEY(pat_id) REFERENCES PATIENT(pat_id) ON DELETE CASCADE,
    FOREIGN KEY(med_id) REFERENCES MEDICINE(med_id) ON DELETE CASCADE,
    FOREIGN KEY(store_id) REFERENCES STORES(store_id) ON DELETE CASCADE
);


CREATE TABLE QUANT(
    med_id INT,
    store_id VARCHAR(20),
    quantity INT,
    PRIMARY KEY(med_id, store_id),
    FOREIGN KEY(med_id) REFERENCES MEDICINE(med_id),
    FOREIGN KEY(store_id) REFERENCES STORES(store_id)
);


CREATE TABLE TREATMENT(
    treat_id INT,
    pat_id INT,
    hos_id VARCHAR(20),
    doc_id INT,
    treat_date DATE,
    diagnosis VARCHAR(200),
    PRIMARY KEY(treat_id, pat_id, hos_id, doc_id),
    FOREIGN KEY(pat_id) REFERENCES PATIENT(pat_id),
    FOREIGN KEY(hos_id) REFERENCES HOSPITAL(hos_id),
    FOREIGN KEY(doc_id, hos_id) REFERENCES DOCTOR(doc_id, hos_id)
);


-- =============================================================
-- NEW TABLES (Advanced Features)
-- =============================================================

CREATE TABLE PRESCRIPTION(
    presc_id INT AUTO_INCREMENT PRIMARY KEY,
    treat_id INT NOT NULL,
    pat_id INT NOT NULL,
    med_id INT NOT NULL,
    dosage VARCHAR(50),
    duration_days INT,
    presc_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY(pat_id) REFERENCES PATIENT(pat_id),
    FOREIGN KEY(med_id) REFERENCES MEDICINE(med_id)
);


CREATE TABLE BATCH(
    batch_id INT AUTO_INCREMENT PRIMARY KEY,
    med_id INT NOT NULL,
    batch_no VARCHAR(20) NOT NULL,
    mfg_date DATE NOT NULL,
    exp_date DATE NOT NULL,
    quantity INT NOT NULL,
    dealer_id INT NOT NULL,
    FOREIGN KEY(med_id) REFERENCES MEDICINE(med_id),
    FOREIGN KEY(dealer_id) REFERENCES DEALER(dealer_id)
);


CREATE TABLE PAYMENT(
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    pat_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,  -- Amount in INR
    payment_mode ENUM('CASH','CARD','UPI','INSURANCE') DEFAULT 'CASH',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PAID','PENDING','REFUNDED') DEFAULT 'PAID'
);


CREATE TABLE AUDIT_LOG(
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50),
    action_type ENUM('INSERT','UPDATE','DELETE'),
    record_id VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(50)
);

ALTER TABLE MEDICINE AUTO_INCREMENT = 1000;
ALTER TABLE DEALER AUTO_INCREMENT = 1000;
ALTER TABLE PRESCRIPTION AUTO_INCREMENT = 1000;
ALTER TABLE BATCH AUTO_INCREMENT = 1000;
ALTER TABLE PAYMENT AUTO_INCREMENT = 1000;
ALTER TABLE AUDIT_LOG AUTO_INCREMENT = 1000;


-- =============================================================
-- TRIGGERS (Advanced Business Logic)
-- =============================================================

DELIMITER //

-- =============================================================
-- TRIGGER 1: Auto-add stock when dealer supplies medicine
-- Purpose: Automate inventory update on new supply
-- =============================================================
CREATE TRIGGER add_quant
AFTER INSERT ON RETAIL
FOR EACH ROW
BEGIN
    INSERT INTO QUANT(med_id, store_id, quantity)
    VALUES(NEW.med_id, NEW.store_id, NEW.quantity_supplied)
    ON DUPLICATE KEY UPDATE
    quantity = quantity + NEW.quantity_supplied;
END//


-- =============================================================
-- TRIGGER 2: Prevent selling expired medicine
-- Purpose: Ensure medication safety compliance
-- =============================================================
CREATE TRIGGER check_expiry_before_sale
BEFORE INSERT ON TRANSACTIONS
FOR EACH ROW
BEGIN
    DECLARE exp DATE;
    SELECT exp_date INTO exp FROM MEDICINE WHERE med_id = NEW.med_id;
    IF exp < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot sell expired medicine!';
    END IF;
END//


-- =============================================================
-- TRIGGER 3: Validate stock & auto-calculate total, then subtract
-- Purpose: Ensure sufficient stock and automatic pricing
-- =============================================================
CREATE TRIGGER calc_and_validate_sale
BEFORE INSERT ON TRANSACTIONS
FOR EACH ROW
BEGIN
    DECLARE avail INT DEFAULT 0;
    DECLARE price DECIMAL(8,2);

    -- Check stock
    SELECT quantity INTO avail FROM QUANT
    WHERE med_id = NEW.med_id AND store_id = NEW.store_id;

    IF avail IS NULL OR NEW.quantity > avail THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock for this transaction!';
    END IF;

    -- Auto-calculate total
    SELECT cost_per_tab INTO price FROM MEDICINE WHERE med_id = NEW.med_id;
    SET NEW.total = NEW.quantity * price;
END//


-- =============================================================
-- TRIGGER 4: Subtract quantity after sale
-- Purpose: Maintain accurate inventory after each transaction
-- =============================================================
CREATE TRIGGER sub_quant
AFTER INSERT ON TRANSACTIONS
FOR EACH ROW
BEGIN
    UPDATE QUANT
    SET quantity = quantity - NEW.quantity
    WHERE med_id = NEW.med_id
    AND store_id = NEW.store_id;
END//


-- =============================================================
-- TRIGGER 5: Low stock alert in audit log
-- Purpose: Alert when inventory falls below threshold
-- =============================================================
CREATE TRIGGER low_stock_alert
AFTER UPDATE ON QUANT
FOR EACH ROW
BEGIN
    IF NEW.quantity < 20 THEN
        INSERT INTO AUDIT_LOG(table_name, action_type, record_id, new_value)
        VALUES('QUANT', 'UPDATE',
               CONCAT(NEW.med_id, '-', NEW.store_id),
               CONCAT('LOW STOCK ALERT: Only ', NEW.quantity, ' units remaining'));
    END IF;
END//


-- =============================================================
-- TRIGGER 6: Prevent negative stock
-- Purpose: Data integrity - ensure stock never goes negative
-- =============================================================
CREATE TRIGGER prevent_negative_stock
BEFORE UPDATE ON QUANT
FOR EACH ROW
BEGIN
    IF NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock cannot be negative!';
    END IF;
END//


-- =============================================================
-- TRIGGER 7: Auto-update batch quantity on retail insert
-- Purpose: Track inventory at batch level for expiry tracking
-- =============================================================
CREATE TRIGGER auto_update_batch_quantity
AFTER INSERT ON RETAIL
FOR EACH ROW
BEGIN
    UPDATE BATCH
    SET quantity = quantity + NEW.quantity_supplied
    WHERE med_id = NEW.med_id
    AND batch_no = NEW.batchno;
END//


-- =============================================================
-- TRIGGER 8: Log prescription insertions for audit
-- Purpose: Track prescription history for compliance
-- =============================================================
CREATE TRIGGER log_prescription_insert
AFTER INSERT ON PRESCRIPTION
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOG(table_name, action_type, record_id, new_value, changed_by)
    VALUES('PRESCRIPTION', 'INSERT', NEW.presc_id,
           CONCAT('Prescribed MedID: ', NEW.med_id, ' for PatID: ', NEW.pat_id),
           CURRENT_USER());
END//


-- =============================================================
-- TRIGGER 9: Update payment status on transaction insert
-- Purpose: Auto-create payment record when transaction occurs
-- =============================================================
CREATE TRIGGER update_payment_status
AFTER INSERT ON TRANSACTIONS
FOR EACH ROW
BEGIN
    INSERT INTO PAYMENT(bill_id, pat_id, amount, payment_mode, status)
    VALUES(NEW.bill_id, NEW.pat_id, NEW.total, 'CASH', 'PAID');
END//

DELIMITER ;


-- =============================================================
-- VIEWS (Business Intelligence & Reporting)
-- =============================================================

-- ========================
-- View 1: Store inventory with stock status
-- Purpose: Quick inventory overview across all stores
-- ========================
CREATE VIEW v_store_inventory AS
SELECT S.store_id, S.name AS store_name, M.name AS medicine,
       Q.quantity, M.exp_date,
       CASE
           WHEN Q.quantity < 20 THEN 'CRITICAL'
           WHEN Q.quantity < 50 THEN 'LOW'
           ELSE 'OK'
       END AS stock_status
FROM QUANT Q
JOIN STORES S ON Q.store_id = S.store_id
JOIN MEDICINE M ON Q.med_id = M.med_id;


-- ========================
-- View 2: Monthly revenue per store
-- Purpose: Financial reporting and trend analysis
-- ========================
CREATE VIEW v_monthly_revenue AS
SELECT S.store_id, S.name AS store_name,
       DATE_FORMAT(T.pur_date, '%Y-%m') AS month,
       COUNT(*) AS total_bills,
       SUM(T.total) AS revenue
FROM TRANSACTIONS T
JOIN STORES S ON T.store_id = S.store_id
GROUP BY S.store_id, S.name, DATE_FORMAT(T.pur_date, '%Y-%m');


-- ========================
-- View 3: Patient purchase history
-- Purpose: Customer relationship management
-- ========================
CREATE VIEW v_patient_history AS
SELECT P.pat_id, P.name AS patient, M.name AS medicine,
       T.quantity, T.total, T.pur_date, S.name AS store
FROM TRANSACTIONS T
JOIN PATIENT P ON T.pat_id = P.pat_id
JOIN MEDICINE M ON T.med_id = M.med_id
JOIN STORES S ON T.store_id = S.store_id;


-- ========================
-- View 4: Store sales summary
-- Purpose: Daily sales performance by store
-- ========================
CREATE VIEW v_store_sales AS
SELECT 
    T.store_id,
    S.name AS store_name,
    COUNT(DISTINCT T.bill_id) AS total_transactions,
    COUNT(DISTINCT T.pat_id) AS unique_customers,
    SUM(T.quantity) AS total_items_sold,
    SUM(T.total) AS total_revenue,
    AVG(T.total) AS avg_transaction_value,
    MIN(T.pur_date) AS first_sale_date,
    MAX(T.pur_date) AS last_sale_date
FROM TRANSACTIONS T
JOIN STORES S ON T.store_id = S.store_id
GROUP BY T.store_id, S.name;


-- ========================
-- View 5: Daily transactions
-- Purpose: Daily operational reporting
-- ========================
CREATE VIEW v_daily_transactions AS
SELECT 
    T.pur_date AS transaction_date,
    COUNT(*) AS total_transactions,
    SUM(T.total) AS daily_revenue,
    COUNT(DISTINCT T.pat_id) AS customers_served,
    COUNT(DISTINCT T.med_id) AS unique_medicines_sold
FROM TRANSACTIONS T
GROUP BY T.pur_date
ORDER BY T.pur_date DESC;


-- ========================
-- View 6: Low stock items
-- Purpose: Inventory replenishment alerts
-- ========================
CREATE VIEW v_low_stock AS
SELECT 
    M.med_id,
    M.name AS medicine_name,
    S.store_id,
    S.name AS store_name,
    Q.quantity AS current_stock,
    M.exp_date,
    DATEDIFF(M.exp_date, CURDATE()) AS days_until_expiry
FROM QUANT Q
JOIN MEDICINE M ON Q.med_id = M.med_id
JOIN STORES S ON Q.store_id = S.store_id
WHERE Q.quantity < 50
ORDER BY Q.quantity ASC, M.exp_date ASC;


-- ========================
-- View 7: Expired medicines
-- Purpose: Identify expired stock for removal
-- ========================
CREATE VIEW v_expired_medicines AS
SELECT 
    M.med_id,
    M.name AS medicine_name,
    M.exp_date,
    DATEDIFF(CURDATE(), M.exp_date) AS days_expired,
    Q.quantity AS stock_quantity,
    Q.store_id,
    S.name AS store_name
FROM MEDICINE M
JOIN QUANT Q ON M.med_id = Q.med_id
JOIN STORES S ON Q.store_id = S.store_id
WHERE M.exp_date < CURDATE()
ORDER BY M.exp_date ASC;


-- ========================
-- View 8: Dealer performance
-- Purpose: Supplier evaluation and analytics
-- ========================
CREATE VIEW v_dealer_performance AS
SELECT 
    D.dealer_id,
    D.name AS dealer_name,
    COUNT(DISTINCT R.retail_id) AS total_supply_orders,
    SUM(R.quantity_supplied) AS total_quantity_supplied,
    COUNT(DISTINCT R.med_id) AS unique_medicines_supplied,
    MIN(R.supply_date) AS first_supply_date,
    MAX(R.supply_date) AS last_supply_date
FROM DEALER D
LEFT JOIN RETAIL R ON D.dealer_id = R.dealer_id
GROUP BY D.dealer_id, D.name;


-- =============================================================
-- STORED PROCEDURES (Business Logic Encapsulation)
-- =============================================================

DELIMITER //

-- ========================
-- Procedure 1: Generate detailed bill
-- Purpose: Retrieve complete bill details for customer
-- ========================
CREATE PROCEDURE sp_generate_bill(IN p_bill_id INT, IN p_pat_id INT)
BEGIN
    SELECT T.bill_id, P.name AS patient, M.name AS medicine,
           T.quantity, M.cost_per_tab AS unit_price, T.total,
           T.pur_date, S.name AS store
    FROM TRANSACTIONS T
    JOIN PATIENT P ON T.pat_id = P.pat_id
    JOIN MEDICINE M ON T.med_id = M.med_id
    JOIN STORES S ON T.store_id = S.store_id
    WHERE T.bill_id = p_bill_id AND T.pat_id = p_pat_id;

    SELECT SUM(total) AS grand_total
    FROM TRANSACTIONS
    WHERE bill_id = p_bill_id AND pat_id = p_pat_id;
END//


-- ========================
-- Procedure 2: Get medicines expiring within N days
-- Purpose: Inventory rotation and expiry management
-- ========================
CREATE PROCEDURE sp_expiring_soon(IN p_days INT)
BEGIN
    SELECT M.med_id, M.name, M.exp_date,
           DATEDIFF(M.exp_date, CURDATE()) AS days_remaining,
           Q.store_id, Q.quantity
    FROM MEDICINE M
    JOIN QUANT Q ON M.med_id = Q.med_id
    WHERE M.exp_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL p_days DAY)
    ORDER BY M.exp_date ASC;
END//


-- ========================
-- Procedure 3: Add new transaction with stock validation
-- Purpose: Centralized transaction entry with business rules
-- ========================
CREATE PROCEDURE sp_add_transaction(
    IN p_bill_id INT,
    IN p_pat_id INT,
    IN p_store_id VARCHAR(20),
    IN p_med_id INT,
    IN p_quantity INT,
    IN p_pur_date DATE
)
BEGIN
    DECLARE avail INT DEFAULT 0;
    DECLARE price DECIMAL(8,2);
    DECLARE total_amount DECIMAL(10,2);

    -- Check stock availability
    SELECT quantity INTO avail FROM QUANT
    WHERE med_id = p_med_id AND store_id = p_store_id;

    IF avail IS NULL OR p_quantity > avail THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock for this transaction!';
    END IF;

    -- Get unit price
    SELECT cost_per_tab INTO price FROM MEDICINE WHERE med_id = p_med_id;
    SET total_amount = p_quantity * price;

    -- Insert transaction
    INSERT INTO TRANSACTIONS(bill_id, pat_id, store_id, med_id, quantity, pur_date, total)
    VALUES(p_bill_id, p_pat_id, p_store_id, p_med_id, p_quantity, p_pur_date, total_amount);

    -- Stock will be reduced by trigger
    SELECT 'Transaction added successfully' AS message, total_amount AS total;
END//


-- ========================
-- Procedure 4: Update stock manually
-- Purpose: Stock adjustment for inventory management
-- ========================
CREATE PROCEDURE sp_update_stock(
    IN p_med_id INT,
    IN p_store_id VARCHAR(20),
    IN p_quantity INT,
    IN p_operation ENUM('ADD', 'SET')
)
BEGIN
    IF p_operation = 'SET' THEN
        UPDATE QUANT SET quantity = p_quantity
        WHERE med_id = p_med_id AND store_id = p_store_id;
    ELSE
        UPDATE QUANT SET quantity = quantity + p_quantity
        WHERE med_id = p_med_id AND store_id = p_store_id;
    END IF;

    SELECT p_med_id AS med_id, p_store_id AS store_id, 
           p_quantity AS quantity_changed, p_operation AS operation;
END//


-- ========================
-- Procedure 5: Low stock report
-- Purpose: Generate alerts for inventory replenishment
-- ========================
CREATE PROCEDURE sp_low_stock_report(IN p_threshold INT)
BEGIN
    SELECT 
        M.med_id,
        M.name AS medicine_name,
        S.store_id,
        S.name AS store_name,
        Q.quantity AS current_stock,
        CASE
            WHEN Q.quantity < 10 THEN 'URGENT'
            WHEN Q.quantity < 20 THEN 'CRITICAL'
            WHEN Q.quantity < p_threshold THEN 'LOW'
            ELSE 'OK'
        END AS alert_level
    FROM QUANT Q
    JOIN MEDICINE M ON Q.med_id = M.med_id
    JOIN STORES S ON Q.store_id = S.store_id
    WHERE Q.quantity < p_threshold
    ORDER BY Q.quantity ASC;
END//


-- ========================
-- Procedure 6: Patient analysis
-- Purpose: Customer purchase pattern analysis
-- ========================
CREATE PROCEDURE sp_patient_analysis(IN p_pat_id INT)
BEGIN
    SELECT 
        P.pat_id,
        P.name AS patient_name,
        COUNT(*) AS total_transactions,
        SUM(T.total) AS total_spent,
        AVG(T.total) AS avg_transaction,
        MAX(T.pur_date) AS last_purchase,
        MIN(T.pur_date) AS first_purchase
    FROM PATIENT P
    JOIN TRANSACTIONS T ON P.pat_id = T.pat_id
    WHERE P.pat_id = p_pat_id
    GROUP BY P.pat_id, P.name;

    -- Get frequently purchased medicines
    SELECT M.name AS medicine, COUNT(*) AS purchase_count, SUM(T.quantity) AS total_quantity
    FROM TRANSACTIONS T
    JOIN MEDICINE M ON T.med_id = M.med_id
    WHERE T.pat_id = p_pat_id
    GROUP BY M.med_id, M.name
    ORDER BY purchase_count DESC
    LIMIT 5;
END//


-- ========================
-- Procedure 7: Restock from dealer
-- Purpose: Simplified restocking workflow
-- ========================
CREATE PROCEDURE sp_restock(
    IN p_retail_id VARCHAR(20),
    IN p_med_id INT,
    IN p_store_id VARCHAR(20),
    IN p_dealer_id INT,
    IN p_batchno INT,
    IN p_quantity INT
)
BEGIN
    INSERT INTO RETAIL(retail_id, med_id, store_id, dealer_id, batchno, quantity_supplied)
    VALUES(p_retail_id, p_med_id, p_store_id, p_dealer_id, p_batchno, p_quantity);

    SELECT 'Stock added successfully' AS message, p_quantity AS quantity_added;
END//

DELIMITER ;


-- =============================================================
-- INDEXES (Performance Optimization)
-- =============================================================
-- Purpose: Improve query performance for frequent JOINs and WHERE clauses
-- Strategy: Add indexes on foreign keys, frequently filtered columns, and composite indexes

-- ========================
-- MEDICINE Table Indexes
-- ========================
-- idx_med_name: Speeds up medicine name searches (common filter)
CREATE INDEX idx_med_name ON MEDICINE(name);

-- idx_med_expiry: Optimizes expiry date queries for stock rotation
CREATE INDEX idx_med_expiry ON MEDICINE(exp_date);

-- idx_med_cost: Enables fast cost-based queries for price comparisons
CREATE INDEX idx_med_cost ON MEDICINE(cost_per_tab);


-- ========================
-- STORES Table Indexes
-- ========================
-- idx_store_name: Fast store name lookups
CREATE INDEX idx_store_name ON STORES(name);

-- idx_store_license: Quick license verification queries
CREATE INDEX idx_store_license ON STORES(license_no);


-- ========================
-- PATIENT Table Indexes
-- ========================
-- idx_patient_name: Fast patient name searches
CREATE INDEX idx_patient_name ON PATIENT(name);

-- idx_patient_phone: Quick phone-based lookups
CREATE INDEX idx_patient_phone ON PATIENT(phone);

-- idx_patient_email: Email verification and searches
CREATE INDEX idx_patient_email ON PATIENT(email);


-- ========================
-- DEALER Table Indexes
-- ========================
-- idx_dealer_name: Fast dealer name searches
CREATE INDEX idx_dealer_name ON DEALER(name);

-- idx_dealer_phone: Quick phone lookups
CREATE INDEX idx_dealer_phone ON DEALER(phone);


-- ========================
-- HOSPITAL Table Indexes
-- ========================
-- idx_hos_name: Fast hospital name searches
CREATE INDEX idx_hos_name ON HOSPITAL(name);

-- idx_hos_phone: Quick phone lookups
CREATE INDEX idx_hos_phone ON HOSPITAL(phone);


-- ========================
-- TRANSACTIONS Table Indexes (Critical for sales reporting)
-- ========================
-- idx_trans_date: Fast date-range queries for daily/weekly reports
CREATE INDEX idx_trans_date ON TRANSACTIONS(pur_date);

-- Composite index: Optimizes queries filtering by store AND medicine
-- Usage: Sales reports per store per product
CREATE INDEX idx_trans_store_med ON TRANSACTIONS(store_id, med_id);

-- Composite index: Optimizes patient purchase history queries
-- Usage: Patient order history with date filtering
CREATE INDEX idx_trans_pat_date ON TRANSACTIONS(pat_id, pur_date);

-- idx_trans_patient: Fast patient transaction lookups
CREATE INDEX idx_trans_patient ON TRANSACTIONS(pat_id);

-- idx_trans_bill: Quick bill retrieval
CREATE INDEX idx_trans_bill ON TRANSACTIONS(bill_id);

-- idx_trans_total: Revenue aggregation queries
CREATE INDEX idx_trans_total ON TRANSACTIONS(total);


-- ========================
-- QUANT Table Indexes (Inventory Management)
-- ========================
-- Composite index: Primary location for stock queries
-- Usage: Store inventory reports, low-stock alerts
CREATE INDEX idx_quant_store_med ON QUANT(store_id, med_id);

-- idx_quant_quantity: Fast quantity-based filtering (low stock alerts)
CREATE INDEX idx_quant_quantity ON QUANT(quantity);


-- ========================
-- RETAIL Table Indexes (Supplier Incoming Stock)
-- ========================
-- idx_retail_dealer: Fast dealer supply history
CREATE INDEX idx_retail_dealer ON RETAIL(dealer_id);

-- Composite index: Optimizes supply history by store and medicine
CREATE INDEX idx_retail_store_med ON RETAIL(store_id, med_id);

-- idx_retail_date: Supply date analysis
CREATE INDEX idx_retail_date ON RETAIL(supply_date);


-- ========================
-- TREATMENT Table Indexes
-- ========================
-- idx_treat_patient: Patient treatment history
CREATE INDEX idx_treat_patient ON TREATMENT(pat_id);

-- idx_treat_date: Treatment date analysis
CREATE INDEX idx_treat_date ON TREATMENT(treat_date);

-- Composite index: Treatment lookup by hospital and date
CREATE INDEX idx_treat_hos_date ON TREATMENT(hos_id, treat_date);


-- ========================
-- DOCTOR Table Indexes
-- ========================
-- idx_doc_name: Fast doctor name searches
CREATE INDEX idx_doc_name ON DOCTOR(doc_name);

-- idx_doc_specialization: Find doctors by specialty
CREATE INDEX idx_doc_specialization ON DOCTOR(specialization);


-- ========================
-- CONTRACT Table Indexes
-- ========================
-- idx_contract_hos: Quick hospital contract lookup
CREATE INDEX idx_contract_hos ON CONTRACT(hos_id);

-- idx_contract_store: Quick store contract lookup
CREATE INDEX idx_contract_store ON CONTRACT(store_id);


-- ========================
-- BATCH Table Indexes (Batch Tracking)
-- ========================
-- idx_batch_med: Fast batch lookup by medicine
CREATE INDEX idx_batch_med ON BATCH(med_id);

-- idx_batch_no: Unique batch number lookup
CREATE INDEX idx_batch_no ON BATCH(batch_no);

-- Composite index: Medicine batches by expiry (FIFO management)
CREATE INDEX idx_batch_med_exp ON BATCH(med_id, exp_date);

-- idx_batch_dealer: Batch lookup by supplier
CREATE INDEX idx_batch_dealer ON BATCH(dealer_id);


-- ========================
-- PRESCRIPTION Table Indexes
-- ========================
-- idx_presc_patient: Patient prescription history
CREATE INDEX idx_presc_patient ON PRESCRIPTION(pat_id);

-- idx_presc_medicine: Medicine prescription analysis
CREATE INDEX idx_presc_medicine ON PRESCRIPTION(med_id);

-- idx_presc_date: Prescription date analysis
CREATE INDEX idx_presc_date ON PRESCRIPTION(presc_date);


-- ========================
-- PAYMENT Table Indexes
-- ========================
-- idx_payment_bill: Fast bill payment lookup
CREATE INDEX idx_payment_bill ON PAYMENT(bill_id);

-- idx_payment_patient: Patient payment history
CREATE INDEX idx_payment_patient ON PAYMENT(pat_id);

-- idx_payment_status: Fast status filtering (pending payments)
CREATE INDEX idx_payment_status ON PAYMENT(status);

-- idx_payment_date: Payment date analysis
CREATE INDEX idx_payment_date ON PAYMENT(payment_date);


-- ========================
-- AUDIT_LOG Table Indexes
-- ========================
-- idx_audit_table: Fast audit log filtering by table
CREATE INDEX idx_audit_table ON AUDIT_LOG(table_name);

-- idx_audit_date: Audit log date analysis
CREATE INDEX idx_audit_date ON AUDIT_LOG(changed_at);

-- idx_audit_action: Filter by action type
CREATE INDEX idx_audit_action ON AUDIT_LOG(action_type);
