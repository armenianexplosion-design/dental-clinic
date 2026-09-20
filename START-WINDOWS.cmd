@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or newer, then run this file again.
  echo Download: https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing website dependencies. Internet access is required.
  call npm ci
  if errorlevel 1 (
    echo Installation failed. Please copy the error shown above.
    pause
    exit /b 1
  )
)
echo Keep this window open. Open the Local address printed below in your browser.
call npm run dev -- --host 127.0.0.1
pause
