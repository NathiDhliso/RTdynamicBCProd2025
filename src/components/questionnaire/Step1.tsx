import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Building2 } from 'lucide-react';
import { z } from 'zod';
import { useQuestionnaireStore } from '@/store/questionnaireStore';

const step1Schema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  annualRevenue: z.string().min(1, 'Annual revenue is required'),
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
});

type Step1Data = z.infer<typeof step1Schema>;

const Step1: React.FC = () => {
  const { formData, updateFormData, nextStep } = useQuestionnaireStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      entityType: formData.entityType || '',
      annualRevenue: formData.annualRevenue || '',
      companyName: formData.companyName || '',
      industry: formData.industry || '',
    }
  });

  const onSubmit = (data: Step1Data) => {
    updateFormData(data);
    nextStep();
  };

  const entityTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Private Limited (Pty) Ltd',
    'Public Company',
    'Non-Profit Organization'
  ];

  const revenueRanges = [
    'Under R100,000',
    'R100,000 - R500,000',
    'R500,000 - R2 million',
    'R2 million - R10 million',
    'R10 million - R50 million',
    'Over R50 million'
  ];

  const industries = [
    'Manufacturing',
    'Retail/Wholesale',
    'Professional Services',
    'Technology',
    'Healthcare',
    'Construction',
    'Agriculture',
    'Other'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-10 sm:p-12"
    >
      <div className="mb-10">
        <div className="flex items-center mb-6">
          <Building2 className="h-8 w-8 text-emerald-300 mr-3" strokeWidth={1.5} />
          <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight" style={{ fontWeight: 200 }}>
            Company <span className="text-emerald-300">Information</span>
          </h2>
        </div>
        <p className="text-slate-400 text-lg font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
          Let's start with some basic details about your business.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <label htmlFor="entityType" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Entity Type *
          </label>
          <select
            id="entityType"
            {...register('entityType', {
              onChange: (e) => {
                updateFormData({ entityType: e.target.value });
              }
            })}
            className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white font-light" style={{ fontWeight: 300 }}
          >
            <option value="">Select your entity type</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.entityType && (
            <p className="text-red-400 text-sm mt-2 font-light" style={{ fontWeight: 300 }}>{errors.entityType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="annualRevenue" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Annual Revenue *
          </label>
          <select
            id="annualRevenue"
            {...register('annualRevenue')}
            className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white font-light" style={{ fontWeight: 300 }}
          >
            <option value="">Select your annual revenue range</option>
            {revenueRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          {errors.annualRevenue && (
            <p className="text-red-400 text-sm mt-2 font-light" style={{ fontWeight: 300 }}>{errors.annualRevenue.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="companyName" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Company Name *
          </label>
          <input
            id="companyName"
            {...register('companyName')}
            className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-slate-400 font-light" style={{ fontWeight: 300 }}
            placeholder="Enter your company name"
          />
          {errors.companyName && (
            <p className="text-red-400 text-sm mt-2 font-light" style={{ fontWeight: 300 }}>{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="industry" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Industry *
          </label>
          <select
            id="industry"
            {...register('industry')}
            className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white font-light" style={{ fontWeight: 300 }}
          >
            <option value="">Select your industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="text-red-400 text-sm mt-2 font-light" style={{ fontWeight: 300 }}>{errors.industry.message}</p>
          )}
        </div>

        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium py-4 px-6 rounded-2xl transition-all duration-500 flex items-center justify-center group shadow-xl hover:shadow-2xl" style={{ fontWeight: 500 }}
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Step1;