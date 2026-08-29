import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import apiClient from '../../services/api';

const ChangePassword = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const Layout = isSuperAdmin ? AdminLayout : CustomerLayout;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match');
      return;
    }

    setLoading(true);

    try {
      // Call Backend PATCH /api/v1/users/change-password
      const res = await apiClient.patch('/users/change-password', {
        currentPassword,
        newPassword,
      });

      setToastMsg({ type: 'success', text: res.message || 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate(isSuperAdmin ? '/admin' : '/customer/profile');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = isSuperAdmin
    ? [{ label: 'Admin', path: '/admin' }, { label: 'Change Password' }]
    : [
        { label: 'Home', path: '/' },
        { label: 'Profile', path: '/customer/profile' },
        { label: 'Change Password' },
      ];

  return (
    <Layout>
      {toastMsg && <Toast type={toastMsg.type} message={toastMsg.text} onClose={() => setToastMsg(null)} />}

      <div className="max-w-xl mx-auto py-6 px-4 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <Card>
          <CardHeader className="bg-slate-50/50 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Change Account Password</h1>
                <p className="text-xs text-slate-500 mt-0.5">Update your password to keep your account secure</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                  Update Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};

export default ChangePassword;
