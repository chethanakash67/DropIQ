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
echo.
echo Preparing environment and installing dependencies if missing...

set ROOT=%~dp0

rem Install backend deps if needed
if not exist "%ROOT%backend\node_modules" (
	echo Installing backend dependencies...
	pushd "%ROOT%backend"
	npm install
	popd
) else (
	echo Backend dependencies present.
)

rem Install dashboard deps if needed
if not exist "%ROOT%frontend\client\node_modules" (
	echo Installing dashboard dependencies...
	pushd "%ROOT%frontend\client"
	npm install
	popd
) else (
	echo Dashboard dependencies present.
)

rem Install landing deps if needed
if not exist "%ROOT%frontend\landing-page\node_modules" (
	echo Installing landing-page dependencies...
	pushd "%ROOT%frontend\landing-page"
	npm install
	popd
) else (
	echo Landing-page dependencies present.
)

echo.
echo Starting services...

start "Store Sync Scheduler" cmd /k "cd /d "%ROOT%backend" && npm run scheduler:stores"

timeout /t 2 /nobreak >nul

start "DropIQ Backend" cmd /k "cd /d "%ROOT%backend" && npm run dev"

timeout /t 2 /nobreak >nul

start "DropIQ Dashboard" cmd /k "cd /d "%ROOT%frontend\client" && npm run dev -- -p 3000"

timeout /t 2 /nobreak >nul

start "DropIQ Landing" cmd /k "cd /d "%ROOT%frontend\landing-page" && npm run dev -- -p 3002"

echo.
echo ========================================
echo   All services started (windows opened).
echo ========================================
echo.
echo Check the new terminal windows for logs.
echo.
echo Backend API: http://localhost:3001
echo Dashboard:   http://localhost:3000
echo Landing:     http://localhost:3002
echo.
pause
