import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Card, { CardBody } from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { getAuditLogs } from '../../services/audit.service';
import { ShieldCheck, Eye, Clock, User, Activity } from 'lucide-react';

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async (page = 1, action = actionFilter, entityType = entityTypeFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getAuditLogs({
        page,
        limit: 15,
        action: action || undefined,
        entityType: entityType || undefined,
      });

      const logData = res.data?.logs || res.logs || [];
      const pagData = res.data?.pagination || res.pagination || { page, limit: 15, total: logData.length, totalPages: 1 };

      setLogs(logData);
      setPagination(pagData);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Unable to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, actionFilter, entityTypeFilter);
  }, [currentPage, actionFilter, entityTypeFilter]);

  const handleActionFilterChange = (e) => {
    setActionFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleEntityFilterChange = (e) => {
    setEntityTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const breadcrumbs = [
    { label: 'Admin Dashboard', path: '/admin' },
    { label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
              System Activity & Audit Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Read-only immutable log of administrative activities and system state transitions.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardBody className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Filter by Action</label>
                <select
                  value={actionFilter}
                  onChange={handleActionFilterChange}
                  className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="USER_STATUS_CHANGE">User Status Change</option>
                  <option value="MOBILE_UPDATE">Mobile Update</option>
                  <option value="MOBILE_STATUS_CHANGE">Mobile Status Change</option>
                  <option value="STOCK_IN">Stock In</option>
                  <option value="STOCK_OUT">Stock Out</option>
                  <option value="STOCK_ADJUSTMENT">Stock Adjustment</option>
                  <option value="REQUEST_STATUS_CHANGE">Request Status Change</option>
                  <option value="CANCELLATION_REJECTED">Cancellation Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Filter by Entity Type</label>
                <select
                  value={entityTypeFilter}
                  onChange={handleEntityFilterChange}
                  className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Entity Types</option>
                  <option value="User">User</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Part">Part</option>
                  <option value="ServiceRequest">Service Request</option>
                  <option value="Enquiry">Enquiry</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Audit Logs Table */}
        {isLoading ? (
          <Loader text="Loading audit records..." />
        ) : error ? (
          <ErrorState title="Error Loading Audit Logs" description={error} onRetry={() => fetchLogs(currentPage)} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Audit Logs Found"
            description="There are no audit logs recorded matching your filter parameters."
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Performed By</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        <span className="font-medium text-slate-800">{log.entityType || 'System'}</span>
                        {log.entityId && (
                          <span className="text-slate-400 ml-1 font-mono text-[10px]">
                            ({log.entityId.slice(0, 8)}...)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {log.userId ? log.userId.slice(0, 8) + '...' : 'SYSTEM'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View State
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </Card>
        )}

        {/* Audit Record Detail Modal */}
        {selectedLog && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Audit Entry: ${selectedLog.action}`}
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Log ID:</span>
                  <p className="font-mono font-medium text-slate-800">{selectedLog.id}</p>
                </div>
                <div>
                  <span className="text-slate-500">Timestamp:</span>
                  <p className="font-medium text-slate-800">{formatDateTime(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Entity Type:</span>
                  <p className="font-medium text-slate-800">{selectedLog.entityType || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Entity ID:</span>
                  <p className="font-mono font-medium text-slate-800">{selectedLog.entityId || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.oldValue && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1">Previous State (Old Value):</h4>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-[11px]">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1">Updated State (New Value):</h4>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-[11px]">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
