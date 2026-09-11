import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import msCentreLogo from '../../assets/images/ms-centre-logo.jpeg';

const Footer = () => {
  return (
    <footer className="bg-[#0a192f] text-slate-400 text-xs mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-12">
          {/* Brand Col (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden flex items-center justify-center bg-slate-900 shrink-0">
                <img src={msCentreLogo} alt="Armaan Mobile Service Centre Logo" className="w-full h-full object-cover" />
              </div>
              <div className="leading-none">
                <span className="font-extrabold tracking-tight text-white block text-base">
                  Armaan Mobile
                </span>
                <span className="font-semibold text-slate-400 tracking-wide text-xs">
                  Service Centre
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your one-stop destination for mobile phones, genuine spare parts and expert service.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-2 pt-1 text-white">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1CWgv1CFd5/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition-colors"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/armanmobileservicecenter?stkn=ZnY1NmQweXRrNnlx&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-pink-600/20 hover:bg-pink-600 text-pink-400 hover:text-white flex items-center justify-center transition-colors"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@armanmobileservicecentre?si=M4UtHNkvPPAPDyA6"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center transition-colors"
                title="YouTube"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center transition-colors"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/mobiles" className="hover:text-blue-400 transition-colors">
                  Mobiles
                </Link>
              </li>
              <li>
                <Link to="/parts" className="hover:text-blue-400 transition-colors">
                  Parts
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Area (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Customer</h4>
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
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-400 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">support@armaanmobile.in</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Near Railway Station, Jharkhand, India - 834001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Armaan Mobile Service Centre. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms & Conditions</Link>
            <span>|</span>
            <Link to="/refund" className="hover:text-slate-400 transition-colors">Refund Policy</Link>
          </div>
          <p>Designed with ❤️ for a connected world</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
