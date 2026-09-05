import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Smartphone, Wrench, FileText, User } from 'lucide-react';

const BottomNavigation = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Mobiles', path: '/mobiles', icon: Smartphone },
    { label: 'Parts', path: '/parts', icon: Wrench },
    { label: 'Requests', path: '/customer/requests', icon: FileText },
    { label: 'Account', path: '/customer/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 md:hidden shadow-lg shadow-slate-950/5">
      <div className="flex items-center justify-around h-16 px-1 pt-1 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-all duration-150 ${
                  isActive ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5 stroke-[1.75]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
