import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PartCard from '../../components/parts/PartCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import partsService from '../../services/parts.service';
import { Wrench, Search, Filter, RefreshCw } from 'lucide-react';

const CustomerPartsCatalog = () => {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchParts(1);
  }, [searchQuery, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await partsService.getPartCategories({ limit: 100 });
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchParts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 12,
        search: searchQuery.trim() || undefined,
        categoryId: selectedCategory || undefined,
      };
      const res = await partsService.getParts(params);
      setParts(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load spare parts catalog');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchParts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full mb-3">
              <Wrench className="w-3.5 h-3.5" /> Authentic Mobile Spare Parts
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Genuine Replacement Components & Spare Parts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              Browse original mobile screens, battery packs, camera modules, charging flex cables, and housing components with verified availability.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search part name, PN..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="w-44">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border-slate-200 text-xs"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            {(searchQuery || selectedCategory) && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium transition-colors"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-20">
            <Loader text="Loading spare parts catalog..." />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchParts(pagination.page)} />
        ) : parts.length === 0 ? (
          <EmptyState
            title="No Spare Parts Found"
            message={
              searchQuery || selectedCategory
                ? 'No components matched your search parameters. Try adjusting filters.'
                : 'No parts are currently available in the active catalog.'
            }
          />
        ) : (
          <>
            {/* Parts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {parts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerPartsCatalog;
