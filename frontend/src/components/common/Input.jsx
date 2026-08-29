import React from 'react';

const Input = ({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error
            ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300 text-slate-900 placeholder:text-slate-400'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export default Input;
