import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
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
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader className="text-center bg-slate-50/50 py-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Forgot Password</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered email address or mobile number and we will send you instructions to reset your password.
            </p>
          </CardHeader>
          <CardBody>
            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Reset Request Submitted</h3>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  If the account exists, password reset instructions have been sent.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Return to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
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

                <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                  Send Reset Link
                </Button>

                <div className="pt-2 text-center">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default ForgotPassword;
