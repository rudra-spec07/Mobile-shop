import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg('Invalid or missing password reset token in URL');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-md mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="text-center bg-slate-50/80 p-6 sm:p-8 border-b border-slate-100">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
              Create a new secure password for your MS-Centre account.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            {!token && !success ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Missing Reset Token</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This reset link is missing a valid security token. Please request a new password reset link.
                </p>
                <Link to="/forgot-password">
                  <Button variant="primary" className="w-full rounded-xl py-3 font-bold shadow-xs">
                    Request New Reset Link
                  </Button>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Password Reset Complete</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <Link to="/login">
                  <Button variant="primary" className="w-full rounded-xl py-3 font-bold shadow-xs">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs rounded-2xl">
                    {errorMsg}
                  </div>
                )}

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button type="submit" variant="primary" isLoading={loading} className="w-full rounded-xl py-3 font-bold shadow-xs">
                  Set New Password
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ResetPassword;
