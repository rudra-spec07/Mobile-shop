import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../common/Button';

const SearchErrorState = ({ message = "We couldn't complete your request. Please check your network and try again.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-red-50/50 border border-red-200 rounded-2xl my-6">
      <div className="p-3 bg-red-100 text-red-600 rounded-full mb-3">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-semibold text-red-900 mb-1">Search Failed</h3>
      <p className="text-xs text-red-600 max-w-sm mb-5">{message}</p>

      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default SearchErrorState;
