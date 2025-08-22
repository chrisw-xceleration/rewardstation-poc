#!/bin/bash

# Simple manual Teams deployment guide for macOS
echo "🍎 RewardStation Teams Setup - macOS Manual Method"
echo "================================================"
echo ""

echo "Since you're on macOS, here are your options:"
echo ""

echo "🎯 OPTION 1: Use what you already uploaded (Recommended)"
echo "--------------------------------------------------------"
echo "You already uploaded the Teams app via Admin Center."
echo "Let's test if it works:"
echo ""
echo "1. Open Microsoft Teams"
echo "2. Type in any channel: @RewardStation help"
echo "3. If it responds → You're done! ✅"
echo "4. If not → Try Option 2 below"
echo ""

echo "🎯 OPTION 2: PowerShell Core Method (Advanced)"
echo "---------------------------------------------"
echo "This requires installing PowerShell on macOS:"
echo ""
echo "Step 1: Install PowerShell Core"
echo "   brew install --cask powershell"
echo ""
echo "Step 2: Run deployment script"  
echo "   ./scripts/teams-deploy-mac.sh"
echo ""

echo "🎯 OPTION 3: Direct Backend Test (Quick)"
echo "---------------------------------------"
echo "Test if backend is ready (should work regardless):"
echo ""
echo "Backend health check:"

# Test backend directly
if command -v curl &> /dev/null; then
    echo "Testing https://rewardstation-poc.fly.dev/teams/health"
    echo ""
    curl -s https://rewardstation-poc.fly.dev/teams/health | python3 -m json.tool 2>/dev/null || curl -s https://rewardstation-poc.fly.dev/teams/health
    echo ""
else
    echo "   curl https://rewardstation-poc.fly.dev/teams/health"
    echo ""
fi

echo ""
echo "🎯 RECOMMENDED NEXT STEP:"
echo "========================"
echo "Since your backend shows 'ready' status, just test in Teams:"
echo ""
echo "1. Open Microsoft Teams"  
echo "2. Type: @RewardStation help"
echo "3. Expected: Help message with AI commands"
echo ""
echo "If this works, you're completely done! 🎉"
echo "If not, we can troubleshoot the specific issue."
echo ""
echo "💡 Remember: You already uploaded the app via Teams Admin Center,"
echo "   so it should work without any additional CLI setup."