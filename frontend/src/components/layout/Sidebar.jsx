import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  Wrench,
  Package,
  Users,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  LogOut,
  X,
  Shield,
  ChevronRight,
} from 'lucide-react';
import LogoutModal from '../common/LogoutModal';
import msCentreLogo from '../../assets/images/ms-centre-logo.jpeg';

const Sidebar = ({ isOpen, onClose }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuSections = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { label: 'Mobiles', path: '/admin/mobiles', icon: Smartphone },
        { label: 'Parts', path: '/admin/parts', icon: Wrench },
        { label: 'Inventory', path: '/admin/inventory', icon: Package },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
        { label: 'Orders & Requests', path: '/admin/requests', icon: FileText },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'Notifications', path: '/admin/notifications', icon: Bell },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: Shield },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Reusable Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-lg shrink-0 bg-slate-800">
              <img src={msCentreLogo} alt="Armaan Mobile Service Centre" className="w-full h-full object-cover" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-white text-sm tracking-tight block">Admin Panel</span>
              <span className="text-[10px] text-slate-500 font-medium">Armaan Mobile</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/admin'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className="flex-1">{item.label}</span>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Logout Button */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
