import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    error: 'border-red-200 bg-red-50/90 text-red-900',
    info: 'border-blue-200 bg-blue-50/90 text-blue-900',
  };

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-up max-w-md ${borders[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium pr-2">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
