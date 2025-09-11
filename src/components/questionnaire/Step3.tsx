import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { z } from 'zod';
import { useQuestionnaireStore } from '@/store/questionnaireStore';

const step3Schema = z.object({
  taxComplexity: z.string().min(1, 'Tax compliance complexity is required'),
  auditRequirements: z.string().min(1, 'Audit requirements selection is required'),
  regulatoryReporting: z.string().min(1, 'Regulatory reporting selection is required'),
});

type Step3Data = z.infer<typeof step3Schema>;

const Step3: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useQuestionnaireStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      taxComplexity: formData.taxComplexity || '',
      auditRequirements: formData.auditRequirements || '',
      regulatoryReporting: formData.regulatoryReporting || '',
    }
  });

  const onSubmit = (data: Step3Data) => {
    updateFormData(data);
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Shield className="h-8 w-8 text-accent mr-3" />
          <h2 className="text-3xl font-serif font-bold text-white">
            Compliance Requirements
          </h2>
        </div>
        <p className="text-text-secondary">
          As a Private Limited company, we need to understand your compliance obligations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Tax compliance complexity *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('taxComplexity')}
                value="Simple - Basic tax returns"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Simple - Basic tax returns</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('taxComplexity')}
                value="Moderate - Some complexity"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Moderate - Some complexity</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('taxComplexity')}
                value="Complex - Multiple tax obligations"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Complex - Multiple tax obligations</span>
            </label>
          </div>
          {errors.taxComplexity && (
            <p className="text-red-500 text-sm mt-1">{errors.taxComplexity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Audit requirements *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('auditRequirements')}
                value="Annual audit required"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Annual audit required</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('auditRequirements')}
                value="Audit optional"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Audit optional</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('auditRequirements')}
                value="No audit required"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>No audit required</span>
            </label>
          </div>
          {errors.auditRequirements && (
            <p className="text-red-500 text-sm mt-1">{errors.auditRequirements.message}</p>
          )}
        </div>

        <div>
          <label className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Regulatory reporting *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('regulatoryReporting')}
                value="Extensive reporting required"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Extensive reporting required</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('regulatoryReporting')}
                value="Moderate reporting"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Moderate reporting</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('regulatoryReporting')}
                value="Minimal reporting"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Minimal reporting</span>
            </label>
          </div>
          {errors.regulatoryReporting && (
            <p className="text-red-500 text-sm mt-1">{errors.regulatoryReporting.message}</p>
          )}
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 text-white font-light py-4 px-6 rounded-xl hover:bg-slate-700/40 transition-all duration-300 flex items-center justify-center group" style={{ fontWeight: 300 }}
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Previous
          </button>
          <button
            type="submit"
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center group shadow-xl hover:shadow-2xl" style={{ fontWeight: 500 }}
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Step3;