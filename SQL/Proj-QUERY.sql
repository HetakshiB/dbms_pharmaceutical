USE dbms_project;

-- =============================================================
-- ADVANCED ANALYTICS QUERIES
-- PharmaFlow: Pharmacy Management System
-- =============================================================


-- ----------------------------------------------------------
-- 1. Update total cost of each transaction
--    total = quantity × cost_per_tab
-- ----------------------------------------------------------

UPDATE TRANSACTIONS T
JOIN MEDICINE M ON T.med_id = M.med_id
SET T.total = T.quantity * M.cost_per_tab;


-- ----------------------------------------------------------
-- 2. Grand total per bill (multi-medicine bills)
-- ----------------------------------------------------------

SELECT 
    bill_id,
    pat_id,
    store_id,
    SUM(total) AS Grand_total
FROM TRANSACTIONS
GROUP BY bill_id, pat_id, store_id;


-- ----------------------------------------------------------
-- 3. Patients treated AND bought medicines today
-- ----------------------------------------------------------

SELECT DISTINCT 
    P.pat_id,
    P.name,
    T.med_id
FROM PATIENT P
JOIN TRANSACTIONS T ON P.pat_id = T.pat_id
JOIN TREATMENT TR ON P.pat_id = TR.pat_id
WHERE T.pur_date = CURDATE()
AND TR.treat_date = CURDATE();


-- ----------------------------------------------------------
-- 4. Patient-Hospital-Store traceability via contracts
-- ----------------------------------------------------------

SELECT DISTINCT
    P.pat_id,
    P.name,
    P.phone,
    H.hos_id,
    H.name AS hospital_name,
    S.store_id,
    S.name AS store_name
FROM PATIENT P
JOIN TRANSACTIONS T ON P.pat_id = T.pat_id
JOIN STORES S ON T.store_id = S.store_id
JOIN CONTRACT C ON S.store_id = C.store_id
JOIN HOSPITAL H ON C.hos_id = H.hos_id
JOIN TREATMENT TR ON TR.pat_id = P.pat_id AND TR.hos_id = H.hos_id;


-- ----------------------------------------------------------
-- 5. Total sales per store (ranked)
-- ----------------------------------------------------------

SELECT
    S.store_id,
    S.name AS store_name,
    SUM(T.total) AS total_sales
FROM STORES S
LEFT JOIN TRANSACTIONS T ON S.store_id = T.store_id
GROUP BY S.store_id, S.name
ORDER BY total_sales DESC;


-- ----------------------------------------------------------
-- 6. Medicines supplied but never sold
-- ----------------------------------------------------------

SELECT 
    S.store_id,
    S.name AS store_name,
    Q.med_id,
    M.name AS medicine_name,
    Q.quantity
FROM STORES S
JOIN QUANT Q ON S.store_id = Q.store_id
JOIN MEDICINE M ON Q.med_id = M.med_id
WHERE Q.med_id NOT IN (SELECT DISTINCT med_id FROM TRANSACTIONS);


-- ----------------------------------------------------------
-- 7. Medicine traceability: dealer → store → patient
-- ----------------------------------------------------------

SELECT
    R.store_id,
    R.med_id,
    M.name AS medicine_name,
    R.dealer_id,
    D.name AS dealer_name,
    M.exp_date,
    T.pur_date,
    T.pat_id,
    P.name AS patient_name
FROM RETAIL R
JOIN MEDICINE M ON R.med_id = M.med_id
JOIN DEALER D ON R.dealer_id = D.dealer_id
JOIN TRANSACTIONS T ON R.med_id = T.med_id AND R.store_id = T.store_id
JOIN PATIENT P ON T.pat_id = P.pat_id
ORDER BY R.store_id;


-- ----------------------------------------------------------
-- 8. Daily transaction statistics per store
-- ----------------------------------------------------------

SELECT
    S.store_id,
    S.name AS store_name,
    COUNT(T.bill_id) AS total_transactions,
    AVG(T.total) AS avg_transaction,
    MIN(T.total) AS min_transaction,
    MAX(T.total) AS max_transaction,
    T.pur_date
FROM TRANSACTIONS T
JOIN STORES S ON T.store_id = S.store_id
GROUP BY S.store_id, S.name, T.pur_date
ORDER BY T.pur_date DESC;


-- ----------------------------------------------------------
-- 9. Dealers with bulk orders (>= 100 units)
-- ----------------------------------------------------------

SELECT
    D.dealer_id,
    D.name AS dealer_name,
    D.phone,
    R.retail_id,
    R.store_id,
    R.med_id,
    R.quantity_supplied
FROM DEALER D
JOIN RETAIL R ON D.dealer_id = R.dealer_id
WHERE R.quantity_supplied >= 100
ORDER BY D.dealer_id;


-- =============================================================
-- NEW ADVANCED QUERIES
-- =============================================================


-- ----------------------------------------------------------
-- 10. Top 5 best-selling medicines (with RANK window function)
-- ----------------------------------------------------------

SELECT M.med_id, M.name,
       SUM(T.quantity) AS total_sold,
       SUM(T.total) AS total_revenue,
       RANK() OVER (ORDER BY SUM(T.quantity) DESC) AS sales_rank
FROM TRANSACTIONS T
JOIN MEDICINE M ON T.med_id = M.med_id
GROUP BY M.med_id, M.name
ORDER BY total_sold DESC
LIMIT 5;


-- ----------------------------------------------------------
-- 11. Monthly revenue trend with month-over-month change
-- ----------------------------------------------------------

SELECT month, total_bills, revenue,
       revenue - LAG(revenue) OVER (ORDER BY month) AS revenue_change
FROM (
    SELECT DATE_FORMAT(pur_date, '%Y-%m') AS month,
           COUNT(DISTINCT bill_id) AS total_bills,
           SUM(total) AS revenue
    FROM TRANSACTIONS
    GROUP BY DATE_FORMAT(pur_date, '%Y-%m')
) monthly
ORDER BY month;


-- ----------------------------------------------------------
-- 12. Low stock alert (< 30 units) with severity levels
-- ----------------------------------------------------------

SELECT S.name AS store, M.name AS medicine, Q.quantity,
       CASE
           WHEN Q.quantity = 0 THEN 'OUT OF STOCK'
           WHEN Q.quantity < 10 THEN 'CRITICAL'
           WHEN Q.quantity < 30 THEN 'LOW'
       END AS alert_level
FROM QUANT Q
JOIN MEDICINE M ON Q.med_id = M.med_id
JOIN STORES S ON Q.store_id = S.store_id
WHERE Q.quantity < 30
ORDER BY Q.quantity ASC;


-- ----------------------------------------------------------
-- 13. Medicines expiring within 90 days
-- ----------------------------------------------------------

SELECT med_id, name, exp_date,
       DATEDIFF(exp_date, CURDATE()) AS days_left,
       CASE
           WHEN exp_date < CURDATE() THEN 'EXPIRED'
           WHEN DATEDIFF(exp_date, CURDATE()) <= 30 THEN 'URGENT'
           ELSE 'WARNING'
       END AS urgency
FROM MEDICINE
WHERE exp_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
ORDER BY exp_date;


-- ----------------------------------------------------------
-- 14. Dealer performance analysis
-- ----------------------------------------------------------

SELECT D.dealer_id, D.name,
       COUNT(R.retail_id) AS total_supplies,
       SUM(R.quantity_supplied) AS total_units,
       COUNT(DISTINCT R.store_id) AS stores_served,
       COUNT(DISTINCT R.med_id) AS medicines_supplied
FROM DEALER D
LEFT JOIN RETAIL R ON D.dealer_id = R.dealer_id
GROUP BY D.dealer_id, D.name
ORDER BY total_units DESC;


-- ----------------------------------------------------------
-- 15. Patient spending analysis with ranking
-- ----------------------------------------------------------

SELECT P.pat_id, P.name,
       SUM(T.total) AS total_spent,
       COUNT(DISTINCT T.bill_id) AS visit_count,
       AVG(T.total) AS avg_per_item,
       DENSE_RANK() OVER (ORDER BY SUM(T.total) DESC) AS spending_rank
FROM PATIENT P
JOIN TRANSACTIONS T ON P.pat_id = T.pat_id
GROUP BY P.pat_id, P.name
ORDER BY total_spent DESC;


-- ----------------------------------------------------------
-- 16. Stores with no sales (inactive stores)
-- ----------------------------------------------------------

SELECT S.store_id, S.name
FROM STORES S
LEFT JOIN TRANSACTIONS T ON S.store_id = T.store_id
WHERE T.bill_id IS NULL;


-- ----------------------------------------------------------
-- 17. Most common medicine compositions sold
-- ----------------------------------------------------------

SELECT M.composition,
       COUNT(*) AS times_sold,
       GROUP_CONCAT(DISTINCT M.name) AS medicines
FROM TRANSACTIONS T
JOIN MEDICINE M ON T.med_id = M.med_id
GROUP BY M.composition
ORDER BY times_sold DESC;


-- ----------------------------------------------------------
-- 18. Revenue share per medicine (percentage)
-- ----------------------------------------------------------

SELECT M.name,
       SUM(T.total) AS revenue,
       ROUND(SUM(T.total) * 100.0 / (SELECT SUM(total) FROM TRANSACTIONS), 2)
           AS revenue_pct
FROM TRANSACTIONS T
JOIN MEDICINE M ON T.med_id = M.med_id
GROUP BY M.name
ORDER BY revenue DESC;


-- ----------------------------------------------------------
-- 19. Use stored procedure: Generate bill
-- ----------------------------------------------------------

-- CALL sp_generate_bill(1000, 1001);


-- ----------------------------------------------------------
-- 20. Use stored procedure: Expiring within 180 days
-- ----------------------------------------------------------

-- CALL sp_expiring_soon(180);


-- ----------------------------------------------------------
-- 21. Use views
-- ----------------------------------------------------------

-- SELECT * FROM v_store_inventory WHERE stock_status = 'CRITICAL';
-- SELECT * FROM v_monthly_revenue ORDER BY month DESC;
-- SELECT * FROM v_patient_history WHERE pat_id = 1001;
