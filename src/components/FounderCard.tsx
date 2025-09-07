import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Mail, Award, GraduationCap, Trophy } from 'lucide-react';

// Custom hook for reduced motion preference
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
};

interface FounderCardProps {
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  experience: string;
  education: string;
  achievements: string[];
  image: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

const FounderCard: React.FC<FounderCardProps> = ({
  name,
  title,
  _bio,
  expertise,
  experience,
  _education,
  achievements,
  image,
  linkedin,
  twitter,
  email,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const _prefersReducedMotion = usePrefersReducedMotion();

  const handleFlip = (e: React.MouseEvent) => {
    // Don't flip if clicking on scrollable content or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('.custom-scrollbar') || target.closest('a')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="h-[550px] sm:h-[600px] md:h-[550px] mb-4 sm:mb-6 md:mb-0 relative cursor-pointer"
      style={{ perspective: '1500px' }}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 1.0, type: "spring", stiffness: 80 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white relative">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-24 h-24 border-2 border-white/30 rounded-full animate-pulse" />
              <div className="absolute bottom-4 left-4 w-20 h-20 border-2 border-white/20 rounded-lg animate-pulse delay-75" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full animate-spin-slow" />
            </div>
            
            <div className="p-6 sm:p-8 h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg overflow-hidden transform-gpu" style={{
                    transform: 'translateZ(30px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.4), 0 8px 16px rgba(16, 185, 129, 0.2) inset, 0 0 20px rgba(16, 185, 129, 0.3)'
                  }}>
                    <img 
                      src={image} 
                      alt={name} 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Award className="h-12 w-12 text-white drop-shadow-lg hidden" />
                  </div>
                  <h3 className="font-bold text-2xl mb-2 transform-gpu" style={{ 
                    textShadow: '0 4px 8px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3)',
                    transform: 'translateZ(20px)'
                  }}>{name}</h3>
                  <p className="text-white/90 text-sm mb-3 transform-gpu" style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    transform: 'translateZ(15px)'
                  }}>{title}</p>
                  <div className="bg-gradient-to-r from-emerald-500/30 to-blue-500/30 backdrop-blur-sm text-white border border-white/40 px-4 py-1.5 rounded-full text-xs inline-block font-semibold shadow-lg transform-gpu" style={{
                    transform: 'translateZ(22px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3), 0 4px 8px rgba(16, 185, 129, 0.2) inset',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    CA(SA) • SAICA Member
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-center text-emerald-300 transform-gpu" style={{
                    textShadow: '0 0 10px rgba(16, 185, 129, 0.5), 0 4px 8px rgba(0,0,0,0.3)',
                    transform: 'translateZ(25px)'
                  }}>Core Expertise</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {expertise.slice(0, 6).map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-lg p-2.5 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu"
                        style={{
                          transform: 'translateZ(10px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.3), 0 4px 8px rgba(255,255,255,0.1) inset'
                        }}
                      >
                        <span className="text-xs font-medium transform-gpu" style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(255,255,255,0.2)',
                          transform: 'translateZ(5px)'
                        }}>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <div className="flex justify-center space-x-4 mb-3">
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-emerald-300 transition-all duration-300 transform hover:scale-110 transform-gpu"
                      style={{
                        transform: 'translateZ(15px)',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(16, 185, 129, 0.2))'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin className="h-6 w-6" />
                    </a>
                  )}
                  {twitter && (
                    <a
                      href={twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-blue-300 transition-all duration-300 transform hover:scale-110 transform-gpu"
                      style={{
                        transform: 'translateZ(15px)',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(59, 130, 246, 0.2))'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="text-white/70 hover:text-amber-300 transition-all duration-300 transform hover:scale-110 transform-gpu"
                      style={{
                        transform: 'translateZ(15px)',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(245, 158, 11, 0.2))'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-6 w-6" />
                    </a>
                  )}
                </div>
                <span className="text-white/60 text-xs font-medium animate-pulse transform-gpu" style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.2)',
                  transform: 'translateZ(12px)'
                }}>Click to view details →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl shadow-2xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="grid grid-cols-8 grid-rows-8 h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-emerald-500/20 animate-pulse" style={{ animationDelay: `${i * 20}ms` }} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-5 h-full flex flex-col relative z-10">
              <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="text-center mb-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm shadow-lg">
                    <GraduationCap className="h-6 w-6 text-emerald-300" />
                  </div>
                  <h3 className="font-bold text-base mb-1 transform-gpu" style={{
                    textShadow: '0 4px 8px rgba(0,0,0,0.6), 0 0 12px rgba(16, 185, 129, 0.3)',
                    transform: 'translateZ(20px)'
                  }}>{name}</h3>
                  <p className="text-gray-300 text-xs mb-1 transform-gpu" style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    transform: 'translateZ(15px)'
                  }}>{title}</p>
                  <p className="text-emerald-400 text-xs font-semibold transform-gpu" style={{
                    textShadow: '0 0 8px rgba(16, 185, 129, 0.6), 0 2px 4px rgba(0,0,0,0.4)',
                    transform: 'translateZ(18px)'
                  }}>CA(SA), SAICA Member</p>
                </div>
                
                {/* Content Section - Condensed */}
                <div className="flex-1 space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm transform-gpu" style={{
                    transform: 'translateZ(12px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.4), 0 4px 8px rgba(16, 185, 129, 0.1) inset'
                  }}>
                    <div className="flex items-center mb-2">
                      <Award className="h-4 w-4 text-blue-400 mr-2" />
                      <h4 className="font-semibold text-sm text-blue-400 transform-gpu" style={{
                        textShadow: '0 0 8px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0,0,0,0.3)',
                        transform: 'translateZ(8px)'
                      }}>Professional Summary</h4>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed transform-gpu" style={{
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      transform: 'translateZ(5px)'
                    }}>{experience}</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm transform-gpu" style={{
                    transform: 'translateZ(12px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.4), 0 4px 8px rgba(245, 158, 11, 0.1) inset'
                  }}>
                    <div className="flex items-center mb-2">
                      <Trophy className="h-4 w-4 text-amber-400 mr-2" />
                      <h4 className="font-semibold text-sm text-amber-400 transform-gpu" style={{
                        textShadow: '0 0 8px rgba(245, 158, 11, 0.5), 0 2px 4px rgba(0,0,0,0.3)',
                        transform: 'translateZ(8px)'
                      }}>Key Highlights</h4>
                    </div>
                    <ul className="space-y-1">
                      {achievements.slice(0, 3).map((achievement, index) => (
                        <li key={index} className="text-xs text-gray-300 leading-relaxed flex items-start transform-gpu" style={{
                          textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                          transform: 'translateZ(5px)'
                        }}>
                          <span className="text-amber-400 mr-2 transform-gpu" style={{
                            textShadow: '0 0 6px rgba(245, 158, 11, 0.6)',
                            transform: 'translateZ(3px)'
                          }}>•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  

                </div>
                
                <div className="text-center pt-3 flex-shrink-0 border-t border-gray-700/50 mt-3">
                  <span className="text-gray-400 text-xs font-medium transform-gpu" style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(156, 163, 175, 0.3)',
                    transform: 'translateZ(10px)'
                  }}>← Click to flip back</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <style>{`
        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.5);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  );
};

export default FounderCard;