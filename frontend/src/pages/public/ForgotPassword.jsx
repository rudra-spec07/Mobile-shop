import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Button from '../../components/common/Button';
import {
  KeyRound,
  ArrowLeft,
  CheckCircle,
  Mail,
  Shield,
  Headphones,
  Send,
  Lock,
} from 'lucide-react';
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
                  🔐 Account Recovery
                </span>

                {/* Heading */}
                <h1 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold text-white leading-tight tracking-tight mb-3">
                  Reset Your<br />Password
                </h1>

                {/* Subtitle */}
                <p className="text-blue-200 text-sm leading-relaxed mb-6 max-w-xs">
                  Don't worry, it happens to the best of us. We'll help you get back into your account.
                </p>

                {/* Feature items */}
                <div className="space-y-3">
                  {[
                    { icon: Mail, text: 'Enter your registered email or mobile' },
                    { icon: Send, text: 'Receive reset instructions' },
                    { icon: Lock, text: 'Create a new secure password' },
                    { icon: CheckCircle, text: 'Access your account again' },
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

              {/* Lock illustration */}
              <div className="relative z-10 mt-8 flex justify-center lg:justify-start">
                <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl opacity-80">
                  {/* Lock body */}
                  <rect x="15" y="50" width="70" height="55" rx="12" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                  {/* Lock shackle */}
                  <path d="M30 50V35C30 21.193 41.193 10 55 10V10C68.807 10 80 21.193 80 35V50" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  {/* Keyhole */}
                  <circle cx="50" cy="72" r="8" fill="rgba(255,255,255,0.2)"/>
                  <rect x="47" y="78" width="6" height="12" rx="3" fill="rgba(255,255,255,0.2)"/>
                </svg>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-6 rounded-full bg-blue-400/20 blur-xl" />
              </div>

              <div className="relative z-10 mt-4 hidden lg:block">
                <p className="text-blue-300/70 text-xs italic font-medium">"Your security is our priority"</p>
              </div>
            </div>

            {/* ====== RIGHT PANEL — Form ====== */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
              {submitted ? (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Reset Request Submitted</h3>
                    <p className="text-sm text-slate-600 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 leading-relaxed max-w-sm mx-auto">
                      If an account exists for the details provided, password reset instructions have been dispatched.
                    </p>
                  </div>
                  <Link to="/login">
                    <Button variant="outline" className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 rounded-xl py-2.5">
                      <ArrowLeft className="w-4 h-4" /> Return to Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Heading */}
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Forgot Password
                    </h2>
                    <p className="text-sm text-slate-500 mt-1.5 font-medium">
                      Enter your registered email address or mobile number and we will send you instructions to reset your password.
                    </p>
                  </div>

                  {/* Error message */}
                  {errorMsg && (
                    <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium rounded-xl flex items-start gap-2">
                      <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email or Mobile */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email or Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          inputMode="email"
                          required
                          placeholder="Enter your email or mobile number"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
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
                        'Send Reset Link'
                      )}
                    </button>

                    {/* Back to sign in */}
                    <div className="pt-1 text-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Sign In
                      </Link>
                    </div>
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

export default ForgotPassword;
