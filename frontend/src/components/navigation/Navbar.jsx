import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ className = '' }) => {
  const links = [
    { label: 'Home', path: '/' },
    { label: 'Mobiles', path: '/mobiles' },
    { label: 'Parts', path: '/parts' },
    { label: 'Services', path: '/services' },
  ];

  return (
    <nav className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold ${className}`}>
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `relative px-3.5 py-1.5 rounded-full transition-all duration-250 hover:-translate-y-0.5 ${
              isActive
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-600 hover:text-indigo-600 font-medium'
            }`
          }
          style={({ isActive }) =>
            isActive
              ? {
                  background: 'rgba(238,242,255,0.75)',
                  boxShadow: '0 1px 6px rgba(99,102,241,0.1), inset 0 0 0 1px rgba(165,180,252,0.25)',
                  backdropFilter: 'blur(6px)',
                }
              : {
                  background: 'transparent',
                }
          }
        >
          {({ isActive }) => (
            <>
              <span>{link.label}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
