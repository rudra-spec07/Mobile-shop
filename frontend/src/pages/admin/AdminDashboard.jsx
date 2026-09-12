import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import ErrorState from '../../components/common/ErrorState';
import { KpiSkeleton } from '../../components/common/Skeleton';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import adminDashboardService from '../../services/adminDashboard.service';
import {
  Smartphone,
  Wrench,
  Users,
  MessageSquare,
  FileText,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Package,
  Plus,
  TrendingUp,
  Activity,
} from 'lucide-react';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ─── Stat Card Component ─── */
const StatCard = ({ label, value, subtext, icon: Icon, color, href }) => {
  const colorMap = {
    blue:   { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', accent: 'text-blue-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', accent: 'text-indigo-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100', accent: 'text-purple-600' },
    amber:  { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', accent: 'text-amber-700' },
    sky:    { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100', accent: 'text-sky-600' },
    red:    { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100', accent: 'text-red-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', accent: 'text-emerald-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  const content = (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group h-full">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{value}</p>
          <div className="mt-2 text-[11px] text-slate-500 leading-relaxed">{subtext}</div>
        </div>
        <div className={`p-3 rounded-2xl ${c.bg} ring-1 ${c.ring} shrink-0 ml-3 group-hover:scale-105 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }
  return content;
};

/* ─── Attention Card Component ─── */
const AttentionCard = ({ label, value, subtitle, icon: Icon, color, href }) => {
  const colorMap = {
    amber:  { bg: 'bg-gradient-to-br from-amber-50 to-orange-50', border: 'border-amber-200/80', iconBg: 'bg-amber-100', iconText: 'text-amber-700', valueText: 'text-amber-900', labelText: 'text-amber-800', subtitleText: 'text-amber-600' },
    blue:   { bg: 'bg-gradient-to-br from-blue-50 to-indigo-50', border: 'border-blue-200/80', iconBg: 'bg-blue-100', iconText: 'text-blue-700', valueText: 'text-blue-900', labelText: 'text-blue-800', subtitleText: 'text-blue-600' },
    orange: { bg: 'bg-gradient-to-br from-orange-50 to-amber-50', border: 'border-orange-200/80', iconBg: 'bg-orange-100', iconText: 'text-orange-700', valueText: 'text-orange-900', labelText: 'text-orange-800', subtitleText: 'text-orange-600' },
    red:    { bg: 'bg-gradient-to-br from-red-50 to-rose-50', border: 'border-red-200/80', iconBg: 'bg-red-100', iconText: 'text-red-700', valueText: 'text-red-900', labelText: 'text-red-800', subtitleText: 'text-red-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <Link to={href} className="block group">
      <div className={`p-4 ${c.bg} border ${c.border} rounded-2xl hover:shadow-md transition-all duration-300`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold ${c.labelText}`}>{label}</span>
          <div className={`w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`w-3.5 h-3.5 ${c.iconText}`} />
          </div>
        </div>
        <p className={`text-2xl font-extrabold ${c.valueText}`}>{value}</p>
        <span className={`text-[10px] font-medium ${c.subtitleText} mt-1 inline-flex items-center gap-1`}>
          {subtitle} <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // React Query: Single optimized dashboard API + recent feeds
  const {
    data: dashRes,
    isLoading: isDashLoading,
    error: dashErr,
    refetch,
  } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: ({ signal }) => adminDashboardService.getDashboard({ signal }),
    staleTime: 30 * 1000,
  });

  const { data: enqRes } = useQuery({
    queryKey: ['adminRecentEnquiries', 5],
    queryFn: ({ signal }) => adminDashboardService.getRecentEnquiries(5, { signal }),
    staleTime: 30 * 1000,
  });

  const { data: reqRes } = useQuery({
    queryKey: ['adminRecentRequests', 5],
    queryFn: ({ signal }) => adminDashboardService.getRecentRequests(5, { signal }),
    staleTime: 30 * 1000,
  });

  const { data: attRes } = useQuery({
    queryKey: ['adminAttentionItems'],
    queryFn: ({ signal }) => adminDashboardService.getAttentionItems({ signal }),
    staleTime: 30 * 1000,
  });

  const stats = dashRes?.data?.stats || null;
  const recentEnquiries = enqRes?.data?.enquiries || [];
  const recentRequests = reqRes?.data?.requests || [];
  const attention = attRes?.data?.attention || null;
  const isLoading = isDashLoading;
  const error = dashErr ? (dashErr.message || 'Failed to load admin dashboard data') : null;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    queryClient.invalidateQueries({ queryKey: ['adminRecentEnquiries'] });
    queryClient.invalidateQueries({ queryKey: ['adminRecentRequests'] });
    queryClient.invalidateQueries({ queryKey: ['adminAttentionItems'] });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Overview of inventory, customer inquiries, and service requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/admin/mobiles"
              className="px-4 py-2.5 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Mobile
            </Link>
            <Link
              to="/admin/parts"
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Part
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <KpiSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="py-12">
            <ErrorState
              title="Dashboard Data Unavailable"
              description={error}
              actionText="Retry Loading"
              onRetry={() => refetch()}
            />
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Registered Customers"
                value={stats?.customers?.total ?? 0}
                subtext={
                  <span>
                    <span className="font-semibold text-emerald-600">{stats?.customers?.active ?? 0} active</span>
                    {stats?.customers?.inactive ? ` · ${stats.customers.inactive} inactive` : ''}
                  </span>
                }
                icon={Users}
                color="blue"
              />
              <StatCard
                label="Total Mobiles"
                value={stats?.mobiles?.total ?? 0}
                subtext={
                  <span>
                    <span className="font-semibold text-blue-600">{stats?.mobiles?.active ?? 0} active</span>
                    {stats?.mobiles?.featured ? ` · ${stats.mobiles.featured} featured` : ''}
                  </span>
                }
                icon={Smartphone}
                color="indigo"
              />
              <StatCard
                label="Spare Parts"
                value={stats?.parts?.total ?? 0}
                subtext={
                  <span>
                    <span className="font-semibold text-purple-600">{stats?.parts?.active ?? 0} active</span>
                    {stats?.parts?.lowStock ? (
                      <span className="font-medium text-amber-600"> · {stats.parts.lowStock} low stock</span>
                    ) : ''}
                  </span>
                }
                icon={Wrench}
                color="purple"
              />
              <StatCard
                label="New Enquiries"
                value={stats?.enquiries?.new ?? 0}
                subtext={<span>Total: {stats?.enquiries?.total ?? 0} enquiries</span>}
                icon={MessageSquare}
                color="amber"
                href="/admin/enquiries?status=NEW"
              />
              <StatCard
                label="Pending Requests"
                value={stats?.requests?.pending ?? 0}
                subtext={
                  <span>{stats?.requests?.processing ?? 0} processing · {stats?.requests?.completed ?? 0} completed</span>
                }
                icon={FileText}
                color="sky"
                href="/admin/requests?status=PENDING"
              />
              <StatCard
                label="Low Stock Parts"
                value={stats?.parts?.lowStock ?? 0}
                subtext={
                  <span>{stats?.parts?.outOfStock ? `${stats.parts.outOfStock} out of stock` : 'Stock normal'}</span>
                }
                icon={AlertTriangle}
                color="red"
                href="/admin/inventory/low-stock"
              />
            </div>

            {/* Attention Needed Banner Cards */}
            {attention && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">Needs Your Attention</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <AttentionCard
                    label="New Enquiries"
                    value={attention.newEnquiries}
                    subtitle="Awaiting response"
                    icon={MessageSquare}
                    color="amber"
                    href="/admin/enquiries?status=NEW"
                  />
                  <AttentionCard
                    label="Pending Requests"
                    value={attention.pendingRequests}
                    subtitle="Awaiting confirmation"
                    icon={FileText}
                    color="blue"
                    href="/admin/requests?status=PENDING"
                  />
                  <AttentionCard
                    label="Low Stock Parts"
                    value={attention.lowStockParts}
                    subtitle="Reorder threshold"
                    icon={AlertTriangle}
                    color="orange"
                    href="/admin/inventory/low-stock"
                  />
                  <AttentionCard
                    label="Out of Stock"
                    value={attention.outOfStockParts}
                    subtitle="Zero inventory"
                    icon={Package}
                    color="red"
                    href="/admin/inventory"
                  />
                </div>
              </div>
            )}

            {/* Feeds Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Customer Enquiries Feed */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Recent Customer Enquiries
                  </h2>
                  <Link
                    to="/admin/enquiries"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentEnquiries.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">No recent customer enquiries found.</p>
                    </div>
                  ) : (
                    recentEnquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-slate-900 truncate">{enq.subject}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            From: <span className="font-semibold text-slate-700">{enq.customerName}</span> · {formatDate(enq.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                            enq.status === 'NEW'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : enq.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Service Requests Feed */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Recent Repair & Part Requests
                  </h2>
                  <Link
                    to="/admin/requests"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    Manage <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentRequests.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">No recent service requests found.</p>
                    </div>
                  ) : (
                    recentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-slate-900 truncate">{req.itemName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">{req.customerName}</span> · Qty: {req.quantity} · {formatCurrency(req.price * req.quantity)}
                          </p>
                        </div>
                        <RequestStatusBadge status={req.status} cancellationRequested={req.cancellationRequested} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
