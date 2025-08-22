// Mock RewardStation API for POC development
// This simulates the real RewardStation APIs until integration is ready

// Mock RewardStation API for POC development
// This simulates the real RewardStation APIs until integration is ready

class MockRewardStationAPI {
  constructor() {
    this.users = new Map();
    this.recognitions = new Map();
    this.seedMockUsers();
  }

  seedMockUsers() {
    const mockUsers = [
      { id: 'emp_001', email: 'john.doe@xceleration.com', name: 'John Doe', platform: 'slack', platform_user_id: 'U1234567890' },
      { id: 'emp_002', email: 'jane.smith@xceleration.com', name: 'Jane Smith', platform: 'slack', platform_user_id: 'U1234567891' },
      { id: 'emp_003', email: 'mike.wilson@xceleration.com', name: 'Mike Wilson', platform: 'slack', platform_user_id: 'U1234567892' },
      { id: 'emp_004', email: 'sarah.johnson@xceleration.com', name: 'Sarah Johnson', platform: 'slack', platform_user_id: 'U1234567893' },
    ];

    mockUsers.forEach(user => {
      this.users.set(user.email, {
        ...user,
        employee_id: user.id
      });
    });
  }

  // Mock authentication endpoint
  async authenticate(token) {
    console.log('🔐 Mock RewardStation Authentication');
    
    return {
      success: true,
      data: {
        access_token: 'mock_access_token_' + Date.now()
      },
      mock: true
    };
  }

  // Mock user lookup endpoint
  async lookupUser(email) {
    console.log(`👤 Mock User Lookup: ${email}`);
    
    const user = this.users.get(email);
    
    if (!user) {
      return {
        success: false,
        error: `User not found: ${email}`,
        mock: true
      };
    }

    return {
      success: true,
      data: user,
      mock: true
    };
  }

  // Mock user lookup by Slack ID
  async lookupUserBySlackId(slackId) {
    console.log(`👤 Mock User Lookup by Slack ID: ${slackId}`);
    
    for (const user of this.users.values()) {
      if (user.platform_user_id === slackId) {
        return {
          success: true,
          data: user,
          mock: true
        };
      }
    }

    // Create a mock user if not found (for demo purposes)
    const mockUser = {
      id: `emp_${Date.now()}`,
      email: `user.${slackId}@xceleration.com`,
      name: `Mock User ${slackId.slice(-4)}`,
      platform: 'slack',
      platform_user_id: slackId,
      employee_id: `emp_${Date.now()}`
    };

    this.users.set(mockUser.email, mockUser);

    return {
      success: true,
      data: mockUser,
      mock: true
    };
  }

  // Mock recognition creation endpoint
  async createRecognition(request) {
    console.log('🎉 Mock Recognition Creation:', request);
    
    const recognition_id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response = {
      recognition_id,
      status: request.recognition_type === 'thanks' ? 'delivered' : 'submitted',
      approval_required: request.recognition_type === 'points',
      approval_url: request.recognition_type === 'points' ? `https://mock-rewardstation.com/approve/${recognition_id}` : undefined,
      estimated_delivery: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
    };

    this.recognitions.set(recognition_id, {
      ...request,
      ...response,
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      data: response,
      mock: true
    };
  }

  // Mock recognition status check
  async getRecognitionStatus(recognition_id) {
    console.log(`📊 Mock Recognition Status Check: ${recognition_id}`);
    
    const recognition = this.recognitions.get(recognition_id);
    
    if (!recognition) {
      return {
        success: false,
        error: `Recognition not found: ${recognition_id}`,
        mock: true
      };
    }

    return {
      success: true,
      data: {
        recognition_id,
        status: recognition.status,
        approval_required: recognition.approval_required,
        approval_url: recognition.approval_url,
        estimated_delivery: recognition.estimated_delivery
      },
      mock: true
    };
  }

  // Mock user balance check
  async getUserBalance(employee_id) {
    console.log(`💰 Mock Balance Check: ${employee_id}`);
    
    // Return a random balance for demo
    const balance = Math.floor(Math.random() * 1000) + 100;
    
    return {
      success: true,
      data: { balance },
      mock: true
    };
  }

  // Mock company behavior attributes
  async getBehaviorAttributes() {
    console.log('🎯 Mock Behavior Attributes');
    
    const attributes = [
      'Innovation',
      'Teamwork', 
      'Customer Focus',
      'Leadership',
      'Quality Excellence',
      'Accountability'
    ];

    return {
      success: true,
      data: attributes,
      mock: true
    };
  }

  // Get all stored recognitions (for debugging)
  getAllRecognitions() {
    return Array.from(this.recognitions.values());
  }

  // Get all users (for debugging)
  getAllUsers() {
    return Array.from(this.users.values());
  }
}

// Singleton instance
const mockRewardStationAPI = new MockRewardStationAPI();

module.exports = { mockRewardStationAPI };