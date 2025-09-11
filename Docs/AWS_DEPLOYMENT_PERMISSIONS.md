# AWS Deployment Permissions Fix

## Issue: 403 Forbidden Error During Deployment

**Error**: `Status: 403. Message:` when uploading to S3 bucket `elasticbeanstalk-us-east-1-202717921808`

## Root Cause Analysis

The GitHub Actions deployment is failing because the AWS IAM user lacks sufficient permissions to:
1. Upload files to the Elastic Beanstalk S3 bucket
2. Create/manage application versions
3. Deploy to the EB environment

## Required AWS IAM Permissions

### 1. S3 Bucket Permissions
The IAM user needs these S3 permissions for bucket `elasticbeanstalk-us-east-1-202717921808`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::elasticbeanstalk-us-east-1-202717921808",
                "arn:aws:s3:::elasticbeanstalk-us-east-1-202717921808/*"
            ]
        }
    ]
}
```

### 2. Elastic Beanstalk Permissions
Attach these AWS managed policies to the IAM user:

- `AWSElasticBeanstalkWebTier`
- `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy` 
- `AWSElasticBeanstalkService`

### 3. Additional Required Permissions

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "elasticbeanstalk:CreateApplicationVersion",
                "elasticbeanstalk:DescribeApplicationVersions",
                "elasticbeanstalk:DescribeApplications",
                "elasticbeanstalk:DescribeEnvironments",
                "elasticbeanstalk:UpdateEnvironment",
                "elasticbeanstalk:DescribeEvents",
                "elasticbeanstalk:DescribeConfigurationSettings",
                "elasticbeanstalk:UpdateConfigurationTemplate"
            ],
            "Resource": "*"
        }
    ]
}
```

## Immediate Fix Steps

### Option A: Update IAM User Permissions (Recommended)

1. **Go to AWS IAM Console**
2. **Find the IAM user** used in GitHub Actions (the one with access key starting with 'A')
3. **Attach policies**:
   - `AWSElasticBeanstalkWebTier`
   - `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy`
4. **Add inline policy** for S3 bucket access (JSON above)
5. **Test deployment** by re-running GitHub Action

### Option B: Create New IAM User with Proper Permissions

1. **Create new IAM user** named `github-actions-eb-deploy`
2. **Attach policies** listed above
3. **Generate access keys**
4. **Update GitHub Secrets**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

## Deployment Workflow Improvements

### Fixed Issues in deploy-backend.yml:

1. **✅ Added EB configuration files** to deployment package:
   - `.ebextensions/` (health check, port config)
   - `.platform/` (Node.js settings)

2. **✅ Specified existing S3 bucket** to avoid creation attempts:
   - `existing_bucket_name: elasticbeanstalk-us-east-1-202717921808`

3. **✅ Proper file inclusion** in zip package

## Verification Steps

After fixing permissions:

1. **Re-run GitHub Action** (should complete without 403 error)
2. **Check EB Environment** shows "Ok" status with new version
3. **Test endpoints**:
   - `https://backend.rtdynamicbc.co.za/health` → 200 OK
   - `http://backend.rtdynamicbc.co.za/health` → 200 OK
4. **Verify Node.js version** in EB logs shows 20.x

## Security Best Practices

- **Principle of least privilege**: Only grant minimum required permissions
- **Rotate access keys** regularly
- **Use IAM roles** instead of users when possible
- **Monitor CloudTrail** for deployment activities
- **Enable MFA** on IAM users with deployment permissions

## Troubleshooting

### If 403 persists:
1. Check IAM user has all required policies
2. Verify S3 bucket policy allows the IAM user
3. Ensure bucket exists in correct region (us-east-1)
4. Check AWS CloudTrail logs for detailed error messages

### If deployment succeeds but app fails:
1. Check EB environment logs
2. Verify Node.js 20.x is being used
3. Confirm health check endpoint responds
4. Check environment variables are set correctly

---

**Next Action**: Update IAM permissions in AWS Console, then re-run the GitHub Action deployment.