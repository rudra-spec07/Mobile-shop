import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import Button from '../common/Button';

const SearchEmptyState = ({ title = 'No results found', message = 'No mobiles or parts matched your search or filters.', onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm my-6">
      <div className="p-4 bg-slate-100 text-slate-400 rounded-full mb-4">
        <SearchX className="w-10 h-10" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-6">{message}</p>

      {onClearFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters} className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
};

export default SearchEmptyState;
