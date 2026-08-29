import React, { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Profile from '../customer/Profile';
import ChangePassword from '../customer/ChangePassword';
import { User, ShieldCheck, KeyRound, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Admin', path: '/admin' }, { label: 'Settings & Account' }]} />

        {/* Page Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Account & Settings</h1>
              <p className="text-xs text-slate-500">Manage your Super Admin profile details, account security, and credentials</p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Link to="/admin/profile">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> Full Profile
              </Button>
            </Link>
            <Link to="/admin/change-password">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" /> Change Password
              </Button>
            </Link>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-xl">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" /> Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Account Security & Password
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-50 rounded-b-xl">
          {activeTab === 'profile' ? (
            <Profile />
          ) : (
            <ChangePassword />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
