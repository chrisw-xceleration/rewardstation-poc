// Core type definitions for RewardStation Chat Integration

export interface User {
  id: string;
  email: string;
  name: string;
  platform: 'slack' | 'teams';
  platform_user_id: string;
  employee_id?: string; // RewardStation employee ID
}

export interface ChatCommand {
  command: string;           // e.g., "rewardstation"
  subcommand: string;       // e.g., "give", "thanks", "help"
  target_user?: string;     // @mentioned user
  message?: string;         // recognition message
  platform: 'slack' | 'teams';
  channel_id: string;
  user_id: string;
  timestamp: string;
  raw_input: string;
}

export interface ChatResponse {
  type: 'message' | 'modal' | 'notification' | 'error';
  content: any; // BlockKit or AdaptiveCard
  private?: boolean;
  follow_up?: ChatResponse[];
}

// Recognition types
export interface ThanksRequest {
  nominator_id: string;
  recipient_id: string;
  message: string;
  platform: 'slack' | 'teams';
  channel_id: string;
}

export interface RecognitionRequest {
  nominator_employee_id: string;
  recipient_employee_id: string;
  recognition_type: 'thanks' | 'points';
  points?: number;
  message: string;
  behavior_attributes: string[];
  source_platform: 'slack' | 'teams';
  source_channel_id: string;
  metadata: {
    original_command: string;
    ai_enhanced: boolean;
    timestamp: string;
  };
}

export interface RecognitionResponse {
  recognition_id: string;
  status: 'submitted' | 'approved' | 'rejected' | 'delivered';
  approval_required: boolean;
  approval_url?: string;
  estimated_delivery?: string;
}

// Maslow X (AI Assistant) types
export interface MaslowXRequest {
  type: 'help' | 'enhance_message' | 'suggest_behavior' | 'parse_command';
  context: {
    user: User;
    command?: ChatCommand;
    message?: string;
    recipient_context?: any;
  };
}

export interface MaslowXResponse {
  response_text: string;
  suggested_actions?: Array<{
    text: string;
    command: string;
  }>;
  enhanced_content?: string;
  confidence_score?: number;
}

// Mock RewardStation API responses (for development)
export interface MockApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  mock: true; // Flag to identify mock responses
}