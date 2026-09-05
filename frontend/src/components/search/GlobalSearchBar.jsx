import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Smartphone, Wrench, Shield, Tag, X, Loader2 } from 'lucide-react';
import catalogService from '../../services/catalog.service';

const GlobalSearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search trigger
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await catalogService.globalSearch(trimmed, 4);
        if (response.data?.success) {
          setResults(response.data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/mobiles?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const hasResults =
    results &&
    (results.mobiles?.length > 0 ||
      results.parts?.length > 0 ||
      results.brands?.length > 0 ||
      results.categories?.length > 0);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search mobiles, parts, brands..."
          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
        ) : (
          query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )
        )}
      </form>

      {/* Autocomplete Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fade-in max-h-96 overflow-y-auto">
          {!hasResults && !isLoading ? (
            <div className="px-4 py-3 text-center text-xs text-slate-500">
              No matches found for "<span className="font-semibold text-slate-800">{query}</span>"
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {/* Mobiles Section */}
              {results?.mobiles?.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    Mobiles
                  </div>
                  {results.mobiles.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectResult(`/mobiles/${m.id}`)}
                      className="w-full text-left flex items-center justify-between px-3 py-1.5 hover:bg-blue-50/60 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-slate-800 truncate">{m.name}</span>
                      <span className="text-[11px] font-semibold text-blue-600 ml-2">₹{m.sellingPrice || m.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Parts Section */}
              {results?.parts?.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                    Spare Parts
                  </div>
                  {results.parts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectResult(`/parts/${p.id}`)}
                      className="w-full text-left flex items-center justify-between px-3 py-1.5 hover:bg-indigo-50/60 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-slate-800 truncate">{p.name}</span>
                      <span className="text-[11px] font-semibold text-indigo-600 ml-2">₹{p.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Brands Section */}
              {results?.brands?.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Brands
                  </div>
                  {results.brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleSelectResult(`/mobiles?brandId=${b.id}`)}
                      className="w-full text-left px-3 py-1.5 font-medium text-slate-800 hover:bg-emerald-50/60 rounded-lg transition-colors"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Categories Section */}
              {results?.categories?.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    Part Categories
                  </div>
                  {results.categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectResult(`/parts?categoryId=${c.id}`)}
                      className="w-full text-left px-3 py-1.5 font-medium text-slate-800 hover:bg-amber-50/60 rounded-lg transition-colors"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
