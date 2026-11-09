@echo off
title STMS Launcher
echo ===================================================
echo Launching Smart Traffic Management System (STMS)...
echo ===================================================

echo [1/2] Launching Backend on Port 8080...
start "STMS Backend (Port 8080)" cmd /c "%~dp0start-backend.bat"

echo Waiting for backend initialization...
timeout /t 5 /nobreak >nul

echo [2/2] Launching Frontend on Port 5173...
start "STMS Frontend (Port 5173)" cmd /c "%~dp0start-frontend.bat"

echo Opening browser at http://localhost:5173/ ...
timeout /t 3 /nobreak >nul
start http://localhost:5173/

echo Both services launched! Keep the terminal windows open while using STMS.
