// Contact form validation logic
// Migrated from Joi to native JavaScript for Lambda optimization

export const validateContactForm = (data) => {
  const errors = [];
  const cleanData = {};
  
  // Validate name
  if (!data.name || typeof data.name !== 'string') {
    errors.push({
      field: 'name',
      message: 'Name is required'
    });
  } else if (data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required'
    });
  } else if (data.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Name must be less than 100 characters'
    });
  } else {
    cleanData.name = data.name.trim();
  }
  
  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    errors.push({
      field: 'email',
      message: 'Email is required'
    });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = data.email.trim().toLowerCase();
    
    if (email.length === 0) {
      errors.push({
        field: 'email',
        message: 'Email is required'
      });
    } else if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        message: 'Please provide a valid email address'
      });
    } else {
      cleanData.email = email;
    }
  }
  
  // Validate subject
  if (!data.subject || typeof data.subject !== 'string') {
    errors.push({
      field: 'subject',
      message: 'Subject is required'
    });
  } else if (data.subject.trim().length === 0) {
    errors.push({
      field: 'subject',
      message: 'Subject is required'
    });
  } else if (data.subject.length > 200) {
    errors.push({
      field: 'subject',
      message: 'Subject must be less than 200 characters'
    });
  } else {
    cleanData.subject = data.subject.trim();
  }
  
  // Validate message
  if (!data.message || typeof data.message !== 'string') {
    errors.push({
      field: 'message',
      message: 'Message is required'
    });
  } else if (data.message.trim().length === 0) {
    errors.push({
      field: 'message',
      message: 'Message is required'
    });
  } else if (data.message.trim().length < 10) {
    errors.push({
      field: 'message',
      message: 'Message must be at least 10 characters long'
    });
  } else if (data.message.length > 2000) {
    errors.push({
      field: 'message',
      message: 'Message must be less than 2000 characters'
    });
  } else {
    cleanData.message = data.message.trim();
  }
  
  // Additional security validations
  
  // Check for potential spam patterns
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
    /\b(click here|act now|limited time|urgent)\b/i,
    /(http:\/\/|https:\/\/|www\.).*\.(tk|ml|ga|cf)/i // Suspicious domains
  ];
  
  const messageText = (cleanData.message || '').toLowerCase();
  const subjectText = (cleanData.subject || '').toLowerCase();
  const nameText = (cleanData.name || '').toLowerCase();
  
  for (const pattern of spamPatterns) {
    if (pattern.test(messageText) || pattern.test(subjectText) || pattern.test(nameText)) {
      errors.push({
        field: 'message',
        message: 'Message contains prohibited content'
      });
      break;
    }
  }
  
  // Check for excessive special characters (potential spam)
  const specialCharCount = (messageText.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const messageLength = messageText.length;
  
  if (messageLength > 0 && (specialCharCount / messageLength) > 0.3) {
    errors.push({
      field: 'message',
      message: 'Message contains too many special characters'
    });
  }
  
  // Validate email domain (basic check)
  if (cleanData.email) {
    const domain = cleanData.email.split('@')[1];
    const suspiciousDomains = [
      'tempmail.org', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email'
    ];
    
    if (suspiciousDomains.includes(domain)) {
      errors.push({
        field: 'email',
        message: 'Please use a permanent email address'
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    data: cleanData
  };
};

// Additional utility functions for validation
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

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const containsSpam = (text) => {
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
    /\b(click here|act now|limited time|urgent)\b/i,
    /(http:\/\/|https:\/\/|www\.).*\.(tk|ml|ga|cf)/i
  ];
  
  return spamPatterns.some(pattern => pattern.test(text));
};