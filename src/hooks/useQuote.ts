import { useMemo } from 'react';
import { BusinessHealthCheckData } from '@/lib/schemas';

// Base pricing structure matching backend calculations
const BASE_SERVICES = {
  'Sole Proprietor': 800,
  'Partnership': 1200,
  'Close Corporation (CC)': 1500,
  'Private Company (Pty Ltd)': 2500,
  'Public Company': 5000,
  'Trust': 1800,
  'Non-Profit Organization (NPO)': 1000,
  'Other': 1500
};

// Employee count pricing (monthly payroll processing)
const PAYROLL_PRICING = {
  '1-5': 300,
  '6-20': 800,
  '21-50': 1500,
  '51-100': 2500,
  'Over 100': 4000
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

// --- Multiplier Logic from Granular Model ---

const getRevenueModifier = (revenue: string | undefined): number => {
  switch (revenue) {
    case 'R0 - R100,000': return 0.8;
    case 'R100,001 - R500,000': return 1.0;
    case 'R500,001 - R1,000,000': return 1.2;
    case 'R1,000,001 - R5,000,000': return 1.5;
    case 'R5,000,001 - R20,000,000': return 2.0;
    case 'Over R20,000,000': return 2.5;
    default: return 1.0;
  }
};

const getPayrollCost = (hasEmployees: string | undefined, employeeCount: string | undefined): number => {
    if (hasEmployees !== 'Yes' || !employeeCount) return 0;
    return PAYROLL_PRICING[employeeCount as keyof typeof PAYROLL_PRICING] || 0;
};

// Complexity modifiers matching backend logic
const COMPLEXITY_MODIFIERS = {
  'Payroll Management': 1.15,
  'Inventory Management': 1.20,
  'Foreign Currency Transactions': 1.25,
  'Corporate Compliance': 1.10,
  'Audit Requirements': 1.30,
  'Complex Tax Structure': 1.20,
  'Extensive Regulatory Reporting': 1.15
};

const getComplexityFactors = (formData: Partial<BusinessHealthCheckData>): string[] => {
  const factors: string[] = [];
  
  if (formData.hasEmployees === 'Yes') {
    factors.push('Payroll Management');
  }
  
  if (formData.managesStock === 'Yes') {
    factors.push('Inventory Management');
  }
  
  if (formData.dealsForeignCurrency === 'Yes') {
    factors.push('Foreign Currency Transactions');
  }
  
  if (formData.entityType === 'Private Company (Pty Ltd)') {
    factors.push('Corporate Compliance');
    
    if (formData.auditRequirements === 'Required') {
      factors.push('Audit Requirements');
    }
    
    if (formData.taxComplexity === 'Complex') {
      factors.push('Complex Tax Structure');
    }
    
    if (formData.regulatoryReporting === 'Extensive') {
      factors.push('Extensive Regulatory Reporting');
    }
  }
  
  return factors;
};

const getComplexityModifier = (formData: Partial<BusinessHealthCheckData>): { modifier: number, factors: string[] } => {
    const factors = getComplexityFactors(formData);
    let modifier = 1.0;
    
    factors.forEach(factor => {
      const factorModifier = COMPLEXITY_MODIFIERS[factor as keyof typeof COMPLEXITY_MODIFIERS];
      if (factorModifier) {
        modifier *= factorModifier;
      }
    });

    return { modifier, factors };
};

export const calculateQuote = (formData: Partial<BusinessHealthCheckData>) => {
    try {
        // Get base pricing for entity type
        const basePrice = BASE_SERVICES[formData.entityType as keyof typeof BASE_SERVICES] || 1500;
        
        // Apply revenue modifier
        const revenueModifier = getRevenueModifier(formData.annualRevenue);
        const adjustedPrice = basePrice * revenueModifier;
        
        // Calculate payroll costs
        const payrollCost = getPayrollCost(formData.hasEmployees, formData.employeeCount);
        
        // Get complexity factors and modifier
        const { modifier: complexityModifier, factors: complexityFactors } = getComplexityModifier(formData);
        
        // Apply industry modifier
        const industryModifier = INDUSTRY_MODIFIERS[formData.industry as keyof typeof INDUSTRY_MODIFIERS] || 1.0;
        
        // Calculate final quote
        const baseWithComplexity = adjustedPrice * complexityModifier * industryModifier;
        const totalQuote = Math.round(baseWithComplexity + payrollCost);
        
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
                description: `Comprehensive accounting services for ${formData.entityType}`
            },
            breakdown: {
                basePrice: basePrice,
                revenueAdjustment: Math.round(adjustedPrice - basePrice),
                complexityAdjustment: Math.round(baseWithComplexity - adjustedPrice),
                payrollCost: payrollCost,
                industryAdjustment: Math.round((baseWithComplexity * industryModifier) - baseWithComplexity),
                total: finalQuote
            }
        };
        
    } catch (error) {
        console.error('Quote calculation error:', error);
        // Return fallback quote
        return {
            quote: 1500,
            basePrice: 1500,
            payrollCost: 0,
            revenueModifier: 1.0,
            complexityModifier: 1.0,
            industryModifier: 1.0,
            complexityFactors: [],
            baseServices: {
                entityType: formData.entityType || 'Other',
                description: 'Basic accounting services'
            },
            breakdown: {
                basePrice: 1500,
                revenueAdjustment: 0,
                complexityAdjustment: 0,
                payrollCost: 0,
                industryAdjustment: 0,
                total: 1500
            }
        };
    }
}


export const useQuote = (formData: Partial<BusinessHealthCheckData>) => {
    const quoteDetails = useMemo(() => calculateQuote(formData), [formData]);
    return { ...quoteDetails };
};