# 🔧 Teams CLI Deployment Guide
**RewardStation Teams App - PowerShell CLI Setup**

---

## 🚀 **Quick Start (Recommended)**

### **One-Command Deployment:**
```powershell
# Run from project-collab directory
.\scripts\teams-quickstart.ps1
```

**That's it!** This script will:
- ✅ Install Teams PowerShell module if needed
- ✅ Connect to your Teams tenant
- ✅ Deploy RewardStation app
- ✅ Configure permissions
- ✅ Test backend connectivity
- ✅ Show you how to test in Teams

---

## 🎛️ **Advanced Options**

### **Full-Featured Script:**
```powershell
# Install Teams module only
.\scripts\teams-deploy.ps1 -Install

# Deploy app
.\scripts\teams-deploy.ps1 -Deploy

# Check app status
.\scripts\teams-deploy.ps1 -Status

# Test functionality
.\scripts\teams-deploy.ps1 -Test

# Remove app
.\scripts\teams-deploy.ps1 -Remove
```

### **Windows Batch File:**
```cmd
# Double-click or run from command prompt
.\scripts\deploy-teams.bat
```

---

## 📋 **Prerequisites**

### **Required:**
- ✅ **Teams Administrator** role in your organization
- ✅ **PowerShell 5.1+** (Windows) or **PowerShell Core 7+** (Mac/Linux)
- ✅ **Internet connection** for Teams module installation
- ✅ **RewardStation app package** (`teams-app/RewardStation-Teams-App.zip`)

### **Optional:**
- Teams Admin Center access (for manual verification)
- Azure portal access (not required with CLI approach)

---

## 🎯 **Step-by-Step Manual Process**

If you prefer to run commands individually:

### **Step 1: Install Teams Module**
```powershell
# Install (run as admin or with -Scope CurrentUser)
Install-Module -Name MicrosoftTeams -Force -AllowClobber -Scope CurrentUser

# Verify installation
Get-Module -ListAvailable -Name MicrosoftTeams
```

### **Step 2: Connect to Teams**
```powershell
# Connect (will open browser for authentication)
Connect-MicrosoftTeams

# Verify connection
Get-CsTenant
```

### **Step 3: Deploy App**
```powershell
# Navigate to your project directory
cd "C:\path\to\project-collab"

# Deploy the app
$app = New-CsTeamsApp -Path ".\teams-app\RewardStation-Teams-App.zip"

# Make it available
Set-CsTeamsApp -Identity $app.Id -PublishingState "Published"

# Configure permissions
Set-CsTeamsAppPermissionPolicy -Identity "Global" -AllowUserPinning $true
```

### **Step 4: Verify Deployment**
```powershell
# Check app status
Get-CsTeamsApp | Where-Object {$_.DisplayName -like "*RewardStation*"}

# Test backend health
Invoke-RestMethod "https://rewardstation-poc.fly.dev/teams/health"
```

---

## 🧪 **Testing Your Deployment**

### **Backend Health Check:**
```powershell
# Should return status: "ready"
Invoke-RestMethod "https://rewardstation-poc.fly.dev/teams/health"
```

### **Teams App Testing:**
1. **Open Microsoft Teams** (desktop or web)
2. **In any channel or chat, type:**
   ```
   @RewardStation help
   ```
3. **Expected result:** Help message with available commands
4. **Try full workflow:**
   ```
   @RewardStation give @someone
   ```

### **Available Commands:**
- `@RewardStation help` - AI-powered help and guidance
- `@RewardStation thanks @user "message"` - Quick 25-point thanks
- `@RewardStation give @user` - Interactive recognition form with AI enhancement
- `@RewardStation balance` - Check current points balance

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **❌ "Execution policy error"**
```powershell
# Fix execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **❌ "Teams module not found"**
```powershell
# Install with different approach
Install-Module -Name MicrosoftTeams -Force -AllowClobber
```

#### **❌ "App upload failed"**
```powershell
# Check app package exists
Test-Path ".\teams-app\RewardStation-Teams-App.zip"

# Verify you're in correct directory
Get-Location
```

#### **❌ "Bot not responding in Teams"**
- Check backend health: https://rewardstation-poc.fly.dev/teams/health
- Verify app is published: `Get-CsTeamsApp | Where-Object {$_.DisplayName -like "*RewardStation*"}`
- Try re-deploying: `.\scripts\teams-deploy.ps1 -Deploy`

#### **❌ "Access denied"**
- Verify you have Teams Administrator role
- Try: `Get-CsTenant` to test permissions
- Contact IT for proper role assignment

### **Debug Commands:**
```powershell
# Check your roles
Get-AzureADDirectoryRole

# View Teams app policies
Get-CsTeamsAppPermissionPolicy

# List all Teams apps
Get-CsTeamsApp | Select-Object Id, DisplayName, DistributionMethod

# Check connection status
Get-CsTenant | Select-Object TenantId, DisplayName
```

---

## 📊 **Script Features**

### **teams-deploy.ps1 Capabilities:**
- ✅ **Automatic module installation**
- ✅ **Connection management**
- ✅ **App deployment with error handling**
- ✅ **Permission configuration**
- ✅ **Status checking and reporting**
- ✅ **Backend health testing**
- ✅ **Color-coded output**
- ✅ **Detailed logging**

### **Safety Features:**
- ✅ **Non-destructive by default**
- ✅ **Confirmation prompts for removal**
- ✅ **Graceful error handling**
- ✅ **Rollback capabilities**
- ✅ **Current user scope installation**

---

## 🎯 **Production Deployment Checklist**

- [ ] **Teams Administrator access confirmed**
- [ ] **PowerShell module installed and updated**
- [ ] **App package verified and ready**
- [ ] **Backend health check passing**
- [ ] **Organization policies allow custom apps**
- [ ] **Testing plan prepared**
- [ ] **User training materials ready**

---

## 📞 **Support & Resources**

### **Documentation:**
- [Microsoft Teams PowerShell Reference](https://docs.microsoft.com/en-us/powershell/teams/)
- [Teams App Development Guide](https://docs.microsoft.com/en-us/microsoftteams/platform/)
- RewardStation documentation: `README.md`

### **Script Files:**
- `scripts/teams-deploy.ps1` - Full-featured deployment script
- `scripts/teams-quickstart.ps1` - Simple one-command deployment  
- `scripts/deploy-teams.bat` - Windows batch file wrapper
- `teams-app/RewardStation-Teams-App.zip` - App package

---

## 🎉 **Success!**

Once deployed successfully, your organization will have:
- 🤖 **AI-powered recognition bot** in Teams
- ⚡ **10-second recognition workflow**
- 🎯 **Zero-training user experience**
- 📊 **Enterprise-ready B2B approval flows**
- 🚀 **First-to-market competitive advantage**

**Ready to revolutionize employee recognition with AI!** 🎊