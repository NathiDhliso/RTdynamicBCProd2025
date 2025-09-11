# Excel Reporting System for Customer Data

This document describes the comprehensive Excel reporting system implemented for RT Dynamic Business Consulting's customer data management.

## Overview

The system automatically generates Excel files for all customer interactions and maintains weekly consolidated reports. Customer data is captured from both contact form submissions and business health check questionnaires.

## Features

### 📊 Automatic Excel Generation
- **Individual Submissions**: Each form submission generates customer data in Excel format
- **Weekly Consolidation**: All submissions are automatically appended to weekly Excel files
- **Comprehensive Data**: Captures all form fields plus metadata (IP address, user agent, timestamps)
- **Email Integration**: Customer data is included in notification emails sent to the business

### 📋 Data Captured

#### Contact Form Data
- Submission Date & Time
- Full Name
- Email Address
- Subject
- Message Content
- IP Address
- User Agent
- Source (Website Contact Form)

#### Questionnaire Data
- Submission Date & Time
- Company Information (Name, Entity Type, Industry, Revenue)
- Operational Details (Employees, Stock Management, Foreign Currency)
- Compliance Requirements (Tax Complexity, Audit Requirements, Regulatory Reporting)
- Business Goals & Challenges
- Contact Information (Name, Email, Phone)
- Quote Calculations (Estimated Quote, Base Price, Complexity Factors)
- Metadata (IP Address, User Agent, Source)

## File Structure

### Weekly Files
Files are automatically generated with the following naming convention:
- Contact Forms: `customer-data-contact-YYYY-weekNN.xlsx`
- Questionnaires: `customer-data-questionnaire-YYYY-weekNN.xlsx`
- Combined: `customer-data-combined-YYYY-weekNN.xlsx`

### File Locations
- **Lambda Environment**: `/tmp/` directory (temporary storage)
- **Production**: Files should be configured to save to S3 bucket for persistence

## Implementation Details

### Core Files

#### `excel-generator.js`
Main utility for Excel generation and data formatting:
- `formatContactDataForExcel()` - Formats contact form data
- `formatQuestionnaireDataForExcel()` - Formats questionnaire data
- `generateContactExcel()` - Creates Excel file for contact data
- `generateQuestionnaireExcel()` - Creates Excel file for questionnaire data
- `appendToExistingExcel()` - Appends new data to weekly files
- `generateWeeklyFilename()` - Creates standardized weekly filenames

#### `ses-email-helper.js`
Email integration with customer data:
- `sendEmailWithDataInBody()` - Includes customer data summary in email body
- `generateDataSummary()` - Creates HTML data summary for emails
- `generateTextDataSummary()` - Creates text data summary for emails

### Lambda Functions Updated

#### Contact Handler (`contact-handler/index.js`)
- Captures contact form submissions
- Generates Excel data for each submission
- Appends to weekly contact file
- Includes data summary in notification emails

#### Questionnaire Handler (`questionnaire-handler/index.js`)
- Captures questionnaire submissions
- Generates Excel data including quote calculations
- Appends to weekly questionnaire file
- Includes comprehensive data summary in notification emails

## Dependencies Added

```json
{
  "xlsx": "^0.18.5",
  "mimetext": "^3.0.27"
}
```

## Usage Examples

### Manual Excel Generation
```javascript
import { formatContactDataForExcel, generateContactExcel } from './shared/excel-generator.js';

// Format single contact submission
const excelData = formatContactDataForExcel(formData, metadata);

// Generate Excel file
const excelBuffer = generateContactExcel([excelData]);
```

### Weekly File Management
```javascript
import { appendToExistingExcel, generateWeeklyFilename } from './shared/excel-generator.js';

// Generate weekly filename
const filename = generateWeeklyFilename('contact'); // customer-data-contact-2024-week03.xlsx

// Append to weekly file
await appendToExistingExcel(filePath, [newData], 'Contact Forms', CONTACT_COLUMNS);
```

## Email Integration

Customer data is automatically included in business notification emails:

### HTML Format
- Styled data summary section
- Grid layout for easy reading
- Truncated long text fields
- Professional formatting matching email design

### Text Format
- Clean key-value pairs
- All relevant data included
- Fallback for email clients that don't support HTML

## Data Privacy & Security

### Data Handling
- Customer data is processed in memory
- Weekly files stored temporarily in Lambda `/tmp`
- No persistent storage of sensitive data in Lambda
- All data transmission uses HTTPS

### Recommendations
- Configure S3 bucket for persistent weekly file storage
- Implement data retention policies
- Consider encryption for stored Excel files
- Regular cleanup of temporary files

## Configuration

### Environment Variables
```bash
BUSINESS_EMAIL=contact@rtdynamicbc.co.za
FROM_EMAIL=noreply@rtdynamicbc.co.za
SEND_CONFIRMATION=true
SES_REGION=us-east-1
```

### AWS Permissions Required
- SES: `ses:SendEmail`, `ses:SendRawEmail`
- S3: `s3:PutObject`, `s3:GetObject` (if using S3 storage)

## Monitoring & Logging

The system includes comprehensive logging:
- Excel generation success/failure
- Weekly file append operations
- Email sending with data inclusion
- Error handling for file operations

### Log Examples
```
📊 Data appended to weekly file: customer-data-contact-2024-week03.xlsx
✅ Business notification email sent successfully with customer data included
⚠️ Failed to append to weekly file: [error details]
```

## Future Enhancements

### Planned Features
1. **S3 Integration**: Persistent storage for weekly files
2. **Dashboard**: Web interface for viewing Excel reports
3. **Analytics**: Automated insights from customer data
4. **Export Options**: Multiple formats (CSV, PDF)
5. **Data Visualization**: Charts and graphs in Excel files

### Potential Improvements
1. **Real-time Attachments**: Direct Excel file attachments via SES raw email
2. **Database Integration**: Store structured data in RDS/DynamoDB
3. **Automated Reports**: Scheduled weekly/monthly summaries
4. **Data Validation**: Enhanced validation and sanitization

## Troubleshooting

### Common Issues

#### Excel Generation Fails
- Check xlsx dependency installation
- Verify data format matches expected structure
- Check Lambda memory allocation

#### Weekly File Append Fails
- Verify `/tmp` directory permissions
- Check available disk space in Lambda
- Ensure file isn't corrupted

#### Email Data Not Included
- Verify SES helper import
- Check email template modification
- Validate data formatting

### Debug Commands
```javascript
// Test Excel generation
console.log('Excel data:', JSON.stringify(excelData, null, 2));

// Check file creation
console.log('File exists:', await fs.access(filePath).then(() => true).catch(() => false));

// Validate email params
console.log('Email params:', JSON.stringify(emailParams, null, 2));
```

## Support

For technical support or questions about the Excel reporting system:
- Review Lambda function logs in CloudWatch
- Check SES sending statistics
- Verify file operations in `/tmp` directory
- Test Excel generation with sample data

---

*This system ensures comprehensive tracking of all customer interactions while maintaining data privacy and providing actionable business insights through structured Excel reports.*