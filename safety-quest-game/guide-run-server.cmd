@echo off
cd /d "%~dp0"
set VITE_DISABLE_AUTH=true
set VITE_USE_MOCK=true
npm.cmd run dev -- --host 127.0.0.1 --port 3000
