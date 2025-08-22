# RewardStation Teams App Deployment Script
# PowerShell script for deploying RewardStation via Teams CLI

param(
    [switch]$Install,
    [switch]$Deploy,
    [switch]$Status,
    [switch]$Test,
    [switch]$Remove,
    [string]$AppPath = ".\teams-app\RewardStation-Teams-App.zip"
)

Write-Host "🚀 RewardStation Teams Deployment Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Function to check if Teams module is installed
function Test-TeamsModule {
    $module = Get-Module -ListAvailable -Name MicrosoftTeams
    if (-not $module) {
        Write-Host "❌ Microsoft Teams PowerShell module not found" -ForegroundColor Red
        return $false
    }
    Write-Host "✅ Teams PowerShell module found (Version: $($module.Version))" -ForegroundColor Green
    return $true
}

# Function to install Teams module
function Install-TeamsModule {
    Write-Host "📦 Installing Microsoft Teams PowerShell module..." -ForegroundColor Yellow
    try {
        Install-Module -Name MicrosoftTeams -Force -AllowClobber -Scope CurrentUser
        Write-Host "✅ Teams module installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Teams module: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to connect to Teams
function Connect-Teams {
    Write-Host "🔐 Connecting to Microsoft Teams..." -ForegroundColor Yellow
    try {
        $connection = Connect-MicrosoftTeams
        if ($connection) {
            Write-Host "✅ Connected to Teams as: $($connection.Account)" -ForegroundColor Green
            Write-Host "   Tenant: $($connection.TenantId)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Failed to connect to Teams: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Make sure you have Teams Administrator privileges" -ForegroundColor Yellow
        exit 1
    }
}

# Function to check app package exists
function Test-AppPackage {
    if (-not (Test-Path $AppPath)) {
        Write-Host "❌ App package not found: $AppPath" -ForegroundColor Red
        Write-Host "💡 Expected location: .\teams-app\RewardStation-Teams-App.zip" -ForegroundColor Yellow
        return $false
    }
    Write-Host "✅ App package found: $AppPath" -ForegroundColor Green
    return $true
}

# Function to deploy app
function Deploy-RewardStationApp {
    Write-Host "📱 Deploying RewardStation Teams App..." -ForegroundColor Yellow
    
    try {
        # Check if app already exists
        $existingApp = Get-CsTeamsApp | Where-Object {$_.DisplayName -like "*RewardStation*"}
        
        if ($existingApp) {
            Write-Host "⚠️  RewardStation app already exists. Updating..." -ForegroundColor Yellow
            $app = Set-CsTeamsApp -Identity $existingApp.Id -Path $AppPath
        } else {
            Write-Host "➕ Creating new RewardStation app..." -ForegroundColor Yellow
            $app = New-CsTeamsApp -Path $AppPath
        }
        
        Write-Host "✅ App deployed successfully!" -ForegroundColor Green
        Write-Host "   App ID: $($app.Id)" -ForegroundColor Gray
        Write-Host "   Display Name: $($app.DisplayName)" -ForegroundColor Gray
        Write-Host "   Version: $($app.Version)" -ForegroundColor Gray
        
        return $app
    } catch {
        Write-Host "❌ Failed to deploy app: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to configure app permissions
function Set-AppPermissions {
    param($AppId)
    
    Write-Host "🔐 Configuring app permissions..." -ForegroundColor Yellow
    
    try {
        # Allow the app for all users
        Set-CsTeamsAppPermissionPolicy -Identity "Global" -AllowUserPinning $true
        
        # Set app as available
        Set-CsTeamsApp -Identity $AppId -PublishingState "Published"
        
        Write-Host "✅ App permissions configured" -ForegroundColor Green
        Write-Host "   Status: Published" -ForegroundColor Gray
        Write-Host "   Available to: All organization users" -ForegroundColor Gray
        
    } catch {
        Write-Host "⚠️  Permission configuration warning: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "💡 You may need to configure permissions manually in Teams Admin Center" -ForegroundColor Yellow
    }
}

# Function to check app status
function Get-AppStatus {
    Write-Host "📊 Checking RewardStation app status..." -ForegroundColor Yellow
    
    $apps = Get-CsTeamsApp | Where-Object {$_.DisplayName -like "*RewardStation*"}
    
    if (-not $apps) {
        Write-Host "❌ RewardStation app not found" -ForegroundColor Red
        return
    }
    
    foreach ($app in $apps) {
        Write-Host "✅ RewardStation App Found:" -ForegroundColor Green
        Write-Host "   App ID: $($app.Id)" -ForegroundColor Gray
        Write-Host "   Display Name: $($app.DisplayName)" -ForegroundColor Gray
        Write-Host "   Version: $($app.Version)" -ForegroundColor Gray
        Write-Host "   Distribution Method: $($app.DistributionMethod)" -ForegroundColor Gray
        
        # Check app policies
        try {
            $policy = Get-CsTeamsAppPermissionPolicy -Identity "Global"
            Write-Host "   Global Policy: User pinning allowed = $($policy.AllowUserPinning)" -ForegroundColor Gray
        } catch {
            Write-Host "   Policy Status: Unable to retrieve" -ForegroundColor Yellow
        }
    }
}

# Function to test app functionality
function Test-AppFunctionality {
    Write-Host "🧪 Testing RewardStation app functionality..." -ForegroundColor Yellow
    
    # Check backend health
    try {
        $healthUrl = "https://rewardstation-poc.fly.dev/teams/health"
        Write-Host "   Checking backend health: $healthUrl" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $healthUrl -Method Get
        
        if ($response.status -eq "ready") {
            Write-Host "✅ Backend health check passed" -ForegroundColor Green
            Write-Host "   Platform: $($response.platform)" -ForegroundColor Gray
            Write-Host "   Framework: $($response.framework)" -ForegroundColor Gray
            Write-Host "   Commands: $($response.commands)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Backend status: $($response.status)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎯 Manual testing steps:" -ForegroundColor Cyan
    Write-Host "   1. Open Microsoft Teams" -ForegroundColor White
    Write-Host "   2. In any channel, type: @RewardStation help" -ForegroundColor White
    Write-Host "   3. Expected: Help message with available commands" -ForegroundColor White
    Write-Host "   4. Try: @RewardStation thanks @someone \"Great work!\"" -ForegroundColor White
}

# Function to remove app
function Remove-RewardStationApp {
    Write-Host "🗑️  Removing RewardStation app..." -ForegroundColor Yellow
    
    $apps = Get-CsTeamsApp | Where-Object {$_.DisplayName -like "*RewardStation*"}
    
    if (-not $apps) {
        Write-Host "❌ RewardStation app not found" -ForegroundColor Red
        return
    }
    
    foreach ($app in $apps) {
        try {
            Remove-CsTeamsApp -Identity $app.Id -Confirm:$false
            Write-Host "✅ Removed app: $($app.DisplayName)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to remove app: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Main script execution
Write-Host ""

# Handle parameters
if ($Install) {
    if (-not (Test-TeamsModule)) {
        Install-TeamsModule
    }
    Write-Host "✅ Installation complete" -ForegroundColor Green
    exit 0
}

if ($Remove) {
    if (-not (Test-TeamsModule)) {
        Write-Host "❌ Teams module required for removal" -ForegroundColor Red
        exit 1
    }
    Connect-Teams
    Remove-RewardStationApp
    exit 0
}

if ($Status) {
    if (-not (Test-TeamsModule)) {
        Write-Host "❌ Teams module required for status check" -ForegroundColor Red
        exit 1
    }
    Connect-Teams
    Get-AppStatus
    exit 0
}

if ($Test) {
    Test-AppFunctionality
    exit 0
}

if ($Deploy) {
    # Full deployment process
    if (-not (Test-TeamsModule)) {
        Install-TeamsModule
    }
    
    if (-not (Test-AppPackage)) {
        exit 1
    }
    
    Connect-Teams
    
    $app = Deploy-RewardStationApp
    if ($app) {
        Set-AppPermissions -AppId $app.Id
        Write-Host ""
        Get-AppStatus
        Write-Host ""
        Test-AppFunctionality
        
        Write-Host ""
        Write-Host "🎉 RewardStation Teams deployment complete!" -ForegroundColor Green
        Write-Host "💡 Test with: @RewardStation help" -ForegroundColor Yellow
    }
    exit 0
}

# Default: Show usage
Write-Host "Usage: .\teams-deploy.ps1 [options]" -ForegroundColor White
Write-Host ""
Write-Host "Options:" -ForegroundColor Yellow
Write-Host "  -Install    Install Microsoft Teams PowerShell module" -ForegroundColor White
Write-Host "  -Deploy     Deploy RewardStation app to Teams" -ForegroundColor White
Write-Host "  -Status     Check current app status" -ForegroundColor White
Write-Host "  -Test       Test app functionality" -ForegroundColor White
Write-Host "  -Remove     Remove RewardStation app" -ForegroundColor White
Write-Host ""
Write-Host "Examples:" -ForegroundColor Yellow
Write-Host "  .\teams-deploy.ps1 -Install" -ForegroundColor Gray
Write-Host "  .\teams-deploy.ps1 -Deploy" -ForegroundColor Gray
Write-Host "  .\teams-deploy.ps1 -Status" -ForegroundColor Gray
Write-Host ""