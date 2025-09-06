import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-t border-slate-700/30">
      <div className="container mx-auto px-8 sm:px-10 lg:px-16 xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Building2 className="h-8 w-8 text-emerald-300" strokeWidth={1.5} />
              <span className="text-2xl font-light text-white" style={{ fontWeight: 300 }}>RT Dynamic</span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed font-light" style={{ fontWeight: 300, lineHeight: '1.6' }}>
              Transforming businesses through strategic consulting and innovative solutions. 
              We partner with organizations to unlock their full potential and drive sustainable growth.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-emerald-300 transition-colors">
                <Linkedin className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a href="#" className="text-slate-400 hover:text-emerald-300 transition-colors">
                <Twitter className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-light text-white mb-6" style={{ fontWeight: 300 }}>Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-emerald-300 transition-colors font-light" style={{ fontWeight: 300 }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-slate-400 hover:text-emerald-300 transition-colors font-light" style={{ fontWeight: 300 }}>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-emerald-300 transition-colors font-light" style={{ fontWeight: 300 }}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/questionnaire" className="text-slate-400 hover:text-emerald-300 transition-colors font-light" style={{ fontWeight: 300 }}>
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-light text-white mb-6" style={{ fontWeight: 300 }}>Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-emerald-300" strokeWidth={1.5} />
                <span className="text-slate-400 font-light" style={{ fontWeight: 300 }}>info@rtdynamicbc.co.za</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-emerald-300" strokeWidth={1.5} />
                <span className="text-slate-400 font-light" style={{ fontWeight: 300 }}>073 659 8177</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-emerald-300" strokeWidth={1.5} />
                <span className="text-slate-400 font-light" style={{ fontWeight: 300 }}>1 Diagonal Street, Midrand, South Africa</span>
              </li>
            </ul>
          </div>

        <div className="border-t border-slate-700/30 mt-12 pt-8 text-center">
          <p className="text-slate-400 font-light" style={{ fontWeight: 300 }}>
            Professional business consulting and chartered accounting services. 
            © 2025 RT Dynamic Business Consulting. All rights reserved.
          </p>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;