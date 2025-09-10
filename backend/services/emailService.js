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
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.05" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
            background-size: cover;
            opacity: 0.3;
          }
          .header h1 { 
            margin: 0 0 16px 0; 
            font-size: 36px; 
            font-weight: 300;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
          }
          .header .company-name {
            font-weight: 600;
            color: #6eb5ff;
          }
          .header p { 
            margin: 0 0 24px 0; 
            font-size: 18px; 
            opacity: 0.9;
            font-weight: 300;
            position: relative;
            z-index: 1;
          }
          .content { 
            padding: 60px 50px;
            background: #ffffff;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
            margin-bottom: 48px;
          }
          .field { 
            background: linear-gradient(145deg, #f8f9fb, #ffffff);
            border: 1px solid #e5e8ed;
            border-radius: 10px;
            padding: 32px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          .field::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #4a5f7a, #6eb5ff);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .field:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(26, 35, 50, 0.12);
            border-color: #4a5f7a;
          }
          .field:hover::before {
            opacity: 1;
          }
          .label { 
            font-weight: 500; 
            color: #4a5f7a; 
            margin-bottom: 12px; 
            display: flex;
            align-items: center;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .label-icon {
            margin-right: 12px;
            font-size: 20px;
            background: linear-gradient(135deg, #4a5f7a, #6eb5ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .value { 
            color: #1a2332;
            font-size: 18px;
            font-weight: 400;
            word-break: break-word;
            line-height: 1.6;
          }
          .message-field {
            grid-column: 1 / -1;
            background: linear-gradient(145deg, #f4f7fb, #ffffff);
            border: 1px solid #d5dae3;
            padding: 40px;
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
            box-shadow: 0 4px 12px rgba(26, 35, 50, 0.06);
            color: #2d3e5a;
          }
          .timestamp {
            background: linear-gradient(135deg, #1a2332, #2d3e5a);
            color: white;
            padding: 28px 40px;
            text-align: center;
            font-size: 14px;
            font-weight: 300;
            letter-spacing: 0.5px;
            opacity: 0.95;
          }
          .priority-badge {
            display: inline-block;
            background: linear-gradient(135deg, #6eb5ff, #4a5f7a);
            color: white;
            padding: 8px 24px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 16px;
            box-shadow: 0 4px 12px rgba(110, 181, 255, 0.3);
            position: relative;
            z-index: 1;
          }
          @media (max-width: 768px) {
            .email-wrapper {
              margin: 20px;
              max-width: 100%;
            }
            .info-grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            .content {
              padding: 40px 30px;
            }
            .header {
              padding: 50px 30px;
            }
            .field {
              padding: 28px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p><span class="company-name">RT Dynamic Business Consulting</span> Website</p>
            <span class="priority-badge">Requires Attention</span>
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
              This email was automatically generated from the RT Dynamic Business Consulting website contact form
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
            max-width: 1400px; 
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
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.05" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
            background-size: cover;
            opacity: 0.3;
          }
          .header h1 { 
            margin: 0 0 16px 0; 
            font-size: 36px; 
            font-weight: 300;
            letter-spacing: -0.5px;
    _BOS_        position: relative;
            z-index: 1;
          }
          .header .company-name {
            font-weight: 600;
            color: #6eb5ff;
          }
          .header p { 
            margin: 0 0 24px 0; 
            font-size: 18px; 
            opacity: 0.9;
            font-weight: 300;
            position: relative;
            z-index: 1;
          }
          .content { 
            padding: 60px 50px;
            background: #ffffff;
          }
          .section { 
            margin-bottom: 48px;
            border: 1px solid #e5e8ed;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(26, 35, 50, 0.06);
            transition: all 0.3s ease;
          }
          .section:hover {
            box-shadow: 0 8px 32px rgba(26, 35, 50, 0.1);
          }
          .section-header {
            background: linear-gradient(90deg, #f8f9fb, #f0f2f5);
            padding: 32px 40px;
            border-bottom: 2px solid #e5e8ed;
            position: relative;
          }
          .section-header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100px;
            height: 2px;
            background: linear-gradient(90deg, #4a5f7a, #6eb5ff);
          }
          .section-title { 
            font-size: 24px; 
            font-weight: 600; 
            color: #1a2332; 
            margin: 0;
            display: flex;
            align-items: center;
            letter-spacing: -0.5px;
          }
          .section-icon {
            margin-right: 16px;
            font-size: 28px;
            background: linear-gradient(135deg, #4a5f7a, #6eb5ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .section-content {
            padding: 40px;
          }
          .field-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
          .field-grid-2 {
            grid-template-columns: repeat(2, 1fr);
          }
          .field { 
            background: linear-gradient(145deg, #f8f9fb, #ffffff);
            border: 1px solid #e5e8ed;
            border-radius: 10px;
            padding: 28px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          .field::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #4a5f7a, #6eb5ff);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .field:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(26, 35, 50, 0.12);
            border-color: #4a5f7a;
          }
          .field:hover::before {
            opacity: 1;
          }
          .label { 
            font-weight: 500; 
            color: #4a5f7a; 
            margin-bottom: 12px; 
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .value { 
            color: #1a2332;
            font-size: 17px;
            font-weight: 400;
            word-break: break-word;
            line-height: 1.6;
          }
          .highlight { 
            background: linear-gradient(145deg, #f0f7ff, #ffffff) !important; 
            border-color: #6eb5ff !important;
            box-shadow: 0 4px 16px rgba(110, 181, 255, 0.15);
          }
          .highlight .value {
            color: #2d3e5a;
            font-weight: 500;
          }
          .full-width {
            grid-column: 1 / -1;
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
            box-shadow: 0 4px 12px rgba(26, 35, 50, 0.06);
            color: #2d3e5a;
          }
          .summary-stats {
            background: linear-gradient(135deg, #1a2332, #2d3e5a);
            color: white;
            padding: 48px 40px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 40px;
            margin: 48px 0;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(26, 35, 50, 0.15);
            position: relative;
            overflow: hidden;
          }
          .summary-stats::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.03" d="M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,112C960,96,1056,96,1152,106.7C1248,117,1344,139,1392,149.3L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>') no-repeat;
            background-size: cover;
          }
          .stat-item {
            text-align: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
          }
          .stat-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-4px);
          }
          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #6eb5ff;
            margin-bottom: 12px;
            display: block;
          }
          .stat-label {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 8px;
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .timestamp {
            background: linear-gradient(135deg, #1a2332, #2d3e5a);
            color: white;
            padding: 28px 40px;
            text-align: center;
            font-size: 14px;
            font-weight: 300;
            letter-spacing: 0.5px;
            opacity: 0.95;
          }
          .priority-badge {
            display: inline-block;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: white;
            padding: 8px 24px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 16px;
            box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
            position: relative;
            z-index: 1;
          }
          @media (max-width: 1024px) {
            .field-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .summary-stats {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 768px) {
            .email-wrapper {
              margin: 20px;
              max-width: 100%;
            }
            .field-grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            .content {
              padding: 40px 30px;
            }
            .header {
              padding: 50px 30px;
            }
            .section-content {
              padding: 30px;
            }
            .summary-stats {
              grid-template-columns: 1fr;
              padding: 40px 30px;
              gap: 28px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>📊 New Business Health Check Submission</h1>
            <p><span class="company-name">RT Dynamic Business Consulting</span> - Questionnaire Response</p>
            <span class="priority-badge">Business Opportunity</span>
          </div>
          <div class="content">
            
            <!-- Summary Statistics -->
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-value">${formData.companyName}</span>
                <div class="stat-label">Company Name</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">${formData.annualRevenue}</span>
                <div class="stat-label">Annual Revenue</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">${formData.industry}</span>
                <div class="stat-label">Industry</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">${formData.entityType}</span>
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
                <div class="field-grid field-grid-2">
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
                <div class="field-grid field-grid-2">
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

            ${formData.quoteDetails ? `
            <div class="section">
              <div class="section-header">
                <div class="section-title">
                  <span class="section-icon">💰</span>
                  Estimated Quote (Internal Use Only)
                </div>
              </div>
              <div class="section-content">
                <div class="field-grid">
                  <div class="field highlight">
                    <span class="label">Monthly Quote</span>
                    <div class="value">R${formData.quoteDetails.quote.toLocaleString()}</div>
                  </div>
                  <div class="field">
                    <span class="label">Base Services</span>
                    <div class="value">R${formData.quoteDetails.basePrice.toLocaleString()}</div>
                  </div>
                  <div class="field">
                    <span class="label">Revenue Multiplier</span>
                    <div class="value">${formData.quoteDetails.revenueModifier}x</div>
                  </div>
                  <div class="field">
                    <span class="label">Complexity Multiplier</span>
                    <div class="value">${formData.quoteDetails.complexityModifier}x</div>
                  </div>
                  ${formData.quoteDetails.payrollCost > 0 ? `
                  <div class="field">
                    <span class="label">Payroll Cost</span>
                    <div class="value">R${formData.quoteDetails.payrollCost.toLocaleString()}</div>
                  </div>` : ''}
                  <div class="field full-width">
                    <span class="label">Complexity Factors</span>
                    <div class="value">${formData.quoteDetails.complexityFactors && formData.quoteDetails.complexityFactors.length > 0 ? formData.quoteDetails.complexityFactors.join(', ') : 'No additional complexity factors'}</div>
                  </div>
                </div>
              </div>
            </div>
            ` : ''}

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
                  <div class="field full-width">
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
              This email was automatically generated from the RT Dynamic Business Consulting website questionnaire
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Business Health Check Submission - ${formData.companyName}
      
      == Company Information ==
      Company Name: ${formData.companyName}
      Entity Type: ${formData.entityType}
      Industry: ${formData.industry}
      Annual Revenue: ${formData.annualRevenue}
      
      == Operational Details ==
      Has Employees: ${formData.hasEmployees}
      ${formData.employeeCount ? `Employee Count: ${formData.employeeCount}` : ''}
      Manages Stock: ${formData.managesStock}
      Deals in Foreign Currency: ${formData.dealsForeignCurrency}
      
      ${formData.taxComplexity ? `
      == Compliance Requirements ==
      Tax Complexity: ${formData.taxComplexity}
      Audit Requirements: ${formData.auditRequirements}
      Regulatory Reporting: ${formData.regulatoryReporting}
      ` : ''}
      
      == Goals & Challenges ==
      Primary Goal: ${formData.primaryGoal}
      Business Challenges: ${formData.businessChallenges}
      
      ${formData.quoteDetails ? `
      == Estimated Quote (Internal Use Only) ==
      Monthly Quote: R${formData.quoteDetails.quote.toLocaleString()}
      Base Services: R${formData.quoteDetails.basePrice.toLocaleString()}
      Revenue Multiplier: ${formData.quoteDetails.revenueModifier}x
      Complexity Multiplier: ${formData.quoteDetails.complexityModifier}x
      ${formData.quoteDetails.payrollCost > 0 ? `Payroll Cost: R${formData.quoteDetails.payrollCost.toLocaleString()}` : ''}
      Complexity Factors: ${formData.quoteDetails.complexityFactors && formData.quoteDetails.complexityFactors.length > 0 ? formData.quoteDetails.complexityFactors.join(', ') : 'No additional complexity factors'}
      ` : ''}
      
      == Contact Information ==
      Contact Name: ${formData.contactName}
      Email: ${formData.email}
      Phone Number: ${formData.phoneNumber}
      
      Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
    `
  };
};

/**
 * Sends an email using the configured SES client.
 * @param {object} params - The email parameters.
 * @param {string} params.to - The recipient's email address.
 * @param {string} params.from - The sender's email address.
 * @param {string} params.subject - The email subject.
 * @param {string} params.html - The HTML body of the email.
 * @param {string} params.text - The plain text body of the email.
 * @returns {Promise<object>} The response from the SES send command.
 */
const sendEmail = async ({ to, from, subject, html, text }) => {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: text,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: from,
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log('Email sent successfully:', data.MessageId);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Export the functions for use in other modules
export { createContactEmailTemplate, createQuestionnaireEmailTemplate, sendEmail };

/**
 * AWS Lambda handler function to process incoming requests and send emails.
 * Expects a POST request with a JSON body containing 'formType' and form data.
 * @param {object} event - The API Gateway event object.
 * @returns {Promise<object>} A response object with statusCode, headers, and body.
 */
export const handler = async (event) => {
  // CORS headers to allow requests from any origin.
  // This is important for web applications calling this function from a browser.
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request for CORS.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight check successful' }),
    };
  }

  try {
    // Parse the incoming request body
    const body = JSON.parse(event.body);
    const { formType, ...formData } = body;

    // Basic validation to ensure required fields are present
    if (!formType || !formData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'formType and formData are required.' }),
      };
    }

    let emailTemplate;

    // Select the appropriate email template based on the formType
    if (formType === 'contact') {
      emailTemplate = createContactEmailTemplate(formData);
    } else if (formType === 'questionnaire') {
      emailTemplate = createQuestionnaireEmailTemplate(formData);
    } else {
      // If the formType is not recognized, return a client error
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid formType specified.' }),
      };
    }

    const { subject, html, text } = emailTemplate;

    // Send the email using the helper function.
    // The recipient and sender emails are fetched from environment variables for security.
    await sendEmail({
      to: process.env.RECIPIENT_EMAIL,
      from: process.env.SENDER_EMAIL,
      subject,
      html,
      text,
    });

    // Return a success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };
  } catch (error) {
    // Log the error for debugging and return a server error response
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send email.', details: error.message }),
    };
  }
};
