// Maslow Insights - AI Assistant Service
// Provides intelligent help and message enhancement using Claude

const express = require('express');
const config = require('../../shared/config/index.js');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());

// Initialize Claude API client
const anthropic = config.claude.api_key ? new Anthropic({
  apiKey: config.claude.api_key,
}) : null;

// Maslow Insights - AI Recognition Expert
class MaslowInsightsAI {
  async generateHelp(request) {
    console.log('🤖 Maslow Insights Help Request:', request.type);
    
    const responses = {
      basic_help: {
        response_text: `🎉 **Welcome to RewardStation!**

I'm Maslow Insights, your AI assistant for recognition and rewards.

**Quick Commands:**
• \`/thanks @user "message"\` - Quick 25-point appreciation
• \`/give @user\` - Opens modal for formal recognition (50-500 points)  
• \`/balance\` - Check your point balance and statistics
• \`/help\` - AI-powered contextual assistance

**Pro Tips:**
✨ I can help enhance your recognition messages
🎯 I'll suggest appropriate behavior attributes
💡 Ask me anything about giving great recognition!

*What would you like to do first?*`,
        suggested_actions: [
          { text: "Send Thanks", command: "/thanks @teammate" },
          { text: "Give Points", command: "/give @teammate" },
          { text: "Check Balance", command: "/balance" }
        ]
      },
      
      thanks_help: {
        response_text: `💝 **Thanks Command Help**

Use: \`/thanks @user "your message"\`

**Examples:**
• \`/thanks @sarah "Great job on the presentation!"\`
• \`/thanks @team "Thanks for staying late to finish the project"\`

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

  async enhanceMessage(message, context) {
    console.log('✨ Maslow X Message Enhancement');
    
    // If Claude API is not available, use fallback enhancement
    if (!anthropic) {
      return this.fallbackEnhancement(message, context);
    }
    
    try {
      const prompt = `You are Claude X, a 25-year veteran B2B employee rewards and recognition expert. Your role is to help enhance recognition messages to make them more meaningful and impactful.

CONTEXT:
- Recipient: ${context.recipient_name || 'team member'}
- Points being awarded: ${context.points || 'N/A'}
- Behavior attributes: ${context.behaviors ? context.behaviors.join(', ') : 'N/A'}
- Original message: "${message}"

TASK:
Please enhance this recognition message following these guidelines:
1. Keep the core sentiment and authenticity
2. Make it more specific and impactful
3. Focus on the behavior and its positive impact
4. Use professional but warm language
5. Keep it concise (2-3 sentences max)
6. Maintain the original person's voice/style

Return ONLY the enhanced message, nothing else. Do not add quotes, explanations, or meta-commentary.`;

      const response = await anthropic.messages.create({
        model: config.claude.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const enhanced = response.content[0].text.trim();
      
      return {
        response_text: "I've enhanced your message to be more impactful:",
        enhanced_content: enhanced,
        confidence_score: 0.95,
        ai_powered: true
      };
      
    } catch (error) {
      console.error('Claude API enhancement error:', error);
      return this.fallbackEnhancement(message, context);
    }
  }
  
  fallbackEnhancement(message, context) {
    // Fallback enhancement logic when Claude API is unavailable
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
      confidence_score: 0.85,
      ai_powered: false
    };
  }
  
  async enhanceMessageOptions(message, context) {
    console.log('✨ Maslow X Message Enhancement Options');
    
    // If Claude API is not available, use fallback enhancement
    if (!anthropic) {
      return this.fallbackEnhancementOptions(message, context);
    }
    
    try {
      const prompt = `You are Claude X, a 25-year veteran B2B employee rewards and recognition expert. Your role is to help enhance recognition messages to make them more meaningful and impactful.

CONTEXT:
- Recipient: ${context.recipient_name || 'team member'}
- Points being awarded: ${context.points || 'N/A'}
- Behavior attributes: ${context.behaviors ? context.behaviors.join(', ') : 'N/A'}
- Original message: "${message}"

TASK:
Please provide THREE different enhanced versions of this recognition message in these styles:

1. PROFESSIONAL & IMPACT-FOCUSED: Business-focused, emphasizes results and impact on team/organization
2. WARM & PERSONAL: Friendly and personable while maintaining professionalism
3. CONCISE & DIRECT: Brief but powerful, gets straight to the point

Guidelines for all versions:
- Keep the core sentiment and authenticity
- Make it more specific and impactful
- Use professional but appropriate language for each style
- Keep each version to 2-3 sentences max
- Maintain the original person's voice/style

Return as JSON with keys: "professional", "personal", "concise"`;

      const response = await anthropic.messages.create({
        model: config.claude.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const enhancementText = response.content[0].text.trim();
      
      // Try to parse as JSON, if fails use fallback
      try {
        const options = JSON.parse(enhancementText);
        return {
          professional: options.professional,
          personal: options.personal,
          concise: options.concise,
          ai_powered: true
        };
      } catch (parseError) {
        console.log('Claude response not in JSON format, using fallback');
        return this.fallbackEnhancementOptions(message, context);
      }
      
    } catch (error) {
      console.error('Claude API enhancement options error:', error);
      return this.fallbackEnhancementOptions(message, context);
    }
  }
  
  fallbackEnhancementOptions(message, context) {
    // Fallback enhancement options when Claude API is unavailable
    const baseEnhancement = this.fallbackEnhancement(message, context).enhanced_content;
    
    return {
      professional: baseEnhancement.replace(/your contribution/g, 'your professional contribution'),
      personal: baseEnhancement.replace(/makes a real difference/g, 'means so much to all of us'),
      concise: baseEnhancement.split('.')[0] + '. Excellent work!',
      ai_powered: false
    };
  }

  async suggestBehaviors(message) {
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

const maslowInsights = new MaslowInsightsAI();

// Maslow X help endpoint
app.post('/help', async (req, res) => {
  try {
    const request = req.body;
    const response = await maslowInsights.generateHelp(request);
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
    const response = await maslowInsights.enhanceMessage(message, context);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Message enhancement error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Message enhancement unavailable' 
    });
  }
});

// Message enhancement options endpoint (for interactive choice)
app.post('/enhance-message-options', async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await maslowInsights.enhanceMessageOptions(message, context);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Message enhancement options error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Enhancement options unavailable' 
    });
  }
});

// Behavior suggestion endpoint  
app.post('/suggest-behavior', async (req, res) => {
  try {
    const { message } = req.body;
    const behaviors = await maslowInsights.suggestBehaviors(message);
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

module.exports = app;