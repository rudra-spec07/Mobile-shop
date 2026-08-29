import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ className = '' }) => {
  const links = [
    { label: 'Home', path: '/' },
    { label: 'Mobiles', path: '/mobiles' },
    { label: 'Parts', path: '/parts' },
  ];

  return (
    <nav className={`flex items-center gap-6 text-sm font-medium ${className}`}>
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600 font-semibold border-b-2 border-blue-600 py-1' : 'text-slate-600'
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
