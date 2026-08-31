import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import RequestTimeline from '../../components/request/RequestTimeline';
import requestService from '../../services/request.service';
import {
  FileText,
  Search,
  Filter,
  Smartphone,
  Wrench,
  User,
  Calendar,
  CheckCircle2,
  RefreshCw,
  CheckCheck,
  XCircle,
  Eye,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const AdminRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected request details modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Cancel Reason input state
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelReasonInput, setShowCancelReasonInput] = useState(false);

  const fetchAdminRequests = async (page = 1, searchQuery = search, status = statusFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (status) params.status = status;

      const res = await requestService.getAdminRequests(params);
      setRequests(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load customer requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminRequests(currentPage, search, statusFilter);
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAdminRequests(1, search, statusFilter);
  };

  // Status Action Handlers
  const handleConfirmRequest = async (requestId) => {
    try {
      setIsActionLoading(true);
      setActionError('');
      setActionSuccessMsg('');
      const res = await requestService.confirmRequest(requestId);
      const updated = res.data?.request || res.data;

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      if (selectedRequest?.id === requestId) setSelectedRequest(updated);
      setActionSuccessMsg('Request has been CONFIRMED successfully.');
    } catch (err) {
      setActionError(err.message || 'Failed to confirm request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleProcessRequest = async (requestId) => {
    try {
      setIsActionLoading(true);
      setActionError('');
      setActionSuccessMsg('');
      const res = await requestService.processRequest(requestId);
      const updated = res.data?.request || res.data;

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      if (selectedRequest?.id === requestId) setSelectedRequest(updated);
      setActionSuccessMsg('Request is now IN PROCESSING status.');
    } catch (err) {
      setActionError(err.message || 'Failed to update to processing');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    try {
      setIsActionLoading(true);
      setActionError('');
      setActionSuccessMsg('');
      const res = await requestService.completeRequest(requestId);
      const updated = res.data?.request || res.data;

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      if (selectedRequest?.id === requestId) setSelectedRequest(updated);
      setActionSuccessMsg('Request has been marked COMPLETED.');
    } catch (err) {
      setActionError(err.message || 'Failed to complete request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelAdminRequest = async (requestId) => {
    try {
      setIsActionLoading(true);
      setActionError('');
      setActionSuccessMsg('');

      const payload = cancelReason ? { reason: cancelReason } : {};
      const res = await requestService.cancelAdminRequest(requestId, payload);
      const updated = res.data?.request || res.data;

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      if (selectedRequest?.id === requestId) setSelectedRequest(updated);
      setActionSuccessMsg('Request has been CANCELLED.');
      setShowCancelReasonInput(false);
      setCancelReason('');
    } catch (err) {
      setActionError(err.message || 'Failed to cancel request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectCancellationRequest = async (requestId) => {
    try {
      setIsActionLoading(true);
      setActionError('');
      setActionSuccessMsg('');

      const res = await requestService.rejectCancellationRequest(requestId);
      const updated = res.data?.request || res.data;

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      if (selectedRequest?.id === requestId) setSelectedRequest(updated);
      setActionSuccessMsg('Customer cancellation request rejected. Processing continues.');
    } catch (err) {
      setActionError(err.message || 'Failed to reject cancellation request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenDetails = (requestItem) => {
    setSelectedRequest(requestItem);
    setActionError('');
    setActionSuccessMsg('');
    setShowCancelReasonInput(false);
    setCancelReason('');
    setIsDetailsModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusTabs = [
    { label: 'All Requests', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <AdminLayout>
      <Breadcrumb />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl mb-6 relative overflow-hidden border border-slate-800 shadow-sm">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full mb-2">
              <FileText className="w-3.5 h-3.5" /> Super Admin Order Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Service Requests & Orders Desk</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Process customer mobile purchases and spare part requests, verify stock availability, and manage lifecycle status.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <Card className="mb-6 border-slate-200">
        <CardBody className="p-4 sm:p-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, email, item name, subject, or notes..."
                className="pl-10 text-xs"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
          </form>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap border ${
                  statusFilter === tab.value
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Request Table / List */}
      {isLoading ? (
        <div className="py-16">
          <Loader text="Loading customer service requests..." />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load requests" description={error} onRetry={() => fetchAdminRequests(currentPage)} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No requests found."
          description={
            statusFilter || search
              ? 'Try modifying your search query or filter criteria.'
              : 'When customers place device or spare part requests, they will appear here for processing.'
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Request / Customer</th>
                  <th className="py-3.5 px-4">Requested Item</th>
                  <th className="py-3.5 px-4">Qty & Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.map((req) => {
                  const isMobileReq = Boolean(req.mobileId);
                  const itemName = isMobileReq ? req.mobile?.name : req.part?.name;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900">{req.customer?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-500">{req.customer?.email || req.customer?.mobileNumber}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">Ref: {req.id.slice(0, 8)}...</div>
                      </td>

                      {/* Requested Item */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isMobileReq ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                            }`}
                          >
                            {isMobileReq ? <Smartphone className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{itemName || req.subject}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {isMobileReq ? 'Mobile Device' : 'Spare Part'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Qty & Price */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">Qty: {req.quantity}</div>
                        <div className="text-xs font-extrabold text-blue-700">
                          {formatCurrency(Number(req.price) * req.quantity)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <RequestStatusBadge status={req.status} />
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">{formatDate(req.createdAt)}</td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleConfirmRequest(req.id)}
                              disabled={isActionLoading}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm
                            </Button>
                          )}
                          {req.status === 'CONFIRMED' && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              onClick={() => handleProcessRequest(req.id)}
                              disabled={isActionLoading}
                            >
                              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Process
                            </Button>
                          )}
                          {req.status === 'PROCESSING' && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => handleCompleteRequest(req.id)}
                              disabled={isActionLoading}
                            >
                              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Complete
                            </Button>
                          )}
                          <Button
                            variant="primary"
                            size="xs"
                            className="bg-slate-900 hover:bg-slate-800"
                            onClick={() => handleOpenDetails(req)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const isMobileReq = Boolean(req.mobileId);
              const itemName = isMobileReq ? req.mobile?.name : req.part?.name;

              return (
                <Card key={req.id} className="border-slate-200">
                  <CardBody className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">Ref: {req.id.slice(0, 8)}...</span>
                        <h4 className="text-sm font-extrabold text-slate-900">{req.customer?.name}</h4>
                        <p className="text-xs text-slate-500">{req.customer?.email || req.customer?.mobileNumber}</p>
                      </div>
                      <RequestStatusBadge status={req.status} />
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div
                        className={`p-2.5 rounded-lg shrink-0 ${
                          isMobileReq ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {isMobileReq ? <Smartphone className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-slate-900 truncate block">{itemName || req.subject}</span>
                        <div className="flex items-center justify-between text-xs mt-0.5">
                          <span className="text-slate-500">Qty: {req.quantity}</span>
                          <span className="font-extrabold text-blue-700">
                            {formatCurrency(Number(req.price) * req.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">{formatDate(req.createdAt)}</span>
                      <Button
                        variant="primary"
                        size="xs"
                        className="bg-slate-900 hover:bg-slate-800"
                        onClick={() => handleOpenDetails(req)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* ADMIN REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Admin Service Request Control"
          size="lg"
        >
          <div className="space-y-5">
            {/* Header / ID */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Request Reference ID
                </span>
                <p className="text-sm font-mono font-extrabold text-slate-900">{selectedRequest.id}</p>
                <p className="text-xs text-slate-500 mt-0.5">Created on {formatDate(selectedRequest.createdAt)}</p>
              </div>
              <RequestStatusBadge status={selectedRequest.status} />
            </div>

            {/* Lifecycle Timeline */}
            <RequestTimeline status={selectedRequest.status} />

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Customer Cancellation Request Review Banner */}
            {selectedRequest.status === 'PROCESSING' && selectedRequest.cancellationRequested && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-amber-900 text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600 animate-bounce" />
                    <span>Customer Requested Cancellation</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-md">
                    Pending Admin Decision
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  The customer has requested to cancel this service request while it is currently in processing.
                </p>
                {selectedRequest.cancellationReason && (
                  <p className="text-xs font-semibold text-amber-950 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                    Reason: "{selectedRequest.cancellationReason}"
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="danger"
                    size="xs"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={() => handleCancelAdminRequest(selectedRequest.id)}
                    disabled={isActionLoading}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Approve Cancellation
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="text-slate-700 bg-white border-slate-300 hover:bg-slate-50 font-bold"
                    onClick={() => handleRejectCancellationRequest(selectedRequest.id)}
                    disabled={isActionLoading}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Reject Request & Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">Customer Name</span>
                  <span className="font-bold text-slate-900">{selectedRequest.customer?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email Address</span>
                  <span className="font-medium text-slate-800">{selectedRequest.customer?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mobile Number</span>
                  <span className="font-medium text-slate-800">{selectedRequest.customer?.mobileNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Requested Item Spec */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Item Specs</h4>
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    selectedRequest.mobileId ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}
                >
                  {selectedRequest.mobileId ? <Smartphone className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {selectedRequest.mobile?.name || selectedRequest.part?.name || selectedRequest.subject}
                  </h3>
                  {selectedRequest.mobile?.modelNumber && (
                    <p className="text-xs text-slate-500">Model: {selectedRequest.mobile.modelNumber}</p>
                  )}
                  {selectedRequest.part?.partNumber && (
                    <p className="text-xs text-slate-500">Part #: {selectedRequest.part.partNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block">Quantity</span>
                  <span className="font-extrabold text-slate-900">{selectedRequest.quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Price Snapshot (Unit)</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedRequest.price)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Amount</span>
                  <span className="font-extrabold text-blue-700">
                    {formatCurrency(Number(selectedRequest.price) * selectedRequest.quantity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Processing Info */}
            {selectedRequest.notes && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Notes</h4>
                <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-100">
                  "{selectedRequest.notes}"
                </p>
              </div>
            )}

            {selectedRequest.processedBy && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <span>Completed by Admin Ref: <strong className="font-mono">{selectedRequest.processedBy}</strong></span>
                <span>Date: {formatDate(selectedRequest.processedAt)}</span>
              </div>
            )}

            {/* Cancel Reason Drawer inside Modal */}
            {showCancelReasonInput && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3 animate-fade-in">
                <h4 className="text-xs font-bold text-red-900">Provide Cancellation Reason (Optional)</h4>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Requested item is currently out of stock..."
                  className="w-full text-xs p-2.5 bg-white border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setShowCancelReasonInput(false)}
                    disabled={isActionLoading}
                  >
                    Cancel Action
                  </Button>
                  <Button
                    variant="danger"
                    size="xs"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={() => handleCancelAdminRequest(selectedRequest.id)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? 'Processing...' : 'Confirm Cancellation'}
                  </Button>
                </div>
              </div>
            )}

            {/* Admin Lifecycle Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                {selectedRequest.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleConfirmRequest(selectedRequest.id)}
                    disabled={isActionLoading}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Request
                  </Button>
                )}
                {selectedRequest.status === 'CONFIRMED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleProcessRequest(selectedRequest.id)}
                    disabled={isActionLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" /> Start Processing
                  </Button>
                )}
                {selectedRequest.status === 'PROCESSING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleCompleteRequest(selectedRequest.id)}
                    disabled={isActionLoading}
                  >
                    <CheckCheck className="w-4 h-4 mr-1.5" /> Mark Completed
                  </Button>
                )}
                {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(selectedRequest.status) && !showCancelReasonInput && !selectedRequest.cancellationRequested && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowCancelReasonInput(true)}
                    disabled={isActionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Cancel Request
                  </Button>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default AdminRequestList;
