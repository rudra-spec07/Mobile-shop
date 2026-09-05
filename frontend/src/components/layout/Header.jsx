import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Bell, User, LogOut, Menu, X, Shield, KeyRound, MessageSquare, ShoppingBag, FileText } from 'lucide-react';
import Navbar from '../navigation/Navbar';
import Button from '../common/Button';
import LogoutModal from '../common/LogoutModal';
import GlobalSearchBar from '../search/GlobalSearchBar';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

import NotificationDropdown from '../navigation/NotificationDropdown';

const Header = () => {
  const { user, isAuthenticated, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Reusable Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-blue-600 font-extrabold text-lg sm:text-xl tracking-tight shrink-0 hover:opacity-90 transition-opacity">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs flex items-center justify-center">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-slate-900 font-bold">Mobile-Adda</span>
          </Link>

          {/* Global Search Bar (Desktop/Tablet) */}
          <GlobalSearchBar className="hidden sm:block w-48 md:w-64 lg:w-96" />

          {/* Desktop Navbar */}
          <Navbar className="hidden md:flex" />

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Interactive Notification Bell Dropdown */}
                <NotificationDropdown />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full sm:rounded-xl border border-slate-200/80 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-800 pr-1">
                      {user?.name || 'User'}
                    </span>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email || user?.mobileNumber}</p>
                      </div>

                      {role === ROLES.SUPER_ADMIN ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-blue-600" />
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/requests"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Orders & Requests
                          </Link>
                          <Link
                            to="/admin/enquiries"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            Enquiries Desk
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/customer"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-blue-600" />
                            Customer Dashboard
                          </Link>
                          <Link
                            to="/customer/requests"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-emerald-600" />
                            My Orders & Requests
                          </Link>
                          <Link
                            to="/customer/enquiries"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            My Inquiries
                          </Link>
                        </>
                      )}

                      <Link
                        to={role === ROLES.SUPER_ADMIN ? '/admin/change-password' : '/customer/change-password'}
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-slate-500" />
                        Change Password
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            setIsLogoutModalOpen(true);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
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
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile/Tablet Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hidden sm:block md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
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
        <div className="hidden sm:block md:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-md px-4 py-3 space-y-1 animate-fade-in">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Home
          </Link>
          <Link
            to="/mobiles"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Mobiles
          </Link>
          <Link
            to="/parts"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Parts
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
