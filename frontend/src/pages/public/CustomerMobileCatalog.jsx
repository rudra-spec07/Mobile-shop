import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import MobileCard from '../../components/catalog/MobileCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Loader from '../../components/common/Loader';
import catalogService from '../../services/catalog.service';
import { Search, Smartphone, Filter, RefreshCw } from 'lucide-react';

const CustomerMobileCatalog = () => {
  const [mobiles, setMobiles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });

  const fetchBrands = async () => {
    try {
      const res = await catalogService.getBrands({ limit: 100 });
      setBrands(res.data || []);
    } catch (err) {
      console.error('Failed to fetch catalog brands:', err);
    }
  };

  const fetchMobiles = async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 12,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedBrandId) params.brandId = selectedBrandId;

      const res = await catalogService.getMobiles(params);
      setMobiles(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 12, total: res.data?.length || 0 });
    } catch (err) {
      setError(err.message || 'Unable to load mobile catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchMobiles(currentPage);
  }, [currentPage, selectedBrandId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMobiles(1);
  };

  const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 12));

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Catalog Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Mobile Catalogue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Explore Mobile Models
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Browse genuine smartphone models, check specifications, prices, and availability.
            </p>
          </div>
        </div>

        {/* Search & Brand Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by mobile model, brand, or specs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              Search Catalog
            </button>
          </form>

          {/* Brand Filter Pills */}
          {brands.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 flex-shrink-0">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <button
                onClick={() => {
                  setSelectedBrandId('');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                  selectedBrandId === ''
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBrandId(b.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                    selectedBrandId === b.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-16">
            <Loader text="Loading mobile catalog..." />
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
            title="No Mobiles Found"
            description="We couldn't find any mobile models matching your criteria."
            actionLabel="Reset Search & Filters"
            onAction={() => {
              setSearchTerm('');
              setSelectedBrandId('');
              setCurrentPage(1);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Grid Layout: 1 card mobile, 2 tablet, 3-4 desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {mobiles.map((mobile) => (
                <MobileCard key={mobile.id} mobile={mobile} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="bg-white rounded-xl border border-slate-200 p-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerMobileCatalog;
