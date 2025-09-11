import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Settings } from 'lucide-react';
import { z } from 'zod';
import { useQuestionnaireStore } from '@/store/questionnaireStore';

const step2Schema = z.object({
  hasEmployees: z.string().min(1, 'Please specify if you have employees'),
  employeeCount: z.string().optional(),
  managesStock: z.string().min(1, 'Please specify if you manage stock/inventory'),
  dealsForeignCurrency: z.string().min(1, 'Please specify if you deal in foreign currency'),
});

type Step2Data = z.infer<typeof step2Schema>;

const Step2: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useQuestionnaireStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      hasEmployees: formData.hasEmployees || '',
      employeeCount: formData.employeeCount || '',
      managesStock: formData.managesStock || '',
      dealsForeignCurrency: formData.dealsForeignCurrency || '',
    }
  });

  const hasEmployees = watch('hasEmployees');

  const onSubmit = (data: Step2Data) => {
    updateFormData(data);
    nextStep();
  };

  const employeeCounts = [
    '1-5',
    '6-20',
    '21-50',
    '51-100',
    'Over 100'
  ];

  const employeeCountLabels = [
    '1-5 employees',
    '6-20 employees',
    '21-50 employees',
    '51-100 employees',
    'Over 100 employees'
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
          <Settings className="h-8 w-8 text-emerald-300 mr-3" strokeWidth={1.5} />
          <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight" style={{ fontWeight: 200 }}>
            Operational <span className="text-emerald-300">Complexity</span>
          </h2>
        </div>
        <p className="text-slate-400 text-lg font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
          Tell us about your business operations and structure.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Do you have employees? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('hasEmployees')}
                value="Yes"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Yes, I have employees</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('hasEmployees')}
                value="No"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>No, I work alone</span>
            </label>
          </div>
          {errors.hasEmployees && (
            <p className="text-red-500 text-sm mt-1">{errors.hasEmployees.message}</p>
          )}
        </div>

        {hasEmployees === 'Yes' && (
          <div>
            <label htmlFor="employeeCount" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
              How many employees? *
            </label>
            <select
              id="employeeCount"
              {...register('employeeCount')}
              className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white font-light" style={{ fontWeight: 300 }}
            >
              <option value="" className="bg-slate-800 text-white">Select employee count</option>
                {employeeCounts.map((count, index) => (
                  <option key={count} value={count} className="bg-slate-800 text-white">
                    {employeeCountLabels[index]}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Do you manage stock/inventory? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('managesStock')}
                value="Yes"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Yes, I manage stock/inventory</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('managesStock')}
                value="No"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>No, I don't manage stock</span>
            </label>
          </div>
          {errors.managesStock && (
            <p className="text-red-500 text-sm mt-1">{errors.managesStock.message}</p>
          )}
        </div>

        <div>
          <label className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Do you deal in foreign currency? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('dealsForeignCurrency')}
                value="Yes"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>Yes, I deal in foreign currency</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('dealsForeignCurrency')}
                value="No"
                className="mr-3 text-accent focus:ring-accent"
              />
              <span className="text-white font-light" style={{ fontWeight: 300 }}>No, I don't deal in foreign currency</span>
            </label>
          </div>
          {errors.dealsForeignCurrency && (
            <p className="text-red-500 text-sm mt-1">{errors.dealsForeignCurrency.message}</p>
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

export default Step2;