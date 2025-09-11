import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { validateContactForm } from './validation.js';

// Inline email template function to avoid module path issues
const createContactEmailTemplate = (formData) => {
  return {
    subject: `New Contact Form Submission: ${formData.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1a2332; 
            margin: 0; 
            padding: 0; 
            background-color: #f0f2f5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .email-wrapper { 
            width: 100%; 
            max-width: 1200px; 
            margin: 40px auto; 
            background-color: #ffffff;
            box-shadow: 0 10px 40px rgba(26, 35, 50, 0.1);
            border-radius: 12px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #1a2332 0%, #2d3e5a 50%, #4a5f7a 100%); 
            color: white; 
            padding: 60px 50px; 
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .content { 
            padding: 60px 50px;
            background: #ffffff;
          }
          .field { 
            background: linear-gradient(145deg, #f8f9fb, #ffffff);
            border: 1px solid #e5e8ed;
            border-radius: 10px;
            padding: 32px;
            margin-bottom: 24px;
          }
          .label { 
            font-weight: 500; 
            color: #4a5f7a; 
            margin-bottom: 12px; 
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .value { 
            color: #1a2332;
            font-size: 18px;
            font-weight: 400;
            word-break: break-word;
            line-height: 1.6;
          }
          .message-content {
            background: white;
            padding: 32px;
            border-radius: 8px;
            border-left: 4px solid #4a5f7a;
            white-space: pre-wrap;
            font-size: 16px;
            line-height: 1.8;
            margin-top: 20px;
            color: #2d3e5a;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>RT Dynamic Business Consulting Website</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Full Name</div>
              <div class="value">${formData.name}</div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value">${formData.email}</div>
            </div>
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${formData.subject}</div>
            </div>
            <div class="field">
              <div class="label">Submitted At</div>
              <div class="value">${new Date().toLocaleString('en-ZA', { 
                timeZone: 'Africa/Johannesburg',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            <div class="field">
              <div class="label">Message Content</div>
              <div class="message-content">${formData.message}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Contact Form Submission - RT Dynamic Business Consulting
      
      Name: ${formData.name}
      Email: ${formData.email}
      Subject: ${formData.subject}
      
      Message:
      ${formData.message}
      
      Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
    `
  };
};

// Inline utility functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

const createResponse = (statusCode, body, headers = {}) => {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      ...headers
    },
    body: JSON.stringify(body, null, 2)
  };
};

const logRequest = (event, source = 'Lambda') => {
  const requestInfo = {
    source,
    method: event.httpMethod,
    path: event.path,
    requestId: event.requestContext?.requestId,
    timestamp: new Date().toISOString()
  };
  
  console.log(`📥 ${source} request:`, JSON.stringify(requestInfo, null, 2));
};

// Configure AWS SES client
const sesClient = new SESClient({
  region: process.env.SES_REGION || 'us-east-1'
});

// Async email sending function that doesn't block the response
const sendEmailsAsync = async (formData) => {
  try {
    // Create email template
    const emailTemplate = createContactEmailTemplate(formData);
    
    // Send email to business
    const recipientEmail = process.env.BUSINESS_EMAIL || 'contact@rtdynamicbc.co.za';
    
    const businessEmailParams = {
      Source: process.env.FROM_EMAIL || recipientEmail,
      Destination: {
        ToAddresses: [recipientEmail]
      },
      Message: {
        Subject: {
          Data: emailTemplate.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: emailTemplate.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: emailTemplate.text,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    await sesClient.send(new SendEmailCommand(businessEmailParams));
    console.log('✅ Business notification email sent successfully');

    // Send confirmation email to customer (optional)
    if (process.env.SEND_CONFIRMATION === 'true') {
      const confirmationTemplate = {
        subject: 'Thank you for contacting RT Dynamic Business Consulting',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Thank You - RT Dynamic</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .highlight { background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You, ${formData.name}!</h1>
                <p>RT Dynamic Business Consulting</p>
              </div>
              <div class="content">
                <p>Thank you for reaching out to RT Dynamic Business Consulting. We have received your message and will respond within 24 hours.</p>
                
                <div class="highlight">
                  <strong>Your Message Details:</strong><br>
                  <strong>Subject:</strong> ${formData.subject}<br>
                  <strong>Submitted:</strong> ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
                </div>
                
                <p>Our team of chartered accountants and business consultants will review your inquiry and provide you with a comprehensive response.</p>
                
                <p>If you have any urgent matters, please don't hesitate to call us directly.</p>
                
                <p>Best regards,<br>
                <strong>RT Dynamic Business Consulting Team</strong></p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Thank you for contacting RT Dynamic Business Consulting!
          
          Dear ${formData.name},
          
          We have received your message regarding "${formData.subject}" and will respond within 24 hours.
          
          Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
          
          Best regards,
          RT Dynamic Business Consulting Team
        `
      };
      
      const confirmationEmailParams = {
        Source: process.env.FROM_EMAIL || recipientEmail,
        Destination: {
          ToAddresses: [formData.email]
        },
        Message: {
          Subject: {
            Data: confirmationTemplate.subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: confirmationTemplate.html,
              Charset: 'UTF-8'
            },
            Text: {
              Data: confirmationTemplate.text,
              Charset: 'UTF-8'
            }
          }
        }
      };
      
      try {
        await sesClient.send(new SendEmailCommand(confirmationEmailParams));
        console.log('✅ Confirmation email sent to customer');
      } catch (confirmationError) {
        console.error('⚠️ Failed to send confirmation email:', confirmationError.message);
        // Don't fail if confirmation email fails
      }
    }
  } catch (error) {
    console.error('❌ Async email sending failed:', error.message);
    // Log error but don't throw - emails are sent in background
  }
};

// Main Lambda handler
export const handler = async (event) => {
  // Log the incoming request
  logRequest(event, 'Contact Form');
  
  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return createResponse(200, { message: 'CORS preflight' }, corsHeaders);
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return createResponse(405, {
        success: false,
        error: 'Method not allowed',
        message: 'Only POST requests are supported'
      }, corsHeaders);
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return createResponse(400, {
        success: false,
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }, corsHeaders);
    }
    
    // Validate form data
    const validation = validateContactForm(requestBody);
    if (!validation.isValid) {
      return createResponse(400, {
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, corsHeaders);
    }
    
    const formData = validation.data;
    
    // Log the submission (for debugging)
    console.log('📧 Contact form submission received:', {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId
    });
    
    // Return success response immediately
    const response = createResponse(200, {
      success: true,
      message: 'Your message has been sent successfully. We will respond within 24 hours.',
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId
    }, corsHeaders);
    
    // Send emails asynchronously in background (non-blocking)
    // Fire and forget - don't await this
    sendEmailsAsync(formData).catch(error => {
      console.error('❌ Background email sending failed:', error.message);
    });
    
    return response;
    
  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'We apologize for the inconvenience. Please try again later or contact us directly.',
      requestId: event.requestContext?.requestId
    }, corsHeaders);
  }
};