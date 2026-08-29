import React from 'react';
import { useLocation } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card, { CardBody } from '../../components/common/Card';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import { User, FileText, Bell, Settings } from 'lucide-react';

const CustomerPlaceholder = () => {
  const location = useLocation();
  const path = location.pathname.split('/').pop() || 'customer';
  const pageTitle = path.charAt(0).toUpperCase() + path.slice(1);

  const getIcon = () => {
    switch (path) {
      case 'profile': return User;
      case 'notifications': return Bell;
      case 'settings': return Settings;
      default: return FileText;
    }
  };

  const Icon = getIcon();

  return (
    <CustomerLayout>
      <Breadcrumb />
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{pageTitle}</h1>
            <p className="text-xs text-slate-500">Customer account management and records</p>
          </div>
        </div>

        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">{pageTitle} Foundation Ready</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Interactive forms, messaging threads, and notifications list will be populated in subsequent business modules.
            </p>
          </CardBody>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CustomerPlaceholder;
