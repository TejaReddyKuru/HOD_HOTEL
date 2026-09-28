Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "          HOUSE OF DREAMS - LUXURY HOTEL MANAGEMENT SYSTEM" -ForegroundColor Yellow
Write-Host "                      'Stay. Relax. Dream.'" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""

$rootPath = $PSScriptRoot

Write-Host "Starting Backend API (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootPath\backend'; npm run dev"

Write-Host "Starting Frontend App (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootPath\frontend'; npm run dev"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "  Both services launched in separate windows!" -ForegroundColor Green
Write-Host "    - Frontend Web App: http://localhost:5173" -ForegroundColor White
Write-Host "    - Backend REST API: http://localhost:5000/api" -ForegroundColor White
Write-Host "    - Health Check:     http://localhost:5000/api/health" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Yellow
