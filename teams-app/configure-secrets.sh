#!/bin/bash
# Automated Fly.io Secret Configuration

echo "🔐 RewardStation Teams Configuration"
echo "===================================="

# Check if required parameters are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Error: Please provide your Azure credentials"
    echo "Usage: ./configure-secrets.sh APP_ID CLIENT_SECRET"
    echo ""
    echo "Get these from Azure Portal:"
    echo "1. App ID: App registrations → Your bot → Application (client) ID"
    echo "2. Client Secret: Your bot → Certificates & secrets → New client secret"
    exit 1
fi

APP_ID="$1"
CLIENT_SECRET="$2"

echo "📋 Configuring Fly.io with your Teams credentials..."

# Set the secrets
fly secrets set TEAMS_APP_ID="$APP_ID"
fly secrets set TEAMS_APP_PASSWORD="$CLIENT_SECRET"

if [ $? -eq 0 ]; then
    echo "✅ Secrets configured successfully!"
    
    echo "🔄 Restarting application to pick up new configuration..."
    fly machine restart
    
    echo "⏱️  Waiting for restart..."
    sleep 10
    
    echo "🔍 Verifying configuration..."
    curl -s https://rewardstation-poc.fly.dev/teams/health | jq .
    
    echo ""
    echo "✅ Setup complete! Your Teams integration should now be active."
    echo "📋 Next step: Upload your Teams app package to Teams Admin Center"
    
else
    echo "❌ Error configuring secrets. Please check your Fly.io access."
    exit 1
fi