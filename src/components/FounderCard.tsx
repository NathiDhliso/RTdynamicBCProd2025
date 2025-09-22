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

// Simplified device detection
const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTouch: false
  });

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 768;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setDeviceInfo({ isMobile, isTouch });
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
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const _prefersReducedMotion = usePrefersReducedMotion();
  const { isMobile, isTouch } = useDeviceDetection();

  const handleCardClick = (e) => {
    // Prevent toggle on link clicks
    const target = e.target;
    if (target.closest('a') || target.closest('button')) {
      e.stopPropagation();
      return;
    }
    setShowDetails(!showDetails);
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div 
        className="founder-card-container h-[550px] sm:h-[600px] md:h-[550px] mb-4 sm:mb-6 md:mb-0 relative cursor-pointer"
        onClick={handleCardClick}
        onMouseEnter={() => !isTouch && setIsHovered(true)}
        onMouseLeave={() => !isTouch && setIsHovered(false)}
      >
        {/* Front Card */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-in-out rounded-xl shadow-2xl overflow-hidden ${
            showDetails 
              ? 'opacity-0 pointer-events-none transform translate-y-4' 
              : 'opacity-100 transform translate-y-0'
          }`}
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
            onToggle={handleToggleDetails}
          />
        </div>
        
        {/* Back Card */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-in-out rounded-xl shadow-2xl overflow-hidden ${
            showDetails 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 pointer-events-none transform -translate-y-4'
          }`}
        >
          <BackCard 
            name={name}
            title={title}
            experience={experience}
            achievements={achievements}
            isMobile={isMobile}
            onToggle={handleToggleDetails}
          />
        </div>
      </div>
    </div>
  );
};

// Front Card Component
const FrontCard = ({ name, title, expertise, image, linkedin, twitter, email, isHovered, isMobile, onToggle }) => (
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
                className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-lg p-2.5 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
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
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="text-white/60 hover:text-white text-xs font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300"
        >
          View Details →
        </button>
      </div>
    </div>
  </div>
);

// Back Card Component
const BackCard = ({ name, title, experience, achievements, isMobile, onToggle }) => (
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
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="text-gray-400 hover:text-white text-xs font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300"
          >
            ← Back to Profile
          </button>
        </div>
      </div>
    </div>
  </div>
);



// Add CSS for mobile-friendly animations
const styles = `
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

  .founder-card-container {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  /* Ensure smooth transitions on all devices */
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Disable problematic hover effects on touch devices */
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