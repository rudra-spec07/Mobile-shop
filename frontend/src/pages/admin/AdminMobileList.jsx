import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import MobileStatusBadge from '../../components/catalog/MobileStatusBadge';
import MobileFormModal from '../../components/catalog/MobileFormModal';
import BrandManagerModal from '../../components/catalog/BrandManagerModal';
import MobileImageManagerModal from '../../components/catalog/MobileImageManagerModal';
import StatusChangeModal from '../../components/catalog/StatusChangeModal';
import { TableSkeleton } from '../../components/common/Skeleton';
import useDebounce from '../../hooks/useDebounce';
import catalogService from '../../services/catalog.service';
import { getImageUrl } from '../../utils/image';
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
  const queryClient = useQueryClient();

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Control States
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [mobileToEdit, setMobileToEdit] = useState(null);

  const [isBrandManagerOpen, setIsBrandManagerOpen] = useState(false);

  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [selectedMobileForImages, setSelectedMobileForImages] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedMobileForStatus, setSelectedMobileForStatus] = useState(null);

  // React Query: Admin Mobile List
  const adminMobileQueryParams = {
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm.trim() || undefined,
    status: statusFilter || undefined,
  };

  const {
    data: mobileRes,
    isLoading,
    error: mobileErr,
    refetch,
  } = useQuery({
    queryKey: ['adminMobiles', adminMobileQueryParams],
    queryFn: ({ signal }) => catalogService.getMobiles(adminMobileQueryParams, { signal }),
    staleTime: 1 * 60 * 1000,
  });

  const mobiles = mobileRes?.data || [];
  const pagination = mobileRes?.pagination || { page: 1, limit: 10, total: mobiles.length };
  const error = mobileErr ? (mobileErr.message || 'Failed to load mobile listings') : '';

  const handleToggleFeatured = async (mobile) => {
    try {
      await catalogService.updateMobileFeatured(mobile.id, !mobile.featured);
      queryClient.invalidateQueries({ queryKey: ['adminMobiles'] });
    } catch (err) {
      alert(err.message || 'Failed to update featured status');
    }
  };

  const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Mobile Phone Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage mobile catalog models, prices, stock statuses, images, and brand associations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBrandManagerOpen(true)}
              className="text-xs font-semibold rounded-xl"
            >
              <Tag className="w-4 h-4 mr-1 text-slate-500" />
              Brands Manager
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setMobileToEdit(null);
                setIsMobileFormOpen(true);
              }}
              className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Mobile
            </Button>
          </div>
        </div>

        {/* Filter & Control Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, model number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Sliders className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-44 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Listings Data Table */}
        <Card>
          <CardBody className="p-0 overflow-hidden">
            {isLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : error ? (
              <div className="p-8">
                <ErrorState title="Failed to Load Mobiles" description={error} onRetry={() => refetch()} />
              </div>
            ) : mobiles.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  title="No Mobiles Found"
                  description={
                    searchTerm || statusFilter
                      ? 'No smartphones match your search filters.'
                      : 'Get started by creating your first mobile listing.'
                  }
                  actionText={searchTerm || statusFilter ? 'Clear Filters' : 'Add Mobile'}
                  onAction={() => {
                    if (searchTerm || statusFilter) {
                      setSearchTerm('');
                      setStatusFilter('');
                      setCurrentPage(1);
                    } else {
                      setMobileToEdit(null);
                      setIsMobileFormOpen(true);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Mobile & Specs</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Regular Price</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {mobiles.map((m) => {
                      const rawPrimaryImg = m.images?.find((i) => i.isPrimary)?.imageUrl || m.images?.[0]?.imageUrl;
                      const primaryImg = getImageUrl(rawPrimaryImg);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Thumbnail & Title */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-0.5 flex-shrink-0 overflow-hidden">
                                {primaryImg ? (
                                  <img src={primaryImg} alt={m.name} loading="lazy" className="w-full h-full object-contain" />
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
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {formatCurrency(m.price)}
                          </td>

                          {/* Selling Price */}
                          <td className="py-3 px-4">
                            {m.sellingPrice !== null && m.sellingPrice !== undefined ? (
                              <span className="font-extrabold text-blue-600">{formatCurrency(m.sellingPrice)}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Featured Toggle Button */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleFeatured(m)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                m.featured
                                  ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                              }`}
                              title={m.featured ? 'Remove from Featured' : 'Mark as Featured'}
                            >
                              <Star className={`w-3.5 h-3.5 ${m.featured ? 'fill-current' : ''}`} />
                            </button>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            <MobileStatusBadge status={m.status} />
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/admin/mobiles/${m.id}`}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedMobileForImages(m);
                                  setIsImageManagerOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Manage Images"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setMobileToEdit(m);
                                  setIsMobileFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit Mobile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMobileForStatus(m);
                                  setIsStatusModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Change Status"
                              >
                                <Filter className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Pagination Bar */}
        {!isLoading && mobiles.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={pagination.total || 0}
              limit={pagination.limit || 10}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isMobileFormOpen && (
        <MobileFormModal
          isOpen={isMobileFormOpen}
          mobileToEdit={mobileToEdit}
          mobile={mobileToEdit}
          onClose={() => {
            setIsMobileFormOpen(false);
            setMobileToEdit(null);
          }}
          onSuccess={() => {
            setIsMobileFormOpen(false);
            setMobileToEdit(null);
            queryClient.invalidateQueries({ queryKey: ['adminMobiles'] });
          }}
        />
      )}

      {isBrandManagerOpen && (
        <BrandManagerModal
          isOpen={isBrandManagerOpen}
          onClose={() => setIsBrandManagerOpen(false)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['adminMobiles'] });
            queryClient.invalidateQueries({ queryKey: ['brands'] });
          }}
        />
      )}

      {isImageManagerOpen && selectedMobileForImages && (
        <MobileImageManagerModal
          isOpen={isImageManagerOpen}
          mobile={selectedMobileForImages}
          onClose={() => {
            setIsImageManagerOpen(false);
            setSelectedMobileForImages(null);
          }}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['adminMobiles'] });
          }}
        />
      )}

      {isStatusModalOpen && selectedMobileForStatus && (
        <StatusChangeModal
          isOpen={isStatusModalOpen}
          mobile={selectedMobileForStatus}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedMobileForStatus(null);
          }}
          onSuccess={() => {
            setIsStatusModalOpen(false);
            setSelectedMobileForStatus(null);
            queryClient.invalidateQueries({ queryKey: ['adminMobiles'] });
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminMobileList;
