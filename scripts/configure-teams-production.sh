#!/bin/bash

# Configure Teams Integration in Production
echo "🚀 Configuring Teams Integration for RewardStation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project-collab root directory"
    exit 1
fi

echo ""
echo "📋 You'll need the following from Azure Portal:"
echo "   - Application (client) ID"
echo "   - Client Secret"
echo "   - Directory (tenant) ID (optional)"
echo ""

# Prompt for Azure credentials
read -p "🔑 Enter your Azure App ID: " TEAMS_APP_ID
read -s -p "🔑 Enter your Azure Client Secret: " TEAMS_APP_PASSWORD
echo ""
read -p "🔑 Enter your Tenant ID (optional, press Enter to skip): " TEAMS_TENANT_ID

# Validate required inputs
if [ -z "$TEAMS_APP_ID" ] || [ -z "$TEAMS_APP_PASSWORD" ]; then
    echo "❌ App ID and Client Secret are required"
    exit 1
fi

echo ""
echo "🔄 Setting Fly.io secrets..."

# Set Teams configuration in Fly.io
fly secrets set TEAMS_APP_ID="$TEAMS_APP_ID" --app rewardstation-poc
fly secrets set TEAMS_APP_PASSWORD="$TEAMS_APP_PASSWORD" --app rewardstation-poc

# Set tenant ID if provided
if [ ! -z "$TEAMS_TENANT_ID" ]; then
    fly secrets set TEAMS_TENANT_ID="$TEAMS_TENANT_ID" --app rewardstation-poc
    echo "✅ Tenant ID configured"
fi

echo "✅ Teams credentials configured in production"
echo ""

echo "🔄 Deploying updated configuration..."
fly deploy --app rewardstation-poc

echo ""
echo "✅ Teams integration deployed!"
echo ""
echo "📋 Next steps:"
echo "   1. Update Teams App manifest with your App ID"
echo "   2. Package and upload to Teams Admin Center"
echo "   3. Test the bot in Microsoft Teams"
echo ""
echo "🏥 Health check: https://rewardstation-poc.fly.dev/teams/health"
echo "📱 Teams webhook: https://rewardstation-poc.fly.dev/teams/messages"