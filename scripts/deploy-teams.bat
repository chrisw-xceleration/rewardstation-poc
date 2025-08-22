@echo off
REM RewardStation Teams Deployment - Windows Batch Script
echo.
echo =============================================
echo 🚀 RewardStation Teams Deployment
echo =============================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo ❌ PowerShell not found
    echo Please install PowerShell to continue
    pause
    exit /b 1
)

echo ✅ PowerShell found
echo.

REM Check execution policy
echo 🔐 Checking PowerShell execution policy...
powershell -Command "if ((Get-ExecutionPolicy) -eq 'Restricted') { Write-Host '⚠️  ExecutionPolicy is Restricted' -ForegroundColor Yellow; Write-Host 'Setting to RemoteSigned for current user...' -ForegroundColor Yellow; Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; Write-Host '✅ ExecutionPolicy updated' -ForegroundColor Green } else { Write-Host '✅ ExecutionPolicy is OK' -ForegroundColor Green }"

echo.
echo 🚀 Running Teams deployment...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File ".\scripts\teams-quickstart.ps1"

echo.
echo ✅ Deployment script completed!
echo.
pause