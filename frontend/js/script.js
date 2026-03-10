function loadMedicines(){

fetch("http://localhost:3000/medicines")

.then(response => response.json())

.then(data => {

let table = document.getElementById("medicineTable");

let total = document.getElementById("totalMedicines");

total.innerText = data.length;

data.forEach(med => {

let row = document.createElement("tr");

row.innerHTML = `
<td>${med.med_id}</td>
<td>${med.name}</td>
<td>${med.composition}</td>
<td>${med.cost_per_tab}</td>
`;

table.appendChild(row);

});

});

}

window.onload = loadMedicines;