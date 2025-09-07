import React, { useState, useEffect } from 'react';
import { Linkedin, Twitter, Mail, Award, GraduationCap, Trophy } from 'lucide-react';

// Custom hook for reduced motion preference
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
};

// Custom hook for device detection
const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTouch: false,
    isLowPower: false
  });

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isLowPower = navigator.connection?.saveData || navigator.connection?.effectiveType === '2g' || navigator.connection?.effectiveType === 'slow-2g';
      
      setDeviceInfo({ isMobile, isTouch, isLowPower });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceInfo;
};

const FounderCard = ({
  name,
  title,
  bio: _bio,
  expertise,
  experience,
  education: _education,
  achievements,
  image,
  linkedin,
  twitter,
  email,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isMobile, isTouch, isLowPower } = useDeviceDetection();

  const handleInteraction = (e) => {
    // Prevent flip on link clicks
    const target = e.target;
    if (target.closest('a')) {
      e.stopPropagation();
      return;
    }
    setIsFlipped(!isFlipped);
  };

  // Simplified animations for mobile/low-power devices
  const shouldSimplifyAnimations = prefersReducedMotion || isLowPower || (isMobile && !CSS.supports('transform-style', 'preserve-3d'));

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div 
        className={`h-[550px] sm:h-[600px] md:h-[550px] mb-4 sm:mb-6 md:mb-0 relative ${!shouldSimplifyAnimations ? 'cursor-pointer' : ''}`}
        style={{ 
          perspective: shouldSimplifyAnimations ? 'none' : '1500px',
          WebkitPerspective: shouldSimplifyAnimations ? 'none' : '1500px'
        }}
        onClick={!shouldSimplifyAnimations ? handleInteraction : undefined}
        onMouseEnter={() => !isTouch && setIsHovered(true)}
        onMouseLeave={() => !isTouch && setIsHovered(false)}
      >
        {shouldSimplifyAnimations ? (
          // Simplified version for low-power/incompatible devices
          <div className="w-full h-full">
            {!isFlipped ? (
              <SimplifiedFrontCard 
                name={name}
                title={title}
                expertise={expertise}
                image={image}
                linkedin={linkedin}
                twitter={twitter}
                email={email}
                onFlip={() => setIsFlipped(true)}
              />
            ) : (
              <SimplifiedBackCard
                name={name}
                title={title}
                experience={experience}
                achievements={achievements}
                onFlip={() => setIsFlipped(false)}
              />
            )}
          </div>
        ) : (
          // Full 3D animation version
          <div
            className="relative w-full h-full transition-transform duration-700 ease-in-out"
            style={{ 
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front of Card */}
            <div
              className="absolute inset-0 w-full h-full rounded-xl shadow-2xl overflow-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <FrontCard
                name={name}
                title={title}
                expertise={expertise}
                image={image}
                linkedin={linkedin}
                twitter={twitter}
                email={email}
                isHovered={isHovered}
                isMobile={isMobile}
              />
            </div>

            {/* Back of Card */}
            <div
              className="absolute inset-0 w-full h-full rounded-xl shadow-2xl overflow-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                WebkitTransform: 'rotateY(180deg)'
              }}
            >
              <BackCard
                name={name}
                title={title}
                experience={experience}
                achievements={achievements}
                isMobile={isMobile}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Front Card Component
const FrontCard = ({ name, title, expertise, image, linkedin, twitter, email, isHovered, isMobile }) => (
  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white relative">
    {/* Optimized Background Pattern */}
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className={`absolute top-4 right-4 w-24 h-24 border-2 border-white/30 rounded-full ${!isMobile ? 'animate-pulse' : ''}`} />
      <div className={`absolute bottom-4 left-4 w-20 h-20 border-2 border-white/20 rounded-lg ${!isMobile ? 'animate-pulse delay-75' : ''}`} />
      {!isMobile && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full animate-spin-slow" />
      )}
    </div>
    
    <div className="p-6 sm:p-8 h-full flex flex-col justify-between relative z-10">
      <div>
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg overflow-hidden transform transition-transform duration-300"
            style={{
              boxShadow: '0 12px 24px rgba(0,0,0,0.4), 0 8px 16px rgba(16, 185, 129, 0.2) inset',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              WebkitTransform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}>
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Award className="h-12 w-12 text-white drop-shadow-lg hidden" />
          </div>
          <h3 className="font-bold text-2xl mb-2 text-shadow-lg">{name}</h3>
          <p className="text-white/90 text-sm mb-3 text-shadow-md">{title}</p>
          <div className="bg-gradient-to-r from-emerald-500/30 to-blue-500/30 backdrop-blur-sm text-white border border-white/40 px-4 py-1.5 rounded-full text-xs inline-block font-semibold shadow-lg">
            CA(SA) • SAICA Member
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-lg mb-4 text-center text-emerald-300 text-shadow-glow">Core Expertise</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {expertise.slice(0, 6).map((skill, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-lg p-2.5 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu"
              >
                <span className="text-xs font-medium text-shadow-sm">{skill}</span>
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
              className="text-white/70 hover:text-emerald-300 transition-all duration-300 transform hover:scale-110"
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
              className="text-white/70 hover:text-blue-300 transition-all duration-300 transform hover:scale-110"
              onClick={(e) => e.stopPropagation()}
            >
              <Twitter className="h-6 w-6" />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-white/70 hover:text-amber-300 transition-all duration-300 transform hover:scale-110"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="h-6 w-6" />
            </a>
          )}
        </div>
        <span className={`text-white/60 text-xs font-medium ${!isMobile ? 'animate-pulse' : ''}`}>
          Click to view details →
        </span>
      </div>
    </div>
  </div>
);

// Back Card Component
const BackCard = ({ name, title, experience, achievements, isMobile }) => (
  <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
    {/* Optimized Grid Pattern */}
    {!isMobile && (
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-emerald-500/20" />
            ))}
          </div>
        </div>
      </div>
    )}
    
    <div className="p-4 sm:p-5 h-full flex flex-col relative z-10">
      <div className="flex flex-col h-full">
        <div className="text-center mb-4 flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm shadow-lg">
            <GraduationCap className="h-6 w-6 text-emerald-300" />
          </div>
          <h3 className="font-bold text-base mb-1 text-shadow-lg">{name}</h3>
          <p className="text-gray-300 text-xs mb-1">{title}</p>
          <p className="text-emerald-400 text-xs font-semibold text-shadow-glow">CA(SA), SAICA Member</p>
        </div>
        
        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
          <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm shadow-inner">
            <div className="flex items-center mb-2">
              <Award className="h-4 w-4 text-blue-400 mr-2" />
              <h4 className="font-semibold text-sm text-blue-400">Professional Summary</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{experience}</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm shadow-inner">
            <div className="flex items-center mb-2">
              <Trophy className="h-4 w-4 text-amber-400 mr-2" />
              <h4 className="font-semibold text-sm text-amber-400">Key Highlights</h4>
            </div>
            <ul className="space-y-1">
              {achievements.slice(0, 3).map((achievement, index) => (
                <li key={index} className="text-xs text-gray-300 leading-relaxed flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="text-center pt-3 flex-shrink-0 border-t border-gray-700/50 mt-3">
          <span className="text-gray-400 text-xs font-medium">← Click to flip back</span>
        </div>
      </div>
    </div>
  </div>
);

// Simplified Front Card for fallback
const SimplifiedFrontCard = ({ name, title, expertise, image, linkedin, twitter, email, onFlip }) => (
  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white rounded-xl shadow-2xl p-6">
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
            />
          </div>
          <h3 className="font-bold text-2xl mb-2">{name}</h3>
          <p className="text-white/90 text-sm mb-3">{title}</p>
          <div className="bg-emerald-500/20 text-white px-4 py-1.5 rounded-full text-xs inline-block font-semibold">
            CA(SA) • SAICA Member
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-lg mb-4 text-center text-emerald-300">Core Expertise</h4>
          <div className="grid grid-cols-2 gap-2">
            {expertise.slice(0, 6).map((skill, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-2 text-center">
                <span className="text-xs font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <div className="flex justify-center space-x-4 mb-3">
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-white/70">
              <Linkedin className="h-6 w-6" />
            </a>
          )}
          {twitter && (
            <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-white/70">
              <Twitter className="h-6 w-6" />
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="text-white/70">
              <Mail className="h-6 w-6" />
            </a>
          )}
        </div>
        <button 
          onClick={onFlip}
          className="text-white/60 text-xs font-medium bg-white/10 px-4 py-2 rounded-lg"
        >
          View Details →
        </button>
      </div>
    </div>
  </div>
);

// Simplified Back Card for fallback
const SimplifiedBackCard = ({ name, title, experience, achievements, onFlip }) => (
  <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-xl shadow-2xl p-5">
    <div className="h-full flex flex-col">
      <div className="text-center mb-4">
        <h3 className="font-bold text-base mb-1">{name}</h3>
        <p className="text-gray-300 text-xs mb-1">{title}</p>
        <p className="text-emerald-400 text-xs font-semibold">CA(SA), SAICA Member</p>
      </div>
      
      <div className="flex-1 space-y-3 overflow-y-auto">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="font-semibold text-sm text-blue-400 mb-2">Professional Summary</h4>
          <p className="text-xs text-gray-300 leading-relaxed">{experience}</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="font-semibold text-sm text-amber-400 mb-2">Key Highlights</h4>
          <ul className="space-y-1">
            {achievements.slice(0, 3).map((achievement, index) => (
              <li key={index} className="text-xs text-gray-300 leading-relaxed">
                • {achievement}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="text-center pt-3 border-t border-gray-700/50 mt-3">
        <button 
          onClick={onFlip}
          className="text-gray-400 text-xs font-medium bg-white/10 px-4 py-2 rounded-lg"
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  </div>
);

// Add CSS for animations
const styles = `
  @keyframes spin-slow {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  .transform-gpu {
    transform: translateZ(0);
    will-change: transform;
  }
  
  .text-shadow-sm {
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  
  .text-shadow-md {
    text-shadow: 0 2px 4px rgba(0,0,0,0.4);
  }
  
  .text-shadow-lg {
    text-shadow: 0 4px 8px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3);
  }
  
  .text-shadow-glow {
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.5), 0 4px 8px rgba(0,0,0,0.3);
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
  
  @media (hover: none) and (pointer: coarse) {
    .hover\\:scale-105:hover {
      transform: scale(1);
    }
    .hover\\:scale-110:hover {
      transform: scale(1);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default FounderCard;