import React from 'react';
import { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Send, Loader2, CheckCircle, ArrowLeft, Target } from 'lucide-react';
import { z } from 'zod';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const step4Schema = z.object({
  primaryGoal: z.string().min(1, 'Primary goal is required'),
  businessChallenges: z.string().min(10, 'Please provide more details about your business challenges'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

type Step4Data = z.infer<typeof step4Schema>;

const Step4: React.FC = () => {
  const { formData, updateFormData, reset, prevStep } = useQuestionnaireStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const successIconRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      primaryGoal: formData.primaryGoal || '',
      businessChallenges: formData.businessChallenges || '',
      contactName: formData.contactName || '',
      email: formData.email || '',
      phoneNumber: formData.phoneNumber || '',
    }
  });

  const onSubmit = async (data: Step4Data) => {
    updateFormData(data);
    setIsSubmitting(true);
    
    try {
      // Get the complete form data
      const completeData = { ...formData, ...data };
      console.log('📊 Submitting Business Health Check:', completeData);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/questionnaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit questionnaire');
      }

      console.log('✅ Questionnaire submitted successfully:', result);
      setIsSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        reset();
        setIsSubmitted(false);
      }, 5000);

    } catch (error) {
      console.error('❌ Error submitting questionnaire:', error);
      
      // You could add error state here if needed
      alert('Failed to submit questionnaire. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // GSAP success animation
  useEffect(() => {
    if (isSubmitted && !prefersReducedMotion && successIconRef.current) {
      const tl = gsap.timeline();
      
      gsap.set(successIconRef.current, { scale: 0, rotation: -180 });
      
      tl.to(successIconRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      })
      .to(successIconRef.current, {
        scale: 1.1,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      });
    }
  }, [isSubmitted, prefersReducedMotion]);

  const primaryGoals = [
    'Reduce costs',
    'Improve efficiency',
    'Ensure compliance',
    'Growth planning',
    'Risk management'
  ];

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 text-center flex flex-col items-center justify-center min-h-[500px]"
      >
        <div ref={successIconRef}>
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-4">
          Thank You!
        </h2>
        <p className="text-text-secondary mb-4 max-w-md">
          Your Business Health Check has been submitted successfully. We'll analyze your responses and provide customized recommendations.
        </p>
        <p className="text-sm text-text-secondary">
          We'll contact you within 24 hours with your personalized business assessment and consultation options.
        </p>
      </motion.div>
    );
  }

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
          <Target className="h-8 w-8 text-emerald-300 mr-3" strokeWidth={1.5} />
          <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight" style={{ fontWeight: 200 }}>
            Goals & <span className="text-emerald-300">Contact</span>
          </h2>
        </div>
        <p className="text-slate-400 text-lg font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
          Finally, tell us about your objectives and how we can reach you.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Primary Goal *
          </label>
          <div className="space-y-2">
            {primaryGoals.map((goal) => (
              <label key={goal} className="flex items-center">
                <input
                  type="radio"
                  {...register('primaryGoal')}
                  value={goal}
                  className="mr-3 text-accent focus:ring-accent"
                />
                <span className="text-white font-light" style={{ fontWeight: 300 }}>{goal}</span>
              </label>
            ))}
          </div>
          {errors.primaryGoal && (
            <p className="text-red-500 text-sm mt-1">{errors.primaryGoal.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessChallenges" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            What are your main business challenges? *
          </label>
          <textarea
            id="businessChallenges"
            {...register('businessChallenges')}
            rows={5}
            className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-slate-400 font-light resize-vertical" style={{ fontWeight: 300 }}
            placeholder="Please describe your current business challenges, pain points, and areas where you need support. The more detail you provide, the better we can tailor our recommendations to your specific needs..."
          />
          {errors.businessChallenges && (
            <p className="text-red-500 text-sm mt-1">{errors.businessChallenges.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contactName" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
              Contact Name *
            </label>
            <input
              id="contactName"
              {...register('contactName')}
              className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-slate-400 font-light" style={{ fontWeight: 300 }}
              placeholder="Your full name"
            />
            {errors.contactName && (
              <p className="text-red-500 text-sm mt-1">{errors.contactName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
              Phone Number *
            </label>
            <input
              id="phoneNumber"
              {...register('phoneNumber')}
              className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-slate-400 font-light" style={{ fontWeight: 300 }}
              placeholder="Your phone number"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-white font-light mb-3 text-lg" style={{ fontWeight: 300 }}>
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-slate-400 font-light" style={{ fontWeight: 300 }}
            placeholder="your.email@company.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Summary */}
        <div className="backdrop-blur-xl bg-slate-800/20 border border-slate-700/30 p-6 rounded-xl">
          <h3 className="text-lg font-light text-white mb-4" style={{ fontWeight: 300 }}>Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <p><span className="font-medium">Company:</span> {formData.companyName || 'Not specified'}</p>
              <p><span className="font-medium">Entity Type:</span> {formData.entityType || 'Not specified'}</p>
              <p><span className="font-medium">Industry:</span> {formData.industry || 'Not specified'}</p>
            </div>
            <div>
              <p><span className="font-medium">Revenue:</span> {formData.annualRevenue || 'Not specified'}</p>
              <p><span className="font-medium">Employees:</span> {formData.hasEmployees || 'Not specified'}</p>
              <p><span className="font-medium">Stock:</span> {formData.managesStock || 'Not specified'}</p>
            </div>
          </div>
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
            disabled={isSubmitting}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl hover:shadow-2xl" style={{ fontWeight: 500 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Health Check
                <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Step4;