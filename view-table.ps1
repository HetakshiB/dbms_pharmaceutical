param(
    [Parameter(Mandatory = $true)]
    [ValidateSet(
        "MEDICINE",
        "PATIENT",
        "DEALER",
        "STORES",
        "HOSPITAL",
        "DOCTOR",
        "CONTRACT",
        "RETAIL",
        "TRANSACTIONS",
        "QUANT",
        "TREATMENT",
        "PRESCRIPTION",
        "BATCH",
        "PAYMENT",
        "AUDIT_LOG"
    )]
    [string]$Table,

    [int]$Limit = 10,
    [string]$Database = "dbms_project",
    [string]$User = "root"
)

$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if (-not (Test-Path $mysqlExe)) {
    Write-Host "mysql.exe not found at: $mysqlExe" -ForegroundColor Red
    Write-Host "Update the script path or install MySQL Server client tools." -ForegroundColor Yellow
    exit 1
}

$orderByMap = @{
    "MEDICINE"     = "med_id DESC"
    "PATIENT"      = "pat_id DESC"
    "DEALER"       = "dealer_id DESC"
    "STORES"       = "store_id"
    "HOSPITAL"     = "hos_id"
    "DOCTOR"       = "doc_id DESC, hos_id"
    "CONTRACT"     = "contract_id DESC"
    "RETAIL"       = "retail_id DESC"
    "TRANSACTIONS" = "bill_id DESC"
    "QUANT"        = "quantity ASC"
    "TREATMENT"    = "treat_id DESC"
    "PRESCRIPTION" = "presc_id DESC"
    "BATCH"        = "batch_id DESC"
    "PAYMENT"      = "payment_id DESC"
    "AUDIT_LOG"    = "log_id DESC"
}

$orderBy = $orderByMap[$Table]
$query = "SELECT * FROM $Table ORDER BY $orderBy LIMIT $Limit;"

Write-Host "Opening $Table from database $Database..." -ForegroundColor Cyan
Write-Host "You may be prompted for your MySQL password." -ForegroundColor DarkGray

& $mysqlExe -u $User -p -D $Database -e $query
