// Chat Gateway Service - Main Entry Point
// Handles both Slack and Teams integrations

const express = require('express');
const { createServer } = require('http');
const rateLimit = require('express-rate-limit');
const config = require('../../shared/config/index.js');

const app = express();
const server = createServer(app);

// Trust proxy for Fly.io
app.set('trust proxy', true);

// Rate limiting with proper configuration for trusted proxy
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    response_type: 'ephemeral',
    text: '⚠️ Too many commands. Please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting errors in production for now
  skip: (req) => process.env.NODE_ENV === 'production',
  // Alternative: use a custom key generator that handles proxy
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  }
});

app.use('/slack', limiter);
app.use('/teams', limiter);

// Regular middleware for most routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for Teams app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'Chat Gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-poc'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'RewardStation Chat Gateway',
    version: '1.0.0-poc',
    description: 'AI-powered recognition platform integration for Slack and Teams',
    endpoints: {
      health: '/health',
      slack_events: '/slack/events',
      slack_oauth: '/slack/oauth',
      teams_tab: '/teams'
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

// Load platform integrations
// Use simple Slack handler for now (SDK having issues)
const slackRouter = require('./slack-simple');
app.use('/slack', slackRouter);
console.log('✅ Slack simple handler loaded');

// Original Slack Bot integration (disabled due to initialization issues)
// const { slackApp } = require('./slack-bot');
// if (slackApp && slackApp.receiver && slackApp.receiver.router) {
//   app.use('/slack/events', slackApp.receiver.router);
//   console.log('✅ Slack integration loaded');
// } else {
//   console.log('⚠️ Slack integration not available - check credentials');
// }

// Teams interface from separate module
require('./teams-clean')(app);

const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Chat Gateway running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌟 Teams interface: http://localhost:${PORT}/teams`);
});

module.exports = { app, server };