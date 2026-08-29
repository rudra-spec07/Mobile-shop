import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center text-xs text-slate-500 py-2.5 px-4 bg-slate-100/60 rounded-lg mb-4">
      <Link to="/" className="flex items-center hover:text-slate-900 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-800">{formattedName}</span>
            ) : (
              <Link to={to} className="hover:text-slate-900 transition-colors">
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
