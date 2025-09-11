// SES Email Helper with attachment support
// Uses raw email format for attachments since SES doesn't support direct attachment property

import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { createMimeMessage } from 'mimetext';

/**
 * Send email with attachment using SES raw email format
 * @param {Object} sesClient - Configured SES client
 * @param {Object} emailParams - Email parameters
 * @param {Array} attachments - Array of attachment objects
 * @returns {Promise} SES send result
 */
export const sendEmailWithAttachments = async (sesClient, emailParams, attachments = []) => {
  if (attachments.length === 0) {
    // No attachments, use regular SES send
    const { SendEmailCommand } = await import('@aws-sdk/client-ses');
    return await sesClient.send(new SendEmailCommand(emailParams));
  }

  // Create MIME message for attachments
  const msg = createMimeMessage();
  
  // Set headers
  msg.setHeader('from', emailParams.Source);
  msg.setHeader('to', emailParams.Destination.ToAddresses.join(', '));
  msg.setHeader('subject', emailParams.Message.Subject.Data);
  
  // Add HTML body
  msg.addMessage({
    contentType: 'text/html',
    data: emailParams.Message.Body.Html.Data
  });
  
  // Add text body
  if (emailParams.Message.Body.Text) {
    msg.addMessage({
      contentType: 'text/plain',
      data: emailParams.Message.Body.Text.Data
    });
  }
  
  // Add attachments
  attachments.forEach(attachment => {
    msg.addAttachment({
      filename: attachment.filename,
      contentType: attachment.contentType,
      data: attachment.content // Should be base64 string
    });
  });
  
  // Send raw email
  const rawEmailParams = {
    RawMessage: {
      Data: Buffer.from(msg.asRaw())
    },
    Source: emailParams.Source,
    Destinations: emailParams.Destination.ToAddresses
  };
  
  return await sesClient.send(new SendRawEmailCommand(rawEmailParams));
};

/**
 * Fallback method: Send email without attachments but include Excel data in email body
 * @param {Object} sesClient - Configured SES client
 * @param {Object} emailParams - Email parameters
 * @param {Array} excelData - Excel data to include in email
 * @returns {Promise} SES send result
 */
export const sendEmailWithDataInBody = async (sesClient, emailParams, excelData = []) => {
  const { SendEmailCommand } = await import('@aws-sdk/client-ses');
  
  if (excelData.length === 0) {
    return await sesClient.send(new SendEmailCommand(emailParams));
  }
  
  // Add data summary to email body
  const dataSummary = generateDataSummary(excelData);
  
  // Modify email body to include data summary
  const modifiedEmailParams = {
    ...emailParams,
    Message: {
      ...emailParams.Message,
      Body: {
        Html: {
          Data: emailParams.Message.Body.Html.Data.replace(
            '</div>\n        </div>\n      </body>',
            `${dataSummary}</div>\n        </div>\n      </body>`
          ),
          Charset: 'UTF-8'
        },
        Text: {
          Data: emailParams.Message.Body.Text ? 
            `${emailParams.Message.Body.Text.Data}\n\n--- SUBMISSION DATA ---\n${generateTextDataSummary(excelData)}` :
            `--- SUBMISSION DATA ---\n${generateTextDataSummary(excelData)}`,
          Charset: 'UTF-8'
        }
      }
    }
  };
  
  return await sesClient.send(new SendEmailCommand(modifiedEmailParams));
};

/**
 * Generate HTML data summary for email body
 * @param {Array} excelData - Excel data array
 * @returns {string} HTML summary
 */
function generateDataSummary(excelData) {
  if (excelData.length === 0) return '';
  
  const data = excelData[0]; // Assuming single submission
  
  return `
    <div class="data-summary" style="margin-top: 40px; padding: 30px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;">
      <h3 style="color: #1a2332; margin-bottom: 20px; font-size: 18px;">📊 Submission Data Summary</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        ${Object.entries(data)
          .filter(([key, value]) => value && key !== 'submissionDate')
          .map(([key, value]) => `
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <strong style="color: #495057; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${formatFieldName(key)}</strong><br>
              <span style="color: #212529; font-size: 14px;">${String(value).substring(0, 100)}${String(value).length > 100 ? '...' : ''}</span>
            </div>
          `).join('')}
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #6c757d; font-style: italic;">
        💡 This data has been automatically saved to the weekly Excel report for tracking and analysis.
      </p>
    </div>
  `;
}

/**
 * Generate text data summary for email body
 * @param {Array} excelData - Excel data array
 * @returns {string} Text summary
 */
function generateTextDataSummary(excelData) {
  if (excelData.length === 0) return '';
  
  const data = excelData[0]; // Assuming single submission
  
  return Object.entries(data)
    .filter(([key, value]) => value && key !== 'submissionDate')
    .map(([key, value]) => `${formatFieldName(key)}: ${value}`)
    .join('\n');
}

/**
 * Format field names for display
 * @param {string} fieldName - Field name to format
 * @returns {string} Formatted field name
 */
function formatFieldName(fieldName) {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export default {
  sendEmailWithAttachments,
  sendEmailWithDataInBody
};