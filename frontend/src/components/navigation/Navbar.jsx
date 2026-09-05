import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ className = '' }) => {
  const links = [
    { label: 'Home', path: '/' },
    { label: 'Mobiles', path: '/mobiles' },
    { label: 'Parts', path: '/parts' },
  ];

  return (
    <nav className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium ${className}`}>
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-full transition-all duration-200 ${
              isActive
                ? 'text-blue-600 font-semibold bg-blue-50/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
