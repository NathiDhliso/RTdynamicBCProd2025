// Shared utility functions for Lambda handlers

// CORS headers for API Gateway responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be configured in API Gateway
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

// Create standardized API Gateway response
export const createResponse = (statusCode, body, headers = {}) => {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      ...headers
    },
    body: JSON.stringify(body, null, 2)
  };
};

// Log incoming requests for debugging
export const logRequest = (event, source = 'Lambda') => {
  const requestInfo = {
    source,
    method: event.httpMethod,
    path: event.path,
    queryParams: event.queryStringParameters,
    headers: {
      'user-agent': event.headers?.['user-agent'],
      'x-forwarded-for': event.headers?.['x-forwarded-for'],
      'origin': event.headers?.origin
    },
    requestId: event.requestContext?.requestId,
    timestamp: new Date().toISOString()
  };
  
  console.log(`📥 ${source} request:`, JSON.stringify(requestInfo, null, 2));
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>"'&]/g, (match) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match];
    })
    .trim();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting check (basic implementation)
export const checkRateLimit = (event, maxRequests = 10, windowMs = 60000) => {
  // In a production environment, you would use DynamoDB or Redis
  // For now, this is a placeholder that always returns true
  // API Gateway handles rate limiting at the infrastructure level
  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetTime: Date.now() + windowMs
  };
};

// Extract client IP from event
export const getClientIP = (event) => {
  return event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
         event.headers?.['x-real-ip'] ||
         event.requestContext?.identity?.sourceIp ||
         'unknown';
};

// Extract user agent from event
export const getUserAgent = (event) => {
  return event.headers?.['user-agent'] || 'unknown';
};

// Generate unique request ID if not provided
export const getRequestId = (event) => {
  return event.requestContext?.requestId || 
         `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Parse and validate JSON body
export const parseJsonBody = (body) => {
  try {
    return {
      success: true,
      data: JSON.parse(body || '{}')
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON format',
      details: error.message
    };
  }
};

// Format error response
export const createErrorResponse = (statusCode, error, message, requestId = null) => {
  const errorBody = {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (requestId) {
    errorBody.requestId = requestId;
  }
  
  return createResponse(statusCode, errorBody);
};

// Format success response
export const createSuccessResponse = (data, message = null, requestId = null) => {
  const successBody = {
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  };
  
  if (message) {
    successBody.message = message;
  }
  
  if (requestId) {
    successBody.requestId = requestId;
  }
  
  return createResponse(200, successBody);
};

// Validate required environment variables
export const validateEnvironment = (requiredVars = []) => {
  const missing = [];
  const defaultVars = ['SES_REGION', 'BUSINESS_EMAIL'];
  const allRequired = [...defaultVars, ...requiredVars];
  
  allRequired.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return {
      valid: false,
      missing
    };
  }
  
  return {
    valid: true,
    missing: []
  };
};

// Log performance metrics
export const logPerformance = (startTime, operation, additionalData = {}) => {
  const duration = Date.now() - startTime;
  const performanceLog = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...additionalData
  };
  
  console.log('⏱️ Performance:', JSON.stringify(performanceLog));
  
  // Log warning for slow operations
  if (duration > 5000) {
    console.warn(`⚠️ Slow operation detected: ${operation} took ${duration}ms`);
  }
  
  return duration;
};

// Retry mechanism for external API calls
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Format South African phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle South African numbers
  if (digits.startsWith('27')) {
    // International format
    return `+${digits}`;
  } else if (digits.startsWith('0')) {
    // Local format - convert to international
    return `+27${digits.substring(1)}`;
  } else if (digits.length === 9) {
    // Missing leading 0
    return `+27${digits}`;
  }
  
  return phone; // Return original if can't format
};

// Validate South African business registration number
export const validateBusinessNumber = (number) => {
  if (!number) return false;
  
  // Remove spaces and special characters
  const clean = number.replace(/[^0-9]/g, '');
  
  // South African company registration numbers are typically 10-14 digits
  return clean.length >= 10 && clean.length <= 14;
};

// Generate submission ID
export const generateSubmissionId = (prefix = 'SUB') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Check if request is from allowed origin
export const isAllowedOrigin = (origin) => {
  const allowedOrigins = [
    'https://www.rtdynamicbc.co.za',
    'https://rtdynamicbc.co.za',
    'https://d2js6qnot116a8.cloudfront.net',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ];
  
  return !origin || allowedOrigins.includes(origin);
};

// Format currency for South African Rand
export const formatCurrency = (amount, currency = 'ZAR') => {
  if (typeof amount !== 'number') return amount;
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Get South African timezone timestamp
export const getSATimestamp = () => {
  return new Date().toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};