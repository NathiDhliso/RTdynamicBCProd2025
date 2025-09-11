# Testing Guide - AWS Lambda Backend Migration

This comprehensive testing guide ensures that all functionality works correctly after migrating from Express.js to AWS Lambda backend.

## 🧪 Testing Strategy

### Testing Phases
1. **Unit Testing** - Individual Lambda functions
2. **Integration Testing** - API Gateway + Lambda + SES
3. **End-to-End Testing** - Frontend + Backend + Email delivery
4. **Performance Testing** - Load testing and cold start analysis
5. **Security Testing** - Validation, rate limiting, and CORS
6. **User Acceptance Testing** - Real-world scenarios

## 🔧 Test Environment Setup

### Prerequisites
```bash
# Install testing tools
npm install -g newman  # For API testing
pip install locust     # For load testing (optional)

# AWS CLI configured
aws configure list

# jq for JSON processing
# Windows: choco install jq
# macOS: brew install jq
# Linux: apt-get install jq
```

### Test Data Setup
```bash
# Create test data directory
mkdir test-data
cd test-data

# Create test payloads (see examples below)
```

## 📝 Unit Testing - Lambda Functions

### Contact Handler Tests

**Valid Contact Form Submission**
```json
// test-data/contact-valid.json
{
  "httpMethod": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Origin": "https://www.rtdynamicbc.co.za"
  },
  "body": "{\"name\":\"John Doe\",\"email\":\"john.doe@example.com\",\"subject\":\"Test Inquiry\",\"message\":\"This is a test message to verify the contact form functionality works correctly.\"}",
  "requestContext": {
    "requestId": "test-request-001"
  }
}
```

**Invalid Contact Form Submission**
```json
// test-data/contact-invalid.json
{
  "httpMethod": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\":\"\",\"email\":\"invalid-email\",\"subject\":\"\",\"message\":\"Short\"}",
  "requestContext": {
    "requestId": "test-request-002"
  }
}
```

**Test Commands**
```bash
# Test valid contact submission
aws lambda invoke \
  --function-name rtdbc-contact-handler-production \
  --payload file://test-data/contact-valid.json \
  --region us-east-1 \
  contact-response.json

# Check response
cat contact-response.json | jq .

# Expected: {"statusCode": 200, "body": "{\"success\": true, ...}"}

# Test invalid contact submission
aws lambda invoke \
  --function-name rtdbc-contact-handler-production \
  --payload file://test-data/contact-invalid.json \
  --region us-east-1 \
  contact-error-response.json

# Expected: {"statusCode": 400, "body": "{\"success\": false, ...}"}
```

### Questionnaire Handler Tests

**Valid Questionnaire Submission**
```json
// test-data/questionnaire-valid.json
{
  "httpMethod": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Origin": "https://www.rtdynamicbc.co.za"
  },
  "body": "{\"entityType\":\"Private Company (Pty Ltd)\",\"annualRevenue\":\"R1,000,001 - R5,000,000\",\"companyName\":\"Test Company (Pty) Ltd\",\"industry\":\"Information Technology\",\"hasEmployees\":\"Yes\",\"employeeCount\":\"6-20\",\"managesStock\":\"No\",\"dealsForeignCurrency\":\"No\",\"taxComplexity\":\"Moderate\",\"auditRequirements\":\"Not Required\",\"regulatoryReporting\":\"Standard\",\"primaryGoal\":\"Improve Financial Management\",\"businessChallenges\":\"We need better financial reporting and tax compliance support for our growing IT company.\",\"contactName\":\"Jane Smith\",\"email\":\"jane.smith@testcompany.com\",\"phoneNumber\":\"+27123456789\"}",
  "requestContext": {
    "requestId": "test-request-003"
  }
}
```

**Test Commands**
```bash
# Test valid questionnaire submission
aws lambda invoke \
  --function-name rtdbc-questionnaire-handler-production \
  --payload file://test-data/questionnaire-valid.json \
  --region us-east-1 \
  questionnaire-response.json

# Check response and quote calculation
cat questionnaire-response.json | jq '.body | fromjson | .data.quote'

# Expected: A calculated quote amount (e.g., 3500)
```

## 🌐 Integration Testing - API Gateway

### API Gateway Test Scripts

**Contact Form API Test**
```bash
#!/bin/bash
# test-scripts/test-contact-api.sh

API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/production"
CONTACT_ENDPOINT="$API_URL/api/contact"

echo "Testing Contact API..."

# Test valid submission
echo "1. Testing valid contact submission..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CONTACT_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.rtdynamicbc.co.za" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "API Test",
    "message": "This is a test message from the API testing script."
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Valid submission test passed"
  echo "Response: $BODY" | jq .
else
  echo "❌ Valid submission test failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
fi

# Test invalid submission
echo "\n2. Testing invalid contact submission..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CONTACT_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "invalid-email",
    "subject": "",
    "message": "Short"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "400" ]; then
  echo "✅ Invalid submission test passed"
  echo "Validation errors: $BODY" | jq '.details'
else
  echo "❌ Invalid submission test failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
fi

# Test CORS preflight
echo "\n3. Testing CORS preflight..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X OPTIONS "$CONTACT_ENDPOINT" \
  -H "Origin: https://www.rtdynamicbc.co.za" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ CORS preflight test passed"
else
  echo "❌ CORS preflight test failed (HTTP $HTTP_CODE)"
fi

echo "\nContact API testing completed."
```

**Questionnaire API Test**
```bash
#!/bin/bash
# test-scripts/test-questionnaire-api.sh

API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/production"
QUESTIONNAIRE_ENDPOINT="$API_URL/api/questionnaire"

echo "Testing Questionnaire API..."

# Test Pty Ltd submission with compliance
echo "1. Testing Pty Ltd questionnaire submission..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$QUESTIONNAIRE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.rtdynamicbc.co.za" \
  -d '{
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
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Pty Ltd submission test passed"
  QUOTE=$(echo "$BODY" | jq -r '.data.quote')
  if [ "$QUOTE" != "null" ] && [ "$QUOTE" -gt 0 ]; then
    echo "✅ Quote calculation successful: R$QUOTE"
  else
    echo "⚠️ Quote calculation may have failed"
  fi
else
  echo "❌ Pty Ltd submission test failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
fi

# Test Sole Proprietor submission
echo "\n2. Testing Sole Proprietor questionnaire submission..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$QUESTIONNAIRE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "Sole Proprietor",
    "annualRevenue": "R100,001 - R500,000",
    "companyName": "Test Sole Proprietor",
    "industry": "Consulting & Professional Services",
    "hasEmployees": "No",
    "managesStock": "No",
    "dealsForeignCurrency": "No",
    "primaryGoal": "Ensure Tax Compliance",
    "businessChallenges": "Need help with tax returns and basic bookkeeping.",
    "contactName": "Test Proprietor",
    "email": "test@example.com",
    "phoneNumber": "+27987654321"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Sole Proprietor submission test passed"
  QUOTE=$(echo "$BODY" | jq -r '.data.quote')
  if [ "$QUOTE" != "null" ] && [ "$QUOTE" -gt 0 ]; then
    echo "✅ Quote calculation successful: R$QUOTE"
  fi
else
  echo "❌ Sole Proprietor submission test failed (HTTP $HTTP_CODE)"
fi

echo "\nQuestionnaire API testing completed."
```

## 📧 Email Delivery Testing

### Email Test Script
```bash
#!/bin/bash
# test-scripts/test-email-delivery.sh

echo "Testing Email Delivery..."

# Check SES sending statistics
echo "1. Checking SES sending statistics..."
aws ses get-send-statistics --region us-east-1 | jq '.SendDataPoints[-1]'

# Check SES sending quota
echo "\n2. Checking SES sending quota..."
aws ses get-send-quota --region us-east-1

# List verified email addresses
echo "\n3. Checking verified email addresses..."
aws ses list-verified-email-addresses --region us-east-1

# Submit test contact form to trigger email
echo "\n4. Submitting test contact form..."
API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/production"
curl -X POST "$API_URL/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Email Test User",
    "email": "emailtest@example.com",
    "subject": "Email Delivery Test",
    "message": "This is a test to verify email delivery is working correctly after Lambda migration."
  }'

echo "\n\n5. Check your email inbox for the test message."
echo "6. Monitor CloudWatch logs for any email sending errors:"
echo "   aws logs tail /aws/lambda/rtdbc-contact-handler-production --follow"
```

## ⚡ Performance Testing

### Cold Start Analysis
```bash
#!/bin/bash
# test-scripts/test-performance.sh

API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/production"
CONTACT_ENDPOINT="$API_URL/api/contact"

echo "Performance Testing - Cold Start Analysis"

# Test multiple requests to measure cold start vs warm start
for i in {1..5}; do
  echo "\nRequest $i:"
  START_TIME=$(date +%s%3N)
  
  RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X POST "$CONTACT_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Performance Test",
      "email": "perf@example.com",
      "subject": "Performance Test '$i'",
      "message": "Testing response time for request '$i'."
    }')
  
  END_TIME=$(date +%s%3N)
  TOTAL_TIME=$((END_TIME - START_TIME))
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n2 | head -n1)
  CURL_TIME=$(echo "$RESPONSE" | tail -n1)
  
  echo "HTTP Code: $HTTP_CODE"
  echo "Total Time: ${TOTAL_TIME}ms"
  echo "Curl Time: ${CURL_TIME}s"
  
  # Wait between requests to allow for cold start
  if [ $i -eq 1 ]; then
    echo "Waiting 5 minutes for cold start..."
    sleep 300
  else
    sleep 2
  fi
done

echo "\nPerformance testing completed."
echo "First request should show cold start (higher latency)."
echo "Subsequent requests should be faster (warm start)."
```

### Load Testing (Optional)
```python
# test-scripts/locustfile.py
from locust import HttpUser, task, between
import json

class RTDynamicUser(HttpUser):
    wait_time = between(1, 3)
    host = "https://your-api-id.execute-api.us-east-1.amazonaws.com/production"
    
    @task(3)
    def submit_contact_form(self):
        payload = {
            "name": "Load Test User",
            "email": "loadtest@example.com",
            "subject": "Load Test Submission",
            "message": "This is a load test message to verify the system can handle multiple concurrent requests."
        }
        
        with self.client.post("/api/contact", 
                             json=payload, 
                             headers={"Content-Type": "application/json"},
                             catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")
    
    @task(1)
    def submit_questionnaire(self):
        payload = {
            "entityType": "Private Company (Pty Ltd)",
            "annualRevenue": "R1,000,001 - R5,000,000",
            "companyName": "Load Test Company",
            "industry": "Information Technology",
            "hasEmployees": "Yes",
            "employeeCount": "6-20",
            "managesStock": "No",
            "dealsForeignCurrency": "No",
            "taxComplexity": "Moderate",
            "auditRequirements": "Not Required",
            "regulatoryReporting": "Standard",
            "primaryGoal": "Improve Financial Management",
            "businessChallenges": "Load testing the questionnaire submission process.",
            "contactName": "Load Test Contact",
            "email": "loadtest@example.com",
            "phoneNumber": "+27123456789"
        }
        
        with self.client.post("/api/questionnaire", 
                             json=payload, 
                             headers={"Content-Type": "application/json"},
                             catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")

# Run with: locust -f locustfile.py --host=https://your-api-id.execute-api.us-east-1.amazonaws.com/production
```

## 🔒 Security Testing

### Security Test Script
```bash
#!/bin/bash
# test-scripts/test-security.sh

API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/production"
CONTACT_ENDPOINT="$API_URL/api/contact"

echo "Security Testing"

# Test rate limiting
echo "1. Testing rate limiting..."
for i in {1..15}; do
  RESPONSE=$(curl -s -w "%{http_code}" -X POST "$CONTACT_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"name":"Rate Test","email":"rate@test.com","subject":"Rate Test","message":"Testing rate limits."}')
  
  echo "Request $i: HTTP $RESPONSE"
  
  if [[ "$RESPONSE" == *"429"* ]]; then
    echo "✅ Rate limiting is working (got 429 Too Many Requests)"
    break
  fi
done

# Test XSS protection
echo "\n2. Testing XSS protection..."
XSS_PAYLOAD='<script>alert("XSS")</script>'
RESPONSE=$(curl -s -X POST "$CONTACT_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$XSS_PAYLOAD'",
    "email": "xss@test.com",
    "subject": "XSS Test",
    "message": "Testing XSS protection with '$XSS_PAYLOAD'."
  }')

if [[ "$RESPONSE" == *"success"* ]]; then
  echo "⚠️ XSS payload was accepted - check email content for proper escaping"
else
  echo "✅ XSS payload was rejected or sanitized"
fi

# Test SQL injection (should not be relevant for this API, but good to test)
echo "\n3. Testing SQL injection patterns..."
SQL_PAYLOAD="'; DROP TABLE users; --"
RESPONSE=$(curl -s -X POST "$CONTACT_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$SQL_PAYLOAD'",
    "email": "sql@test.com",
    "subject": "SQL Test",
    "message": "Testing SQL injection protection."
  }')

echo "SQL injection test response received (should be handled safely)"

# Test CORS from unauthorized origin
echo "\n4. Testing CORS from unauthorized origin..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$CONTACT_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Origin: https://malicious-site.com" \
  -d '{"name":"CORS Test","email":"cors@test.com","subject":"CORS Test","message":"Testing CORS protection."}')

echo "CORS test from unauthorized origin: HTTP $RESPONSE"

echo "\nSecurity testing completed."
```

## 🎯 End-to-End Testing Checklist

### Manual Testing Checklist

**Contact Form Testing:**
- [ ] Valid form submission works
- [ ] Email is received in business inbox
- [ ] Confirmation email is sent to customer (if enabled)
- [ ] Form validation works for all fields
- [ ] Error messages are user-friendly
- [ ] Loading states work correctly
- [ ] Form resets after successful submission
- [ ] CORS works from your domain
- [ ] Mobile responsiveness maintained

**Questionnaire Testing:**
- [ ] All entity types work correctly
- [ ] Pty Ltd compliance fields are required
- [ ] Non-Pty Ltd entities skip compliance
- [ ] Employee count is conditional on "Has Employees"
- [ ] Quote calculation is accurate
- [ ] All validation rules work
- [ ] Business email is received
- [ ] Confirmation email works
- [ ] Complex business scenarios work
- [ ] Mobile form submission works

**Quote Calculation Verification:**
```bash
# Test specific scenarios and verify calculations
# Sole Proprietor, R100k revenue, no employees: ~R800
# Pty Ltd, R2M revenue, 10 employees, complex: ~R4500+
# Partnership, R500k revenue, 3 employees: ~R1800+
```

### Automated E2E Testing (Optional)

If you use Playwright or Cypress:

```javascript
// e2e-tests/contact-form.spec.js
test('Contact form submission works end-to-end', async ({ page }) => {
  await page.goto('https://www.rtdynamicbc.co.za/contact');
  
  // Fill form
  await page.fill('[name="name"]', 'E2E Test User');
  await page.fill('[name="email"]', 'e2e@test.com');
  await page.fill('[name="subject"]', 'E2E Test Submission');
  await page.fill('[name="message"]', 'This is an end-to-end test message.');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for success message
  await page.waitForSelector('.success-message');
  
  // Verify success message
  const successMessage = await page.textContent('.success-message');
  expect(successMessage).toContain('sent successfully');
});
```

## 📊 Monitoring & Alerting Setup

### CloudWatch Dashboard
```bash
# Create CloudWatch dashboard for monitoring
aws cloudwatch put-dashboard \
  --dashboard-name "RTDynamic-Lambda-Backend" \
  --dashboard-body file://cloudwatch-dashboard.json
```

### Key Metrics to Monitor
- Lambda function invocations
- Lambda function errors
- Lambda function duration
- API Gateway 4xx/5xx errors
- API Gateway latency
- SES bounce/complaint rates
- SES sending quota usage

## ✅ Test Results Documentation

### Test Report Template
```markdown
# Test Results - Lambda Backend Migration

## Test Summary
- **Date:** [Date]
- **Environment:** Production
- **Tester:** [Name]
- **Duration:** [Time]

## Test Results

### Unit Tests
- Contact Handler: ✅ PASS
- Questionnaire Handler: ✅ PASS
- Quote Calculations: ✅ PASS

### Integration Tests
- API Gateway Integration: ✅ PASS
- SES Email Delivery: ✅ PASS
- CORS Configuration: ✅ PASS

### Performance Tests
- Cold Start Latency: ~2.5s (acceptable)
- Warm Start Latency: ~200ms (excellent)
- Load Test (100 concurrent): ✅ PASS

### Security Tests
- Rate Limiting: ✅ PASS
- Input Validation: ✅ PASS
- XSS Protection: ✅ PASS

### End-to-End Tests
- Contact Form: ✅ PASS
- Questionnaire: ✅ PASS
- Email Delivery: ✅ PASS
- Quote Accuracy: ✅ PASS

## Issues Found
- [List any issues]

## Recommendations
- [List recommendations]

## Sign-off
- Technical Lead: [Name/Date]
- Business Owner: [Name/Date]
```

## 🚀 Go-Live Checklist

### Pre-Go-Live
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Email delivery working
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Team trained on new system

### Go-Live
- [ ] Frontend deployed with new endpoints
- [ ] DNS/CDN updated if needed
- [ ] Monitoring active
- [ ] Team on standby

### Post-Go-Live
- [ ] Monitor for 24 hours
- [ ] Verify email delivery rates
- [ ] Check error rates
- [ ] Validate quote calculations
- [ ] Collect user feedback
- [ ] Document any issues

---

**Testing Success Criteria:**
- ✅ All automated tests pass
- ✅ Manual testing confirms functionality
- ✅ Performance meets requirements
- ✅ Security tests pass
- ✅ Email delivery works correctly
- ✅ Quote calculations are accurate
- ✅ Error handling is appropriate
- ✅ Monitoring is functional

**Ready for Production:** When all criteria are met and stakeholders approve.