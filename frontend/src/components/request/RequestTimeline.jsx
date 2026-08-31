import React from 'react';
import { Clock, CheckCircle2, RefreshCw, CheckCheck, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'Request Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing Item', icon: RefreshCw },
  { key: 'COMPLETED', label: 'Request Completed', icon: CheckCheck },
];

const STATUS_INDEX_MAP = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  COMPLETED: 3,
};

const RequestTimeline = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800">
        <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">Request Cancelled</h4>
          <p className="text-xs text-red-700 mt-0.5">
            This request has been cancelled and is no longer being processed.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_INDEX_MAP[status] ?? 0;

  return (
    <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Request Progress Lifecycle</h4>
      
      <div className="relative flex items-center justify-between">
        {/* Progress Connecting Line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 z-0">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step Circles */}
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let circleStyle = 'bg-slate-200 text-slate-400 border-slate-300';
          if (isCompleted) {
            circleStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
          } else if (isCurrent) {
            circleStyle = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 shadow-md animate-pulse';
          }

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all ${circleStyle}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold mt-2 text-center max-w-[70px] sm:max-w-[100px] leading-tight ${
                  isCurrent ? 'text-blue-600 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RequestTimeline;
