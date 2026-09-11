import React, { useState } from 'react';
import Sidebar from './Sidebar';
import LogoutModal from '../common/LogoutModal';
import { Menu, Bell, User, Smartphone, ChevronDown, KeyRound, Settings as SettingsIcon, LogOut, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import NotificationDropdown from '../navigation/NotificationDropdown';
import msCentreLogo from '../../assets/images/ms-centre-logo.jpeg';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Reusable Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

      {/* Admin Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Admin Topbar Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/admin" className="flex items-center gap-2 lg:hidden font-bold text-slate-900 text-sm">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                <img src={msCentreLogo} alt="Armaan Mobile Service Centre" className="w-full h-full object-cover" />
              </div>
              <span className="truncate">Admin Panel</span>
            </Link>
            <h2 className="hidden lg:block text-sm font-semibold text-slate-700">
              Super Admin Console
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Notification Bell Dropdown */}
            <NotificationDropdown />

            {/* Top-Right Interactive Super Admin Account Menu */}
            <div className="relative border-l border-slate-200/80 pl-3">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex items-center justify-center bg-slate-900 shrink-0">
                  <img src={msCentreLogo} alt="Armaan Mobile Service Centre Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                    {user?.name || 'Super Admin'} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </p>
                  <p className="text-[10px] text-slate-500">Shop Owner</p>
                </div>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email || user?.mobileNumber}</p>
                  </div>

                  <Link
                    to="/admin/profile"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    My Profile
                  </Link>

                  <Link
                    to="/admin/change-password"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    Change Password
                  </Link>

                  <Link
                    to="/admin/settings"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-500" />
                    Account Settings
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
