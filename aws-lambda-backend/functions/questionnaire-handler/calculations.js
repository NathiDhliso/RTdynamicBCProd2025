// Business quote calculation logic
// Preserves all existing pricing models and complexity factors

import { getRevenueMultiplier, getComplexityFactors } from './validation.js';

// Base pricing structure
const BASE_SERVICES = {
  'Sole Proprietor': {
    basePrice: 800,
    services: [
      'Monthly bookkeeping',
      'VAT returns (if applicable)',
      'Annual tax return',
      'Basic financial statements',
      'Tax planning advice'
    ]
  },
  'Partnership': {
    basePrice: 1200,
    services: [
      'Monthly bookkeeping',
      'VAT returns',
      'Partnership tax returns',
      'Partner distribution statements',
      'Financial statements',
      'Tax planning advice'
    ]
  },
  'Close Corporation (CC)': {
    basePrice: 1500,
    services: [
      'Monthly bookkeeping',
      'VAT returns',
      'Corporate tax returns',
      'Annual financial statements',
      'CIPC annual returns',
      'Tax planning advice'
    ]
  },
  'Private Company (Pty Ltd)': {
    basePrice: 2500,
    services: [
      'Monthly bookkeeping',
      'VAT returns',
      'Corporate tax returns',
      'Annual financial statements',
      'CIPC annual returns',
      'Directors\'s resolutions',
      'Compliance monitoring',
      'Tax planning advice'
    ]
  },
  'Public Company': {
    basePrice: 5000,
    services: [
      'Monthly bookkeeping',
      'VAT returns',
      'Corporate tax returns',
      'Audited financial statements',
      'CIPC annual returns',
      'JSE compliance (if listed)',
      'Advanced tax planning',
      'Regulatory compliance'
    ]
  },
  'Trust': {
    basePrice: 1800,
    services: [
      'Monthly bookkeeping',
      'Trust tax returns',
      'Beneficiary statements',
      'Trust deed compliance',
      'Annual financial statements',
      'Tax planning advice'
    ]
  },
  'Non-Profit Organization (NPO)': {
    basePrice: 1000,
    services: [
      'Monthly bookkeeping',
      'NPO annual returns',
      'Donor reporting',
      'Compliance monitoring',
      'Financial statements',
      'Tax exemption maintenance'
    ]
  },
  'Other': {
    basePrice: 1500,
    services: [
      'Monthly bookkeeping',
      'Applicable tax returns',
      'Financial statements',
      'Compliance advice',
      'Tax planning advice'
    ]
  }
};

// Employee count pricing (monthly payroll processing)
const PAYROLL_PRICING = {
  '1-5': 300,
  '6-20': 800,
  '21-50': 1500,
  '51-100': 2500,
  'Over 100': 4000
};

// Complexity modifiers
const COMPLEXITY_MODIFIERS = {
  'Payroll Management': 1.15,
  'Inventory Management': 1.20,
  'Foreign Currency Transactions': 1.25,
  'Corporate Compliance': 1.10,
  'Audit Requirements': 1.30,
  'Complex Tax Structure': 1.20,
  'Extensive Regulatory Reporting': 1.15
};

// Industry-specific modifiers
const INDUSTRY_MODIFIERS = {
  'Accounting & Finance': 1.0,
  'Agriculture & Farming': 1.1,
  'Automotive': 1.15,
  'Construction & Real Estate': 1.2,
  'Consulting & Professional Services': 1.0,
  'Education & Training': 0.95,
  'Energy & Utilities': 1.25,
  'Entertainment & Media': 1.1,
  'Food & Beverage': 1.15,
  'Healthcare & Medical': 1.2,
  'Hospitality & Tourism': 1.1,
  'Information Technology': 1.05,
  'Legal Services': 1.0,
  'Manufacturing': 1.25,
  'Marketing & Advertising': 1.05,
  'Non-Profit': 0.9,
  'Retail & E-commerce': 1.15,
  'Transportation & Logistics': 1.2,
  'Other': 1.0
};

// Main quote calculation function
export const calculateQuote = (formData) => {
  try {
    // Get base pricing for entity type
    const baseService = BASE_SERVICES[formData.entityType];
    if (!baseService) {
      throw new Error(`Unknown entity type: ${formData.entityType}`);
    }
    
    let basePrice = baseService.basePrice;
    const services = [...baseService.services];
    
    // Apply revenue modifier
    const revenueModifier = getRevenueMultiplier(formData.annualRevenue);
    let adjustedPrice = basePrice * revenueModifier;
    
    // Calculate payroll costs
    let payrollCost = 0;
    if (formData.hasEmployees === 'Yes' && formData.employeeCount) {
      payrollCost = PAYROLL_PRICING[formData.employeeCount] || 0;
      if (payrollCost > 0) {
        services.push('Monthly payroll processing');
        services.push('UIF and SDL submissions');
        services.push('Employee tax certificates');
      }
    }
    
    // Get complexity factors
    const complexityFactors = getComplexityFactors(formData);
    
    // Calculate complexity modifier
    let complexityModifier = 1.0;
    complexityFactors.forEach(factor => {
      const modifier = COMPLEXITY_MODIFIERS[factor];
      if (modifier) {
        complexityModifier *= modifier;
      }
    });
    
    // Apply industry modifier
    const industryModifier = INDUSTRY_MODIFIERS[formData.industry] || 1.0;
    
    // Calculate final quote
    const baseWithComplexity = adjustedPrice * complexityModifier * industryModifier;
    const totalQuote = Math.round(baseWithComplexity + payrollCost);
    
    // Add additional services based on complexity
    if (complexityFactors.includes('Inventory Management')) {
      services.push('Stock valuation and management');
      services.push('Cost of goods sold calculations');
    }
    
    if (complexityFactors.includes('Foreign Currency Transactions')) {
      services.push('Foreign exchange accounting');
      services.push('Currency conversion reporting');
    }
    
    if (complexityFactors.includes('Audit Requirements')) {
      services.push('Audit preparation and support');
      services.push('Management letter responses');
    }
    
    if (complexityFactors.includes('Complex Tax Structure')) {
      services.push('Advanced tax planning');
      services.push('Tax optimization strategies');
    }
    
    if (complexityFactors.includes('Extensive Regulatory Reporting')) {
      services.push('Regulatory compliance monitoring');
      services.push('Specialized reporting requirements');
    }
    
    // Ensure minimum quote
    const minimumQuote = 500;
    const finalQuote = Math.max(totalQuote, minimumQuote);
    
    return {
      quote: finalQuote,
      basePrice: basePrice,
      payrollCost: payrollCost,
      revenueModifier: revenueModifier,
      complexityModifier: complexityModifier,
      industryModifier: industryModifier,
      complexityFactors: complexityFactors,
      baseServices: {
        entityType: formData.entityType,
        services: services,
        description: `Comprehensive accounting services for ${formData.entityType}`
      },
      breakdown: {
        basePrice: basePrice,
        revenueAdjustment: Math.round(adjustedPrice - basePrice),
        complexityAdjustment: Math.round(baseWithComplexity - adjustedPrice),
        payrollCost: payrollCost,
        industryAdjustment: Math.round((baseWithComplexity * industryModifier) - baseWithComplexity),
        total: finalQuote
      },
      calculation: {
        step1: `Base price for ${formData.entityType}: R${basePrice}`,
        step2: `Revenue adjustment (${formData.annualRevenue}): R${Math.round(adjustedPrice)} (${revenueModifier}x)`,
        step3: `Complexity adjustment: R${Math.round(baseWithComplexity)} (${complexityModifier.toFixed(2)}x)`,
        step4: `Industry adjustment (${formData.industry}): ${industryModifier}x`,
        step5: `Payroll processing: R${payrollCost}`,
        step6: `Final quote: R${finalQuote}`
      }
    };
    
  } catch (error) {
    console.error('Quote calculation error:', error);
    throw new Error(`Failed to calculate quote: ${error.message}`);
  }
};

// Utility functions for quote calculations
export const getBasePrice = (entityType) => {
  const baseService = BASE_SERVICES[entityType];
  return baseService ? baseService.basePrice : 1500;
};

export const getPayrollCost = (employeeCount) => {
  return PAYROLL_PRICING[employeeCount] || 0;
};

export const calculateComplexityModifier = (complexityFactors) => {
  let modifier = 1.0;
  complexityFactors.forEach(factor => {
    const factorModifier = COMPLEXITY_MODIFIERS[factor];
    if (factorModifier) {
      modifier *= factorModifier;
    }
  });
  return modifier;
};

export const getIndustryModifier = (industry) => {
  return INDUSTRY_MODIFIERS[industry] || 1.0;
};

// Quote validation function
export const validateQuote = (quote) => {
  if (!quote || typeof quote !== 'object') {
    return false;
  }
  
  const requiredFields = ['quote', 'basePrice', 'payrollCost', 'revenueModifier', 'complexityModifier'];
  return requiredFields.every(field => typeof quote[field] === 'number' && quote[field] >= 0);
};

// Format quote for display
export const formatQuote = (quote) => {
  if (!validateQuote(quote)) {
    return 'Quote calculation error';
  }
  
  return {
    monthly: `R${quote.quote.toLocaleString()}`,
    annual: `R${(quote.quote * 12).toLocaleString()}`,
    breakdown: quote.breakdown,
    services: quote.baseServices.services,
    complexityFactors: quote.complexityFactors
  };
};

// Get quote summary for email
export const getQuoteSummary = (quote, formData) => {
  if (!validateQuote(quote)) {
    return 'Quote calculation pending';
  }
  
  return {
    monthlyFee: quote.quote,
    annualFee: quote.quote * 12,
    entityType: formData.entityType,
    companyName: formData.companyName,
    primaryServices: quote.baseServices.services.slice(0, 5), // Top 5 services
    complexityFactors: quote.complexityFactors,
    payrollIncluded: quote.payrollCost > 0,
    calculationDate: new Date().toISOString()
  };
};