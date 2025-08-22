# RewardStation Admin Guide

**Administrative Setup and Management for IT Teams**

## 🎯 Overview

This guide covers administrative setup, management, and troubleshooting for RewardStation's AI-powered recognition platform across Slack and Microsoft Teams.

---

## 🚀 Initial Setup

### Prerequisites
- **Slack**: Workspace admin privileges
- **Teams**: Teams administrator access + Azure portal access
- **Production**: Access to deployment environment (Fly.io)
- **Time**: 30 minutes for complete setup

### Setup Process
1. **Choose Platform**: Slack (easier) or Teams (requires Azure setup)
2. **App Registration**: Follow platform-specific guides
3. **Environment Configuration**: Set API keys and credentials
4. **Testing**: Verify functionality before user rollout
5. **User Onboarding**: Deploy to organization

---

## 📋 Slack Administration

### App Installation
1. **Slack App Setup**
   ```bash
   # Use provided setup script
   ./scripts/slack-setup.sh
   
   # Or follow manual steps in docs/SLACK_CLI_SETUP.md
   ```

2. **Required OAuth Scopes**
   - `chat:write` - Send recognition messages
   - `users:read` - User lookup and mentions
   - `commands` - Handle slash commands
   - `channels:read` - Channel context

3. **Installation Options**
   - **Organization-wide**: Available to all users automatically
   - **Specific channels**: Limit to pilot teams initially
   - **User-requested**: Users install individually

### Configuration Management
```bash
# Environment variables (set in deployment platform)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
CLAUDE_API_KEY=your-claude-key (for AI features)

# Optional features
ENABLE_MOCKS=true          # Use mock APIs during testing
DEBUG_MODE=false           # Disable for production
```

---

## 🏢 Microsoft Teams Administration

### Azure Setup
1. **App Registration**
   - Portal: https://portal.azure.com
   - Create new app registration
   - Configure OAuth redirect URLs
   - Generate client secret

2. **Bot Framework Setup**
   - Create Azure Bot resource
   - Configure messaging endpoint
   - Enable Teams channel

3. **Teams App Deployment**
   - Upload app package to admin center
   - Configure permissions and availability
   - Approve for organizational use

**Detailed Instructions**: See `teams-app/IT-DEPLOYMENT-INSTRUCTIONS.md`

### Teams Configuration
```bash
# Additional Teams environment variables
TEAMS_APP_ID=your-azure-app-id
TEAMS_APP_PASSWORD=your-azure-client-secret
```

---

## 🔧 System Configuration

### Production Environment
```bash
# Core settings
NODE_ENV=production
PORT=3000

# Platform integrations
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
TEAMS_APP_ID=...
TEAMS_APP_PASSWORD=...

# AI integration
CLAUDE_API_KEY=sk-ant-...

# Feature flags
ENABLE_MOCKS=false         # Use real APIs in production
ENABLE_AI_FEATURES=true    # AI enhancement and help
ENABLE_ANALYTICS=true      # Usage tracking
```

### Health Monitoring
- **Health Endpoint**: `/health` - System status
- **Platform Status**: `/slack/health` and `/teams/health`
- **Metrics Endpoint**: `/metrics` - Performance data

---

## 👥 User Management

### Onboarding Process
1. **Pilot Rollout**
   - Start with 10-20 early adopters
   - Gather feedback and iterate
   - Monitor usage patterns

2. **Department Rollout**
   - Deploy to departments gradually
   - Provide team training sessions
   - Set usage expectations

3. **Organization-wide**
   - Announce to all users
   - Provide documentation links
   - Monitor adoption metrics

### User Support
- **Documentation**: Share `docs/USER_GUIDE.md` with all users
- **Training**: Brief demo sessions (15 minutes sufficient)
- **Support Channel**: Create dedicated help channel
- **FAQ**: Maintain list of common questions

---

## 📊 Monitoring & Analytics

### Usage Metrics
- **Command Usage**: Track popular commands
- **User Adoption**: Active users over time
- **Recognition Volume**: Total recognitions sent
- **AI Utilization**: Enhancement acceptance rates

### System Health
```bash
# Monitor these endpoints
curl https://your-domain.com/health
curl https://your-domain.com/slack/health
curl https://your-domain.com/teams/health
```

### Performance Monitoring
- **Response Times**: Commands should complete <200ms
- **Error Rates**: Monitor for 5xx errors
- **Uptime**: Target 99.9% availability
- **Memory Usage**: Watch for memory leaks

---

## 🔒 Security Management

### Access Controls
- **Bot Tokens**: Rotate every 6 months
- **API Keys**: Monitor usage and rotate regularly
- **Secrets Management**: Use secure environment variables
- **Audit Logging**: Track administrative actions

### Data Privacy
- **Recognition Data**: Encrypted in transit and at rest
- **User Information**: Minimal data collection
- **Retention Policy**: Configure based on company policy
- **GDPR Compliance**: Built-in privacy controls

### Security Monitoring
```bash
# Regular security checks
- Review API key usage patterns
- Monitor for unusual command patterns
- Check for unauthorized access attempts
- Validate webhook signatures
```

---

## 🛠️ Troubleshooting

### Common Issues

#### Bot Not Responding
**Symptoms**: Commands not working, no responses
**Solutions**:
1. Check bot token validity
2. Verify webhook endpoints are accessible
3. Review application logs for errors
4. Test health endpoints

#### AI Features Not Working
**Symptoms**: No enhancement suggestions, basic responses
**Solutions**:
1. Verify Claude API key is valid
2. Check API usage limits
3. Monitor for rate limiting
4. Review AI service logs

#### User Authentication Issues
**Symptoms**: "User not found" errors
**Solutions**:
1. Verify user directory integration
2. Check OAuth scopes and permissions
3. Test with known active users
4. Review user mapping logic

#### Performance Issues
**Symptoms**: Slow responses, timeouts
**Solutions**:
1. Monitor system resources
2. Check database connections
3. Review API response times
4. Scale infrastructure if needed

### Log Analysis
```bash
# Key log locations
/var/log/rewardstation/app.log         # Application logs
/var/log/rewardstation/error.log       # Error logs
/var/log/rewardstation/access.log      # Request logs

# Important log patterns to monitor
- "Command failed" - Command processing errors
- "Authentication error" - Token or permission issues
- "API timeout" - External service issues
- "Memory warning" - Resource constraints
```

---

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Review usage metrics and error logs
- **Monthly**: Rotate API keys and tokens
- **Quarterly**: Security audit and access review
- **Annually**: Full system security assessment

### Updates and Deployments
1. **Staging Testing**: Always test in non-production first
2. **Gradual Rollout**: Deploy to limited users initially
3. **Monitoring**: Watch metrics during deployment
4. **Rollback Plan**: Keep previous version ready

### Backup and Recovery
- **Configuration Backup**: Regular export of settings
- **User Data**: Follow company backup policies
- **Disaster Recovery**: Document restoration procedures
- **Testing**: Regularly test backup restoration

---

## 📞 Support Escalation

### Internal Support Levels
1. **User Questions**: Direct to AI assistant and user guide
2. **Technical Issues**: IT team troubleshooting
3. **System Problems**: Platform administrator intervention
4. **Critical Issues**: Vendor support contact

### External Support
- **Platform Support**: Slack/Microsoft standard channels
- **AI Services**: Claude API support documentation
- **Infrastructure**: Hosting provider support

---

## 📈 Growth Planning

### Scaling Considerations
- **User Growth**: Plan infrastructure scaling
- **Feature Expansion**: Prepare for additional platforms
- **Integration Needs**: Plan API and system integrations
- **Performance Requirements**: Monitor and optimize

### Future Roadmap
- **Phase 2**: Real API integration, advanced analytics
- **Phase 3**: Mobile support, custom workflows
- **Phase 4**: Enterprise features, compliance tools

---

## 📋 Checklist

### Pre-Launch
- [ ] Platform apps configured and tested
- [ ] Environment variables set correctly
- [ ] Health endpoints responding
- [ ] User documentation distributed
- [ ] Support processes established

### Post-Launch
- [ ] Usage metrics being collected
- [ ] Error monitoring active
- [ ] User feedback channel established
- [ ] Regular maintenance scheduled
- [ ] Incident response plan ready

---

**For technical support or questions about this guide, contact your development team or system administrator.**

*RewardStation Admin Guide v1.0 - Updated August 2025*