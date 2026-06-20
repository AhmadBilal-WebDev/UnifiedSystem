@echo off
echo ================================================
echo   Restaurant System
echo ================================================

echo Starting Backend (Port 5000)...
start "Backend" cmd /k "cd /d %~dp0backend && npm install && node server.js"

timeout /t 5 /nobreak >nul

echo Starting Website (Port 5173)...
start "Website" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo ================================================
echo   Customer Website : http://localhost:5173
echo   Admin Dashboard  : http://localhost:5173/admin
echo ================================================
pause
