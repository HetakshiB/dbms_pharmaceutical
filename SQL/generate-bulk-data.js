// ============================================================
// Bulk Data Generator for PharmaFlow
// Generates 1000+ rows per table as SQL INSERT statements
// Run: node generate-bulk-data.js > Proj-INSERT-BULK.sql
// ============================================================

const fs = require('fs');

// --- Helpers ---
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function padId(n) { return String(n); }
function randomDate(startYear, endYear) {
  const y = rand(startYear, endYear);
  const m = String(rand(1, 12)).padStart(2, '0');
  const d = String(rand(1, 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function esc(s) { return s.replace(/'/g, "''"); }

// --- Data pools ---
const medPrefixes = ['Aceto','Amlo','Ator','Azithro','Ceft','Cipro','Clinda','Dex','Diaz','Diclo','Doxy','Eryth','Esci','Flu','Gab','Hydro','Ibu','Keto','Levo','Lisi','Lora','Mefor','Metro','Monte','Nap','Ome','Ondan','Pan','Para','Pred','Rabe','Raml','Ranit','Rosu','Sal','Sertra','Sild','Simva','Tamsu','Telmi','Tram','Valdo','Vori','Warfa','Zolpi'];
const medSuffixes = ['mol','mycin','prazole','vir','statin','sartan','olol','pril','oxin','azole','dine','pine','dryl','fex','phen','mide','zide','done','lam','pam','tam','ril','fen','flox','cycline','tide'];
const compositions = [
  'paracetamol','ibuprofen','amoxicillin','metformin','atorvastatin','omeprazole',
  'azithromycin','cetirizine','montelukast','amlodipine','losartan','metoprolol',
  'pantoprazole','doxycycline','ciprofloxacin','ranitidine','domperidone','levofloxacin',
  'clopidogrel','aspirin','diclofenac','gabapentin','tramadol','furosemide','prednisone',
  'sertraline','fluoxetine','alprazolam','rosuvastatin','telmisartan','ramipril',
  'glimepiride','sitagliptin','voglibose','acarbose','insulin','levothyroxine',
  'salbutamol','budesonide','montelukast sodium','fexofenadine','hydroxyzine',
  'ondansetron','esomeprazole','rabeprazole','lansoprazole','sucralfate'
];

const firstNames = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan',
  'Shaurya','Atharv','Advik','Pranav','Advaith','Aarush','Kabir','Ritvik','Anirudh','Dhruv',
  'Ananya','Diya','Myra','Sara','Aadhya','Anya','Anika','Navya','Saanvi','Priya',
  'Riya','Sneha','Kavya','Tanvi','Pooja','Meera','Nisha','Divya','Anjali','Kritika',
  'Rahul','Amit','Suresh','Rajesh','Vikram','Arun','Kiran','Mohan','Deepak','Sanjay',
  'Neha','Swati','Mansi','Komal','Shreya','Sakshi','Nikita','Pallavi','Rashmi','Jyoti',
  'John','James','Robert','Michael','David','William','Richard','Joseph','Thomas','Chris',
  'Mary','Linda','Susan','Jessica','Sarah','Karen','Nancy','Lisa','Betty','Margaret',
  'Rohan','Kunal','Varun','Nikhil','Gaurav','Rohit','Harsh','Dev','Akash','Tarun',
  'Simran','Payal','Rupal','Heena','Bhavna','Minal','Poonam','Rekha','Sunita','Geeta'];

const lastNames = ['Sharma','Patel','Singh','Kumar','Verma','Gupta','Joshi','Reddy','Nair','Menon',
  'Das','Roy','Bhat','Iyer','Rao','Pillai','Shah','Mehta','Desai','Jain',
  'Choudhary','Mishra','Pandey','Tiwari','Dubey','Srivastava','Agarwal','Banerjee','Mukherjee','Ghosh',
  'Thomas','Wilson','Brown','Taylor','Anderson','Martin','Garcia','Rodriguez','Lee','Walker'];

const areas = ['Jayanagar','Koramangala','Indiranagar','Whitefield','HSR Layout','BTM Layout',
  'Malleshwaram','Rajajinagar','Basavanagudi','Banashankari','JP Nagar','Marathahalli',
  'Electronic City','Yelahanka','Hebbal','Majestic','MG Road','Brigade Road','Sadashivanagar',
  'Vijayanagar','Peenya','Yeshwanthpur','Nagarbhavi','Kengeri','Bannerghatta','RT Nagar',
  'Kammanahalli','Banaswadi','Kalyan Nagar','Horamavu','Thanisandra','Sahakarnagar',
  'Vidyaranyapura','Jalahalli','Rajarajeshwari Nagar','Uttarahalli','Kumaraswamy Layout',
  'Wilson Garden','Richmond Town','Shivaji Nagar','Frazer Town','Cox Town','Ulsoor',
  'Domlur','HAL Airport Road','Old Airport Road','Bellandur','Sarjapur Road','Varthur'];

const cities = ['Bangalore','Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad','Jaipur','Lucknow',
  'Mysore','Mangalore','Hubli','Belgaum','Shimoga','Udupi','Hassan','Tumkur','Mandya','Kolar'];

const specializations = ['General Medicine','Cardiology','Orthopedics','Pediatrics','Dermatology',
  'ENT','Ophthalmology','Gynecology','Neurology','Psychiatry','Dentistry',
  'Oncology','Urology','Pulmonology','Gastroenterology','Nephrology','Endocrinology'];

const storeTypes = ['Pharma','Medical Store','Pharmacy','Drugstore','Chemist','Health Mart','MedPlus','Wellness Store'];

const hospitalTypes = ['Hospital','Clinic','Healthcare','Medical Center','Nursing Home','Diagnostics','Health Hub'];

const ID_BASE = 1000;
const HOSPITAL_COUNT = 100;

let output = [];
function sql(line) { output.push(line); }

sql('USE dbms_project;');
sql('SET FOREIGN_KEY_CHECKS = 0;');
sql('SET SQL_SAFE_UPDATES = 0;');
sql('');
sql('-- Clear existing data');
sql('DELETE FROM AUDIT_LOG;');
sql('DELETE FROM PAYMENT;');
sql('DELETE FROM PRESCRIPTION;');
sql('DELETE FROM BATCH;');
sql('DELETE FROM TRANSACTIONS;');
sql('DELETE FROM RETAIL;');
sql('DELETE FROM QUANT;');
sql('DELETE FROM TREATMENT;');
sql('DELETE FROM CONTRACT;');
sql('DELETE FROM DOCTOR;');
sql('DELETE FROM PATIENT;');
sql('DELETE FROM DEALER;');
sql('DELETE FROM STORES;');
sql('DELETE FROM HOSPITAL;');
sql('DELETE FROM MEDICINE;');
sql('SET FOREIGN_KEY_CHECKS = 1;');
sql('');

// ========== MEDICINE (1000 rows) ==========
sql('-- ========== MEDICINE (1000 rows) ==========');
const medicines = [];
const usedMedNames = new Set();
for (let i = 1; i <= 1000; i++) {
  const medId = ID_BASE + i;
  let name;
  do {
    name = pick(medPrefixes) + pick(medSuffixes) + (rand(0,1) ? '' : '-' + rand(1,99));
  } while (usedMedNames.has(name));
  usedMedNames.add(name);
  
  const comp = pick(compositions) + ', ' + pick(compositions);
  const mfgYear = rand(2019, 2024);
  const mfg = randomDate(mfgYear, mfgYear);
  const expYear = mfgYear + rand(1, 4);
  const exp = randomDate(Math.min(expYear, 2029), Math.min(expYear, 2029));
  const cost = (rand(1, 500) + rand(0, 99) / 100).toFixed(2);
  medicines.push({ id: medId, name });
  
  if (i === 1) sql('INSERT INTO MEDICINE(med_id, name, composition, mfg_date, exp_date, cost_per_tab) VALUES');
  const comma = i < 1000 ? ',' : ';';
  sql(`(${medId}, '${esc(name)}', '${esc(comp)}', '${mfg}', '${exp}', ${cost})${comma}`);
}
sql('');

// ========== STORES (1000 rows) ==========
sql('-- ========== STORES (1000 rows) ==========');
const stores = [];
for (let i = 1; i <= 1000; i++) {
  const sid = `str${ID_BASE + i}`;
  const sname = `${pick(firstNames)}'s ${pick(storeTypes)}`;
  const addr = `${rand(1,99)}${['st','nd','rd','th'][Math.min(rand(0,3),3)]} Cross, ${pick(areas)}, ${pick(cities)}`;
  const contact = `${rand(70,99)}${String(rand(10000000,99999999))}`;
  const manager = `${pick(firstNames)} ${pick(lastNames)}`;
  stores.push(sid);
  
  if (i === 1) sql("INSERT INTO STORES(store_id, name, address, contact, store_man) VALUES");
  const comma = i < 1000 ? ',' : ';';
  sql(`('${sid}', '${esc(sname)}', '${esc(addr)}', '${contact}', '${esc(manager)}')${comma}`);
}
sql('');

// ========== DEALER (1000 rows) ==========
sql('-- ========== DEALER (1000 rows) ==========');
const dealers = [];
for (let i = 1; i <= 1000; i++) {
  const dealerId = ID_BASE + i;
  const dname = `${pick(firstNames)} ${pick(lastNames)}`;
  const addr = `${rand(1,50)}${['st','nd','rd','th'][Math.min(rand(0,3),3)]} Block, ${pick(areas)}, ${pick(cities)}`;
  const phone = `${rand(70,99)}${String(rand(10000000,99999999))}`;
  dealers.push(dealerId);
  
  if (i === 1) sql("INSERT INTO DEALER(dealer_id, name, address, phone) VALUES");
  const comma = i < 1000 ? ',' : ';';
  sql(`(${dealerId}, '${esc(dname)}', '${esc(addr)}', '${phone}')${comma}`);
}
sql('');

// ========== HOSPITAL (100 rows) ==========
sql(`-- ========== HOSPITAL (${HOSPITAL_COUNT} rows) ==========`);
const hospitals = [];
for (let i = 1; i <= HOSPITAL_COUNT; i++) {
  const hid = `hos${ID_BASE + i}`;
  const hname = `${pick(firstNames)} ${pick(hospitalTypes)}`;
  const addr = `${rand(1,30)}${['st','nd','rd','th'][Math.min(rand(0,3),3)]} Main, ${pick(areas)}, ${pick(cities)}`;
  const phone = `+91${rand(70,99)}${String(rand(10000000,99999999))}`;
  hospitals.push(hid);
  
  if (i === 1) sql("INSERT INTO HOSPITAL(hos_id, name, address, phone) VALUES");
  const comma = i < HOSPITAL_COUNT ? ',' : ';';
  sql(`('${hid}', '${esc(hname)}', '${esc(addr)}', '${phone}')${comma}`);
}
sql('');

// ========== PATIENT (1000 rows) ==========
sql('-- ========== PATIENT (1000 rows) ==========');
const patients = [];
for (let i = 1; i <= 1000; i++) {
  const pid = ID_BASE + i;
  const pname = `${pick(firstNames)} ${pick(lastNames)}`;
  const addr = `${rand(1,99)}${['st','nd','rd','th'][Math.min(rand(0,3),3)]} Cross, ${pick(areas)}, ${pick(cities)} ${rand(560001,560099)}`;
  const phone = `${rand(70,99)}${String(rand(10000000,99999999))}`;
  patients.push(pid);
  
  if (i === 1) sql("INSERT INTO PATIENT(pat_id, name, address, phone) VALUES");
  const comma = i < 1000 ? ',' : ';';
  sql(`(${pid}, '${esc(pname)}', '${esc(addr)}', '${phone}')${comma}`);
}
sql('');

// ========== DOCTOR (1000 rows) ==========
sql('-- ========== DOCTOR (1000 rows) ==========');
// Each doctor assigned to a random hospital
const doctors = [];
for (let i = 1; i <= 1000; i++) {
  const hosId = hospitals[rand(0, hospitals.length - 1)];
  const dname = `Dr. ${pick(firstNames)} ${pick(lastNames)}`;
  const docId = ID_BASE + i;
  doctors.push({ doc_id: docId, hos_id: hosId });
  
  if (i === 1) sql("INSERT INTO DOCTOR(doc_id, hos_id, doc_name) VALUES");
  const comma = i < 1000 ? ',' : ';';
  sql(`(${docId}, '${hosId}', '${esc(dname)}')${comma}`);
}
sql('');

// ========== CONTRACT (100 rows — each hospital gets 1 store) ==========
sql(`-- ========== CONTRACT (${HOSPITAL_COUNT} rows) ==========`);
for (let i = 0; i < HOSPITAL_COUNT; i++) {
  const hosId = hospitals[i];
  const storeId = stores[i]; // 1-to-1 for simplicity
  
  if (i === 0) sql("INSERT INTO CONTRACT(contract_id, hos_id, store_id) VALUES");
  const comma = i < HOSPITAL_COUNT - 1 ? ',' : ';';
  sql(`('ctrt${ID_BASE + i + 1}', '${hosId}', '${storeId}')${comma}`);
}
sql('');

// ========== RETAIL (1500 rows — supply chain) ==========
sql('-- ========== RETAIL (1500 rows) ==========');
// Need to batch INSERTs to avoid too-long statements
const retailBatchSize = 500;
for (let batch = 0; batch < 3; batch++) {
  const start = batch * retailBatchSize;
  sql("INSERT INTO RETAIL(retail_id, med_id, store_id, dealer_id, batchno, quantity_supplied) VALUES");
  for (let i = 0; i < retailBatchSize; i++) {
    const idx = start + i;
    const retId = `ret${ID_BASE + idx + 1}`;
    const medId = ID_BASE + rand(1, 1000);
    const storeId = stores[rand(0, 999)];
    const dealerId = ID_BASE + rand(1, 1000);
    const batchno = ID_BASE + rand(1, 200);
    const qty = rand(20, 500);
    const comma = i < retailBatchSize - 1 ? ',' : ';';
    sql(`('${retId}', ${medId}, '${storeId}', ${dealerId}, ${batchno}, ${qty})${comma}`);
  }
}
sql('');

// ========== TRANSACTIONS (1500 rows) ==========
// We must disable the check_expiry and stock triggers temporarily
sql('-- Disable validation triggers for bulk insert');
sql('DROP TRIGGER IF EXISTS check_expiry_before_sale;');
sql('DROP TRIGGER IF EXISTS calc_and_validate_sale;');
sql('');
sql('-- ========== TRANSACTIONS (1500 rows) ==========');
const transBatchSize = 500;
for (let batch = 0; batch < 3; batch++) {
  const start = batch * transBatchSize;
  sql("INSERT INTO TRANSACTIONS(bill_id, pat_id, store_id, med_id, quantity, pur_date, total) VALUES");
  for (let i = 0; i < transBatchSize; i++) {
    const idx = start + i;
    const billId = 1000 + idx;
    const patId = patients[rand(0, 999)];
    const storeId = stores[rand(0, 999)];
    const medId = ID_BASE + rand(1, 1000);
    const qty = rand(1, 50);
    const cost = rand(1, 500);
    const total = qty * cost;
    const purDate = randomDate(2020, 2025);
    const comma = i < transBatchSize - 1 ? ',' : ';';
    sql(`(${billId}, ${patId}, '${storeId}', ${medId}, ${qty}, '${purDate}', ${total})${comma}`);
  }
}
sql('');

// ========== TREATMENT (1000 rows) ==========
sql('-- ========== TREATMENT (1000 rows) ==========');
const treatBatchSize = 500;
for (let batch = 0; batch < 2; batch++) {
  const start = batch * treatBatchSize;
  sql("INSERT INTO TREATMENT(treat_id, pat_id, hos_id, doc_id, treat_date) VALUES");
  for (let i = 0; i < treatBatchSize; i++) {
    const idx = start + i;
    const doc = doctors[rand(0, 999)];
    const patId = patients[rand(0, 999)];
    const treatDate = randomDate(2020, 2025);
    const comma = i < treatBatchSize - 1 ? ',' : ';';
    sql(`(${ID_BASE + idx + 1}, ${patId}, '${doc.hos_id}', ${doc.doc_id}, '${treatDate}')${comma}`);
  }
}
sql('');

// Re-create the validation triggers
sql('-- Re-create validation triggers');
sql('DELIMITER //');
sql('CREATE TRIGGER check_expiry_before_sale');
sql('BEFORE INSERT ON TRANSACTIONS');
sql('FOR EACH ROW');
sql('BEGIN');
sql('    DECLARE exp DATE;');
sql('    SELECT exp_date INTO exp FROM MEDICINE WHERE med_id = NEW.med_id;');
sql('    IF exp < CURDATE() THEN');
sql("        SIGNAL SQLSTATE '45000'");
sql("        SET MESSAGE_TEXT = 'Cannot sell expired medicine!';");
sql('    END IF;');
sql('END//');
sql('');
sql('CREATE TRIGGER calc_and_validate_sale');
sql('BEFORE INSERT ON TRANSACTIONS');
sql('FOR EACH ROW');
sql('BEGIN');
sql('    DECLARE avail INT DEFAULT 0;');
sql('    DECLARE price DECIMAL(8,2);');
sql('    SELECT quantity INTO avail FROM QUANT');
sql('    WHERE med_id = NEW.med_id AND store_id = NEW.store_id;');
sql('    IF avail IS NULL OR NEW.quantity > avail THEN');
sql("        SIGNAL SQLSTATE '45000'");
sql("        SET MESSAGE_TEXT = 'Insufficient stock for this transaction!';");
sql('    END IF;');
sql('    SELECT cost_per_tab INTO price FROM MEDICINE WHERE med_id = NEW.med_id;');
sql('    SET NEW.total = NEW.quantity * price;');
sql('END//');
sql('DELIMITER ;');

// Write output
const outputStr = output.join('\n');
fs.writeFileSync('Proj-INSERT-BULK.sql', outputStr, 'utf8');
console.log(`Generated Proj-INSERT-BULK.sql (${output.length} lines)`);
console.log(`Tables: MEDICINE(1000), STORES(1000), DEALER(1000), HOSPITAL(${HOSPITAL_COUNT}), PATIENT(1000), DOCTOR(1000), CONTRACT(${HOSPITAL_COUNT}), RETAIL(1500), TRANSACTIONS(1500), TREATMENT(1000)`);
