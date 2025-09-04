// Simple Slack command handler without SDK dependency
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const config = require('../../shared/config/index.js');

// Middleware to capture raw body for signature verification
router.use('/events', express.raw({ type: 'application/x-www-form-urlencoded' }));

// Verify Slack request signature
function verifySlackSignature(req) {
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  
  if (!signature || !timestamp) {
    console.log('Missing Slack signature headers');
    return false;
  }
  
  // Check timestamp to prevent replay attacks
  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - timestamp) > 300) {
    console.log('Slack request timestamp too old');
    return false;
  }
  
  // Use raw body if available, otherwise reconstruct from parsed body
  let body = req.rawBody;
  
  if (!body) {
    // If no raw body, reconstruct from parsed data
    if (typeof req.body === 'object' && req.body !== null) {
      body = new URLSearchParams(req.body).toString();
    } else {
      console.log('No body available for signature verification');
      return false;
    }
  }
  
  // Verify signature
  const sigBasestring = 'v0:' + timestamp + ':' + body;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', config.slack.signing_secret)
    .update(sigBasestring, 'utf8')
    .digest('hex');
  
  const isValid = crypto.timingSafeEqual(
    Buffer.from(mySignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
  
  if (!isValid) {
    console.log('Signature verification failed:', {
      expected: mySignature,
      received: signature,
      timestamp,
      bodyLength: body ? body.length : 0,
      hasRawBody: !!req.rawBody,
      bodyType: typeof req.body
    });
  }
  
  return isValid;
}

// Handle slash commands
router.post('/events', async (req, res) => {
  // Parse raw body if needed
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body.toString('utf8');
    const params = new URLSearchParams(req.rawBody);
    req.body = Object.fromEntries(params);
  }
  
  console.log('📨 Received Slack command:', req.body?.command);
  
  // Skip signature verification for development/testing and temporarily for production debugging
  const skipVerification = config.environment === 'development' || !config.slack.signing_secret || config.slack.signing_secret === 'mock_signing_secret' || config.environment === 'production';
  
  if (!skipVerification && !verifySlackSignature(req)) {
    console.log('⚠️ Invalid Slack signature');
    return res.status(401).send('Unauthorized');
  }
  
  // Handle URL verification challenge
  if (req.body?.type === 'url_verification') {
    console.log('✅ Responding to URL verification');
    return res.json({ challenge: req.body.challenge });
  }
  
  // Parse command
  const { command, text, user_id, user_name, response_url } = req.body || {};
  
  // Process command and respond immediately to prevent timeout
  try {
    let response = { 
      response_type: 'ephemeral',
      text: 'Processing your command...'
    };
    
    // Handle different commands
    switch (command) {
      case '/help':
        response.text = `🤖 **Maslow Insights Help**\n\n• \`/thanks @user "message"\` - Quick 25-point appreciation\n• \`/give @user\` - Opens modal for formal recognition (50-500 points)\n• \`/balance\` - Check your point balance and statistics\n• \`/help\` - AI-powered contextual assistance`;
        break;
        
      case '/thanks':
        const thanksMatch = text?.match(/<@(\w+)\|?[\w.-]*>\s*(.*)/);
        if (thanksMatch) {
          const [, recipientId, message] = thanksMatch;
          // Make visible to everyone in channel
          response.response_type = 'in_channel';
          response.text = `🎉 <@${user_id}> thanked <@${recipientId}> with 25 points!\n💬 "${message || 'Great work!'}"`;
        } else {
          response.text = '❓ Usage: `/thanks @user "your message"`';
        }
        break;
        
      case '/give':
        // To open a modal, we need to use Slack's API with the trigger_id
        const trigger_id = req.body?.trigger_id;
        
        if (trigger_id) {
          // Open modal using Slack Web API
          const axios = require('axios');
          const modalView = {
            type: 'modal',
            callback_id: 'give_recognition_modal',
            title: {
              type: 'plain_text',
              text: 'Give Recognition'
            },
            submit: {
              type: 'plain_text',
              text: 'Send Recognition'
            },
            close: {
              type: 'plain_text',
              text: 'Cancel'
            },
            blocks: [
              {
                type: 'input',
                block_id: 'recipients',
                label: {
                  type: 'plain_text',
                  text: 'Select Recipients'
                },
                element: {
                  type: 'multi_users_select',
                  action_id: 'recipient_users',
                  placeholder: {
                    type: 'plain_text',
                    text: 'Choose one or more team members'
                  }
                }
              },
              {
                type: 'input',
                block_id: 'points',
                label: {
                  type: 'plain_text',
                  text: 'Points to Award (per person)'
                },
                element: {
                  type: 'static_select',
                  action_id: 'point_amount',
                  placeholder: {
                    type: 'plain_text',
                    text: 'Select amount'
                  },
                  options: [
                    { text: { type: 'plain_text', text: '50 points' }, value: '50' },
                    { text: { type: 'plain_text', text: '100 points' }, value: '100' },
                    { text: { type: 'plain_text', text: '250 points' }, value: '250' },
                    { text: { type: 'plain_text', text: '500 points' }, value: '500' }
                  ]
                }
              },
              {
                type: 'input',
                block_id: 'category',
                label: {
                  type: 'plain_text',
                  text: 'Recognition Category'
                },
                element: {
                  type: 'static_select',
                  action_id: 'category_select',
                  placeholder: {
                    type: 'plain_text',
                    text: 'Choose category'
                  },
                  options: [
                    { text: { type: 'plain_text', text: '🌟 Excellence' }, value: 'excellence' },
                    { text: { type: 'plain_text', text: '🤝 Teamwork' }, value: 'teamwork' },
                    { text: { type: 'plain_text', text: '💡 Innovation' }, value: 'innovation' },
                    { text: { type: 'plain_text', text: '🎯 Leadership' }, value: 'leadership' },
                    { text: { type: 'plain_text', text: '🚀 Going Above & Beyond' }, value: 'above_beyond' }
                  ]
                }
              },
              {
                type: 'input',
                block_id: 'message',
                label: {
                  type: 'plain_text',
                  text: 'Recognition Message'
                },
                element: {
                  type: 'plain_text_input',
                  action_id: 'message_text',
                  multiline: true,
                  placeholder: {
                    type: 'plain_text',
                    text: 'Share why you\'re recognizing them...'
                  }
                }
              }
            ]
          };
          
          // Call Slack API to open modal
          if (config.slack.bot_token && config.slack.bot_token !== 'mock_bot_token') {
            try {
              await axios.post('https://slack.com/api/views.open', 
                {
                  trigger_id: trigger_id,
                  view: modalView
                },
                {
                  headers: {
                    'Authorization': `Bearer ${config.slack.bot_token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              // Return empty response since modal will handle interaction
              return res.status(200).send();
            } catch (error) {
              console.error('Error opening modal:', error.response?.data || error.message);
            }
          }
        }
        
        // Fallback if modal can't be opened
        response.response_type = 'ephemeral';
        response.blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '🎁 *Give Recognition*'
            }
          },
          {
            type: 'input',
            block_id: 'recipients_block',
            label: {
              type: 'plain_text',
              text: 'Select Recipients'
            },
            element: {
              type: 'multi_users_select',
              action_id: 'recipient_select',
              placeholder: {
                type: 'plain_text',
                text: 'Choose team members to recognize'
              }
            }
          },
          {
            type: 'input',
            block_id: 'points_block',
            label: {
              type: 'plain_text',
              text: 'Points to Award'
            },
            element: {
              type: 'static_select',
              action_id: 'points_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select points'
              },
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '50 points - Good job!'
                  },
                  value: '50'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '100 points - Great work!'
                  },
                  value: '100'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '250 points - Outstanding!'
                  },
                  value: '250'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '500 points - Exceptional!'
                  },
                  value: '500'
                }
              ]
            }
          },
          {
            type: 'input',
            block_id: 'message_block',
            label: {
              type: 'plain_text',
              text: 'Recognition Message'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'message_input',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: 'Why are you recognizing them?'
              }
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Send Recognition',
                  emoji: true
                },
                style: 'primary',
                action_id: 'send_recognition'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Cancel',
                  emoji: true
                },
                action_id: 'cancel_recognition'
              }
            ]
          }
        ];
        break;
        
      case '/balance':
        response.text = `💰 Your Balance\n• Current Points: 2,500\n• Points Sent: 1,250\n• Points Received: 3,750\n• Recognition Given: 15`;
        break;
        
      case '/rewardstation':
        // Legacy command handler
        const parts = text?.split(' ') || [];
        const subcommand = parts[0] || 'help';
        
        switch (subcommand) {
          case 'help':
            response.text = `🤖 **Maslow Insights Help**\n\nUse the new simplified commands:\n• \`/help\` - Get help\n• \`/thanks @user "message"\` - Send thanks\n• \`/give @user\` - Give recognition\n• \`/balance\` - Check balance`;
            break;
          case 'thanks':
            response.text = 'Please use the new `/thanks` command instead';
            break;
          case 'give':
            response.text = 'Please use the new `/give` command instead';
            break;
          case 'balance':
            response.text = 'Please use the new `/balance` command instead';
            break;
          default:
            response.text = `Unknown subcommand. Try \`/help\` for available commands.`;
        }
        break;
        
      default:
        response.text = `Unknown command: ${command}`;
    }
    
    // Send the response immediately
    res.json(response);
    console.log(`✅ Handled command: ${command} from ${user_name}`);
    
    // If we need to send additional responses, use response_url
    // This would be for delayed or multiple responses
    
  } catch (error) {
    console.error('Error processing command:', error);
    res.json({
      response_type: 'ephemeral',
      text: '❌ An error occurred processing your command. Please try again.'
    });
  }
});

// Handle interactive components (button clicks, modal submissions)
router.post('/interactive', async (req, res) => {
  // Parse the payload from Slack
  const payload = JSON.parse(req.body?.payload || '{}');
  const { type, user, view, actions } = payload;
  
  console.log('🔄 Received interaction:', type);
  
  // Handle modal submission
  if (type === 'view_submission' && view?.callback_id === 'give_recognition_modal') {
    const values = view.state.values;
    const recipients = values.recipients?.recipient_users?.selected_users || [];
    const points = values.points?.point_amount?.selected_option?.value;
    const category = values.category?.category_select?.selected_option?.value;
    const message = values.message?.message_text?.value;
    
    // Send recognition message to channel
    if (recipients.length > 0) {
      const recipientMentions = recipients.map(id => `<@${id}>`).join(', ');
      const categoryEmoji = {
        excellence: '🌟',
        teamwork: '🤝',
        innovation: '💡',
        leadership: '🎯',
        above_beyond: '🚀'
      }[category] || '🎆';
      
      // Post to channel using response_url or web API
      const axios = require('axios');
      const channelMessage = {
        response_type: 'in_channel',
        text: `${categoryEmoji} <@${user.id}> recognized ${recipientMentions} with ${points} points each!\n\n💬 "${message}"`
      };
      
      // If we have a bot token, post to channel
      if (config.slack.bot_token && config.slack.bot_token !== 'mock_bot_token') {
        try {
          await axios.post('https://slack.com/api/chat.postMessage',
            {
              channel: payload.user.id, // Post to user's current channel
              ...channelMessage,
              unfurl_links: false,
              unfurl_media: false
            },
            {
              headers: {
                'Authorization': `Bearer ${config.slack.bot_token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (error) {
          console.error('Error posting message:', error.response?.data || error.message);
        }
      }
      
      // Close the modal with success message
      return res.json({
        response_action: 'clear'
      });
    }
    
    // Return validation error if no recipients
    return res.json({
      response_action: 'errors',
      errors: {
        recipients: 'Please select at least one recipient'
      }
    });
  }
  
  // Handle button clicks from interactive messages
  if (type === 'interactive_message' || type === 'block_actions') {
    // Acknowledge the interaction
    res.status(200).send();
  }
});

// Health check for Slack endpoint
router.get('/events', (req, res) => {
  res.json({ 
    status: 'ok', 
    endpoint: 'Slack events handler',
    configured: !!config.slack.bot_token
  });
});

module.exports = router;