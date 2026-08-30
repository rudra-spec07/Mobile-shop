import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const defaultSortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'oldest', label: 'Oldest First' },
];

const SortDropdown = ({ value = 'newest', onChange, options = defaultSortOptions, className = '' }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-8 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer appearance-none shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
