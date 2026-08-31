import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
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
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [attention, setAttention] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [dashRes, enqRes, reqRes, attRes] = await Promise.all([
        adminDashboardService.getDashboard(),
        adminDashboardService.getRecentEnquiries(5),
        adminDashboardService.getRecentRequests(5),
        adminDashboardService.getAttentionItems(),
      ]);

      setStats(dashRes.data?.stats || null);
      setRecentEnquiries(enqRes.data?.enquiries || []);
      setRecentRequests(reqRes.data?.requests || []);
      setAttention(attRes.data?.attention || null);
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Super Admin Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live overview of inventory, customer inquiries, and service requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link to="/admin/mobiles">
              <span className="px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors inline-block">
                + Add Mobile
              </span>
            </Link>
            <Link to="/admin/parts">
              <span className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors inline-block">
                + Add Part
              </span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20">
            <Loader text="Loading live dashboard statistics..." />
          </div>
        ) : error ? (
          <div className="py-12">
            <ErrorState
              title="Dashboard Data Unavailable"
              description={error}
              actionText="Retry Loading"
              onRetry={fetchDashboardData}
            />
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Customers Card */}
              <Card>
                <CardBody className="p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Registered Customers</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {stats?.customers?.total ?? 0}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      <span className="text-emerald-600 font-semibold">{stats?.customers?.active ?? 0} active</span>
                      {stats?.customers?.inactive ? ` • ${stats.customers.inactive} inactive` : ''}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>

              {/* Mobiles Card */}
              <Card>
                <CardBody className="p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Total Mobiles</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {stats?.mobiles?.total ?? 0}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      <span className="text-blue-600 font-semibold">{stats?.mobiles?.active ?? 0} active</span>
                      {stats?.mobiles?.featured ? ` • ${stats.mobiles.featured} featured` : ''}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                    <Smartphone className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>

              {/* Parts Card */}
              <Card>
                <CardBody className="p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Spare Parts</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {stats?.parts?.total ?? 0}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      <span className="text-purple-600 font-semibold">{stats?.parts?.active ?? 0} active</span>
                      {stats?.parts?.lowStock ? (
                        <span className="text-amber-600 font-medium"> • {stats.parts.lowStock} low stock</span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                    <Wrench className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>

              {/* Enquiries Card */}
              <Link to="/admin/enquiries?status=NEW" className="block transition-transform hover:-translate-y-0.5">
                <Card className="hover:border-amber-300 hover:shadow-xs transition-all">
                  <CardBody className="p-4 sm:p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">New Enquiries</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">
                        {stats?.enquiries?.new ?? 0}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Total: {stats?.enquiries?.total ?? 0} enquiries</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                  </CardBody>
                </Card>
              </Link>

              {/* Service Requests Card */}
              <Link to="/admin/requests?status=PENDING" className="block transition-transform hover:-translate-y-0.5">
                <Card className="hover:border-blue-300 hover:shadow-xs transition-all">
                  <CardBody className="p-4 sm:p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Pending Requests</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1">
                        {stats?.requests?.pending ?? 0}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {stats?.requests?.processing ?? 0} processing • {stats?.requests?.completed ?? 0} completed
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                  </CardBody>
                </Card>
              </Link>

              {/* Low Stock Items Card */}
              <Link to="/admin/inventory/low-stock" className="block transition-transform hover:-translate-y-0.5">
                <Card className="hover:border-red-300 hover:shadow-xs transition-all">
                  <CardBody className="p-4 sm:p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Low Stock Parts</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-red-600 mt-1">
                        {stats?.parts?.lowStock ?? 0}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {stats?.parts?.outOfStock ? `${stats.parts.outOfStock} out of stock` : 'Stock normal'}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </div>

            {/* Attention Needed Banner Cards */}
            {attention && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/admin/enquiries?status=NEW" className="block">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800">New Enquiries</span>
                      <MessageSquare className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xl font-extrabold text-amber-900 mt-1">{attention.newEnquiries}</p>
                    <span className="text-[10px] text-amber-700 mt-1 block">Awaiting admin response ➔</span>
                  </div>
                </Link>

                <Link to="/admin/requests?status=PENDING" className="block">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-800">Pending Requests</span>
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xl font-extrabold text-blue-900 mt-1">{attention.pendingRequests}</p>
                    <span className="text-[10px] text-blue-700 mt-1 block">Awaiting confirmation ➔</span>
                  </div>
                </Link>

                <Link to="/admin/inventory/low-stock" className="block">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl hover:bg-orange-100/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-800">Low Stock Parts</span>
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-xl font-extrabold text-orange-900 mt-1">{attention.lowStockParts}</p>
                    <span className="text-[10px] text-orange-700 mt-1 block">Reorder threshold reached ➔</span>
                  </div>
                </Link>

                <Link to="/admin/inventory" className="block">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl hover:bg-red-100/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-800">Out of Stock Parts</span>
                      <Package className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-xl font-extrabold text-red-900 mt-1">{attention.outOfStockParts}</p>
                    <span className="text-[10px] text-red-700 mt-1 block">Zero inventory remaining ➔</span>
                  </div>
                </Link>
              </div>
            )}

            {/* Feeds Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Customer Enquiries Feed */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Recent Customer Enquiries</h2>
                  <Link
                    to="/admin/enquiries"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View All Enquiries <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <CardBody className="divide-y divide-slate-100 p-0">
                  {recentEnquiries.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No recent customer enquiries found.</div>
                  ) : (
                    recentEnquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-slate-900 truncate">{enq.subject}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            From: <span className="font-semibold text-slate-700">{enq.customerName}</span> ({enq.customerEmail}) • {formatDate(enq.createdAt)}
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
                </CardBody>
              </Card>

              {/* Recent Service Requests Feed */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Recent Repair & Part Requests</h2>
                  <Link
                    to="/admin/requests"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Manage Requests <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <CardBody className="divide-y divide-slate-100 p-0">
                  {recentRequests.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No recent service requests found.</div>
                  ) : (
                    recentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-slate-900 truncate">{req.itemName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Customer: <span className="font-semibold text-slate-700">{req.customerName}</span> • Qty: {req.quantity} • Total: {formatCurrency(req.price * req.quantity)}
                          </p>
                        </div>
                        <RequestStatusBadge status={req.status} cancellationRequested={req.cancellationRequested} />
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
