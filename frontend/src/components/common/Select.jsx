import React from 'react';

const Select = ({
  label,
  options = [],
  error,
  helperText,
  id,
  className = '',
  required = false,
  placeholder = 'Select an option',
  children,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error
            ? 'border-red-500 text-red-900 focus:ring-red-500'
            : 'border-slate-300 text-slate-900'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
        {options.map((option) => {
          const value = typeof option === 'object' ? option.value : option;
          const optLabel = typeof option === 'object' ? option.label : option;
          return (
            <option key={value} value={value}>
              {optLabel}
            </option>
          );
        })}
      </select>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export default Select;
