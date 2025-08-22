# Microsoft Teams Admin Portal Deployment Guide
**RewardStation AI-Powered Recognition Platform**

---

## 📦 Package Contents

This folder contains everything your IT team needs to deploy RewardStation to Microsoft Teams:

### Files Included:
- `RewardStation-Teams-App.zip` - **Teams app package for upload**
- `IT-DEPLOYMENT-INSTRUCTIONS.md` - Complete step-by-step deployment guide  
- `TEAMS-ADMIN-DEPLOYMENT.md` - This quick reference guide
- `manifest.json` - Teams app configuration (already in ZIP)
- Icon files - App icons (already in ZIP)

---

## ⚡ Quick Deployment Steps

### For IT Administrator:

1. **Upload to Teams Admin Portal**
   - Go to: https://admin.teams.microsoft.com
   - Navigate: **Teams apps** → **Manage apps** → **Upload new app**
   - Upload: `RewardStation-Teams-App.zip`

2. **Configure App Permissions** 
   - Review and approve app permissions in admin portal
   - Set availability (organization-wide recommended)

3. **Azure Configuration Required**
   - The app package uses placeholder `AZURE_APP_ID_PLACEHOLDER`
   - **You must complete Azure setup first** (see detailed instructions below)

---

## 🔧 Azure Prerequisites

**IMPORTANT**: Before uploading to Teams, complete these Azure steps:

### Step 1: Azure App Registration
1. Go to: https://portal.azure.com
2. **App registrations** → **New registration**
3. Name: `RewardStation Bot`
4. Redirect URI: `https://rewardstation-poc.fly.dev/teams/oauth`
5. **Copy the Application (client) ID** - you'll need this!

### Step 2: Create Client Secret
1. In your app registration → **Certificates & secrets**
2. **New client secret** → Description: `RewardStation Teams`
3. **Copy the secret value** - you'll need this!

### Step 3: Bot Framework Registration
1. Azure Portal → **Create a resource** → **Azure Bot**
2. Bot handle: `rewardstation-bot-[your-org]` (must be unique)
3. Use the App ID and Secret from Steps 1-2
4. Messaging endpoint: `https://rewardstation-poc.fly.dev/teams/messages`
5. Enable **Microsoft Teams** channel

### Step 4: Update App Package
Once you have your Azure App ID:
1. Extract `RewardStation-Teams-App.zip`
2. Edit `manifest.json` - replace all `AZURE_APP_ID_PLACEHOLDER` with your actual App ID
3. Re-zip the files: `manifest.json`, `icon-color-192.png`, `icon-outline-32.png`
4. Upload the updated ZIP to Teams Admin Portal

---

## 🚀 Production Configuration

**Send these credentials to development team:**
- Azure App ID: `[from Step 1]`
- Azure Client Secret: `[from Step 2]`

*Development team will configure production environment with these credentials.*

---

## ✅ Testing & Verification

### After Deployment:
1. **System Health**: Check https://rewardstation-poc.fly.dev/teams/health
2. **Teams Testing**: In any Teams channel, type `@RewardStation help`
3. **Expected Response**: Help message with available commands

### Available Commands:
- `@RewardStation help` - Show help and commands
- `@RewardStation thanks @user "message"` - Quick 25-point thanks
- `@RewardStation give @user` - Interactive recognition form  
- `@RewardStation balance` - Check points balance

---

## 🛠️ Troubleshooting

### Common Issues:

**❌ "Bot not responding"**
- Verify Azure App ID matches in manifest.json
- Check Bot Framework messaging endpoint
- Ensure Teams channel is enabled in Azure Bot

**❌ "App upload failed"**  
- Verify ZIP contains: manifest.json + 2 icon files
- Check manifest.json syntax is valid JSON
- Ensure App ID is not still placeholder value

**❌ "Permission denied"**
- Confirm you have Teams Administrator privileges
- Check organization allows custom app uploads

### Support Contacts:
- **Technical Issues**: Development team
- **Teams Admin Help**: Microsoft Teams support
- **Azure Issues**: Azure support portal

---

## 📋 Deployment Checklist

### Pre-Deployment:
- [ ] Teams Administrator access confirmed
- [ ] Azure portal access available  
- [ ] App package downloaded and ready

### Azure Setup:
- [ ] App registration created
- [ ] Client secret generated
- [ ] Bot Framework resource created
- [ ] Teams channel enabled
- [ ] Credentials shared with dev team

### Teams Deployment:
- [ ] manifest.json updated with real App ID
- [ ] App package re-zipped
- [ ] Package uploaded to admin portal
- [ ] Permissions approved
- [ ] Availability configured
- [ ] Testing completed successfully

### Post-Deployment:
- [ ] Health check passes
- [ ] Commands respond in Teams
- [ ] Users can access app
- [ ] Support documentation distributed

---

## 🎯 Expected Timeline

- **Azure Setup**: 15 minutes
- **App Package Update**: 5 minutes  
- **Teams Admin Upload**: 5 minutes
- **Testing & Verification**: 10 minutes
- **Total Time**: ~35 minutes

---

## 📞 Next Steps

1. **Complete Azure setup** using credentials above
2. **Update app package** with real Azure App ID
3. **Upload to Teams Admin Portal**  
4. **Test with development team**
5. **Roll out to users** with training materials

---

**Questions?** Refer to `IT-DEPLOYMENT-INSTRUCTIONS.md` for complete detailed instructions, or contact the development team.

**Package Created**: August 12, 2025  
**Status**: Ready for Teams Admin Portal deployment