import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Linkedin, Twitter, Mail, Award, GraduationCap } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

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
  bio: _bio,
  expertise,
  experience,
  education,
  achievements,
  image: _image,
  linkedin,
  twitter,
  email,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current) return;

    // Set initial states
    gsap.set(backRef.current, { rotationX: 180 });
    gsap.set([frontRef.current, backRef.current], { backfaceVisibility: 'hidden' });
  }, [prefersReducedMotion]);

  const handleFlip = () => {
    if (prefersReducedMotion) {
      setIsFlipped(!isFlipped);
      return;
    }

    const tl = gsap.timeline();
    
    if (!isFlipped) {
      // Flip to back
      tl.to(frontRef.current, { 
        rotationX: -180, 
        duration: 0.6, 
        ease: 'power2.inOut' 
      })
      .to(backRef.current, { 
        rotationX: 0, 
        duration: 0.6, 
        ease: 'power2.inOut' 
      }, 0);
    } else {
      // Flip to front
      tl.to(backRef.current, { 
        rotationX: 180, 
        duration: 0.6, 
        ease: 'power2.inOut' 
      })
      .to(frontRef.current, { 
        rotationX: 0, 
        duration: 0.6, 
        ease: 'power2.inOut' 
      }, 0);
    }
    
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="h-96" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        className="relative w-full h-full cursor-pointer transition-transform duration-600"
        style={{ transformStyle: 'preserve-3d' }}
        onClick={handleFlip}
      >
        {/* Front of Card */}
        <div
          ref={frontRef}
          className={`absolute inset-0 w-full h-full rounded-lg shadow-2xl overflow-hidden ${
            prefersReducedMotion && isFlipped ? 'hidden' : 'block'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full" />
            </div>
            
            <div className="p-8 h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">{name}</h3>
                  <p className="text-white/90 text-sm mb-2">{title}</p>
                  <div className="bg-white/20 text-white border-white/30 px-3 py-1 rounded-full text-xs inline-block">
                    CA(SA)
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-center">Core Skills</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {expertise.slice(0, 6).map((skill, index) => (
                      <div
                        key={index}
                        className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center"
                      >
                        <span className="text-xs font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center space-x-3 mb-2">
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {twitter && (
                    <a
                      href={twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="text-white/80 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                </div>
                <span className="text-white/70 text-xs">Click to flip for details</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div
          ref={backRef}
          className={`absolute inset-0 w-full h-full rounded-lg shadow-2xl overflow-hidden ${
            prefersReducedMotion && !isFlipped ? 'hidden' : 'block'
          }`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="grid grid-cols-8 grid-rows-12 h-full">
                  {Array.from({ length: 96 }).map((_, i) => (
                    <div key={i} className="border border-white/10" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-8 h-full flex flex-col justify-between relative z-10">
              <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <GraduationCap className="h-6 w-6 text-emerald-300" />
                  </div>
                  <h3 className="font-bold text-base mb-1">{name}</h3>
                  <p className="text-gray-300 text-xs mb-1">{title}</p>
                  <p className="text-emerald-300 text-xs">CA(SA), SAICA Member</p>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 space-y-3 text-center">
                  <div>
                    <h4 className="font-semibold text-xs mb-1 text-emerald-300">Experience</h4>
                    <p className="text-xs text-gray-300">{experience}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-xs mb-1 text-emerald-300">Education</h4>
                    <p className="text-xs text-gray-300">{education}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-xs mb-1 text-emerald-300">Key Specializations</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-300 text-center">
                      {expertise.map((spec, index) => (
                        <div key={index} className="text-xs">
                          {spec}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-xs mb-1 text-emerald-300">Key Achievements</h4>
                    <div className="space-y-1">
                      {achievements.slice(0, 3).map((achievement, index) => (
                        <div key={index} className="text-xs text-gray-300">
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-xs mb-1 text-emerald-300">Contact</h4>
                    <div className="flex justify-center space-x-3 text-gray-400">
                      {email && (
                        <a href={`mailto:${email}`} onClick={(e) => e.stopPropagation()}>
                          <Mail className="h-3 w-3" />
                        </a>
                      )}
                      {linkedin && (
                        <a href={linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Linkedin className="h-3 w-3" />
                        </a>
                      )}
                      {twitter && (
                        <a href={twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Twitter className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-2">
                  <span className="text-gray-400 text-xs">Click to flip back</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderCard;