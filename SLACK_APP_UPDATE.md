# 🚨 URGENT: Update Slack App Commands

The server is ready but Slack doesn't have the new commands registered. Follow these steps:

## Option 1: Quick Manual Update (5 minutes)

### 1. Go to Slack API Dashboard
**URL:** https://api.slack.com/apps

### 2. Select Your App
Look for "RewardStation POC" or similar

### 3. Add Slash Commands
Go to **"Slash Commands"** in the left sidebar and create these FOUR commands:

#### Command 1: /help
- **Command:** `/help`
- **Request URL:** `https://rewardstation-poc.fly.dev/slack/events`
- **Short Description:** AI-powered contextual assistance from Maslow Insights
- **Usage Hint:** Get help and guidance
- ✅ Click **"Save"**

#### Command 2: /thanks  
- **Command:** `/thanks`
- **Request URL:** `https://rewardstation-poc.fly.dev/slack/events`
- **Short Description:** Quick 25-point appreciation
- **Usage Hint:** @user "your message"
- ✅ Click **"Save"**

#### Command 3: /give
- **Command:** `/give`
- **Request URL:** `https://rewardstation-poc.fly.dev/slack/events`
- **Short Description:** Opens modal for formal recognition (50-500 points)
- **Usage Hint:** @user
- ✅ Click **"Save"**

#### Command 4: /balance
- **Command:** `/balance`
- **Request URL:** `https://rewardstation-poc.fly.dev/slack/events`
- **Short Description:** Check your point balance and statistics
- **Usage Hint:** View your points
- ✅ Click **"Save"**

### 4. IMPORTANT: Reinstall the App
1. Go to **"Install App"** in the left sidebar
2. Click **"Reinstall to Workspace"**
3. Review permissions and click **"Allow"**

## Option 2: Update via App Manifest

### 1. Go to App Manifest
In your Slack app settings, click **"App Manifest"** in the left sidebar

### 2. Replace with This Manifest
```yaml
display_information:
  name: RewardStation POC
  description: AI-powered recognition platform with Maslow Insights
  background_color: "#4A90E2"
features:
  bot_user:
    display_name: RewardStation
    always_online: true
  slash_commands:
    - command: /help
      url: https://rewardstation-poc.fly.dev/slack/events
      description: AI-powered contextual assistance from Maslow Insights
      usage_hint: Get help and guidance
      should_escape: false
    - command: /thanks
      url: https://rewardstation-poc.fly.dev/slack/events
      description: Quick 25-point appreciation
      usage_hint: '@user "your message"'
      should_escape: false
    - command: /give
      url: https://rewardstation-poc.fly.dev/slack/events
      description: Opens modal for formal recognition (50-500 points)
      usage_hint: '@user'
      should_escape: false
    - command: /balance
      url: https://rewardstation-poc.fly.dev/slack/events
      description: Check your point balance and statistics
      usage_hint: View your points
      should_escape: false
    - command: /rewardstation
      url: https://rewardstation-poc.fly.dev/slack/events
      description: Legacy command (use new simplified commands)
      usage_hint: 'help | thanks @user "message" | give @user | balance'
      should_escape: false
oauth_config:
  scopes:
    bot:
      - chat:write
      - channels:read
      - commands
      - im:write
      - users:read
settings:
  event_subscriptions:
    request_url: https://rewardstation-poc.fly.dev/slack/events
  interactivity:
    is_enabled: true
    request_url: https://rewardstation-poc.fly.dev/slack/events
  org_deploy_enabled: false
  socket_mode_enabled: false
```

### 3. Save and Reinstall
1. Click **"Save Changes"**
2. Go to **"Install App"**
3. Click **"Reinstall to Workspace"**

## Verification Checklist

After updating, verify:
- [ ] All 4 commands show in Slack when you type `/`
- [ ] Each command has the correct URL: `https://rewardstation-poc.fly.dev/slack/events`
- [ ] The app has been reinstalled to your workspace
- [ ] The following OAuth scopes are granted:
  - `chat:write`
  - `channels:read`
  - `commands`
  - `im:write`
  - `users:read`

## Test Commands
Once updated, test in any Slack channel:
```
/help
/balance
/thanks @someone "test message"
/give @someone
```

## Troubleshooting

If still getting "dispatch_failed":
1. **Check URL**: Must be exactly `https://rewardstation-poc.fly.dev/slack/events`
2. **Check Reinstall**: App MUST be reinstalled after adding commands
3. **Check Workspace**: Make sure you're in the right Slack workspace
4. **Check Permissions**: Ensure the app has the required OAuth scopes

## Why This Is Happening

The server code is ready and working, but Slack's app configuration hasn't been updated. Slack needs to know:
1. What commands exist (`/help`, `/thanks`, `/give`, `/balance`)
2. Where to send them (our server URL)
3. That the app has permission to use them (reinstall grants this)

Once you add these commands in the Slack API dashboard and reinstall the app, everything will work!