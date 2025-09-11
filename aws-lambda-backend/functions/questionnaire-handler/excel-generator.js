// Excel generation utility for customer data
// Handles both contact form submissions and questionnaire responses

import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import path from 'path';

// Contact form Excel columns
const CONTACT_COLUMNS = [
  { key: 'submissionDate', header: 'Submission Date', width: 20 },
  { key: 'name', header: 'Full Name', width: 25 },
  { key: 'email', header: 'Email Address', width: 30 },
  { key: 'subject', header: 'Subject', width: 30 },
  { key: 'message', header: 'Message', width: 50 },
  { key: 'ipAddress', header: 'IP Address', width: 15 },
  { key: 'userAgent', header: 'User Agent', width: 40 },
  { key: 'source', header: 'Source', width: 15 }
];

// Questionnaire Excel columns
const QUESTIONNAIRE_COLUMNS = [
  { key: 'submissionDate', header: 'Submission Date', width: 20 },
  { key: 'companyName', header: 'Company Name', width: 30 },
  { key: 'entityType', header: 'Entity Type', width: 25 },
  { key: 'industry', header: 'Industry', width: 25 },
  { key: 'annualRevenue', header: 'Annual Revenue', width: 20 },
  { key: 'hasEmployees', header: 'Has Employees', width: 15 },
  { key: 'employeeCount', header: 'Employee Count', width: 15 },
  { key: 'managesStock', header: 'Manages Stock', width: 15 },
  { key: 'dealsForeignCurrency', header: 'Foreign Currency', width: 18 },
  { key: 'taxComplexity', header: 'Tax Complexity', width: 15 },
  { key: 'auditRequirements', header: 'Audit Requirements', width: 18 },
  { key: 'regulatoryReporting', header: 'Regulatory Reporting', width: 20 },
  { key: 'primaryGoal', header: 'Primary Goal', width: 30 },
  { key: 'businessChallenges', header: 'Business Challenges', width: 50 },
  { key: 'contactName', header: 'Contact Name', width: 25 },
  { key: 'email', header: 'Email Address', width: 30 },
  { key: 'phoneNumber', header: 'Phone Number', width: 18 },
  { key: 'estimatedQuote', header: 'Estimated Quote (ZAR)', width: 20 },
  { key: 'basePrice', header: 'Base Price (ZAR)', width: 18 },
  { key: 'payrollCost', header: 'Payroll Cost (ZAR)', width: 18 },
  { key: 'revenueModifier', header: 'Revenue Multiplier', width: 18 },
  { key: 'complexityModifier', header: 'Complexity Multiplier', width: 20 },
  { key: 'complexityFactors', header: 'Complexity Factors', width: 40 },
  { key: 'ipAddress', header: 'IP Address', width: 15 },
  { key: 'userAgent', header: 'User Agent', width: 40 },
  { key: 'source', header: 'Source', width: 15 }
];

/**
 * Format contact form data for Excel export
 * @param {Object} formData - Contact form submission data
 * @param {Object} metadata - Additional metadata (IP, user agent, etc.)
 * @returns {Object} Formatted data row
 */
export const formatContactDataForExcel = (formData, metadata = {}) => {
  return {
    submissionDate: new Date().toLocaleString('en-ZA', { 
      timeZone: 'Africa/Johannesburg',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    name: formData.name || '',
    email: formData.email || '',
    subject: formData.subject || '',
    message: formData.message || '',
    ipAddress: metadata.ipAddress || '',
    userAgent: metadata.userAgent || '',
    source: metadata.source || 'Website Contact Form'
  };
};

/**
 * Format questionnaire data for Excel export
 * @param {Object} formData - Questionnaire submission data
 * @param {Object} metadata - Additional metadata (IP, user agent, etc.)
 * @returns {Object} Formatted data row
 */
export const formatQuestionnaireDataForExcel = (formData, metadata = {}) => {
  const quoteDetails = formData.quoteDetails || {};
  
  return {
    submissionDate: new Date().toLocaleString('en-ZA', { 
      timeZone: 'Africa/Johannesburg',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    companyName: formData.companyName || '',
    entityType: formData.entityType || '',
    industry: formData.industry || '',
    annualRevenue: formData.annualRevenue || '',
    hasEmployees: formData.hasEmployees || '',
    employeeCount: formData.employeeCount || '',
    managesStock: formData.managesStock || '',
    dealsForeignCurrency: formData.dealsForeignCurrency || '',
    taxComplexity: formData.taxComplexity || '',
    auditRequirements: formData.auditRequirements || '',
    regulatoryReporting: formData.regulatoryReporting || '',
    primaryGoal: formData.primaryGoal || '',
    businessChallenges: formData.businessChallenges || '',
    contactName: formData.contactName || '',
    email: formData.email || '',
    phoneNumber: formData.phoneNumber || '',
    estimatedQuote: quoteDetails.quote ? `R${quoteDetails.quote.toLocaleString()}` : '',
    basePrice: quoteDetails.basePrice ? `R${quoteDetails.basePrice.toLocaleString()}` : '',
    payrollCost: quoteDetails.payrollCost ? `R${quoteDetails.payrollCost.toLocaleString()}` : '',
    revenueModifier: quoteDetails.revenueModifier ? `${quoteDetails.revenueModifier}x` : '',
    complexityModifier: quoteDetails.complexityModifier ? `${quoteDetails.complexityModifier}x` : '',
    complexityFactors: Array.isArray(quoteDetails.complexityFactors) ? quoteDetails.complexityFactors.join(', ') : '',
    ipAddress: metadata.ipAddress || '',
    userAgent: metadata.userAgent || '',
    source: metadata.source || 'Website Questionnaire'
  };
};

/**
 * Create Excel workbook from data array
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {string} sheetName - Name of the worksheet
 * @returns {Object} Excel workbook
 */
export const createExcelWorkbook = (data, columns, sheetName = 'Data') => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Create headers array
  const headers = columns.map(col => col.header);
  
  // Create data rows
  const rows = data.map(item => 
    columns.map(col => item[col.key] || '')
  );
  
  // Combine headers and data
  const worksheetData = [headers, ...rows];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const columnWidths = columns.map(col => ({ wch: col.width }));
  worksheet['!cols'] = columnWidths;
  
  // Style the header row
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1a2332' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  return workbook;
};

/**
 * Generate Excel buffer for contact form data
 * @param {Array} contactData - Array of contact form submissions
 * @returns {Buffer} Excel file buffer
 */
export const generateContactExcel = (contactData) => {
  const workbook = createExcelWorkbook(contactData, CONTACT_COLUMNS, 'Contact Submissions');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Generate Excel buffer for questionnaire data
 * @param {Array} questionnaireData - Array of questionnaire submissions
 * @returns {Buffer} Excel file buffer
 */
export const generateQuestionnaireExcel = (questionnaireData) => {
  const workbook = createExcelWorkbook(questionnaireData, QUESTIONNAIRE_COLUMNS, 'Questionnaire Submissions');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Generate combined Excel with both contact and questionnaire data
 * @param {Array} contactData - Array of contact form submissions
 * @param {Array} questionnaireData - Array of questionnaire submissions
 * @returns {Buffer} Excel file buffer
 */
export const generateCombinedExcel = (contactData = [], questionnaireData = []) => {
  const workbook = XLSX.utils.book_new();
  
  // Add contact sheet if data exists
  if (contactData.length > 0) {
    const contactHeaders = CONTACT_COLUMNS.map(col => col.header);
    const contactRows = contactData.map(item => 
      CONTACT_COLUMNS.map(col => item[col.key] || '')
    );
    const contactWorksheetData = [contactHeaders, ...contactRows];
    const contactWorksheet = XLSX.utils.aoa_to_sheet(contactWorksheetData);
    contactWorksheet['!cols'] = CONTACT_COLUMNS.map(col => ({ wch: col.width }));
    XLSX.utils.book_append_sheet(workbook, contactWorksheet, 'Contact Forms');
  }
  
  // Add questionnaire sheet if data exists
  if (questionnaireData.length > 0) {
    const questionnaireHeaders = QUESTIONNAIRE_COLUMNS.map(col => col.header);
    const questionnaireRows = questionnaireData.map(item => 
      QUESTIONNAIRE_COLUMNS.map(col => item[col.key] || '')
    );
    const questionnaireWorksheetData = [questionnaireHeaders, ...questionnaireRows];
    const questionnaireWorksheet = XLSX.utils.aoa_to_sheet(questionnaireWorksheetData);
    questionnaireWorksheet['!cols'] = QUESTIONNAIRE_COLUMNS.map(col => ({ wch: col.width }));
    XLSX.utils.book_append_sheet(workbook, questionnaireWorksheet, 'Questionnaires');
  }
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Read existing Excel file and append new data
 * @param {string} filePath - Path to existing Excel file
 * @param {Array} newData - New data to append
 * @param {string} sheetName - Name of the sheet to append to
 * @param {Array} columns - Column definitions
 * @returns {Buffer} Updated Excel file buffer
 */
export const appendToExistingExcel = async (filePath, newData, sheetName, columns) => {
  let workbook;
  
  try {
    // Try to read existing file
    const fileBuffer = await fs.readFile(filePath);
    workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  } catch (error) {
    // File doesn't exist, create new workbook
    workbook = XLSX.utils.book_new();
  }
  
  let worksheet;
  
  if (workbook.Sheets[sheetName]) {
    // Sheet exists, get existing data
    worksheet = workbook.Sheets[sheetName];
    const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Append new data
    const newRows = newData.map(item => 
      columns.map(col => item[col.key] || '')
    );
    
    const updatedData = [...existingData, ...newRows];
    worksheet = XLSX.utils.aoa_to_sheet(updatedData);
  } else {
    // Create new sheet
    const headers = columns.map(col => col.header);
    const rows = newData.map(item => 
      columns.map(col => item[col.key] || '')
    );
    const worksheetData = [headers, ...rows];
    worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  }
  
  // Set column widths
  worksheet['!cols'] = columns.map(col => ({ wch: col.width }));
  
  // Update or add sheet to workbook
  workbook.Sheets[sheetName] = worksheet;
  if (!workbook.SheetNames.includes(sheetName)) {
    workbook.SheetNames.push(sheetName);
  }
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Generate weekly Excel report filename
 * @param {string} type - Type of report ('contact', 'questionnaire', 'combined')
 * @returns {string} Filename with current week
 */
export const generateWeeklyFilename = (type = 'combined') => {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = getWeekNumber(now);
  
  return `customer-data-${type}-${year}-week${weekNumber.toString().padStart(2, '0')}.xlsx`;
};

/**
 * Get ISO week number for a date
 * @param {Date} date - Date to get week number for
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Create email attachment object for SES
 * @param {Buffer} excelBuffer - Excel file buffer
 * @param {string} filename - Attachment filename
 * @returns {Object} SES attachment object
 */
export const createEmailAttachment = (excelBuffer, filename) => {
  return {
    filename: filename,
    content: excelBuffer.toString('base64'),
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    encoding: 'base64'
  };
};

// Export constants individually
export { CONTACT_COLUMNS, QUESTIONNAIRE_COLUMNS };

export default {
  formatContactDataForExcel,
  formatQuestionnaireDataForExcel,
  generateContactExcel,
  generateQuestionnaireExcel,
  generateCombinedExcel,
  appendToExistingExcel,
  generateWeeklyFilename,
  createEmailAttachment,
  CONTACT_COLUMNS,
  QUESTIONNAIRE_COLUMNS
};