#!/bin/bash
# Automated Teams App Package Creator

echo "🚀 RewardStation Teams App Package Creator"
echo "========================================="

# Check if App ID is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Azure App ID"
    echo "Usage: ./create-package.sh YOUR_APP_ID"
    echo ""
    echo "Get your App ID from:"
    echo "1. https://portal.azure.com"
    echo "2. App registrations → Your RewardStation Bot → Application (client) ID"
    exit 1
fi

APP_ID="$1"
echo "📋 Using App ID: $APP_ID"

# Replace placeholders in manifest
echo "🔧 Updating manifest with your App ID..."
sed "s/REPLACE_WITH_YOUR_APP_ID/$APP_ID/g" manifest.json > manifest-updated.json
mv manifest-updated.json manifest.json

# Create placeholder icons if they don't exist
if [ ! -f "icon-color-192.png" ]; then
    echo "🎨 Creating placeholder color icon..."
    # Create a simple colored square as placeholder
    convert -size 192x192 xc:"#512BD4" -fill white -gravity center -font Arial-Bold -pointsize 24 -annotate +0+0 "RS" icon-color-192.png 2>/dev/null || {
        echo "⚠️  ImageMagick not found. Please manually create icon-color-192.png (192x192 pixels)"
        touch icon-color-192.png
    }
fi

if [ ! -f "icon-outline-32.png" ]; then
    echo "🖼️  Creating placeholder outline icon..."
    # Create a simple outline icon as placeholder  
    convert -size 32x32 xc:white -fill black -stroke black -strokewidth 1 -draw "circle 16,16 16,8" -fill white -gravity center -font Arial -pointsize 8 -annotate +0+0 "RS" icon-outline-32.png 2>/dev/null || {
        echo "⚠️  ImageMagick not found. Please manually create icon-outline-32.png (32x32 pixels)"
        touch icon-outline-32.png
    }
fi

# Create the app package
echo "📦 Creating Teams app package..."
zip -r "RewardStation-Teams-App.zip" manifest.json icon-color-192.png icon-outline-32.png

# Verify package
if [ -f "RewardStation-Teams-App.zip" ]; then
    echo "✅ Teams app package created successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://admin.teams.microsoft.com"
    echo "2. Teams apps → Manage apps → Upload"
    echo "3. Select: RewardStation-Teams-App.zip"
    echo ""
    echo "🔍 Or test via sideloading:"
    echo "1. Microsoft Teams → Apps → Upload custom app"
    echo "2. Select: RewardStation-Teams-App.zip"
    echo ""
    echo "📊 Verify deployment:"
    echo "curl https://rewardstation-poc.fly.dev/teams/health"
else
    echo "❌ Error creating package"
    exit 1
fi