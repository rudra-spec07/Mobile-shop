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

const ChangePassword = ({ embedded = false }) => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const Layout = isSuperAdmin ? AdminLayout : CustomerLayout;
  const Container = embedded ? React.Fragment : Layout;

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
    <Container>
      {toastMsg && <Toast type={toastMsg.type} message={toastMsg.text} onClose={() => setToastMsg(null)} />}

      <div className={embedded ? 'space-y-6' : 'max-w-xl mx-auto py-6 px-4 space-y-6'}>
        {!embedded && <Breadcrumb items={breadcrumbItems} />}

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 p-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900">Change Account Password</h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Update your password to keep your account secure</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs rounded-2xl">
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
                  className="absolute right-3.5 top-8 text-slate-400 hover:text-slate-600 transition-colors"
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

              <div className="flex items-center gap-3 pt-3">
                <Button type="submit" variant="primary" isLoading={loading} className="w-full rounded-xl py-3 text-sm font-bold shadow-xs">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ChangePassword;
