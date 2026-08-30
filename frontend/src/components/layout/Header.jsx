import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Bell, User, LogOut, Menu, X, Shield, KeyRound } from 'lucide-react';
import Navbar from '../navigation/Navbar';
import Button from '../common/Button';
import LogoutModal from '../common/LogoutModal';
import GlobalSearchBar from '../search/GlobalSearchBar';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const Header = () => {
  const { user, isAuthenticated, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Reusable Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight shrink-0">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <span>Mobile-Adda</span>
        </Link>

        {/* Global Search Bar (Desktop/Tablet) */}
        <GlobalSearchBar className="hidden sm:block w-64 lg:w-80" />

        {/* Desktop Navbar */}
        <Navbar className="hidden md:flex" />

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Icon */}
              <Link
                to={role === ROLES.SUPER_ADMIN ? '/admin/notifications' : '/customer/notifications'}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-700">
                    {user?.name || 'User'}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email || user?.mobileNumber}</p>
                    </div>

                    {role === ROLES.SUPER_ADMIN ? (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Shield className="w-4 h-4 text-blue-600" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/customer"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Customer Dashboard
                      </Link>
                    )}

                    <Link
                      to={role === ROLES.SUPER_ADMIN ? '/admin/change-password' : '/customer/change-password'}
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      Change Password
                    </Link>

                    <div className="border-t border-slate-100 mt-1">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
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
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            to="/mobiles"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
          >
            Mobiles
          </Link>
          <Link
            to="/parts"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
          >
            Parts
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
