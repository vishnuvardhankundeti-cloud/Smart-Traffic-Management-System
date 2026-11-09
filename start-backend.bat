@echo off
title STMS Backend Server (Port 8080)
echo ===================================================
echo Starting STMS Spring Boot Backend Server...
echo ===================================================
set "JAVA_HOME=C:\Users\mtclab\.gemini\antigravity\tools\jdk17"
set "PATH=C:\Users\mtclab\.gemini\antigravity\tools\jdk17\bin;C:\Users\mtclab\.gemini\antigravity\tools\maven\bin;%PATH%"

cd /d "C:\Users\mtclab\.gemini\antigravity\scratch\smart-traffic-management\backend"
mvn spring-boot:run
pause
