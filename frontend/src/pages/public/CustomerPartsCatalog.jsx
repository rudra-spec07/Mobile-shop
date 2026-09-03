import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import PartCard from '../../components/parts/PartCard';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import SortDropdown from '../../components/common/SortDropdown';
import FilterChips from '../../components/common/FilterChips';
import SearchEmptyState from '../../components/search/SearchEmptyState';
import SearchErrorState from '../../components/search/SearchErrorState';
import partsService from '../../services/parts.service';
import { Wrench, Search, Filter, SlidersHorizontal, X } from 'lucide-react';

const CustomerPartsCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [stockStatus, setStockStatus] = useState(searchParams.get('stockStatus') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data & Control State
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('categoryId') || '');
    setStockStatus(searchParams.get('stockStatus') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'newest');
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await partsService.getPartCategories({ status: 'ACTIVE', limit: 100 });
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load active part categories:', err);
    }
  };

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: 12,
        sort,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (stockStatus) params.stockStatus = stockStatus;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await partsService.getParts(params);
      setParts(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 12, total: res.data?.length || 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load spare parts catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchParts();
  }, [searchTerm, selectedCategory, stockStatus, minPrice, maxPrice, sort, currentPage]);

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
    setSelectedCategory('');
    setStockStatus('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
  };

  const handleRemoveChip = (key) => {
    if (key === 'search') setSearchTerm('');
    if (key === 'categoryId') setSelectedCategory('');
    if (key === 'stockStatus') setStockStatus('');
    if (key === 'priceRange') {
      setMinPrice('');
      setMaxPrice('');
    }

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
  if (selectedCategory) {
    const cName = categories.find((c) => c.id === selectedCategory)?.name || 'Category';
    activeChips.push({ key: 'categoryId', label: 'Category', value: cName });
  }
  if (stockStatus) {
    const statusLabels = { IN_STOCK: 'In Stock', LOW_STOCK: 'Low Stock', OUT_OF_STOCK: 'Out of Stock' };
    activeChips.push({ key: 'stockStatus', label: 'Stock', value: statusLabels[stockStatus] || stockStatus });
  }
  if (minPrice || maxPrice) {
    activeChips.push({ key: 'priceRange', label: 'Price', value: `₹${minPrice || 0} - ₹${maxPrice || 'Any'}` });
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
    { value: 'quantity_desc', label: 'Quantity: High to Low' },
  ];

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Hero Banner */}
        <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden border-b border-slate-800">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full mb-2">
                <Wrench className="w-3.5 h-3.5" /> Authentic Mobile Spare Parts
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Genuine Replacement Components & Spare Parts
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xl">
                Search original screens, battery assemblies, flex cables, and housing units.
              </p>
            </div>
          </div>
        </section>

        {/* Search & Control Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search part name, part number, description..."
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

          {/* Controls Row */}
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
                options={sortOptions}
              />
            </div>
          </div>

          <FilterChips chips={activeChips} onRemoveChip={handleRemoveChip} onClearAll={handleClearAllFilters} />
        </div>

        {/* Content Layout: Sidebar + Grid */}
        <div className="flex gap-6 items-start">
          {/* Desktop Persistent Sidebar */}
          <aside className="hidden lg:block w-64 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 shrink-0 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-blue-600" /> Part Filters
              </h3>
              {activeChips.length > 0 && (
                <button onClick={handleClearAllFilters} className="text-[11px] text-red-600 font-semibold hover:underline">
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => updateQueryParams({ categoryId: e.target.value, page: 1 })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Stock Availability</label>
              <select
                value={stockStatus}
                onChange={(e) => updateQueryParams({ stockStatus: e.target.value, page: 1 })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="">All Stock Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
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
          </aside>

          {/* Results Grid */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="py-20">
                <Loader text="Loading spare parts catalog..." />
              </div>
            ) : error ? (
              <SearchErrorState message={error} onRetry={() => fetchParts()} />
            ) : parts.length === 0 ? (
              <SearchEmptyState onClearFilters={handleClearAllFilters} />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {parts.map((part) => (
                    <PartCard key={part.id} part={part} />
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

      {/* Mobile Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="ml-auto w-80 max-w-full bg-white h-full shadow-2xl p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-blue-600" /> Filter Spare Parts
              </h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  updateQueryParams({ categoryId: e.target.value, page: 1 });
                  setIsMobileFilterOpen(false);
                }}
                className="w-full px-3 py-2 text-xs border rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Stock Availability</label>
              <select
                value={stockStatus}
                onChange={(e) => {
                  updateQueryParams({ stockStatus: e.target.value, page: 1 });
                  setIsMobileFilterOpen(false);
                }}
                className="w-full px-3 py-2 text-xs border rounded-lg"
              >
                <option value="">All Stock Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
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

            {/* Actions */}
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

export default CustomerPartsCatalog;
