import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import RequestTimeline from '../../components/request/RequestTimeline';
import requestService from '../../services/request.service';
import {
  ArrowLeft,
  Smartphone,
  Wrench,
  Calendar,
  Clock,
  XCircle,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const CustomerRequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReasonInput, setCancellationReasonInput] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelFormError, setCancelFormError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const fetchRequestDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await requestService.getRequestById(id);
      setRequest(res.data?.request || res.data);
    } catch (err) {
      setError(err.message || 'Request not found or access denied');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const handleOpenCancelModal = () => {
    setCancellationReasonInput('');
    setCancelFormError('');
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (isSubmittingCancel) return;
    setIsCancelModalOpen(false);
    setCancellationReasonInput('');
    setCancelFormError('');
  };

  const handleSubmitCancelRequest = async (e) => {
    e.preventDefault();
    if (!request) return;

    try {
      setIsSubmittingCancel(true);
      setCancelFormError('');
      setCancelSuccessMsg('');

      const trimmedReason = cancellationReasonInput.trim();
      const payload = trimmedReason ? { reason: trimmedReason } : {};

      const res = await requestService.cancelRequest(request.id, payload);
      const updated = res.data?.request || res.data;

      setRequest(updated);

      if (updated.cancellationRequested) {
        setCancelSuccessMsg('Cancellation request submitted successfully and is pending admin review.');
      } else {
        setCancelSuccessMsg('Service request cancelled successfully.');
      }

      setIsCancelModalOpen(false);
      setCancellationReasonInput('');
    } catch (err) {
      setCancelFormError(err.message || 'Failed to submit cancellation request.');
    } finally {
      setIsSubmittingCancel(false);
    }
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

  return (
    <CustomerLayout>
      <Breadcrumb />

      {/* Back button link */}
      <div className="mb-6">
        <Link
          to="/customer/requests"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Requests
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20">
          <Loader text="Loading service request details..." />
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto py-12">
          <ErrorState
            title="Request Not Found or Access Denied"
            description="The requested service request could not be found, or you do not have permission to view it."
            actionText="Back to My Requests"
            onRetry={() => (window.location.href = '/customer/requests')}
          />
        </div>
      ) : request ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Request Reference ID
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900">{request.id}</h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submitted on {formatDate(request.createdAt)}
                </p>
              </div>
              <RequestStatusBadge status={request.status} cancellationRequested={request.cancellationRequested} />
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Lifecycle Status Timeline</h3>
            <RequestTimeline status={request.status} />
          </div>

          {cancelSuccessMsg && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* Requested Item Spec Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requested Item Details</h3>
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-2xl shrink-0 ${
                  request.mobileId ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}
              >
                {request.mobileId ? <Smartphone className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {request.mobile?.name || request.part?.name || request.subject || 'Service Request'}
                </h2>
                {request.mobile?.modelNumber && (
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Model Number: {request.mobile.modelNumber}</p>
                )}
                {request.part?.partNumber && (
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Part Number: {request.part.partNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Quantity</span>
                <span className="font-extrabold text-slate-900 text-sm">{request.quantity}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Price Snapshot (Unit)</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(request.price)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Amount</span>
                <span className="font-extrabold text-blue-600 text-sm">
                  {formatCurrency(Number(request.price) * request.quantity)}
                </span>
              </div>
            </div>
          </div>

          {/* Request Cancelled Banner */}
          {request.status === 'CANCELLED' && (
            <div className="p-5 bg-rose-50/80 border border-rose-200/80 rounded-3xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>REQUEST CANCELLED</span>
              </div>
              <p className="text-rose-800">
                This request has been cancelled and is no longer being processed.
              </p>
              {(request.cancellationReason || request.adminNotes) && (
                <div className="mt-2 pt-2 border-t border-rose-200/80">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                    Cancellation message from MS-Centre Admin:
                  </span>
                  <p className="text-rose-950 font-medium italic mt-0.5">
                    "{request.cancellationReason || request.adminNotes}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Request Review Alert Banner */}
          {request.status === 'PROCESSING' && request.cancellationRequested && (
            <div className="p-5 bg-amber-50/80 border border-amber-200/80 rounded-3xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Cancellation Request Under Review</span>
              </div>
              <p className="text-amber-800">
                You have requested cancellation for this item while in processing. Our Super Admin team is currently reviewing your request.
              </p>
              {request.cancellationReason && (
                <div className="mt-2 pt-2 border-t border-amber-200/80">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Cancellation Reason
                  </span>
                  <p className="text-amber-950 font-medium italic mt-0.5">"{request.cancellationReason}"</p>
                </div>
              )}
            </div>
          )}

          {/* Customer Original Notes (Read-Only) */}
          {request.notes && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-2">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Additional Notes</h3>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                "{request.notes}"
              </p>
            </div>
          )}

          {/* Action Bar Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {['PENDING', 'CONFIRMED'].includes(request.status) ? (
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
                onClick={handleOpenCancelModal}
                disabled={isSubmittingCancel}
              >
                <XCircle className="w-4 h-4 mr-1.5" /> Cancel This Request
              </Button>
            ) : request.status === 'PROCESSING' && !request.cancellationRequested ? (
              <Button
                variant="outline"
                size="sm"
                className="text-amber-700 hover:bg-amber-50 border-amber-300 rounded-xl"
                onClick={handleOpenCancelModal}
                disabled={isSubmittingCancel}
              >
                <XCircle className="w-4 h-4 mr-1.5" /> Request Cancellation
              </Button>
            ) : (
              <div />
            )}

            <Link to="/customer/requests">
              <Button variant="outline" size="sm" className="rounded-xl">
                Back to Requests List
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {/* CANCELLATION REASON MODAL */}
      {isCancelModalOpen && request && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={handleCloseCancelModal}
          title={
            request.status === 'PROCESSING' ? 'Request Cancellation' : 'Cancel Service Request'
          }
          size="md"
        >
          <form onSubmit={handleSubmitCancelRequest} className="space-y-4">
            {request.status === 'PROCESSING' ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  This request is currently in processing. Submitting a cancellation request will notify our Super Admin team for review.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Are you sure you want to cancel this request for{' '}
                <strong>{request.mobile?.name || request.part?.name || request.subject || 'this item'}</strong>?
              </div>
            )}

            {cancelFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{cancelFormError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Why do you want to cancel? <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={cancellationReasonInput}
                onChange={(e) => setCancellationReasonInput(e.target.value)}
                placeholder="Please tell us why you want to cancel this request (optional)."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 placeholder-slate-400 resize-none"
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
              >
                Keep Request
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                disabled={isSubmittingCancel}
              >
                {isSubmittingCancel ? (
                  <>
                    <Spinner size="sm" className="mr-2 text-white" /> Submitting...
                  </>
                ) : request.status === 'PROCESSING' ? (
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

export default CustomerRequestDetails;
