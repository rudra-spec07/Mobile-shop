import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import PartStatusBadge from '../../components/parts/PartStatusBadge';
import PartFormModal from '../../components/parts/PartFormModal';
import DeletePartModal from '../../components/parts/DeletePartModal';
import CategoryManagerModal from '../../components/parts/CategoryManagerModal';
import StockInModal from '../../components/inventory/StockInModal';
import StockOutModal from '../../components/inventory/StockOutModal';
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal';
import StockHistoryModal from '../../components/inventory/StockHistoryModal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import partsService from '../../services/parts.service';
import {
  Wrench,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  Eye,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';

const AdminPartsList = () => {
  const navigate = useNavigate();

  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Modals state
  const [selectedPart, setSelectedPart] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchParts(1);
  }, [searchQuery, selectedCategory, selectedStatus, selectedStockStatus]);

  const fetchCategories = async () => {
    try {
      const res = await partsService.getPartCategories({ status: 'ACTIVE', limit: 100 });
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchParts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 10,
        search: searchQuery.trim() || undefined,
        categoryId: selectedCategory || undefined,
        status: selectedStatus || undefined,
        stockStatus: selectedStockStatus || undefined,
      };
      const res = await partsService.getParts(params);
      setParts(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load spare parts list');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchParts(newPage);
  };

  const handleOpenAdd = () => {
    setSelectedPart(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (part) => {
    setSelectedPart(part);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (part) => {
    setSelectedPart(part);
    setIsDeleteModalOpen(true);
  };

  const handleOpenStockIn = (part) => {
    setSelectedPart(part);
    setIsStockInOpen(true);
  };

  const handleOpenStockOut = (part) => {
    setSelectedPart(part);
    setIsStockOutOpen(true);
  };

  const handleOpenAdjustment = (part) => {
    setSelectedPart(part);
    setIsAdjustmentOpen(true);
  };

  const handleOpenHistory = (part) => {
    setSelectedPart(part);
    setIsHistoryOpen(true);
  };

  return (
    <AdminLayout title="Spare Parts & Inventory Management">
      {/* Modals */}
      <PartFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        part={selectedPart}
        onCategoryCreated={() => fetchCategories()}
        onSuccess={() => {
          fetchParts(pagination.page);
          fetchCategories();
        }}
      />

      <DeletePartModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        part={selectedPart}
        onSuccess={() => fetchParts(pagination.page)}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoryChange={() => {
          fetchCategories();
          fetchParts(pagination.page);
        }}
      />

      {selectedPart && (
        <>
          <StockInModal
            isOpen={isStockInOpen}
            onClose={() => setIsStockInOpen(false)}
            part={selectedPart}
            onSuccess={() => fetchParts(pagination.page)}
          />

          <StockOutModal
            isOpen={isStockOutOpen}
            onClose={() => setIsStockOutOpen(false)}
            part={selectedPart}
            onSuccess={() => fetchParts(pagination.page)}
          />

          <StockAdjustmentModal
            isOpen={isAdjustmentOpen}
            onClose={() => setIsAdjustmentOpen(false)}
            part={selectedPart}
            onSuccess={() => fetchParts(pagination.page)}
          />

          <StockHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            part={selectedPart}
          />
        </>
      )}

      {/* Action Header & Quick Links Bar */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Wrench className="w-4 h-4" /> Parts Management
            </div>
            <h1 className="text-xl font-bold text-slate-900">Inventory Catalog & Stock Control</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage component specs, execute stock operations, and review real-time audit movement logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100"
              onClick={() => setIsCategoryManagerOpen(true)}
            >
              <FolderPlus className="w-4 h-4 text-blue-600" /> Categories
            </Button>

            <Link to="/admin/inventory">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Package className="w-4 h-4" /> Dashboard
              </Button>
            </Link>

            <Link to="/admin/inventory/low-stock">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-amber-700 border-amber-300 bg-amber-50/50 hover:bg-amber-100/50">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock
              </Button>
            </Link>

            <Button variant="primary" size="sm" className="flex items-center gap-1.5" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4" /> Add New Part
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-end justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search part name, part number..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3 w-full md:w-auto justify-end">
            <div className="w-44">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                placeholder={categories.length === 0 ? 'No categories available' : 'All Categories'}
                className="text-xs"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-40">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Stock Status</label>
              <Select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                placeholder="All Stock Statuses"
                className="text-xs"
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </Select>
            </div>

            <div className="w-36">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Part Status</label>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                placeholder="All Statuses"
                className="text-xs"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>

            {(searchQuery || selectedCategory || selectedStatus || selectedStockStatus) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedStatus('');
                  setSelectedStockStatus('');
                }}
                className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-xl text-xs"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Data Table Body */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16">
            <Loader text="Loading inventory parts..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <ErrorState message={error} onRetry={() => fetchParts(pagination.page)} />
          </div>
        ) : parts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <EmptyState
              title="No Spare Parts Found"
              message="No inventory records matched your filters. Click 'Add New Part' to register components."
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
                    <th className="px-5 py-3.5 text-right">Price</th>
                    <th className="px-5 py-3.5 text-center">Current Stock</th>
                    <th className="px-5 py-3.5 text-center">Min. Stock</th>
                    <th className="px-5 py-3.5 text-center">Stock Status</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {parts.map((p) => {
                    const priceFormatted = Number(p.price || 0).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    });

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Part Name & Thumbnail */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Wrench className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/admin/parts/${p.id}`}
                                className="font-semibold text-slate-900 hover:text-blue-600 line-clamp-1"
                              >
                                {p.name}
                              </Link>
                              {p.description && (
                                <span className="text-[11px] text-slate-500 line-clamp-1">{p.description}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Part Number */}
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-600">
                          {p.partNumber}
                        </td>

                        {/* Category */}
                        <td className="px-5 py-3.5 font-medium text-slate-600">
                          {p.category?.name || 'Unassigned'}
                        </td>

                        {/* Price */}
                        <td className="px-5 py-3.5 text-right font-bold text-slate-900 font-mono">
                          ₹{priceFormatted}
                        </td>

                        {/* Quantity */}
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                              p.quantity === 0
                                ? 'bg-rose-100 text-rose-800'
                                : p.quantity <= p.minimumStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            {p.quantity} units
                          </span>
                        </td>

                        {/* Minimum Stock */}
                        <td className="px-5 py-3.5 text-center font-mono text-slate-500">
                          {p.minimumStock}
                        </td>

                        {/* Stock Status Badge */}
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <PartStatusBadge status={p.stockStatus} />
                        </td>

                        {/* Record Status Badge */}
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <PartStatusBadge status={p.status} type="record" />
                        </td>

                        {/* Action Buttons */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Stock In */}
                            <button
                              onClick={() => handleOpenStockIn(p)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Stock In"
                            >
                              <ArrowDownLeft className="w-4 h-4" />
                            </button>

                            {/* Stock Out */}
                            <button
                              onClick={() => handleOpenStockOut(p)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Stock Out"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>

                            {/* Adjustment */}
                            <button
                              onClick={() => handleOpenAdjustment(p)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Stock Adjustment"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>

                            {/* History */}
                            <button
                              onClick={() => handleOpenHistory(p)}
                              className="p-1.5 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Audit History"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* View Details */}
                            <Link
                              to={`/admin/parts/${p.id}`}
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              title="View Admin Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Delete/Status Toggle */}
                            <button
                              onClick={() => handleOpenDelete(p)}
                              className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Status Toggle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
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

export default AdminPartsList;
