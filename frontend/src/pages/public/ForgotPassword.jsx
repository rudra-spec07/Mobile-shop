import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import apiClient from '../../services/api';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const val = identifier.trim();
    if (!val) {
      setErrorMsg('Please enter your email or mobile number');
      return;
    }

    const isEmail = val.includes('@');
    const cleanPhone = val.replace(/[\s-]/g, '');
    const isPhone = /^[0-9+]{7,15}$/.test(cleanPhone);

    if (!isEmail && !isPhone) {
      setErrorMsg('Please enter a valid email address or mobile number');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { identifier: val });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit password reset request.');
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
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
              Enter your registered email address or mobile number and we will send you instructions to reset your password.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Reset Request Submitted</h3>
                <p className="text-xs text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 leading-relaxed">
                  If an account exists for the details provided, password reset instructions have been dispatched.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-xl">
                      <ArrowLeft className="w-4 h-4" /> Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs rounded-2xl">
                    {errorMsg}
                  </div>
                )}

                <Input
                  label="Email or Mobile Number"
                  type="text"
                  inputMode="email"
                  required
                  placeholder="Enter your email or mobile number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />

                <Button type="submit" variant="primary" isLoading={loading} className="w-full rounded-xl py-3 font-bold shadow-xs">
                  Send Reset Link
                </Button>

                <div className="pt-2 text-center">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ForgotPassword;
