import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Globe, TrendingUp, Mail, Briefcase, GraduationCap, Trophy } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const FlipCard = ({ children: _children, frontContent, backContent }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-full w-full cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <div 
          className="absolute inset-0 w-full h-full backdrop-blur-xl bg-slate-800/15 p-8 sm:p-10 rounded-3xl border border-slate-700/25 hover:bg-slate-800/25 hover:border-slate-600/35 transition-all duration-700"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {frontContent}
        </div>
        
        {/* Back Face */}
        <div 
          className="absolute inset-0 w-full h-full backdrop-blur-xl bg-emerald-900/20 p-8 sm:p-10 rounded-3xl border border-emerald-700/30"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};

const FounderFlipCard = ({ founder }) => {
  const frontContent = (
    <div className="h-full flex flex-col">
      <img 
        src={founder.image} 
        alt={founder.name} 
        className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-slate-700/30"
      />
      <h3 className="text-2xl font-light text-white mb-2 text-center" style={{ fontWeight: 300 }}>
        {founder.name}
      </h3>
      <p className="text-emerald-300 text-center mb-4">{founder.title}</p>
      <p className="text-slate-400 text-sm leading-relaxed flex-grow" style={{ fontWeight: 300 }}>
        {founder.bio}
      </p>
      <div className="mt-4 text-center">
        <span className="text-xs text-slate-500">Click to see more details</span>
      </div>
    </div>
  );

  const backContent = (
    <div className="h-full overflow-y-auto">
      <h3 className="text-2xl font-light text-white mb-6" style={{ fontWeight: 300 }}>
        Professional Profile
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-emerald-300 font-medium mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Experience
          </h4>
          <p className="text-slate-300 text-sm">{founder.experience}</p>
        </div>

        <div>
          <h4 className="text-emerald-300 font-medium mb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Education
          </h4>
          <p className="text-slate-300 text-sm">{founder.education}</p>
        </div>

        <div>
          <h4 className="text-emerald-300 font-medium mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Key Achievements
          </h4>
          <ul className="space-y-1">
            {founder.achievements.map((achievement, idx) => (
              <li key={idx} className="text-slate-300 text-sm flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-emerald-300 font-medium mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact
          </h4>
          <a 
            href={`mailto:${founder.email}`} 
            className="text-slate-300 text-sm hover:text-emerald-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {founder.email}
          </a>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <span className="text-xs text-emerald-500">Click to flip back</span>
      </div>
    </div>
  );

  return <FlipCard frontContent={frontContent} backContent={backContent} />;
};

const AboutPage = () => {
  const values = [
    {
      icon: <Award className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-300" strokeWidth={1.5} />,
      title: "Excellence",
      description: "We maintain the highest standards in every engagement, delivering exceptional results that exceed expectations.",
      details: [
        "ISO 9001 certified processes",
        "Industry-leading NPS scores",
        "Award-winning service delivery",
        "Continuous improvement culture"
      ]
    },
    {
      icon: <Users className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-300" strokeWidth={1.5} />,
      title: "Collaboration",
      description: "We work as an extension of your team, fostering open communication and shared ownership of outcomes.",
      details: [
        "Dedicated account management",
        "Regular stakeholder workshops",
        "Transparent project tracking",
        "Cross-functional team integration"
      ]
    },
    {
      icon: <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-300" strokeWidth={1.5} />,
      title: "Innovation",
      description: "We leverage cutting-edge methodologies and emerging technologies to create competitive advantages.",
      details: [
        "AI-powered analytics",
        "Agile transformation expertise",
        "Digital-first strategies",
        "Innovation lab partnerships"
      ]
    },
    {
      icon: <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-300" strokeWidth={1.5} />,
      title: "Impact",
      description: "We focus on measurable business outcomes that drive long-term success and sustainable growth.",
      details: [
        "ROI-focused engagements",
        "Quantifiable success metrics",
        "Long-term value creation",
        "Sustainable business practices"
      ]
    }
  ];

  const founders = [
    {
      name: "Rabelani Neluheni",
      title: "Co-Founder & Lead Auditor",
      bio: "Rabelani Neluheni is a highly experienced Chartered Accountant (CA(SA)) with over 6 years of public practice experience across a wide range of industries, including aviation, manufacturing, automotive, mining, and the public sector. His extensive experience, gained during his time at Deloitte South Africa and Makosi Consulting, has provided him with a deep understanding of financial reporting, South African tax, corporate governance, and compliance. Rabelani is a motivated and hard-working professional with a passion for building valuable relationships and leading teams with empathy and kindness. His major clients have included industry leaders such as ASSORE Ltd, South African Airways (SAA), and Volvo Group Southern Africa.",
      expertise: ["Financial Auditing", "Tax Compliance", "Business Strategy", "Risk Management", "Financial Reporting"],
      experience: "6+ years as Chartered Accountant (SA), SAICA Member, with experience at Deloitte South Africa and Makosi Consulting across aviation, manufacturing, automotive, mining, and public sectors",
      education: "Bachelor of Accounting Sciences, Post Graduate Diploma in Accountancy (CTA)",
      achievements: [
        "Chartered Accountant (SA) qualification with SAICA membership",
        "Experience at Deloitte South Africa and Makosi Consulting",
        "Major clients include ASSORE Ltd, South African Airways (SAA), and Volvo Group Southern Africa",
        "Expert in financial reporting, South African tax, corporate governance, and compliance"
      ],
      image: "/rabelanipic.jpg",
      email: "neluhenirabelani@gmail.com"
    },
    {
      name: "Tshephisho Ntsoane",
      title: "Co-Founder & Financial Strategist",
      bio: "Tshephisho Ntsoane is a distinguished Chartered Accountant (CA(SA)) with over five years of experience in the financial industry, specializing in banking, telecommunications, and the public sector. His dedication and hard work have earned him a reputation as an exceptional finance and tax professional. Tshephisho's background has given him a unique perspective and a formidable skill set that sets him apart in the field of finance. His academic excellence is highlighted by first-time passes in his Board Exams and being the Overall Top Student in his Bachelor of Accountancy program. His recent role as a Specialist in Product Control at Standard Bank Group has further honed his skills in financial reporting, tax compliance, and strategic financial management.",
      expertise: ["Financial Strategy", "Tax Planning", "Business Development", "Financial Analysis", "Compliance Management"],
      experience: "5+ years as Chartered Accountant (SA), SAICA Member, with recent experience as Specialist in Product Control at Standard Bank Group, specializing in banking, telecommunications, and public sector",
      education: "Bachelor of Accountancy (Overall Top Student), Post Graduate Diploma in Accountancy (CTA)",
      achievements: [
        "Chartered Accountant (SA) qualification with first-time Board Exam passes",
        "Overall Top Student in Bachelor of Accountancy program",
        "Specialist in Product Control at Standard Bank Group",
        "Expert in financial reporting, tax compliance, and strategic financial management"
      ],
      image: "/Tshepishopic.png",
      email: "tshephisho@rtdynamicbc.co.za"
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
                Meet the Experts <span className="text-emerald-300 font-extralight" style={{ fontWeight: 200 }}>Behind Your Success</span>
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-300 leading-relaxed max-w-5xl mx-auto font-light" 
                style={{ fontWeight: 300, lineHeight: '1.4' }}
              >
                RT Dynamic is founded on a single principle: every business holds untapped potential. We are the trusted partners for organizations ready for transformational change. Our team, led by seasoned Chartered Accountants, brings a wealth of experience from diverse and demanding industries to the table. We don't just offer services; we build partnerships that foster growth, innovation, and long-term success.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 sm:py-24 md:py-28">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-6xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-20 sm:mb-24">
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-white mb-8 sm:mb-10 tracking-tight leading-tight" style={{ fontWeight: 200, letterSpacing: '-0.02em' }}>
                  Our <span className="text-emerald-300">Mission</span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-400 leading-relaxed max-w-5xl mx-auto font-light" style={{ fontWeight: 300, lineHeight: '1.4' }}>
                  To empower businesses with strategic insights, innovative solutions, and the expertise 
                  needed to navigate complex challenges and achieve sustainable success in an ever-evolving marketplace.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="backdrop-blur-xl bg-slate-800/20 p-10 sm:p-12 rounded-3xl border border-slate-700/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-center">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-light text-white mb-6 tracking-tight" style={{ fontWeight: 300 }}>
                      Our Approach
                    </h3>
                    <p className="text-slate-400 mb-6 leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
                      We believe that lasting change comes from understanding the unique context of each 
                      organization. Our methodology combines proven frameworks with innovative thinking to 
                      deliver customized solutions.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                        <span className="text-slate-300 font-light">Data-driven decision making</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                        <span className="text-slate-300 font-light">Collaborative partnership model</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                        <span className="text-slate-300 font-light">Sustainable implementation</span>
                      </li>
                    </ul>
                  </div>
                  <div className="backdrop-blur-xl bg-slate-800/30 p-8 rounded-2xl border border-slate-700/40">
                    <h4 className="text-xl font-light text-emerald-300 mb-4" style={{ fontWeight: 300 }}>
                      What Sets Us Apart
                    </h4>
                    <p className="text-slate-400 leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
                      Our team combines decades of experience across multiple industries with fresh 
                      perspectives on emerging trends. We don't just provide recommendations—we partner 
                      with you to ensure successful implementation and lasting impact.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-20 sm:py-24 md:py-28">
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
                  Meet Our <span className="text-emerald-300">Founders</span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-5xl mx-auto leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.4' }}>
                  Experienced leaders with a shared vision of transforming businesses through strategic innovation and operational excellence.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 max-w-5xl mx-auto">
                {founders.map((founder, index) => (
                  <motion.div key={index} variants={fadeInUp} className="h-[500px]">
                    <FounderFlipCard founder={founder} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 sm:py-24 md:py-28 border-t border-slate-700/30">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-7xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-20 sm:mb-24">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white mb-8 sm:mb-10 tracking-tight leading-tight" style={{ fontWeight: 200, letterSpacing: '-0.02em' }}>
                  Our Core <span className="text-emerald-300">Values</span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-400 leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.4' }}>
                  The principles that guide every client engagement and business decision.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
                {values.map((value, index) => (
                  <motion.div key={index} variants={fadeInUp} className="h-[320px]">
                    <FlipCard
                      frontContent={
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{value.icon}</div>
                          <h3 className="text-xl sm:text-2xl font-light text-white mb-4 tracking-tight" style={{ fontWeight: 300 }}>
                            {value.title}
                          </h3>
                          <p className="text-slate-400 leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
                            {value.description}
                          </p>
                          <div className="mt-4">
                            <span className="text-xs text-slate-500">Click for details</span>
                          </div>
                        </div>
                      }
                      backContent={
                        <div className="h-full flex flex-col justify-center">
                          <h3 className="text-xl sm:text-2xl font-light text-white mb-4 tracking-tight text-center" style={{ fontWeight: 300 }}>
                            {value.title} in Action
                          </h3>
                          <ul className="space-y-3">
                            {value.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-emerald-400 mr-2 mt-1">•</span>
                                <span className="text-slate-300 text-sm">{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-6 text-center">
                            <span className="text-xs text-emerald-500">Click to flip back</span>
                          </div>
                        </div>
                      }
                    />
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

export default AboutPage;