import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Lightbulb, Cog, Users2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: <Users2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-300" strokeWidth={1.5} />,
      title: "Financial Auditing",
      description: "Professional audit and assurance services to ensure compliance and financial integrity.",
      features: ["External Audits", "Internal Audits", "Compliance Reviews", "Risk Assessments"]
    },
    {
      icon: <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-300" strokeWidth={1.5} />,
      title: "Tax Services",
      description: "Comprehensive tax planning and compliance services for individuals and businesses.",
      features: ["Tax Planning", "SARS Compliance", "VAT Services", "Tax Optimization"]
    },
    {
      icon: <Cog className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-300" strokeWidth={1.5} />,
      title: "Business Consulting",
      description: "Strategic business advice and financial planning to drive growth and efficiency.",
      features: ["Business Strategy", "Financial Planning", "Performance Analysis", "Growth Consulting"]
    },
    {
      icon: <Lightbulb className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-300" strokeWidth={1.5} />,
      title: "Financial Systems",
      description: "Implementation and optimization of financial systems and accounting software.",
      features: ["QuickBooks Setup", "System Integration", "Process Automation", "Training & Support"]
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
                Our <span className="text-emerald-300 font-extralight" style={{ fontWeight: 200 }}>Services</span>
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-300 leading-relaxed max-w-5xl mx-auto font-light" 
                style={{ fontWeight: 300, lineHeight: '1.4' }}
              >
                Comprehensive consulting solutions designed to address your most critical business challenges 
                and unlock new opportunities for growth.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 sm:py-24 md:py-28">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-7xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12">
                {services.map((service, index) => (
                  <motion.div 
                    key={index} 
                    variants={fadeInUp}
                    className="backdrop-blur-xl bg-slate-800/15 p-10 sm:p-12 rounded-3xl border border-slate-700/25 hover:bg-slate-800/25 hover:border-slate-600/35 transition-all duration-700 cursor-pointer transform hover:-translate-y-3 hover:shadow-2xl group"
                  >
                    <div className="mb-8 group-hover:scale-110 transition-transform duration-500">{service.icon}</div>
                    <h3 className="text-xl sm:text-2xl font-light text-white mb-6 tracking-tight" style={{ fontWeight: 300 }}>
                      {service.title}
                    </h3>
                    <p className="text-base text-slate-400 mb-8 leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
                      {service.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                          <span className="text-slate-300 font-light">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/questionnaire"
                      className="text-emerald-300 font-medium hover:text-emerald-200 transition-colors inline-flex items-center group-hover:translate-x-1 transition-transform duration-300"
                      style={{ fontWeight: 500 }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 sm:py-24 md:py-28 border-t border-slate-700/30">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-6xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-20 sm:mb-24">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white mb-8 sm:mb-10 tracking-tight leading-tight" style={{ fontWeight: 200, letterSpacing: '-0.02em' }}>
                  Our <span className="text-emerald-300">Process</span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-400 leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.4' }}>
                  A proven methodology that ensures successful outcomes for every engagement.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
                {[
                  { step: "01", title: "Discovery", description: "We begin by understanding your unique challenges, goals, and organizational context." },
                  { step: "02", title: "Strategy", description: "Our experts develop customized solutions aligned with your business objectives and market realities." },
                  { step: "03", title: "Implementation", description: "We partner with you to execute the strategy, providing ongoing support and guidance." }
                ].map((phase, index) => (
                  <motion.div 
                    key={index} 
                    variants={fadeInUp}
                    className="text-center backdrop-blur-xl bg-slate-800/15 p-8 sm:p-10 rounded-3xl border border-slate-700/25 hover:bg-slate-800/25 hover:border-slate-600/35 transition-all duration-700 cursor-pointer transform hover:-translate-y-3 hover:shadow-2xl group"
                  >
                    <div className="bg-emerald-500 text-slate-900 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" style={{ fontWeight: 700 }}>
                      {phase.step}
                    </div>
                    <h3 className="text-lg sm:text-xl font-light text-white mb-4 tracking-tight" style={{ fontWeight: 300 }}>
                      {phase.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
                      {phase.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ServicesPage;