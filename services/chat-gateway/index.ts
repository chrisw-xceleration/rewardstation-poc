// Chat Gateway Service - Main Entry Point
// Handles both Slack and Teams integrations (starting with Slack for POC)

import express from 'express';
import { createServer } from 'http';
import config from '../../shared/config/index.js';
import { slackApp } from './slack-bot.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chat-gateway',
    timestamp: new Date().toISOString(),
    platforms: {
      slack: 'active',
      teams: 'planned'
    },
    mock_mode: config.enable_mocks
  });
});

// Root endpoint with service info
app.get('/', (req, res) => {
  res.json({
    service: 'RewardStation Chat Gateway',
    version: '1.0.0-poc',
    description: 'AI-powered recognition platform integration for Slack and Teams',
    endpoints: {
      health: '/health',
      slack_events: '/slack/events',
      slack_oauth: '/slack/oauth',
      teams_messages: '/teams/messages (planned)'
    },
    features: [
      'Quick thanks recognition',
      'Structured points-based recognition', 
      'AI-powered assistance (Maslow X)',
      'Real-time notifications',
      'Mock RewardStation API integration'
    ],
    status: 'POC - Ready for testing'
  });
});

// Slack integration endpoints
app.use('/slack/events', slackApp.receiver.router);

// OAuth callback for Slack (simplified for POC)
app.get('/slack/oauth', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // In a real implementation, we'd exchange the code for tokens
  // For POC, we'll just simulate success
  console.log('🔐 Slack OAuth callback received', { code, state });
  
  res.json({
    success: true,
    message: 'Slack workspace connected successfully!',
    mock: true,
    next_steps: [
      'Try /rewardstation help in your Slack workspace',
      'Use /rewardstation thanks @someone "message" to send thanks',
      'Use /rewardstation give @someone to open the recognition modal'
    ]
  });
});

// Teams integration placeholder
app.post('/teams/messages', (req, res) => {
  res.json({
    success: false,
    message: 'Teams integration coming in Phase 2',
    mock: true
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Gateway error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong. Please try again.'
  });
});

// Start server
const PORT = config.port;

const startServer = async () => {
  try {
    // Start Slack app
    await slackApp.start();
    console.log('⚡ Slack app started successfully');

    // Start Express server
    server.listen(PORT, () => {
      console.log(`🚀 Chat Gateway running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🎯 Environment: ${config.environment}`);
      console.log(`🤖 Mock mode: ${config.enable_mocks}`);
      console.log('');
      console.log('🎉 Ready for RewardStation POC testing!');
      console.log('');
      console.log('📋 Quick Test Commands:');
      console.log('   /rewardstation help');
      console.log('   /rewardstation thanks @user "Great job!"');
      console.log('   /rewardstation give @user');
      console.log('   /rewardstation balance');
    });

  } catch (error) {
    console.error('❌ Failed to start chat gateway:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down chat gateway...');
  server.close(() => {
    console.log('✅ Chat gateway stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Chat gateway stopped');
    process.exit(0);
  });
});

// Start the server
startServer();

export default app;