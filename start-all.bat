@echo off
echo ========================================
echo   DropIQ - Offline Stores System
echo ========================================
echo.
echo This will start:
echo   1. Store Sync Scheduler (every 5 min)
echo   2. Main Server (port 3000)
echo.
echo Press Ctrl+C to stop
echo.
pause

echo.
echo Starting Store Sync Scheduler...
start "Store Sync Scheduler" cmd /k "npm run scheduler:stores"

timeout /t 2 /nobreak >nul

echo Starting Main Server...
start "DropIQ Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   Both services started!
echo ========================================
echo.
echo Check the new terminal windows for logs.
echo.
echo To view data: npm run view:stores
echo To check status: node system-status.js
echo.
pause
