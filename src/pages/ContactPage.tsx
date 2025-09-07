import React from 'react';
import { useState } from 'react';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Mail, Phone, MapPin, Loader2, Send, CheckCircle } from 'lucide-react';
import { contactFormSchema, ContactFormData } from '@/lib/schemas';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const errorShakeRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // GSAP shake animation for form errors
  useEffect(() => {
    if (Object.keys(errors).length > 0 && !prefersReducedMotion && formRef.current) {
      gsap.to(formRef.current, {
        x: [-10, 10, -8, 8, -6, 6, -4, 4, 0],
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, [errors, prefersReducedMotion]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmittingForm(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message');
      }

      console.log('✅ Message sent successfully:', result);
      setIsSubmitted(true);
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Show error animation
      if (errorShakeRef.current) {
        gsap.to(errorShakeRef.current, {
          x: [-10, 10, -10, 10, 0],
          duration: 0.5,
          ease: "power2.inOut"
        });
      }
      
      // You could add error state here if needed
      alert('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // GSAP success animation
  useEffect(() => {
    if (isSubmitted && !prefersReducedMotion && successRef.current) {
      gsap.fromTo(successRef.current, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, [isSubmitted, prefersReducedMotion]);

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-emerald-300" strokeWidth={1.5} />,
      title: "Email",
      value: "info@rtdynamicbc.co.za",
      description: "Send us an email anytime"
    },
    {
      icon: <Phone className="h-6 w-6 text-emerald-300" strokeWidth={1.5} />,
      title: "Phone",
      value: "073 659 8177",
      description: "Mon-Fri: 8AM-6PM, Sat: 9AM-2PM"
    },
    {
      icon: <MapPin className="h-6 w-6 text-emerald-300" strokeWidth={1.5} />,
      title: "Office",
      value: "1 Diagonal Street, Midrand",
      description: "South Africa"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sophisticated background layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/15 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="text-white py-20 sm:py-24 md:py-28 lg:py-36 relative">
          <div className="absolute -top-1/3 -left-1/3 w-2/3 h-2/3 bg-gradient-to-br from-emerald-500/8 to-slate-400/5 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-slate-600/8 to-emerald-400/6 rounded-full filter blur-2xl"></div>
          
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20 relative z-10">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-6xl mx-auto text-center"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-8 sm:mb-10 leading-[0.9]" 
                style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
              >
                Get In <span className="text-emerald-300 font-extralight" style={{ fontWeight: 200 }}>Touch</span>
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-300 leading-relaxed max-w-5xl mx-auto font-light" 
                style={{ fontWeight: 300, lineHeight: '1.4' }}
              >
                Ready to transform your business? Let's start a conversation about your goals and challenges.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 sm:py-24 md:py-28">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {/* Contact Info */}
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.h2 
                    variants={fadeInUp}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white mb-10 sm:mb-12 tracking-tight" 
                    style={{ fontWeight: 200, letterSpacing: '-0.01em' }}
                  >
                    Let's <span className="text-emerald-300">Connect</span>
                  </motion.h2>
                  <div className="space-y-8">
                    {contactInfo.map((info, index) => (
                      <motion.div 
                        key={index} 
                        variants={fadeInUp}
                        className="flex items-start space-x-4 backdrop-blur-xl bg-slate-800/20 p-6 rounded-2xl border border-slate-700/30 hover:bg-slate-800/30 hover:border-slate-600/40 transition-all duration-500"
                      >
                        <div className="backdrop-blur-xl bg-slate-800/30 p-3 rounded-xl border border-slate-700/40">
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="font-light text-white text-base" style={{ fontWeight: 300 }}>{info.title}</h3>
                          <p className="text-base text-emerald-300 font-medium" style={{ fontWeight: 500 }}>{info.value}</p>
                          <p className="text-slate-400 text-xs font-light" style={{ fontWeight: 300 }}>{info.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div variants={fadeInUp} className="mt-10 p-8 backdrop-blur-xl bg-slate-800/20 rounded-3xl border border-slate-700/30">
                    <h3 className="text-lg sm:text-xl font-light text-white mb-4 tracking-tight" style={{ fontWeight: 300 }}>
                      Prefer a Structured Approach?
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 font-light leading-relaxed" style={{ fontWeight: 300, lineHeight: '1.6' }}>
                      Take our consultation questionnaire to help us understand your specific needs.
                    </p>
                    <button
                      onClick={() => navigate('/questionnaire')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-2xl font-medium transition-all duration-500 inline-flex items-center group shadow-xl hover:shadow-2xl text-base sm:text-lg" 
                      style={{ fontWeight: 500 }}
                    >
                      Start Questionnaire
                      <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                    </button>
                  </motion.div>
                </motion.div>

                {/* Contact Form */}
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="backdrop-blur-xl bg-slate-800/20 p-10 sm:p-12 rounded-3xl border border-slate-700/30"
                  ref={errorShakeRef}
                >
                  <motion.h2 
                    variants={fadeInUp}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white mb-10 sm:mb-12 tracking-tight" 
                    style={{ fontWeight: 200, letterSpacing: '-0.01em' }}
                  >
                    Send us a <span className="text-emerald-300">Message</span>
                  </motion.h2>
                  
                  {/* Success Message */}
                  {isSubmitted && (
                    <motion.div
                      ref={successRef}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-6 backdrop-blur-xl bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 text-emerald-300 mr-3" strokeWidth={1.5} />
                      <div>
                        <p className="text-emerald-200 font-medium" style={{ fontWeight: 500 }}>Message sent successfully!</p>
                        <p className="text-emerald-300 text-sm font-light" style={{ fontWeight: 300 }}>We'll get back to you within 24 hours.</p>
                      </div>
                    </motion.div>
                  )}

                  <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-6">
                      <label htmlFor="name" className="block text-white font-light mb-3 text-base" style={{ fontWeight: 300 }}>
                        Full Name
                      </label>
                      <input
                        id="name"
                        {...register('name')}
                        className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-slate-400 font-light" 
                        style={{ fontWeight: 300 }}
                        placeholder="Your full name"
                    />
                     {errors.name && (
                        <p className="text-red-400 text-sm mt-2 font-light" style={{ fontWeight: 300 }}>{errors.name.message}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label htmlFor="email" className="block text-white font-light mb-3 text-base" style={{ fontWeight: 300 }}>
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-slate-400 font-light" 
                        style={{ fontWeight: 300 }}
                        placeholder="your.email@company.com"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-2 font-light" style={{ fontWeight: 300 }}>{errors.email.message}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label htmlFor="subject" className="block text-white font-light mb-3 text-base" style={{ fontWeight: 300 }}>
                        Subject
                      </label>
                      <input
                        id="subject"
                        {...register('subject')}
                        className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-slate-400 font-light" 
                        style={{ fontWeight: 300 }}
                        placeholder="What can we help you with?"
                      />
                      {errors.subject && (
                        <p className="text-red-400 text-sm mt-2 font-light" style={{ fontWeight: 300 }}>{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="mb-8">
                      <label htmlFor="message" className="block text-white font-light mb-3 text-base" style={{ fontWeight: 300 }}>
                        Message
                      </label>
                      <textarea
                        id="message"
                        {...register('message')}
                        rows={5}
                        className="w-full px-4 py-4 backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 resize-vertical text-white placeholder-slate-400 font-light" 
                        style={{ fontWeight: 300 }}
                        placeholder="Tell us about your project and how we can help..."
                      />
                      {errors.message && (
                        <p className="text-red-400 text-sm mt-2 font-light" style={{ fontWeight: 300 }}>{errors.message.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingForm || isSubmitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium py-4 px-6 rounded-2xl transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl text-base sm:text-lg" 
                      style={{ fontWeight: 500 }}
                    >
                      {(isSubmittingForm || isSubmitting) ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" strokeWidth={1.5} />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-5 w-5" strokeWidth={1.5} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ContactPage;