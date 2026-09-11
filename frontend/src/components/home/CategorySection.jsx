import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Tag, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Smartphone, Headphones, Cpu, Zap, Cable } from 'lucide-react';
import { CategorySkeleton } from '../common/Skeletons';
import ProductImage from '../common/ProductImage';
import { ScrollReveal } from '../../hooks/useScrollReveal';

// Default / fallback icon map for categories
const getCategoryIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('smart') || lower.includes('phone') || lower.includes('mobile')) return Smartphone;
  if (lower.includes('access') || lower.includes('head') || lower.includes('ear') || lower.includes('audio')) return Headphones;
  if (lower.includes('part') || lower.includes('screen') || lower.includes('mother') || lower.includes('chip')) return Cpu;
  if (lower.includes('charg') || lower.includes('adapt') || lower.includes('power')) return Zap;
  if (lower.includes('cable') || lower.includes('wire') || lower.includes('usb')) return Cable;
  return Tag;
};

const CategorySection = ({ categories = [], isLoading = false, error = null, onRetry }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section aria-label="Shop by Category" className="space-y-4 relative">
      {/* Section Header */}
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
                Shop by Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Everything you need for your mobile
              </p>
            </div>
          </div>

          <Link
            to="/parts"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </ScrollReveal>

      {/* Categories Carousel / Grid Container */}
      <div className="relative group/carousel">
        {/* Left Carousel Arrow */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-slate-700 border border-slate-200/90 shadow-lg items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 active:scale-95 opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Carousel Arrow */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-slate-700 border border-slate-200/90 shadow-lg items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 active:scale-95 opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <CategorySkeleton count={5} />
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-2xl border border-rose-200/80 p-6 text-center shadow-xs">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">Unable to load categories</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        ) : categories.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Package className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No categories available</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Categories configured by the Super Admin will appear dynamically here.
            </p>
          </div>
        ) : (
          /* Dynamic Category Carousel / Grid */
          <div
            ref={scrollContainerRef}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none pb-1"
          >
            {categories.map((cat, idx) => {
              const targetPath = cat.path || (cat.isBrand ? `/mobiles?brandId=${cat.id}` : `/parts?categoryId=${cat.id}`);
              const FallbackIcon = getCategoryIcon(cat.name);
              return (
                <ScrollReveal key={cat.id || cat.name} delay={idx * 70}>
                  <Link
                    to={targetPath}
                    className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 flex items-center justify-between gap-3 group hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 min-w-[190px] h-full"
                  >
                    {/* Left: Image / Icon Container */}
                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-blue-50/70 p-2 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white text-blue-600 transition-colors duration-300">
                      {cat.imageUrl || cat.logoUrl ? (
                        <ProductImage
                          src={cat.imageUrl || cat.logoUrl}
                          alt={cat.name}
                          type="category"
                          imgClassName="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <FallbackIcon className="w-6 h-6 stroke-[1.8] group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>

                    {/* Center: Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                        {cat.description || (cat.isBrand ? 'Official brand products' : 'Genuine components')}
                      </p>
                    </div>

                    {/* Right: Circular Arrow Action */}
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-xs">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
