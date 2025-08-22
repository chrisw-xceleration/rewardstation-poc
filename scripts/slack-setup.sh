#!/bin/bash

# RewardStation Slack App Setup Script
# This script guides you through setting up the Slack app using Slack CLI

echo "🚀 RewardStation Slack App Setup"
echo "================================="
echo ""

# Add Slack CLI to PATH
export PATH="$HOME/.slack/bin:$PATH"

# Verify Slack CLI is available
if ! command -v slack &> /dev/null; then
    echo "❌ Slack CLI not found. Please install it first."
    exit 1
fi

echo "✅ Slack CLI found: $(slack --version)"
echo ""

# Check if user is logged in
echo "🔐 Checking Slack CLI authentication..."
if ! slack auth list &> /dev/null; then
    echo "📝 You need to log in to Slack CLI first."
    echo "   Run: slack login"
    echo "   This will open a browser to authenticate with your Xceleration Slack workspace."
    echo ""
    echo "🏃‍♂️ Please run 'slack login' and then run this script again."
    exit 1
fi

echo "✅ Authenticated with Slack CLI"
echo ""

# Show current workspace
echo "🏢 Current workspace:"
slack auth list
echo ""

# Create the app using manifest
echo "🛠️  Creating RewardStation Slack app..."
echo "   Using manifest: slack-app-manifest.json"
echo ""

# Check if manifest exists
if [ ! -f "slack-app-manifest.json" ]; then
    echo "❌ slack-app-manifest.json not found in current directory"
    exit 1
fi

echo "📋 App manifest contents:"
cat slack-app-manifest.json | jq . 2>/dev/null || cat slack-app-manifest.json
echo ""

echo "⚠️  IMPORTANT: Before creating the app, you need to:"
echo "   1. Start ngrok to get a public URL for your local server"
echo "   2. Update the manifest URLs with your ngrok URL"
echo ""
echo "🔗 To start ngrok (in another terminal):"
echo "   ngrok http 3000"
echo ""
echo "✏️  Then update these URLs in slack-app-manifest.json:"
echo "   - https://your-ngrok-url.ngrok.io/slack/events"
echo "   - https://your-ngrok-url.ngrok.io/slack/oauth"
echo ""

read -p "Have you updated the URLs in the manifest? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please update the URLs and run this script again."
    exit 1
fi

echo ""
echo "🚀 Creating Slack app..."

# Create the app (this will prompt for workspace selection)
slack create -f slack-app-manifest.json

echo ""
echo "✅ Slack app creation process initiated!"
echo ""
echo "📝 Next steps:"
echo "   1. Follow the prompts to select your Xceleration workspace"
echo "   2. Copy the tokens to your .env file"
echo "   3. Start your POC: npm run poc"
echo "   4. Test in your private channel!"
echo ""
echo "🎉 You're almost ready to beat your dev team to market!"