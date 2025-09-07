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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 0; 
            background-color: #f3f4f6;
          }
          .email-wrapper { 
            width: 100%; 
            max-width: 800px; 
            margin: 40px auto; 
            background-color: #ffffff;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            border-radius: 16px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            padding: 50px 40px; 
            text-align: center;
          }
          .header h1 { 
            margin: 0 0 16px 0; 
            font-size: 32px; 
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header p { 
            margin: 0 0 20px 0; 
            font-size: 18px; 
            opacity: 0.95;
            font-weight: 300;
          }
          .content { 
            padding: 50px 40px;
            background: #ffffff;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          .field { 
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 28px 24px;
            transition: all 0.3s ease;
            position: relative;
          }
          .field:hover {
            border-color: #10b981;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
          }
          .label { 
            font-weight: 600; 
            color: #059669; 
            margin-bottom: 12px; 
            display: flex;
            align-items: center;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          .label-icon {
            margin-right: 10px;
            font-size: 18px;
          }
          .value { 
            color: #1f2937;
            font-size: 17px;
            font-weight: 500;
            word-break: break-word;
            line-height: 1.5;
          }
          .message-field {
            grid-column: 1 / -1;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 32px 28px;
          }
          .message-content {
            background: white;
            padding: 28px;
            border-radius: 10px;
            border-left: 5px solid #10b981;
            white-space: pre-wrap;
            font-size: 16px;
            line-height: 1.8;
            margin-top: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          .timestamp {
            background: #1f2937;
            color: white;
            padding: 24px 32px;
            text-align: center;
            font-size: 15px;
            margin-top: 40px;
            border-radius: 0 0 16px 16px;
            font-weight: 300;
          }
          .priority-badge {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
          }
          @media (max-width: 600px) {
            .email-wrapper {
              margin: 20px;
              border-radius: 12px;
            }
            .info-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .content {
              padding: 30px 24px;
            }
            .header {
              padding: 40px 24px;
            }
            .field {
              padding: 24px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>🔔 New Contact Form Submission</h1>
            <p>RT Dynamic Business Consulting Website</p>
            <span class="priority-badge">REQUIRES ATTENTION</span>
          </div>
          <div class="content">
            <div class="info-grid">
              <div class="field">
                <div class="label">
                  <span class="label-icon">👤</span>
                  Full Name
                </div>
                <div class="value">${formData.name}</div>
              </div>
              <div class="field">
                <div class="label">
                  <span class="label-icon">📧</span>
                  Email Address
                </div>
                <div class="value">${formData.email}</div>
              </div>
              <div class="field">
                <div class="label">
                  <span class="label-icon">📋</span>
                  Subject
                </div>
                <div class="value">${formData.subject}</div>
              </div>
              <div class="field">
                <div class="label">
                  <span class="label-icon">🕐</span>
                  Submitted At
                </div>
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
              <div class="field message-field">
                <div class="label">
                  <span class="label-icon">💬</span>
                  Message Content
                </div>
                <div class="message-content">${formData.message}</div>
              </div>
            </div>
            <div class="timestamp">
              📨 This email was automatically generated from the RT Dynamic Business Consulting website contact form
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Business Health Check Submission</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 0; 
            background-color: #f3f4f6;
          }
          .email-wrapper { 
            width: 100%; 
            max-width: 900px; 
            margin: 40px auto; 
            background-color: #ffffff;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            border-radius: 16px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            padding: 50px 40px; 
            text-align: center;
          }
          .header h1 { 
            margin: 0 0 16px 0; 
            font-size: 32px; 
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header p { 
            margin: 0 0 20px 0; 
            font-size: 18px; 
            opacity: 0.95;
            font-weight: 300;
          }
          .content { 
            padding: 50px 40px;
            background: #ffffff;
          }
          .section { 
            margin-bottom: 45px;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          }
          .section-header {
            background: linear-gradient(90deg, #f0fdf4, #ecfdf5);
            padding: 28px 32px;
            border-bottom: 1px solid #d1fae5;
          }
          .section-title { 
            font-size: 22px; 
            font-weight: 700; 
            color: #059669; 
            margin: 0;
            display: flex;
            align-items: center;
            letter-spacing: -0.3px;
          }
          .section-icon {
            margin-right: 16px;
            font-size: 26px;
          }
          .section-content {
            padding: 32px;
          }
          .field-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
          }
          .field { 
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px 20px;
            transition: all 0.3s ease;
          }
          .field:hover {
            border-color: #10b981;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
          }
          .label { 
            font-weight: 600; 
            color: #374151; 
            margin-bottom: 12px; 
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          .value { 
            color: #1f2937;
            font-size: 17px;
            font-weight: 500;
            word-break: break-word;
            line-height: 1.5;
          }
          .highlight { 
            background: #ecfdf5 !important; 
            border-color: #10b981 !important;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
          }
          .highlight .value {
            color: #059669;
            font-weight: 600;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          .message-content {
            background: white;
            padding: 28px;
            border-radius: 12px;
            border-left: 5px solid #10b981;
            white-space: pre-wrap;
            font-size: 16px;
            line-height: 1.8;
            margin-top: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          .summary-stats {
            background: linear-gradient(135deg, #1f2937, #374151);
            color: white;
            padding: 40px 32px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 32px;
            margin: 40px 0;
            border-radius: 16px;
          }
          .stat-item {
            text-align: center;
            padding: 16px 0;
          }
          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 8px;
          }
          .stat-label {
            font-size: 15px;
            opacity: 0.85;
            margin-top: 8px;
            font-weight: 300;
          }
          .timestamp {
            background: #1f2937;
            color: white;
            padding: 24px 32px;
            text-align: center;
            font-size: 15px;
            border-radius: 0 0 16px 16px;
            font-weight: 300;
          }
          .priority-badge {
            display: inline-block;
            background: #f59e0b;
            color: white;
            padding: 8px 20px;
            border-radius: 24px;
            font-size: 13px;
            font-weight: 600;
            margin-left: 16px;
            letter-spacing: 0.3px;
          }
          @media (max-width: 768px) {
            .email-wrapper {
              margin: 20px;
              border-radius: 12px;
            }
            .field-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .content {
              padding: 30px 24px;
            }
            .header {
              padding: 40px 24px;
            }
            .section-content {
              padding: 24px;
            }
            .summary-stats {
              grid-template-columns: 1fr;
              padding: 32px 24px;
              gap: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>📊 New Business Health Check Submission</h1>
            <p>RT Dynamic Business Consulting - Questionnaire Response</p>
            <span class="priority-badge">BUSINESS OPPORTUNITY</span>
          </div>
          <div class="content">
            
            <!-- Summary Statistics -->
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-value">${formData.companyName}</div>
                <div class="stat-label">Company Name</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${formData.annualRevenue}</div>
                <div class="stat-label">Annual Revenue</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${formData.industry}</div>
                <div class="stat-label">Industry</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${formData.entityType}</div>
                <div class="stat-label">Entity Type</div>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <div class="section-title">
                  <span class="section-icon">🏢</span>
                  Company Information
                </div>
              </div>
              <div class="section-content">
                <div class="field-grid">
                  <div class="field highlight">
                    <span class="label">Company Name</span>
                    <div class="value">${formData.companyName}</div>
                  </div>
                  <div class="field">
                    <span class="label">Entity Type</span>
                    <div class="value">${formData.entityType}</div>
                  </div>
                  <div class="field">
                    <span class="label">Industry</span>
                    <div class="value">${formData.industry}</div>
                  </div>
                  <div class="field highlight">
                    <span class="label">Annual Revenue</span>
                    <div class="value">${formData.annualRevenue}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <div class="section-title">
                  <span class="section-icon">⚙️</span>
                  Operational Details
                </div>
              </div>
              <div class="section-content">
                <div class="field-grid">
                  <div class="field">
                    <span class="label">Has Employees</span>
                    <div class="value">${formData.hasEmployees}</div>
                  </div>
                  ${formData.employeeCount ? `
                  <div class="field highlight">
                    <span class="label">Employee Count</span>
                    <div class="value">${formData.employeeCount}</div>
                  </div>
                  ` : ''}
                  <div class="field">
                    <span class="label">Manages Stock/Inventory</span>
                    <div class="value">${formData.managesStock}</div>
                  </div>
                  <div class="field">
                    <span class="label">Deals in Foreign Currency</span>
                    <div class="value">${formData.dealsForeignCurrency}</div>
                  </div>
                </div>
              </div>
            </div>

            ${formData.taxComplexity ? `
            <div class="section">
              <div class="section-header">
                <div class="section-title">
                  <span class="section-icon">📋</span>
                  Compliance Requirements
                </div>
              </div>
              <div class="section-content">
                <div class="field-grid">
                  <div class="field">
                    <span class="label">Tax Complexity</span>
                    <div class="value">${formData.taxComplexity}</div>
                  </div>
                  <div class="field">
                    <span class="label">Audit Requirements</span>
                    <div class="value">${formData.auditRequirements}</div>
                  </div>
                  <div class="field">
                    <span class="label">Regulatory Reporting</span>
                    <div class="value">${formData.regulatoryReporting}</div>
                  </div>
                </div>
              </div>
            </div>
            ` : ''}

            <div class="section">
              <div class="section-header">
                <div class="section-title">
                  <span class="section-icon">🎯</span>
                  Goals & Challenges
                </div>
              </div>
              <div class="section-content">
                <div class="field-grid">
                  <div class="field highlight">
                    <span class="label">Primary Goal</span>
                    <div class="value">${formData.primaryGoal}</div>
                  </div>
                  <div class="field full-width">
                    <span class="label">Business Challenges</span>
                    <div class="message-content">${formData.businessChallenges}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <div class="section-title">
                  <span class="section-icon">📞</span>
                  Contact Information
                </div>
              </div>
              <div class="section-content">
                <div class="field-grid">
                  <div class="field highlight">
                    <span class="label">Contact Name</span>
                    <div class="value">${formData.contactName}</div>
                  </div>
                  <div class="field highlight">
                    <span class="label">Email Address</span>
                    <div class="value">${formData.email}</div>
                  </div>
                  <div class="field">
                    <span class="label">Phone Number</span>
                    <div class="value">${formData.phoneNumber}</div>
                  </div>
                  <div class="field">
                    <span class="label">Submitted At</span>
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
            </div>
            
            <div class="timestamp">
              📊 This business health check was automatically generated from the RT Dynamic Business Consulting website questionnaire
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
    // In development mode, simulate email sending if AWS credentials are not properly configured
    if (process.env.NODE_ENV === 'development' && (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'your_aws_access_key_here')) {
      console.log('📧 Development Mode - Email would be sent to:', to);
      console.log('📧 Subject:', template.subject);
      console.log('📧 Email simulation successful');
      return { success: true, messageId: 'dev-simulation-' + Date.now() };
    }

    const params = {
      Source: process.env.FROM_EMAIL || 'contact@rtdynamicbc.co.za',
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
    
    // In development mode, if AWS SES fails, simulate success to prevent blocking
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Development Mode - AWS SES failed, simulating success');
      console.log('📧 Email would be sent to:', to);
      console.log('📧 Subject:', template.subject);
      return { success: true, messageId: 'dev-fallback-' + Date.now() };
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Export template functions
export { createContactEmailTemplate, createQuestionnaireEmailTemplate };