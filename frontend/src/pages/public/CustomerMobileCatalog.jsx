import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import MobileCard from '../../components/catalog/MobileCard';
import Pagination from '../../components/common/Pagination';
import SortDropdown from '../../components/common/SortDropdown';
import FilterChips from '../../components/common/FilterChips';
import SearchEmptyState from '../../components/search/SearchEmptyState';
import SearchErrorState from '../../components/search/SearchErrorState';
import Loader from '../../components/common/Loader';
import catalogService from '../../services/catalog.service';
import { Search, Smartphone, Filter, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

const CustomerMobileCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State derived from URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedBrandId, setSelectedBrandId] = useState(searchParams.get('brandId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [ram, setRam] = useState(searchParams.get('ram') || '');
  const [storage, setStorage] = useState(searchParams.get('storage') || '');
  const [operatingSystem, setOperatingSystem] = useState(searchParams.get('operatingSystem') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data & Metadata State
  const [mobiles, setMobiles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filterMetadata, setFilterMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state with URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedBrandId(searchParams.get('brandId') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setRam(searchParams.get('ram') || '');
    setStorage(searchParams.get('storage') || '');
    setOperatingSystem(searchParams.get('operatingSystem') || '');
    setSort(searchParams.get('sort') || 'newest');
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Load filter metadata & brands
  const fetchMetadata = async () => {
    try {
      const [brandRes, filterRes] = await Promise.all([
        catalogService.getBrands({ limit: 100 }),
        catalogService.getCatalogFilters(),
      ]);
      setBrands(brandRes.data || []);
      if (filterRes.data?.success) {
        setFilterMetadata(filterRes.data.data?.mobiles || null);
      }
    } catch (err) {
      console.error('Failed to fetch catalog metadata:', err);
    }
  };

  // Fetch Mobiles
  const fetchMobiles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedBrandId) params.brandId = selectedBrandId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (ram) params.ram = ram;
      if (storage) params.storage = storage;
      if (operatingSystem) params.operatingSystem = operatingSystem;

      const res = await catalogService.getMobiles(params);
      setMobiles(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 12, total: res.data?.length || 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Unable to load mobile catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchMobiles();
  }, [searchTerm, selectedBrandId, minPrice, maxPrice, ram, storage, operatingSystem, sort, currentPage]);

  const updateQueryParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
    });
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParams({ search: searchTerm, page: 1 });
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedBrandId('');
    setMinPrice('');
    setMaxPrice('');
    setRam('');
    setStorage('');
    setOperatingSystem('');
    setSort('newest');
    setSearchParams({});
  };

  const handleRemoveChip = (key) => {
    if (key === 'search') setSearchTerm('');
    if (key === 'brandId') setSelectedBrandId('');
    if (key === 'priceRange') {
      setMinPrice('');
      setMaxPrice('');
    }
    if (key === 'ram') setRam('');
    if (key === 'storage') setStorage('');
    if (key === 'operatingSystem') setOperatingSystem('');

    const updated = new URLSearchParams(searchParams);
    if (key === 'priceRange') {
      updated.delete('minPrice');
      updated.delete('maxPrice');
    } else {
      updated.delete(key);
    }
    updated.set('page', '1');
    setSearchParams(updated);
  };

  // Construct active filter chips
  const activeChips = [];
  if (searchTerm) activeChips.push({ key: 'search', label: 'Search', value: searchTerm });
  if (selectedBrandId) {
    const bName = brands.find((b) => b.id === selectedBrandId)?.name || 'Brand';
    activeChips.push({ key: 'brandId', label: 'Brand', value: bName });
  }
  if (minPrice || maxPrice) {
    activeChips.push({ key: 'priceRange', label: 'Price', value: `₹${minPrice || 0} - ₹${maxPrice || 'Any'}` });
  }
  if (ram) activeChips.push({ key: 'ram', label: 'RAM', value: ram });
  if (storage) activeChips.push({ key: 'storage', label: 'Storage', value: storage });
  if (operatingSystem) activeChips.push({ key: 'operatingSystem', label: 'OS', value: operatingSystem });

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Mobile Catalogue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Explore Mobile Models</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Search genuine smartphones, compare specs, filter by brand, price, RAM & storage.
            </p>
          </div>
        </div>

        {/* Top Control Bar (Search, Mobile Filter Drawer Toggle, Sort) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by model, brand, processor, RAM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Action Row: Mobile Drawer Button + Sort Dropdown */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Filters {activeChips.length > 0 && `(${activeChips.length})`}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500 hidden sm:inline">Sort By:</span>
              <SortDropdown
                value={sort}
                onChange={(newSort) => updateQueryParams({ sort: newSort, page: 1 })}
              />
            </div>
          </div>

          {/* Filter Chips Bar */}
          <FilterChips chips={activeChips} onRemoveChip={handleRemoveChip} onClearAll={handleClearAllFilters} />
        </div>

        {/* Main Content Layout: Desktop Sidebar + Results Grid */}
        <div className="flex gap-6 items-start">
          {/* Desktop Persistent Sidebar */}
          <aside className="hidden lg:block w-64 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 shrink-0 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-blue-600" /> Catalog Filters
              </h3>
              {activeChips.length > 0 && (
                <button onClick={handleClearAllFilters} className="text-[11px] text-red-600 font-semibold hover:underline">
                  Reset
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Brand</label>
              <select
                value={selectedBrandId}
                onChange={(e) => updateQueryParams({ brandId: e.target.value, page: 1 })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={() => updateQueryParams({ minPrice, page: 1 })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={() => updateQueryParams({ maxPrice, page: 1 })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* RAM Filter */}
            {filterMetadata?.rams?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">RAM</label>
                <select
                  value={ram}
                  onChange={(e) => updateQueryParams({ ram: e.target.value, page: 1 })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">All RAM Options</option>
                  {filterMetadata.rams.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Storage Filter */}
            {filterMetadata?.storages?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Storage</label>
                <select
                  value={storage}
                  onChange={(e) => updateQueryParams({ storage: e.target.value, page: 1 })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">All Storage Options</option>
                  {filterMetadata.storages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* OS Filter */}
            {filterMetadata?.operatingSystems?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Operating System</label>
                <select
                  value={operatingSystem}
                  onChange={(e) => updateQueryParams({ operatingSystem: e.target.value, page: 1 })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">All OS Options</option>
                  {filterMetadata.operatingSystems.map((os) => (
                    <option key={os} value={os}>
                      {os}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </aside>

          {/* Results Area */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="py-16">
                <Loader text="Searching mobile catalog..." />
              </div>
            ) : error ? (
              <SearchErrorState message={error} onRetry={() => fetchMobiles()} />
            ) : mobiles.length === 0 ? (
              <SearchEmptyState onClearFilters={handleClearAllFilters} />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {mobiles.map((mobile) => (
                    <MobileCard key={mobile.id} mobile={mobile} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages || 1}
                    totalResults={pagination.total || 0}
                    limit={12}
                    onPageChange={(p) => updateQueryParams({ page: p })}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile/Tablet Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="ml-auto w-80 max-w-full bg-white h-full shadow-2xl p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-blue-600" /> Filter Mobiles
              </h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Brand</label>
              <select
                value={selectedBrandId}
                onChange={(e) => {
                  updateQueryParams({ brandId: e.target.value, page: 1 });
                  setIsMobileFilterOpen(false);
                }}
                className="w-full px-3 py-2 text-xs border rounded-lg"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t flex gap-2">
              <button
                onClick={() => {
                  updateQueryParams({ minPrice, maxPrice, page: 1 });
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-xs"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  handleClearAllFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 border rounded-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerMobileCatalog;
