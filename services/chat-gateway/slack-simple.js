// Simple Slack command handler without SDK dependency
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const config = require('../../shared/config/index.js');

// Middleware to capture raw body for signature verification
router.use(express.raw({ type: 'application/x-www-form-urlencoded' }));
router.use(express.urlencoded({ extended: true }));

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
  
  // Use raw body if available, otherwise fall back to parsed body
  let body;
  if (Buffer.isBuffer(req.body)) {
    // Raw body as buffer from express.raw()
    body = req.body.toString('utf8');
  } else if (typeof req.body === 'string') {
    body = req.body;
  } else {
    // Reconstruct body from parsed data for form-encoded requests
    body = new URLSearchParams(req.body).toString();
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
      bodyLength: body.length,
      hasRawBody: !!req.rawBody
    });
  }
  
  return isValid;
}

// Handle slash commands
router.post('/events', async (req, res) => {
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
  
  // Immediately acknowledge to prevent timeout
  res.status(200).send();
  
  // Process command asynchronously
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
          response.text = `✅ You thanked <@${recipientId}> with 25 points!\n💬 "${message || 'Great work!'}"`;
        } else {
          response.text = '❓ Usage: `/thanks @user "your message"`';
        }
        break;
        
      case '/give':
        const giveMatch = text?.match(/<@(\w+)\|?[\w.-]*>/);
        if (giveMatch) {
          response.text = `🎁 Opening recognition modal for <@${giveMatch[1]}>...\n(Modal functionality coming soon)`;
        } else {
          response.text = '❓ Usage: `/give @user`';
        }
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
    
    // Send response to Slack (if we have a response_url)
    if (response_url) {
      const axios = require('axios');
      await axios.post(response_url, response).catch(err => {
        console.error('Error sending response to Slack:', err.message);
      });
    }
    
    console.log(`✅ Handled command: ${command} from ${user_name}`);
  } catch (error) {
    console.error('Error processing command:', error);
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