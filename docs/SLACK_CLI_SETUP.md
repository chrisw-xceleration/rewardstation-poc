# 🚀 Slack CLI Setup for RewardStation POC

## Quick Setup Process (5 minutes)

### Step 1: Authenticate with Slack CLI
```bash
# Add Slack CLI to PATH
export PATH="$HOME/.slack/bin:$PATH"

# Login to your Xceleration Slack workspace
slack login
```

This will open a browser window. Select your **Xceleration workspace** and authorize the CLI.

### Step 2: Start ngrok (Required for Local Development)
```bash
# In a new terminal window
ngrok http 3000
```

Copy the `https://xxxxxxxx.ngrok.io` URL that ngrok provides.

### Step 3: Update App Manifest URLs
Edit `slack-app-manifest.json` and replace `https://your-ngrok-url.ngrok.io` with your actual ngrok URL:

```json
{
  "features": {
    "slash_commands": [
      {
        "command": "/rewardstation",
        "url": "https://YOUR_ACTUAL_NGROK_URL.ngrok.io/slack/events"
      }
    ]
  },
  "oauth_config": {
    "redirect_urls": [
      "https://YOUR_ACTUAL_NGROK_URL.ngrok.io/slack/oauth"
    ]
  },
  "settings": {
    "event_subscriptions": {
      "request_url": "https://YOUR_ACTUAL_NGROK_URL.ngrok.io/slack/events"
    },
    "interactivity": {
      "request_url": "https://YOUR_ACTUAL_NGROK_URL.ngrok.io/slack/events"
    }
  }
}
```

### Step 4: Create Slack App
```bash
cd /Users/chrisw/xceleration/project-collab
slack create -f slack-app-manifest.json
```

Follow the prompts:
1. Select your **Xceleration workspace**
2. Confirm the app creation

### Step 5: Get App Credentials
After creation, the CLI will show you the app details. You need:

1. **Bot User OAuth Token** (starts with `xoxb-`)
2. **Signing Secret**
3. **Client ID** 
4. **Client Secret**

### Step 6: Update .env File
```bash
cp .env.example .env
```

Edit `.env` and add your tokens:
```bash
SLACK_BOT_TOKEN=xoxb-your-actual-bot-token
SLACK_SIGNING_SECRET=your-actual-signing-secret
SLACK_CLIENT_ID=your-actual-client-id
SLACK_CLIENT_SECRET=your-actual-client-secret
```

### Step 7: Install App to Workspace
```bash
# This will open browser for OAuth installation
slack install
```

Select your **Xceleration workspace** and authorize the installation.

### Step 8: Start POC and Test!
```bash
# Start the RewardStation POC
npm install
npm run poc
```

### Step 9: Test in Private Channel
Create a private channel for testing and try:
```
/rewardstation help
/rewardstation thanks @someone "Great job!"
/rewardstation give @someone
/rewardstation balance
```

## 🎯 Alternative: Quick Manual Setup

If CLI has issues, you can quickly create the app manually:

1. Go to https://api.slack.com/apps
2. **Create New App** → **From an app manifest**
3. Select **Xceleration workspace**
4. Paste the contents of `slack-app-manifest.json`
5. Update URLs with your ngrok URL
6. **Create App**
7. Go to **Install App** and install to workspace
8. Copy tokens to `.env`

## 🚀 You're Ready!

Once setup is complete, you'll have:
- ✅ RewardStation app installed in Xceleration Slack
- ✅ Private channel for testing
- ✅ POC running with real Slack integration
- ✅ Ready to demo to stakeholders!

## Troubleshooting

**Command not recognized**: Check OAuth scopes in Slack app settings
**Webhook errors**: Verify ngrok URL is correct and services are running
**Permission errors**: Make sure app is installed to the workspace
**Token issues**: Double-check .env file has correct tokens