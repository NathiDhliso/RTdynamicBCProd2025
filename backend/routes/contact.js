import express from 'express';
import Joi from 'joi';
import { sendEmail, createContactEmailTemplate } from '../services/emailService.js';

const router = express.Router();

// Validation schema for contact form
const contactSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.max': 'Name must be less than 100 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required'
  }),
  subject: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Subject is required',
    'string.max': 'Subject must be less than 200 characters'
  }),
  message: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 10 characters long',
    'string.max': 'Message must be less than 2000 characters'
  })
});

// POST /api/contact - Handle contact form submission
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = contactSchema.validate(req.body);
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
    console.log('📧 Contact form submission received:', {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      timestamp: new Date().toISOString()
    });

    // For local development, skip email sending to avoid AWS SES errors
    if (process.env.NODE_ENV === 'production') {
      // Create email template
      const emailTemplate = createContactEmailTemplate(formData);
      
      // Send email to business
      const recipientEmail = process.env.BUSINESS_EMAIL || 'contact@rtdynamicbc.co.za';
      await sendEmail(recipientEmail, emailTemplate);

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
      
      try {
        await sendEmail(formData.email, confirmationTemplate);
        console.log('✅ Confirmation email sent to customer');
      } catch (confirmationError) {
        console.error('⚠️ Failed to send confirmation email:', confirmationError.message);
        // Don't fail the main request if confirmation email fails
      }
    }
    } else {
      // Development mode - just log the form data without sending emails
      console.log('📝 Contact form submission (development mode):', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will respond within 24 hours.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: 'We apologize for the inconvenience. Please try again later or contact us directly.'
    });
  }
});

// GET /api/contact - Handle GET requests to contact endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Contact API endpoint is available',
    methods: ['POST', 'OPTIONS'],
    description: 'Use POST method to submit contact form data',
    timestamp: new Date().toISOString()
  });
});

// OPTIONS /api/contact - Handle preflight requests
router.options('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// GET /api/contact/health - Health check for contact service
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Contact API',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

export default router;