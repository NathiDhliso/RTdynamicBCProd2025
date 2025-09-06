import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export const businessHealthCheckSchema = z.object({
  // Step 1: Company Information
  entityType: z.string().min(1, 'Entity type is required'),
  annualRevenue: z.string().min(1, 'Annual revenue is required'),
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  
  // Step 2: Operational Complexity
  hasEmployees: z.string().min(1, 'Please specify if you have employees'),
  employeeCount: z.string().optional(),
  managesStock: z.string().min(1, 'Please specify if you manage stock/inventory'),
  dealsForeignCurrency: z.string().min(1, 'Please specify if you deal in foreign currency'),
  
  // Step 3: Compliance (conditional for Pty Ltd only)
  taxComplexity: z.string().optional(),
  auditRequirements: z.string().optional(),
  regulatoryReporting: z.string().optional(),
  
  // Step 4: Goals & Contact
  primaryGoal: z.string().min(1, 'Primary goal is required'),
  businessChallenges: z.string().min(10, 'Please provide more details about your business challenges'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type BusinessHealthCheckData = z.infer<typeof businessHealthCheckSchema>;