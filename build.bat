@echo off
chcp 65001 >nul
cd /d "D:\25-WorkBuddy\project\2026-06-29-10-18-40\world-clock"
title WorldClock Build
echo ========================================
echo  WorldClock - Windows Installer Builder
echo ========================================
echo.
echo Building... Please wait...
echo.
npm run build:win
echo.
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo.
echo ========================================
echo  Build Complete!
echo  Installer: dist\WorldClock-Setup-1.0.0.exe
echo ========================================
pause
