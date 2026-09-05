import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Wrench, ShieldCheck, ArrowRight, Layers, Cable, BatteryCharging } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Button from '../../components/common/Button';
import MobileCard from '../../components/catalog/MobileCard';
import PartCard from '../../components/parts/PartCard';
import catalogService from '../../services/catalog.service';

const Home = () => {
  const [featuredMobiles, setFeaturedMobiles] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoadingFeatured(true);
      try {
        const res = await catalogService.getFeaturedMobiles({ limit: 6 });
        setFeaturedMobiles(res.data || []);
      } catch (err) {
        console.error('Failed to fetch featured mobiles:', err);
      } finally {
        setIsLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const fallbackFeaturedMobiles = [
    {
      id: 'm1',
      brand: { name: 'Samsung' },
      name: 'Galaxy A54 5G',
      ram: '8GB',
      storage: '128GB',
      price: 38999,
      sellingPrice: 34999,
      status: 'ACTIVE',
    },
    {
      id: 'm2',
      brand: { name: 'Apple' },
      name: 'iPhone 13',
      ram: '4GB',
      storage: '128GB',
      price: 59900,
      sellingPrice: 52999,
      status: 'ACTIVE',
    },
    {
      id: 'm3',
      brand: { name: 'OnePlus' },
      name: 'Nord CE 3 5G',
      ram: '8GB',
      storage: '128GB',
      price: 26999,
      sellingPrice: 24999,
      status: 'ACTIVE',
    },
  ];

  const popularParts = [
    { id: 'p1', name: 'Samsung Galaxy A54 Original Display', category: { name: 'Display' }, price: 3499, stockStatus: 'AVAILABLE', partNumber: 'DSP-SAM-A54' },
    { id: 'p2', name: 'iPhone 13 High Capacity Battery', category: { name: 'Battery' }, price: 2299, stockStatus: 'AVAILABLE', partNumber: 'BAT-IPH-13' },
    { id: 'p3', name: 'Type-C Fast Charging Board', category: { name: 'Charging' }, price: 499, stockStatus: 'LOW_STOCK', partNumber: 'CHG-TYPC-01' },
  ];

  const categories = [
    { label: 'Smartphones', path: '/mobiles', icon: Smartphone, bg: 'bg-blue-50 text-blue-600' },
    { label: 'Accessories', path: '/parts', icon: Layers, bg: 'bg-indigo-50 text-indigo-600' },
    { label: 'Parts', path: '/parts', icon: Wrench, bg: 'bg-emerald-50 text-emerald-600' },
    { label: 'Chargers', path: '/parts', icon: BatteryCharging, bg: 'bg-amber-50 text-amber-600' },
    { label: 'Cables', path: '/parts', icon: Cable, bg: 'bg-purple-50 text-purple-600' },
  ];

  const displayMobiles = featuredMobiles.length > 0 ? featuredMobiles : fallbackFeaturedMobiles;

  return (
    <CustomerLayout>
      <div className="space-y-8 sm:space-y-10">
        {/* iOS Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Mobile-Adda Certified Shop</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Upgrade to the latest technology
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed">
              Explore the newest mobiles from top brands at the best prices, order genuine spare parts, or request expert device services.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/mobiles">
                <Button variant="primary" size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 font-bold text-xs sm:text-sm shadow-md">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/parts">
                <Button variant="outline" size="lg" className="rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 px-6 font-semibold text-xs sm:text-sm">
                  Browse Parts
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Strip */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Shop by Category</h2>
            <Link to="/parts" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  to={cat.path}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col items-center justify-center text-center group hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <div className={`p-3 rounded-2xl ${cat.bg} mb-2.5 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Popular Mobiles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Popular Mobiles</h2>
              <p className="text-xs text-slate-500">Top smartphones available at our store</p>
            </div>
            <Link to="/mobiles" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayMobiles.map((mobile) => (
              <MobileCard key={mobile.id} mobile={mobile} />
            ))}
          </div>
        </section>

        {/* Available Spare Parts */}
        <section className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Spare Parts & Components</h2>
              <p className="text-xs text-slate-500">Genuine replacement displays, batteries & fast chargers</p>
            </div>
            <Link to="/parts" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center">
              View All Parts <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularParts.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
};

export default Home;
