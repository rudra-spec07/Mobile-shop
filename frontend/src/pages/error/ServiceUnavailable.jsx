import React from 'react';
import { ServerOff, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';

const ServiceUnavailable = ({ onRetry }) => {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ServerOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Mobile-Adda Temporarily Unavailable</h1>
        <p className="text-sm text-slate-500 mb-6">
          We're working on the system or experiencing temporary network maintenance. Please try again shortly.
        </p>
        <Button variant="primary" onClick={handleReload} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    </div>
  );
};

export default ServiceUnavailable;
