import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
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

  return (
    <CustomerLayout>
      {toastMsg && <Toast type={toastMsg.type} message={toastMsg.text} onClose={() => setToastMsg(null)} />}
      
      <div className="max-w-md mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="text-center bg-slate-50/80 p-6 sm:p-8 border-b border-slate-100">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md">
              {isLogin ? <LogIn className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back to MS-Centre' : 'Create Customer Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
              {isLogin
                ? 'Sign in to access your inquiries, service requests, and account'
                : 'Register to submit device requests and interact with MS-Centre'}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs rounded-2xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <Input
                label="Email or Mobile Number"
                required
                placeholder="Enter email or 10-digit mobile"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {!isLogin && (
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}

              {isLogin && (
                <div className="flex justify-end pt-0.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}

              <Button type="submit" variant="primary" isLoading={loading} className="w-full rounded-xl py-3 font-bold shadow-xs">
                {isLogin ? 'Sign In' : 'Register Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
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
    </CustomerLayout>
  );
};

export default AuthPlaceholder;
