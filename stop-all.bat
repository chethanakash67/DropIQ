@echo off
echo ========================================
echo   DropIQ - Stop All Services
echo ========================================
echo.
echo This will attempt to close the terminal windows started by start-all.bat
echo and kill remaining node.exe processes that may be running.
echo.
pause

set ROOT=%~dp0

echo Stopping Store Sync Scheduler...
taskkill /FI "WINDOWTITLE eq Store Sync Scheduler" /T /F >nul 2>&1

echo Stopping DropIQ Backend...
taskkill /FI "WINDOWTITLE eq DropIQ Backend" /T /F >nul 2>&1

echo Stopping DropIQ Dashboard...
taskkill /FI "WINDOWTITLE eq DropIQ Dashboard" /T /F >nul 2>&1

echo Stopping DropIQ Landing...
taskkill /FI "WINDOWTITLE eq DropIQ Landing" /T /F >nul 2>&1

echo.
echo Killing any remaining node.exe processes (if any)...
for /f "tokens=2 delims=," %%p in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH') do (
  echo Killing PID %%~p
  taskkill /PID %%~p /T /F >nul 2>&1
)

echo.
echo Done. Verify there are no running DropIQ windows.
pause
