import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Toast from '../../components/common/Toast';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import apiClient from '../../services/api';
import { User, Mail, Phone, Calendar, Edit3, Save, X, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user: authUser, role, updateUser } = useAuth();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const Layout = isSuperAdmin ? AdminLayout : CustomerLayout;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Edit form state
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/users/profile');
      const userData = res.data.user;
      setProfile(userData);
      setName(userData.name || '');
      setMobileNumber(userData.mobileNumber || '');
    } catch (err) {
      setError(err.message || 'Failed to fetch user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.patch('/users/profile', {
        name: name.trim(),
        mobileNumber: mobileNumber ? mobileNumber.trim() : null,
      });

      const updatedUser = res.data.user;
      setProfile(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      setToastMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setName(profile.name || '');
      setMobileNumber(profile.mobileNumber || '');
    }
    setIsEditing(false);
  };

  const breadcrumbItems = isSuperAdmin
    ? [{ label: 'Admin', path: '/admin' }, { label: 'My Profile' }]
    : [{ label: 'Home', path: '/' }, { label: 'Dashboard', path: '/customer' }, { label: 'My Profile' }];

  return (
    <Layout>
      {toastMsg && <Toast type={toastMsg.type} message={toastMsg.text} onClose={() => setToastMsg(null)} />}

      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Account Profile</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your personal contact details and view account details</p>
          </div>
          {!loading && !error && (
            <div className="flex items-center gap-2">
              <Link to={isSuperAdmin ? '/admin/change-password' : '/customer/change-password'}>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" /> Change Password
                </Button>
              </Link>
              {!isEditing && (
                <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <Card>
            <CardBody className="py-12">
              <Loader label="Loading profile information..." />
            </CardBody>
          </Card>
        ) : error ? (
          <Card>
            <CardBody className="py-8">
              <ErrorState title="Profile Load Failed" message={error} onRetry={fetchProfile} />
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Card: Account Overview */}
            <Card className="md:col-span-1">
              <CardBody className="text-center py-8">
                <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4 shadow-inner">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{profile.email || profile.mobileNumber}</p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Role: {profile.role}
                  </span>
                  <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${profile.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {profile.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Right Card: Account Details & Edit Form */}
            <Card className="md:col-span-2">
              <CardHeader className="bg-slate-50/50 py-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> Account Details
                </h3>
              </CardHeader>
              <CardBody>
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <Input
                      label="Full Name"
                      required
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <Input
                      label="Mobile Number"
                      placeholder="Enter 10-digit mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Read Only)</label>
                      <input
                        type="text"
                        disabled
                        value={profile.email || 'Not provided'}
                        className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button type="submit" variant="primary" size="sm" isLoading={saving} className="flex items-center gap-1.5">
                        <Save className="w-4 h-4" /> Save Changes
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={handleCancelEdit} disabled={saving} className="flex items-center gap-1.5">
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 divide-y divide-slate-100">
                    <div className="flex items-center gap-3 pt-1">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Full Name</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{profile.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Email Address</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{profile.email || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Mobile Number</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{profile.mobileNumber || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Account Created</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
