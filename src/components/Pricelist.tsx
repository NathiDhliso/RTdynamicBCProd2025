import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const Pricelist = () => {
    // Displaying the recalibrated base prices for the granular model
    const services = [
        { name: 'Bookkeeping', price: 'From R3,000', description: 'Accurate and timely recording of all financial transactions.' },
        { name: 'Tax Filing (VAT & Corp)', price: 'From R2,500', description: 'Comprehensive preparation and submission of tax returns.' },
        { name: 'Annual Financial Statements', price: 'From R4,000', description: 'Compilation of professional, compliant AFS.' },
        { name: 'Payroll', price: 'From R150', description: 'Per employee, per month processing and compliance.' },
        { name: 'Management Accounts', price: 'From R5,000', description: 'Quarterly reports with key insights for decision-making.' },
        { name: 'Virtual CFO', price: 'From R7,500', description: 'Strategic financial oversight and high-level advisory.' },
    ];
  return (
    <section className="py-20 sm:py-24">
    <div className="container mx-auto px-8 sm:px-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center mb-16"
      >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extralight text-white tracking-tight">Our Services</motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-400 mt-4 max-w-2xl mx-auto">
              Our services are priced based on your business's unique size and complexity. Select the services you need and complete our questionnaire for a detailed, transparent quote.
          </motion.p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="bg-slate-800/20 backdrop-blur-lg border border-slate-700/30 rounded-2xl p-8 flex flex-col justify-between"
          >
            <div>
                <h3 className="text-2xl font-light text-white mb-2">{service.name}</h3>
                <p className="text-slate-400 mb-6 text-sm flex-grow">{service.description}</p>
            </div>
            <div>
                <div className="text-3xl font-extralight text-emerald-300 mb-6">{service.price}</div>
                <a
                href="/questionnaire"
                className="w-full bg-slate-700/50 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 text-center flex items-center justify-center group"
                >
                Get a Quote
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
  )
}

export default Pricelist