import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import EnquiryStatusBadge from '../../components/enquiry/EnquiryStatusBadge';
import enquiryService from '../../services/enquiry.service';
import { MessageSquare, Smartphone, Wrench, Calendar, Clock, XCircle, ChevronRight, AlertCircle, Eye } from 'lucide-react';

const CustomerMyEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected enquiry for details modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchEnquiries = async (page = 1, status = statusFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = { page, limit: 10 };
      if (status) params.status = status;

      const res = await enquiryService.getMyEnquiries(params);
      setEnquiries(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load your enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleCancelEnquiry = async (enquiryId) => {
    try {
      setIsCancelling(true);
      setActionError('');
      const res = await enquiryService.cancelEnquiry(enquiryId);
      const updated = res.data?.enquiry || res.data;
      
      // Update local state
      setEnquiries((prev) => prev.map((e) => (e.id === enquiryId ? updated : e)));
      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry(updated);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to cancel enquiry.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setActionError('');
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

  return (
    <CustomerLayout>
      <Breadcrumb />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl mb-6 relative overflow-hidden border border-slate-800 shadow-sm">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold rounded-full mb-2.5">
              <MessageSquare className="w-3.5 h-3.5" /> Customer Inquiry Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Inquiries & Support</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track responses from MS-Centre support for your device and spare part inquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs (iOS Segmented Control) */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 mb-6 flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            !statusFilter
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          All Inquiries
        </button>
        {['NEW', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Content Layout */}
      {isLoading ? (
        <div className="py-20">
          <Loader text="Loading your inquiries..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchEnquiries(currentPage)} />
      ) : enquiries.length === 0 ? (
        <EmptyState
          title="No Inquiries Found"
          message={
            statusFilter
              ? `You have no inquiries matching the '${statusFilter}' status.`
              : 'You have not submitted any customer inquiries yet.'
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Ref ID</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Attached Product</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted On</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">#{enq.id.slice(0, 8)}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{enq.subject}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{enq.message}</p>
                    </td>
                    <td className="px-5 py-4">
                      {enq.mobile ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg font-semibold">
                          <Smartphone className="w-3.5 h-3.5" /> {enq.mobile.name}
                        </span>
                      ) : enq.part ? (
                        <span className="inline-flex items-center gap-1.5 text-purple-600 bg-purple-50/80 px-2.5 py-1 rounded-lg font-semibold">
                          <Wrench className="w-3.5 h-3.5" /> {enq.part.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">General Enquiry</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <EnquiryStatusBadge status={enq.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDate(enq.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenDetails(enq)}
                        className="inline-flex items-center gap-1 rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="md:hidden space-y-4">
            {enquiries.map((enq) => (
              <div key={enq.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900">#{enq.id.slice(0, 8)}</span>
                  <EnquiryStatusBadge status={enq.status} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{enq.subject}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{enq.message}</p>
                </div>

                {enq.mobile && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg font-semibold">
                    <Smartphone className="w-3.5 h-3.5" /> {enq.mobile.name}
                  </div>
                )}
                {enq.part && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50/80 px-2.5 py-1 rounded-lg font-semibold">
                    <Wrench className="w-3.5 h-3.5" /> {enq.part.name}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>{formatDate(enq.createdAt)}</span>
                  <Button variant="outline" size="xs" onClick={() => handleOpenDetails(enq)} className="rounded-xl">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalResults={pagination.total}
                limit={10}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Customer Enquiry Details & Cancellation Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Enquiry Details #${selectedEnquiry.id.slice(0, 8)}`}
          size="lg"
        >
          <div className="space-y-5">
            {actionError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Header Summary */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Status</span>
                <EnquiryStatusBadge status={selectedEnquiry.status} className="mt-1" />
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="block font-medium">Submitted: {formatDate(selectedEnquiry.createdAt)}</span>
                {selectedEnquiry.updatedAt && selectedEnquiry.updatedAt !== selectedEnquiry.createdAt && (
                  <span className="block text-[11px] text-slate-400">Updated: {formatDate(selectedEnquiry.updatedAt)}</span>
                )}
              </div>
            </div>

            {/* Attached Product Preview */}
            {selectedEnquiry.mobile && (
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <Smartphone className="w-5 h-5 shrink-0" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block text-sm">{selectedEnquiry.mobile.name}</span>
                  <span className="text-slate-500">Model #: {selectedEnquiry.mobile.modelNumber || 'Standard'}</span>
                </div>
              </div>
            )}

            {selectedEnquiry.part && (
              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                  <Wrench className="w-5 h-5 shrink-0" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block text-sm">{selectedEnquiry.part.name}</span>
                  <span className="text-slate-500">Part #: {selectedEnquiry.part.partNumber}</span>
                </div>
              </div>
            )}

            {/* Question Box */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject</h4>
              <p className="text-sm font-bold text-slate-900">{selectedEnquiry.subject}</p>
              <div className="mt-2 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Admin Official Response Box */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Official Store Response
              </h4>

              {selectedEnquiry.adminResponse ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                    {selectedEnquiry.adminResponse}
                  </p>
                  {selectedEnquiry.respondedAt && (
                    <div className="text-[11px] text-emerald-700 font-semibold pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                      <span>Answered by MS-Centre Support</span>
                      <span>{formatDate(selectedEnquiry.respondedAt)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-center text-xs text-slate-400">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  <span>Awaiting official store response. Our representatives usually respond within 24 business hours.</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {['NEW', 'IN_PROGRESS'].includes(selectedEnquiry.status) ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                  onClick={() => handleCancelEnquiry(selectedEnquiry.id)}
                  isLoading={isCancelling}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Cancel This Enquiry
                </Button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  Enquiry is in final status ({selectedEnquiry.status}).
                </span>
              )}

              <Button variant="primary" size="sm" onClick={() => setIsDetailsModalOpen(false)} className="rounded-xl">
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </CustomerLayout>
  );
};

export default CustomerMyEnquiries;
