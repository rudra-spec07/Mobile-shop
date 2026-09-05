import React, { useState } from 'react';
import Sidebar from './Sidebar';
import LogoutModal from '../common/LogoutModal';
import { Menu, Bell, User, Smartphone, ChevronDown, KeyRound, Settings as SettingsIcon, LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-100 flex">
      {/* Reusable Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

      {/* Admin Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Admin Topbar Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/admin" className="flex items-center gap-2 lg:hidden font-bold text-slate-900 text-sm">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                <img src={msCentreLogo} alt="MS-Centre" className="w-full h-full object-cover" />
              </div>
              <span>MS-Centre Admin</span>
            </Link>
            <h2 className="hidden lg:block text-sm font-semibold text-slate-800">
              Super Admin Console
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Interactive Notification Bell Dropdown */}
            <NotificationDropdown />

            {/* Top-Right Interactive Super Admin Account Menu */}
            <div className="relative border-l border-slate-200 pl-4">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-slate-200/80 shadow-xs overflow-hidden flex items-center justify-center bg-slate-900 shrink-0">
                  <img src={msCentreLogo} alt="MS-Centre Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                    {user?.name || 'Super Admin'} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </p>
                  <p className="text-[10px] text-slate-500">Shop Owner</p>
                </div>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || user?.mobileNumber}</p>
                  </div>

                  <Link
                    to="/admin/profile"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    My Profile
                  </Link>

                  <Link
                    to="/admin/change-password"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    Change Password
                  </Link>

                  <Link
                    to="/admin/settings"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-500" />
                    Account Settings
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
