// Questionnaire form validation logic
// Migrated from Joi to native JavaScript for Lambda optimization

export const validateQuestionnaireForm = (data) => {
  const errors = [];
  const cleanData = {};
  
  // Step 1: Company Information
  
  // Validate entityType
  const validEntityTypes = ['Sole Proprietor', 'Partnership', 'Close Corporation (CC)', 'Private Company (Pty Ltd)', 'Public Company', 'Trust', 'Non-Profit Organization (NPO)', 'Other'];
  if (!data.entityType || typeof data.entityType !== 'string') {
    errors.push({
      field: 'entityType',
      message: 'Entity type is required'
    });
  } else if (!validEntityTypes.includes(data.entityType)) {
    errors.push({
      field: 'entityType',
      message: 'Please select a valid entity type'
    });
  } else {
    cleanData.entityType = data.entityType;
  }
  
  // Validate annualRevenue
  const validRevenueRanges = [
    'R0 - R100,000',
    'R100,001 - R500,000',
    'R500,001 - R1,000,000',
    'R1,000,001 - R5,000,000',
    'R5,000,001 - R20,000,000',
    'Over R20,000,000'
  ];
  if (!data.annualRevenue || typeof data.annualRevenue !== 'string') {
    errors.push({
      field: 'annualRevenue',
      message: 'Annual revenue is required'
    });
  } else if (!validRevenueRanges.includes(data.annualRevenue)) {
    errors.push({
      field: 'annualRevenue',
      message: 'Please select a valid revenue range'
    });
  } else {
    cleanData.annualRevenue = data.annualRevenue;
  }
  
  // Validate companyName
  if (!data.companyName || typeof data.companyName !== 'string') {
    errors.push({
      field: 'companyName',
      message: 'Company name is required'
    });
  } else if (data.companyName.trim().length === 0) {
    errors.push({
      field: 'companyName',
      message: 'Company name is required'
    });
  } else if (data.companyName.length > 200) {
    errors.push({
      field: 'companyName',
      message: 'Company name must be less than 200 characters'
    });
  } else {
    cleanData.companyName = data.companyName.trim();
  }
  
  // Validate industry
  const validIndustries = [
    'Accounting & Finance',
    'Agriculture & Farming',
    'Automotive',
    'Construction & Real Estate',
    'Consulting & Professional Services',
    'Education & Training',
    'Energy & Utilities',
    'Entertainment & Media',
    'Food & Beverage',
    'Healthcare & Medical',
    'Hospitality & Tourism',
    'Information Technology',
    'Legal Services',
    'Manufacturing',
    'Marketing & Advertising',
    'Non-Profit',
    'Retail & E-commerce',
    'Transportation & Logistics',
    'Other'
  ];
  if (!data.industry || typeof data.industry !== 'string') {
    errors.push({
      field: 'industry',
      message: 'Industry is required'
    });
  } else if (!validIndustries.includes(data.industry)) {
    errors.push({
      field: 'industry',
      message: 'Please select a valid industry'
    });
  } else {
    cleanData.industry = data.industry;
  }
  
  // Step 2: Operational Complexity
  
  // Validate hasEmployees
  const validYesNoOptions = ['Yes', 'No'];
  if (!data.hasEmployees || typeof data.hasEmployees !== 'string') {
    errors.push({
      field: 'hasEmployees',
      message: 'Please specify if you have employees'
    });
  } else if (!validYesNoOptions.includes(data.hasEmployees)) {
    errors.push({
      field: 'hasEmployees',
      message: 'Please select Yes or No for employees'
    });
  } else {
    cleanData.hasEmployees = data.hasEmployees;
  }
  
  // Validate employeeCount (conditional)
  const validEmployeeCounts = ['1-5', '6-20', '21-50', '51-100', 'Over 100'];
  if (data.hasEmployees === 'Yes') {
    if (!data.employeeCount || typeof data.employeeCount !== 'string') {
      errors.push({
        field: 'employeeCount',
        message: 'Employee count is required when you have employees'
      });
    } else if (!validEmployeeCounts.includes(data.employeeCount)) {
      errors.push({
        field: 'employeeCount',
        message: 'Please select a valid employee count range'
      });
    } else {
      cleanData.employeeCount = data.employeeCount;
    }
  } else {
    cleanData.employeeCount = '';
  }
  
  // Validate managesStock
  if (!data.managesStock || typeof data.managesStock !== 'string') {
    errors.push({
      field: 'managesStock',
      message: 'Please specify if you manage stock/inventory'
    });
  } else if (!validYesNoOptions.includes(data.managesStock)) {
    errors.push({
      field: 'managesStock',
      message: 'Please select Yes or No for stock management'
    });
  } else {
    cleanData.managesStock = data.managesStock;
  }
  
  // Validate dealsForeignCurrency
  if (!data.dealsForeignCurrency || typeof data.dealsForeignCurrency !== 'string') {
    errors.push({
      field: 'dealsForeignCurrency',
      message: 'Please specify if you deal in foreign currency'
    });
  } else if (!validYesNoOptions.includes(data.dealsForeignCurrency)) {
    errors.push({
      field: 'dealsForeignCurrency',
      message: 'Please select Yes or No for foreign currency'
    });
  } else {
    cleanData.dealsForeignCurrency = data.dealsForeignCurrency;
  }
  
  // Step 3: Compliance (conditional for Pty Ltd only)
  
  if (data.entityType === 'Private Company (Pty Ltd)') {
    // Validate taxComplexity
    const validComplexityLevels = ['Simple', 'Moderate', 'Complex'];
    if (!data.taxComplexity || typeof data.taxComplexity !== 'string') {
      errors.push({
        field: 'taxComplexity',
        message: 'Tax complexity is required for Pty Ltd companies'
      });
    } else if (!validComplexityLevels.includes(data.taxComplexity)) {
      errors.push({
        field: 'taxComplexity',
        message: 'Please select a valid tax complexity level'
      });
    } else {
      cleanData.taxComplexity = data.taxComplexity;
    }
    
    // Validate auditRequirements
    const validAuditOptions = ['Required', 'Voluntary', 'Not Required'];
    if (!data.auditRequirements || typeof data.auditRequirements !== 'string') {
      errors.push({
        field: 'auditRequirements',
        message: 'Audit requirements are required for Pty Ltd companies'
      });
    } else if (!validAuditOptions.includes(data.auditRequirements)) {
      errors.push({
        field: 'auditRequirements',
        message: 'Please select a valid audit requirement option'
      });
    } else {
      cleanData.auditRequirements = data.auditRequirements;
    }
    
    // Validate regulatoryReporting
    const validReportingOptions = ['Minimal', 'Standard', 'Extensive'];
    if (!data.regulatoryReporting || typeof data.regulatoryReporting !== 'string') {
      errors.push({
        field: 'regulatoryReporting',
        message: 'Regulatory reporting is required for Pty Ltd companies'
      });
    } else if (!validReportingOptions.includes(data.regulatoryReporting)) {
      errors.push({
        field: 'regulatoryReporting',
        message: 'Please select a valid regulatory reporting option'
      });
    } else {
      cleanData.regulatoryReporting = data.regulatoryReporting;
    }
  } else {
    // Set defaults for non-Pty Ltd entities
    cleanData.taxComplexity = '';
    cleanData.auditRequirements = '';
    cleanData.regulatoryReporting = '';
  }
  
  // Step 4: Goals & Contact
  
  // Validate primaryGoal
  const validGoals = [
    'Improve Financial Management',
    'Ensure Tax Compliance',
    'Reduce Accounting Costs',
    'Prepare for Growth/Investment',
    'Streamline Business Processes',
    'Get Strategic Business Advice',
    'Other'
  ];
  if (!data.primaryGoal || typeof data.primaryGoal !== 'string') {
    errors.push({
      field: 'primaryGoal',
      message: 'Primary goal is required'
    });
  } else if (!validGoals.includes(data.primaryGoal)) {
    errors.push({
      field: 'primaryGoal',
      message: 'Please select a valid primary goal'
    });
  } else {
    cleanData.primaryGoal = data.primaryGoal;
  }
  
  // Validate businessChallenges
  if (!data.businessChallenges || typeof data.businessChallenges !== 'string') {
    errors.push({
      field: 'businessChallenges',
      message: 'Please provide details about your business challenges'
    });
  } else if (data.businessChallenges.trim().length < 10) {
    errors.push({
      field: 'businessChallenges',
      message: 'Please provide more details about your business challenges'
    });
  } else if (data.businessChallenges.length > 2000) {
    errors.push({
      field: 'businessChallenges',
      message: 'Business challenges description must be less than 2000 characters'
    });
  } else {
    cleanData.businessChallenges = data.businessChallenges.trim();
  }
  
  // Validate contactName
  if (!data.contactName || typeof data.contactName !== 'string') {
    errors.push({
      field: 'contactName',
      message: 'Contact name is required'
    });
  } else if (data.contactName.trim().length === 0) {
    errors.push({
      field: 'contactName',
      message: 'Contact name is required'
    });
  } else if (data.contactName.length > 100) {
    errors.push({
      field: 'contactName',
      message: 'Contact name must be less than 100 characters'
    });
  } else {
    cleanData.contactName = data.contactName.trim();
  }
  
  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    errors.push({
      field: 'email',
      message: 'Email is required'
    });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = data.email.trim().toLowerCase();
    
    if (email.length === 0) {
      errors.push({
        field: 'email',
        message: 'Email is required'
      });
    } else if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        message: 'Please provide a valid email address'
      });
    } else {
      cleanData.email = email;
    }
  }
  
  // Validate phoneNumber
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    errors.push({
      field: 'phoneNumber',
      message: 'Phone number is required'
    });
  } else if (data.phoneNumber.trim().length === 0) {
    errors.push({
      field: 'phoneNumber',
      message: 'Phone number is required'
    });
  } else if (data.phoneNumber.length > 20) {
    errors.push({
      field: 'phoneNumber',
      message: 'Phone number must be less than 20 characters'
    });
  } else {
    // Basic phone number validation (South African format)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(data.phoneNumber)) {
      errors.push({
        field: 'phoneNumber',
        message: 'Please provide a valid phone number'
      });
    } else {
      cleanData.phoneNumber = data.phoneNumber.trim();
    }
  }
  
  // Validate quoteDetails (optional - calculated on frontend or backend)
  if (data.quoteDetails && typeof data.quoteDetails === 'object') {
    const quote = data.quoteDetails;
    
    // Validate quote structure if provided
    if (typeof quote.quote === 'number' && quote.quote >= 0) {
      cleanData.quoteDetails = {
        quote: quote.quote,
        basePrice: quote.basePrice || 0,
        payrollCost: quote.payrollCost || 0,
        revenueModifier: quote.revenueModifier || 1,
        complexityModifier: quote.complexityModifier || 1,
        complexityFactors: Array.isArray(quote.complexityFactors) ? quote.complexityFactors : [],
        baseServices: quote.baseServices || {}
      };
    }
  }
  
  // Additional business logic validations
  
  // Check for consistency between entity type and compliance requirements
  if (cleanData.entityType === 'Private Company (Pty Ltd)') {
    if (!cleanData.taxComplexity || !cleanData.auditRequirements || !cleanData.regulatoryReporting) {
      errors.push({
        field: 'entityType',
        message: 'Pty Ltd companies must complete the compliance section'
      });
    }
  }
  
  // Check for consistency between having employees and employee count
  if (cleanData.hasEmployees === 'Yes' && !cleanData.employeeCount) {
    errors.push({
      field: 'employeeCount',
      message: 'Employee count is required when you have employees'
    });
  }
  
  // Validate revenue range makes sense for entity type
  if (cleanData.entityType === 'Sole Proprietor' && cleanData.annualRevenue === 'Over R20,000,000') {
    errors.push({
      field: 'annualRevenue',
      message: 'Revenue range seems unusually high for a sole proprietor'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    data: cleanData
  };
};

// Utility functions for questionnaire validation
export const isValidEntityType = (entityType) => {
  const validTypes = ['Sole Proprietor', 'Partnership', 'Close Corporation (CC)', 'Private Company (Pty Ltd)', 'Public Company', 'Trust', 'Non-Profit Organization (NPO)', 'Other'];
  return validTypes.includes(entityType);
};

export const requiresComplianceSection = (entityType) => {
  return entityType === 'Private Company (Pty Ltd)';
};

export const getRevenueMultiplier = (revenueRange) => {
  const multipliers = {
    'R0 - R100,000': 0.8,
    'R100,001 - R500,000': 1.0,
    'R500,001 - R1,000,000': 1.2,
    'R1,000,001 - R5,000,000': 1.5,
    'R5,000,001 - R20,000,000': 2.0,
    'Over R20,000,000': 2.5
  };
  return multipliers[revenueRange] || 1.0;
};

export const getComplexityFactors = (formData) => {
  const factors = [];
  
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