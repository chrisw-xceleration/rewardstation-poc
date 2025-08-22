#!/bin/bash
# RewardStation Slack App Setup Script
# Run this script to create and configure the Slack app using CLI

echo "🚀 Setting up RewardStation Slack App..."

# Ensure Slack CLI is in PATH
export PATH="/opt/homebrew/bin:$PATH"

# Check if slack CLI is available
if ! command -v slack &> /dev/null; then
    echo "❌ Slack CLI not found. Installing..."
    brew install --cask slack-cli
fi

echo "📱 Please follow these steps:"
echo "1. Run: slack auth"
echo "2. Follow the browser authentication flow"
echo "3. Select your Xceleration workspace"
echo "4. Come back here when authentication is complete"
echo ""
read -p "Press Enter when you've completed authentication..."

echo "🏗️ Creating Slack app from manifest..."
slack create --manifest slack-app-manifest.json --name "RewardStation POC"

echo "📦 Installing app to workspace..."
slack install

echo "🔑 Getting app credentials..."
echo "Please copy the following tokens from your app configuration:"
echo "1. Bot User OAuth Token (starts with xoxb-)"
echo "2. Signing Secret"
echo ""
echo "Then run this command to set them in Fly.io:"
echo "fly secrets set SLACK_BOT_TOKEN=xoxb-your-token SLACK_SIGNING_SECRET=your-secret NODE_ENV=production --app rewardstation-poc"
echo ""
echo "✅ Setup complete! Your app should be ready to test."