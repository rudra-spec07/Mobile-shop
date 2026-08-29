import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody } from '../../components/common/Card';
import { Smartphone, Wrench, Package, Users, MessageSquare, FileText, Bell, Settings } from 'lucide-react';

const AdminPlaceholder = () => {
  const location = useLocation();
  const path = location.pathname.split('/').pop() || 'admin';
  const pageTitle = path.charAt(0).toUpperCase() + path.slice(1);

  const getIcon = () => {
    switch (path) {
      case 'mobiles': return Smartphone;
      case 'parts': return Wrench;
      case 'inventory': return Package;
      case 'customers': return Users;
      case 'enquiries': return MessageSquare;
      case 'orders': return FileText;
      case 'notifications': return Bell;
      case 'settings': return Settings;
      default: return Package;
    }
  };

  const Icon = getIcon();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Manage {pageTitle}</h1>
            <p className="text-xs text-slate-500">Super Admin management console and data tables</p>
          </div>
        </div>

        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">Admin {pageTitle} Console Foundation Ready</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              CRUD management interfaces, data tables, search/filters, and response forms will be connected in subsequent backend API integration modules.
            </p>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPlaceholder;
