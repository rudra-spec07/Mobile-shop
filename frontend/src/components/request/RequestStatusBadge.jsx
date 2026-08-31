import React from 'react';
import { Clock, CheckCircle2, RefreshCw, CheckCheck, XCircle, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Approval',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle2,
  },
  PROCESSING: {
    label: 'In Processing',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: RefreshCw,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCheck,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
};

const RequestStatusBadge = ({ status, cancellationRequested = false, className = '', showIcon = true }) => {
  if (status === 'PROCESSING' && cancellationRequested) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-2xs transition-colors bg-amber-100 text-amber-900 border-amber-300 ${className}`}
      >
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
        <span>Cancellation Requested</span>
      </span>
    );
  }

  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-2xs transition-colors ${config.className} ${className}`}
    >
      {showIcon && <Icon className={`w-3.5 h-3.5 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />}
      <span>{config.label}</span>
    </span>
  );
};

export default RequestStatusBadge;
