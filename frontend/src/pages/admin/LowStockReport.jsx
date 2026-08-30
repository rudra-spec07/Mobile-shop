import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import PartStatusBadge from '../../components/parts/PartStatusBadge';
import StockInModal from '../../components/inventory/StockInModal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import partsService from '../../services/parts.service';
import { AlertTriangle, ArrowDownLeft, ArrowLeft, Wrench } from 'lucide-react';

const LowStockReport = () => {
  const navigate = useNavigate();

  const [parts, setParts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPart, setSelectedPart] = useState(null);
  const [isStockInOpen, setIsStockInOpen] = useState(false);

  useEffect(() => {
    fetchLowStock(1);
  }, []);

  const fetchLowStock = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await partsService.getLowStock({ page, limit: 10 });
      setParts(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load low stock alerts report');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchLowStock(newPage);
  };

  const handleOpenStockIn = (part) => {
    setSelectedPart(part);
    setIsStockInOpen(true);
  };

  return (
    <AdminLayout title="Low Stock Alerts Report">
      {selectedPart && (
        <StockInModal
          isOpen={isStockInOpen}
          onClose={() => setIsStockInOpen(false)}
          part={selectedPart}
          onSuccess={() => fetchLowStock(pagination.page)}
        />
      )}

      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <button
            onClick={() => navigate('/admin/inventory')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory Dashboard</span>
          </button>
        </div>

        {/* Banner */}
        <div className="bg-amber-500/10 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-amber-950">Low Stock Warning Report</h1>
              <p className="text-xs text-amber-800 mt-0.5">
                Listing components where current stock level has fallen at or below the designated Minimum Stock Alert Threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Data Table Body */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16">
            <Loader text="Analyzing component thresholds..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <ErrorState message={error} onRetry={() => fetchLowStock(pagination.page)} />
          </div>
        ) : parts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <EmptyState
              title="Zero Low Stock Alerts!"
              message="All active inventory parts are currently above their minimum stock alert thresholds."
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Component</th>
                    <th className="px-5 py-3.5">Part Number</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5 text-center">Current Stock</th>
                    <th className="px-5 py-3.5 text-center">Min. Threshold</th>
                    <th className="px-5 py-3.5 text-center">Stock Deficit</th>
                    <th className="px-5 py-3.5 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {parts.map((p) => {
                    const deficit = Math.max(0, p.minimumStock - p.quantity);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          <Link to={`/admin/parts/${p.id}`} className="hover:text-blue-600 line-clamp-1">
                            {p.name}
                          </Link>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-600">
                          {p.partNumber}
                        </td>

                        <td className="px-5 py-3.5 font-medium text-slate-600">
                          {p.category?.name || 'Unassigned'}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-amber-100 text-amber-800">
                            {p.quantity} units
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono text-slate-500">
                          {p.minimumStock}
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono text-xs font-bold text-rose-600">
                          -{deficit} units
                        </td>

                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <Button
                            variant="primary"
                            size="sm"
                            className="inline-flex items-center gap-1 text-xs py-1 px-3"
                            onClick={() => handleOpenStockIn(p)}
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Stock In
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default LowStockReport;
