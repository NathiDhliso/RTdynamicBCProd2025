# RT Dynamic Business Consulting - AWS Lambda Backend

This directory contains the serverless backend migration for RT Dynamic Business Consulting, replacing the Express.js backend with AWS Lambda functions and API Gateway while preserving all existing functionality including email calculations and wide grid formatting.

## 🏗️ Architecture Overview

### Current vs New Architecture

**Before (Express.js):**
- Single Express.js server running on EC2/Elastic Beanstalk
- Fixed infrastructure costs (~$20-50/month)
- Manual scaling and maintenance
- Single point of failure

**After (Serverless):**
- AWS Lambda functions for each endpoint
- API Gateway for routing and rate limiting
- Pay-per-request pricing (~$0.20 per 1M requests)
- Auto-scaling and zero maintenance
- High availability and fault tolerance

### Components

```
aws-lambda-backend/
├── functions/
│   ├── contact-handler/          # Contact form processing
│   ├── questionnaire-handler/    # Business health check with calculations
│   └── shared/                   # Shared utilities and email templates
├── infrastructure/
│   └── cloudformation.yaml      # Complete AWS infrastructure
└── deployment/
    ├── deploy.ps1               # Windows PowerShell deployment
    └── deploy.sh                # Unix/Linux/macOS deployment
```

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI v2** - [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. **Node.js 20.0.0+** - [Download](https://nodejs.org/)
3. **AWS Account** with appropriate permissions
4. **Configured AWS credentials** (`aws configure`)

### Deployment

#### Windows (PowerShell)
```powershell
# Navigate to the aws-lambda-backend directory
cd aws-lambda-backend

# Run deployment script
.\deployment\deploy.ps1

# Or with custom parameters
.\deployment\deploy.ps1 -Environment production -BusinessEmail "your-email@domain.com"
```

#### Unix/Linux/macOS (Bash)
```bash
# Navigate to the aws-lambda-backend directory
cd aws-lambda-backend

# Make script executable
chmod +x deployment/deploy.sh

# Run deployment script
./deployment/deploy.sh

# Or with custom parameters
./deployment/deploy.sh --environment production --business-email "your-email@domain.com"
```

## 📋 Deployment Options

### PowerShell Parameters
```powershell
-Environment          # development, staging, production (default: production)
-Region              # AWS region (default: us-east-1)
-BusinessEmail       # Email for receiving forms (default: contact@rtdynamicbc.co.za)
-FromEmail           # From email for SES (default: noreply@rtdynamicbc.co.za)
-SendConfirmation    # Send confirmation emails (default: true)
-SkipInfrastructure  # Skip CloudFormation deployment
-UpdateFunctionsOnly # Only update Lambda function code
```

### Bash Parameters
```bash
-e, --environment          # development, staging, production (default: production)
-r, --region              # AWS region (default: us-east-1)
-b, --business-email      # Email for receiving forms
-f, --from-email          # From email for SES
-c, --send-confirmation   # Send confirmation emails (true/false)
--skip-infrastructure     # Skip CloudFormation deployment
--update-functions-only   # Only update Lambda function code
-h, --help               # Show help message
```

## 🔧 Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build Lambda Functions
```bash
# Contact handler
cd functions/contact-handler
npm install --production
zip -r contact-handler.zip . -x "*.zip"

# Questionnaire handler
cd ../questionnaire-handler
npm install --production
zip -r questionnaire-handler.zip . -x "*.zip"
```

### 2. Deploy Infrastructure
```bash
aws cloudformation create-stack \
  --stack-name rtdbc-backend-production \
  --template-body file://infrastructure/cloudformation.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### 3. Update Lambda Functions
```bash
# Get function names from stack outputs
CONTACT_FUNCTION=$(aws cloudformation describe-stacks \
  --stack-name rtdbc-backend-production \
  --query 'Stacks[0].Outputs[?OutputKey==`ContactHandlerFunctionName`].OutputValue' \
  --output text)

# Update function code
aws lambda update-function-code \
  --function-name $CONTACT_FUNCTION \
  --zip-file fileb://functions/contact-handler/contact-handler.zip
```

## 🎯 Features Preserved

### Email Templates
- ✅ Exact HTML structure and CSS preserved
- ✅ Wide grid layout (1400px max-width) maintained
- ✅ Responsive design for mobile devices
- ✅ All styling, animations, and branding intact
- ✅ Email icons and visual elements preserved

### Business Logic
- ✅ Complete quote calculation system
- ✅ All complexity modifiers and factors
- ✅ Revenue-based pricing tiers
- ✅ Payroll cost calculations
- ✅ Industry-specific adjustments
- ✅ Entity type-specific base pricing

### Validation & Security
- ✅ All form validation rules preserved
- ✅ Input sanitization and XSS protection
- ✅ Rate limiting via API Gateway
- ✅ CORS configuration
- ✅ Spam detection and filtering

### Email Processing
- ✅ Async email sending (non-blocking)
- ✅ Business notification emails
- ✅ Customer confirmation emails
- ✅ Error handling and retry logic
- ✅ South African timezone formatting

## 🔍 Testing

The deployment script automatically tests both endpoints:

### Contact Form Test
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "subject": "Test Subject",
  "message": "This is a test message from the deployment script."
}
```

### Questionnaire Test
```json
{
  "entityType": "Private Company (Pty Ltd)",
  "annualRevenue": "R1,000,001 - R5,000,000",
  "companyName": "Test Company (Pty) Ltd",
  "industry": "Information Technology",
  "hasEmployees": "Yes",
  "employeeCount": "6-20",
  "managesStock": "No",
  "dealsForeignCurrency": "No",
  "taxComplexity": "Moderate",
  "auditRequirements": "Not Required",
  "regulatoryReporting": "Standard",
  "primaryGoal": "Improve Financial Management",
  "businessChallenges": "We need better financial reporting and tax compliance support for our growing IT company.",
  "contactName": "Test Contact",
  "email": "test@example.com",
  "phoneNumber": "+27123456789"
}
```

## 📊 API Endpoints

After deployment, you'll get these endpoints:

### Contact Form
```
POST https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/api/contact
```

### Business Health Check
```
POST https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/api/questionnaire
```

### CORS Support
Both endpoints support OPTIONS requests for CORS preflight.

## 🔐 Security & Permissions

### IAM Permissions Required
- CloudFormation: Full access for stack management
- Lambda: Function creation, update, and execution
- API Gateway: API creation and management
- SES: Email sending permissions
- CloudWatch: Logging and monitoring
- IAM: Role and policy management

### SES Configuration
Before sending emails, verify your domain/email addresses in SES:

```bash
# Verify email address
aws ses verify-email-identity --email-address contact@rtdynamicbc.co.za

# Verify domain (recommended for production)
aws ses verify-domain-identity --domain rtdynamicbc.co.za
```

## 📈 Monitoring & Logging

### CloudWatch Logs
- `/aws/lambda/rtdbc-contact-handler-{environment}`
- `/aws/lambda/rtdbc-questionnaire-handler-{environment}`
- `/aws/apigateway/rtdbc-api-{environment}`

### CloudWatch Alarms
- Function error rates > 5 errors in 10 minutes
- Function duration monitoring
- API Gateway 4xx/5xx error rates

### Metrics to Monitor
- Lambda invocation count
- Lambda duration and memory usage
- API Gateway request count and latency
- SES email delivery success/failure rates

## 💰 Cost Optimization

### Estimated Costs (Monthly)

**Current Express.js Backend:**
- EC2/Elastic Beanstalk: $20-50/month
- Fixed costs regardless of usage

**New Serverless Backend:**
- API Gateway: $3.50 per million requests
- Lambda: $0.20 per million requests
- CloudWatch Logs: ~$0.50/GB
- **Total for 10K requests/month: ~$0.50**
- **Savings: 90-95%**

### Cost Breakdown
```
Component                 | Cost per Million Requests
--------------------------|-------------------------
API Gateway              | $3.50
Lambda Requests          | $0.20
Lambda Duration (avg)    | $0.83
CloudWatch Logs          | $0.50
SES Emails (1K emails)   | $0.10
--------------------------|-------------------------
Total                    | ~$5.13 per million
```

## 🔄 Migration Strategy

### Blue-Green Deployment
1. Deploy Lambda backend alongside existing Express.js
2. Test thoroughly with subset of traffic
3. Update frontend to use new endpoints
4. Monitor for 48 hours
5. Decommission Express.js backend

### Rollback Plan
- Keep Express.js backend running during initial phase
- DNS/Load balancer can route traffic back instantly
- CloudFormation stack can be deleted to clean up resources
- 5-minute rollback time target

## 🛠️ Development

### Local Testing
```bash
# Install dependencies
cd functions/contact-handler
npm install

# Run tests (if implemented)
npm test

# Local development with SAM CLI (optional)
sam local start-api
```

### Environment Variables
```bash
SES_REGION=us-east-1
BUSINESS_EMAIL=contact@rtdynamicbc.co.za
FROM_EMAIL=noreply@rtdynamicbc.co.za
SEND_CONFIRMATION=true
NODE_ENV=production
```

## 🚨 Troubleshooting

### Common Issues

**1. SES Email Sending Fails**
```bash
# Check SES sending statistics
aws ses get-send-statistics

# Verify email addresses
aws ses list-verified-email-addresses
```

**2. Lambda Function Timeout**
- Increase timeout in CloudFormation template
- Check CloudWatch logs for performance bottlenecks
- Optimize email template rendering

**3. API Gateway CORS Issues**
- Verify CORS headers in Lambda response
- Check API Gateway CORS configuration
- Test with browser developer tools

**4. CloudFormation Stack Update Fails**
```bash
# Check stack events
aws cloudformation describe-stack-events --stack-name rtdbc-backend-production

# Cancel update if stuck
aws cloudformation cancel-update-stack --stack-name rtdbc-backend-production
```

### Debug Commands
```bash
# View Lambda logs
aws logs tail /aws/lambda/rtdbc-contact-handler-production --follow

# Test Lambda function directly
aws lambda invoke \
  --function-name rtdbc-contact-handler-production \
  --payload file://test-payload.json \
  response.json

# Check API Gateway logs
aws logs tail /aws/apigateway/rtdbc-api-production --follow
```

## 📚 Additional Resources

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/)
- [API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/)
- [SES Developer Guide](https://docs.aws.amazon.com/ses/latest/dg/)
- [CloudFormation User Guide](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/)

## 🤝 Support

For issues or questions:
1. Check CloudWatch logs first
2. Review this README and troubleshooting section
3. Check AWS service status pages
4. Contact the development team

---

**Migration Benefits Summary:**
- ✅ 90-95% cost reduction
- ✅ Zero server maintenance
- ✅ Auto-scaling capabilities
- ✅ High availability (99.9%+)
- ✅ All functionality preserved
- ✅ Enhanced security and monitoring
- ✅ Faster deployment cycles