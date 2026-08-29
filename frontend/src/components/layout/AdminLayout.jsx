import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, User, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex">
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
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span>Mobile-Adda Admin</span>
            </Link>
            <h2 className="hidden lg:block text-sm font-semibold text-slate-800">
              Super Admin Console
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/notifications"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xs shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] text-slate-500">Shop Owner</p>
              </div>
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
