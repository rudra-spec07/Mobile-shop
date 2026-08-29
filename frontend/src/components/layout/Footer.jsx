import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span>Mobile-Adda</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your one-stop digital platform for mobile phones, spare parts, and expert repair services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/mobiles" className="hover:text-white transition-colors">
                  Browse Mobiles
                </Link>
              </li>
              <li>
                <Link to="/parts" className="hover:text-white transition-colors">
                  Spare Parts
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Customer Area</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/customer/requests" className="hover:text-white transition-colors">
                  My Requests
                </Link>
              </li>
              <li>
                <Link to="/customer/profile" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-xs">
            <h4 className="text-white font-semibold uppercase tracking-wider mb-3">Shop Contact</h4>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>support@mobileadda.shop</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Main Road Mobile Market, City</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Mobile-Adda. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for Mobile Shop Management & Customer Interactions</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
