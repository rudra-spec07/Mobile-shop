import React from 'react';

const Card = ({ children, className = '', hoverable = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden ${
        hoverable
          ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-b border-slate-100 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-5 py-3 bg-slate-50/50 border-t border-slate-100 ${className}`}>
    {children}
  </div>
);

export default Card;
