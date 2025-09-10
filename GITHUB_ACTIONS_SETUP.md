# GitHub Actions Automatic Deployment Setup

## Overview
This guide sets up automatic deployment of your backend to AWS Elastic Beanstalk whenever you push code to the main branch.

## Prerequisites
1. AWS Account with Elastic Beanstalk access
2. GitHub repository
3. AWS CLI installed (for initial setup)

## Step 1: Create Elastic Beanstalk Application (One-time setup)

### Option A: Using AWS Console
1. Go to AWS Elastic Beanstalk Console
2. Click "Create Application"
3. **Application name**: `rtdbc-backend`
4. **Platform**: Node.js
5. **Application code**: Upload your `backend.zip` file
6. **Environment name**: `production`
7. Follow the configuration steps from our previous setup

### Option B: Using AWS CLI
```bash
# Create application
aws elasticbeanstalk create-application \
  --application-name rtdbc-backend \
  --description "RT Dynamic Business Consulting Backend API"

# Create environment
aws elasticbeanstalk create-environment \
  --application-name rtdbc-backend \
  --environment-name production \
  --solution-stack-name "64bit Amazon Linux 2 v5.8.4 running Node.js 18"
```

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Required Secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key for deployment | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key for deployment | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_SES_ACCESS_KEY_ID` | AWS Access Key for SES emails | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SES_SECRET_ACCESS_KEY` | AWS Secret Key for SES emails | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `FRONTEND_URL` | Your Amplify frontend URL | `https://d2js6qnot116a8.cloudfront.net` |
| `FROM_EMAIL` | Email address for sending | `contact@rtdynamicbc.co.za` |
| `BUSINESS_EMAIL` | Business email address | `contact@rtdynamicbc.co.za` |

### How to Create AWS Access Keys:

1. **Go to AWS IAM Console**
2. **Create a new user** or use existing user
3. **Attach policies**:
   - `AWSElasticBeanstalkFullAccess`
   - `AmazonSESFullAccess` (for email functionality)
4. **Create Access Key** → Download credentials
5. **Add to GitHub Secrets**

## Step 3: Test the Workflow

1. **Make a change** to any file in the `backend/` folder
2. **Commit and push** to main branch:
   ```bash
   git add .
   git commit -m "test: trigger deployment"
   git push origin main
   ```
3. **Check GitHub Actions** tab in your repository
4. **Monitor deployment** progress

## Step 4: Get Your Backend URL

After successful deployment:
1. **Check the GitHub Actions log** for the backend URL
2. **Or go to AWS Elastic Beanstalk Console** → Your Environment → URL
3. **Copy the URL** (e.g., `https://production.us-east-1.elasticbeanstalk.com`)

## Step 5: Update Frontend Environment Variable

1. **Go to AWS Amplify Console**
2. **Your App** → App settings → Environment variables
3. **Add/Update**:
   - **Variable**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.elasticbeanstalk.com`
4. **Redeploy** your frontend

## Workflow Features

✅ **Automatic Triggers**:
- Deploys on push to main branch
- Only when backend files change
- Manual trigger available

✅ **Smart Deployment**:
- Installs production dependencies
- Creates optimized deployment package
- Sets all environment variables
- Waits for deployment completion

✅ **Environment Variables Set**:
- `NODE_ENV=production`
- `FRONTEND_URL` (from secrets)
- `AWS_REGION=us-east-1`
- `FROM_EMAIL` and `BUSINESS_EMAIL` (from secrets)
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (for SES)

## Troubleshooting

### Common Issues:

1. **"Application does not exist"**
   - Create the EB application first (Step 1)

2. **"Access Denied"**
   - Check AWS credentials in GitHub secrets
   - Verify IAM permissions

3. **"Environment not ready"**
   - Wait for initial environment creation
   - Check EB console for status

4. **"Deployment failed"**
   - Check GitHub Actions logs
   - Verify backend code syntax
   - Check EB environment health

### Useful Commands:

```bash
# Check EB application status
aws elasticbeanstalk describe-applications --application-names rtdbc-backend

# Check environment status
aws elasticbeanstalk describe-environments --application-name rtdbc-backend

# View environment URL
aws elasticbeanstalk describe-environments \
  --application-name rtdbc-backend \
  --environment-names production \
  --query 'Environments[0].CNAME'
```

## Security Best Practices

1. **Separate AWS Keys**: Use different keys for deployment vs. application runtime
2. **Minimal Permissions**: Only grant necessary IAM permissions
3. **Rotate Keys**: Regularly rotate AWS access keys
4. **Monitor Usage**: Check AWS CloudTrail for key usage

## Next Steps

Once setup is complete:
1. ✅ Push code changes automatically deploy
2. ✅ Frontend connects to production backend
3. ✅ Contact forms work in production
4. ✅ No more localhost connection errors!

---

**Need Help?** Check the GitHub Actions logs or AWS Elastic Beanstalk console for detailed error messages.