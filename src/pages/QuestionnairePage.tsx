import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import Step1 from '@/components/questionnaire/Step1';
import Step2 from '@/components/questionnaire/Step2';
import Step3 from '@/components/questionnaire/Step3';
import Step4 from '@/components/questionnaire/Step4';

const QuestionnairePage: React.FC = () => {
  const { step, prevStep, shouldShowComplianceStep, formData: _formData } = useQuestionnaireStore();

  // Calculate actual progress considering conditional step 3
  const progress = useMemo(() => {
    const showCompliance = shouldShowComplianceStep();
    const actualTotalSteps = showCompliance ? 4 : 3;
    let currentStep = step;
    
    if (!showCompliance && step > 2) {
      // If step 3 is skipped and we're on step 4, count it as step 3
      currentStep = step - 1;
    }
    
    // We subtract 1 from currentStep because we want progress to be 100% at the START of the final step's submission
    return ((currentStep - 1) / actualTotalSteps) * 100;
  }, [step, shouldShowComplianceStep]);

  const stepDisplay = useMemo(() => {
    const showCompliance = shouldShowComplianceStep();
    const actualTotalSteps = showCompliance ? 4 : 3;
    let currentStep = step;
    
    if (!showCompliance && step > 2) {
      currentStep = step - 1;
    }
    
    return `Step ${currentStep} of ${actualTotalSteps}`;
  }, [step, shouldShowComplianceStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden py-20" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sophisticated background layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/15 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="text-center mb-16 sm:mb-20">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight text-white mb-8 sm:mb-10 tracking-tight leading-tight" style={{ fontWeight: 200, letterSpacing: '-0.02em' }}>
                Business <span className="text-emerald-300">Health Check</span>
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-400 leading-relaxed max-w-4xl mx-auto font-light" style={{ fontWeight: 300, lineHeight: '1.4' }}>
                Get personalized recommendations for your business with our comprehensive assessment.
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div variants={fadeInUp} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-300 font-light" style={{ fontWeight: 300 }}>{stepDisplay}</span>
                <span className="text-sm text-emerald-300 font-medium" style={{ fontWeight: 500 }}>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full backdrop-blur-xl bg-slate-800/30 rounded-full h-3 border border-slate-700/40">
                <motion.div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Form Container */}
            <div className="backdrop-blur-xl bg-slate-800/20 rounded-3xl border border-slate-700/30 overflow-hidden shadow-2xl">
              <div className="relative min-h-[600px]">
                <AnimatePresence mode="wait">
                  {step === 1 && <Step1 key="step1" />}
                  {step === 2 && <Step2 key="step2" />}
                  {step === 3 && shouldShowComplianceStep() && <Step3 key="step3" />}
                  {((step === 4) || (step === 3 && !shouldShowComplianceStep())) && <Step4 key="step4" />}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="backdrop-blur-xl bg-slate-800/30 px-8 py-6 flex justify-between items-center border-t border-slate-700/30">
                <button
                  onClick={prevStep}
                  disabled={step === 1}
                  className="flex items-center space-x-2 text-slate-300 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-light" 
                  style={{ fontWeight: 300 }}
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-3">
                  {[1, 2, shouldShowComplianceStep() ? 3 : null, shouldShowComplianceStep() ? 4 : 3].filter(Boolean).map((stepNumber, _index) => (
                    <div
                      key={stepNumber}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        stepNumber === step 
                          ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' 
                          : (shouldShowComplianceStep() ? stepNumber! < step : (stepNumber === 3 && step === 4) || stepNumber! < step)
                            ? 'bg-emerald-500' 
                            : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>

                <div className="w-20" /> {/* Spacer for symmetry */}
              </div>
            </div>

            {/* Info Box */}
            <motion.div variants={fadeInUp} className="mt-10 backdrop-blur-xl bg-slate-800/20 p-8 sm:p-10 rounded-3xl border border-slate-700/30">
              <h3 className="text-xl sm:text-2xl font-light text-white mb-6 tracking-tight" style={{ fontWeight: 300 }}>
                What happens <span className="text-emerald-300">next?</span>
              </h3>
              <ul className="space-y-4 text-slate-400 font-light" style={{ fontWeight: 300 }}>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  We'll analyze your responses to understand your business needs
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  You'll receive personalized recommendations within 24 hours
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  We'll schedule a consultation to discuss your customized solution
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;