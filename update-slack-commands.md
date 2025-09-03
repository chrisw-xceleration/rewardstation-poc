# Update Slack App Commands - Quick Guide

## 🚀 Quick Update via Slack API Dashboard

### Step 1: Access Your App
Go to: https://api.slack.com/apps

### Step 2: Update App Manifest
1. Click on your **RewardStation POC** app
2. Go to **"App Manifest"** in the left sidebar
3. Replace the entire manifest with the content from `slack-app-manifest-updated.json`
4. Click **"Save Changes"**

### Alternative: Manual Command Updates

If the manifest update doesn't work, manually add each command:

1. Go to **"Slash Commands"** in the left sidebar
2. Click **"Create New Command"** for each:

#### Command 1: /help
- **Command**: `/help`
- **Request URL**: `https://rewardstation-poc.fly.dev/slack/events`
- **Short Description**: AI-powered contextual assistance from Maslow Insights
- **Usage Hint**: Get intelligent help and guidance

#### Command 2: /thanks
- **Command**: `/thanks`
- **Request URL**: `https://rewardstation-poc.fly.dev/slack/events`
- **Short Description**: Quick 25-point appreciation
- **Usage Hint**: @user "your message"

#### Command 3: /give
- **Command**: `/give`
- **Request URL**: `https://rewardstation-poc.fly.dev/slack/events`
- **Short Description**: Opens modal for formal recognition (50-500 points)
- **Usage Hint**: @user

#### Command 4: /balance
- **Command**: `/balance`
- **Request URL**: `https://rewardstation-poc.fly.dev/slack/events`
- **Short Description**: Check your point balance and statistics
- **Usage Hint**: View your recognition points

### Step 3: Reinstall App (Important!)
1. Go to **"Install App"** in the left sidebar
2. Click **"Reinstall to Workspace"**
3. Review and accept the permissions

### Step 4: Test the Commands
Try in any Slack channel:
- `/help` - Should show Maslow Insights help
- `/thanks @someone "Great work!"` - Quick 25 points
- `/give @someone` - Opens recognition modal
- `/balance` - Shows your points

## 🔧 Troubleshooting

If commands don't work:
1. Make sure the app is reinstalled after adding commands
2. Check that the Request URL is exactly: `https://rewardstation-poc.fly.dev/slack/events`
3. Ensure the app has these OAuth scopes:
   - `chat:write`
   - `users:read`
   - `commands`
   - `channels:read`
   - `im:write`

## 📝 Note
The `/rewardstation` command is kept for backward compatibility but users should use the new simplified commands.