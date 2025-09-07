import express from 'express';
import Joi from 'joi';
import { sendEmail, createQuestionnaireEmailTemplate } from '../services/emailService.js';

const router = express.Router();

// Validation schema for questionnaire form
const questionnaireSchema = Joi.object({
  // Step 1: Company Information
  entityType: Joi.string().required().messages({
    'string.empty': 'Entity type is required'
  }),
  annualRevenue: Joi.string().required().messages({
    'string.empty': 'Annual revenue is required'
  }),
  companyName: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Company name is required',
    'string.max': 'Company name must be less than 200 characters'
  }),
  industry: Joi.string().required().messages({
    'string.empty': 'Industry is required'
  }),
  
  // Step 2: Operational Complexity
  hasEmployees: Joi.string().required().messages({
    'string.empty': 'Please specify if you have employees'
  }),
  employeeCount: Joi.string().optional().allow('').default(''),
  managesStock: Joi.string().required().messages({
    'string.empty': 'Please specify if you manage stock/inventory'
  }),
  dealsForeignCurrency: Joi.string().required().messages({
    'string.empty': 'Please specify if you deal in foreign currency'
  }),
  
  // Step 3: Compliance (conditional for Pty Ltd only)
  taxComplexity: Joi.string().optional().allow('').default(''),
  auditRequirements: Joi.string().optional().allow('').default(''),
  regulatoryReporting: Joi.string().optional().allow('').default(''),
  
  // Step 4: Goals & Contact
  primaryGoal: Joi.string().required().messages({
    'string.empty': 'Primary goal is required'
  }),
  businessChallenges: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Please provide details about your business challenges',
    'string.min': 'Please provide more details about your business challenges',
    'string.max': 'Business challenges description must be less than 2000 characters'
  }),
  contactName: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Contact name is required',
    'string.max': 'Contact name must be less than 100 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required'
  }),
  phoneNumber: Joi.string().min(1).max(20).required().messages({
    'string.empty': 'Phone number is required',
    'string.max': 'Phone number must be less than 20 characters'
  })
});

// POST /api/questionnaire - Handle questionnaire submission
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = questionnaireSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const formData = value;
    
    // Log the submission (for debugging)
    console.log('📊 Business Health Check submission received:', {
      companyName: formData.companyName,
      entityType: formData.entityType,
      contactName: formData.contactName,
      email: formData.email,
      primaryGoal: formData.primaryGoal,
      timestamp: new Date().toISOString()
    });

    // Create email template
    const emailTemplate = createQuestionnaireEmailTemplate(formData);
    
    // Send email to business
    const recipientEmail = process.env.BUSINESS_EMAIL || 'contact@rtdynamicbc.co.za';
    await sendEmail(recipientEmail, emailTemplate);

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
      
      try {
        await sendEmail(formData.email, confirmationTemplate);
        console.log('✅ Confirmation email sent to customer');
      } catch (confirmationError) {
        console.error('⚠️ Failed to send confirmation email:', confirmationError.message);
        // Don't fail the main request if confirmation email fails
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Your Business Health Check has been submitted successfully. We will analyze your responses and contact you within 24 hours with customized recommendations.',
      data: {
        companyName: formData.companyName,
        primaryGoal: formData.primaryGoal,
        submissionId: `BHC-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Questionnaire submission error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit questionnaire',
      message: 'We apologize for the inconvenience. Please try again later or contact us directly.'
    });
  }
});

// GET /api/questionnaire/health - Health check for questionnaire service
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Questionnaire API',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

export default router;