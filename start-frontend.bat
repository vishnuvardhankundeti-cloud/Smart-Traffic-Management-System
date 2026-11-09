@echo off
title STMS Frontend Server (Port 5173)
echo ===================================================
echo Starting STMS React Vite Frontend Server...
echo ===================================================
set "PATH=C:\Users\mtclab\.gemini\antigravity\tools\nodejs;%PATH%"

cd /d "C:\Users\mtclab\.gemini\antigravity\scratch\smart-traffic-management\frontend"
npm run dev
pause
