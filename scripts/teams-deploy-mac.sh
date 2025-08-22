#!/bin/bash

# RewardStation Teams Deployment Script - macOS/Linux
# Deploys Teams app using PowerShell Core on Mac/Linux

echo "🚀 RewardStation Teams Deployment (macOS/Linux)"
echo "=============================================="

# Function to check if PowerShell Core is installed
check_powershell() {
    if command -v pwsh &> /dev/null; then
        echo "✅ PowerShell Core found: $(pwsh --version)"
        return 0
    else
        echo "❌ PowerShell Core not found"
        return 1
    fi
}

# Function to install PowerShell Core on macOS
install_powershell_mac() {
    echo "📦 Installing PowerShell Core for macOS..."
    
    if command -v brew &> /dev/null; then
        echo "   Using Homebrew..."
        brew install --cask powershell
    else
        echo "❌ Homebrew not found"
        echo "💡 Please install Homebrew first: https://brew.sh"
        echo "   Then run: brew install --cask powershell"
        exit 1
    fi
}

# Function to install PowerShell Core on Linux
install_powershell_linux() {
    echo "📦 Installing PowerShell Core for Linux..."
    echo "💡 Please follow instructions at: https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-linux"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project-collab directory"
    echo "💡 Current directory: $(pwd)"
    echo "💡 Expected files: package.json, teams-app/RewardStation-Teams-App.zip"
    exit 1
fi

echo "✅ Running from project directory: $(pwd)"

# Check if app package exists
if [ ! -f "teams-app/RewardStation-Teams-App.zip" ]; then
    echo "❌ Teams app package not found"
    echo "💡 Expected location: teams-app/RewardStation-Teams-App.zip"
    exit 1
fi

echo "✅ Teams app package found"

# Check for PowerShell Core
if ! check_powershell; then
    echo ""
    echo "PowerShell Core is required for Teams management on Mac/Linux"
    echo ""
    read -p "Would you like to install PowerShell Core? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            install_powershell_mac
        else
            install_powershell_linux
        fi
    else
        echo "❌ PowerShell Core required for Teams deployment"
        exit 1
    fi
fi

# Create PowerShell script content
cat > /tmp/teams-deploy-temp.ps1 << 'EOF'
# Teams deployment PowerShell script for Mac/Linux

Write-Host "🚀 RewardStation Teams Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Install Teams module if needed
Write-Host "📦 Checking Teams PowerShell module..." -ForegroundColor Yellow
if (-not (Get-Module -ListAvailable -Name MicrosoftTeams)) {
    Write-Host "Installing Microsoft Teams module..." -ForegroundColor Yellow
    Install-Module -Name MicrosoftTeams -Force -AllowClobber -Scope CurrentUser
    Write-Host "✅ Teams module installed" -ForegroundColor Green
} else {
    Write-Host "✅ Teams module already available" -ForegroundColor Green
}

# Connect to Teams
Write-Host "🔐 Connecting to Microsoft Teams..." -ForegroundColor Yellow
try {
    $connection = Connect-MicrosoftTeams
    Write-Host "✅ Connected to Teams as: $($connection.Account)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to connect to Teams: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check for app package
$appPath = "./teams-app/RewardStation-Teams-App.zip"
if (-not (Test-Path $appPath)) {
    Write-Host "❌ App package not found: $appPath" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Found app package: $appPath" -ForegroundColor Green

# Deploy the app
Write-Host "📱 Deploying RewardStation to Teams..." -ForegroundColor Yellow
try {
    # Check if app exists
    $existing = Get-CsTeamsApp | Where-Object {$_.DisplayName -like "*RewardStation*"}
    
    if ($existing) {
        Write-Host "⚠️  App exists, updating..." -ForegroundColor Yellow
        $app = Set-CsTeamsApp -Identity $existing.Id -Path $appPath
    } else {
        Write-Host "➕ Creating new app..." -ForegroundColor Yellow
        $app = New-CsTeamsApp -Path $appPath
    }
    
    # Make it available
    Set-CsTeamsApp -Identity $app.Id -PublishingState "Published"
    
    Write-Host "✅ RewardStation deployed successfully!" -ForegroundColor Green
    Write-Host "   App ID: $($app.Id)" -ForegroundColor Gray
    Write-Host "   Display Name: $($app.DisplayName)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test backend
Write-Host "🧪 Testing backend connection..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "https://rewardstation-poc.fly.dev/teams/health"
    if ($health.status -eq "ready") {
        Write-Host "✅ Backend is ready and responding" -ForegroundColor Green
        Write-Host "   Platform: $($health.platform)" -ForegroundColor Gray
        Write-Host "   Framework: $($health.framework)" -ForegroundColor Gray
        Write-Host "   Commands: $($health.commands)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Backend status: $($health.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Backend health check failed, but app may still work" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open Microsoft Teams" -ForegroundColor White
Write-Host "2. In any channel, type: @RewardStation help" -ForegroundColor White
Write-Host "3. Try: @RewardStation thanks @someone `"Great work!`"" -ForegroundColor White
Write-Host "4. Use: @RewardStation give @someone (for full recognition form)" -ForegroundColor White
Write-Host ""
Write-Host "📊 Available commands:" -ForegroundColor Cyan
Write-Host "• @RewardStation help - AI-powered help" -ForegroundColor White
Write-Host "• @RewardStation thanks @user `"message`" - Quick 25-point thanks" -ForegroundColor White
Write-Host "• @RewardStation give @user - Interactive recognition form" -ForegroundColor White
Write-Host "• @RewardStation balance - Check points balance" -ForegroundColor White
Write-Host ""
Write-Host "🏥 Health check: https://rewardstation-poc.fly.dev/teams/health" -ForegroundColor Gray
EOF

# Run the PowerShell script
echo "🔄 Running Teams deployment via PowerShell Core..."
echo ""

pwsh -File /tmp/teams-deploy-temp.ps1

# Clean up temp file
rm -f /tmp/teams-deploy-temp.ps1

echo ""
echo "✅ Deployment script completed!"