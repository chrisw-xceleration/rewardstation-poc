#!/bin/bash

echo "🔧 RewardStation Teams Bot Fix"
echo "============================="
echo ""

echo "The issue: Teams app uploaded but bot not connected"
echo "The fix: Remove and re-upload with auto-registration"
echo ""

echo "📋 Manual steps to fix:"
echo ""
echo "1. Go to: https://admin.teams.microsoft.com"
echo "2. Teams apps → Manage apps"
echo "3. Search: 'RewardStation'"
echo "4. Click the app → Delete/Remove"
echo "5. Upload new app → 'Upload new app'"
echo "6. Select: teams-app/RewardStation-Teams-App.zip"
echo "7. When prompted about bot registration → Click YES/Allow"
echo "8. Set status to 'Available' for your organization"
echo ""

echo "🎯 After re-upload, test with:"
echo "   @RewardStation help"
echo ""

echo "💡 Alternative: PowerShell method (if you have brew):"
echo "   brew install --cask powershell"
echo "   ./scripts/teams-deploy-mac.sh"
echo ""

echo "🏥 Backend status (should stay ready):"
curl -s https://rewardstation-poc.fly.dev/teams/health | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'   Status: {data.get(\"status\", \"unknown\")}')
    print(f'   Platform: {data.get(\"platform\", \"unknown\")}')  
    print(f'   Framework: {data.get(\"framework\", \"unknown\")}')
except:
    print('   Unable to parse health check')
"

echo ""
echo "✅ Your backend is ready - just need to reconnect the Teams app!"