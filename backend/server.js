const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
host: "localhost",
user: "root",
password: "Hetakshi@123",
database: "dbms_project"
});

db.connect((err) => {
if (err) {
console.log("Database connection failed");
return;
}
console.log("Connected to MySQL");
});

app.get("/medicines", (req, res) => {
db.query("SELECT * FROM MEDICINE", (err, result) => {
if (err) {
res.send(err);
} else {
res.json(result);
}
});
});

app.listen(3000, () => {
console.log("Server running on port 3000");
});