import React from 'react';
import { RefreshCw, Home } from 'lucide-react';
import Button from '../../components/common/Button';

const GlobalError = ({ onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-500 mb-6">
          We couldn't load this page due to an unexpected issue.
        </p>
        <div className="flex items-center gap-3">
          {onRetry && (
            <Button variant="primary" onClick={onRetry} className="flex-1">
              Try Again
            </Button>
          )}
          <a href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-1.5" />
              Go Home
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GlobalError;
