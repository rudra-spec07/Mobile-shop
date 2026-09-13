import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Bell, User, LogOut, Menu, X, Shield, KeyRound, MessageSquare, ShoppingBag, FileText } from 'lucide-react';
import Navbar from '../navigation/Navbar';
import Button from '../common/Button';
import LogoutModal from '../common/LogoutModal';
import GlobalSearchBar from '../search/GlobalSearchBar';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import NotificationDropdown from '../navigation/NotificationDropdown';
import msCentreLogo from '../../assets/images/ms-centre-logo.jpeg';

const Header = () => {
  const { user, isAuthenticated, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 overflow-hidden"
      style={{
        background: isScrolled
          ? 'linear-gradient(135deg, rgba(239,245,255,0.97) 0%, rgba(237,233,254,0.95) 40%, rgba(243,244,255,0.97) 70%, rgba(255,255,255,0.98) 100%)'
          : 'linear-gradient(135deg, rgba(235,243,255,0.92) 0%, rgba(233,229,253,0.88) 35%, rgba(240,242,255,0.90) 65%, rgba(248,250,255,0.92) 100%)',
        borderBottom: isScrolled ? '1px solid rgba(199,210,254,0.35)' : '1px solid rgba(199,210,254,0.2)',
        backdropFilter: 'blur(20px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        boxShadow: isScrolled
          ? '0 4px 24px -2px rgba(99,102,241,0.08), 0 1px 3px rgba(99,102,241,0.05)'
          : '0 2px 12px -2px rgba(99,102,241,0.04)',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* ─── Decorative Ambient Orbs (header-only) ─── */}
      <div
        className="absolute pointer-events-none anim-float-sm"
        style={{
          top: '-18px',
          left: '-30px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,130,255,0.18) 0%, rgba(147,130,255,0.04) 70%, transparent 100%)',
          filter: 'blur(8px)',
        }}
      />
      <div
        className="absolute pointer-events-none anim-float"
        style={{
          top: '-24px',
          right: '60px',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.16) 0%, rgba(96,165,250,0.03) 70%, transparent 100%)',
          filter: 'blur(10px)',
        }}
      />
      <div
        className="absolute pointer-events-none anim-float-lg"
        style={{
          bottom: '-20px',
          right: '25%',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.14) 0%, rgba(167,139,250,0.02) 70%, transparent 100%)',
          filter: 'blur(6px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10px',
          left: '20%',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
          filter: 'blur(5px)',
          animation: 'anim-glow-pulse 5s ease-in-out infinite',
        }}
      />

      {/* Reusable Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300"
              style={{
                boxShadow: '0 2px 12px rgba(99,102,241,0.18), 0 0 0 2px rgba(255,255,255,0.7)',
                border: '1.5px solid rgba(199,210,254,0.5)',
              }}
            >
              <img src={msCentreLogo} alt="Armaan Mobile Service Centre Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="font-black tracking-tight text-xs sm:text-sm md:text-base lg:text-lg transition-colors duration-200 group-hover:text-indigo-600" style={{ color: '#1e293b' }}>
                Armaan Mobile
              </span>
              <span
                className="font-semibold tracking-wide text-[9px] sm:text-[10px] md:text-xs mt-0.5 transition-colors duration-200"
                style={{ color: '#8b8fa8' }}
              >
                Service Centre
              </span>
            </div>
          </Link>

          {/* Global Search Bar (Desktop/Tablet) */}
          <GlobalSearchBar className="hidden sm:block w-48 md:w-60 lg:w-80 xl:w-96" />

          {/* Desktop Navigation Links */}
          <Navbar className="hidden md:flex" />

          {/* Action Controls & User Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {isAuthenticated ? (
              <>
                {/* Interactive Notification Bell Dropdown */}
                <NotificationDropdown />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full sm:rounded-2xl transition-all duration-250 hover:scale-[1.03]"
                    style={{
                      background: 'rgba(255,255,255,0.55)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(199,210,254,0.4)',
                      boxShadow: '0 1px 4px rgba(99,102,241,0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(238,242,255,0.8)';
                      e.currentTarget.style.borderColor = 'rgba(165,180,252,0.6)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.55)';
                      e.currentTarget.style.borderColor = 'rgba(199,210,254,0.4)';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(99,102,241,0.06)';
                    }}
                  >
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center font-black text-xs"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
                        boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold pr-1.5" style={{ color: '#334155' }}>
                      {user?.name || 'User'}
                    </span>
                  </button>

                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2.5 w-56 rounded-2xl py-1.5 z-50 anim-slide-down"
                      style={{
                        background: 'rgba(255,255,255,0.97)',
                        backdropFilter: 'blur(24px) saturate(1.5)',
                        border: '1px solid rgba(199,210,254,0.35)',
                        boxShadow: '0 12px 40px -8px rgba(99,102,241,0.15), 0 4px 12px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
                        <p className="text-xs font-extrabold" style={{ color: '#1e293b' }}>{user?.name}</p>
                        <p className="text-[10px] truncate mt-0.5" style={{ color: '#94a3b8' }}>{user?.email || user?.mobileNumber}</p>
                      </div>

                      {role === ROLES.SUPER_ADMIN ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-600 transition-colors rounded-lg mx-1"
                          >
                            <Shield className="w-4 h-4 text-indigo-500" />
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/requests"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-600 transition-colors rounded-lg mx-1"
                          >
                            <FileText className="w-4 h-4 text-emerald-500" />
                            Orders & Requests
                          </Link>
                          <Link
                            to="/admin/enquiries"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-violet-50/60 hover:text-violet-600 transition-colors rounded-lg mx-1"
                          >
                            <MessageSquare className="w-4 h-4 text-violet-500" />
                            Enquiries Desk
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/customer"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-600 transition-colors rounded-lg mx-1"
                          >
                            <User className="w-4 h-4 text-indigo-500" />
                            Customer Dashboard
                          </Link>
                          <Link
                            to="/customer/requests"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-600 transition-colors rounded-lg mx-1"
                          >
                            <ShoppingBag className="w-4 h-4 text-emerald-500" />
                            My Orders & Requests
                          </Link>
                          <Link
                            to="/customer/enquiries"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-600 transition-colors rounded-lg mx-1"
                          >
                            <MessageSquare className="w-4 h-4 text-indigo-500" />
                            My Inquiries
                          </Link>
                        </>
                      )}

                      <Link
                        to={role === ROLES.SUPER_ADMIN ? '/admin/change-password' : '/customer/change-password'}
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50/80 hover:text-slate-800 transition-colors rounded-lg mx-1"
                      >
                        <KeyRound className="w-4 h-4 text-slate-400" />
                        Change Password
                      </Link>

                      <div className="mt-1 pt-1 mx-2" style={{ borderTop: '1px solid rgba(226,232,240,0.6)' }}>
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            setIsLogoutModalOpen(true);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50/70 hover:text-red-600 transition-colors rounded-lg"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 hover:scale-105"
                  style={{
                    color: '#475569',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#4f46e5';
                    e.currentTarget.style.background = 'rgba(238,242,255,0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-white text-xs font-black rounded-xl transition-all duration-250 active:scale-95 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                    boxShadow: '0 4px 14px -2px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 20px -2px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 14px -2px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.1)';
                  }}
                >
                  Register
                </Link>
              </div>
            )}


            {/* Mobile/Tablet Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
              className="hidden sm:flex md:hidden w-9 h-9 rounded-full items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(199,210,254,0.35)',
                color: '#475569',
              }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (under logo on small screens < 640px) */}
        <div className="block sm:hidden pb-3">
          <GlobalSearchBar className="w-full" />
        </div>
      </div>

      {/* Mobile/Tablet Drawer Menu */}
      {isMenuOpen && (
        <div
          className="hidden sm:block md:hidden px-4 py-3 space-y-1 anim-slide-down"
          style={{
            background: 'rgba(245,248,255,0.95)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(199,210,254,0.3)',
          }}
        >
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg transition-colors"
          >
            Home
          </Link>
          <Link
            to="/mobiles"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg transition-colors"
          >
            Mobiles
          </Link>
          <Link
            to="/parts"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg transition-colors"
          >
            Parts
          </Link>
          <Link
            to="/services"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg transition-colors"
          >
            Services
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
