USE dbms_project;

----------------------------------------------------------
-- 1. Update the total cost of each transaction
-- total = quantity × cost_per_tab
----------------------------------------------------------

UPDATE TRANSACTIONS T
JOIN MEDICINE M
ON T.med_id = M.med_id
SET T.total = T.quantity * M.cost_per_tab;



----------------------------------------------------------
-- 2. Get the grand total of each bill
----------------------------------------------------------

SELECT 
    bill_id,
    pat_id,
    store_id,
    SUM(total) AS Grand_total
FROM TRANSACTIONS
GROUP BY bill_id, pat_id, store_id;



----------------------------------------------------------
-- 3. List patients who got treated today
-- and bought medicines today
----------------------------------------------------------

SELECT DISTINCT 
    P.pat_id,
    P.name,
    T.med_id
FROM PATIENT P
JOIN TRANSACTIONS T
ON P.pat_id = T.pat_id
JOIN TREATMENT TR
ON P.pat_id = TR.pat_id
WHERE T.pur_date = CURDATE()
AND TR.treat_date = CURDATE();



----------------------------------------------------------
-- 4. Patient treated in hospital that has contract
-- with the store where they purchased medicines
----------------------------------------------------------

SELECT DISTINCT
    P.pat_id,
    P.name,
    P.phone,
    H.hos_id,
    H.name AS hospital_name,
    S.store_id,
    S.name AS store_name
FROM PATIENT P
JOIN TRANSACTIONS T
ON P.pat_id = T.pat_id
JOIN STORES S
ON T.store_id = S.store_id
JOIN CONTRACT C
ON S.store_id = C.store_id
JOIN HOSPITAL H
ON C.hos_id = H.hos_id
JOIN TREATMENT TR
ON TR.pat_id = P.pat_id
AND TR.hos_id = H.hos_id;



----------------------------------------------------------
-- 5. Find total sales in each store
----------------------------------------------------------

SELECT
    S.store_id,
    S.name AS store_name,
    SUM(T.total) AS total_sales
FROM STORES S
LEFT JOIN TRANSACTIONS T
ON S.store_id = T.store_id
GROUP BY S.store_id, S.name
ORDER BY total_sales DESC;



----------------------------------------------------------
-- 6. Find medicines that were supplied
-- but never sold in a store
----------------------------------------------------------

SELECT 
    S.store_id,
    S.name AS store_name,
    Q.med_id,
    Q.quantity
FROM STORES S
JOIN QUANT Q
ON S.store_id = Q.store_id
WHERE Q.med_id NOT IN
(
    SELECT DISTINCT med_id
    FROM TRANSACTIONS
);



----------------------------------------------------------
-- 7. Show medicine sold in store along with
-- dealer, expiry date, patient and purchase date
----------------------------------------------------------

SELECT
    R.store_id,
    R.med_id,
    M.name AS medicine_name,
    R.dealer_id,
    M.exp_date,
    T.pur_date,
    T.pat_id
FROM RETAIL R
JOIN MEDICINE M
ON R.med_id = M.med_id
JOIN TRANSACTIONS T
ON R.med_id = T.med_id
AND R.store_id = T.store_id
ORDER BY R.store_id;



----------------------------------------------------------
-- 8. Daily transaction statistics of each store
----------------------------------------------------------

SELECT
    S.store_id,
    S.name AS store_name,
    COUNT(T.bill_id) AS total_transactions,
    AVG(T.total) AS avg_transaction,
    MIN(T.total) AS min_transaction,
    MAX(T.total) AS max_transaction,
    T.pur_date
FROM TRANSACTIONS T
JOIN STORES S
ON T.store_id = S.store_id
GROUP BY S.store_id, S.name, T.pur_date
ORDER BY T.pur_date DESC;



----------------------------------------------------------
-- 9. Dealers who supplied bulk order >= 100 tablets
----------------------------------------------------------

SELECT
    D.dealer_id,
    D.name AS dealer_name,
    D.phone,
    R.retail_id,
    R.store_id,
    R.med_id,
    R.quantity_supplied
FROM DEALER D
JOIN RETAIL R
ON D.dealer_id = R.dealer_id
WHERE R.quantity_supplied >= 100
ORDER BY D.dealer_id;