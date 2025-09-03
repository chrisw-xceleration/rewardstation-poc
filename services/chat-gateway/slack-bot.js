// Slack Bot Implementation for RewardStation Integration
// Handles all Slack interactions and commands

const { App } = require('@slack/bolt');
const axios = require('axios');
const config = require('../../shared/config/index.js');
const { mockRewardStationAPI } = require('../api-relay/mock-rewardstation.js');

// Initialize Slack app
const hasToken = !!config.slack.bot_token && config.slack.bot_token !== 'xoxb-mock-bot-token';
const hasSecret = !!config.slack.signing_secret && config.slack.signing_secret !== 'mock-signing-secret';

console.log('🔧 Initializing Slack app with config:', {
  token: hasToken ? `${config.slack.bot_token.substring(0, 20)}...` : 'MISSING/MOCK',
  signingSecret: hasSecret ? `${config.slack.signing_secret.substring(0, 8)}...` : 'MISSING/MOCK',
  socketMode: false,
  hasValidCredentials: hasToken && hasSecret
});

let slackApp;
if (hasToken && hasSecret) {
  try {
    slackApp = new App({
      token: config.slack.bot_token,
      signingSecret: config.slack.signing_secret,
      socketMode: false, // Use HTTP mode for production deployment
    });
    console.log('✅ Slack app initialized successfully');
    console.log('🔗 Slack app receiver available:', !!slackApp.receiver);
    console.log('🔗 Slack app router available:', !!(slackApp.receiver && slackApp.receiver.router));
  } catch (error) {
    console.error('❌ Failed to initialize Slack app:', error.message);
    slackApp = null;
  }
} else {
  console.log('⚠️ Slack app not initialized - missing credentials');
  slackApp = null;
}

// Utility function to call Maslow X
async function callMaslowX(endpoint, data) {
  try {
    const response = await axios.post(`${config.services.maslow_agent}${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error('Maslow X error:', error);
    return { success: false, error: 'AI assistant unavailable' };
  }
}

// Parse Slack user mentions
function parseSlackMention(text) {
  const match = text.match(/<@([A-Z0-9]+)>/);
  return match ? match[1] : null;
}

// Generate Block Kit for thanks celebration
function generateThanksBlocks(nominator, recipient, message) {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🎉 *<@${nominator}>* thanked *<@${recipient}>*!`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `💝 _"${message}"_`
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "✨ Powered by RewardStation & Maslow X"
        }
      ]
    }
  ];
}

// Generate Block Kit for recognition modal
function generateRecognitionModal() {
  return {
    type: "modal",
    callback_id: "recognition_modal",
    title: {
      type: "plain_text",
      text: "Give Recognition"
    },
    submit: {
      type: "plain_text",
      text: "Send Recognition"
    },
    close: {
      type: "plain_text",
      text: "Cancel"
    },
    blocks: [
      {
        type: "input",
        block_id: "recipient_block",
        element: {
          type: "users_select",
          action_id: "recipient_select",
          placeholder: {
            type: "plain_text",
            text: "Select recipient"
          }
        },
        label: {
          type: "plain_text",
          text: "Who are you recognizing?"
        }
      },
      {
        type: "input",
        block_id: "points_block",
        element: {
          type: "static_select",
          action_id: "points_select",
          placeholder: {
            type: "plain_text",
            text: "Select point amount"
          },
          options: [
            {
              text: { type: "plain_text", text: "50 points - Daily help" },
              value: "50"
            },
            {
              text: { type: "plain_text", text: "100 points - Good work" },
              value: "100"
            },
            {
              text: { type: "plain_text", text: "150 points - Great effort" },
              value: "150"
            },
            {
              text: { type: "plain_text", text: "200 points - Exceptional" },
              value: "200"
            },
            {
              text: { type: "plain_text", text: "250 points - Outstanding" },
              value: "250"
            },
            {
              text: { type: "plain_text", text: "500 points - Extraordinary" },
              value: "500"
            }
          ]
        },
        label: {
          type: "plain_text",
          text: "Point amount"
        }
      },
      {
        type: "input",
        block_id: "behavior_block",
        element: {
          type: "checkboxes",
          action_id: "behavior_checkboxes",
          options: [
            {
              text: { type: "plain_text", text: "Innovation" },
              value: "innovation"
            },
            {
              text: { type: "plain_text", text: "Teamwork" },
              value: "teamwork"
            },
            {
              text: { type: "plain_text", text: "Customer Focus" },
              value: "customer_focus"
            },
            {
              text: { type: "plain_text", text: "Leadership" },
              value: "leadership"
            },
            {
              text: { type: "plain_text", text: "Quality Excellence" },
              value: "quality_excellence"
            },
            {
              text: { type: "plain_text", text: "Accountability" },
              value: "accountability"
            }
          ]
        },
        label: {
          type: "plain_text",
          text: "Behavior attributes (select all that apply)"
        },
        optional: false
      },
      {
        type: "input",
        block_id: "message_block",
        element: {
          type: "plain_text_input",
          action_id: "message_input",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "Describe the specific behavior or achievement..."
          }
        },
        label: {
          type: "plain_text",
          text: "Recognition message"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "💡 *Tip:* Maslow X can help enhance your message for maximum impact!"
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "✨ Enhance Message"
          },
          action_id: "enhance_message_button"
        }
      }
    ]
  };
}

// Main slash command handlers - only register if app is initialized
if (slackApp) {
  // Help command
  slackApp.command('/help', async ({ command, ack, respond, client }) => {
    await ack();
    await handleHelp(command, respond);
  });

  // Thanks command
  slackApp.command('/thanks', async ({ command, ack, respond, client }) => {
    await ack();
    const text = command.text.trim();
    await handleThanks({ ...command, text: text }, respond, client);
  });

  // Give command  
  slackApp.command('/give', async ({ command, ack, respond, client }) => {
    await ack();
    const text = command.text.trim();
    await handleGive({ ...command, text: text }, respond, client);
  });

  // Balance command
  slackApp.command('/balance', async ({ command, ack, respond, client }) => {
    await ack();
    await handleBalance(command, respond);
  });

  // Legacy handler for backward compatibility
  slackApp.command('/rewardstation', async ({ command, ack, respond, client }) => {
  await ack();

  const text = command.text.trim();
  const parts = text.split(' ');
  const subcommand = parts[0] || 'help';

  console.log(`🔥 RewardStation Command: /${command.command} ${text}`);

  try {
    switch (subcommand) {
      case 'help':
      case '':
        await handleHelpCommand(respond, command);
        break;

      case 'thanks':
        await handleThanksCommand(respond, command, client, text);
        break;

      case 'give':
        await handleGiveCommand(respond, command, client);
        break;

      case 'balance':
        await handleBalanceCommand(respond, command);
        break;

      case 'debug':
        await handleDebugCommand(respond);
        break;

      default:
        await respond({
          response_type: 'ephemeral',
          text: `❓ Unknown command: \`${subcommand}\`\n\nTry \`/help\` for available commands.`
        });
    }
  } catch (error) {
    console.error('Command error:', error);
    const errorMessage = getErrorMessage(error);
    await respond({
      response_type: 'ephemeral',
      text: `⚠️ ${errorMessage}\n\n💡 If this continues, try:\n• Wait a moment and retry\n• Use \`/help\` for guidance\n• Contact IT support if needed`
    });
  }
  });
} // End of slackApp command registration

// Help command handler
async function handleHelpCommand(respond, command) {
  const maslowResponse = await callMaslowX('/help', {
    type: 'help',
    context: {
      user: {
        id: command.user_id,
        platform: 'slack'
      }
    }
  });

  if (maslowResponse.success) {
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: maslowResponse.data.response_text
        }
      }
    ];

    // Add suggested actions as buttons
    if (maslowResponse.data.suggested_actions?.length > 0) {
      blocks.push({
        type: "actions",
        elements: maslowResponse.data.suggested_actions.map((action) => ({
          type: "button",
          text: {
            type: "plain_text",
            text: action.text
          },
          value: action.command,
          action_id: `help_action_${action.text.toLowerCase().replace(/\s+/g, '_')}`
        }))
      });
    }

    await respond({
      response_type: 'ephemeral',
      blocks
    });
  } else {
    await respond({
      response_type: 'ephemeral',
      text: `🤖 **Maslow Insights Help**\n\n• \`/thanks @user "message"\` - Quick 25-point appreciation\n• \`/give @user\` - Opens modal for formal recognition (50-500 points)\n• \`/balance\` - Check your point balance and statistics\n• \`/help\` - AI-powered contextual assistance`
    });
  }
}

// Thanks command handler
async function handleThanksCommand(respond, command, client, fullText) {
  const parts = fullText.split(' ');
  
  if (parts.length < 3) {
    await respond({
      response_type: 'ephemeral',
      text: '❓ Usage: `/rewardstation thanks @user "your message"`\n\nExample: `/rewardstation thanks @sarah "Great job on the presentation!"`'
    });
    return;
  }

  const recipientMention = parseSlackMention(parts[1]);
  if (!recipientMention) {
    await respond({
      response_type: 'ephemeral',
      text: '❓ Please mention a user with @username\n\nExample: `/rewardstation thanks @sarah "Great job!"`'
    });
    return;
  }

  // Extract message (everything after the user mention)
  const messageStartIndex = fullText.indexOf(parts[1]) + parts[1].length;
  const message = fullText.substring(messageStartIndex).trim().replace(/^["']|["']$/g, '');

  if (!message) {
    await respond({
      response_type: 'ephemeral',
      text: '❓ Please include a message\n\nExample: `/rewardstation thanks @sarah "Great job on the presentation!"`'
    });
    return;
  }

  try {
    // Get user info for the recipient
    const userInfo = await client.users.info({ user: recipientMention });
    const recipientEmail = userInfo.user?.profile?.email;

    if (!recipientEmail) {
      await respond({
        response_type: 'ephemeral',
        text: '⚠️ Could not find email for recipient. Please make sure they are in your workspace.'
      });
      return;
    }

    // Look up users in mock RewardStation
    const nominatorLookup = await mockRewardStationAPI.lookupUserBySlackId(command.user_id);
    const recipientLookup = await mockRewardStationAPI.lookupUser(recipientEmail);

    if (!nominatorLookup.success || !recipientLookup.success) {
      await respond({
        response_type: 'ephemeral',
        text: '⚠️ User lookup failed. This is likely a configuration issue.'
      });
      return;
    }

    // Create thanks recognition
    const thanksRequest = {
      nominator_id: command.user_id,
      recipient_id: recipientMention,
      message,
      platform: 'slack',
      channel_id: command.channel_id
    };

    const recognitionResult = await mockRewardStationAPI.createRecognition({
      nominator_employee_id: nominatorLookup.data.employee_id,
      recipient_employee_id: recipientLookup.data.employee_id,
      recognition_type: 'thanks',
      message,
      behavior_attributes: [],
      source_platform: 'slack',
      source_channel_id: command.channel_id,
      metadata: {
        original_command: `/rewardstation thanks @${userInfo.user.name} "${message}"`,
        ai_enhanced: false,
        timestamp: new Date().toISOString()
      }
    });

    if (recognitionResult.success) {
      // Send celebration to the channel
      await client.chat.postMessage({
        channel: command.channel_id,
        blocks: generateThanksBlocks(command.user_id, recipientMention, message)
      });

      // Send private confirmation to the nominator
      await respond({
        response_type: 'ephemeral',
        text: `✅ Thanks sent to <@${recipientMention}>! 🎉`
      });

      // Send DM to recipient
      try {
        await client.chat.postMessage({
          channel: recipientMention,
          text: `🎉 You received thanks from <@${command.user_id}>!\n\n💝 _"${message}"_\n\n✨ Keep up the great work!`
        });
      } catch (dmError) {
        console.log('Could not send DM to recipient (they may have DMs disabled)');
      }

    } else {
      await respond({
        response_type: 'ephemeral',
        text: '⚠️ Failed to send thanks. Please try again.'
      });
    }

  } catch (error) {
    console.error('Thanks command error:', error);
    const errorMessage = getErrorMessage(error);
    await respond({
      response_type: 'ephemeral',
      text: `⚠️ Failed to send thanks: ${errorMessage}\n\n🔄 **What to try:**\n• Check that the recipient is in your workspace\n• Verify your message is properly formatted\n• Try the command again in a few seconds`
    });
  }
}

// Give command handler (opens modal)
async function handleGiveCommand(respond, command, client) {
  try {
    await client.views.open({
      trigger_id: command.trigger_id,
      view: generateRecognitionModal()
    });
  } catch (error) {
    console.error('Modal open error:', error);
    await respond({
      response_type: 'ephemeral',
      text: '⚠️ Could not open recognition form. Please try again.'
    });
  }
}

// Balance command handler
async function handleBalanceCommand(respond, command) {
  try {
    const userLookup = await mockRewardStationAPI.lookupUserBySlackId(command.user_id);
    
    if (userLookup.success) {
      const balanceResult = await mockRewardStationAPI.getUserBalance(userLookup.data.employee_id);
      
      if (balanceResult.success) {
        await respond({
          response_type: 'ephemeral',
          text: `💰 Your current balance: **${balanceResult.data.balance} points**\n\n💡 Keep giving recognition to earn more points!`
        });
      } else {
        await respond({
          response_type: 'ephemeral',
          text: '⚠️ Could not retrieve balance. Please try again.'
        });
      }
    } else {
      await respond({
        response_type: 'ephemeral',
        text: '⚠️ User lookup failed. Please contact support.'
      });
    }
  } catch (error) {
    console.error('Balance command error:', error);
    await respond({
      response_type: 'ephemeral',
      text: '⚠️ Could not check balance. Please try again.'
    });
  }
}

// Debug command (development only)
async function handleDebugCommand(respond) {
  if (!config.is_development) {
    await respond({
      response_type: 'ephemeral',
      text: '❌ Debug command not available in production'
    });
    return;
  }

  const users = mockRewardStationAPI.getAllUsers();
  const recognitions = mockRewardStationAPI.getAllRecognitions();

  await respond({
    response_type: 'ephemeral',
    text: `🐛 **Debug Info**\n\n**Users**: ${users.length}\n**Recognitions**: ${recognitions.length}\n**Mock Mode**: ${config.enable_mocks}\n**Environment**: ${config.environment}`
  });
}

// Handle modal submission
// Modal submission handler - only register if app is initialized
if (slackApp) {
  slackApp.view('recognition_modal', async ({ ack, body, view, client }) => {
  await ack();

  try {
    const values = view.state.values;
    const recipient = values.recipient_block.recipient_select.selected_user;
    const points = parseInt(values.points_block.points_select.selected_option.value);
    const behaviors = values.behavior_block.behavior_checkboxes.selected_options?.map(opt => opt.value) || [];
    const message = values.message_block.message_input.value;

    if (!recipient || !points || behaviors.length === 0 || !message) {
      // This shouldn't happen due to validation, but just in case
      return;
    }

    // Get recipient info
    const userInfo = await client.users.info({ user: recipient });
    const recipientEmail = userInfo.user?.profile?.email;

    if (!recipientEmail) {
      return;
    }

    // Look up users
    const nominatorLookup = await mockRewardStationAPI.lookupUserBySlackId(body.user.id);
    const recipientLookup = await mockRewardStationAPI.lookupUser(recipientEmail);

    if (!nominatorLookup.success || !recipientLookup.success) {
      return;
    }

    // Create recognition
    const recognitionResult = await mockRewardStationAPI.createRecognition({
      nominator_employee_id: nominatorLookup.data.employee_id,
      recipient_employee_id: recipientLookup.data.employee_id,
      recognition_type: 'points',
      points,
      message,
      behavior_attributes: behaviors,
      source_platform: 'slack',
      source_channel_id: '', // Modal doesn't have channel context
      metadata: {
        original_command: '/rewardstation give (modal)',
        ai_enhanced: false,
        timestamp: new Date().toISOString()
      }
    });

    if (recognitionResult.success) {
      // Send confirmation to the user
      await client.chat.postEphemeral({
        channel: body.user.id,
        user: body.user.id,
        text: `✅ Recognition submitted! 🌟\n\n**Recipient**: <@${recipient}>\n**Points**: ${points}\n**Status**: ${recognitionResult.data.approval_required ? 'Pending approval' : 'Delivered'}\n\n${recognitionResult.data.approval_required ? '⏳ Your recognition will be delivered once approved.' : '🎉 Recognition delivered immediately!'}`
      });

      console.log('Recognition created:', recognitionResult.data);
    }

  } catch (error) {
    console.error('Modal submission error:', error);
  }
  });
} // End of modal handler registration

// Enhanced error handling utility
function getErrorMessage(error) {
  if (error.code === 'slack_webapi_platform_error') {
    return 'Slack API temporarily unavailable';
  }
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
    return 'Network connectivity issue';
  }
  if (error.message?.includes('invalid_auth')) {
    return 'Authentication error - please contact IT';
  }
  if (error.message?.includes('rate_limited')) {
    return 'Too many requests - please wait a moment';
  }
  if (error.message?.includes('timeout')) {
    return 'Request timed out - system may be busy';
  }
  return 'Unexpected error occurred';
}

console.log('🚀 Slack bot initialized');

module.exports = { slackApp: slackApp || { receiver: { router: null } }, getErrorMessage };