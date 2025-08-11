// Maslow X - AI Assistant Service
// Provides intelligent help and message enhancement using Claude

import express from 'express';
import { MaslowXRequest, MaslowXResponse, ChatCommand } from '../../shared/types/index.js';
import config from '../../shared/config/index.js';

const app = express();
app.use(express.json());

// Mock Claude API for POC (replace with real Claude API when key is available)
class MockClaudeAPI {
  async generateHelp(request: MaslowXRequest): Promise<MaslowXResponse> {
    console.log('🤖 Maslow X Help Request:', request.type);
    
    const responses = {
      basic_help: {
        response_text: `🎉 **Welcome to RewardStation!**

I'm Maslow X, your AI assistant for recognition and rewards.

**Quick Commands:**
• \`/rewardstation thanks @user "message"\` - Send quick thanks
• \`/rewardstation give @user\` - Give points and formal recognition  
• \`/rewardstation balance\` - Check your points balance
• \`/rewardstation help\` - Get this help message

**Pro Tips:**
✨ I can help enhance your recognition messages
🎯 I'll suggest appropriate behavior attributes
💡 Ask me anything about giving great recognition!

*What would you like to do first?*`,
        suggested_actions: [
          { text: "Send Thanks", command: "/rewardstation thanks @teammate" },
          { text: "Give Points", command: "/rewardstation give @teammate" },
          { text: "Check Balance", command: "/rewardstation balance" }
        ]
      },
      
      thanks_help: {
        response_text: `💝 **Thanks Command Help**

Use: \`/rewardstation thanks @user "your message"\`

**Examples:**
• \`/rewardstation thanks @sarah "Great job on the presentation!"\`
• \`/rewardstation thanks @team "Thanks for staying late to finish the project"\`

**Tips:**
• Be specific about what you're thanking them for
• Thanks are instant - no approval needed
• Everyone in the channel will see the celebration
• The recipient gets a direct notification

Ready to spread some positivity?`,
        suggested_actions: [
          { text: "Try Thanks Command", command: "/rewardstation thanks @" }
        ]
      },
      
      give_help: {
        response_text: `🌟 **Points Recognition Help**

Use: \`/rewardstation give @user\` (opens interactive form)

**What you can do:**
• Award 50-500 points based on impact
• Select behavior attributes that match company values
• I'll help enhance your recognition message
• Recognition may require approval based on amount

**Recognition Guidelines:**
• **50-100 points**: Daily helps and good work
• **150-250 points**: Above and beyond efforts  
• **300-500 points**: Exceptional achievements

Want to give meaningful recognition?`,
        suggested_actions: [
          { text: "Start Recognition", command: "/rewardstation give @" }
        ]
      }
    };

    // Determine response based on context
    if (request.context.command?.subcommand === 'thanks') {
      return responses.thanks_help;
    } else if (request.context.command?.subcommand === 'give') {
      return responses.give_help;
    }

    return responses.basic_help;
  }

  async enhanceMessage(message: string, context: any): Promise<MaslowXResponse> {
    console.log('✨ Maslow X Message Enhancement');
    
    // Simple enhancement logic for POC
    const enhancements = {
      "great job": "fantastic work and dedication",
      "thanks": "deeply appreciate",
      "good work": "excellent execution and attention to detail",
      "helped": "went above and beyond to support",
      "finished": "successfully completed with quality results"
    };

    let enhanced = message;
    Object.entries(enhancements).forEach(([original, enhanced_version]) => {
      enhanced = enhanced.replace(new RegExp(original, 'gi'), enhanced_version);
    });

    // Add some personality if message is too short
    if (enhanced.length < 30) {
      enhanced = `${enhanced} - your contribution makes a real difference to our team's success!`;
    }

    return {
      response_text: "I've enhanced your message to be more impactful:",
      enhanced_content: enhanced,
      confidence_score: 0.85
    };
  }

  async suggestBehaviors(message: string): Promise<string[]> {
    console.log('🎯 Maslow X Behavior Suggestion');
    
    // Simple keyword matching for POC
    const behaviorMap = {
      'innovation': ['innovative', 'creative', 'new idea', 'solution'],
      'teamwork': ['team', 'collaborate', 'support', 'help'],
      'customer focus': ['customer', 'client', 'user', 'service'],
      'leadership': ['lead', 'mentor', 'guide', 'direction'],
      'quality excellence': ['quality', 'excellent', 'perfect', 'detail'],
      'accountability': ['responsible', 'ownership', 'deliver', 'commit']
    };

    const suggested = [];
    const lowerMessage = message.toLowerCase();

    for (const [behavior, keywords] of Object.entries(behaviorMap)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        suggested.push(behavior);
      }
    }

    // Default suggestions if nothing matches
    if (suggested.length === 0) {
      suggested.push('teamwork', 'quality excellence');
    }

    return suggested.slice(0, 3); // Limit to 3 suggestions
  }
}

const mockClaude = new MockClaudeAPI();

// Maslow X help endpoint
app.post('/help', async (req, res) => {
  try {
    const request: MaslowXRequest = req.body;
    const response = await mockClaude.generateHelp(request);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Maslow X help error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI assistant temporarily unavailable' 
    });
  }
});

// Message enhancement endpoint
app.post('/enhance-message', async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await mockClaude.enhanceMessage(message, context);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Message enhancement error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Message enhancement unavailable' 
    });
  }
});

// Behavior suggestion endpoint  
app.post('/suggest-behavior', async (req, res) => {
  try {
    const { message } = req.body;
    const behaviors = await mockClaude.suggestBehaviors(message);
    res.json({ success: true, data: behaviors });
  } catch (error) {
    console.error('Behavior suggestion error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Behavior suggestions unavailable' 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'maslow-agent',
    timestamp: new Date().toISOString(),
    mock: config.enable_mocks
  });
});

const PORT = parseInt(process.env.MASLOW_PORT || '3001');
app.listen(PORT, () => {
  console.log(`🤖 Maslow X Agent running on port ${PORT}`);
  console.log(`🧠 AI Enhancement: ${config.claude.api_key ? 'Claude API' : 'Mock Mode'}`);
});

export default app;