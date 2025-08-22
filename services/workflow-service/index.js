// RewardStation Workflow Service - LittleHorse Integration
// Orchestrates recognition approval workflows, notifications, and integrations

const config = require('../../shared/config/index.js');
const { mockRewardStationAPI } = require('../api-relay/mock-rewardstation.js');

// Try to import LittleHorse client, gracefully handle if not available
let LHClient = null;
try {
  LHClient = require('littlehorse-client').LHClient || require('littlehorse-client');
} catch (error) {
  console.log('⚠️ LittleHorse client not available:', error.message);
}

class RewardStationWorkflowService {
  constructor() {
    this.client = null;
    
    // Initialize LittleHorse client if enabled and available
    if (config.littlehorse.enabled && LHClient) {
      try {
        this.client = new LHClient({
          host: config.littlehorse.apiHost,
          port: config.littlehorse.apiPort,
          clientId: config.littlehorse.clientId,
          clientSecret: config.littlehorse.clientSecret,
        });
        console.log('🐎 LittleHorse client initialized');
      } catch (error) {
        console.log('⚠️ LittleHorse client initialization failed:', error.message);
      }
    } else {
      console.log('🎭 LittleHorse disabled or unavailable, using mock workflows');
    }
  }

  async initializeWorkflows() {
    if (!config.littlehorse.enabled || !this.client) {
      console.log('📋 LittleHorse disabled or unavailable, using mock workflows');
      return;
    }

    try {
      await this.createRecognitionApprovalWorkflow();
      await this.createNotificationWorkflow();
      await this.createEscalationWorkflow();
      console.log('🐎 LittleHorse recognition workflows initialized');
    } catch (error) {
      console.error('❌ Failed to initialize workflows:', error);
      console.log('🎭 Falling back to mock workflows');
      // Don't throw error - fall back to mock mode
    }
  }

  async createRecognitionApprovalWorkflow() {
    const workflowSpec = this.client.newWorkflowSpec('recognition-approval-workflow');
    
    // Variables for recognition workflow
    workflowSpec
      .addVariable('recognitionData', 'JSON_OBJ')
      .addVariable('enhancedMessage', 'STR')
      .addVariable('approvalRequired', 'BOOL')
      .addVariable('approvalDecision', 'STR')
      .addVariable('finalRecognition', 'JSON_OBJ');

    // Step 1: AI Enhancement
    workflowSpec
      .addTask('enhance-message', 'ai-message-enhancement')
      .withInput('originalMessage', workflowSpec.getVariable('recognitionData'))
      .withOutput('enhancedMessage');

    // Step 2: Check if approval needed (high points/manager override)
    workflowSpec
      .addTask('check-approval-required', 'approval-requirement-check')
      .withInput('recognitionData', workflowSpec.getVariable('recognitionData'))
      .withOutput('approvalRequired');

    // Conditional: If approval required
    const approvalCondition = workflowSpec.condition(
      workflowSpec.getVariable('approvalRequired'), 
      'EQUALS', 
      workflowSpec.literalBool(true)
    );

    workflowSpec.doIf(approvalCondition, (ifBlock) => {
      // Send approval request to manager
      ifBlock
        .addTask('send-approval-request', 'manager-approval-request')
        .withInput('recognitionData', workflowSpec.getVariable('recognitionData'))
        .withInput('enhancedMessage', workflowSpec.getVariable('enhancedMessage'));

      // Wait for approval decision
      ifBlock
        .addTask('wait-for-approval', 'approval-decision-handler')
        .withTimeout(86400000) // 24 hours timeout
        .withOutput('approvalDecision');
    });

    // Step 3: Create final recognition
    workflowSpec
      .addTask('create-recognition', 'create-final-recognition')
      .withInput('recognitionData', workflowSpec.getVariable('recognitionData'))
      .withInput('enhancedMessage', workflowSpec.getVariable('enhancedMessage'))
      .withInput('approvalDecision', workflowSpec.getVariable('approvalDecision'))
      .withOutput('finalRecognition');

    // Step 4: Send notifications
    workflowSpec
      .addTask('send-notifications', 'recognition-notifications')
      .withInput('finalRecognition', workflowSpec.getVariable('finalRecognition'));

    await this.client.putWorkflowSpec(workflowSpec);
    console.log('✅ Recognition approval workflow created');
  }

  async createNotificationWorkflow() {
    const workflowSpec = this.client.newWorkflowSpec('recognition-notification-workflow');
    
    workflowSpec
      .addVariable('recognitionData', 'JSON_OBJ')
      .addVariable('channels', 'JSON_ARR')
      .addVariable('notificationResults', 'JSON_ARR');

    // Multi-channel notification dispatch
    workflowSpec
      .addTask('dispatch-slack-notification', 'send-slack-notification')
      .withInput('recognitionData', workflowSpec.getVariable('recognitionData'));

    workflowSpec
      .addTask('dispatch-email-notification', 'send-email-notification')
      .withInput('recognitionData', workflowSpec.getVariable('recognitionData'));

    workflowSpec
      .addTask('dispatch-teams-notification', 'send-teams-notification')
      .withInput('recognitionData', workflowSpec.getVariable('recognitionData'));

    // Log notification completion
    workflowSpec
      .addTask('log-notification-completion', 'log-notification-results')
      .withInput('recognitionData', workflowSpec.getVariable('recognitionData'));

    await this.client.putWorkflowSpec(workflowSpec);
    console.log('✅ Notification workflow created');
  }

  async createEscalationWorkflow() {
    const workflowSpec = this.client.newWorkflowSpec('recognition-escalation-workflow');
    
    workflowSpec
      .addVariable('approvalRequest', 'JSON_OBJ')
      .addVariable('escalationLevel', 'INT')
      .addVariable('escalationComplete', 'BOOL');

    // Wait for initial approval timeout
    workflowSpec
      .addTask('wait-for-timeout', 'approval-timeout-handler')
      .withTimeout(86400000); // 24 hours

    // Escalate to next level manager
    workflowSpec
      .addTask('escalate-approval', 'manager-escalation')
      .withInput('approvalRequest', workflowSpec.getVariable('approvalRequest'))
      .withInput('escalationLevel', workflowSpec.getVariable('escalationLevel'))
      .withOutput('escalationComplete');

    // Notify original requester of escalation
    workflowSpec
      .addTask('notify-escalation', 'escalation-notification')
      .withInput('approvalRequest', workflowSpec.getVariable('approvalRequest'))
      .withInput('escalationLevel', workflowSpec.getVariable('escalationLevel'));

    await this.client.putWorkflowSpec(workflowSpec);
    console.log('✅ Escalation workflow created');
  }

  async startRecognitionWorkflow(recognitionData) {
    if (!config.littlehorse.enabled || !this.client) {
      // Mock workflow execution
      console.log('🎭 Mock workflow: Processing recognition');
      return this.mockRecognitionWorkflow(recognitionData);
    }

    try {
      const workflowRun = await this.client.runWorkflow('recognition-approval-workflow', {
        recognitionData: recognitionData,
      });
      
      console.log('🐎 Recognition workflow started:', workflowRun.id);
      return {
        workflowId: workflowRun.id,
        status: 'started',
        estimated_completion: new Date(Date.now() + 300000) // 5 minutes
      };
    } catch (error) {
      console.error('❌ Failed to start recognition workflow:', error);
      console.log('🎭 Falling back to mock workflow');
      return this.mockRecognitionWorkflow(recognitionData);
    }
  }

  async startNotificationWorkflow(recognitionData) {
    if (!config.littlehorse.enabled || !this.client) {
      console.log('🎭 Mock notification workflow');
      return { workflowId: `mock-notif-${Date.now()}`, status: 'completed' };
    }

    try {
      const workflowRun = await this.client.runWorkflow('recognition-notification-workflow', {
        recognitionData: recognitionData,
      });
      
      console.log('📢 Notification workflow started:', workflowRun.id);
      return { workflowId: workflowRun.id, status: 'started' };
    } catch (error) {
      console.error('❌ Failed to start notification workflow:', error);
      return { workflowId: `fallback-notif-${Date.now()}`, status: 'completed' };
    }
  }

  async getWorkflowStatus(workflowId) {
    if (!config.littlehorse.enabled || !this.client) {
      return {
        id: workflowId,
        status: 'completed',
        progress: 100
      };
    }

    try {
      const workflowRun = await this.client.getWorkflowRun(workflowId);
      return {
        id: workflowRun.id,
        status: workflowRun.status,
        startTime: workflowRun.startTime,
        endTime: workflowRun.endTime,
        progress: this.calculateProgress(workflowRun)
      };
    } catch (error) {
      console.error('❌ Failed to get workflow status:', error);
      return {
        id: workflowId,
        status: 'unknown',
        progress: 0,
        error: error.message
      };
    }
  }

  calculateProgress(workflowRun) {
    // Simple progress calculation based on completed tasks
    const totalTasks = workflowRun.nodeRuns?.length || 1;
    const completedTasks = workflowRun.nodeRuns?.filter(node => 
      node.status === 'COMPLETED'
    ).length || 0;
    
    return Math.round((completedTasks / totalTasks) * 100);
  }

  // Mock workflow for development/testing
  async mockRecognitionWorkflow(recognitionData) {
    console.log('🎭 Mock Recognition Workflow Processing:');
    console.log(`   👤 Recipient: ${recognitionData.recipient_name}`);
    console.log(`   💰 Points: ${recognitionData.points}`);
    console.log(`   📝 Message: ${recognitionData.message}`);
    
    // Simulate approval requirement check
    const needsApproval = recognitionData.points >= 250;
    console.log(`   ${needsApproval ? '⏳ Approval required' : '✅ Auto-approved'}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create recognition via mock API
    const recognitionResult = await mockRewardStationAPI.createRecognition({
      nominator_id: recognitionData.nominator_id,
      recipient_id: recognitionData.recipient,
      points: recognitionData.points,
      message: recognitionData.message,
      behavior_attributes: recognitionData.behaviors,
      recognition_type: 'points',
      source: 'littlehorse_workflow',
      workflow_id: `mock-wf-${Date.now()}`
    });
    
    console.log('✅ Mock workflow completed');
    
    return {
      workflowId: `mock-workflow-${Date.now()}`,
      status: 'completed',
      recognitionId: recognitionResult.data.recognition_id,
      approvalRequired: needsApproval,
      estimatedCompletion: needsApproval ? 'Pending manager approval' : 'Immediate'
    };
  }

  // Health check for LittleHorse connection
  async healthCheck() {
    if (!config.littlehorse.enabled || !this.client) {
      return { status: 'disabled', message: 'LittleHorse workflows disabled or unavailable' };
    }

    try {
      // Simple health check - just verify client exists
      // Note: Actual LittleHorse connection would require server to be running
      return { status: 'mock', message: 'LittleHorse client ready (mock mode active)' };
    } catch (error) {
      console.error('🐎 LittleHorse health check failed:', error);
      return { status: 'unhealthy', message: error.message };
    }
  }
}

module.exports = new RewardStationWorkflowService();