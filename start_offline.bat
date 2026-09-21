@echo off
TITLE Smart Water and Drainage Management System - Ramaswami Peta
COLOR 0B

echo ===============================================================================
echo      SMART WATER ^& DRAINAGE MANAGEMENT SYSTEM - RAMASWAMI PETA, RAJANAGARAM
echo      B.Tech Community Service Project (CSP) - Offline-First Localhost Platform
echo ===============================================================================
echo.
echo [1/3] Verifying Local Directory Structure...
set BASEDIR=%~dp0
cd /d "%BASEDIR%"

echo.
echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Smart Water Backend (FastAPI)" cmd /k "cd /d %BASEDIR%backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Waiting 3 seconds for database initialization...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting React Frontend on http://127.0.0.1:5173 ...
start "Smart Water Frontend (Vite)" cmd /k "cd /d %BASEDIR%frontend && npm run dev"

echo.
echo ===============================================================================
echo                   APPLICATION STARTED LOCALLY WITHOUT INTERNET!
echo ===============================================================================
echo.
echo  Access URLs:
echo    Frontend Application: http://127.0.0.1:5173
echo    Backend REST API Docs: http://127.0.0.1:8000/docs
echo.
echo  Demo Login Credentials:
echo    Resident Portal:
echo      Username: resident
echo      Password: resident123
echo.
echo    Admin Division:
echo      Username: admin
echo      Password: admin123
echo.
echo ===============================================================================
echo Opening web browser to http://127.0.0.1:5173 ...
start http://127.0.0.1:5173

pause
