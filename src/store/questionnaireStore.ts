import { create } from 'zustand';
import { BusinessHealthCheckData } from '@/lib/schemas';

interface QuestionnaireState {
  step: number;
  totalSteps: number;
  formData: Partial<BusinessHealthCheckData>;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<BusinessHealthCheckData>) => void;
  reset: () => void;
  shouldShowComplianceStep: () => boolean;
}

const initialFormData: Partial<BusinessHealthCheckData> = {
  entityType: '',
  annualRevenue: '',
  companyName: '',
  industry: '',
  hasEmployees: '',
  employeeCount: '',
  managesStock: '',
  dealsForeignCurrency: '',
  taxComplexity: '',
  auditRequirements: '',
  regulatoryReporting: '',
  primaryGoal: '',
  businessChallenges: '',
  contactName: '',
  email: '',
  phoneNumber: '',
};

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  step: 1,
  totalSteps: 4,
  formData: initialFormData,
  
  nextStep: () => set((state) => {
    const { shouldShowComplianceStep } = get();
    let nextStep = state.step + 1;
    
    // Skip step 3 (compliance) if not Pty Ltd
    if (nextStep === 3 && !shouldShowComplianceStep()) {
      nextStep = 4;
    }
    
    return { step: Math.min(nextStep, state.totalSteps) };
  }),
  
  prevStep: () => set((state) => {
    const { shouldShowComplianceStep } = get();
    let prevStep = state.step - 1;
    
    // Skip step 3 (compliance) if not Pty Ltd when going backwards
    if (prevStep === 3 && !shouldShowComplianceStep()) {
      prevStep = 2;
    }
    
    return { step: Math.max(prevStep, 1) };
  }),
  
  updateFormData: (data) => set((state) => ({ 
    formData: { ...state.formData, ...data } 
  })),
  
  reset: () => set({ 
    step: 1, 
    formData: initialFormData 
  }),
  
  shouldShowComplianceStep: () => {
    const { formData } = get();
    return formData.entityType === 'Private Limited (Pty) Ltd';
  },
}));