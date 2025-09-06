import React, { useState } from 'react';
import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Menu, X, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const logoRef = useRef<HTMLAnchorElement>(null);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // GSAP logo hover animation
  useEffect(() => {
    if (prefersReducedMotion || !logoRef.current) return;

    const logo = logoRef.current;
    const icon = logo.querySelector('svg');
    const text = logo.querySelector('span');

    const handleMouseEnter = () => {
      gsap.to(icon, { 
        rotation: 360, 
        duration: 0.6, 
        ease: 'back.out(1.7)' 
      });
      gsap.to(text, { 
        scale: 1.05, 
        duration: 0.3, 
        ease: 'power2.out' 
      });
    };

    const handleMouseLeave = () => {
      gsap.to([icon, text], { 
        rotation: 0, 
        scale: 1, 
        duration: 0.3, 
        ease: 'power2.out' 
      });
    };

    logo.addEventListener('mouseenter', handleMouseEnter);
    logo.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      logo.removeEventListener('mouseenter', handleMouseEnter);
      logo.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReducedMotion]);

  const isHomePage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/30 shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link ref={logoRef} to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-emerald-300" strokeWidth={1.5} />
            <span className="text-2xl font-light text-white" style={{ fontWeight: 300 }}>
              RT Dynamic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "text-sm font-medium transition-colors font-light",
                  "hover:text-emerald-300",
                  isActive(item.href) 
                    ? "text-emerald-300 border-b-2 border-emerald-300 pb-1" 
                    : "text-white/90"
                )} style={{ fontWeight: 300 }}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/questionnaire"
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:scale-105 shadow-lg hover:shadow-xl" style={{ fontWeight: 500 }}
            >
              Start Consultation
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 transition-colors text-white hover:text-emerald-300"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-4 pb-4 border-t border-slate-700/30 bg-slate-800/20 backdrop-blur-sm rounded-b-2xl"
          >
            <div className="flex flex-col space-y-3 pt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={clsx(
                    "text-sm font-medium transition-colors font-light",
                    "hover:text-emerald-300",
                    isActive(item.href) 
                      ? "text-emerald-300" 
                      : "text-white/90"
                  )} style={{ fontWeight: 300 }}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/questionnaire"
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300 text-center bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-lg hover:shadow-xl" style={{ fontWeight: 500 }}
              >
                Start Consultation
              </Link>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
};

export default Header;