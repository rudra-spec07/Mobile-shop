import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Button from '../../components/common/Button';
import Card, { CardBody } from '../../components/common/Card';
import MobileCard from '../../components/catalog/MobileCard';
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
    { id: 'p1', name: 'Samsung Galaxy A54 Original Display', category: 'Display', price: '₹3,499', status: 'Available' },
    { id: 'p2', name: 'iPhone 13 High Capacity Battery', category: 'Battery', price: '₹2,299', status: 'Available' },
    { id: 'p3', name: 'Type-C Fast Charging Board', category: 'Charging Board', price: '₹499', status: 'Low Stock' },
  ];

  const displayMobiles = featuredMobiles.length > 0 ? featuredMobiles : fallbackFeaturedMobiles;

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 mb-12 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Trusted Mobile & Repair Services</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Welcome to Mobile-Adda
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Find Mobiles & Mobile Parts Easily. Browse the latest models, order genuine spare parts, or request expert repair services for your device.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/mobiles">
              <Button variant="primary" size="lg" className="bg-blue-500 hover:bg-blue-600 border-none shadow-md">
                Browse Mobiles
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/parts">
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Browse Parts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Mobiles */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Mobiles</h2>
            <p className="text-xs text-slate-500">Popular mobile models available at our shop</p>
          </div>
          <Link to="/mobiles" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
            View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMobiles.map((mobile) => (
            <MobileCard key={mobile.id} mobile={mobile} />
          ))}
        </div>
      </section>

      {/* Available Spare Parts */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Available Spare Parts</h2>
            <p className="text-xs text-slate-500">Genuine replacement displays, batteries & components</p>
          </div>
          <Link to="/parts" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
            View All Parts <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularParts.map((part) => (
            <Card key={part.id} hoverable>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {part.category}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{part.price}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">{part.name}</h3>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <Link to={`/parts/${part.id}`} className="w-full">
                    <Button variant="primary" size="sm" className="w-full">
                      Request Part
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </CustomerLayout>
  );
};

export default Home;
