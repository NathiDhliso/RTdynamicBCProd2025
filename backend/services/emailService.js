import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Email templates
const createContactEmailTemplate = (formData) => {
  return {
    subject: `New Contact Form Submission: ${formData.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
          .value { background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #10b981; }
          .message-box { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Contact Form Submission</h1>
            <p>RT Dynamic Business Consulting Website</p>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">👤 Full Name:</span>
              <div class="value">${formData.name}</div>
            </div>
            <div class="field">
              <span class="label">📧 Email Address:</span>
              <div class="value">${formData.email}</div>
            </div>
            <div class="field">
              <span class="label">📋 Subject:</span>
              <div class="value">${formData.subject}</div>
            </div>
            <div class="field">
              <span class="label">💬 Message:</span>
              <div class="message-box">${formData.message}</div>
            </div>
            <div class="field">
              <span class="label">🕐 Submitted At:</span>
              <div class="value">${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</div>
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

const createQuestionnaireEmailTemplate = (formData) => {
  return {
    subject: `New Business Health Check Submission: ${formData.companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Business Health Check Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 15px; border-bottom: 2px solid #10b981; padding-bottom: 5px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
          .value { background: white; padding: 10px; border-radius: 6px; border-left: 4px solid #10b981; }
          .highlight { background: #ecfdf5; border-left-color: #059669; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 New Business Health Check Submission</h1>
            <p>RT Dynamic Business Consulting - Questionnaire Response</p>
          </div>
          <div class="content">
            
            <div class="section">
              <div class="section-title">🏢 Company Information</div>
              <div class="field">
                <span class="label">Company Name:</span>
                <div class="value highlight">${formData.companyName}</div>
              </div>
              <div class="field">
                <span class="label">Entity Type:</span>
                <div class="value">${formData.entityType}</div>
              </div>
              <div class="field">
                <span class="label">Industry:</span>
                <div class="value">${formData.industry}</div>
              </div>
              <div class="field">
                <span class="label">Annual Revenue:</span>
                <div class="value">${formData.annualRevenue}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">⚙️ Operational Details</div>
              <div class="field">
                <span class="label">Has Employees:</span>
                <div class="value">${formData.hasEmployees}</div>
              </div>
              ${formData.employeeCount ? `
              <div class="field">
                <span class="label">Employee Count:</span>
                <div class="value">${formData.employeeCount}</div>
              </div>
              ` : ''}
              <div class="field">
                <span class="label">Manages Stock/Inventory:</span>
                <div class="value">${formData.managesStock}</div>
              </div>
              <div class="field">
                <span class="label">Deals in Foreign Currency:</span>
                <div class="value">${formData.dealsForeignCurrency}</div>
              </div>
            </div>

            ${formData.taxComplexity ? `
            <div class="section">
              <div class="section-title">📋 Compliance Requirements</div>
              <div class="field">
                <span class="label">Tax Complexity:</span>
                <div class="value">${formData.taxComplexity}</div>
              </div>
              <div class="field">
                <span class="label">Audit Requirements:</span>
                <div class="value">${formData.auditRequirements}</div>
              </div>
              <div class="field">
                <span class="label">Regulatory Reporting:</span>
                <div class="value">${formData.regulatoryReporting}</div>
              </div>
            </div>
            ` : ''}

            <div class="section">
              <div class="section-title">🎯 Goals & Challenges</div>
              <div class="field">
                <span class="label">Primary Goal:</span>
                <div class="value highlight">${formData.primaryGoal}</div>
              </div>
              <div class="field">
                <span class="label">Business Challenges:</span>
                <div class="value" style="white-space: pre-wrap;">${formData.businessChallenges}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">📞 Contact Information</div>
              <div class="field">
                <span class="label">Contact Name:</span>
                <div class="value highlight">${formData.contactName}</div>
              </div>
              <div class="field">
                <span class="label">Email Address:</span>
                <div class="value highlight">${formData.email}</div>
              </div>
              <div class="field">
                <span class="label">Phone Number:</span>
                <div class="value">${formData.phoneNumber}</div>
              </div>
            </div>

            <div class="field">
              <span class="label">🕐 Submitted At:</span>
              <div class="value">${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Business Health Check Submission - RT Dynamic Business Consulting
      
      COMPANY INFORMATION:
      Company Name: ${formData.companyName}
      Entity Type: ${formData.entityType}
      Industry: ${formData.industry}
      Annual Revenue: ${formData.annualRevenue}
      
      OPERATIONAL DETAILS:
      Has Employees: ${formData.hasEmployees}
      ${formData.employeeCount ? `Employee Count: ${formData.employeeCount}` : ''}
      Manages Stock/Inventory: ${formData.managesStock}
      Deals in Foreign Currency: ${formData.dealsForeignCurrency}
      
      ${formData.taxComplexity ? `
      COMPLIANCE REQUIREMENTS:
      Tax Complexity: ${formData.taxComplexity}
      Audit Requirements: ${formData.auditRequirements}
      Regulatory Reporting: ${formData.regulatoryReporting}
      ` : ''}
      
      GOALS & CHALLENGES:
      Primary Goal: ${formData.primaryGoal}
      Business Challenges: ${formData.businessChallenges}
      
      CONTACT INFORMATION:
      Contact Name: ${formData.contactName}
      Email: ${formData.email}
      Phone: ${formData.phoneNumber}
      
      Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
    `
  };
};

// Send email function
export const sendEmail = async (to, template) => {
  try {
    const params = {
      Source: process.env.FROM_EMAIL || 'contact@rtdynamicbc.com',
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: template.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: template.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: template.text,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    
    console.log('✅ Email sent successfully:', result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Export template functions
export { createContactEmailTemplate, createQuestionnaireEmailTemplate };