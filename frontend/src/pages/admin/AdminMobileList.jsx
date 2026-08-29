import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Loader from '../../components/common/Loader';
import MobileStatusBadge from '../../components/catalog/MobileStatusBadge';
import MobileFormModal from '../../components/catalog/MobileFormModal';
import BrandManagerModal from '../../components/catalog/BrandManagerModal';
import MobileImageManagerModal from '../../components/catalog/MobileImageManagerModal';
import StatusChangeModal from '../../components/catalog/StatusChangeModal';
import catalogService from '../../services/catalog.service';
import {
  Smartphone,
  Plus,
  Tag,
  Search,
  Filter,
  Edit2,
  Image as ImageIcon,
  Sliders,
  Star,
  Eye,
} from 'lucide-react';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const AdminMobileList = () => {
  const [mobiles, setMobiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Modal Control States
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [mobileToEdit, setMobileToEdit] = useState(null);

  const [isBrandManagerOpen, setIsBrandManagerOpen] = useState(false);

  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [selectedMobileForImages, setSelectedMobileForImages] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedMobileForStatus, setSelectedMobileForStatus] = useState(null);

  const fetchMobiles = async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await catalogService.getMobiles(params);
      setMobiles(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: res.data?.length || 0 });
    } catch (err) {
      setError(err.message || 'Failed to load mobile listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMobiles(currentPage);
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMobiles(1);
  };

  const handleToggleFeatured = async (mobile) => {
    try {
      await catalogService.updateMobileFeatured(mobile.id, !mobile.featured);
      fetchMobiles(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to update featured status');
    }
  };

  const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mobile Catalog Management</h1>
            <p className="text-xs text-slate-500">Manage smartphone models, pricing, specifications, and image galleries</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBrandManagerOpen(true)}
              className="bg-slate-50"
            >
              <Tag className="w-4 h-4 mr-1 text-slate-600" />
              Manage Brands
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setMobileToEdit(null);
                setIsMobileFormOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Mobile
            </Button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <Card>
          <CardBody className="p-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by model name, model number, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE Only</option>
                  <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                  <option value="INACTIVE">INACTIVE Only</option>
                </select>

                <Button variant="primary" size="sm" type="submit">
                  Search
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16">
            <Loader text="Loading mobile catalog database..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to Load Mobiles"
            description={error}
            onRetry={() => fetchMobiles(currentPage)}
          />
        ) : mobiles.length === 0 ? (
          <EmptyState
            icon={Smartphone}
            title="No Mobile Listings Found"
            description="Start building your catalog by adding your first smartphone model."
            actionLabel="+ Add First Mobile"
            onAction={() => {
              setMobileToEdit(null);
              setIsMobileFormOpen(true);
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Mobile & Model</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Regular Price</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4 text-center">Featured</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {mobiles.map((m) => {
                    const primaryImg = m.images?.find((i) => i.isPrimary)?.imageUrl || m.images?.[0]?.imageUrl;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-0.5 flex-shrink-0 overflow-hidden">
                              {primaryImg ? (
                                <img src={primaryImg} alt={m.name} className="w-full h-full object-contain" />
                              ) : (
                                <Smartphone className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{m.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {m.modelNumber ? `Model: ${m.modelNumber}` : `Specs: ${m.ram || '-'} / ${m.storage || '-'}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {m.brand?.name || '-'}
                        </td>

                        {/* Regular Price */}
                        <td className="py-3 px-4 font-medium text-slate-500">
                          {formatCurrency(m.price)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(m.sellingPrice)}
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(m)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              m.featured
                                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                : 'text-slate-300 hover:text-amber-400 hover:bg-slate-100'
                            }`}
                            title={m.featured ? 'Unfeature Mobile' : 'Mark as Featured'}
                          >
                            <Star className={`w-4 h-4 ${m.featured ? 'fill-current' : ''}`} />
                          </button>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <MobileStatusBadge status={m.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Details */}
                            <Link to={`/admin/mobiles/${m.id}`}>
                              <button
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Admin Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>

                            {/* Edit Mobile */}
                            <button
                              onClick={() => {
                                setMobileToEdit(m);
                                setIsMobileFormOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Mobile Specifications"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Image Manager */}
                            <button
                              onClick={() => {
                                setSelectedMobileForImages(m);
                                setIsImageManagerOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Manage Images"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>

                            {/* Status Change */}
                            <button
                              onClick={() => {
                                setSelectedMobileForStatus(m);
                                setIsStatusModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Change Status"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-slate-100 px-3 py-1">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Shared Modals */}
      <MobileFormModal
        isOpen={isMobileFormOpen}
        onClose={() => setIsMobileFormOpen(false)}
        mobileToEdit={mobileToEdit}
        onSaved={() => fetchMobiles(currentPage)}
      />

      <BrandManagerModal
        isOpen={isBrandManagerOpen}
        onClose={() => setIsBrandManagerOpen(false)}
        onBrandsUpdated={() => fetchMobiles(currentPage)}
      />

      <MobileImageManagerModal
        isOpen={isImageManagerOpen}
        onClose={() => setIsImageManagerOpen(false)}
        mobile={selectedMobileForImages}
        onImagesUpdated={() => fetchMobiles(currentPage)}
      />

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        mobile={selectedMobileForStatus}
        onStatusUpdated={() => fetchMobiles(currentPage)}
      />
    </AdminLayout>
  );
};

export default AdminMobileList;
