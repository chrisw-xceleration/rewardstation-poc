// Simple Teams tab interface without complex JavaScript
module.exports = (app) => {
  app.get('/teams', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RewardStation - AI Recognition Platform</title>
    <script src="https://unpkg.com/@microsoft/teams-js@2.0.0/dist/MicrosoftTeams.min.js"></script>
    <style>
        /* Teams theme compatibility */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            transition: all 0.3s ease;
        }
        
        /* Default theme (Dark) */
        body {
            background: linear-gradient(135deg, #1e1e23 0%, #2d1b69 100%);
            color: #E0E0E0;
        }
        
        /* Teams light theme override */
        body[data-theme="light"] {
            background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
            color: #1a1a1a;
        }
        
        /* Teams dark theme */
        body[data-theme="dark"] {
            background: linear-gradient(135deg, #1e1e23 0%, #2d1b69 100%);
            color: #E0E0E0;
        }
        
        /* Teams high contrast theme */
        body[data-theme="contrast"] {
            background: #000000;
            color: #ffffff;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 48px;
            font-weight: bold;
            color: #10B981;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 18px;
            color: rgba(224, 224, 224, 0.8);
        }
        .dashboard {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            margin-bottom: 40px;
        }
        .action-card {
            background: rgba(51, 65, 85, 0.8);
            border-radius: 16px;
            padding: 24px;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }
        .action-card:hover {
            border-color: #10B981;
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
        .action-card.primary {
            border-color: rgba(16, 185, 129, 0.3);
            background: rgba(16, 185, 129, 0.1);
        }
        .action-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .action-content h4 {
            margin: 0 0 8px 0;
            color: #E0E0E0;
            font-size: 20px;
        }
        .action-content p {
            margin: 0 0 12px 0;
            color: rgba(148, 163, 184, 0.8);
            font-size: 14px;
        }
        .action-detail {
            background: #10B981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .status {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            margin-bottom: 32px;
        }
        .welcome {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-bottom: 32px;
        }
        .balance-display {
            font-size: 24px;
            color: #3B82F6;
            font-weight: bold;
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌟 RewardStation</div>
            <div class="subtitle">AI-Powered Employee Recognition Platform</div>
        </div>

        <div class="status">
            <strong>✅ Platform Status: READY</strong><br>
            <span id="statusDetails">Backend services operational • AI assistance active</span>
        </div>

        <div class="welcome">
            <h3>👋 Welcome to RewardStation</h3>
            <div class="balance-display" id="userBalance">Loading balance...</div>
            <p>Ready to recognize great work and spread appreciation!</p>
        </div>

        <div class="dashboard">
            <div class="action-card primary" onclick="openThanksModal()">
                <div class="action-icon">🙏</div>
                <div class="action-content">
                    <h4>Quick Thanks</h4>
                    <p>Send appreciation</p>
                    <span class="action-detail">25 points</span>
                </div>
            </div>

            <div class="action-card" onclick="openRecognitionModal()">
                <div class="action-icon">🌟</div>
                <div class="action-content">
                    <h4>Recognition</h4>
                    <p>Formal awards</p>
                    <span class="action-detail">50-500 points</span>
                </div>
            </div>

            <div class="action-card" onclick="openBalanceModal()">
                <div class="action-icon">💰</div>
                <div class="action-content">
                    <h4>Balance</h4>
                    <p>Your points</p>
                    <span class="action-detail">View stats</span>
                </div>
            </div>

            <div class="action-card" onclick="openActivityModal()">
                <div class="action-icon">📊</div>
                <div class="action-content">
                    <h4>Activity</h4>
                    <p>Recent actions</p>
                    <span class="action-detail">History</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        let teamsContext = null;
        let currentUser = null;

        // Initialize Microsoft Teams SDK
        microsoftTeams.app.initialize().then(() => {
            console.log("Teams SDK initialized");
            
            // Get Teams context
            microsoftTeams.app.getContext().then((context) => {
                console.log("Teams context:", context);
                teamsContext = context;
                currentUser = context.user;
                
                // Apply Teams theme
                applyTeamsTheme(context.app?.theme || 'dark');
                
                document.getElementById('statusDetails').textContent = 
                    'Backend operational • User: ' + (context.user?.displayName || 'Teams User') + ' • Team: ' + (context.team?.displayName || 'N/A');
                
                // Load user balance
                loadUserBalance();
            }).catch((error) => {
                console.error("Failed to get Teams context:", error);
                document.getElementById('statusDetails').textContent = 'Teams context unavailable - running in browser mode';
            });
        }).catch((error) => {
            console.error("Teams SDK initialization failed:", error);
            document.getElementById('statusDetails').textContent = 'Teams SDK unavailable - running in browser mode';
        });

        function applyTeamsTheme(theme) {
            console.log("Applying Teams theme:", theme);
            const body = document.body;
            
            // Remove existing theme classes
            body.removeAttribute('data-theme');
            
            // Apply appropriate theme
            if (theme === 'default' || theme === 'light') {
                body.setAttribute('data-theme', 'light');
            } else if (theme === 'dark') {
                body.setAttribute('data-theme', 'dark');
            } else if (theme === 'contrast') {
                body.setAttribute('data-theme', 'contrast');
            }
            
            // Update action cards for theme
            updateActionCardsTheme(theme);
        }
        
        function updateActionCardsTheme(theme) {
            const actionCards = document.querySelectorAll('.action-card');
            const isLight = theme === 'default' || theme === 'light';
            
            actionCards.forEach(card => {
                if (isLight) {
                    card.style.background = 'rgba(255, 255, 255, 0.9)';
                    card.style.color = '#1a1a1a';
                    card.style.borderColor = 'rgba(100, 116, 139, 0.2)';
                } else {
                    card.style.background = 'rgba(51, 65, 85, 0.8)';
                    card.style.color = '#E0E0E0';
                    card.style.borderColor = 'transparent';
                }
            });
        }

        function showMessage(message) {
            alert(message);
        }

        function showBalance() {
            const balance = Math.floor(Math.random() * 500) + 100;
            alert('Your Balance: ' + balance + ' points\\n\\nKeep giving recognition to earn more!');
        }

        function loadUserBalance() {
            // Mock balance loading
            setTimeout(() => {
                const balance = Math.floor(Math.random() * 500) + 100;
                document.getElementById('userBalance').textContent = balance + ' points available';
            }, 1000);
        }

        // Mock team members data
        const teamMembers = [
            { id: '1', name: 'Sarah Martinez', email: 'sarah.m@company.com' },
            { id: '2', name: 'Mike Johnson', email: 'mike.j@company.com' },
            { id: '3', name: 'Lisa Thompson', email: 'lisa.t@company.com' },
            { id: '4', name: 'David Rodriguez', email: 'david.r@company.com' },
            { id: '5', name: 'Emily Chen', email: 'emily.c@company.com' },
            { id: '6', name: 'Alex Wilson', email: 'alex.w@company.com' }
        ];

        function createRecipientDropdown(id = 'recipientSelect') {
            let options = '<option value="">Choose team member...</option>';
            teamMembers.forEach(member => {
                options += '<option value="' + member.id + '">' + member.name + ' (' + member.email + ')</option>';
            });
            return '<select id="' + id + '" style="margin-left: 10px; padding: 8px; width: 300px; border: 1px solid #ccc; border-radius: 4px;">' + options + '</select>';
        }

        // Modal functions for action cards
        function openThanksModal() {
            showModal('Thanks', 'Send appreciation to a team member', 
                '<p><strong>Recipient:</strong> ' + createRecipientDropdown('thanksRecipient') + '</p>' +
                '<p><strong>Message:</strong></p>' +
                '<textarea id="thanksMessage" placeholder="Express your appreciation..." style="width: 100%; height: 80px; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"></textarea>' +
                '<p style="color: #3B82F6; margin-top: 15px;"><strong>25 points</strong> - Quick thanks recognition</p>',
                'Send Thanks'
            );
        }

        function openRecognitionModal() {
            showModal('Recognition & Awards', 'Give formal recognition with points', 
                '<p><strong>Recipient:</strong> ' + createRecipientDropdown('recognitionRecipient') + '</p>' +
                '<p><strong>Points:</strong> <select id="pointsSelect" style="margin-left: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"><option value="50">50 - Great work</option><option value="100">100 - Excellent</option><option value="250">250 - Outstanding</option><option value="500">500 - Exceptional</option></select></p>' +
                '<p><strong>Behaviors:</strong></p>' +
                '<div style="margin: 10px 0;"><label style="margin-right: 15px;"><input type="checkbox" value="Innovation"> Innovation</label> <label style="margin-right: 15px;"><input type="checkbox" value="Collaboration"> Collaboration</label> <label><input type="checkbox" value="Leadership"> Leadership</label></div>' +
                '<p><strong>Message:</strong></p>' +
                '<textarea id="recognitionMessage" placeholder="Describe the specific achievement..." style="width: 100%; height: 80px; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"></textarea>',
                'Send Recognition'
            );
        }

        function openBalanceModal() {
            const balance = Math.floor(Math.random() * 500) + 100;
            showModal('Your Balance & Stats', 'Current points and activity summary',
                '<div style="text-align: center; padding: 20px;">' +
                    '<div style="font-size: 36px; color: #3B82F6; font-weight: bold; margin: 20px 0;">' + balance + ' points</div>' +
                    '<p style="color: #888; margin-bottom: 30px;">Available points to give</p>' +
                    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">' +
                        '<div style="padding: 15px; background: rgba(51,65,85,0.6); border-radius: 8px; text-align: center;"><div style="font-size: 24px; color: #10B981; font-weight: bold;">23</div><div style="font-size: 12px; color: #888;">Thanks Sent</div></div>' +
                        '<div style="padding: 15px; background: rgba(51,65,85,0.6); border-radius: 8px; text-align: center;"><div style="font-size: 24px; color: #10B981; font-weight: bold;">41</div><div style="font-size: 12px; color: #888;">Thanks Received</div></div>' +
                        '<div style="padding: 15px; background: rgba(51,65,85,0.6); border-radius: 8px; text-align: center;"><div style="font-size: 24px; color: #10B981; font-weight: bold;">8</div><div style="font-size: 12px; color: #888;">Awards Given</div></div>' +
                        '<div style="padding: 15px; background: rgba(51,65,85,0.6); border-radius: 8px; text-align: center;"><div style="font-size: 24px; color: #10B981; font-weight: bold;">12</div><div style="font-size: 12px; color: #888;">Awards Received</div></div>' +
                    '</div>' +
                '</div>',
                'Close'
            );
        }

        function openActivityModal() {
            showModal('Recent Activity', 'Your latest recognition activity',
                '<div style="max-height: 300px; overflow-y: auto;">' +
                    '<div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #333;"><div style="font-size: 20px; margin-right: 15px;">🙏</div><div><strong>Thanks sent to Sarah M.</strong><br><em>"Great job on the presentation!"</em><br><small style="color: #888;">2 hours ago • 25 points</small></div></div>' +
                    '<div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #333;"><div style="font-size: 20px; margin-right: 15px;">🌟</div><div><strong>Recognition received from Mike K.</strong><br><em>"Outstanding work on the client project!"</em><br><small style="color: #888;">Yesterday • 100 points</small></div></div>' +
                    '<div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #333;"><div style="font-size: 20px; margin-right: 15px;">🏆</div><div><strong>Award given to Lisa T.</strong><br><em>"Exceptional leadership during the launch"</em><br><small style="color: #888;">3 days ago • 250 points</small></div></div>' +
                    '<div style="display: flex; align-items: center; padding: 15px;"><div style="font-size: 20px; margin-right: 15px;">💝</div><div><strong>Thanks received from David R.</strong><br><em>"Thanks for helping with the urgent request!"</em><br><small style="color: #888;">1 week ago • 25 points</small></div></div>' +
                '</div>',
                'Close'
            );
        }

        function showModal(title, subtitle, content, buttonText) {
            // Create modal overlay
            const modal = document.createElement('div');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.style.cssText = 'background: #1e1e23; border-radius: 12px; max-width: 500px; width: 90%; max-height: 90%; overflow-y: auto; border: 1px solid #333;';
            
            modalContent.innerHTML = 
                '<div style="padding: 20px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">' +
                    '<div><h3 style="margin: 0; color: #E0E0E0;">' + title + '</h3><p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">' + subtitle + '</p></div>' +
                    '<button onclick="closeModal()" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer; padding: 5px;">✕</button>' +
                '</div>' +
                '<div style="padding: 20px; color: #E0E0E0;">' + content + '</div>' +
                '<div style="padding: 16px 20px; border-top: 1px solid #333; text-align: right;">' +
                    '<button onclick="closeModal()" style="background: rgba(100,116,139,0.2); color: #E0E0E0; border: 1px solid rgba(100,116,139,0.3); padding: 8px 16px; border-radius: 6px; margin-right: 10px; cursor: pointer;">Cancel</button>' +
                    '<button onclick="processAction()" style="background: #10B981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">' + buttonText + '</button>' +
                '</div>';
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Store current modal for actions
            window.currentModal = modal;
        }

        function closeModal() {
            if (window.currentModal) {
                document.body.removeChild(window.currentModal);
                window.currentModal = null;
            }
        }

        function processAction() {
            // Collect form data from the modal
            const thanksRecipient = document.getElementById('thanksRecipient')?.value;
            const thanksMessage = document.getElementById('thanksMessage')?.value;
            const recognitionRecipient = document.getElementById('recognitionRecipient')?.value;
            const recognitionMessage = document.getElementById('recognitionMessage')?.value;
            const pointsSelect = document.getElementById('pointsSelect')?.value;
            
            // Validate required fields
            if (thanksRecipient && !thanksMessage) {
                alert('Please add a message for your thanks!');
                return;
            }
            
            if (recognitionRecipient && !recognitionMessage) {
                alert('Please describe the achievement for formal recognition!');
                return;
            }
            
            // Get recipient name for confirmation
            let recipientName = 'team member';
            if (thanksRecipient || recognitionRecipient) {
                const selectedMember = teamMembers.find(m => m.id === (thanksRecipient || recognitionRecipient));
                if (selectedMember) {
                    recipientName = selectedMember.name;
                }
            }
            
            // Show confirmation with collected data
            if (thanksRecipient && thanksMessage) {
                alert(`Thanks sent to ${recipientName}!\n\nMessage: "${thanksMessage}"\nPoints: 25\n\nIn a real app, this would integrate with RewardStation API.`);
            } else if (recognitionRecipient && recognitionMessage) {
                const behaviors = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value).join(', ');
                alert(`Recognition sent to ${recipientName}!\n\nPoints: ${pointsSelect || '100'}\nBehaviors: ${behaviors || 'None specified'}\nMessage: "${recognitionMessage}"\n\nIn a real app, this would integrate with RewardStation API.`);
            } else {
                alert('Action processed! In a real app, this would integrate with RewardStation API.');
            }
            
            closeModal();
        }

        // Auto-load balance on startup
        setTimeout(loadUserBalance, 2000);
    </script>
</body>
</html>`);
  });

  // Redirect /teams/tab to /teams for consistency
  app.get('/teams/tab', (req, res) => {
    res.redirect('/teams');
  });
};