# URGENT: Fix Slack Command Configuration

## THE PROBLEM
Your Slack commands are timing out because they're NOT reaching our server at all. The server logs show NO incoming requests when you run `/balance`.

## ROOT CAUSE
The slash commands in your Slack app are likely pointing to:
- Wrong URL (maybe old Heroku URL?)
- Localhost URL
- Missing URL entirely

## IMMEDIATE FIX NEEDED

### Step 1: Check Current Configuration
1. Go to https://api.slack.com/apps
2. Click on "RewardStation POC" app
3. Click "Slash Commands" in the left menu
4. Check the "Request URL" for each command

### Step 2: Update ALL Commands
Each command MUST have this EXACT URL:
```
https://rewardstation-poc.fly.dev/slack/events
```

Commands to update:
- `/balance` → https://rewardstation-poc.fly.dev/slack/events
- `/help` → https://rewardstation-poc.fly.dev/slack/events  
- `/thanks` → https://rewardstation-poc.fly.dev/slack/events
- `/give` → https://rewardstation-poc.fly.dev/slack/events
- `/rewardstation` → https://rewardstation-poc.fly.dev/slack/events (if it exists)

### Step 3: After Updating URLs
1. Click "Save" for each command
2. Go to "Install App" in the left menu
3. Click "Reinstall to Workspace"
4. Authorize the app again

## VERIFICATION
After reinstalling, our server logs should show:
```
📨 Received Slack command: /balance
✅ Handled command: /balance from [your_username]
```

## WHY THIS IS HAPPENING
- Classic Slack apps require manual URL updates in the dashboard
- The Slack CLI can't update classic app configurations
- Each slash command stores its own URL endpoint

## TEST ENDPOINT
You can verify the server is working:
```bash
curl -X POST https://rewardstation-poc.fly.dev/slack/events \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "command=/balance&text=&user_name=test"
```

This returns proper JSON response in ~50ms.