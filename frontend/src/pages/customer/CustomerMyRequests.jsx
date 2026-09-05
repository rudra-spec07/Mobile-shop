import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import RequestTimeline from '../../components/request/RequestTimeline';
import requestService from '../../services/request.service';
import {
  FileText,
  Smartphone,
  Wrench,
  Calendar,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  ShoppingBag,
} from 'lucide-react';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const CustomerMyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected request for details modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Cancellation Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [cancellationReasonInput, setCancellationReasonInput] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelFormError, setCancelFormError] = useState('');

  const fetchRequests = async (page = 1, status = statusFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = { page, limit: 10 };
      if (status) params.status = status;

      const res = await requestService.getMyRequests(params);
      setRequests(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load your service requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleOpenCancelModal = (requestItem) => {
    setRequestToCancel(requestItem);
    setCancellationReasonInput('');
    setCancelFormError('');
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (isSubmittingCancel) return;
    setIsCancelModalOpen(false);
    setRequestToCancel(null);
    setCancellationReasonInput('');
    setCancelFormError('');
  };

  const handleSubmitCancelRequest = async (e) => {
    e.preventDefault();
    if (!requestToCancel) return;

    try {
      setIsSubmittingCancel(true);
      setCancelFormError('');
      setActionError('');
      setCancelSuccessMsg('');

      const trimmedReason = cancellationReasonInput.trim();
      const payload = trimmedReason ? { reason: trimmedReason } : {};

      const res = await requestService.cancelRequest(requestToCancel.id, payload);
      const updated = res.data?.request || res.data;

      // Update state locally
      setRequests((prev) => prev.map((r) => (r.id === requestToCancel.id ? updated : r)));
      if (selectedRequest?.id === requestToCancel.id) {
        setSelectedRequest(updated);
      }

      if (updated.cancellationRequested) {
        setCancelSuccessMsg('Cancellation request submitted successfully and is pending admin review.');
      } else {
        setCancelSuccessMsg('Service request cancelled successfully.');
      }

      setIsCancelModalOpen(false);
      setRequestToCancel(null);
      setCancellationReasonInput('');
    } catch (err) {
      setCancelFormError(err.message || 'Failed to submit cancellation request.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleOpenDetails = (requestItem) => {
    setSelectedRequest(requestItem);
    setActionError('');
    setCancelSuccessMsg('');
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
    <CustomerLayout>
      <Breadcrumb />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl mb-6 relative overflow-hidden border border-slate-800 shadow-sm">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full mb-2">
              <ShoppingBag className="w-3.5 h-3.5" /> Device & Parts Order Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Orders & Requests</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track real-time progress, status lifecycle, and price snapshots for your requested devices and spare parts.
            </p>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs (iOS Segmented Bar) */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 mb-6 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              statusFilter === tab.value
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-16">
          <Loader text="Loading your service requests..." />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load requests" description={error} onRetry={() => fetchRequests(currentPage)} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="You haven't submitted any requests yet."
          description={
            statusFilter
              ? `No requests found with status '${statusFilter}'.`
              : 'Browse our mobile catalogue or spare parts list and click "Request Device Purchase" or "Request Spare Part" to create a request.'
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const isMobileReq = Boolean(req.mobileId);
              const itemName = isMobileReq ? req.mobile?.name : req.part?.name;
              const isEligibleForCancel = ['PENDING', 'CONFIRMED'].includes(req.status);

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all p-5 sm:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Item Info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3.5 rounded-2xl shrink-0 ${
                          isMobileReq ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}
                      >
                        {isMobileReq ? <Smartphone className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            ID: #{req.id.slice(0, 8)}
                          </span>
                          <RequestStatusBadge status={req.status} cancellationRequested={req.cancellationRequested} />
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                          {itemName || req.subject || 'Service Request'}
                        </h3>

                        {req.subject && itemName && (
                          <p className="text-xs text-slate-500 mt-0.5">{req.subject}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(req.createdAt)}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">Quantity: {req.quantity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Price Snapshot
                        </span>
                        <span className="text-lg font-extrabold text-blue-600">
                          {formatCurrency(Number(req.price) * req.quantity)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEligibleForCancel ? (
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
                            onClick={() => handleOpenCancelModal(req)}
                            disabled={isSubmittingCancel}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                          </Button>
                        ) : req.status === 'PROCESSING' && !req.cancellationRequested ? (
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-amber-700 hover:bg-amber-50 border-amber-300 rounded-xl"
                            onClick={() => handleOpenCancelModal(req)}
                            disabled={isSubmittingCancel}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Request Cancel
                          </Button>
                        ) : null}
                        <Button
                          variant="primary"
                          size="xs"
                          className="bg-slate-900 hover:bg-slate-800 rounded-xl"
                          onClick={() => handleOpenDetails(req)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Service Request Details"
          size="lg"
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Request Reference Code
                </span>
                <p className="text-sm font-mono font-extrabold text-slate-900">{selectedRequest.id}</p>
                <p className="text-xs text-slate-500 mt-0.5">Submitted on {formatDate(selectedRequest.createdAt)}</p>
              </div>
              <RequestStatusBadge status={selectedRequest.status} cancellationRequested={selectedRequest.cancellationRequested} />
            </div>

            {/* Lifecycle Progress Bar */}
            <RequestTimeline status={selectedRequest.status} />

            {actionError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{actionError}</span>
              </div>
            )}

            {cancelSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{cancelSuccessMsg}</span>
              </div>
            )}

            {/* Requested Item Spec */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requested Item Information</h4>
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-3 rounded-2xl ${
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Quantity</span>
                  <span className="font-extrabold text-slate-900">{selectedRequest.quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Unit Price Snapshot</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedRequest.price)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Total Amount</span>
                  <span className="font-extrabold text-blue-600">
                    {formatCurrency(Number(selectedRequest.price) * selectedRequest.quantity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Request Notice if pending admin review */}
            {selectedRequest.status === 'PROCESSING' && selectedRequest.cancellationRequested && (
              <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Cancellation Request Under Review</span>
                </div>
                <p className="text-amber-800">
                  You have requested cancellation for this item while in processing. Our Super Admin team is reviewing your request.
                </p>
                {selectedRequest.cancellationReason && (
                  <div className="mt-2 pt-2 border-t border-amber-200/80">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Cancellation Reason
                    </span>
                    <p className="text-amber-950 font-medium italic mt-0.5">
                      "{selectedRequest.cancellationReason}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Customer Notes (Original Request Notes - Read Only) */}
            {selectedRequest.notes && (
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Additional Notes</h4>
                <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3.5 rounded-xl border border-slate-100">
                  "{selectedRequest.notes}"
                </p>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {['PENDING', 'CONFIRMED'].includes(selectedRequest.status) ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
                  onClick={() => handleOpenCancelModal(selectedRequest)}
                  disabled={isSubmittingCancel}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Cancel This Request
                </Button>
              ) : selectedRequest.status === 'PROCESSING' && !selectedRequest.cancellationRequested ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-700 hover:bg-amber-50 border-amber-300 rounded-xl"
                  onClick={() => handleOpenCancelModal(selectedRequest)}
                  disabled={isSubmittingCancel}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Request Cancellation
                </Button>
              ) : (
                <div />
              )}
              <Button variant="outline" size="sm" onClick={() => setIsDetailsModalOpen(false)} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDITABLE CANCELLATION REASON MODAL */}
      {isCancelModalOpen && requestToCancel && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={handleCloseCancelModal}
          title={
            requestToCancel.status === 'PROCESSING'
              ? 'Request Cancellation'
              : 'Cancel Service Request'
          }
          size="md"
        >
          <form onSubmit={handleSubmitCancelRequest} className="space-y-4">
            {requestToCancel.status === 'PROCESSING' ? (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  This request is currently in processing. Submitting a cancellation request will notify our Super Admin team for review.
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs text-slate-600">
                Are you sure you want to cancel this request for <strong>{requestToCancel.mobile?.name || requestToCancel.part?.name || requestToCancel.subject || 'this item'}</strong>?
              </div>
            )}

            {cancelFormError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{cancelFormError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Why do you want to cancel? <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={cancellationReasonInput}
                onChange={(e) => setCancellationReasonInput(e.target.value)}
                placeholder="Please tell us why you want to cancel this request (optional)."
                className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400 resize-none transition-all outline-none"
                maxLength={1000}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseCancelModal}
                disabled={isSubmittingCancel}
                className="rounded-xl"
              >
                Keep Request
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                disabled={isSubmittingCancel}
              >
                {isSubmittingCancel ? (
                  <>
                    <Spinner size="sm" className="mr-2 text-white" /> Submitting...
                  </>
                ) : requestToCancel.status === 'PROCESSING' ? (
                  'Submit Cancellation Request'
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </CustomerLayout>
  );
};

export default CustomerMyRequests;
