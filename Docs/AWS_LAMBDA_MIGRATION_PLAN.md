# AWS Lambda Migration Plan for RT Dynamic Business Consulting Backend

## Executive Summary

This document outlines the complete migration strategy from the current Express.js backend to a serverless architecture using AWS Lambda and SES, while preserving all existing email calculations and wide grid formatting functionality.

## Current Architecture Analysis

### Existing Components
- **Express.js Server**: Running on port 3001 with CORS, helmet, rate limiting
- **Email Service**: AWS SES integration with rich HTML templates
- **Contact Route**: Form validation with Joi, async email processing
- **Questionnaire Route**: Complex business logic with quote calculations
- **Email Templates**: Sophisticated HTML with wide grid layouts and responsive design

### Key Features to Preserve
- Rich HTML email templates with wide grid format (1400px max-width)
- Business quote calculations and complexity modifiers
- Async email processing (business + customer confirmation emails)
- Form validation with detailed error messages
- Rate limiting and security features
- Health check endpoints

## Proposed Lambda Architecture

### Lambda Functions Structure

```
aws-lambda-backend/
├── functions/
│   ├── contact-handler/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── validation.js
│   ├── questionnaire-handler/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── validation.js
│   │   └── calculations.js
│   └── shared/
│       ├── email-service.js
│       ├── email-templates.js
│       └── utils.js
├── infrastructure/
│   ├── cloudformation.yaml
│   ├── api-gateway.yaml
│   └── iam-policies.json
└── deployment/
    ├── deploy.sh
    ├── package-functions.sh
    └── update-api.sh
```

### Function Specifications

#### 1. Contact Handler Lambda
- **Runtime**: Node.js 20.x
- **Memory**: 256 MB
- **Timeout**: 30 seconds
- **Trigger**: API Gateway POST /contact
- **Environment Variables**: SES_REGION, BUSINESS_EMAIL, SEND_CONFIRMATION
- **IAM Permissions**: SES:SendEmail, CloudWatch Logs

#### 2. Questionnaire Handler Lambda
- **Runtime**: Node.js 20.x
- **Memory**: 512 MB (for complex calculations)
- **Timeout**: 45 seconds
- **Trigger**: API Gateway POST /questionnaire
- **Environment Variables**: SES_REGION, BUSINESS_EMAIL, SEND_CONFIRMATION
- **IAM Permissions**: SES:SendEmail, CloudWatch Logs

### API Gateway Configuration

```yaml
Endpoints:
  - POST /api/contact
    - CORS enabled
    - Request validation
    - Rate limiting (100 req/15min per IP)
    - Lambda proxy integration
  
  - POST /api/questionnaire
    - CORS enabled
    - Request validation
    - Rate limiting (50 req/15min per IP)
    - Lambda proxy integration
  
  - GET /health
    - Simple health check
    - No authentication required
```

## Migration Benefits

### Cost Optimization
- **Current**: Fixed EC2/Elastic Beanstalk costs (~$20-50/month)
- **Lambda**: Pay-per-request (~$0.20 per 1M requests)
- **Estimated Savings**: 60-80% for typical traffic volumes

### Scalability
- **Auto-scaling**: Handle traffic spikes automatically
- **No cold start issues**: Email processing is async
- **Regional availability**: Deploy in multiple regions

### Maintenance
- **No server management**: AWS handles infrastructure
- **Automatic updates**: Runtime and security patches
- **Built-in monitoring**: CloudWatch integration

## Implementation Phases

### Phase 1: Infrastructure Setup (Week 1)
1. Create AWS Lambda functions
2. Set up API Gateway
3. Configure IAM roles and policies
4. Set up CloudWatch monitoring

### Phase 2: Core Migration (Week 2)
1. Migrate email service and templates
2. Implement contact form handler
3. Implement questionnaire handler with calculations
4. Preserve all existing validation logic

### Phase 3: Testing & Deployment (Week 3)
1. Unit testing for all functions
2. Integration testing with frontend
3. Load testing for performance
4. Blue-green deployment strategy

### Phase 4: Frontend Updates (Week 4)
1. Update API endpoints in frontend
2. Update CORS configuration
3. Test end-to-end functionality
4. Monitor and optimize

## Technical Specifications

### Email Template Preservation
- Maintain exact HTML structure and CSS
- Preserve wide grid layout (1400px max-width)
- Keep responsive design for mobile
- Maintain all styling and animations
- Preserve email icons and branding

### Quote Calculation Logic
- Migrate all business logic intact
- Preserve complexity modifiers
- Maintain revenue-based pricing
- Keep payroll cost calculations
- Preserve base service pricing

### Security Features
- API Gateway rate limiting
- Request validation at gateway level
- Lambda function input sanitization
- SES email validation
- CloudWatch security monitoring

## Environment Configuration

### Lambda Environment Variables
```bash
# Shared across functions
SES_REGION=us-east-1
BUSINESS_EMAIL=contact@rtdynamicbc.co.za
SEND_CONFIRMATION=true
NODE_ENV=production

# API Gateway specific
CORS_ORIGINS=https://www.rtdynamicbc.co.za,https://rtdynamicbc.co.za
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900
```

### IAM Policy Requirements
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Monitoring & Observability

### CloudWatch Metrics
- Function duration and memory usage
- Error rates and success rates
- Email delivery success/failure
- API Gateway request counts
- Rate limiting violations

### Alerting
- Email delivery failures
- Function errors > 1%
- High latency (> 10 seconds)
- Rate limit breaches

## Rollback Strategy

### Blue-Green Deployment
1. Deploy Lambda functions to staging
2. Test with subset of traffic
3. Gradually shift traffic to Lambda
4. Keep Express.js backend as fallback
5. Monitor for 48 hours before full cutover

### Emergency Rollback
- API Gateway traffic routing
- DNS failover to Express.js backend
- Automated rollback triggers
- 5-minute rollback time target

## Success Metrics

### Performance
- Email delivery time < 5 seconds
- API response time < 2 seconds
- 99.9% uptime target
- Zero data loss during migration

### Cost
- 60%+ reduction in infrastructure costs
- Predictable scaling costs
- No idle resource costs

### Reliability
- Maintain current email delivery rates
- Preserve all business logic accuracy
- Zero functionality regression

## Next Steps

1. **Approval**: Review and approve migration plan
2. **AWS Setup**: Configure AWS account and permissions
3. **Development**: Begin Lambda function development
4. **Testing**: Set up comprehensive testing pipeline
5. **Deployment**: Execute phased rollout plan

This migration will modernize the backend infrastructure while preserving all existing functionality, particularly the sophisticated email templates and business calculation logic that are core to the RT Dynamic Business Consulting platform.