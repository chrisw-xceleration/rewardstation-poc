# Automated Teams Setup Instructions

## Quick Setup Checklist

### Step 1: Azure App Registration
1. Go to https://portal.azure.com
2. Search "App registrations" → "New registration"
3. Name: `RewardStation Bot`
4. Redirect URI: `https://rewardstation-poc.fly.dev/teams/oauth`
5. **COPY THE APP ID** - you'll need it for Step 3

### Step 2: Bot Framework
1. Azure Portal → "Create resource" → "Azure Bot"
2. Bot handle: `rewardstation-bot-[your-initials]` (must be unique)
3. Use the App ID from Step 1
4. Messaging endpoint: `https://rewardstation-poc.fly.dev/teams/messages`
5. Enable Microsoft Teams channel

### Step 3: Configure Production
Replace `YOUR_APP_ID` and `YOUR_CLIENT_SECRET` with your actual values:

```bash
# Set Fly.io secrets
fly secrets set TEAMS_APP_ID="YOUR_APP_ID"
fly secrets set TEAMS_APP_PASSWORD="YOUR_CLIENT_SECRET"

# Restart to pick up new config
fly machine restart
```

### Step 4: Create Teams App Package
1. Edit `manifest.json` - replace both instances of `REPLACE_WITH_YOUR_APP_ID` with your actual App ID
2. Add icons (or use placeholder icons below)
3. ZIP the files: `manifest.json`, `icon-color-192.png`, `icon-outline-32.png`

### Step 5: Deploy to Teams
- **Option A**: Teams Admin Center → Manage apps → Upload
- **Option B**: Teams client → Apps → Upload custom app

## Commands to Test
Once deployed:
- `@RewardStation help`
- `@RewardStation thanks @someone "great job"`  
- `@RewardStation give @someone`
- `@RewardStation balance`

## Verification
- Health check: https://rewardstation-poc.fly.dev/teams/health
- Should show: `"status": "ready", "authentication": "configured"`