import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import EnquiryStatusBadge from '../../components/enquiry/EnquiryStatusBadge';
import AdminRespondModal from '../../components/enquiry/AdminRespondModal';
import AdminStatusModal from '../../components/enquiry/AdminStatusModal';
import enquiryService from '../../services/enquiry.service';
import { MessageSquare, Search, Filter, Smartphone, Wrench, Eye, Edit3, Sliders, RefreshCw, User, Mail, Phone } from 'lucide-react';

const AdminEnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const fetchAdminEnquiries = async (page = 1, search = searchTerm, status = statusFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;

      const res = await enquiryService.getAdminEnquiries(params);
      setEnquiries(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load customer enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminEnquiries(currentPage, searchTerm, statusFilter);
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAdminEnquiries(1, searchTerm, statusFilter);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
    fetchAdminEnquiries(1, '', '');
  };

  const handleUpdatedEnquiry = (updated) => {
    setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (selectedEnquiry?.id === updated.id) {
      setSelectedEnquiry(updated);
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
    <AdminLayout>
      <Breadcrumb />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl mb-6 relative overflow-hidden border border-slate-800 shadow-sm">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full mb-2">
              <MessageSquare className="w-3.5 h-3.5" /> Customer Inquiry Desk Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Manage Customer Enquiries</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review questions, submit official responses, and control enquiry lifecycle statuses.
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search subject, message, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
            <button
              onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                !statusFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {['NEW', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === st ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {(searchTerm || statusFilter) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-20">
          <Loader text="Loading customer enquiries..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchAdminEnquiries(currentPage)} />
      ) : enquiries.length === 0 ? (
        <EmptyState
          title="No Customer Enquiries Found"
          message={
            searchTerm || statusFilter
              ? 'No customer enquiries matched your search parameters.'
              : 'There are currently no customer enquiries in the system.'
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Ref ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Subject & Preview</th>
                  <th className="px-5 py-3.5">Target Product</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">#{enq.id.slice(0, 8)}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{enq.customer?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{enq.customer?.email}</p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{enq.subject}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{enq.message}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {enq.mobile ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md font-semibold">
                          <Smartphone className="w-3.5 h-3.5" /> {enq.mobile.name}
                        </span>
                      ) : enq.part ? (
                        <span className="inline-flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md font-semibold">
                          <Wrench className="w-3.5 h-3.5" /> {enq.part.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">General Query</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <EnquiryStatusBadge status={enq.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDate(enq.createdAt)}</td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => { setSelectedEnquiry(enq); setIsDetailsModalOpen(true); }}
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => { setSelectedEnquiry(enq); setIsRespondModalOpen(true); }}
                        disabled={['RESOLVED', 'CANCELLED'].includes(enq.status)}
                        title="Respond"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => { setSelectedEnquiry(enq); setIsStatusModalOpen(true); }}
                        disabled={['RESOLVED', 'CANCELLED'].includes(enq.status)}
                        title="Status"
                      >
                        <Sliders className="w-3.5 h-3.5" />
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
              <div key={enq.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">#{enq.id.slice(0, 8)}</span>
                  <EnquiryStatusBadge status={enq.status} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{enq.subject}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">From: {enq.customer?.name} ({enq.customer?.email})</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <Button variant="outline" size="xs" onClick={() => { setSelectedEnquiry(enq); setIsDetailsModalOpen(true); }}>
                    Details
                  </Button>
                  <div className="flex gap-1.5">
                    <Button
                      variant="primary"
                      size="xs"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => { setSelectedEnquiry(enq); setIsRespondModalOpen(true); }}
                      disabled={['RESOLVED', 'CANCELLED'].includes(enq.status)}
                    >
                      Respond
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => { setSelectedEnquiry(enq); setIsStatusModalOpen(true); }}
                      disabled={['RESOLVED', 'CANCELLED'].includes(enq.status)}
                    >
                      Status
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
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

      {/* Admin Enquiry Details Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Admin Enquiry Details #${selectedEnquiry.id.slice(0, 8)}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Customer Information Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <User className="w-3.5 h-3.5 text-blue-600" /> Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-700">
                <div><span className="font-semibold text-slate-500 block">Name:</span> {selectedEnquiry.customer?.name}</div>
                <div><span className="font-semibold text-slate-500 block">Email:</span> {selectedEnquiry.customer?.email}</div>
                <div><span className="font-semibold text-slate-500 block">Mobile:</span> {selectedEnquiry.customer?.mobileNumber || 'N/A'}</div>
              </div>
            </div>

            {/* Target Product if attached */}
            {selectedEnquiry.mobile && (
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">{selectedEnquiry.mobile.name}</span>
                  <span className="text-slate-500">Model #: {selectedEnquiry.mobile.modelNumber || 'Standard'}</span>
                </div>
              </div>
            )}

            {selectedEnquiry.part && (
              <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center gap-3">
                <Wrench className="w-5 h-5 text-purple-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">{selectedEnquiry.part.name}</span>
                  <span className="text-slate-500">Part #: {selectedEnquiry.part.partNumber}</span>
                </div>
              </div>
            )}

            {/* Subject & Message */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject & Message</h4>
                <EnquiryStatusBadge status={selectedEnquiry.status} />
              </div>
              <p className="text-sm font-bold text-slate-900">{selectedEnquiry.subject}</p>
              <div className="mt-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Official Response */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Official Admin Response
              </h4>
              {selectedEnquiry.adminResponse ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                    {selectedEnquiry.adminResponse}
                  </p>
                  {selectedEnquiry.respondedAt && (
                    <div className="text-[11px] text-emerald-700 font-semibold pt-1 border-t border-emerald-200/60 flex items-center justify-between">
                      <span>Submitted by Store Administrator</span>
                      <span>{formatDate(selectedEnquiry.respondedAt)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                  No response submitted yet.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setIsDetailsModalOpen(false); setIsStatusModalOpen(true); }}
                disabled={['RESOLVED', 'CANCELLED'].includes(selectedEnquiry.status)}
              >
                Change Status
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => { setIsDetailsModalOpen(false); setIsRespondModalOpen(true); }}
                disabled={['RESOLVED', 'CANCELLED'].includes(selectedEnquiry.status)}
              >
                Respond Now
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Respond Modal */}
      <AdminRespondModal
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        enquiry={selectedEnquiry}
        onSuccess={handleUpdatedEnquiry}
      />

      {/* Admin Status Modal */}
      <AdminStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        enquiry={selectedEnquiry}
        onSuccess={handleUpdatedEnquiry}
      />
    </AdminLayout>
  );
};

export default AdminEnquiryList;
