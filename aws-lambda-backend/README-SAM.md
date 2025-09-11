# RT Dynamic Business Consulting - SAM Deployment Guide

This guide covers deploying the RT Dynamic backend using AWS SAM (Serverless Application Model) for a more streamlined serverless development experience.

## 🚀 Why SAM?

**SAM Benefits over raw CloudFormation:**
- ✅ Simplified serverless syntax
- ✅ Built-in local testing capabilities
- ✅ Automatic API Gateway integration
- ✅ Hot reloading for development
- ✅ Built-in best practices
- ✅ Easy rollbacks and monitoring

## 📋 Prerequisites

### 1. Install SAM CLI

**Windows:**
```powershell
# Using Chocolatey
choco install aws-sam-cli

# Or download MSI from:
# https://github.com/aws/aws-sam-cli/releases/latest
```

**macOS:**
```bash
brew install aws-sam-cli
```

**Linux:**
```bash
# Download and install
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install
```

### 2. Verify Installation
```bash
sam --version
# Should show: SAM CLI, version 1.x.x

aws --version
# Should show: aws-cli/2.x.x

node --version
# Should show: v20.x.x or higher
```

### 3. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format
```

## 🛠️ Project Structure

```
aws-lambda-backend/
├── template.yaml              # SAM template (replaces CloudFormation)
├── samconfig.toml            # SAM configuration
├── deploy-sam.ps1            # SAM deployment script
├── env.json                  # Local environment variables (auto-generated)
├── functions/
│   ├── contact-handler/
│   │   ├── index.js
│   │   ├── validation.js
│   │   └── package.json
│   ├── questionnaire-handler/
│   │   ├── index.js
│   │   ├── validation.js
│   │   ├── calculations.js
│   │   └── package.json
│   └── shared/
│       ├── utils.js
│       └── email-templates.js
└── .aws-sam/                 # SAM build artifacts (auto-generated)
```

## 🚀 Quick Start

### 1. Deploy to Production
```powershell
# Navigate to aws-lambda-backend directory
cd aws-lambda-backend

# Deploy with default settings
.\deploy-sam.ps1

# Or with custom parameters
.\deploy-sam.ps1 -Environment production -BusinessEmail "your-email@domain.com"
```

### 2. Deploy to Development
```powershell
.\deploy-sam.ps1 -Environment development
```

### 3. Local Testing
```powershell
# Start local API server
.\deploy-sam.ps1 -LocalTest

# API will be available at http://localhost:3000
# Test endpoints:
# POST http://localhost:3000/api/contact
# POST http://localhost:3000/api/questionnaire
```

## 📝 SAM Commands

### Build and Validate
```bash
# Validate template
sam validate

# Build application
sam build

# Build and deploy
sam build && sam deploy
```

### Local Development
```bash
# Start local API
sam local start-api

# Start local API with environment variables
sam local start-api --env-vars env.json

# Invoke function locally
sam local invoke ContactHandlerFunction --event events/contact-event.json

# Generate sample events
sam local generate-event apigateway aws-proxy > events/contact-event.json
```

### Monitoring and Logs
```bash
# Tail logs for all functions
sam logs --stack-name rtdbc-backend --tail

# Tail logs for specific function
sam logs --stack-name rtdbc-backend --name ContactHandlerFunction --tail

# View recent logs
sam logs --stack-name rtdbc-backend --start-time '10min ago'
```

### Deployment Management
```bash
# Deploy with guided prompts
sam deploy --guided

# Deploy to specific environment
sam deploy --config-env development

# Delete stack
sam delete --stack-name rtdbc-backend
```

## ⚙️ Configuration

### Environment-Specific Deployments

The `samconfig.toml` file contains configurations for different environments:

```toml
# Production (default)
[default.deploy.parameters]
stack_name = "rtdbc-backend"
parameter_overrides = [
    "Environment=production",
    "BusinessEmail=contact@rtdynamicbc.co.za"
]

# Development
[development.deploy.parameters]
stack_name = "rtdbc-backend-dev"
parameter_overrides = [
    "Environment=development",
    "BusinessEmail=contact@rtdynamicbc.co.za"
]
```

### Custom Parameters

You can override parameters during deployment:

```bash
sam deploy --parameter-overrides \
    Environment=staging \
    BusinessEmail=staging@rtdynamicbc.co.za \
    SendConfirmation=false
```

## 🧪 Testing

### Local Testing

1. **Start Local API:**
   ```bash
   sam local start-api
   ```

2. **Test Contact Form:**
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "subject": "Test Subject",
       "message": "This is a test message."
     }'
   ```

3. **Test Questionnaire:**
   ```bash
   curl -X POST http://localhost:3000/api/questionnaire \
     -H "Content-Type: application/json" \
     -d @test-data/questionnaire-test.json
   ```

### Create Test Events

```bash
# Generate API Gateway event
sam local generate-event apigateway aws-proxy \
    --body '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test message"}' \
    --path "/api/contact" \
    --method POST > events/contact-test.json

# Test with generated event
sam local invoke ContactHandlerFunction --event events/contact-test.json
```

## 🔍 Debugging

### Debug Locally

```bash
# Start API with debug mode
sam local start-api --debug

# Invoke function with debug
sam local invoke ContactHandlerFunction --event events/contact-test.json --debug
```

### View CloudWatch Logs

```bash
# Real-time logs
sam logs --stack-name rtdbc-backend --tail

# Filter logs
sam logs --stack-name rtdbc-backend --filter "ERROR"

# Logs from specific time
sam logs --stack-name rtdbc-backend --start-time "2024-01-01T00:00:00"
```

## 🚀 Deployment Strategies

### Blue-Green Deployment

```bash
# Deploy to staging first
sam deploy --config-env staging

# Test staging environment
# ... run tests ...

# Deploy to production
sam deploy --config-env default
```

### Canary Deployment

Add to your `template.yaml`:

```yaml
Globals:
  Function:
    AutoPublishAlias: live
    DeploymentPreference:
      Type: Canary10Percent5Minutes
      Alarms:
        - !Ref ContactHandlerErrorAlarm
        - !Ref QuestionnaireHandlerErrorAlarm
```

### Rollback

```bash
# List deployments
aws cloudformation describe-stack-events --stack-name rtdbc-backend

# Rollback to previous version
aws cloudformation cancel-update-stack --stack-name rtdbc-backend

# Or delete and redeploy previous version
sam delete --stack-name rtdbc-backend
# Then redeploy from git history
```

## 📊 Monitoring

### CloudWatch Integration

SAM automatically creates:
- CloudWatch Log Groups for each function
- CloudWatch Alarms for errors
- X-Ray tracing (if enabled)
- API Gateway metrics

### Custom Metrics

Add to your Lambda functions:

```javascript
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// Custom metric
const params = {
    Namespace: 'RTDynamic/ContactForm',
    MetricData: [{
        MetricName: 'SubmissionCount',
        Value: 1,
        Unit: 'Count'
    }]
};

await cloudwatch.putMetricData(params).promise();
```

## 🔧 Advanced Features

### Environment Variables

```yaml
# In template.yaml
Globals:
  Function:
    Environment:
      Variables:
        LOG_LEVEL: INFO
        POWERTOOLS_SERVICE_NAME: rtdynamic
```

### Layers

```yaml
# Shared dependencies layer
SharedLayer:
  Type: AWS::Serverless::LayerVersion
  Properties:
    LayerName: rtdynamic-shared
    ContentUri: layers/shared/
    CompatibleRuntimes:
      - nodejs20.x

# Use in functions
ContactHandlerFunction:
  Type: AWS::Serverless::Function
  Properties:
    Layers:
      - !Ref SharedLayer
```

### Custom Domains

```yaml
# Add to template.yaml
RTDynamicApi:
  Type: AWS::Serverless::Api
  Properties:
    Domain:
      DomainName: api.rtdynamicbc.co.za
      CertificateArn: !Ref SSLCertificate
      Route53:
        HostedZoneId: !Ref HostedZone
```

## 🛠️ Troubleshooting

### Common Issues

**1. SAM CLI Not Found**
```bash
# Reinstall SAM CLI
pip install aws-sam-cli
# Or use package manager specific to your OS
```

**2. Build Failures**
```bash
# Clean build
rm -rf .aws-sam
sam build --use-container
```

**3. Deployment Failures**
```bash
# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name rtdbc-backend

# Validate template
sam validate --lint
```

**4. Local API Issues**
```bash
# Check Docker is running
docker --version

# Use container build
sam build --use-container
sam local start-api --use-container
```

### Debug Commands

```bash
# Verbose output
sam deploy --debug

# Validate with detailed errors
sam validate --lint

# Check template
sam list stack-outputs --stack-name rtdbc-backend

# Function info
sam list resources --stack-name rtdbc-backend
```

## 📚 Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [SAM CLI Reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- [SAM Examples](https://github.com/aws/aws-sam-cli-app-templates)
- [Serverless Patterns](https://serverlessland.com/patterns)

## 🎯 Next Steps

1. **Deploy with SAM:**
   ```bash
   ./deploy-sam.ps1
   ```

2. **Test locally:**
   ```bash
   ./deploy-sam.ps1 -LocalTest
   ```

3. **Update frontend** to use new API endpoints

4. **Set up monitoring** and alerts

5. **Configure custom domain** (optional)

---

**SAM vs CloudFormation Benefits:**
- 🚀 50% less code for serverless apps
- 🧪 Built-in local testing
- 📊 Automatic monitoring setup
- 🔄 Easy rollbacks and updates
- 🛠️ Better developer experience