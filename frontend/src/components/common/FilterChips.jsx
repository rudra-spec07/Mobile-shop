import React from 'react';
import { X, RotateCcw } from 'lucide-react';

const FilterChips = ({ chips = [], onRemoveChip, onClearAll, className = '' }) => {
  if (!chips || chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 py-2 ${className}`}>
      <span className="text-xs font-semibold text-slate-500 mr-1">Active Filters:</span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full animate-fade-in"
        >
          <span>
            {chip.label}: <strong className="font-semibold">{chip.valueLabel || chip.value}</strong>
          </span>
          <button
            onClick={() => onRemoveChip(chip.key)}
            className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
            title={`Remove ${chip.label} filter`}
          >
            <X className="w-3 h-3 text-blue-600" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Clear All
      </button>
    </div>
  );
};

export default FilterChips;
