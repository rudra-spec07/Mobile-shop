import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import Pagination from '../common/Pagination';
import partsService from '../../services/parts.service';
import { History, ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from 'lucide-react';

const StockHistoryModal = ({ isOpen, onClose, part }) => {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && part?.id) {
      fetchHistory(1);
    }
  }, [isOpen, part?.id]);

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await partsService.getInventoryHistory(part.id, { page, limit: 5 });
      setHistory(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load inventory history');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchHistory(newPage);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'STOCK_IN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> Stock In
          </span>
        );
      case 'STOCK_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" /> Stock Out
          </span>
        );
      case 'ADJUSTMENT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> Adjustment
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inventory History: ${part?.partNumber || ''}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Part Header Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-900">{part?.name}</span>
            <span className="text-slate-500 font-mono block">PN: {part?.partNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Current Stock</span>
            <span className="font-bold text-slate-900 text-sm">{part?.quantity} units</span>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-12">
            <Loader text="Loading audit log history..." />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchHistory(pagination.page)} />
        ) : history.length === 0 ? (
          <EmptyState title="No Inventory History" message="No stock movements have been recorded for this part yet." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-center">Amount</th>
                  <th className="px-4 py-3 text-center">Previous → New</th>
                  <th className="px-4 py-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getTypeBadge(tx.type)}</td>
                    <td className="px-4 py-3 text-center font-bold font-mono">
                      {tx.type === 'STOCK_IN' ? '+' : tx.type === 'STOCK_OUT' ? '-' : ''}
                      {tx.quantity}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap font-mono text-slate-600">
                      <span>{tx.previousQuantity}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-bold text-slate-900">{tx.newQuantity}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-600 truncate" title={tx.reason || 'N/A'}>
                      {tx.reason || 'No reason specified'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && history.length > 0 && pagination.totalPages > 1 && (
          <div className="pt-2">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StockHistoryModal;
