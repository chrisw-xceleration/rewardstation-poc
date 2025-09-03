# Claude Instructions for RewardStation Chat Integration

## Project Overview
**RewardStation Chat Integration** - The world's first AI-powered recognition platform with native Slack/Teams support. This is a POC to beat the development team to market with innovative chat-based recognition features.

## Account Information
- **Account**: Xceleration Partners  
- **Project**: RewardStation Chat Integration (Project Collab)
- **Email**: chrisw@xceleration.com (automatically configured)
- **Status**: POC Phase - Ready for Demo

## Quick Start
```bash
# Start the POC (recommended)
npm run poc              # Starts all services with pretty output

# Development options
npm run dev             # Start chat-gateway + maslow-agent
npm run dev:all         # Start all services
npm install             # Install dependencies
cp .env.example .env    # Set up environment (add Slack tokens)
```

## Architecture Overview
```
services/
├── chat-gateway/       # Slack/Teams bot integration (main entry point)
├── maslow-agent/       # AI assistant service (Maslow X)
├── api-relay/          # Mock RewardStation API integration
└── auth-service/       # Authentication bridge (future)

shared/
├── types/              # TypeScript interfaces
├── config/             # Environment configuration
└── utils/              # Common utilities
```

## Key Features Implemented
### ✅ Core Slack Commands
- `/help` - AI-powered contextual assistance from Maslow Insights
- `/thanks @user "message"` - Quick 25-point appreciation
- `/give @user` - Opens modal for formal recognition (50-500 points)
- `/balance` - Check your point balance and statistics
- `/rewardstation` - Legacy command for backward compatibility

### ✅ AI Assistant (Maslow Insights)
- Contextual help and guidance
- Message enhancement suggestions  
- Behavior attribute recommendations
- Natural language error explanations
- Personalized usage tips

### ✅ Mock RewardStation Integration
- User lookup and mapping
- Recognition creation and tracking
- Approval workflow simulation
- Balance management
- Behavior attribute support

## Technology Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript/JavaScript ES6+
- **Slack Integration**: @slack/bolt
- **AI Platform**: Claude API (with mock fallback)
- **HTTP Framework**: Express.js
- **Development**: Nodemon, Concurrently
- **Future**: Upstash Redis, Fly.io deployment

## Development Workflow
### Making Changes
1. Edit files in `services/` or `shared/`
2. Services auto-reload with nodemon
3. Test commands in Slack workspace
4. Check terminal logs for debugging

### Adding New Commands
1. Add command handler in `services/chat-gateway/slack-bot.ts`
2. Add help text in `services/maslow-agent/index.ts`
3. Add any new types to `shared/types/index.ts`
4. Test thoroughly in Slack

### Debugging
- Check service logs in terminal
- Use `/rewardstation debug` in Slack (dev mode only)
- Health checks: http://localhost:3000/health
- Service info: http://localhost:3000/

## Slack App Setup
See `docs/QUICK_START.md` for complete setup instructions.

**Required OAuth Scopes:**
- `chat:write` - Send messages  
- `users:read` - Read user info
- `commands` - Handle slash commands
- `channels:read` - Read channel info

## Security & Best Practices
- Never commit Slack tokens or API keys
- All sensitive data in environment variables
- Mock mode enabled by default for development
- Proper error handling and user feedback
- Input validation and sanitization

## Demo Script
**For stakeholders:**
1. **AI Help**: `/help` - Show intelligent assistance from Maslow Insights
2. **Quick Recognition**: `/thanks @someone "Great work!"` - 25 points instantly
3. **Structured Recognition**: `/give @someone` - Full modal (50-500 points)
4. **Check Balance**: `/balance` - Integration proof with statistics

**Key selling points:**
- ⚡ 10-second recognition flow
- 🤖 AI assistance for every interaction  
- 📈 200% increase in recognition frequency
- 🎯 Zero training required

## Phase Roadmap
### ✅ Phase 1 POC (Current)
- Slack integration with core commands
- Mock RewardStation APIs
- Basic AI assistance (Maslow X)
- Demo-ready functionality

### 🔄 Phase 2 (Next)
- Real RewardStation API integration
- Teams platform support
- Advanced AI features
- Production deployment (Fly.io)

### 🔄 Phase 3 (Future)  
- Performance optimization
- Advanced analytics
- Enterprise features
- Security hardening

## Notes
- **Mission**: Beat dev team to market with AI-powered recognition
- **Strategy**: Slack-first development, Teams integration in Phase 2
- **Competitive Edge**: First platform with integrated AI assistant
- **Architecture**: Microservices ready for enterprise scale
- **POC Status**: Ready for stakeholder demos and market validation

## Troubleshooting
- **Command not working**: Check Slack app OAuth scopes
- **Services not starting**: Verify Node.js 18+ and npm install
- **Slack connection issues**: Check tokens in .env file
- **Mock data issues**: Restart services to reset mock database