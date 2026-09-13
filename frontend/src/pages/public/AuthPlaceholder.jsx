import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Settings,
  ShoppingBag,
  Gift,
  ClipboardList,
  Wrench,
  Clock,
  Star,
  Shield,
  Headphones,
} from 'lucide-react';
import apiClient from '../../services/api';

const AuthPlaceholder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const isLogin = location.pathname === '/login';

  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (!isLogin && !agreeTerms) {
      setErrorMsg('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Issue HTTP POST to Backend /auth/login
        const res = await apiClient.post('/auth/login', {
          emailOrMobile: emailOrMobile.trim(),
          password,
        });

        const { user, token } = res.data;
        login(user, token);

        if (user.role === ROLES.SUPER_ADMIN) {
          navigate('/admin');
        } else {
          navigate('/customer');
        }
      } else {
        // Issue HTTP POST to Backend /auth/register (Enforces CUSTOMER role)
        const isEmail = emailOrMobile.includes('@');
        const payload = {
          name: name.trim(),
          email: isEmail ? emailOrMobile.trim() : undefined,
          mobileNumber: !isEmail ? emailOrMobile.trim() : undefined,
          password,
        };

        const res = await apiClient.post('/auth/register', payload);

        const { user, token } = res.data;
        login(user, token);
        navigate('/customer');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Feature items for the left panel
  const loginFeatures = [
    { icon: ClipboardList, text: 'Track your service status' },
    { icon: Settings, text: 'Manage your profile' },
    { icon: Clock, text: 'View order history' },
    { icon: Gift, text: 'Get latest updates' },
  ];

  const registerFeatures = [
    { icon: ClipboardList, text: 'Submit service requests' },
    { icon: Wrench, text: 'Track your repairs' },
    { icon: ShoppingBag, text: 'View order history' },
    { icon: Star, text: 'Get exclusive offers' },
  ];

  const features = isLogin ? loginFeatures : registerFeatures;

  const trustBadges = [
    { icon: CheckCircle, title: 'Genuine Products', subtitle: 'Original & verified' },
    { icon: Headphones, title: 'Expert Service', subtitle: 'Professional support' },
    { icon: Shield, title: 'Secure & Reliable', subtitle: 'Your trust, our priority' },
  ];

  return (
    <CustomerLayout>
      {toastMsg && <Toast type={toastMsg.type} message={toastMsg.text} onClose={() => setToastMsg(null)} />}

      <div className="w-full max-w-5xl mx-auto py-6 sm:py-8 lg:py-10 px-2 sm:px-4">
        {/* Main Auth Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[520px]">

            {/* ====== LEFT PANEL — Branding + Features ====== */}
            <div
              className="relative lg:w-[45%] flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0a2463 0%, #1e3a8a 35%, #1d4ed8 70%, #3b82f6 100%)',
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
              <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }} />
              <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #dbeafe, transparent)' }} />

              <div className="relative z-10">
                {/* Badge */}
                <span className="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20 mb-5">
                  {isLogin ? '✨ Welcome Back' : '🎉 Join Our Community'}
                </span>

                {/* Heading */}
                <h1 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold text-white leading-tight tracking-tight mb-3">
                  {isLogin ? (
                    <>Sign In to<br />Your Account</>
                  ) : (
                    <>Create Your<br />Account</>
                  )}
                </h1>

                {/* Subtitle */}
                <p className="text-blue-200 text-sm leading-relaxed mb-6 max-w-xs">
                  {isLogin
                    ? 'Access your service requests, orders and exclusive offers.'
                    : 'Get easy access to mobiles, spare parts and expert service support.'}
                </p>

                {/* Feature list */}
                <div className="space-y-3">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/25 transition-colors">
                        <feat.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white/90 text-sm font-medium">{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone illustration (SVG) */}
              <div className="relative z-10 mt-8 flex justify-center lg:justify-start">
                <div className="relative">
                  {/* Phone body */}
                  <svg width="140" height="200" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl opacity-90">
                    <rect x="10" y="5" width="120" height="190" rx="20" fill="url(#phoneGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                    <rect x="18" y="25" width="104" height="150" rx="4" fill="rgba(255,255,255,0.08)"/>
                    {/* Notch */}
                    <rect x="45" y="10" width="50" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
                    {/* Camera */}
                    <circle cx="70" cy="14" r="3" fill="rgba(255,255,255,0.25)"/>
                    {/* Home indicator */}
                    <rect x="50" y="183" width="40" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
                    {/* Screen content lines */}
                    <rect x="30" y="50" width="60" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
                    <rect x="30" y="62" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.1)"/>
                    <rect x="30" y="72" width="50" height="3" rx="1.5" fill="rgba(255,255,255,0.1)"/>
                    {/* App icons grid */}
                    <rect x="30" y="90" width="20" height="20" rx="5" fill="rgba(255,255,255,0.12)"/>
                    <rect x="60" y="90" width="20" height="20" rx="5" fill="rgba(255,255,255,0.12)"/>
                    <rect x="90" y="90" width="20" height="20" rx="5" fill="rgba(255,255,255,0.12)"/>
                    <rect x="30" y="120" width="20" height="20" rx="5" fill="rgba(255,255,255,0.12)"/>
                    <rect x="60" y="120" width="20" height="20" rx="5" fill="rgba(255,255,255,0.12)"/>
                    <rect x="90" y="120" width="20" height="20" rx="5" fill="rgba(255,255,255,0.12)"/>
                    <defs>
                      <linearGradient id="phoneGrad" x1="10" y1="5" x2="130" y2="195" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1e3a8a"/>
                        <stop offset="100%" stopColor="#0f172a"/>
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Decorative glow */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-8 rounded-full bg-blue-400/20 blur-xl" />
                </div>
              </div>

              {/* Tagline at bottom */}
              <div className="relative z-10 mt-4 hidden lg:block">
                <p className="text-blue-300/70 text-xs italic font-medium">
                  {isLogin ? '"Service You Can Trust"' : '"Your Mobile Partner, Always!"'}
                </p>
              </div>
            </div>

            {/* ====== RIGHT PANEL — Form ====== */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Customer Account'}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                  {isLogin
                    ? 'Sign in to your Armaan Mobile Service Centre account'
                    : 'Join Armaan Mobile Service Centre and get started today!'}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Register only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400"
                      />
                    </div>
                  </div>
                )}

                {/* Email or Mobile Number */}
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
                      required
                      placeholder={isLogin ? 'Enter your email or mobile number' : 'Enter email or 10-digit mobile number'}
                      value={emailOrMobile}
                      onChange={(e) => setEmailOrMobile(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={isLogin ? 'Enter your password' : 'Enter password (min 6 characters)'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Confirm Password (Register only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your password"
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
                )}

                {/* Remember Me / Forgot Password (Login) OR Terms Checkbox (Register) */}
                {isLogin ? (
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-4.5 h-4.5 w-[18px] h-[18px] border-2 border-slate-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center group-hover:border-blue-400">
                          {rememberMe && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-600 select-none">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                ) : (
                  <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-[18px] h-[18px] border-2 border-slate-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center group-hover:border-blue-400">
                        {agreeTerms && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 leading-relaxed select-none">
                      I agree to the{' '}
                      <Link to="/terms" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2">
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                )}

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
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Auth Mode */}
              <div className="mt-6 text-center text-sm text-slate-500">
                {isLogin ? (
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      Register here
                    </Link>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      Sign in here
                    </Link>
                  </p>
                )}
              </div>
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

export default AuthPlaceholder;
