# RewardStation Teams Quick Setup
# Simple one-command deployment script

Write-Host "🚀 RewardStation Teams Quick Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Step 1: Install Teams module if needed
Write-Host "📦 Checking Teams PowerShell module..." -ForegroundColor Yellow
if (-not (Get-Module -ListAvailable -Name MicrosoftTeams)) {
    Write-Host "Installing Microsoft Teams module..." -ForegroundColor Yellow
    Install-Module -Name MicrosoftTeams -Force -AllowClobber -Scope CurrentUser
    Write-Host "✅ Teams module installed" -ForegroundColor Green
} else {
    Write-Host "✅ Teams module already available" -ForegroundColor Green
}

# Step 2: Connect to Teams
Write-Host "🔐 Connecting to Microsoft Teams..." -ForegroundColor Yellow
Connect-MicrosoftTeams

# Step 3: Check for app package
$appPath = ".\teams-app\RewardStation-Teams-App.zip"
if (-not (Test-Path $appPath)) {
    Write-Host "❌ App package not found at: $appPath" -ForegroundColor Red
    Write-Host "💡 Make sure you run this from the project-collab directory" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Found app package: $appPath" -ForegroundColor Green

# Step 4: Deploy the app
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
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Test backend connectivity
Write-Host "🧪 Testing backend connection..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "https://rewardstation-poc.fly.dev/teams/health"
    if ($health.status -eq "ready") {
        Write-Host "✅ Backend is ready and responding" -ForegroundColor Green
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
Write-Host "3. Try: @RewardStation thanks @someone \"Great work!\"" -ForegroundColor White
Write-Host "4. Use: @RewardStation give @someone (for full recognition form)" -ForegroundColor White
Write-Host ""
Write-Host "📊 Commands available:" -ForegroundColor Cyan
Write-Host "• @RewardStation help - AI-powered help" -ForegroundColor White
Write-Host "• @RewardStation thanks @user \"message\" - Quick 25-point thanks" -ForegroundColor White
Write-Host "• @RewardStation give @user - Interactive recognition form" -ForegroundColor White
Write-Host "• @RewardStation balance - Check points balance" -ForegroundColor White
Write-Host ""
Write-Host "🏥 Health check: https://rewardstation-poc.fly.dev/teams/health" -ForegroundColor Gray