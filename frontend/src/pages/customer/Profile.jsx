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
import { User, Mail, Phone, Calendar, Edit3, Save, X, KeyRound, Shield, Download, UserX, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import msCentreLogo from '../../assets/images/ms-centre-logo.jpeg';

const Profile = ({ embedded = false }) => {
  const { user: authUser, role, updateUser } = useAuth();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const Layout = isSuperAdmin ? AdminLayout : CustomerLayout;
  const Container = embedded ? React.Fragment : Layout;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // DPDP state
  const [downloading, setDownloading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [erasureReason, setErasureReason] = useState('');
  const [submittingErasure, setSubmittingErasure] = useState(false);

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

  const handleExportData = async () => {
    setDownloading(true);
    try {
      const res = await apiClient.get('/users/export-data');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `my-personal-data-${profile.id.slice(0, 8)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setToastMsg({ type: 'success', text: 'Personal data export generated successfully!' });
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Failed to export personal data.' });
    } finally {
      setDownloading(false);
    }
  };

  const handleWithdrawConsent = async (purpose = 'MARKETING_COMMUNICATION') => {
    setWithdrawing(true);
    try {
      await apiClient.post('/users/withdraw-consent', { purpose, reason: 'Consent withdrawn by user via Profile' });
      setMarketingConsent(false);
      setToastMsg({ type: 'success', text: 'Marketing communications consent withdrawn successfully. Your account remains active.' });
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Failed to withdraw consent.' });
    } finally {
      setWithdrawing(false);
    }
  };

  const handleRequestErasure = async (e) => {
    e.preventDefault();
    setSubmittingErasure(true);
    try {
      const res = await apiClient.post('/users/request-erasure', { reason: erasureReason.trim() || 'Customer requested data erasure' });
      setToastMsg({ type: 'success', text: res.data.message || 'Data erasure request submitted successfully.' });
      setShowErasureModal(false);
      setErasureReason('');
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Failed to submit erasure request.' });
    } finally {
      setSubmittingErasure(false);
    }
  };

  const breadcrumbItems = isSuperAdmin
    ? [{ label: 'Admin', path: '/admin' }, { label: 'My Profile' }]
    : [{ label: 'Home', path: '/' }, { label: 'Dashboard', path: '/customer' }, { label: 'My Profile' }];

  return (
    <Container>
      {toastMsg && <Toast type={toastMsg.type} message={toastMsg.text} onClose={() => setToastMsg(null)} />}

      <div className={embedded ? 'space-y-6' : 'max-w-4xl mx-auto py-6 px-4 space-y-6'}>
        {!embedded && <Breadcrumb items={breadcrumbItems} />}

        {!embedded && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Account Profile</h1>
              <p className="text-xs text-slate-500 mt-1">Manage your personal contact details and view account status</p>
            </div>
            {!loading && !error && (
              <div className="flex items-center gap-2">
                <Link to={isSuperAdmin ? '/admin/change-password' : '/customer/change-password'}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 rounded-xl">
                    <KeyRound className="w-4 h-4" /> Change Password
                  </Button>
                </Link>
                {!isEditing && (
                  <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 rounded-xl">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
            <Loader label="Loading profile information..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <ErrorState title="Profile Load Failed" message={error} onRetry={fetchProfile} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Card: Account Overview */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 text-center">
                {isSuperAdmin ? (
                  <div className="w-24 h-24 rounded-full border-2 border-slate-200 shadow-md overflow-hidden flex items-center justify-center mx-auto mb-4 bg-slate-900 shrink-0">
                    <img src={msCentreLogo} alt="Armaan Mobile Service Centre Logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold mb-4 shadow-md">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{profile.email || profile.mobileNumber}</p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                    {profile.role}
                  </span>
                  <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${profile.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                    {profile.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              {/* DPDP Privacy Rights Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">DPDP Privacy & Data</h3>
                </div>

                {/* 1. Export Data */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-700">Right to Access & Portability</p>
                  <button
                    onClick={handleExportData}
                    disabled={downloading}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>{downloading ? 'Preparing Export...' : 'Export My Data'}</span>
                  </button>
                </div>

                {/* 2. Consent Preferences */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-700">Consent Preferences</p>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-600 font-medium">Marketing Communications</span>
                    {marketingConsent ? (
                      <button
                        onClick={() => handleWithdrawConsent('MARKETING_COMMUNICATION')}
                        disabled={withdrawing}
                        className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        {withdrawing ? 'Saving...' : 'Withdraw'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">Withdrawn</span>
                    )}
                  </div>
                </div>

                {/* 3. Data Erasure Request */}
                {!isSuperAdmin && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700">Right to Erasure</p>
                    <button
                      onClick={() => setShowErasureModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200/60 rounded-xl transition-all"
                    >
                      <UserX className="w-3.5 h-3.5 text-rose-600" />
                      <span>Request Data Erasure</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Account Details & Edit Form */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> Account Details
                </h3>
              </div>
              <div className="p-6">
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-100/80 border border-slate-200/80 rounded-xl text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button type="submit" variant="primary" size="sm" isLoading={saving} className="flex items-center gap-1.5 rounded-xl">
                        <Save className="w-4 h-4" /> Save Changes
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={handleCancelEdit} disabled={saving} className="flex items-center gap-1.5 rounded-xl">
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 divide-y divide-slate-100">
                    <div className="flex items-center gap-3.5 pt-1">
                      <div className="p-2.5 bg-slate-100/80 text-slate-600 rounded-xl shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">{profile.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 pt-3.5">
                      <div className="p-2.5 bg-slate-100/80 text-slate-600 rounded-xl shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">{profile.email || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 pt-3.5">
                      <div className="p-2.5 bg-slate-100/80 text-slate-600 rounded-xl shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</p>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">{profile.mobileNumber || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 pt-3.5">
                      <div className="p-2.5 bg-slate-100/80 text-slate-600 rounded-xl shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Created</p>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">
                          {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Erasure Request Modal */}
      {showErasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleRequestErasure} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Request Data Erasure</h3>
                <p className="text-[11px] text-slate-500 font-medium">Pursuant to Section 12 of DPDP Act, 2023</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submitting an erasure request alerts our Privacy Officer to process personal data removal. Completed order and service request records will be retained as required by tax and legal regulations.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Request (Optional)</label>
              <textarea
                rows="3"
                value={erasureReason}
                onChange={(e) => setErasureReason(e.target.value)}
                placeholder="Specify reason for requesting data erasure..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowErasureModal(false)}
                disabled={submittingErasure}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingErasure}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {submittingErasure ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Container>
  );
};

export default Profile;
