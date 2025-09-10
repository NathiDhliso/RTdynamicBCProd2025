import { useMemo } from 'react';
import { BusinessHealthCheckData } from '@/lib/schemas';

// Recalibrated Base Prices based on market analysis from the report
const SERVICE_PRICES = {
    bookkeeping: 3000,
    taxFiling: 2500,
    financialStatements: 4000,
    payrollPEPM: 150, // Per Employee Per Month
    managementAccounts: 5000,
    budgeting: 1000, // Per hour estimate
    cipc: 350,
    virtualCFO: 7500,
    audit: 15000,
};

// --- Multiplier Logic from Granular Model ---

const getRevenueModifier = (revenue: string | undefined): number => {
  switch (revenue) {
    case 'Under R100,000': return 1.0;
    case 'R100,000 - R500,000': return 1.2;
    case 'R500,000 - R2 million': return 1.5;
    case 'R2 million - R10 million': return 2.0;
    case 'R10 million - R50 million': return 3.0;
    case 'Over R50 million': return 4.0;
    default: return 1.0;
  }
};

const getEmployeeCount = (employeeInfo: string | undefined): number => {
    if (!employeeInfo) return 0;
    if (employeeInfo.includes('1-5')) return 5;
    if (employeeInfo.includes('6-20')) return 20;
    if (employeeInfo.includes('21-50')) return 50;
    if (employeeInfo.includes('51-100')) return 100;
    if (employeeInfo.includes('Over 100')) return 150;
    return 0;
};

// Objective "Complexity Matrix" implemented in code
const getComplexityModifier = (formData: Partial<BusinessHealthCheckData>): { modifier: number, factors: string[] } => {
    let modifier = 1.0;
    const factors: string[] = [];

    // Transactional Complexity
    if (formData.dealsForeignCurrency === 'Yes, regularly') {
        modifier += 0.3;
        factors.push('Regular foreign currency transactions (+0.3)');
    }
    // Operational Factors
    if (formData.managesStock === 'Yes, significant stock') {
        modifier += 0.2;
        factors.push('Significant stock/inventory management (+0.2)');
    }
    // Statutory & Compliance Complexity
    if (formData.taxComplexity === 'Complex - Multiple tax obligations') {
        modifier += 0.4;
        factors.push('Complex tax structure (+0.4)');
    }
    if (formData.auditRequirements === 'Annual audit required') {
        modifier += 0.5;
        factors.push('Statutory audit requirement (+0.5)');
    }

    return { modifier, factors };
};

export const calculateQuote = (formData: Partial<BusinessHealthCheckData>) => {
    // This example assumes a client gets a base package of services.
    // In a real implementation, you would check which services the user selected.
    const baseServices = {
        'Bookkeeping': SERVICE_PRICES.bookkeeping,
        'Tax Filing': SERVICE_PRICES.taxFiling,
        'CIPC Annual Returns': SERVICE_PRICES.cipc,
    };
    const basePrice = Object.values(baseServices).reduce((sum, price) => sum + price, 0);

    // Isolate Payroll Calculation
    const employeeCount = getEmployeeCount(formData.employeeCount);
    const payrollCost = formData.hasEmployees === 'Yes, I have employees' ? employeeCount * SERVICE_PRICES.payrollPEPM : 0;

    const revenueModifier = getRevenueModifier(formData.annualRevenue);
    const { modifier: complexityModifier, factors: complexityFactors } = getComplexityModifier(formData);

    const coreServicesPrice = basePrice * revenueModifier * complexityModifier;
    const finalPrice = coreServicesPrice + payrollCost;

    return {
        quote: Math.round(finalPrice / 100) * 100,
        basePrice,
        payrollCost,
        revenueModifier,
        complexityModifier,
        complexityFactors,
        baseServices,
    };
}


export const useQuote = (formData: Partial<BusinessHealthCheckData>) => {
    const quoteDetails = useMemo(() => calculateQuote(formData), [formData]);
    return { ...quoteDetails };
};