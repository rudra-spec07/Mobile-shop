import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import MobileImageGallery from '../../components/catalog/MobileImageGallery';
import MobileStatusBadge from '../../components/catalog/MobileStatusBadge';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import catalogService from '../../services/catalog.service';
import CreateEnquiryModal from '../../components/enquiry/CreateEnquiryModal';
import CreateRequestModal from '../../components/request/CreateRequestModal';
import {
  ArrowLeft,
  Smartphone,
  Cpu,
  HardDrive,
  Battery,
  Camera,
  Layers,
  Wifi,
  Palette,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const CustomerMobileDetails = () => {
  const { id } = useParams();
  const [mobile, setMobile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchMobileDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await catalogService.getMobileById(id);
      setMobile(res.data?.mobile || null);
    } catch (err) {
      setError(err.message || 'Unable to load mobile details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMobileDetails();
  }, [id]);

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="py-16">
          <Loader text="Loading mobile specifications..." />
        </div>
      </CustomerLayout>
    );
  }

  if (error || !mobile) {
    return (
      <CustomerLayout>
        <div className="space-y-4">
          <Link to="/mobiles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalogue
            </Button>
          </Link>
          <ErrorState
            title="Mobile Not Found"
            description={error || 'The requested mobile model is unavailable.'}
            onRetry={fetchMobileDetails}
          />
        </div>
      </CustomerLayout>
    );
  }

  const regularPrice = Number(mobile.price);
  const sellingPrice = mobile.sellingPrice !== null && mobile.sellingPrice !== undefined ? Number(mobile.sellingPrice) : null;
  const hasDiscount = sellingPrice !== null && sellingPrice < regularPrice;
  const discountPercent = hasDiscount ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100) : 0;

  const specItems = [
    { label: 'RAM', value: mobile.ram, icon: Cpu },
    { label: 'Storage', value: mobile.storage, icon: HardDrive },
    { label: 'Processor', value: mobile.processor, icon: Cpu },
    { label: 'Display', value: mobile.display, icon: Smartphone },
    { label: 'Front Camera', value: mobile.frontCamera, icon: Camera },
    { label: 'Rear Camera', value: mobile.rearCamera, icon: Camera },
    { label: 'Battery', value: mobile.battery, icon: Battery },
    { label: 'Operating System', value: mobile.operatingSystem, icon: Layers },
    { label: 'Network', value: mobile.network, icon: Wifi },
    { label: 'SIM Type', value: mobile.simType, icon: Layers },
    { label: 'Color / Finish', value: mobile.color, icon: Palette },
  ].filter((item) => Boolean(item.value));

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link to="/mobiles" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Mobile Catalogue
          </Link>
        </div>

        {/* Top Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5">
            <MobileImageGallery images={mobile.images} mobileName={mobile.name} />
          </div>

          {/* Right Column: Pricing & Quick Highlights */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                  {mobile.brand?.name}
                </span>
                <MobileStatusBadge status={mobile.status} />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {mobile.name}
                </h1>
                {mobile.modelNumber && (
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    Model Number: {mobile.modelNumber}
                  </p>
                )}
              </div>

              {/* Price Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400 block">Pricing Details</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    {hasDiscount ? (
                      <>
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                          {formatCurrency(sellingPrice)}
                        </span>
                        <span className="text-sm font-medium text-slate-400 line-through">
                          {formatCurrency(regularPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {formatCurrency(regularPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {hasDiscount && (
                  <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow-xs">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Quick Spec Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {mobile.ram && (
                  <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                    ⚡ {mobile.ram} RAM
                  </span>
                )}
                {mobile.storage && (
                  <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                    💾 {mobile.storage} Storage
                  </span>
                )}
                {mobile.color && (
                  <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                    🎨 {mobile.color}
                  </span>
                )}
              </div>
            </div>

            {/* Action Entry Points */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md py-3"
                onClick={() => setIsRequestModalOpen(true)}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Request Device Purchase
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center text-sm font-bold border-slate-300 text-slate-700 hover:bg-slate-50 py-3"
                onClick={() => setIsEnquiryModalOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Inquiry for This Mobile
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Genuine Products & Official Store Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Specs Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Full Specifications & Features
          </h3>

          {mobile.description && (
            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overview</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{mobile.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specItems.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div key={idx} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium">{spec.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{spec.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Request Entry Point Modal */}
      <CreateRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        mobile={mobile}
      />

      {/* Inquiry Entry Point Modal */}
      <CreateEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        mobile={mobile}
      />
    </CustomerLayout>
  );
};

export default CustomerMobileDetails;
