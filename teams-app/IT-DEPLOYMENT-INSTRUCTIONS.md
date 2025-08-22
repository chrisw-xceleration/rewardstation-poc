# RewardStation Teams Integration - IT Deployment Instructions

**For IT Team/Teams Administrator**

## Overview
Deploy the RewardStation AI-powered recognition bot to Microsoft Teams. The development team has completed all code and configuration - this requires only standard Teams app deployment.

## Prerequisites
- Teams Administrator access to https://admin.teams.microsoft.com
- Azure portal access for App Registration
- 15 minutes total deployment time

## Phase 1: Azure App Registration (5 minutes)

1. **Create App Registration**
   - Go to https://portal.azure.com
   - Search "App registrations" → "New registration"
   - Name: `RewardStation Bot`
   - Redirect URI: `https://rewardstation-poc.fly.dev/teams/oauth`
   - Click "Register"
   - **COPY THE APPLICATION (CLIENT) ID** - needed for Phase 3

2. **Create Client Secret**
   - In your new app registration → "Certificates & secrets"
   - "New client secret"
   - Description: `RewardStation Teams Integration`
   - Expires: 24 months
   - **COPY THE SECRET VALUE** - needed for Phase 3

## Phase 2: Bot Framework Registration (5 minutes)

1. **Create Azure Bot Resource**
   - Azure Portal → "Create a resource"
   - Search "Azure Bot" → Create
   - Bot handle: `rewardstation-bot-[your-org]` (must be globally unique)
   - Resource Group: Create new or use existing
   - Pricing: F0 (Free tier is sufficient)
   - App ID: Use the Application ID from Phase 1
   - App Password: Use the Client Secret from Phase 1

2. **Configure Bot Endpoint**
   - In your new bot resource → "Configuration" 
   - Messaging endpoint: `https://rewardstation-poc.fly.dev/teams/messages`
   - Save

3. **Enable Teams Channel**
   - Bot resource → "Channels"
   - Click "Microsoft Teams" icon
   - Accept terms and click "Apply"
   - Verify "Microsoft Teams" shows as "Running"

## Phase 3: Production Configuration (2 minutes)

**Send these credentials to the development team:**
- App ID: [from Phase 1]
- Client Secret: [from Phase 1]

*The development team will configure the production environment with these credentials.*

## Phase 4: Teams App Deployment (3 minutes)

**Development team will provide you with:**
- `RewardStation-Teams-App.zip` file

**Deploy to Teams:**

1. **Go to Teams Admin Center**
   - URL: https://admin.teams.microsoft.com
   - Sign in with Teams Administrator account

2. **Upload Custom App**
   - Left navigation → "Teams apps" → "Manage apps"
   - Click "Upload new app" → "Upload"
   - Select the `RewardStation-Teams-App.zip` file provided by dev team
   - Click "Upload"

3. **Configure App Permissions**
   - Find "RewardStation" in the apps list
   - Click on it → "Permissions" tab
   - Review and approve requested permissions:
     - Identity (for user recognition)
     - Message team members (for sending recognitions)

4. **Set Availability** (Choose one):
   
   **Option A: Organization-wide (Recommended)**
   - "Settings" tab → "Availability"
   - "Available to everyone in your organization"
   - Click "Update"

   **Option B: Specific Users/Groups**
   - "Settings" tab → "Availability" 
   - "Available to specific users and groups"
   - Add users/groups who should have access
   - Click "Update"

## Phase 5: Verification (1 minute)

1. **Test Bot Health**
   - Open browser: https://rewardstation-poc.fly.dev/teams/health
   - Should show: `"status": "ready", "authentication": "configured"`

2. **Test in Teams**
   - Open Microsoft Teams
   - Go to "Apps" → Search "RewardStation"
   - Add to a team or personal scope
   - Test command: `@RewardStation help`
   - Should receive help message with available commands

## Available Commands
Once deployed, users can use:
- `@RewardStation help` - Show available commands
- `@RewardStation thanks @user "message"` - Quick 25-point recognition
- `@RewardStation give @user` - Interactive recognition form
- `@RewardStation balance` - Check points balance

## Security Notes
- All credentials are stored securely in production environment variables
- Bot only responds to authenticated Teams users
- No sensitive data is logged or stored
- All recognition data flows through existing RewardStation security protocols

## Support
- Technical issues: Contact development team
- Teams Admin questions: Standard Microsoft Teams support
- Production system status: https://rewardstation-poc.fly.dev/health

## Rollback Plan
If issues occur:
1. Teams Admin Center → "Manage apps" → Find "RewardStation" → "Remove"
2. Azure Portal → Delete bot resource and app registration
3. Contact development team for assistance

---

**Estimated Total Time: 15 minutes**  
**Required Access: Teams Administrator + Azure Portal**  
**Status: Ready for deployment**