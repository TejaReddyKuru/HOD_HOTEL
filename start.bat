@echo off
TITLE House of Dreams - Hospitality System Launcher
COLOR 06

echo ======================================================================
echo           HOUSE OF DREAMS - LUXURY HOTEL MANAGEMENT SYSTEM
echo                       "Stay. Relax. Dream."
echo ======================================================================
echo.
echo Launching Backend Server on http://localhost:5000 ...
start "House of Dreams - Backend API" cmd /k "cd backend && npm run dev"

echo Launching Frontend Web Application on http://localhost:5173 ...
start "House of Dreams - Web UI" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo  Servers are starting in separate windows:
echo    - Frontend: http://localhost:5173
echo    - Backend:  http://localhost:5000/api
echo    - Health:   http://localhost:5000/api/health
echo.
echo  Default Demo Accounts:
echo    Admin:     admin@houseofdreams.com     / admin123
echo    Reception: reception1@houseofdreams.com / reception123
echo    Customer:  customer@houseofdreams.com  / customer123
echo ======================================================================
echo.
pause
