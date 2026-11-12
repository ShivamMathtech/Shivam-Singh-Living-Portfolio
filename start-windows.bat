@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or newer from https://nodejs.org and run this file again.
  pause
  exit /b 1
)
echo Starting Shivam Singh Portfolio at http://localhost:5173
start "Portfolio browser" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173"
node scripts/dev.mjs
pause
