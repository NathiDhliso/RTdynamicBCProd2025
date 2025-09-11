import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { validateQuestionnaireForm } from './validation.js';
import { calculateQuote } from './calculations.js';
import { 
  formatQuestionnaireDataForExcel, 
  generateQuestionnaireExcel, 
  generateWeeklyFilename,
  createEmailAttachment,
  appendToExistingExcel,
  QUESTIONNAIRE_COLUMNS
} from './excel-generator.js';
import { sendEmailWithDataInBody } from './ses-email-helper.js';
import { promises as fs } from 'fs';
import path from 'path';

// Inline utility functions to avoid module path issues
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

// Inline email template function
const createQuestionnaireEmailTemplate = (formData, quoteDetails) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return {
    subject: `New Business Health Check Submission: ${formData.companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Business Health Check Submission</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1a2332; 
            margin: 0; 
            padding: 0; 
            background-color: #f0f2f5;
          }
          .email-wrapper { 
            width: 100%; 
            max-width: 1400px; 
            margin: 40px auto; 
            background-color: #ffffff;
            box-shadow: 0 15px 50px rgba(26, 35, 50, 0.15);
            border-radius: 16px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #1a2332 0%, #2d3e5a 50%, #4a5f7a 100%); 
            color: white; 
            padding: 80px 60px; 
            text-align: center;
          }
          .content { 
            padding: 80px 60px;
            background: #ffffff;
          }
          .grid { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            margin-bottom: 50px;
          }
          .section { 
            background: linear-gradient(145deg, #f8f9fb, #ffffff);
            border: 1px solid #e5e8ed;
            border-radius: 12px;
            padding: 40px;
          }
          .section-title { 
            font-size: 20px;
            font-weight: 600; 
            color: #1a2332; 
            margin-bottom: 30px;
            border-bottom: 2px solid #4a5f7a;
            padding-bottom: 15px;
          }
          .field { 
            margin-bottom: 25px;
          }
          .label { 
            font-weight: 500; 
            color: #4a5f7a; 
            margin-bottom: 8px; 
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .value { 
            color: #1a2332;
            font-size: 16px;
            font-weight: 400;
            word-break: break-word;
            line-height: 1.5;
          }
          .quote-section {
            background: linear-gradient(135deg, #4a5f7a, #2d3e5a);
            color: white;
            padding: 50px;
            border-radius: 12px;
            text-align: center;
            margin: 40px 0;
          }
          .quote-amount {
            font-size: 48px;
            font-weight: 700;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>Business Health Check Submission</h1>
            <p>RT Dynamic Business Consulting</p>
          </div>
          <div class="content">
            <div class="grid">
              <div class="section">
                <div class="section-title">Company Information</div>
                <div class="field">
                  <div class="label">Company Name</div>
                  <div class="value">${formData.companyName}</div>
                </div>
                <div class="field">
                  <div class="label">Entity Type</div>
                  <div class="value">${formData.entityType}</div>
                </div>
                <div class="field">
                  <div class="label">Industry</div>
                  <div class="value">${formData.industry}</div>
                </div>
                <div class="field">
                  <div class="label">Annual Revenue</div>
                  <div class="value">${formData.annualRevenue}</div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">Operational Details</div>
                <div class="field">
                  <div class="label">Has Employees</div>
                  <div class="value">${formData.hasEmployees}</div>
                </div>
                ${formData.employeeCount ? `
                <div class="field">
                  <div class="label">Employee Count</div>
                  <div class="value">${formData.employeeCount}</div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="label">Manages Stock</div>
                  <div class="value">${formData.managesStock}</div>
                </div>
                <div class="field">
                  <div class="label">Deals with Foreign Currency</div>
                  <div class="value">${formData.dealsForeignCurrency}</div>
                </div>
              </div>
            </div>
            
            ${formData.taxComplexity ? `
            <div class="section">
              <div class="section-title">Compliance & Regulatory</div>
              <div class="field">
                <div class="label">Tax Complexity</div>
                <div class="value">${formData.taxComplexity}</div>
              </div>
              <div class="field">
                <div class="label">Audit Requirements</div>
                <div class="value">${formData.auditRequirements}</div>
              </div>
              <div class="field">
                <div class="label">Regulatory Reporting</div>
                <div class="value">${formData.regulatoryReporting}</div>
              </div>
            </div>
            ` : ''}
            
            <div class="grid">
              <div class="section">
                <div class="section-title">Goals & Challenges</div>
                <div class="field">
                  <div class="label">Primary Goal</div>
                  <div class="value">${formData.primaryGoal}</div>
                </div>
                <div class="field">
                  <div class="label">Business Challenges</div>
                  <div class="value" style="white-space: pre-wrap;">${formData.businessChallenges}</div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">Contact Information</div>
                <div class="field">
                  <div class="label">Contact Name</div>
                  <div class="value">${formData.contactName}</div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value">${formData.email}</div>
                </div>
                <div class="field">
                  <div class="label">Phone Number</div>
                  <div class="value">${formData.phoneNumber}</div>
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
              </div>
            </div>
            
            ${quoteDetails ? `
            <div class="quote-section">
              <h2>Estimated Service Quote</h2>
              <div class="quote-amount">${formatCurrency(quoteDetails.quote)}</div>
              <p>This quote is based on the information provided and our standard service packages.</p>
            </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Business Health Check Submission - RT Dynamic Business Consulting
      
      Company: ${formData.companyName}
      Entity Type: ${formData.entityType}
      Industry: ${formData.industry}
      Annual Revenue: ${formData.annualRevenue}
      
      Operational Details:
      Has Employees: ${formData.hasEmployees}
      ${formData.employeeCount ? `Employee Count: ${formData.employeeCount}` : ''}
      Manages Stock: ${formData.managesStock}
      Deals with Foreign Currency: ${formData.dealsForeignCurrency}
      
      ${formData.taxComplexity ? `
      Compliance & Regulatory:
      Tax Complexity: ${formData.taxComplexity}
      Audit Requirements: ${formData.auditRequirements}
      Regulatory Reporting: ${formData.regulatoryReporting}
      ` : ''}
      
      Goals & Challenges:
      Primary Goal: ${formData.primaryGoal}
      Business Challenges: ${formData.businessChallenges}
      
      Contact Information:
      Name: ${formData.contactName}
      Email: ${formData.email}
      Phone: ${formData.phoneNumber}
      
      ${quoteDetails ? `Estimated Quote: ${formatCurrency(quoteDetails.quote)}` : ''}
      
      Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
    `
  };
};

// Configure AWS SES client
const sesClient = new SESClient({
  region: process.env.SES_REGION || 'us-east-1'
});

// Async email sending function for questionnaire that doesn't block the response
const sendQuestionnaireEmailsAsync = async (formData, metadata = {}) => {
  try {
    // Format data for Excel
    const excelData = formatQuestionnaireDataForExcel(formData, {
      ipAddress: metadata.sourceIp || '',
      userAgent: metadata.userAgent || '',
      source: 'Website Questionnaire'
    });
    
    // Generate weekly filename and append to weekly file
    const weeklyFilename = generateWeeklyFilename('questionnaire');
    const weeklyFilePath = path.join('/tmp', weeklyFilename);
    
    try {
      await appendToExistingExcel(weeklyFilePath, [excelData], 'Questionnaire Submissions', QUESTIONNAIRE_COLUMNS);
      console.log(`📊 Data appended to weekly file: ${weeklyFilename}`);
    } catch (weeklyError) {
      console.error('⚠️ Failed to append to weekly file:', weeklyError.message);
    }
    
    // Create email template
    const emailTemplate = createQuestionnaireEmailTemplate(formData);
    
    // Send email to business with data included in body
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
    
    await sendEmailWithDataInBody(sesClient, businessEmailParams, [excelData]);
    console.log('✅ Business questionnaire notification email sent successfully with customer data included');

    // Send confirmation email to customer (optional)
    if (process.env.SEND_CONFIRMATION === 'true') {
      const confirmationTemplate = {
        subject: 'Thank you for completing the Business Health Check - RT Dynamic',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Business Health Check Received - RT Dynamic</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .highlight { background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0; }
              .next-steps { background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You, ${formData.contactName}!</h1>
                <p>RT Dynamic Business Consulting</p>
              </div>
              <div class="content">
                <p>Thank you for completing our Business Health Check questionnaire for <strong>${formData.companyName}</strong>.</p>
                
                <div class="highlight">
                  <strong>📊 Your Submission Summary:</strong><br>
                  <strong>Company:</strong> ${formData.companyName}<br>
                  <strong>Primary Goal:</strong> ${formData.primaryGoal}<br>
                  <strong>Submitted:</strong> ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
                </div>
                
                <div class="next-steps">
                  <strong>🚀 What Happens Next:</strong><br>
                  • Our chartered accountants will analyze your responses<br>
                  • We'll prepare customized recommendations for your business<br>
                  • You'll receive a detailed assessment within 24 hours<br>
                  • We'll schedule a consultation to discuss opportunities
                </div>
                
                <p>Our team will review your business profile and provide tailored insights to help you achieve your goal of <em>"${formData.primaryGoal}"</em>.</p>
                
                <p>If you have any immediate questions, please don't hesitate to contact us directly.</p>
                
                <p>Best regards,<br>
                <strong>RT Dynamic Business Consulting Team</strong><br>
                <em>Chartered Accountants & Business Consultants</em></p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Thank you for completing the Business Health Check!
          
          Dear ${formData.contactName},
          
          We have received your Business Health Check questionnaire for ${formData.companyName}.
          
          Your Primary Goal: ${formData.primaryGoal}
          Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
          
          What Happens Next:
          - Our chartered accountants will analyze your responses
          - We'll prepare customized recommendations for your business
          - You'll receive a detailed assessment within 24 hours
          - We'll schedule a consultation to discuss opportunities
          
          Best regards,
          RT Dynamic Business Consulting Team
          Chartered Accountants & Business Consultants
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
        console.log('✅ Questionnaire confirmation email sent to customer');
      } catch (confirmationError) {
        console.error('⚠️ Failed to send questionnaire confirmation email:', confirmationError.message);
        // Don't fail if confirmation email fails
      }
    }
  } catch (error) {
    console.error('❌ Async questionnaire email sending failed:', error.message);
    // Log error but don't throw - emails are sent in background
  }
};

// Main Lambda handler
export const handler = async (event) => {
  // Log the incoming request
  logRequest(event, 'Business Health Check');
  
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
    const validation = validateQuestionnaireForm(requestBody);
    if (!validation.isValid) {
      return createResponse(400, {
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, corsHeaders);
    }
    
    const formData = validation.data;
    
    // Calculate quote if not provided (for backward compatibility)
    if (!formData.quoteDetails && formData.entityType && formData.annualRevenue) {
      try {
        const calculatedQuote = calculateQuote(formData);
        formData.quoteDetails = calculatedQuote;
        console.log('📊 Quote calculated:', {
          companyName: formData.companyName,
          quote: calculatedQuote.quote,
          basePrice: calculatedQuote.basePrice,
          complexityFactors: calculatedQuote.complexityFactors
        });
      } catch (calcError) {
        console.error('⚠️ Quote calculation failed:', calcError.message);
        // Continue without quote - it's optional
      }
    }
    
    // Log the submission (for debugging)
    console.log('📊 Business Health Check submission received:', {
      companyName: formData.companyName,
      entityType: formData.entityType,
      contactName: formData.contactName,
      email: formData.email,
      primaryGoal: formData.primaryGoal,
      quote: formData.quoteDetails?.quote || 'No quote',
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId
    });
    
    // Return success response immediately
    const response = createResponse(200, {
      success: true,
      message: 'Your Business Health Check has been submitted successfully. We will analyze your responses and contact you within 24 hours with customized recommendations.',
      data: {
        companyName: formData.companyName,
        primaryGoal: formData.primaryGoal,
        submissionId: `BHC-${Date.now()}`,
        timestamp: new Date().toISOString(),
        quote: formData.quoteDetails?.quote || null
      },
      requestId: event.requestContext?.requestId
    }, corsHeaders);
    
    // Prepare metadata for Excel generation
    const metadata = {
      sourceIp: event.requestContext?.identity?.sourceIp || '',
      userAgent: event.headers?.['User-Agent'] || event.headers?.['user-agent'] || '',
      requestId: event.requestContext?.requestId || ''
    };
    
    // Send emails before returning to ensure delivery in Lambda environment
    try {
      await sendQuestionnaireEmailsAsync(formData, metadata);
      console.log('📤 Questionnaire emails processed before responding to client');
    } catch (error) {
      console.error('❌ Background questionnaire email sending failed:', error.message);
      // Do not fail the response to the client
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Questionnaire submission error:', error);
    
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'We apologize for the inconvenience. Please try again later or contact us directly.',
      requestId: event.requestContext?.requestId
    }, corsHeaders);
  }
};