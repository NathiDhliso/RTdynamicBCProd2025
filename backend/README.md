# RT Dynamic Backend API

Backend API service for RT Dynamic Business Consulting website with AWS SES email integration.

## Features

- 📧 Contact form email handling
- 📊 Business Health Check questionnaire processing
- 🔒 Input validation and security
- 📨 AWS SES email integration
- ✅ Automatic confirmation emails
- 🛡️ Rate limiting and security headers

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5175
   
   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_actual_access_key
   AWS_SECRET_ACCESS_KEY=your_actual_secret_key
   
   # Email Configuration
   FROM_EMAIL=contact@rtdynamicbc.com
   BUSINESS_EMAIL=contact@rtdynamicbc.com
   SEND_CONFIRMATION=true
   ```

### 3. AWS SES Setup

#### Prerequisites:
- AWS Account with SES access
- Domain verification for `rtdynamicbc.com`
- Email address verification for `contact@rtdynamicbc.com`

#### Steps:

1. **Verify Domain in AWS SES:**
   - Go to AWS SES Console
   - Navigate to "Verified identities"
   - Add domain: `rtdynamicbc.com`
   - Follow DNS verification steps

2. **Verify Email Address:**
   - Add email identity: `contact@rtdynamicbc.com`
   - Check email and click verification link

3. **Request Production Access:**
   - By default, SES is in sandbox mode
   - Request production access to send to any email
   - Go to "Account dashboard" > "Request production access"

4. **Create IAM User:**
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
       }
     ]
   }
   ```

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api/contact/health` - Contact service health
- `GET /api/questionnaire/health` - Questionnaire service health

### Contact Form
- `POST /api/contact` - Submit contact form

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Business Inquiry",
  "message": "I would like to discuss..."
}
```

### Business Health Check
- `POST /api/questionnaire` - Submit questionnaire

**Request Body:**
```json
{
  "companyName": "Example Corp",
  "entityType": "Private Limited (Pty) Ltd",
  "industry": "Technology",
  "annualRevenue": "R1M - R5M",
  "hasEmployees": "Yes",
  "employeeCount": "10-50",
  "managesStock": "No",
  "dealsForeignCurrency": "No",
  "taxComplexity": "Moderate",
  "auditRequirements": "Required",
  "regulatoryReporting": "Yes",
  "primaryGoal": "Improve efficiency",
  "businessChallenges": "We need help with...",
  "contactName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+27123456789"
}
```

## Email Templates

The system includes professionally designed HTML email templates:

- **Contact Form**: Clean, branded template with form details
- **Questionnaire**: Comprehensive template with all business information
- **Confirmations**: Thank you emails sent to customers

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Error Handling**: Secure error responses

## Testing

### Test Contact Form:
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message from the API."
  }'
```

### Test Health Endpoints:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/contact/health
curl http://localhost:3001/api/questionnaire/health
```

## Troubleshooting

### Common Issues:

1. **AWS Credentials Error:**
   - Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   - Check IAM user permissions

2. **Email Not Sending:**
   - Verify domain and email in AWS SES
   - Check if SES is in sandbox mode
   - Verify FROM_EMAIL is verified in SES

3. **CORS Errors:**
   - Check FRONTEND_URL in .env matches your frontend
   - Ensure frontend is running on correct port

4. **Rate Limiting:**
   - Wait 15 minutes or restart server
   - Adjust rate limits in server.js if needed

## Production Deployment

1. Set `NODE_ENV=production`
2. Use process manager (PM2, Docker, etc.)
3. Set up proper logging
4. Configure reverse proxy (Nginx)
5. Use HTTPS
6. Set up monitoring

## Support

For issues or questions, contact the RT Dynamic development team.