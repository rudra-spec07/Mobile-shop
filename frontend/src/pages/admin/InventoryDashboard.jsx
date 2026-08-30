import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import PartStatusBadge from '../../components/parts/PartStatusBadge';
import partsService from '../../services/parts.service';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';

const InventoryDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [lowStockParts, setLowStockParts] = useState([]);
  const [outOfStockParts, setOutOfStockParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, lowRes, outRes] = await Promise.all([
        partsService.getInventorySummary(),
        partsService.getLowStock({ limit: 5 }),
        partsService.getOutOfStock({ limit: 5 }),
      ]);

      setSummary(summaryRes.data?.summary || { totalParts: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
      setLowStockParts(lowRes.data || []);
      setOutOfStockParts(outRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Inventory Dashboard">
      <div className="space-y-8">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Package className="w-4 h-4" /> Live Overview
            </div>
            <h1 className="text-xl font-bold text-slate-900">Inventory Overview & Restock Analytics</h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time component stock aggregation, threshold alerts, and critical shortage monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <Link to="/admin/parts">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> Parts Catalog
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-20">
            <Loader text="Aggregating live inventory summary metrics..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <ErrorState message={error} onRetry={fetchDashboardData} />
          </div>
        ) : (
          <>
            {/* Metric Overview Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Parts */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Registered Parts
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{summary?.totalParts || 0}</h3>
                  <span className="text-[11px] text-slate-400 mt-1 block">Active SKU catalog</span>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              {/* In Stock */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Healthy Stock SKUs
                  </span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{summary?.inStock || 0}</h3>
                  <span className="text-[11px] text-emerald-600/80 mt-1 block font-medium">Above alert threshold</span>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              {/* Low Stock Alert */}
              <Link
                to="/admin/inventory/low-stock"
                className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                    Low Stock Alerts
                  </span>
                  <h3 className="text-2xl font-black text-amber-600 mt-1">{summary?.lowStock || 0}</h3>
                  <span className="text-[11px] text-amber-600 mt-1 block font-medium group-hover:underline">
                    View report & restock →
                  </span>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </Link>

              {/* Out of Stock */}
              <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                    Out of Stock SKUs
                  </span>
                  <h3 className="text-2xl font-black text-rose-600 mt-1">{summary?.outOfStock || 0}</h3>
                  <span className="text-[11px] text-rose-600/80 mt-1 block font-medium">Immediate restock required</span>
                </div>
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200">
                  <XCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Tables Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Low Stock Overview Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-900 text-sm">Low Stock Items ({lowStockParts.length})</h3>
                  </div>
                  <Link
                    to="/admin/inventory/low-stock"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    View All Report <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {lowStockParts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No low stock alerts detected.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Part</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-center">Min. Stock</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {lowStockParts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5">
                              <span className="font-semibold text-slate-900 block line-clamp-1">{p.name}</span>
                              <span className="font-mono text-[10px] text-slate-400">{p.partNumber}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center font-bold text-amber-600 font-mono">
                              {p.quantity}
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono text-slate-500">
                              {p.minimumStock}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <Link
                                to={`/admin/parts/${p.id}`}
                                className="text-xs font-semibold text-blue-600 hover:underline"
                              >
                                Restock
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Out of Stock Overview Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-500" />
                    <h3 className="font-bold text-slate-900 text-sm">Out of Stock Items ({outOfStockParts.length})</h3>
                  </div>
                  <Link
                    to="/admin/parts"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    Manage Catalog <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {outOfStockParts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Zero out-of-stock items!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Part</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {outOfStockParts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5">
                              <span className="font-semibold text-slate-900 block line-clamp-1">{p.name}</span>
                              <span className="font-mono text-[10px] text-slate-400">{p.partNumber}</span>
                            </td>
                            <td className="px-3 py-2.5 font-medium text-slate-500">
                              {p.category?.name || 'Unassigned'}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <Link
                                to={`/admin/parts/${p.id}`}
                                className="text-xs font-semibold text-blue-600 hover:underline"
                              >
                                Stock In
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default InventoryDashboard;
