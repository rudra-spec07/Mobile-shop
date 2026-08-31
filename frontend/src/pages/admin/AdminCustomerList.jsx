import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import adminUserService from '../../services/adminUser.service';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const AdminCustomerList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected User Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status Change Confirmation Modal State
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusActionError, setStatusActionError] = useState('');

  const fetchUsers = async (page = 1, searchQuery = search, status = statusFilter) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = { page, limit: 10 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (status) params.status = status;

      const res = await adminUserService.getAdminUsers(params);
      setUsers(res.data || []);
      if (res.pagination) {
        setPagination({
          page: res.pagination.page || page,
          limit: res.pagination.limit || 10,
          total: res.pagination.total || 0,
          totalPages: Math.ceil((res.pagination.total || 0) / (res.pagination.limit || 10)),
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customer list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, search, statusFilter);
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, search, statusFilter);
  };

  const handleOpenDetailModal = async (user) => {
    try {
      setSelectedUser(user);
      setIsDetailModalOpen(true);
      // Fetch full details with count
      const res = await adminUserService.getAdminUserById(user.id);
      setSelectedUser(res.data?.user || user);
    } catch (err) {
      // Fallback to existing user object
    }
  };

  const handleOpenStatusModal = (user) => {
    setStatusModalUser(user);
    setStatusActionError('');
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    if (isUpdatingStatus) return;
    setIsStatusModalOpen(false);
    setStatusModalUser(null);
    setStatusActionError('');
  };

  const handleToggleUserStatus = async () => {
    if (!statusModalUser) return;

    try {
      setIsUpdatingStatus(true);
      setStatusActionError('');

      const newStatus = statusModalUser.isActive ? 'INACTIVE' : 'ACTIVE';
      const res = await adminUserService.updateUserStatus(statusModalUser.id, { status: newStatus });
      const updatedUser = res.data?.user;

      // Update state locally
      setUsers((prev) =>
        prev.map((u) => (u.id === statusModalUser.id ? { ...u, isActive: updatedUser.isActive } : u))
      );

      if (selectedUser?.id === statusModalUser.id) {
        setSelectedUser((prev) => ({ ...prev, isActive: updatedUser.isActive }));
      }

      setIsStatusModalOpen(false);
      setStatusModalUser(null);
    } catch (err) {
      setStatusActionError(err.message || 'Failed to update customer account status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <AdminLayout>
      <Breadcrumb />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Customer Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              View, search, filter, and manage registered customer accounts
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card className="border-slate-200">
          <CardBody className="p-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers by name, email, or mobile number..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 min-w-[150px]">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
                  >
                    <option value="">All Account Statuses</option>
                    <option value="ACTIVE">Active Customers Only</option>
                    <option value="INACTIVE">Inactive Customers Only</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" size="sm" className="whitespace-nowrap">
                  Search
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-20">
            <Loader text="Loading customer accounts..." />
          </div>
        ) : error ? (
          <div className="py-12">
            <ErrorState
              title="Failed to Load Customers"
              description={error}
              actionText="Retry"
              onRetry={() => fetchUsers(currentPage, search, statusFilter)}
            />
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardBody className="py-12">
              <EmptyState
                title="No Customers Found"
                description={
                  search || statusFilter
                    ? 'No registered customer accounts matched your search or status filter.'
                    : 'No customer accounts registered yet.'
                }
              />
            </CardBody>
          </Card>
        ) : (
          <Card className="border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-center">Activity Summary</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {u.id.substring(0, 8)}...</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {u.email}
                        </div>
                        {u.mobileNumber && (
                          <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {u.mobileNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(u.createdAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-3 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 text-[11px]">
                          <span className="flex items-center gap-1 text-slate-600 font-medium" title="Total Enquiries">
                            <MessageSquare className="w-3 h-3 text-amber-500" /> {u._count?.enquiries ?? 0}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium" title="Total Requests">
                            <FileText className="w-3 h-3 text-blue-500" /> {u._count?.requests ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">
                            <XCircle className="w-3 h-3" /> INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleOpenDetailModal(u)}
                            className="text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> Details
                          </Button>

                          {u.role !== 'SUPER_ADMIN' && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleOpenStatusModal(u)}
                              className={
                                u.isActive
                                  ? 'text-red-600 hover:bg-red-50 border-red-200'
                                  : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                              }
                            >
                              {u.isActive ? (
                                <>
                                  <UserX className="w-3.5 h-3.5 mr-1" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 mr-1" /> Activate
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalResults={pagination.total}
                  limit={pagination.limit}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </Card>
        )}
      </div>

      {/* CUSTOMER DETAIL MODAL */}
      {isDetailModalOpen && selectedUser && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Customer Profile Details"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedUser.name}</h3>
                <p className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedUser.email}
                </p>
                {selectedUser.mobileNumber && (
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedUser.mobileNumber}
                  </p>
                )}
              </div>
              <div>
                {selectedUser.isActive ? (
                  <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full block text-center">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full block text-center">
                    INACTIVE
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 block font-medium">Account Role</span>
                <span className="font-extrabold text-slate-900 uppercase mt-0.5 block">{selectedUser.role}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 block font-medium">Registered On</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{formatDate(selectedUser.createdAt)}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
              <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider">Transaction Activity Summary</h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-100">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" /> Enquiries
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedUser._count?.enquiries ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-100">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" /> Service Requests
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedUser._count?.requests ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {selectedUser.role !== 'SUPER_ADMIN' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenStatusModal(selectedUser);
                  }}
                  className={selectedUser.isActive ? 'text-red-600 border-red-200' : 'text-emerald-700 border-emerald-200'}
                >
                  {selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
              ) : (
                <div />
              )}
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ACCOUNT STATUS CONFIRMATION MODAL */}
      {isStatusModalOpen && statusModalUser && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={handleCloseStatusModal}
          title={statusModalUser.isActive ? 'Deactivate Customer Account' : 'Activate Customer Account'}
          size="sm"
        >
          <div className="space-y-4 text-xs">
            {statusActionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{statusActionError}</span>
              </div>
            )}

            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to {statusModalUser.isActive ? 'deactivate' : 'reactivate'} the customer account for{' '}
              <strong>{statusModalUser.name}</strong> ({statusModalUser.email})?
            </p>

            {statusModalUser.isActive && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                ⚠️ Deactivating this account will prevent the customer from logging into Mobile-Adda until reactivated.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={handleCloseStatusModal} disabled={isUpdatingStatus}>
                Cancel
              </Button>
              <Button
                variant={statusModalUser.isActive ? 'danger' : 'primary'}
                size="sm"
                onClick={handleToggleUserStatus}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <Spinner size="sm" className="mr-2 text-white" /> Processing...
                  </>
                ) : statusModalUser.isActive ? (
                  'Confirm Deactivation'
                ) : (
                  'Confirm Activation'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default AdminCustomerList;
