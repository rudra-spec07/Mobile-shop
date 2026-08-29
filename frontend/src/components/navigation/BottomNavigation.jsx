import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Smartphone, Wrench, FileText, User } from 'lucide-react';

const BottomNavigation = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Mobiles', path: '/mobiles', icon: Smartphone },
    { label: 'Parts', path: '/parts', icon: Wrench },
    { label: 'Requests', path: '/customer/requests', icon: FileText },
    { label: 'Profile', path: '/customer/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 md:hidden shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
