#!/bin/bash

echo "🤖 Teams Bot Registration Script"
echo "================================"
echo ""

BOT_ID="d27bc7e5-4e8f-4fb8-b9c2-b5812f007efc"
BOT_ENDPOINT="https://rewardstation-poc.fly.dev/api/messages"

echo "📋 Bot Details:"
echo "   Bot ID: $BOT_ID"
echo "   Endpoint: $BOT_ENDPOINT"
echo "   Platform: Microsoft Teams"
echo ""

echo "🎯 Registration Steps:"
echo ""
echo "1. Go to Microsoft Bot Framework Portal:"
echo "   👉 https://dev.botframework.com/bots/new"
echo ""
echo "2. Create New Bot Registration:"
echo "   - Display Name: RewardStation"
echo "   - Bot handle: rewardstation (or similar)" 
echo "   - Description: AI-powered employee recognition"
echo "   - Messaging endpoint: $BOT_ENDPOINT"
echo "   - Microsoft App ID: $BOT_ID"
echo ""
echo "3. Enable Teams Channel:"
echo "   - Go to Channels tab"
echo "   - Click 'Microsoft Teams'"
echo "   - Enable and configure"
echo ""
echo "4. Generate App Password:"
echo "   - Go to Configuration tab"
echo "   - Generate new client secret"
echo "   - Save the password securely"
echo ""

echo "🔧 Alternative - Use Azure CLI:"
echo ""
echo "If you have Azure CLI installed, you can register automatically:"
echo ""
echo "az bot create \\"
echo "  --resource-group YourResourceGroup \\"
echo "  --name RewardStation \\"
echo "  --kind registration \\"
echo "  --description 'RewardStation AI Recognition Bot' \\"
echo "  --display-name 'RewardStation' \\"
echo "  --endpoint '$BOT_ENDPOINT' \\"
echo "  --msa-app-id '$BOT_ID'"
echo ""

echo "⚡ Quick Test Option:"
echo ""
echo "If you don't want to register a bot, we can:"
echo "1. Remove the bot section from manifest.json"
echo "2. Use Teams webhook approach instead"
echo "3. Create a simpler app without bot functionality"
echo ""

read -p "Would you like me to create a webhook-based version instead? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Creating webhook-based Teams app..."
    
    # Create simplified manifest without bot
    cat > ../teams-app/manifest-webhook.json << 'EOF'
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.1",
  "id": "d27bc7e5-4e8f-4fb8-b9c2-b5812f007efc",
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
  "staticTabs": [
    {
      "entityId": "rewardstation-tab",
      "name": "RewardStation",
      "contentUrl": "https://rewardstation-poc.fly.dev/teams/tab",
      "websiteUrl": "https://rewardstation-poc.fly.dev",
      "scopes": ["personal"]
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
    "id": "d27bc7e5-4e8f-4fb8-b9c2-b5812f007efc",
    "resource": "https://graph.microsoft.com"
  }
}
EOF

    echo "✅ Created webhook-based manifest: teams-app/manifest-webhook.json"
    echo "📝 This version uses a tab instead of a bot"
    echo "🎯 Users will access RewardStation through a Teams tab"
    
else
    echo ""
    echo "👆 Follow the Bot Framework registration steps above"
    echo "💡 You'll need the bot registered before Teams can route messages"
fi