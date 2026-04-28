USE dbms_project;

SET SQL_SAFE_UPDATES = 0;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM AUDIT_LOG;
DELETE FROM PAYMENT;
DELETE FROM PRESCRIPTION;
DELETE FROM BATCH;
DELETE FROM TRANSACTIONS;
DELETE FROM RETAIL;
DELETE FROM QUANT;
DELETE FROM TREATMENT;
DELETE FROM CONTRACT;
DELETE FROM DOCTOR;
DELETE FROM PATIENT;
DELETE FROM DEALER;
DELETE FROM STORES;
DELETE FROM HOSPITAL;
DELETE FROM MEDICINE;
SET FOREIGN_KEY_CHECKS = 1;

DROP PROCEDURE IF EXISTS sp_seed_test_data;

DELIMITER //

CREATE PROCEDURE sp_seed_test_data()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE v_store_id VARCHAR(20);
    DECLARE v_doc_id INT;
    DECLARE v_doc_hos_id VARCHAR(20);
    DECLARE v_dealer_id INT;
    DECLARE v_mfg_date DATE;
    DECLARE v_exp_date DATE;

    WHILE i <= 100 DO
        INSERT INTO STORES(store_id, name, address, contact, store_man, license_no)
        VALUES(
            CONCAT('str', i),
            CONCAT('Store_', LPAD(i, 2, '0')),
            CONCAT('Block ', i, ', Market Road, City_', ((i - 1) MOD 10) + 1),
            CONCAT('98', LPAD(i, 8, '0')),
            CONCAT('Manager_', LPAD(i, 2, '0')),
            CONCAT('LIC', LPAD(i, 5, '0'))
        );

        INSERT INTO HOSPITAL(hos_id, name, address, phone)
        VALUES(
            CONCAT('hos', i),
            CONCAT('Hospital_', LPAD(i, 2, '0')),
            CONCAT('Sector ', i, ', Health Avenue, City_', ((i - 1) MOD 10) + 1),
            CONCAT('+9191', LPAD(i, 8, '0'))
        );

        INSERT INTO CONTRACT(contract_id, hos_id, store_id)
        VALUES(CONCAT('ctrt', i), CONCAT('hos', i), CONCAT('str', i));

        SET i = i + 1;
    END WHILE;

    SET i = 1;
    WHILE i <= 200 DO
        INSERT INTO DEALER(dealer_id, name, address, phone)
        VALUES(
            i,
            CONCAT('Dealer_', LPAD(i, 3, '0')),
            CONCAT('Warehouse ', i, ', Industrial Area_', ((i - 1) MOD 20) + 1),
            CONCAT('97', LPAD(i, 8, '0'))
        );

        INSERT INTO DOCTOR(doc_id, hos_id, doc_name, specialization)
        VALUES(
            i,
            CONCAT('hos', ((i - 1) MOD 100) + 1),
            CONCAT('Dr. Doctor_', LPAD(i, 3, '0')),
            CASE (i MOD 8)
                WHEN 0 THEN 'General Medicine'
                WHEN 1 THEN 'Cardiology'
                WHEN 2 THEN 'Orthopedics'
                WHEN 3 THEN 'Pediatrics'
                WHEN 4 THEN 'Dermatology'
                WHEN 5 THEN 'ENT'
                WHEN 6 THEN 'Neurology'
                ELSE 'Gastroenterology'
            END
        );

        SET i = i + 1;
    END WHILE;

    SET i = 1;
    WHILE i <= 1000 DO
        SET v_store_id = CONCAT('str', ((i - 1) MOD 100) + 1);
        SET v_dealer_id = ((i - 1) MOD 200) + 1;
        SET v_doc_id = ((i - 1) MOD 200) + 1;
        SET v_doc_hos_id = CONCAT('hos', ((v_doc_id - 1) MOD 100) + 1);
        SET v_mfg_date = DATE_ADD('2023-01-01', INTERVAL ((i * 7) MOD 700) DAY);
        SET v_exp_date = DATE_ADD(v_mfg_date, INTERVAL 1500 DAY);

        INSERT INTO MEDICINE(med_id, name, composition, mfg_date, exp_date, cost_per_tab)
        VALUES(
            i,
            CONCAT('Med_', LPAD(i, 4, '0')),
            CASE (i MOD 10)
                WHEN 0 THEN 'Paracetamol 500mg'
                WHEN 1 THEN 'Amoxicillin 250mg'
                WHEN 2 THEN 'Cetirizine 10mg'
                WHEN 3 THEN 'Metformin 500mg'
                WHEN 4 THEN 'Azithromycin 500mg'
                WHEN 5 THEN 'Pantoprazole 40mg'
                WHEN 6 THEN 'Ibuprofen 400mg'
                WHEN 7 THEN 'Losartan 50mg'
                WHEN 8 THEN 'Amlodipine 5mg'
                ELSE 'Vitamin C 500mg'
            END,
            v_mfg_date,
            v_exp_date,
            ROUND(5 + ((i * 13) MOD 450) / 10, 2)
        );

        INSERT INTO PATIENT(pat_id, name, address, phone, email)
        VALUES(
            i,
            CONCAT('Patient_', LPAD(i, 4, '0')),
            CONCAT('House ', i, ', Street_', ((i - 1) MOD 100) + 1, ', City_', ((i - 1) MOD 10) + 1),
            CONCAT('96', LPAD(i, 8, '0')),
            CONCAT('patient', i, '@test.com')
        );

        INSERT INTO BATCH(med_id, batch_no, mfg_date, exp_date, quantity, dealer_id)
        VALUES(i, CAST(i AS CHAR), v_mfg_date, v_exp_date, 0, v_dealer_id);

        INSERT INTO RETAIL(retail_id, med_id, store_id, dealer_id, batchno, quantity_supplied, supply_date)
        VALUES(
            CONCAT('ret', i),
            i,
            v_store_id,
            v_dealer_id,
            i,
            220 + (i MOD 40),
            DATE_ADD('2025-01-01', INTERVAL (i MOD 90) DAY)
        );

        INSERT INTO TRANSACTIONS(bill_id, pat_id, store_id, med_id, quantity, pur_date, total)
        VALUES(
            i,
            i,
            v_store_id,
            i,
            1 + (i MOD 5),
            DATE_ADD('2025-06-01', INTERVAL (i MOD 120) DAY),
            1.00
        );

        INSERT INTO TREATMENT(treat_id, pat_id, hos_id, doc_id, treat_date, diagnosis)
        VALUES(
            i,
            i,
            v_doc_hos_id,
            v_doc_id,
            DATE_ADD('2025-05-01', INTERVAL (i MOD 100) DAY),
            CONCAT('Diagnosis for patient ', i)
        );

        INSERT INTO PRESCRIPTION(treat_id, pat_id, med_id, dosage, duration_days, presc_date)
        VALUES(
            i,
            i,
            i,
            '1 tablet twice daily',
            5 + (i MOD 10),
            DATE_ADD('2025-05-02', INTERVAL (i MOD 100) DAY)
        );

        SET i = i + 1;
    END WHILE;
END//

DELIMITER ;

CALL sp_seed_test_data();

DROP PROCEDURE IF EXISTS sp_seed_test_data;
