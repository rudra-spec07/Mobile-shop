import React from 'react';
import Spinner from './Spinner';

const Loader = ({ message = 'Loading content...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Spinner size="lg" className="text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <Spinner size="md" className="text-blue-600 mb-3" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default Loader;
