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

## SSL Certificate Configuration (Optional)

### Current Setup: HTTP Only
The current configuration uses HTTP only to avoid SSL certificate errors. The backend is accessible at:
- `http://rtdbc-production.eba-pz5m2ibp.us-east-1.elasticbeanstalk.com`

### To Enable HTTPS (Advanced)
If you need HTTPS for your backend API:

1. **Option A: AWS Certificate Manager (Recommended)**
   ```bash
   # Request a certificate for your domain
   aws acm request-certificate \
     --domain-name api.rtdynamicbc.co.za \
     --validation-method DNS
   ```

2. **Option B: Upload Your Own Certificate**
   ```bash
   # Upload certificate to IAM
   aws iam upload-server-certificate \
     --server-certificate-name rtdbc-ssl-cert \
     --certificate-body file://certificate.crt \
     --private-key file://private.key \
     --certificate-chain file://certificate-chain.crt
   ```

3. **Update .ebextensions Configuration**
   Edit `.ebextensions/01-disable-https.config`:
   ```yaml
   option_settings:
     aws:elb:listener:443:
       ListenerEnabled: true
       Protocol: HTTPS
       InstancePort: 80
       InstanceProtocol: HTTP
       SSLCertificateId: arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
   ```

### Important Notes:
- HTTPS is not required for API functionality
- The frontend handles HTTPS; backend can remain HTTP
- Only enable HTTPS if you have a valid SSL certificate

## Troubleshooting

### SSL Certificate Errors
- **Error**: "Secure Listeners need to specify a SSLCertificateId"
- **Solution**: Use the provided HTTP-only configuration or obtain a valid SSL certificate

### Load Balancer Errors
- **Error**: "LoadBalancer type option cannot be changed"
- **Solution**: Delete and recreate the environment, or use the provided configuration

### General Issues
- Ensure all environment variables are set
- Check that AWS SES is configured for your email domain
- Verify CORS settings allow your frontend domain# Deployment trigger - permissions updated 2025-09-11 08:02:16

# Deployment trigger - staticfiles fix applied 2025-09-11 08:21:53
