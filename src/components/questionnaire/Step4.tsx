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
import { calculateQuote } from '@/hooks/useQuote';

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
      
      // Calculate the quote to be sent internally
      const quoteDetails = calculateQuote(completeData);

      const payload = {
        ...completeData,
        quoteDetails, // Add the calculated quote to the payload
      };

      console.log('📊 Submitting Business Health Check with Quote:', payload);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://rtdbc-production.eba-pz5m2ibp.us-east-1.elasticbeanstalk.com');
      const response = await fetch(`${API_BASE_URL}/api/questionnaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit questionnaire');
      }

      console.log('✅ Questionnaire submitted successfully:', result);
      setIsSubmitted(true);
      
      // Reset form after a delay to allow user to read the message
      setTimeout(() => {
        reset();
      }, 8000);

    } catch (error) {
      console.error('❌ Error submitting questionnaire:', error);
      alert('Failed to submit questionnaire. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // GSAP success animation
  useEffect(() => {
    if (isSubmitted && !prefersReducedMotion && successIconRef.current) {
      gsap.fromTo(successIconRef.current, 
        { scale: 0, opacity: 0, rotation: -180 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
      );
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
        className="p-8 text-center flex flex-col items-center justify-center min-h-[600px]"
      >
        <div ref={successIconRef}>
          <CheckCircle className="h-16 w-16 text-emerald-400 mb-6" />
        </div>
        <h2 className="text-3xl font-extralight text-white mb-4">
          Thank You, {formData.contactName}!
        </h2>
        <p className="text-slate-400 mb-4 max-w-md mx-auto leading-relaxed">
          Your Business Health Check has been submitted. We're analyzing your responses to prepare your customized recommendations.
        </p>
        <p className="text-sm text-slate-500">
          We will contact you at <span className="font-medium text-slate-400">{formData.email}</span> within 24 hours to discuss the next steps.
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
      className="p-10 sm:p-12"
    >
      <div className="mb-10">
        <div className="flex items-center mb-6">
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
        {/* ... form fields remain the same ... */}
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
            placeholder="Please describe your current business challenges, pain points, and areas where you need support..."
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