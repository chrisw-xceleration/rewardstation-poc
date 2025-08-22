// Microsoft Teams Bot Integration
// Handles Teams messages, commands, and adaptive cards

const config = require('../../shared/config/index.js');
const { mockRewardStationAPI } = require('../api-relay/mock-rewardstation.js');
const workflowService = require('../workflow-service/index.js');

// Teams Bot Framework imports
// Note: Will need to install @microsoft/botbuilder and @microsoft/botframework-directline
let TeamsActivityHandler, CardFactory, MessageFactory, TurnContext;

// Try to import Teams dependencies, gracefully handle if not available
try {
  const botbuilder = require('botbuilder');
  TeamsActivityHandler = botbuilder.TeamsActivityHandler;
  CardFactory = botbuilder.CardFactory;
  MessageFactory = botbuilder.MessageFactory;
  TurnContext = botbuilder.TurnContext;
} catch (error) {
  console.log('⚠️ Teams botbuilder not available:', error.message);
  console.log('💡 Run: npm install botbuilder @microsoft/botframework-connector');
}

// Create a safe base class that doesn't require Teams context
class SafeTeamsBot {
  constructor() {
    // Base implementation without Teams-specific initialization
  }
}

class RewardStationTeamsBot extends (TeamsActivityHandler || SafeTeamsBot) {
  constructor() {
    // Only call super() if we have the Teams framework
    if (TeamsActivityHandler) {
      super();
      this.hasTeamsFramework = true;
    } else {
      // Call the safe base constructor
      SafeTeamsBot.prototype.constructor.call(this);
      this.hasTeamsFramework = false;
    }
    
    this.supportedCommands = [
      'help',
      'thanks',
      'give', 
      'balance',
      'debug'
    ];

    // Set up message handlers only if TeamsActivityHandler is available and we have context
    if (this.hasTeamsFramework && this.onMessage) {
      try {
        this.onMessage(async (context, next) => {
          await this.handleMessage(context, next);
        });
        console.log('✅ Teams message handler configured');
      } catch (error) {
        console.log('⚠️ Teams message handler setup failed:', error.message);
        this.hasTeamsFramework = false;
      }

      // Note: onInvokeActivity disabled until proper Teams app registration
      // Will be re-enabled when Microsoft Teams App is properly configured
    }

    console.log(`🤖 RewardStation Teams Bot initialized (Framework: ${this.hasTeamsFramework ? 'Active' : 'Mock'})`);
  }

  // Main message handler for Teams
  async handleMessage(context, next) {
    const messageText = context.activity.text?.toLowerCase().trim() || '';
    const userId = context.activity.from.id;
    const userName = context.activity.from.name;
    const channelId = context.activity.conversation.id;

    console.log(`📥 Teams message from ${userName}: "${messageText}"`);

    try {
      // Handle @mention commands
      if (messageText.includes('@rewardstation') || messageText.startsWith('/')) {
        await this.handleCommand(context, messageText, userId, userName);
      } else {
        // Regular message - could add AI contextual help here
        console.log('💬 Regular Teams message (not a command)');
      }
    } catch (error) {
      console.error('❌ Teams message handling error:', error);
      await this.sendErrorMessage(context, 'Sorry, I encountered an error processing your message.');
    }

    await next();
  }

  // Command routing for Teams
  async handleCommand(context, messageText, userId, userName) {
    // Parse command from Teams message
    const command = this.parseCommand(messageText);
    
    console.log(`🎯 Teams command: "${command.type}" from ${userName}`);

    switch (command.type) {
      case 'help':
        await this.handleHelpCommand(context);
        break;
        
      case 'thanks':
        await this.handleThanksCommand(context, command);
        break;
        
      case 'give':
        await this.handleGiveCommand(context, command);
        break;
        
      case 'balance':
        await this.handleBalanceCommand(context, userId, userName);
        break;
        
      case 'debug':
        await this.handleDebugCommand(context);
        break;
        
      default:
        await this.handleUnknownCommand(context, messageText);
    }
  }

  // Parse Teams commands (flexible format)
  parseCommand(messageText) {
    // Handle both @mentions and slash commands
    const cleanText = messageText
      .replace(/@rewardstation/gi, '')
      .replace(/^\/rewardstation/gi, '')
      .trim();

    if (cleanText.match(/^help/i)) {
      return { type: 'help' };
    }

    if (cleanText.match(/^thanks/i)) {
      const thanksMatch = cleanText.match(/thanks\\s+@?([\\w\\s]+?)\\s+[\"'](.+?)[\"']/i);
      return {
        type: 'thanks',
        recipient: thanksMatch?.[1]?.trim(),
        message: thanksMatch?.[2]?.trim()
      };
    }

    if (cleanText.match(/^give/i)) {
      const giveMatch = cleanText.match(/give\\s+@?([\\w\\s]+)/i);
      return {
        type: 'give',
        recipient: giveMatch?.[1]?.trim()
      };
    }

    if (cleanText.match(/^balance/i)) {
      return { type: 'balance' };
    }

    if (cleanText.match(/^debug/i) && config.is_development) {
      return { type: 'debug' };
    }

    return { type: 'unknown', originalText: messageText };
  }

  // Teams Help Command
  async handleHelpCommand(context) {
    const helpCard = this.createHelpCard();
    await context.sendActivity(MessageFactory.attachment(helpCard));
  }

  // Teams Quick Thanks Command  
  async handleThanksCommand(context, command) {
    if (!command.recipient || !command.message) {
      await context.sendActivity(
        MessageFactory.text(`❓ **Usage**: @RewardStation thanks @person "Your message here"\\n\\n💡 Example: @RewardStation thanks @John "Great job on the presentation!"`)
      );
      return;
    }

    try {
      // Mock user lookup (would be real Teams API call)
      const recipient = await this.findTeamsUser(command.recipient);
      if (!recipient) {
        await context.sendActivity(
          MessageFactory.text(`❓ Sorry, I couldn't find a user named "${command.recipient}"`)
        );
        return;
      }

      // Create quick recognition
      const recognition = await mockRewardStationAPI.createRecognition({
        nominator_id: context.activity.from.id,
        recipient_id: recipient.id,
        points: 25, // Default points for thanks
        message: command.message,
        recognition_type: 'thanks',
        source: 'teams_bot'
      });

      // Success response
      const successMessage = `✅ **Thanks sent!**\\n\\n` +
        `👤 **To**: ${recipient.name}\\n` +
        `💰 **Points**: 25\\n` +
        `💬 **Message**: "${command.message}"\\n\\n` +
        `🎉 Recognition #${recognition.data.recognition_id} created!`;

      await context.sendActivity(MessageFactory.text(successMessage));

    } catch (error) {
      console.error('❌ Teams thanks command error:', error);
      await this.sendErrorMessage(context, 'Failed to send thanks. Please try again.');
    }
  }

  // Teams Give Command (Adaptive Card)
  async handleGiveCommand(context, command) {
    const giveCard = this.createGiveRecognitionCard(command.recipient);
    await context.sendActivity(MessageFactory.attachment(giveCard));
  }

  // Teams Balance Command
  async handleBalanceCommand(context, userId, userName) {
    try {
      const user = await mockRewardStationAPI.getUser({ teams_id: userId });
      
      const balanceMessage = `💰 **Your current balance**: **${user.data.points} points**\\n\\n` +
        `📊 **Recognition given**: ${user.data.recognitions_given || 0}\\n` +
        `🏆 **Recognition received**: ${user.data.recognitions_received || 0}\\n\\n` +
        `💡 Keep giving recognition to earn more points!`;

      await context.sendActivity(MessageFactory.text(balanceMessage));
      
    } catch (error) {
      console.error('❌ Teams balance command error:', error);
      await this.sendErrorMessage(context, 'Failed to get balance. Please try again.');
    }
  }

  // Teams Debug Command (Development only)
  async handleDebugCommand(context) {
    if (!config.is_development) {
      await context.sendActivity(MessageFactory.text('🚫 Debug commands only available in development mode'));
      return;
    }

    const debugInfo = {
      environment: config.environment,
      teamsConfig: {
        app_id: config.teams.app_id ? '✅ Set' : '❌ Missing',
        app_password: config.teams.app_password ? '✅ Set' : '❌ Missing'
      },
      mockMode: config.enable_mocks,
      timestamp: new Date().toISOString(),
      userId: context.activity.from.id,
      userName: context.activity.from.name,
      conversationId: context.activity.conversation.id
    };

    const debugMessage = `🐛 **RewardStation Teams Debug**\\n\\n` +
      `**Environment**: ${debugInfo.environment}\\n` +
      `**Mock Mode**: ${debugInfo.mockMode}\\n` +
      `**Teams App ID**: ${debugInfo.teamsConfig.app_id}\\n` +
      `**Teams App Password**: ${debugInfo.teamsConfig.app_password}\\n\\n` +
      `**Your Info**:\\n` +
      `- User ID: ${debugInfo.userId}\\n` +
      `- Username: ${debugInfo.userName}\\n` +
      `- Conversation: ${debugInfo.conversationId}\\n\\n` +
      `⏰ ${debugInfo.timestamp}`;

    await context.sendActivity(MessageFactory.text(debugMessage));
  }

  // Unknown command handler
  async handleUnknownCommand(context, messageText) {
    const response = `❓ **I didn't understand that command**\\n\\n` +
      `💡 **Try these commands**:\\n` +
      `• @RewardStation help\\n` +
      `• @RewardStation thanks @person "message"\\n` +
      `• @RewardStation give @person\\n` +
      `• @RewardStation balance\\n\\n` +
      `🤖 Or just say "@RewardStation help" for more guidance!`;

    await context.sendActivity(MessageFactory.text(response));
  }

  // Create Teams Help Adaptive Card
  createHelpCard() {
    const helpCard = {
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: '🎉 Welcome to RewardStation!',
          weight: 'Bolder',
          size: 'Large'
        },
        {
          type: 'TextBlock',
          text: 'I\'m your AI-powered recognition assistant for Microsoft Teams.',
          wrap: true,
          spacing: 'Medium'
        },
        {
          type: 'TextBlock',
          text: '🚀 Quick Commands:',
          weight: 'Bolder',
          spacing: 'Medium'
        },
        {
          type: 'FactSet',
          facts: [
            {
              title: '@RewardStation help',
              value: 'Show this help message'
            },
            {
              title: '@RewardStation thanks @user "message"',
              value: 'Send quick thanks (25 points)'
            },
            {
              title: '@RewardStation give @user',
              value: 'Give structured recognition with points'
            },
            {
              title: '@RewardStation balance',
              value: 'Check your points balance'
            }
          ]
        },
        {
          type: 'TextBlock',
          text: '✨ **Ready to spread some recognition?**',
          weight: 'Bolder',
          spacing: 'Medium'
        }
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: '🎯 Give Recognition',
          data: {
            action: 'give_recognition'
          }
        }
      ]
    };

    return CardFactory.adaptiveCard(helpCard);
  }

  // Create Give Recognition Adaptive Card
  createGiveRecognitionCard(recipient = '') {
    const giveCard = {
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: '⭐ Give Recognition',
          weight: 'Bolder',
          size: 'Large'
        },
        {
          type: 'TextBlock',
          text: 'Recognize someone\'s great work with points and a meaningful message.',
          wrap: true,
          spacing: 'Medium'
        },
        {
          type: 'Input.Text',
          id: 'recipient',
          label: '👤 Recipient',
          placeholder: 'Enter name or @mention',
          value: recipient
        },
        {
          type: 'Input.ChoiceSet',
          id: 'points',
          label: '💰 Points',
          choices: [
            { title: '25 points - Good job', value: '25' },
            { title: '50 points - Great work', value: '50' },
            { title: '100 points - Excellent work', value: '100' },
            { title: '250 points - Outstanding achievement', value: '250' },
            { title: '500 points - Exceptional contribution', value: '500' }
          ],
          value: '50'
        },
        {
          type: 'Input.Text',
          id: 'message',
          label: '💬 Recognition Message',
          placeholder: 'Describe what they did well...',
          isMultiline: true
        },
        {
          type: 'Input.ChoiceSet',
          id: 'behaviors',
          label: '🎯 Behaviors (optional)',
          isMultiSelect: true,
          choices: [
            { title: '🏆 Leadership', value: 'leadership' },
            { title: '🤝 Teamwork', value: 'teamwork' },
            { title: '💡 Innovation', value: 'innovation' },
            { title: '📈 Results', value: 'results' },
            { title: '🎓 Learning', value: 'learning' },
            { title: '💪 Ownership', value: 'ownership' }
          ]
        }
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: '🚀 Send Recognition',
          data: {
            action: 'submit_recognition'
          }
        },
        {
          type: 'Action.Submit',
          title: '🤖 Enhance with AI',
          data: {
            action: 'enhance_recognition'
          }
        }
      ]
    };

    return CardFactory.adaptiveCard(giveCard);
  }

  // Handle Adaptive Card submissions
  async handleCardSubmission(context) {
    const data = context.activity.value;
    
    console.log('📤 Teams card submission:', data);

    switch (data.action) {
      case 'give_recognition':
        await this.handleGiveCommand(context, {});
        break;
        
      case 'submit_recognition':
        await this.processRecognitionSubmission(context, data);
        break;
        
      case 'enhance_recognition':
        await this.processAIEnhancement(context, data);
        break;
        
      default:
        console.log('Unknown card action:', data.action);
    }
  }

  // Process recognition form submission
  async processRecognitionSubmission(context, data) {
    try {
      // Validate required fields
      if (!data.recipient || !data.message || !data.points) {
        await context.sendActivity(
          MessageFactory.text('❌ Please fill in all required fields (recipient, message, and points)')
        );
        return;
      }

      // Find recipient
      const recipient = await this.findTeamsUser(data.recipient);
      if (!recipient) {
        await context.sendActivity(
          MessageFactory.text(`❓ Sorry, I couldn't find a user named "${data.recipient}"`)
        );
        return;
      }

      // Create recognition
      const recognition = await mockRewardStationAPI.createRecognition({
        nominator_id: context.activity.from.id,
        recipient_id: recipient.id,
        points: parseInt(data.points),
        message: data.message,
        behavior_attributes: data.behaviors ? data.behaviors.split(',') : [],
        recognition_type: 'points',
        source: 'teams_adaptive_card'
      });

      // Success message
      const successMessage = `✅ **Recognition sent successfully!**\\n\\n` +
        `👤 **Recipient**: ${recipient.name}\\n` +
        `💰 **Points**: ${data.points}\\n` +
        `💬 **Message**: "${data.message}"\\n` +
        `${data.behaviors ? `🎯 **Behaviors**: ${data.behaviors.replace(/,/g, ', ')}\\n` : ''}\\n` +
        `🎉 Recognition #${recognition.data.recognition_id} created!`;

      await context.sendActivity(MessageFactory.text(successMessage));

    } catch (error) {
      console.error('❌ Teams recognition submission error:', error);
      await this.sendErrorMessage(context, 'Failed to send recognition. Please try again.');
    }
  }

  // Process AI enhancement request
  async processAIEnhancement(context, data) {
    try {
      // Load AI enhancement service
      const { MaslowXAI } = require('../maslow-agent/maslow-x-ai.js');
      const maslowX = new MaslowXAI();

      console.log('✨ Teams AI Enhancement Request');
      console.log(`Original message: "${data.message}"`);

      // Enhance message
      const enhanced = await maslowX.enhanceMessage(data.message, {
        platform: 'teams',
        recipient: data.recipient,
        points: data.points,
        behaviors: data.behaviors
      });

      console.log(`Enhanced message: "${enhanced.enhancedMessage}"`);

      // Create enhancement preview card
      const enhancementCard = this.createEnhancementPreviewCard(data, enhanced);
      await context.sendActivity(MessageFactory.attachment(enhancementCard));

    } catch (error) {
      console.error('❌ Teams AI enhancement error:', error);
      await this.sendErrorMessage(context, 'AI enhancement failed. Please try submitting without enhancement.');
    }
  }

  // Create AI enhancement preview card
  createEnhancementPreviewCard(originalData, enhancement) {
    const enhancementCard = {
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: '🤖 AI Enhancement Preview',
          weight: 'Bolder',
          size: 'Medium'
        },
        {
          type: 'TextBlock',
          text: `**Recipient**: ${originalData.recipient} • **Points**: ${originalData.points}`,
          spacing: 'Medium'
        },
        {
          type: 'Container',
          style: 'accent',
          items: [
            {
              type: 'TextBlock',
              text: '📝 **Your Original Message**:',
              weight: 'Bolder'
            },
            {
              type: 'TextBlock',
              text: `"${originalData.message}"`,
              wrap: true
            }
          ]
        },
        {
          type: 'Container',
          style: 'good',
          items: [
            {
              type: 'TextBlock',
              text: '🤖 **Maslow X Enhanced Version**:',
              weight: 'Bolder'
            },
            {
              type: 'TextBlock',
              text: `"${enhancement.enhancedMessage}"`,
              wrap: true
            }
          ]
        },
        {
          type: 'Input.Text',
          id: 'final_message',
          label: '✏️ Final Message (editable)',
          placeholder: 'You can edit the enhanced message or use it as-is',
          value: enhancement.enhancedMessage,
          isMultiline: true
        },
        {
          type: 'TextBlock',
          text: '💡 **Tip**: The enhanced version leverages 25 years of B2B recognition expertise',
          isSubtle: true,
          spacing: 'Medium'
        }
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: '🚀 Send Enhanced',
          data: {
            action: 'send_enhanced',
            recipient: originalData.recipient,
            points: originalData.points,
            behaviors: originalData.behaviors,
            original_message: originalData.message,
            ai_enhanced: true
          }
        },
        {
          type: 'Action.Submit',
          title: '📝 Send Original Instead',
          data: {
            action: 'send_original',
            recipient: originalData.recipient,
            points: originalData.points,
            behaviors: originalData.behaviors,
            message: originalData.message,
            ai_enhanced: false
          }
        }
      ]
    };

    return CardFactory.adaptiveCard(enhancementCard);
  }

  // Mock Teams user lookup (would be real Graph API call)
  async findTeamsUser(identifier) {
    // In real implementation, this would call Microsoft Graph API
    // For now, return mock users
    const mockUsers = [
      { id: 'teams-user-1', name: 'John Doe', email: 'john@company.com' },
      { id: 'teams-user-2', name: 'Jane Smith', email: 'jane@company.com' },
      { id: 'teams-user-3', name: 'Ben Levenbaum', email: 'ben@company.com' },
      { id: 'teams-user-4', name: 'Chris Wilson', email: 'chris@company.com' }
    ];

    const cleanId = identifier.replace('@', '').toLowerCase().trim();
    return mockUsers.find(user => 
      user.name.toLowerCase().includes(cleanId) ||
      user.email.toLowerCase().includes(cleanId)
    );
  }

  // Send error message to Teams
  async sendErrorMessage(context, message) {
    const errorMessage = `❌ **Error**\\n\\n${message}\\n\\n💡 Try the command again or use @RewardStation help for guidance.`;
    await context.sendActivity(MessageFactory.text(errorMessage));
  }

  // Health check for Teams bot
  async healthCheck() {
    return {
      platform: 'teams',
      status: this.hasTeamsFramework ? 'ready' : 'framework_unavailable',
      framework: this.hasTeamsFramework ? 'active' : 'mock',
      commands: this.supportedCommands.length,
      dependencies: {
        botbuilder: !!TeamsActivityHandler,
        messageHandler: !!(this.hasTeamsFramework && this.onMessage)
      },
      note: this.hasTeamsFramework ? 
        'Teams Bot Framework active - requires Microsoft Teams App registration' :
        'Mock mode - Teams Bot Framework not configured',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  RewardStationTeamsBot
};