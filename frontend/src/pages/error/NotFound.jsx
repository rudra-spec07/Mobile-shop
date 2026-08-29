import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
