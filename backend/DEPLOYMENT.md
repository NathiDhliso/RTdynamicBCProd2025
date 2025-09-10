# Backend Deployment Guide - AWS Elastic Beanstalk

## Prerequisites
1. AWS CLI installed and configured
2. EB CLI installed: `npm install -g @aws-amplify/cli`
3. AWS account with appropriate permissions

## Deployment Steps

### 1. Initialize Elastic Beanstalk
```bash
cd backend
eb init
```
- Select your AWS region
- Choose Node.js platform
- Select the latest Node.js version
- Choose not to use CodeCommit

### 2. Create Environment
```bash
eb create production
```

### 3. Set Environment Variables
```bash
eb setenv NODE_ENV=production \
  FRONTEND_URL=https://d2js6qnot116a8.cloudfront.net \
  AWS_REGION=us-east-1 \
  FROM_EMAIL=contact@rtdynamicbc.co.za \
  BUSINESS_EMAIL=contact@rtdynamicbc.co.za \
  SEND_CONFIRMATION=true
```

**Important**: Set your AWS credentials separately in the EB console for security:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

### 4. Deploy
```bash
eb deploy
```

### 5. Get Your Backend URL
```bash
eb status
```
Copy the CNAME URL (e.g., `production.us-east-1.elasticbeanstalk.com`)

### 6. Update Frontend Environment Variable
In your Amplify console, set:
- **Variable**: `VITE_API_URL`
- **Value**: `https://your-eb-url.elasticbeanstalk.com`

### 7. Redeploy Frontend
Redeploy your Amplify app to pick up the new environment variable.

## Monitoring
- View logs: `eb logs`
- Check health: `eb health`
- Open app: `eb open`

## Files Created for Deployment
- `.ebextensions/nodecommand.config` - EB configuration
- `.platform/nodejs.config` - Platform-specific config
- `Procfile` - Process definition

## Troubleshooting
- Ensure all environment variables are set
- Check that AWS SES is configured for your email domain
- Verify CORS settings allow your frontend domain