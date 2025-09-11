# Frontend Migration Guide - AWS Lambda Backend Integration

This guide outlines the changes needed in the React frontend to integrate with the new AWS Lambda backend while maintaining all existing functionality.

## 🔄 API Endpoint Changes

### Before (Express.js Backend)
```javascript
// Current endpoints
const API_BASE_URL = 'http://localhost:3001' // Development
const API_BASE_URL = 'https://your-backend-domain.com' // Production

const CONTACT_ENDPOINT = `${API_BASE_URL}/api/contact`
const QUESTIONNAIRE_ENDPOINT = `${API_BASE_URL}/api/questionnaire`
```

### After (Lambda Backend)
```javascript
// New Lambda endpoints (from CloudFormation outputs)
const API_BASE_URL = 'https://{api-id}.execute-api.{region}.amazonaws.com/{stage}'

const CONTACT_ENDPOINT = `${API_BASE_URL}/api/contact`
const QUESTIONNAIRE_ENDPOINT = `${API_BASE_URL}/api/questionnaire`
```

## 📝 Required Frontend Updates

### 1. Environment Configuration

Create or update your environment configuration files:

**`.env.development`**
```bash
# Development - use your deployed Lambda endpoints
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/development
VITE_CONTACT_ENDPOINT=/api/contact
VITE_QUESTIONNAIRE_ENDPOINT=/api/questionnaire
```

**`.env.production`**
```bash
# Production - use your deployed Lambda endpoints
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/production
VITE_CONTACT_ENDPOINT=/api/contact
VITE_QUESTIONNAIRE_ENDPOINT=/api/questionnaire
```

### 2. API Configuration Updates

Update your API configuration file (create if it doesn't exist):

**`src/lib/api.ts`**
```typescript
// API configuration for Lambda backend
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/production',
  endpoints: {
    contact: import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact',
    questionnaire: import.meta.env.VITE_QUESTIONNAIRE_ENDPOINT || '/api/questionnaire'
  },
  timeout: 30000, // 30 seconds for contact form
  questionnaireTimeout: 45000, // 45 seconds for questionnaire (includes calculations)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Enhanced error handling for Lambda responses
export const handleApiError = (error: any) => {
  if (error.response) {
    // Lambda returned an error response
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: data.message || 'Please check your input and try again.',
          details: data.details || []
        };
      case 429:
        return {
          type: 'rate_limit',
          message: 'Too many requests. Please wait a moment and try again.'
        };
      case 500:
        return {
          type: 'server',
          message: 'Server error. Please try again later or contact support.'
        };
      default:
        return {
          type: 'unknown',
          message: data.message || 'An unexpected error occurred.'
        };
    }
  } else if (error.request) {
    // Network error
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.'
    };
  } else {
    // Other error
    return {
      type: 'unknown',
      message: 'An unexpected error occurred.'
    };
  }
};
```

### 3. Contact Form Updates

Update your contact form submission logic:

**`src/pages/ContactPage.tsx` or relevant component**
```typescript
import { API_CONFIG, buildApiUrl, handleApiError } from '../lib/api';

// Update the contact form submission function
const handleContactSubmit = async (formData: ContactFormData) => {
  setIsSubmitting(true);
  setSubmissionStatus(null);
  
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.endpoints.contact), {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      }),
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send message');
    }
    
    if (result.success) {
      setSubmissionStatus({
        type: 'success',
        message: result.message || 'Your message has been sent successfully. We will respond within 24 hours.'
      });
      
      // Reset form
      reset();
      
      // Optional: Track successful submission
      if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_form_submit', {
          event_category: 'engagement',
          event_label: 'contact_form'
        });
      }
    } else {
      throw new Error(result.message || 'Failed to send message');
    }
    
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    
    const errorInfo = handleApiError(error);
    setSubmissionStatus({
      type: 'error',
      message: errorInfo.message,
      details: errorInfo.details
    });
    
    // Optional: Track failed submission
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact_form_error', {
        event_category: 'error',
        event_label: errorInfo.type
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

### 4. Questionnaire Updates

Update your questionnaire submission logic:

**`src/pages/QuestionnairePage.tsx` or relevant component**
```typescript
import { API_CONFIG, buildApiUrl, handleApiError } from '../lib/api';

// Update the questionnaire submission function
const handleQuestionnaireSubmit = async (formData: QuestionnaireFormData) => {
  setIsSubmitting(true);
  setSubmissionStatus(null);
  
  try {
    // Include quote details if calculated on frontend
    const submissionData = {
      ...formData,
      quoteDetails: quote ? {
        quote: quote.quote,
        basePrice: quote.basePrice,
        payrollCost: quote.payrollCost,
        revenueModifier: quote.revenueModifier,
        complexityModifier: quote.complexityModifier,
        complexityFactors: quote.complexityFactors,
        baseServices: quote.baseServices
      } : undefined
    };
    
    const response = await fetch(buildApiUrl(API_CONFIG.endpoints.questionnaire), {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(submissionData),
      signal: AbortSignal.timeout(API_CONFIG.questionnaireTimeout)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit questionnaire');
    }
    
    if (result.success) {
      setSubmissionStatus({
        type: 'success',
        message: result.message || 'Your Business Health Check has been submitted successfully. We will analyze your responses and contact you within 24 hours with customized recommendations.',
        data: result.data
      });
      
      // Store submission data for confirmation page
      if (result.data) {
        localStorage.setItem('questionnaire_submission', JSON.stringify({
          submissionId: result.data.submissionId,
          companyName: result.data.companyName,
          primaryGoal: result.data.primaryGoal,
          timestamp: result.data.timestamp,
          quote: result.data.quote
        }));
      }
      
      // Optional: Track successful submission
      if (typeof gtag !== 'undefined') {
        gtag('event', 'questionnaire_submit', {
          event_category: 'engagement',
          event_label: 'business_health_check',
          value: result.data?.quote || 0
        });
      }
      
      // Navigate to success page or show success message
      // navigate('/questionnaire/success');
      
    } else {
      throw new Error(result.message || 'Failed to submit questionnaire');
    }
    
  } catch (error: any) {
    console.error('Questionnaire submission error:', error);
    
    const errorInfo = handleApiError(error);
    setSubmissionStatus({
      type: 'error',
      message: errorInfo.message,
      details: errorInfo.details
    });
    
    // Optional: Track failed submission
    if (typeof gtag !== 'undefined') {
      gtag('event', 'questionnaire_error', {
        event_category: 'error',
        event_label: errorInfo.type
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

### 5. Quote Calculation Integration

If you want to keep quote calculations on the frontend (recommended for better UX), ensure your existing `useQuote.ts` hook continues to work. The Lambda backend will also calculate quotes as a backup.

**`src/hooks/useQuote.ts`** (no changes needed if working correctly)
```typescript
// Your existing quote calculation logic remains the same
// The Lambda backend will recalculate as a backup/verification
```

### 6. Error Handling Updates

Update your error handling to work with Lambda response format:

**`src/components/ErrorMessage.tsx`**
```typescript
interface ErrorMessageProps {
  error: {
    type: 'validation' | 'rate_limit' | 'server' | 'network' | 'unknown';
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return (
    <div className={`error-message error-${error.type}`}>
      <p>{error.message}</p>
      
      {error.details && error.details.length > 0 && (
        <ul className="error-details">
          {error.details.map((detail, index) => (
            <li key={index}>
              <strong>{detail.field}:</strong> {detail.message}
            </li>
          ))}
        </ul>
      )}
      
      {error.type === 'network' && (
        <p className="error-suggestion">
          Please check your internet connection and try again.
        </p>
      )}
      
      {error.type === 'rate_limit' && (
        <p className="error-suggestion">
          Please wait a moment before submitting again.
        </p>
      )}
    </div>
  );
};
```

### 7. Loading States

Update loading states to account for Lambda cold starts:

```typescript
// Increase timeout expectations
const [isSubmitting, setIsSubmitting] = useState(false);
const [loadingMessage, setLoadingMessage] = useState('');

const handleSubmit = async () => {
  setIsSubmitting(true);
  setLoadingMessage('Sending your message...');
  
  // Add timeout for cold starts
  const coldStartTimeout = setTimeout(() => {
    setLoadingMessage('Processing your request (this may take a moment)...');
  }, 5000);
  
  try {
    // ... submission logic
  } finally {
    clearTimeout(coldStartTimeout);
    setIsSubmitting(false);
    setLoadingMessage('');
  }
};
```

## 🧪 Testing the Integration

### 1. Development Testing

```bash
# Update your environment variables
echo "VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/development" > .env.development

# Start development server
npm run dev

# Test both forms thoroughly
```

### 2. Production Testing

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Test with production Lambda endpoints
```

### 3. Test Cases

**Contact Form:**
- ✅ Valid submission
- ✅ Invalid email format
- ✅ Missing required fields
- ✅ Message too short/long
- ✅ Network timeout
- ✅ Rate limiting

**Questionnaire:**
- ✅ Complete valid submission
- ✅ Pty Ltd with compliance fields
- ✅ Non-Pty Ltd without compliance
- ✅ Quote calculation accuracy
- ✅ Employee count conditional logic
- ✅ Form validation errors

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Lambda backend deployed and tested
- [ ] API Gateway endpoints confirmed working
- [ ] SES email addresses verified
- [ ] Environment variables updated
- [ ] Error handling tested

### Deployment
- [ ] Update environment variables in hosting platform
- [ ] Deploy frontend with new API endpoints
- [ ] Test contact form submission
- [ ] Test questionnaire submission
- [ ] Verify email delivery
- [ ] Check quote calculations

### Post-Deployment
- [ ] Monitor CloudWatch logs for errors
- [ ] Check email delivery rates
- [ ] Verify form submissions are working
- [ ] Test from different devices/browsers
- [ ] Monitor performance metrics

## 🔍 Monitoring & Analytics

### Add Request Tracking

```typescript
// Track API requests for monitoring
const trackApiRequest = (endpoint: string, success: boolean, duration: number) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'api_request', {
      event_category: 'api',
      event_label: endpoint,
      custom_map: {
        custom_parameter_1: success ? 'success' : 'failure',
        custom_parameter_2: duration
      }
    });
  }
};

// Use in your API calls
const startTime = Date.now();
try {
  const response = await fetch(url, options);
  const duration = Date.now() - startTime;
  trackApiRequest(endpoint, response.ok, duration);
} catch (error) {
  const duration = Date.now() - startTime;
  trackApiRequest(endpoint, false, duration);
}
```

## 🛠️ Troubleshooting

### Common Issues

**1. CORS Errors**
```javascript
// Check browser console for CORS errors
// Verify API Gateway CORS configuration
// Ensure preflight OPTIONS requests are handled
```

**2. Timeout Issues**
```javascript
// Increase timeout values
// Check Lambda function timeout settings
// Monitor CloudWatch logs for cold starts
```

**3. Quote Calculation Differences**
```javascript
// Compare frontend vs backend calculations
// Check for rounding differences
// Verify all business rules are consistent
```

**4. Email Delivery Issues**
```javascript
// Check SES sending statistics
// Verify email addresses in SES
// Check spam folders
// Monitor CloudWatch logs for SES errors
```

## 📋 Migration Rollback Plan

If issues arise, you can quickly rollback:

1. **Immediate Rollback:**
   ```bash
   # Revert environment variables to old backend
   VITE_API_BASE_URL=https://your-old-backend.com
   
   # Redeploy frontend
   npm run build && npm run deploy
   ```

2. **Gradual Rollback:**
   - Route percentage of traffic to old backend
   - Monitor for issues
   - Gradually increase old backend traffic

3. **Complete Rollback:**
   - Update all environment variables
   - Redeploy frontend
   - Keep Lambda backend for future migration

---

## ✅ Success Criteria

The migration is successful when:
- [ ] Contact form submissions work identically
- [ ] Questionnaire submissions work identically
- [ ] Quote calculations are accurate
- [ ] Email delivery is working
- [ ] Error handling is appropriate
- [ ] Performance is equal or better
- [ ] All validation rules are preserved
- [ ] Analytics/tracking continues to work

**Expected Benefits:**
- 🚀 Faster response times (after cold start)
- 💰 Significant cost reduction
- 🔒 Enhanced security
- 📊 Better monitoring and logging
- 🔄 Easier maintenance and updates