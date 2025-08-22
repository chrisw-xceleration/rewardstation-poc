# Microsoft Teams Integration Setup Guide

**RewardStation Teams Bot Configuration**

> 🎯 **Objective**: Deploy AI-powered recognition bot in Microsoft Teams with full feature parity to Slack integration

## Overview

The RewardStation Teams integration provides:
- 🤖 **AI-Powered Commands**: Natural language recognition with Maslow X enhancement
- 📱 **Adaptive Cards**: Rich interactive recognition forms
- 🔄 **Two-Step Approval**: B2B workflow with message enhancement preview
- 🏢 **Enterprise Ready**: SSO integration, compliance, and admin controls

## Prerequisites

Before starting Teams integration, ensure you have:
- ✅ Slack integration working (for reference/comparison)
- ✅ Microsoft Teams Admin access
- ✅ Azure App Registration permissions
- ✅ Production deployment on Fly.io

## Phase 1: Microsoft Teams App Registration

### Step 1: Create Azure App Registration

1. **Navigate to Azure Portal**
   - Go to https://portal.azure.com
   - Search for "App registrations"
   - Click "New registration"

2. **Configure App Registration**
   ```
   Name: RewardStation Bot
   Supported account types: Single tenant (or Multi-tenant for enterprise)
   Redirect URI: https://rewardstation-poc.fly.dev/teams/oauth
   ```

3. **Generate App Credentials**
   ```bash
   # Copy these values for environment configuration
   Application (client) ID: <GUID>
   Directory (tenant) ID: <GUID>
   
   # Create client secret (Certificates & secrets > New client secret)
   Client Secret: <SECRET_VALUE>
   ```

### Step 2: Configure Bot Framework

1. **Register Bot in Azure**
   - Go to "Create a resource" → "Bot Channels Registration"
   - Use the same App ID from Step 1
   - Set messaging endpoint: `https://rewardstation-poc.fly.dev/teams/messages`

2. **Add Microsoft Teams Channel**
   - In Bot resource → Channels
   - Click Microsoft Teams channel
   - Enable and configure

### Step 3: Create Teams App Manifest

Create `teams-app-manifest.json`:
```json
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.0",
  "id": "<YOUR_APP_ID>",
  "packageName": "com.xceleration.rewardstation",
  "developer": {
    "name": "Xceleration Partners",
    "websiteUrl": "https://rewardstation-poc.fly.dev",
    "privacyUrl": "https://rewardstation-poc.fly.dev/privacy",
    "termsOfUseUrl": "https://rewardstation-poc.fly.dev/terms"
  },
  "icons": {
    "color": "icon-color-192.png",
    "outline": "icon-outline-32.png"
  },
  "name": {
    "short": "RewardStation",
    "full": "RewardStation AI Recognition Platform"
  },
  "description": {
    "short": "AI-powered employee recognition in Teams",
    "full": "The world's first AI-powered recognition platform with native Teams support. Recognize great work with intelligent message enhancement and B2B approval workflows."
  },
  "accentColor": "#512BD4",
  "bots": [
    {
      "botId": "<YOUR_APP_ID>",
      "scopes": ["personal", "team", "groupchat"],
      "isNotificationOnly": false,
      "supportsFiles": false,
      "supportsCalling": false,
      "supportsVideo": false,
      "commandLists": [
        {
          "scopes": ["personal", "team", "groupchat"],
          "commands": [
            {
              "title": "help",
              "description": "Show available commands and AI assistance"
            },
            {
              "title": "thanks @user \"message\"",
              "description": "Send quick thanks with 25 points"
            },
            {
              "title": "give @user",
              "description": "Open interactive recognition form"
            },
            {
              "title": "balance",
              "description": "Check your current points balance"
            }
          ]
        }
      ]
    }
  ],
  "permissions": [
    "identity",
    "messageTeamMembers"
  ],
  "validDomains": [
    "rewardstation-poc.fly.dev"
  ],
  "webApplicationInfo": {
    "id": "<YOUR_APP_ID>",
    "resource": "https://graph.microsoft.com"
  }
}
```

## Phase 2: Environment Configuration

### Production Environment Variables

Add to Fly.io secrets:
```bash
# Microsoft Teams Configuration
fly secrets set TEAMS_APP_ID="<YOUR_APP_ID>"
fly secrets set TEAMS_APP_PASSWORD="<YOUR_CLIENT_SECRET>"

# Optional: Teams-specific settings
fly secrets set TEAMS_TENANT_ID="<YOUR_TENANT_ID>"
fly secrets set TEAMS_ENTERPRISE_MODE="true"
```

### Verify Configuration

Check health endpoint:
```bash
curl https://rewardstation-poc.fly.dev/teams/health
```

Expected response:
```json
{
  "platform": "teams",
  "status": "ready",
  "framework": "active",
  "commands": 5,
  "dependencies": {
    "botbuilder": true,
    "messageHandler": true
  },
  "authentication": "configured",
  "note": "Teams Bot Framework active - requires Microsoft Teams App registration"
}
```

## Phase 3: Teams App Deployment

### Option A: Teams Admin Center (Recommended)
1. Package app manifest + icons as ZIP file
2. Upload to Teams Admin Center
3. Approve for organization use
4. Deploy to users/channels

### Option B: Developer Sideloading
1. Enable sideloading in Teams Admin Center
2. Use "Upload a custom app" in Teams
3. Test with limited users first

## Testing & Verification

### Core Commands Test Script
```
# In Microsoft Teams channel or direct message:

@RewardStation help
# Should show: AI-powered help with command list

@RewardStation thanks @colleague "Great presentation today!"
# Should show: Quick 25-point recognition confirmation

@RewardStation give @colleague
# Should show: Interactive Adaptive Card recognition form

@RewardStation balance  
# Should show: Current points balance and statistics
```

### Expected AI Enhancement Flow
1. User fills recognition form
2. Clicks "🤖 Enhance with AI" 
3. Maslow X processes message with 25-year B2B expertise
4. User sees enhanced message preview with edit option
5. User can send enhanced or original version
6. System creates recognition in mock RewardStation API

## Advanced Features

### SSO Integration (Enterprise)
When ready for production:
```bash
fly secrets set AZURE_CLIENT_ID="<SSO_APP_ID>"
fly secrets set AZURE_CLIENT_SECRET="<SSO_SECRET>"
fly secrets set AZURE_TENANT_ID="<TENANT_ID>"
```

### Graph API Integration (Future)
For real user lookup and directory integration:
```bash
fly secrets set MICROSOFT_GRAPH_API_KEY="<GRAPH_KEY>"
```

## Troubleshooting

### Common Issues

**1. Bot not responding**
- Check webhook URL: https://rewardstation-poc.fly.dev/teams/messages
- Verify App ID and secret in Fly.io secrets
- Check bot framework channel configuration

**2. Authentication errors**
- Ensure redirect URI matches in Azure App Registration
- Verify Teams app manifest has correct App ID
- Check tenant permissions and consent

**3. Adaptive Cards not working**
- Ensure manifest version 1.16 or higher
- Check card schema compatibility
- Verify bot has messageTeamMembers permission

**4. Health check failures**
```bash
# Check production logs
fly logs --app rewardstation-poc

# Expected startup logs:
# ✅ Teams message handler configured
# 🤖 RewardStation Teams Bot initialized (Framework: Active)
# 🤖 Teams Bot Framework initialized
```

### Debug Commands

Development mode only (`NODE_ENV=development`):
```
@RewardStation debug
# Shows: Environment info, user context, configuration status
```

## Production Deployment Checklist

- [ ] Azure App Registration created
- [ ] Bot Framework registration complete  
- [ ] Teams channel added and configured
- [ ] Environment variables set in Fly.io
- [ ] Teams app manifest created and validated
- [ ] App packaged and uploaded to Teams Admin Center
- [ ] Health check endpoint responding correctly
- [ ] Core commands tested and working
- [ ] AI enhancement workflow verified
- [ ] Adaptive Cards rendering properly
- [ ] Error handling and fallbacks tested

## Security Considerations

### Required Permissions
- `identity`: Access user profile information
- `messageTeamMembers`: Send messages and cards
- `team.readbasic.all`: Read team information (future)

### Data Protection
- No sensitive data stored in bot
- All recognition data sent to mock APIs
- Environment variables for all secrets
- Webhook signature verification enabled

### Compliance
- GDPR compliant data handling
- Enterprise SSO integration ready
- Audit logging for all recognition events
- Admin controls for usage policies

## Next Steps

1. **Phase 1**: Complete basic Teams deployment
2. **Phase 2**: Real RewardStation API integration
3. **Phase 3**: Advanced Teams features (tabs, messaging extensions)
4. **Phase 4**: Enterprise administration dashboard

---

**Ready to deploy? Contact the development team with any questions.**

🚀 **Production URL**: https://rewardstation-poc.fly.dev/  
📊 **Health Check**: https://rewardstation-poc.fly.dev/teams/health  
🔧 **Teams Webhook**: https://rewardstation-poc.fly.dev/teams/messages