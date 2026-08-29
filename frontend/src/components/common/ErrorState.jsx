import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  description = 'Unable to load data at this time. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-xl border border-red-200 my-4">
      <div className="p-3 bg-red-100 rounded-full text-red-600 mb-3">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h4 className="text-base font-semibold text-red-900 mb-1">{title}</h4>
      <p className="text-sm text-red-600 max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
