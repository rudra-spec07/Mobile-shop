import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import PartStatusBadge from '../../components/parts/PartStatusBadge';
import PartFormModal from '../../components/parts/PartFormModal';
import DeletePartModal from '../../components/parts/DeletePartModal';
import StockInModal from '../../components/inventory/StockInModal';
import StockOutModal from '../../components/inventory/StockOutModal';
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import partsService from '../../services/parts.service';
import {
  ArrowLeft,
  Wrench,
  Edit,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const AdminPartDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  useEffect(() => {
    fetchPartData();
  }, [id]);

  const fetchPartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await partsService.getPartById(id);
      const partObj = res.data?.part || res.data;
      setPart(partObj);
      fetchHistory(1);
    } catch (err) {
      setError(err.message || 'Failed to load admin part details');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const res = await partsService.getInventoryHistory(id, { page, limit: 5 });
      setHistory(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const priceFormatted = Number(part?.price || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <AdminLayout title="Admin Part Details">
      {part && (
        <>
          <PartFormModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            part={part}
            onSuccess={fetchPartData}
          />

          <DeletePartModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            part={part}
            onSuccess={() => navigate('/admin/parts')}
          />

          <StockInModal
            isOpen={isStockInOpen}
            onClose={() => setIsStockInOpen(false)}
            part={part}
            onSuccess={fetchPartData}
          />

          <StockOutModal
            isOpen={isStockOutOpen}
            onClose={() => setIsStockOutOpen(false)}
            part={part}
            onSuccess={fetchPartData}
          />

          <StockAdjustmentModal
            isOpen={isAdjustmentOpen}
            onClose={() => setIsAdjustmentOpen(false)}
            part={part}
            onSuccess={fetchPartData}
          />
        </>
      )}

      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <button
            onClick={() => navigate('/admin/parts')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Parts List</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16">
            <Loader text="Loading component audit details..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <ErrorState message={error} onRetry={fetchPartData} />
          </div>
        ) : !part ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <ErrorState message="Part details not found" onRetry={fetchPartData} />
          </div>
        ) : (
          <>
            {/* Header Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {part.imageUrl ? (
                      <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
                    ) : (
                      <Wrench className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-600 uppercase bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        PN: {part.partNumber}
                      </span>
                      <PartStatusBadge status={part.stockStatus} />
                      <PartStatusBadge status={part.status} type="record" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">{part.name}</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Category: {part.category?.name || 'Unassigned'}</p>
                  </div>
                </div>

                {/* Stock Control Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                    onClick={() => setIsStockInOpen(true)}
                  >
                    <ArrowDownLeft className="w-4 h-4" /> Stock In
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                    onClick={() => setIsStockOutOpen(true)}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Stock Out
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                    onClick={() => setIsAdjustmentOpen(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Adjust Stock
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    className="flex items-center gap-1.5"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" /> Status Toggle
                  </Button>
                </div>
              </div>

              {/* Stock Overview Widgets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Current Quantity
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{part.quantity} units</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Minimum Stock Alert
                  </span>
                  <span className="text-2xl font-bold text-slate-700 mt-1 block">{part.minimumStock} units</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Retail Price
                  </span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">₹{priceFormatted}</span>
                </div>
              </div>

              {/* Description */}
              {part.description && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Specifications & Notes</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80">
                    {part.description}
                  </p>
                </div>
              )}
            </div>

            {/* In-Page Audit History Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" /> Stock Movement Audit History
                </h3>
                <span className="text-xs text-slate-500 font-mono">Total Movements: {pagination.total}</span>
              </div>

              {historyLoading ? (
                <div className="py-8">
                  <Loader text="Fetching audit logs..." />
                </div>
              ) : history.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No inventory transaction logs for this part.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-center">Quantity Delta</th>
                        <th className="px-4 py-3 text-center">Previous → New</th>
                        <th className="px-4 py-3">Reason / Details</th>
                        <th className="px-4 py-3">Performed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {history.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                            {new Date(tx.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                tx.type === 'STOCK_IN'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : tx.type === 'STOCK_OUT'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold font-mono">
                            {tx.type === 'STOCK_IN' ? '+' : tx.type === 'STOCK_OUT' ? '-' : ''}
                            {tx.quantity}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600">
                            {tx.previousQuantity} → <span className="font-bold text-slate-900">{tx.newQuantity}</span>
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate">{tx.reason || 'N/A'}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{tx.performedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="pt-2">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => fetchHistory(page)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPartDetails;
