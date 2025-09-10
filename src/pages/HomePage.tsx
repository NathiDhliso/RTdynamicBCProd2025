import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Removed SplitText - premium plugin that requires license
import { ArrowRight, TrendingUp, Users, Award, Shield, Target, Zap, Phone, Mail, MapPin } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Modal from '@/components/Modal';

// Register GSAP plugins
gsap.registerPlugin(useGSAP, ScrollTrigger);

const HomePage: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const smoothScrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [_isTablet, setIsTablet] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  // Data arrays
  const stats = [
    { label: "Clients Served", value: 50, number: "50+" },
    { label: "Success Rate", value: 98, number: "98%" },
    { label: "Years Combined Experience", value: 10, number: "10+" },
    { label: "Industries Served", value: 10, number: "10+" }
  ];

  const features = [
    {
      icon: <TrendingUp className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />,
      title: "Strategic Growth",
      description: "Comprehensive business strategy and financial planning to accelerate sustainable growth and market expansion."
    },
    {
      icon: <Shield className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />,
      title: "Risk Management",
      description: "Advanced risk assessment and mitigation strategies to protect your business and ensure regulatory compliance."
    },
    {
      icon: <Users className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />,
      title: "Expert Team",
      description: "Chartered accountants and business consultants with deep industry expertise and proven track records."
    },
    {
      icon: <Award className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />,
      title: "Excellence",
      description: "Commitment to delivering exceptional results through innovative solutions and meticulous attention to detail."
    },
    {
      icon: <Target className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />,
      title: "Precision",
      description: "Accurate financial reporting and analysis that provides clear insights for informed decision-making."
    },
    {
      icon: <Zap className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />,
      title: "Innovation",
      description: "Cutting-edge technology and methodologies to streamline processes and enhance business performance."
    }
  ];

  const marqueeAffiliations = [
    { image: "/SAICA.png", alt: "SAICA" },
    { image: "/CIPC.jpg", alt: "CIPC" },
    { image: "/SARS.jpg", alt: "SARS" },
    { image: "/Quickbooks.png", alt: "QuickBooks" }
  ];

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Smooth scroll behavior
  useEffect(() => {
    if (!prefersReducedMotion) {
      // Add smooth scroll behavior to html
      document.documentElement.style.scrollBehavior = 'smooth';
      
      // Lenis-like smooth scroll for better performance
      let scrollY = window.scrollY;
      let currentY = scrollY;
      let isScrolling = false;

      const smoothScroll = () => {
        currentY += (scrollY - currentY) * 0.08;
        
        if (Math.abs(scrollY - currentY) > 0.5) {
          if (!isScrolling) isScrolling = true;
          requestAnimationFrame(smoothScroll);
        } else {
          isScrolling = false;
        }
      };

      const handleScroll = () => {
        scrollY = window.scrollY;
        if (!isScrolling) smoothScroll();
        
        // Update scroll progress
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.documentElement.style.scrollBehavior = '';
      };
    }
  },);

  // Enhanced GSAP animations with cinematic scrolling
  useGSAP(() => {
    // Refresh ScrollTrigger on resize
    ScrollTrigger.refresh();

    // --- ENHANCED CINEMATIC VIDEO PLAYBACK ON SCROLL ---
    const video = videoRef.current;
    if (video && !prefersReducedMotion) {
      // Initialize video
      video.pause();
      video.currentTime = 0;
      
      // Variables to track scroll state
      let _lastScrollProgress = 0;
      let animationFrame: number | null = null;
      let targetTime = 0;
      
      video.addEventListener('loadedmetadata', () => {
        const videoDuration = video.duration;
        
        // Create ScrollTrigger for video control
        ScrollTrigger.create({
          trigger: mainRef.current,
          start: 'top top',
          end: () => `+=${document.documentElement.scrollHeight - window.innerHeight}`,
          scrub: true,
          onUpdate: (self) => {
            // Calculate scroll direction and velocity
            const scrollDirection = self.direction; // 1 for down, -1 for up
            const velocity = Math.abs(self.getVelocity()) / 1000; // Normalized velocity
            const scrollProgress = self.progress;
            
            // Method 1: Direct time mapping (smooth scrubbing)
            targetTime = scrollProgress * videoDuration;
            
            // Method 2: Velocity-based playback (uncomment to use)
            /*
            const speedMultiplier = gsap.utils.clamp(0.5, 3, velocity);
            const deltaProgress = scrollProgress - _lastScrollProgress;
            targetTime = video.currentTime + (deltaProgress * videoDuration * speedMultiplier);
            targetTime = gsap.utils.clamp(0, videoDuration, targetTime);
            */
            
            // Smooth video time update
            if (animationFrame) cancelAnimationFrame(animationFrame);
            
            const updateVideoTime = () => {
              const diff = targetTime - video.currentTime;
              
              // Only update if difference is significant
              if (Math.abs(diff) > 0.01) {
                // Smooth interpolation
                video.currentTime += diff * 0.1;
                animationFrame = requestAnimationFrame(updateVideoTime);
              }
            };
            
            updateVideoTime();
            _lastScrollProgress = scrollProgress;
            
            // Optional: Add visual feedback for scroll direction
            if (scrollDirection === 1) {
              // Scrolling down
              video.style.filter = `brightness(${1 - (scrollProgress * 0.5)}) contrast(${1 + (scrollProgress * 0.1)})`;
            } else {
              // Scrolling up
              video.style.filter = `brightness(${1 - (scrollProgress * 0.5)}) contrast(${1 + (scrollProgress * 0.1)}) hue-rotate(${velocity * 5}deg)`;
            }
          },
          onScrubComplete: () => {
            // Clean up animation frame when scrolling stops
            if (animationFrame) {
              cancelAnimationFrame(animationFrame);
            }
          }
        });
        
        // Optional: Add keyboard controls for fine-tuning
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') {
            video.currentTime = Math.min(video.currentTime + 0.1, videoDuration);
          } else if (e.key === 'ArrowLeft') {
            video.currentTime = Math.max(video.currentTime - 0.1, 0);
          }
        });
      });
      
      // Clean up on unmount
      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };

      // Video zoom and brightness effect (replaces the blur)
      gsap.to(video, {
        scale: 1.2, // A slightly less intense zoom can also help
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.3,
          ease: "power1.inOut",
          onUpdate: (self) => {
            // Animate brightness from 100% down to 40%
            const brightness = 1 - (self.progress * 0.6);
            video.style.filter = `brightness(${brightness})`;
          }
        }
      });

      // Video opacity fade
      gsap.to(video, {
        opacity: 0.4,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "center center",
          end: "bottom top",
          scrub: 0.5,
          ease: "power2.inOut",
        }
      });
    }

    // --- HERO CONTENT CINEMATIC PARALLAX ---
    if (!prefersReducedMotion && heroContentRef.current) {
      // Create timeline for coordinated animations
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        }
      });

      // Main content zoom with rotation
      heroTl.to(heroContentRef.current, {
        scale: isMobile? 0.6 : 0.3,
        opacity: 0,
        y: isMobile? "-10%" : "-20%",
        rotationX: isMobile? 0 : 15,
        transformPerspective: 2000,
        duration: 1,
        ease: "power2.inOut"
      });

      // Individual elements with staggered timing
      const heroElements = {
        title: ".gsap-hero-title",
        subtitle: ".gsap-hero-subtitle", 
        buttons: ".gsap-hero-buttons"
      };

      // Title elegant fade out effect
      gsap.to(heroElements.title, {
        opacity: 0,
        y: -50,
        scale: 0.95,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "30% top",
          end: "bottom top",
          scrub: 1.2,
        }
      });

      // Subtitle fade and slide
      gsap.to(heroElements.subtitle, {
        y: "-300%",
        opacity: 0,
        scale: 0.8,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "20% top",
          end: "80% top",
          scrub: 1.2,
        }
      });

      // Buttons staggered exit
      gsap.to(".gsap-hero-buttons > *", {
        y: (i) => -150 - (i * 50),
        opacity: 0,
        scale: 0.9,
        stagger: 0.1,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "25% top",
          end: "75% top",
          scrub: 1.4,
        }
      });

      // Background shapes 3D parallax
      gsap.utils.toArray<HTMLElement>(".gsap-hero-bg-shape").forEach((shape, index) => {
        gsap.to(shape, {
          z: 500 + (index * 200),
          scale: 2 + (index * 0.5),
          opacity: 0,
          rotationZ: index * 45,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5 + (index * 0.3),
          }
        });
      });
    }

    // --- REVEAL ANIMATIONS WITH SMOOTH ENTRANCE ---
    
    // Stats section with mobile-optimized animations
    gsap.utils.toArray<HTMLElement>(".gsap-stat-card").forEach((card, _index) => {
      // Simplified animation for mobile devices
      const mobileAnimation = {
        y: isMobile ? 50 : 150,
        opacity: 0,
        scale: isMobile ? 0.95 : 0.8,
        rotationY: isMobile ? 0 : -30,
      };
      
      const targetAnimation = {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: isMobile ? 0.8 : 1.5,
        ease: isMobile ? "power2.out" : "back.out(1.2)",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          end: "top 50%",
          scrub: isMobile ? 0.5 : 1,
          toggleActions: "play none none reverse"
        }
      };
      
      gsap.fromTo(card, mobileAnimation, targetAnimation);

      // Mobile-friendly interaction animations
      if (!isMobile) {
        // Desktop hover effects
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      } else {
        // Mobile touch effects
        card.addEventListener('touchstart', () => {
          gsap.to(card, {
            scale: 0.98,
            duration: 0.1,
            ease: "power2.out"
          });
        });

        card.addEventListener('touchend', () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          });
        });
      }
    });

    // Features section with mobile-optimized animations
    gsap.utils.toArray<HTMLElement>(".gsap-feature-card").forEach((card, index) => {
      const _row = Math.floor(index / 3);
      const col = index % 3;
      
      // Mobile-friendly 3D perspective settings
      if (!isMobile) {
        gsap.set(card, {
          transformPerspective: 1000,
          transformStyle: "preserve-3d"
        });
      }

      // Mobile-optimized entrance animation
      const fromAnimation = {
        y: isMobile ? 80 : 200,
        opacity: 0,
        rotationX: isMobile ? 0 : -90,
        scale: isMobile ? 0.9 : 0.7,
        z: isMobile ? 0 : -200
      };
      
      const toAnimation = {
        y: 0,
        opacity: 1,
        rotationX: 0,
        scale: 1,
        z: 0,
        duration: isMobile ? 1.0 : 1.5,
        delay: isMobile ? col * 0.1 : 0,
        ease: isMobile ? "power2.out" : "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          end: "top 40%",
          scrub: isMobile ? 0.8 : 1.5,
          toggleActions: "play none none reverse"
        }
      };
      
      gsap.fromTo(card, fromAnimation, toAnimation);

      // Magnetic hover effect
      if (!isMobile) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          gsap.to(card, {
            x: x * 0.1,
            y: y * 0.1,
            rotationY: x * 0.05,
            rotationX: -y * 0.05,
            duration: 0.5,
            ease: "power2.out"
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            x: 0,
            y: 0,
            rotationY: 0,
            rotationX: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
          });
        });
      }
    });

    // Section titles with simple fade-in effect
    gsap.utils.toArray<HTMLElement>(".gsap-section-title").forEach(title => {
      gsap.fromTo(title, 
        {
          opacity: 0,
          y: 30,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: title,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // CTA section with pulse effect
    const ctaSection = document.querySelector(".gsap-cta-content");
    if (ctaSection) {
      gsap.fromTo(ctaSection,
        {
          scale: 0.8,
          opacity: 0,
          y: 100
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ctaSection,
            start: "top 80%",
            end: "top 40%",
            scrub: 1,
            onEnter: () => {
              // Add pulse animation to CTA button
              gsap.to(".cta-main-button", {
                scale: 1.05,
                duration: 0.5,
                repeat: 2,
                yoyo: true,
                ease: "power2.inOut"
              });
            }
          }
        }
      );
    }

    if (prefersReducedMotion) {
      gsap.set("*", { opacity: 1, y: 0, scale: 1 });
      return;
    }

    // Initial load animations - elegant fade in
    gsap.from(".gsap-hero-title", {
      opacity: 0,
      y: 30,
      scale: 0.98,
      ease: 'power3.out',
      duration: 1.5,
      delay: 0.2
    });

    gsap.from(".gsap-hero-subtitle", {
      opacity: 0,
      y: 60,
      scale: 0.9,
      ease: 'power4.out',
      duration: 1.2,
      delay: 0.5
    });

    gsap.from(".gsap-hero-buttons > *", {
      opacity: 0,
      y: 40,
      scale: 0.9,
      stagger: 0.2,
      ease: 'back.out(1.7)',
      duration: 1,
      delay: 0.8
    });

    // Animated number counters with bounce
    gsap.utils.toArray<HTMLElement>(".gsap-stat-number").forEach(el => {
      const target = { val: 0 };
      const endValue = parseFloat(el.dataset.value || '0');
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(target, {
            val: endValue,
            duration: 2.5,
            ease: 'expo.out',
            onUpdate: () => {
              if (el.dataset.label === "Success Rate") {
                el.innerText = target.val.toFixed(0) + '%';
              } else if (el.dataset.label === "Value Created") {
                el.innerText = 'R' + target.val.toFixed(0) + 'M+';
              } else {
                el.innerText = target.val.toFixed(0) + '+';
              }
            },
            onComplete: () => {
              gsap.to(el, {
                scale: 1.2,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
              });
            }
          });
        },
        once: true
      });
    });

    // Enhanced marquee with pause on hover
    const track = document.querySelector(".affiliation-track");
    if (track) {
      const marqueeAnimation = gsap.to(track, { 
        xPercent: -100, 
        ease: 'none', 
        duration: isMobile? 60 : 40, 
        repeat: -1 
      });

      track.addEventListener('mouseenter', () => marqueeAnimation.pause());
      track.addEventListener('mouseleave', () => marqueeAnimation.play());
    }



  }, { scope: mainRef, dependencies: [prefersReducedMotion, isMobile] });

  // This seems to be duplicate - the data arrays are already defined above

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden" ref={mainRef} style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-slate-800/20">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Enhanced Video Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          preload="metadata"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-90 scale-110"
          style={{ 
            transformOrigin: 'center center',
            willChange: 'transform, filter'
          }}
        >
          <source src="/Bar_Graph_Logo_Animation_Video.webm" type="video/webm" />
          <source src="/Bar_Graph_Logo_Animation_Video_optimized.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlays - Brightened for better video visibility */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-slate-900/60 pointer-events-none -z-[1]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-800/20 via-transparent to-transparent pointer-events-none -z-[1]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-slate-700/25 via-transparent to-transparent pointer-events-none -z-[1]"></div>
      
      <div ref={smoothScrollRef} className="relative z-10 min-h-screen">
        {/* Hero Section with Enhanced Parallax */}
        <section ref={heroRef} className="text-white relative gsap-hero-section min-h-screen flex items-center pt-20 md:pt-24">
          <div className="gsap-hero-bg-shape absolute -top-1/3 -left-1/3 w-2/3 h-2/3 bg-gradient-to-br from-emerald-500/10 to-slate-400/5 rounded-full filter blur-3xl"></div>
          <div className="gsap-hero-bg-shape absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-slate-600/10 to-emerald-400/8 rounded-full filter blur-2xl"></div>
          <div className="gsap-hero-bg-shape absolute top-1/4 right-1/3 w-1/4 h-1/4 bg-gradient-to-bl from-emerald-300/8 to-transparent rounded-full filter blur-xl"></div>
          
          <div ref={heroContentRef} className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20 relative z-10 w-full">
            <div className="max-w-6xl mx-auto text-center">
              {/* Hero title with enhanced styling */}
              <div style={{ overflow: 'hidden' }}>
                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-6xl font-light tracking-tight mb-8 sm:mb-10 leading-[0.9] gsap-hero-title" style={{ 
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif', 
                  fontWeight: 300, 
                  letterSpacing: '-0.02em', 
                  willChange: 'transform, opacity' 
                }}>
                  Expert Chartered Accountants
                  <span className="block text-emerald-300 font-extralight mt-2 sm:mt-3" style={{ fontWeight: 200 }}>& Strategic Business Advisors</span>
                </h1>
              </div>
              <p className="text-base sm:text-lg md:text-lg lg:text-xl mb-10 sm:mb-12 text-slate-300 leading-relaxed max-w-4xl mx-auto font-light gsap-hero-subtitle" style={{ 
                fontWeight: 300, 
                lineHeight: '1.5', 
                willChange: 'transform, opacity' 
              }}>
                Unlock your business potential with proven expertise across banking, telecommunications, and mining. We deliver bespoke financial solutions that drive growth and ensure compliance—working as your trusted strategic partner.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 justify-center max-w-2xl mx-auto gsap-hero-buttons" style={{ willChange: 'transform, opacity' }}>
                <Link to="/questionnaire" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-10 sm:px-12 py-5 sm:py-6 rounded-2xl font-medium transition-all duration-500 flex items-center justify-center group text-base sm:text-lg shadow-xl hover:shadow-2xl border border-emerald-400/20 transform hover:scale-105" style={{ fontWeight: 500 }}>
                  Begin Your Journey
                  <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={1.5} />
                </Link>
                <Link to="/services" className="border border-slate-400/30 backdrop-blur-xl bg-slate-800/30 hover:bg-slate-700/40 text-slate-200 px-10 sm:px-12 py-5 sm:py-6 rounded-2xl font-medium hover:border-slate-300/40 transition-all duration-500 text-base sm:text-lg transform hover:scale-105" style={{ fontWeight: 500 }}>
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section with Enhanced Animation */}
        <section className="gsap-stats-section relative z-20">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center backdrop-blur-xl bg-slate-800/20 rounded-3xl p-8 sm:p-10 border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-500 gsap-stat-card cursor-pointer group">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extralight text-emerald-300 mb-3 sm:mb-4 gsap-stat-number tracking-tight group-hover:scale-110 transition-transform duration-300" data-value={stat.value} data-label={stat.label} style={{ fontWeight: 200 }}>
                    {prefersReducedMotion? stat.number : '0'}
                  </div>
                  <div className="text-sm sm:text-base md:text-lg text-slate-400 font-light tracking-wide group-hover:text-slate-300 transition-colors duration-300" style={{ fontWeight: 300, letterSpacing: '0.025em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section with 3D Cards */}
        <section className="gsap-features-section relative z-20">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <div className="max-w-8xl mx-auto">
              <div className="text-center mb-20 sm:mb-24">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extralight text-white mb-8 sm:mb-10 tracking-tight leading-tight gsap-section-title" style={{ fontWeight: 200, letterSpacing: '-0.02em' }}>
                  Why Choose RT Dynamic?
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-xl text-slate-400 max-w-5xl mx-auto leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.4' }}>
                  We combine deep industry expertise with sophisticated methodologies to deliver transformational results for our clients.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12">
                {features.map((feature, index) => (
                  <div key={index} className="backdrop-blur-xl bg-slate-800/15 p-10 sm:p-12 rounded-3xl border border-slate-700/25 hover:bg-slate-800/25 hover:border-emerald-500/30 transition-all duration-700 cursor-pointer gsap-feature-card transform hover:shadow-2xl group" style={{ 
                    willChange: 'transform',
                    transformStyle: 'preserve-3d'
                  }}>
                    <div className="mb-8 flex justify-center sm:justify-start group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-light text-white mb-5 sm:mb-6 text-center sm:text-left tracking-tight group-hover:text-emerald-300 transition-colors duration-300" style={{ fontWeight: 300 }}>
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-lg font-light leading-relaxed text-center sm:text-left" style={{ fontWeight: 300, lineHeight: '1.6' }}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Affiliations Section */}
        <section className="overflow-hidden relative z-20">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <h2 className="text-3xl sm:text-4xl font-light text-slate-300 text-center mb-16 sm:mb-20 tracking-wider gsap-section-title" style={{ fontWeight: 300, letterSpacing: '0.05em' }}>
              Trusted By & Affiliated With
            </h2>
            <div className="relative overflow-hidden group">
              <div className="flex affiliation-track w-max animate-marquee">
                {marqueeAffiliations.map((affiliation, index) => (
                  <div key={index} className="flex-shrink-0 w-64 mx-8 sm:mx-12 flex items-center justify-center">
                    <img
                      src={affiliation.image}
                      alt={affiliation.alt}
                      className="max-h-16 sm:max-h-20 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="relative z-20">
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <div className="relative bg-slate-800/30 backdrop-blur-lg rounded-3xl p-12 sm:p-16 md:p-20 text-center overflow-hidden border border-slate-700/50 gsap-cta-content">
              <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(22,78,99,0.1),_transparent_40%)] -z-10 animate-[spin_20s_linear_infinite]"></div>
              <h2 className="text-3xl sm:text-4xl md:text-4xl font-light text-white mb-6 sm:mb-8 tracking-tight leading-tight" style={{ fontWeight: 300 }}>
                Ready to Elevate Your Business?
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed" style={{ fontWeight: 300 }}>
                Let's discuss how our bespoke financial and strategic solutions can drive your success. Schedule a complimentary consultation with our experts today.
              </p>
              <Link to="/contact" className="cta-main-button inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-10 sm:px-12 py-5 sm:py-6 rounded-2xl font-medium transition-all duration-300 text-base sm:text-lg shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105" style={{ fontWeight: 500 }}>
                Get a Free Consultation
                <ArrowRight className="ml-3 h-6 w-6" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900/40 border-t border-slate-700/40 text-slate-300 pt-20 pb-10" style={{paddingTop: '5rem', paddingBottom: '2.5rem'}}>
          <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* About */}
              <div className="md:col-span-2 lg:col-span-1">
                {/* Logo and description removed */}
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-medium text-slate-200 mb-4 tracking-wider">Quick Links</h4>
                <ul className="space-y-3 font-light">
                  <li><Link to="/about" className="hover:text-emerald-300 transition-colors">About Us</Link></li>
                  <li><Link to="/services" className="hover:text-emerald-300 transition-colors">Services</Link></li>
                  <li><Link to="/contact" className="hover:text-emerald-300 transition-colors">Contact</Link></li>
                  <li><button onClick={() => setIsFaqModalOpen(true)} className="hover:text-emerald-300 transition-colors text-left">FAQ</button></li>
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-lg font-medium text-slate-200 mb-4 tracking-wider">Our Services</h4>
                <ul className="space-y-3 font-light">
                  <li><Link to="/services#accounting" className="hover:text-emerald-300 transition-colors">Accounting</Link></li>
                  <li><Link to="/services#tax" className="hover:text-emerald-300 transition-colors">Taxation</Link></li>
                  <li><Link to="/services#advisory" className="hover:text-emerald-300 transition-colors">Advisory</Link></li>
                  <li><Link to="/services#compliance" className="hover:text-emerald-300 transition-colors">Compliance</Link></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-medium text-slate-200 mb-4 tracking-wider">Get In Touch</h4>
                <ul className="space-y-4 font-light">
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 mt-1 text-emerald-400 flex-shrink-0" strokeWidth={1.5}/>
                    <span>1 Diagonal Street, Midrand, South Africa</span>
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-emerald-400 flex-shrink-0" strokeWidth={1.5}/>
                    <a href="mailto:info@rtdynamicbc.co.za" className="hover:text-emerald-300 transition-colors">info@rtdynamicbc.co.za</a>
                  </li>
                  <li className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-emerald-400 flex-shrink-0" strokeWidth={1.5}/>
                <a href="tel:0658920000" className="hover:text-emerald-300 transition-colors">065 892 0000</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800/50 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center text-center">
              <p className="text-sm font-light mb-4 sm:mb-0">
                &copy; {new Date().getFullYear()} RT Dynamic Business Consulting. All Rights Reserved.
              </p>
              <div className="flex space-x-4">
                <button onClick={() => setIsPrivacyModalOpen(true)} className="text-sm hover:text-emerald-300 transition-colors">Privacy Policy</button>
                <button onClick={() => setIsTermsModalOpen(true)} className="text-sm hover:text-emerald-300 transition-colors">Terms of Service</button>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Modals */}
      <Modal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} title="Privacy Policy">
        <div className="space-y-4 text-slate-300">
          <p>Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information.</p>
          <h3 className="text-lg font-semibold text-white">Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you contact us or use our services.</p>
          <h3 className="text-lg font-semibold text-white">How We Use Your Information</h3>
          <p>We use the information we collect to provide, maintain, and improve our services.</p>
          <h3 className="text-lg font-semibold text-white">Information Sharing</h3>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
        </div>
      </Modal>

      <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} title="Terms of Service">
        <div className="space-y-4 text-slate-300">
          <p>By using our services, you agree to these terms. Please read them carefully.</p>
          <h3 className="text-lg font-semibold text-white">Use of Services</h3>
          <p>You may use our services only as permitted by law and these terms.</p>
          <h3 className="text-lg font-semibold text-white">Limitations</h3>
          <p>We provide our services "as is" and make no warranties about their reliability or availability.</p>
          <h3 className="text-lg font-semibold text-white">Changes to Terms</h3>
          <p>We may modify these terms at any time. Continued use of our services constitutes acceptance of the modified terms.</p>
        </div>
      </Modal>

      <Modal isOpen={isFaqModalOpen} onClose={() => setIsFaqModalOpen(false)} title="Frequently Asked Questions">
        <div className="space-y-6 text-slate-300">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">What services do you offer?</h3>
            <p>We provide comprehensive chartered accounting, tax planning, business advisory, and compliance services.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">How do I get started?</h3>
            <p>You can begin by filling out our questionnaire or contacting us directly for a free consultation.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">What are your fees?</h3>
            <p>Our fees vary based on the scope and complexity of services required. We provide transparent pricing after understanding your needs.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Are you registered with SAICA?</h3>
            <p>Yes, we are registered chartered accountants with SAICA and comply with all professional standards.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
