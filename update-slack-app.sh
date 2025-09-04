#!/bin/bash

# Update Slack App with New Commands
# This script helps update your Slack app with the new slash commands

echo "======================================"
echo "  Slack App Update Script"
echo "======================================"
echo ""
echo "This script will guide you through updating your Slack app."
echo ""
echo "STEP 1: Get Your App Credentials"
echo "---------------------------------"
echo "1. Go to: https://api.slack.com/apps"
echo "2. Click on your 'RewardStation POC' app"
echo "3. Go to 'Basic Information'"
echo "4. Find your App ID (starts with 'A')"
echo ""
read -p "Enter your Slack App ID: " APP_ID

echo ""
echo "5. Under 'App Credentials', find your Client ID"
read -p "Enter your Client ID: " CLIENT_ID

echo ""
echo "6. Find your Client Secret (you may need to regenerate it)"
read -s -p "Enter your Client Secret: " CLIENT_SECRET
echo ""

echo ""
echo "7. Go to 'OAuth & Permissions'"
echo "8. Find your Bot User OAuth Token (starts with xoxb-)"
read -s -p "Enter your Bot Token: " BOT_TOKEN
echo ""

echo ""
echo "STEP 2: Updating Slash Commands"
echo "---------------------------------"
echo "The script will now update your app with these commands:"
echo "  • /help - AI-powered assistance"
echo "  • /thanks - Quick 25-point appreciation"
echo "  • /give - Formal recognition (50-500 points)"
echo "  • /balance - Check point balance"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Create a temporary manifest update file
cat > /tmp/slack_manifest_update.json << EOF
{
  "display_information": {
    "name": "RewardStation POC",
    "description": "AI-powered recognition platform with Maslow Insights",
    "background_color": "#4A90E2"
  },
  "features": {
    "bot_user": {
      "display_name": "RewardStation",
      "always_online": true
    },
    "slash_commands": [
      {
        "command": "/help",
        "url": "https://rewardstation-poc.fly.dev/slack/events",
        "description": "AI-powered contextual assistance from Maslow Insights",
        "usage_hint": "Get help and guidance",
        "should_escape": false
      },
      {
        "command": "/thanks",
        "url": "https://rewardstation-poc.fly.dev/slack/events",
        "description": "Quick 25-point appreciation",
        "usage_hint": "@user \"your message\"",
        "should_escape": false
      },
      {
        "command": "/give",
        "url": "https://rewardstation-poc.fly.dev/slack/events",
        "description": "Opens modal for formal recognition (50-500 points)",
        "usage_hint": "@user",
        "should_escape": false
      },
      {
        "command": "/balance",
        "url": "https://rewardstation-poc.fly.dev/slack/events",
        "description": "Check your point balance and statistics",
        "usage_hint": "View your points",
        "should_escape": false
      },
      {
        "command": "/rewardstation",
        "url": "https://rewardstation-poc.fly.dev/slack/events",
        "description": "Legacy command (use new simplified commands)",
        "usage_hint": "help | thanks @user \"message\" | give @user | balance",
        "should_escape": false
      }
    ]
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "chat:write",
        "channels:read",
        "commands",
        "im:write",
        "users:read"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "request_url": "https://rewardstation-poc.fly.dev/slack/events"
    },
    "interactivity": {
      "is_enabled": true,
      "request_url": "https://rewardstation-poc.fly.dev/slack/events"
    },
    "org_deploy_enabled": false,
    "socket_mode_enabled": false
  }
}
EOF

echo ""
echo "STEP 3: Manual Update Required"
echo "---------------------------------"
echo "Unfortunately, Slack doesn't allow updating slash commands via API."
echo "You need to manually add them in the Slack App Dashboard."
echo ""
echo "1. Go to: https://api.slack.com/apps/${APP_ID}/slash-commands"
echo "2. Click 'Create New Command' for each command"
echo "3. Use these exact URLs for ALL commands:"
echo "   https://rewardstation-poc.fly.dev/slack/events"
echo ""
echo "Commands to add:"
echo "  /help"
echo "  /thanks"
echo "  /give"
echo "  /balance"
echo ""
echo "4. After adding all commands, go to:"
echo "   https://api.slack.com/apps/${APP_ID}/install-on-team"
echo "5. Click 'Reinstall to Workspace'"
echo ""
echo "======================================"
echo "  Update Instructions Saved"
echo "======================================"
echo ""
echo "The manifest has been saved to: /tmp/slack_manifest_update.json"
echo "You can also copy-paste it into the App Manifest section."
echo ""
echo "Direct Links:"
echo "• Add Commands: https://api.slack.com/apps/${APP_ID}/slash-commands"
echo "• Reinstall App: https://api.slack.com/apps/${APP_ID}/install-on-team"
echo ""

# Save credentials to environment file for future use
echo "Would you like to save these credentials for future use? (y/n)"
read -p "> " SAVE_CREDS

if [ "$SAVE_CREDS" = "y" ] || [ "$SAVE_CREDS" = "Y" ]; then
  cat > .env << EOF
# Slack Configuration
SLACK_CLIENT_ID=${CLIENT_ID}
SLACK_CLIENT_SECRET=${CLIENT_SECRET}
SLACK_SIGNING_SECRET=e70f7f8a1a38de84fccee0aaf41c2502
SLACK_BOT_TOKEN=${BOT_TOKEN}
SLACK_APP_ID=${APP_ID}

# Other Configuration
NODE_ENV=production
PORT=3000
EOF
  echo "✅ Credentials saved to .env file"
fi

echo ""
echo "Script complete! Please follow the manual steps above to finish the update."