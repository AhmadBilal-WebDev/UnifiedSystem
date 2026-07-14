@echo off
echo ================================================
echo   Restaurant System
echo ================================================

echo Starting Backend (Port 5000)...
start "Backend" cmd /k "cd /d %~dp0 && npm install && node server.js"

timeout /t 5 /nobreak >nul

echo Starting Website (Port 5173)...
start "Website" cmd /k "cd /d %~dp0..\frontend && npm install && npm run dev"

echo.
echo ================================================
echo   Customer Website : http://localhost:5173
echo   Admin Dashboard  : http://localhost:5173/admin
echo   Setup (first time): npm run setup
echo ================================================
pause
