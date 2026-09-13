import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Wrench, Package, RefreshCw, AlertCircle } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import HeroSection from '../../components/home/HeroSection';
import CategorySection from '../../components/home/CategorySection';
import ServiceSection from '../../components/home/ServiceSection';
import StatsStrip from '../../components/home/StatsStrip';
import MobileCard from '../../components/catalog/MobileCard';
import { ProductSkeleton } from '../../components/common/Skeletons';
import { ScrollReveal } from '../../hooks/useScrollReveal';
import catalogService from '../../services/catalog.service';
import partsService from '../../services/parts.service';

const Home = () => {
  // Dynamic State: Mobiles
  const [mobiles, setMobiles] = useState([]);
  const [isLoadingMobiles, setIsLoadingMobiles] = useState(true);
  const [mobilesError, setMobilesError] = useState(null);

  // Dynamic State: Categories / Brands
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // Fetch Mobiles (Featured first, fallback to active catalog)
  const fetchMobiles = async () => {
    setIsLoadingMobiles(true);
    setMobilesError(null);
    try {
      const featuredRes = await catalogService.getFeaturedMobiles({ limit: 4 });
      const featuredList = featuredRes.data?.data || [];

      if (featuredList.length > 0) {
        setMobiles(featuredList);
      } else {
        const generalRes = await catalogService.getMobiles({ limit: 4, sort: 'newest' });
        setMobiles(generalRes.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch mobiles for homepage:', err);
      setMobilesError('Unable to load products. Please try again.');
    } finally {
      setIsLoadingMobiles(false);
    }
  };

  // Fetch Categories & Brands dynamically from backend
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);
    try {
      const [catRes, brandRes] = await Promise.allSettled([
        partsService.getPartCategories({ limit: 5 }),
        catalogService.getBrands({ limit: 5 }),
      ]);

      const fetchedCategories = catRes.status === 'fulfilled' ? catRes.value.data?.data || [] : [];
      const fetchedBrands = brandRes.status === 'fulfilled' ? brandRes.value.data?.data || [] : [];

      const combined = [
        ...fetchedCategories.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description || 'Genuine replacement components',
          imageUrl: c.imageUrl,
          isBrand: false,
        })),
        ...fetchedBrands.map((b) => ({
          id: b.id,
          name: b.name,
          description: `Latest devices from ${b.name}`,
          logoUrl: b.logoUrl,
          isBrand: true,
        })),
      ];

      setCategories(combined.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategoriesError('Unable to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchMobiles();
    fetchCategories();
  }, []);

  return (
    <CustomerLayout>
      <div className="space-y-8 sm:space-y-12">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Shop by Category (Dynamic from Backend) */}
        <CategorySection
          categories={categories}
          isLoading={isLoadingCategories}
          error={categoriesError}
          onRetry={fetchCategories}
        />

        {/* 3. Side-by-Side Dual Section: Featured Mobiles + Repair & Service Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left: Featured Mobiles (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <ScrollReveal>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Featured Mobiles
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Latest smartphones at the best prices
                    </p>
                  </div>
                </div>

                <Link
                  to="/mobiles"
                  className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Mobiles Grid */}
            {isLoadingMobiles ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <ProductSkeleton count={4} isPart={false} />
              </div>
            ) : mobilesError ? (
              <div className="bg-white rounded-2xl border border-rose-200/80 p-6 text-center shadow-xs">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">{mobilesError}</p>
                <button
                  onClick={fetchMobiles}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : mobiles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center shadow-xs">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No products available</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Smartphones created in the admin panel will automatically appear here.
                </p>
                <Link
                  to="/mobiles"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors"
                >
                  <span>Browse Mobile Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {mobiles.slice(0, 4).map((mobile, idx) => (
                  <ScrollReveal key={mobile.id} delay={idx * 75}>
                    <MobileCard mobile={mobile} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>

          {/* Right: Need a Repair or Service? (5 cols) */}
          <div className="lg:col-span-5">
            <ServiceSection />
          </div>
        </div>

        {/* 4. Bottom Customer Trust & Stats Strip */}
        <StatsStrip />
      </div>
    </CustomerLayout>
  );
};

export default Home;
