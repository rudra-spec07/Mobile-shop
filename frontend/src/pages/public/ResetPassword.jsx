import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Button from '../../components/common/Button';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  CheckCircle,
  Lock,
  Shield,
  Headphones,
  KeyRound,
} from 'lucide-react';
import apiClient from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const trustBadges = [
    { icon: CheckCircle, title: 'Genuine Products', subtitle: 'Original & verified' },
    { icon: Headphones, title: 'Expert Service', subtitle: 'Professional support' },
    { icon: Shield, title: 'Secure & Reliable', subtitle: 'Your trust, our priority' },
  ];

  return (
    <CustomerLayout>
      <div className="w-full max-w-5xl mx-auto py-6 sm:py-8 lg:py-10 px-2 sm:px-4">
        {/* Main Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[440px]">

            {/* ====== LEFT PANEL ====== */}
            <div
              className="relative lg:w-[45%] flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0a2463 0%, #1e3a8a 35%, #1d4ed8 70%, #3b82f6 100%)',
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
              <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }} />

              <div className="relative z-10">
                {/* Badge */}
                <span className="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20 mb-5">
                  🛡️ Secure Reset
                </span>

                {/* Heading */}
                <h1 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold text-white leading-tight tracking-tight mb-3">
                  Create New<br />Password
                </h1>

                {/* Subtitle */}
                <p className="text-blue-200 text-sm leading-relaxed mb-6 max-w-xs">
                  Choose a strong password to keep your account safe and secure.
                </p>

                {/* Tips */}
                <div className="space-y-3">
                  {[
                    { icon: KeyRound, text: 'Use at least 6 characters' },
                    { icon: Shield, text: 'Mix letters, numbers & symbols' },
                    { icon: Lock, text: 'Avoid using personal info' },
                    { icon: CheckCircle, text: 'Don\'t reuse old passwords' },
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/25 transition-colors">
                        <feat.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white/90 text-sm font-medium">{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shield illustration */}
              <div className="relative z-10 mt-8 flex justify-center lg:justify-start">
                <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl opacity-80">
                  <path d="M50 5L10 25V55C10 82.5 27 105 50 115C73 105 90 82.5 90 55V25L50 5Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                  <path d="M42 60L48 66L62 52" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-6 rounded-full bg-blue-400/20 blur-xl" />
              </div>

              <div className="relative z-10 mt-4 hidden lg:block">
                <p className="text-blue-300/70 text-xs italic font-medium">"Your security is our priority"</p>
              </div>
            </div>

            {/* ====== RIGHT PANEL ====== */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
              {!token && !success ? (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Missing Reset Token</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                      This reset link is missing a valid security token. Please request a new password reset link.
                    </p>
                  </div>
                  <Link to="/forgot-password">
                    <button
                      className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-[0.98] hover:shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
                      }}
                    >
                      Request New Reset Link
                    </button>
                  </Link>
                </div>
              ) : success ? (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Password Reset Complete</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Your password has been reset successfully. You can now log in with your new password.
                    </p>
                  </div>
                  <Link to="/login">
                    <button
                      className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-[0.98] hover:shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
                      }}
                    >
                      Go to Sign In
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Heading */}
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Reset Password
                    </h2>
                    <p className="text-sm text-slate-500 mt-1.5 font-medium">
                      Create a new secure password for your Armaan Mobile Service Centre account.
                    </p>
                  </div>

                  {/* Error */}
                  {errorMsg && (
                    <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium rounded-xl flex items-start gap-2">
                      <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Enter new password (min 6 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold text-white rounded-xl shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-lg"
                      style={{
                        background: loading
                          ? '#6b7280'
                          : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
                      }}
                    >
                      {loading ? (
                        <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : (
                        'Set New Password'
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ====== TRUST BADGES ====== */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-14">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <badge.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{badge.title}</p>
                  <p className="text-xs text-slate-500">{badge.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ResetPassword;
