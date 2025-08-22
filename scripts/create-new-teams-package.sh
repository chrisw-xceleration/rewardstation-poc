#!/bin/bash

echo "🔧 Creating New Teams App Package"
echo "================================="
echo ""

# Create temp directory for new package
mkdir -p temp-teams-app
cd temp-teams-app

# Generate a new GUID for the bot
NEW_GUID=$(python3 -c "import uuid; print(str(uuid.uuid4()))")

echo "🆔 Generated new Bot ID: $NEW_GUID"
echo ""

# Create updated manifest.json
cat > manifest.json << EOF
{
  "\$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.1",
  "id": "$NEW_GUID",
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
      "botId": "$NEW_GUID",
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
    "id": "$NEW_GUID",
    "resource": "https://graph.microsoft.com"
  }
}
EOF

# Copy icons from original package
cp ../teams-app/icon-color-192.png .
cp ../teams-app/icon-outline-32.png .

# Create new ZIP package
zip -r RewardStation-Teams-App-NEW.zip manifest.json icon-color-192.png icon-outline-32.png

# Move back to parent and clean up
mv RewardStation-Teams-App-NEW.zip ../teams-app/
cd ..
rm -rf temp-teams-app

echo "✅ New Teams app package created!"
echo "📦 Location: teams-app/RewardStation-Teams-App-NEW.zip"
echo "🆔 Bot ID: $NEW_GUID"
echo ""
echo "🎯 Next steps:"
echo "1. Go to Teams Admin Center: https://admin.teams.microsoft.com"
echo "2. Delete old RewardStation app (if exists)"
echo "3. Upload: teams-app/RewardStation-Teams-App-NEW.zip"
echo "4. Teams should now prompt for bot registration"
echo "5. Accept bot registration prompts"
echo "6. Set app as 'Available' for organization"
echo "7. Test: @RewardStation help"
echo ""
echo "💡 The new GUID should trigger Teams to register the bot properly!"

# Also save the GUID for reference
echo "$NEW_GUID" > teams-app/bot-id.txt
echo "📝 Bot ID saved to: teams-app/bot-id.txt"