import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import MobileImageGallery from '../../components/catalog/MobileImageGallery';
import MobileStatusBadge from '../../components/catalog/MobileStatusBadge';
import MobileFormModal from '../../components/catalog/MobileFormModal';
import MobileImageManagerModal from '../../components/catalog/MobileImageManagerModal';
import StatusChangeModal from '../../components/catalog/StatusChangeModal';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import catalogService from '../../services/catalog.service';
import {
  ArrowLeft,
  Edit2,
  Image as ImageIcon,
  Sliders,
  Star,
  Cpu,
  HardDrive,
  Battery,
  Camera,
  Layers,
  Wifi,
  Palette,
  Smartphone,
} from 'lucide-react';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const AdminMobileDetails = () => {
  const { id } = useParams();
  const [mobile, setMobile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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

  const handleToggleFeatured = async () => {
    if (!mobile) return;
    try {
      await catalogService.updateMobileFeatured(mobile.id, !mobile.featured);
      fetchMobileDetails();
    } catch (err) {
      alert(err.message || 'Failed to toggle featured state');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-16">
          <Loader text="Loading mobile details..." />
        </div>
      </AdminLayout>
    );
  }

  if (error || !mobile) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Link to="/admin/mobiles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Mobiles List
            </Button>
          </Link>
          <ErrorState
            title="Mobile Not Found"
            description={error || 'The requested mobile model does not exist.'}
            onRetry={fetchMobileDetails}
          />
        </div>
      </AdminLayout>
    );
  }

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
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <Link to="/admin/mobiles" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Mobile List
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{mobile.name}</h1>
              <MobileStatusBadge status={mobile.status} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFeatured}
              className={mobile.featured ? 'text-amber-600 bg-amber-50 border-amber-200' : ''}
            >
              <Star className={`w-4 h-4 mr-1 ${mobile.featured ? 'fill-current' : ''}`} />
              {mobile.featured ? 'Featured' : 'Mark Featured'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImageModalOpen(true)}
            >
              <ImageIcon className="w-4 h-4 mr-1 text-indigo-600" />
              Manage Images
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(true)}
            >
              <Sliders className="w-4 h-4 mr-1 text-amber-600" />
              Status
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Specs
            </Button>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="lg:col-span-5">
            <MobileImageGallery images={mobile.images} mobileName={mobile.name} />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Brand: {mobile.brand?.name}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{mobile.name}</h2>
              {mobile.modelNumber && (
                <p className="text-xs font-medium text-slate-400">Model Number: {mobile.modelNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs font-medium text-slate-400">Regular Price</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{formatCurrency(mobile.price)}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">Selling Price</span>
                <p className="text-xl font-bold text-emerald-600 mt-0.5">{formatCurrency(mobile.sellingPrice)}</p>
              </div>
            </div>

            {mobile.description && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {mobile.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Hardware Specifications Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {specItems.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span>{spec.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{spec.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Action Modals */}
      <MobileFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mobileToEdit={mobile}
        onSaved={fetchMobileDetails}
      />

      <MobileImageManagerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        mobile={mobile}
        onImagesUpdated={fetchMobileDetails}
      />

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        mobile={mobile}
        onStatusUpdated={fetchMobileDetails}
      />
    </AdminLayout>
  );
};

export default AdminMobileDetails;
