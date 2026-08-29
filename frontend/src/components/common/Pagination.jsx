import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-xs text-slate-500 font-medium">
        Page <span className="text-slate-800 font-semibold">{currentPage}</span> of{' '}
        <span className="text-slate-800 font-semibold">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          isDisabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          isDisabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
