import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs mt-auto border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <div className="p-2 bg-blue-600 rounded-xl shadow-xs">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold tracking-tight">Mobile-Adda</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Your one-stop digital platform for mobile phones, spare parts, and expert repair services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/mobiles" className="hover:text-blue-400 transition-colors">
                  Browse Mobiles
                </Link>
              </li>
              <li>
                <Link to="/parts" className="hover:text-blue-400 transition-colors">
                  Spare Parts
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wider mb-3">Customer Area</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/customer/requests" className="hover:text-blue-400 transition-colors">
                  My Requests
                </Link>
              </li>
              <li>
                <Link to="/customer/profile" className="hover:text-blue-400 transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-2.5 text-xs">
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wider mb-3">Shop Contact</h4>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>support@mobileadda.shop</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Main Road Mobile Market, City</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Mobile-Adda. All rights reserved.</p>
          <p>Designed for Mobile Shop Management & Customer Interactions</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
