import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { LogIn, UserPlus } from 'lucide-react';

const AuthPlaceholder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const isLogin = location.pathname === '/login';

  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.CUSTOMER);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate authentication login for foundation testing
    const userRole = selectedRole === ROLES.SUPER_ADMIN ? ROLES.SUPER_ADMIN : ROLES.CUSTOMER;
    const mockUser = {
      id: 'mock-user-123',
      name: name || (userRole === ROLES.SUPER_ADMIN ? 'Shop Super Admin' : 'Customer User'),
      email: emailOrMobile.includes('@') ? emailOrMobile : 'user@example.com',
      mobileNumber: !emailOrMobile.includes('@') ? emailOrMobile : '9876543210',
      role: userRole,
    };
    const mockToken = 'mock_jwt_bearer_token_mobile_adda_foundation';

    login(mockUser, mockToken);

    if (userRole === ROLES.SUPER_ADMIN) {
      navigate('/admin');
    } else {
      navigate('/customer');
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader className="text-center bg-slate-50/50 py-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{isLogin ? 'Login to Mobile-Adda' : 'Create Customer Account'}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {isLogin ? 'Access your enquiries, service requests, and profile' : 'Register to submit requests and interact with shop admin'}
            </p>
          </CardHeader>
          <CardBody>
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

              <Input
                label="Password"
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Account Role Selector for Shell Testing */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Select Role for Demo Session:</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={ROLES.CUSTOMER}
                      checked={selectedRole === ROLES.CUSTOMER}
                      onChange={() => setSelectedRole(ROLES.CUSTOMER)}
                    />
                    Customer
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={ROLES.SUPER_ADMIN}
                      checked={selectedRole === ROLES.SUPER_ADMIN}
                      onChange={() => setSelectedRole(ROLES.SUPER_ADMIN)}
                    />
                    Super Admin
                  </label>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                {isLogin ? 'Login' : 'Register Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              {isLogin ? (
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                    Register here
                  </Link>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                    Login here
                  </Link>
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default AuthPlaceholder;
