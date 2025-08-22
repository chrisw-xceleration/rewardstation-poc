// Security utilities for RewardStation
const crypto = require('crypto');

/**
 * Enhanced input sanitization
 */
class InputSanitizer {
  /**
   * Sanitize user input to prevent injection attacks
   * @param {string} input - Raw user input
   * @param {object} options - Sanitization options
   * @returns {string} - Sanitized input
   */
  static sanitizeMessage(input, options = {}) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Basic HTML/Script tag removal
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove potential SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /([;'"\\])/g,
      /(--|\*\/|\*\*)|(\/\*)/g
    ];
    
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Length limits
    const maxLength = options.maxLength || 500;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '...';
    }

    // Trim and normalize whitespace
    sanitized = sanitized.trim().replace(/\s+/g, ' ');

    return sanitized;
  }

  /**
   * Validate and sanitize user mentions
   * @param {string} mention - User mention string
   * @returns {string|null} - Sanitized user ID or null
   */
  static sanitizeUserMention(mention) {
    if (!mention || typeof mention !== 'string') {
      return null;
    }

    // Extract Slack user ID pattern: <@U1234567890>
    const slackMatch = mention.match(/^<@([A-Z0-9]+)>$/);
    if (slackMatch) {
      return slackMatch[1];
    }

    // Extract Teams user ID pattern: <at>userid</at>
    const teamsMatch = mention.match(/^<at>([^<>]+)<\/at>$/);
    if (teamsMatch) {
      return teamsMatch[1];
    }

    // Simple alphanumeric user ID
    const simpleMatch = mention.match(/^[A-Za-z0-9._-]+$/);
    if (simpleMatch) {
      return mention;
    }

    return null;
  }

  /**
   * Validate points input
   * @param {number|string} points - Points value
   * @returns {number|null} - Valid points or null
   */
  static validatePoints(points) {
    const numPoints = parseInt(points);
    
    if (isNaN(numPoints) || numPoints < 0 || numPoints > 10000) {
      return null;
    }

    return numPoints;
  }
}

/**
 * Secure logging helper
 */
class SecureLogger {
  /**
   * Log command execution without sensitive data
   * @param {string} platform - Platform (slack/teams)
   * @param {string} command - Command name
   * @param {string} userId - User ID
   * @param {object} metadata - Additional metadata
   */
  static logCommand(platform, command, userId, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      platform,
      command,
      user_id: userId,
      success: metadata.success !== false,
      // Note: Not logging message content for privacy
      error: metadata.error || null,
      processing_time: metadata.processingTime || null
    };

    console.log('COMMAND_LOG:', JSON.stringify(logEntry));
  }

  /**
   * Log recognition creation
   * @param {object} recognitionData - Recognition details
   */
  static logRecognition(recognitionData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event_type: 'recognition_created',
      nominator_id: recognitionData.nominator_id,
      recipient_id: recognitionData.recipient_id,
      points: recognitionData.points,
      behaviors: recognitionData.behavior_attributes || [],
      platform: recognitionData.source_platform || 'unknown',
      ai_enhanced: recognitionData.ai_enhanced || false,
      // Note: Not logging actual message content
      message_length: recognitionData.message?.length || 0
    };

    console.log('RECOGNITION_LOG:', JSON.stringify(logEntry));
  }

  /**
   * Log security events
   * @param {string} eventType - Type of security event
   * @param {object} details - Event details
   */
  static logSecurityEvent(eventType, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event_type: 'security_event',
      security_event: eventType,
      user_id: details.userId || null,
      ip_address: details.ipAddress || null,
      platform: details.platform || null,
      details: details.message || null
    };

    console.log('SECURITY_LOG:', JSON.stringify(logEntry));
  }
}

/**
 * Webhook signature verification utilities
 */
class SignatureVerifier {
  /**
   * Verify Slack webhook signature
   * @param {string} body - Raw request body
   * @param {string} timestamp - Request timestamp
   * @param {string} signature - Slack signature
   * @param {string} signingSecret - Slack signing secret
   * @returns {boolean} - Signature is valid
   */
  static verifySlackSignature(body, timestamp, signature, signingSecret) {
    if (!signingSecret || signingSecret === 'mock-signing-secret') {
      console.log('🔧 Using mock signature verification for development');
      return true;
    }

    try {
      const hmac = crypto.createHmac('sha256', signingSecret);
      const [version, hash] = signature.split('=');
      
      if (version !== 'v0') {
        return false;
      }

      hmac.update(`${version}:${timestamp}:${body}`);
      const expected = hmac.digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'), 
        Buffer.from(expected, 'hex')
      );
    } catch (error) {
      SecureLogger.logSecurityEvent('signature_verification_error', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Verify Teams webhook signature
   * @param {string} body - Raw request body
   * @param {string} signature - Teams signature
   * @param {string} appPassword - Teams app password
   * @returns {boolean} - Signature is valid
   */
  static verifyTeamsSignature(body, signature, appPassword) {
    // Teams uses JWT tokens for authentication
    // This is a simplified version - production would use proper JWT verification
    if (!appPassword || appPassword === 'mock-teams-password') {
      console.log('🔧 Using mock Teams signature verification for development');
      return true;
    }

    // In production, implement proper JWT verification
    return true;
  }
}

/**
 * Data encryption utilities for sensitive information
 */
class DataEncryption {
  /**
   * Encrypt sensitive data for storage
   * @param {string} data - Data to encrypt
   * @param {string} key - Encryption key
   * @returns {object} - Encrypted data with IV
   */
  static encrypt(data, key) {
    if (!key || key.length < 32) {
      throw new Error('Encryption key must be at least 32 characters');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - Encrypted data
   * @param {string} iv - Initialization vector
   * @param {string} key - Decryption key
   * @returns {string} - Decrypted data
   */
  static decrypt(encryptedData, iv, key) {
    if (!key || key.length < 32) {
      throw new Error('Decryption key must be at least 32 characters');
    }

    const decipher = crypto.createDecipher('aes-256-cbc', key);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash sensitive data for comparison
   * @param {string} data - Data to hash
   * @param {string} salt - Salt for hashing
   * @returns {string} - Hashed data
   */
  static hash(data, salt) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }

    const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512');
    return `${salt}:${hash.toString('hex')}`;
  }
}

module.exports = {
  InputSanitizer,
  SecureLogger,
  SignatureVerifier,
  DataEncryption
};