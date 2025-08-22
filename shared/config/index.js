const dotenv = require('dotenv');

dotenv.config();

const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3000'),
  environment: process.env.NODE_ENV || 'development',
  
  // Slack configuration
  slack: {
    client_id: process.env.SLACK_CLIENT_ID || 'mock_client_id',
    client_secret: process.env.SLACK_CLIENT_SECRET || 'mock_client_secret',
    signing_secret: process.env.SLACK_SIGNING_SECRET || 'mock_signing_secret',
    bot_token: process.env.SLACK_BOT_TOKEN || 'xoxb-mock-bot-token',
  },
  
  // Teams configuration (for future use)
  teams: {
    app_id: process.env.TEAMS_APP_ID || 'mock_app_id',
    app_password: process.env.TEAMS_APP_PASSWORD || 'mock_app_password',
  },
  
  // RewardStation API (mock endpoints for now)
  rewardstation: {
    api_base: process.env.REWARDSTATION_API_BASE || 'https://mock-api.rewardstation.com',
    client_id: process.env.REWARDSTATION_CLIENT_ID || 'mock_rewardstation_client',
    client_secret: process.env.REWARDSTATION_CLIENT_SECRET || 'mock_rewardstation_secret',
  },
  
  // AI/Claude configuration  
  claude: {
    api_key: process.env.CLAUDE_API_KEY || '', // Will need real key for production
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
  },
  
  // Redis/Upstash (for caching and rate limiting)
  redis: {
    url: process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379',
  },
  
  // Security
  jwt_secret: process.env.JWT_SECRET || 'mock_jwt_secret_for_development',
  encryption_key: process.env.ENCRYPTION_KEY || 'mock_encryption_key_32_chars_long',
  
  // Service URLs (for microservice communication)
  services: {
    chat_gateway: process.env.CHAT_GATEWAY_URL || 'http://localhost:3000',
    maslow_agent: process.env.MASLOW_AGENT_URL || 'http://localhost:3001',
    api_relay: process.env.API_RELAY_URL || 'http://localhost:3002',
    auth_service: process.env.AUTH_SERVICE_URL || 'http://localhost:3003',
    workflow_service: process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3004',
  },

  // LittleHorse workflow orchestration
  littlehorse: {
    enabled: false, // Temporarily disabled due to deployment issues
    apiHost: process.env.LITTLEHORSE_API_HOST || 'localhost',
    apiPort: parseInt(process.env.LITTLEHORSE_API_PORT || '2023'),
    clientId: process.env.LITTLEHORSE_CLIENT_ID || 'rewardstation-client',
    clientSecret: process.env.LITTLEHORSE_CLIENT_SECRET || 'rewardstation-secret',
  },
  
  // Development flags
  is_development: process.env.NODE_ENV !== 'production',
  enable_mocks: process.env.ENABLE_MOCKS !== 'false', // Default to true for POC
  log_level: process.env.LOG_LEVEL || 'info',
};

module.exports = config;