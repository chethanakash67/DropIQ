@echo off
echo ========================================
echo   DropIQ - Offline Stores System
echo ========================================
echo.
echo This will start:
echo   1. Store Sync Scheduler
echo   2. Backend API (port 3001)
echo   3. Dashboard frontend (port 3000)
echo   4. Landing page frontend (port 3002)
echo.
echo Press Ctrl+C to stop
echo.
pause

echo.
echo Starting Store Sync Scheduler...
start "Store Sync Scheduler" cmd /k "cd /d ""%~dp0backend"" && npm run scheduler:stores"

timeout /t 2 /nobreak >nul

echo Starting Backend API...
start "DropIQ Backend" cmd /k "cd /d ""%~dp0backend"" && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Dashboard Frontend...
start "DropIQ Dashboard" cmd /k "cd /d ""%~dp0frontend\client"" && npm run dev -- -p 3000"

timeout /t 2 /nobreak >nul

echo Starting Landing Page...
start "DropIQ Landing" cmd /k "cd /d ""%~dp0frontend\landing-page"" && npm run dev -- -p 3002"

echo.
echo ========================================
echo   All services started!
echo ========================================
echo.
echo Check the new terminal windows for logs.
echo.
echo Backend API: http://localhost:3001
echo Dashboard:   http://localhost:3000
echo Landing:     http://localhost:3002
echo.
pause
