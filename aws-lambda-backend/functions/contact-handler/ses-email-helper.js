// SES Email Helper with attachment support
// Uses raw email format for attachments since SES doesn't support direct attachment property

import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { createMimeMessage } from 'mimetext';
import https from 'https';

/**
 * Download a URL and return its base64-encoded content
 */
async function fetchUrlToBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        res.resume?.();
        return;
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(buf.toString('base64'));
      });
    }).on('error', reject);
  });
}

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
    contentType: 'text/html; charset=UTF-8',
    data: emailParams.Message.Body.Html.Data
  });
  
  // Add text body
  if (emailParams.Message.Body.Text) {
    msg.addMessage({
      contentType: 'text/plain; charset=UTF-8',
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
 * Build and send a raw email with inline assets (e.g., logo) referenced via CID
 */
async function sendRawEmailWithInlineAssets(sesClient, baseParams, inlineAssets = []) {
  const msg = createMimeMessage();

  msg.setHeader('from', baseParams.Source);
  msg.setHeader('to', baseParams.Destination.ToAddresses.join(', '));
  msg.setHeader('subject', baseParams.Message.Subject.Data);

  const textBody = baseParams.Message.Body.Text?.Data || '';
  const htmlBody = baseParams.Message.Body.Html.Data;

  if (textBody) {
    msg.addMessage({ contentType: 'text/plain; charset=UTF-8', data: textBody });
  }
  msg.addMessage({ contentType: 'text/html; charset=UTF-8', data: htmlBody });

  inlineAssets.forEach(asset => {
    msg.addAttachment({
      filename: asset.filename,
      contentType: asset.contentType,
      data: asset.contentBase64,
      contentId: asset.contentId,
      inline: true,
      contentDisposition: 'inline'
    });
  });

  const rawEmailParams = {
    RawMessage: { Data: Buffer.from(msg.asRaw()) },
    Source: baseParams.Source,
    Destinations: baseParams.Destination.ToAddresses,
  };

  return await sesClient.send(new SendRawEmailCommand(rawEmailParams));
}

/**
 * Fallback method: Send email without attachments but include Excel data in email body
 * Optionally embeds the company logo inline using CID when the logo URL is detected in HTML.
 * @param {Object} sesClient - Configured SES client
 * @param {Object} emailParams - Email parameters
 * @param {Array} excelData - Excel data to include in email
 * @returns {Promise} SES send result
 */
export const sendEmailWithDataInBody = async (sesClient, emailParams, excelData = []) => {
  const { SendEmailCommand } = await import('@aws-sdk/client-ses');

  // Determine base params (with or without data summary injected)
  let baseParams = emailParams;
  if (excelData.length > 0) {
    const dataSummary = generateDataSummary(excelData);
    baseParams = {
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
  }

  // Detect logo URL and embed inline as CID
  const html = baseParams.Message.Body.Html.Data || '';
  const logoUrlMatch = html.match(/https?:\/\/[^"']*rtdynamicbc\.co\.za\/Logo\.(png|svg)/i);

  if (logoUrlMatch) {
    try {
      const logoUrl = logoUrlMatch[0];
      const ext = (logoUrl.split('.').pop() || 'png').toLowerCase();
      const contentType = ext === 'svg' ? 'image/svg+xml' : 'image/png';
      const base64 = await fetchUrlToBase64(logoUrl);

      const htmlWithCid = html.replace(logoUrl, 'cid:logo');
      const paramsWithCid = {
        ...baseParams,
        Message: {
          ...baseParams.Message,
          Body: {
            Html: { Data: htmlWithCid, Charset: 'UTF-8' },
            Text: baseParams.Message.Body.Text
          }
        }
      };

      return await sendRawEmailWithInlineAssets(sesClient, paramsWithCid, [
        { filename: `Logo.${ext === 'svg' ? 'svg' : 'png'}`, contentType, contentBase64: base64, contentId: 'logo' }
      ]);
    } catch (e) {
      console.warn('⚠️ Inline logo embedding failed, falling back to regular send:', e.message);
      // Fall through to regular SendEmailCommand below
    }
  }

  // Default path: regular SES send
  return await sesClient.send(new SendEmailCommand(baseParams));
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