import React from 'react';

const statusConfig = {
  NEW: {
    label: 'New Enquiry',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  RESPONDED: {
    label: 'Responded',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const EnquiryStatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default EnquiryStatusBadge;
