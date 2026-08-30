import React from 'react';

const PartStatusBadge = ({ status, type = 'stock' }) => {
  if (type === 'record') {
    const isInactive = status === 'INACTIVE';
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isInactive
            ? 'bg-slate-100 text-slate-600 border border-slate-300'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            isInactive ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'
          }`}
        ></span>
        {status || 'ACTIVE'}
      </span>
    );
  }

  // Stock Status Badges
  const config = {
    IN_STOCK: {
      label: 'In Stock',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    LOW_STOCK: {
      label: 'Low Stock',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    OUT_OF_STOCK: {
      label: 'Out of Stock',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
  };

  const current = config[status] || config.IN_STOCK;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${current.dot}`}></span>
      {current.label}
    </span>
  );
};

export default PartStatusBadge;
