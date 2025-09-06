# AWS SES IAM Permissions Setup

## Required IAM Policy for SES Email Sending

Create an IAM user with the following policy to allow your backend to send emails via AWS SES:

### 1. Create IAM User
1. Go to AWS IAM Console
2. Click "Users" → "Add users"
3. Enter username: `rtdbc-ses-user`
4. Select "Programmatic access"
5. Click "Next: Permissions"

### 2. Create Custom Policy

Click "Create policy" and use the JSON editor:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SendEmailPermissions",
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Sid": "GetSendQuotaPermissions",
      "Effect": "Allow",
      "Action": [
        "ses:GetSendQuota",
        "ses:GetSendStatistics"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Policy Details

**Policy Name:** `RTDynamicSESPolicy`

**Permissions Explained:**
- `ses:SendEmail` - Send formatted emails
- `ses:SendRawEmail` - Send raw email messages
- `ses:GetSendQuota` - Check sending limits (optional)
- `ses:GetSendStatistics` - Get sending statistics (optional)

### 4. Attach Policy to User
1. Select the created policy
2. Attach to your IAM user
3. Complete user creation
4. **IMPORTANT:** Save the Access Key ID and Secret Access Key

### 5. Alternative: Minimal Policy (Production)

For production with stricter security, use this minimal policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail"
      ],
      "Resource": [
        "arn:aws:ses:us-east-1:YOUR_ACCOUNT_ID:identity/rtdynamicbc.com",
        "arn:aws:ses:us-east-1:YOUR_ACCOUNT_ID:identity/contact@rtdynamicbc.com"
      ]
    }
  ]
}
```

**Replace:**
- `YOUR_ACCOUNT_ID` with your AWS Account ID
- `us-east-1` with your SES region

### 6. SES Setup Checklist

✅ **Domain Verification:**
- Verify `rtdynamicbc.com` in SES Console
- Add required DNS records (TXT, CNAME, MX)

✅ **Email Verification:**
- Verify `contact@rtdynamicbc.com`
- Check email and click verification link

✅ **Production Access:**
- Request production access (remove sandbox mode)
- Go to SES Console → Account dashboard → Request production access
- Provide use case: "Transactional emails for business website contact forms"

✅ **Environment Variables:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
FROM_EMAIL=contact@rtdynamicbc.com
BUSINESS_EMAIL=contact@rtdynamicbc.com
```

### 7. Testing SES Setup

```bash
# Test from AWS CLI (optional)
aws ses send-email \
  --source contact@rtdynamicbc.com \
  --destination ToAddresses=contact@rtdynamicbc.com \
  --message Subject={Data="Test Email"},Body={Text={Data="Test message"}}
```

### 8. Security Best Practices

- ✅ Use IAM user with minimal permissions
- ✅ Never commit AWS credentials to git
- ✅ Rotate access keys regularly
- ✅ Monitor SES usage and costs
- ✅ Set up CloudWatch alarms for unusual activity
- ✅ Use environment variables for all secrets

### 9. Troubleshooting

**Common Issues:**

1. **"Email address not verified"**
   - Verify both domain and email in SES Console

2. **"MessageRejected: Email address not verified"**
   - Check if SES is in sandbox mode
   - Request production access

3. **"AccessDenied"**
   - Check IAM policy permissions
   - Verify AWS credentials in .env

4. **"InvalidParameterValue"**
   - Check FROM_EMAIL matches verified identity
   - Ensure email format is correct

### 10. Cost Estimation

**AWS SES Pricing (as of 2024):**
- First 62,000 emails per month: $0.10 per 1,000 emails
- Additional emails: $0.10 per 1,000 emails
- Data transfer: $0.12 per GB

**Example:** 1,000 emails/month ≈ $0.10/month