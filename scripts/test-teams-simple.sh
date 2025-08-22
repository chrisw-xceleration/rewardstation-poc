#!/bin/bash

echo "🧪 Simple Teams Test"
echo "==================="
echo ""

echo "Let's try a different approach - testing the bot name directly:"
echo ""
echo "In Microsoft Teams, try these variations:"
echo ""
echo "1. @RewardStation help"
echo "2. @RewardStationBot help"  
echo "3. @\"RewardStation\" help"
echo "4. @\"RewardStation AI Recognition Platform\" help"
echo ""

echo "Also try mentioning without @:"
echo ""
echo "5. RewardStation help"
echo "6. Just type: help"
echo ""

echo "💡 Sometimes the bot name in Teams differs from the app name"
echo ""

echo "🔍 Check if the bot appears in these places:"
echo ""
echo "1. Teams → Apps → Search 'RewardStation'"
echo "2. Teams → Chat → New chat → Search 'RewardStation'"  
echo "3. Teams → Apps → Built for your org"
echo ""

echo "📱 Also check Teams mobile app - sometimes it shows differently"
echo ""

echo "🏥 Backend is definitely ready:"
curl -s https://rewardstation-poc.fly.dev/teams/health | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'   ✅ Status: {data[\"status\"]}')
    print(f'   ✅ Platform: {data[\"platform\"]}')  
    print(f'   ✅ Commands: {data[\"commands\"]}')
    print(f'   ✅ Framework: {data[\"framework\"]}')
except:
    print('   ❌ Health check failed')
"

echo ""
echo "If none of these work, then we definitely need Developer Portal approach!"