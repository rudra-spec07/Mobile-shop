import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import PartStatusBadge from '../../components/parts/PartStatusBadge';
import CreateEnquiryModal from '../../components/enquiry/CreateEnquiryModal';
import CreateRequestModal from '../../components/request/CreateRequestModal';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import partsService from '../../services/parts.service';
import { ArrowLeft, Wrench, MessageSquare, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

const CustomerPartDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    fetchPartDetails();
  }, [id]);

  const fetchPartDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await partsService.getPartById(id);
      setPart(res.data?.part || res.data);
    } catch (err) {
      setError(err.message || 'Failed to load part details');
    } finally {
      setLoading(false);
    }
  };

  const priceFormatted = Number(part?.price || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <CustomerLayout>
      {/* Navigation Breadcrumb Bar */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/parts')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parts Catalog</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24">
          <Loader text="Loading spare part specifications..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPartDetails} />
      ) : !part ? (
        <ErrorState message="Part details not found" onRetry={fetchPartDetails} />
      ) : (
        <>
          {/* Modal */}
          <CreateEnquiryModal
            isOpen={isEnquiryModalOpen}
            onClose={() => setIsEnquiryModalOpen(false)}
            part={part}
          />

          {/* Main Part Detail Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Media Section */}
            <div className="lg:col-span-5 bg-slate-50 p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200/80 relative">
              {part.imageUrl ? (
                <img
                  src={part.imageUrl}
                  alt={part.name}
                  className="max-h-80 w-auto object-contain drop-shadow-sm"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-3 py-16">
                  <Wrench className="w-16 h-16 stroke-[1.5]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Spare Component
                  </span>
                </div>
              )}

              {/* Category Floating Pill */}
              {part.category?.name && (
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  {part.category.name}
                </span>
              )}
            </div>

            {/* Specification Details Section */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Part Number & Status Header */}
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs font-bold rounded-lg uppercase tracking-wider">
                    PN: {part.partNumber}
                  </span>
                  <PartStatusBadge status={part.stockStatus} />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {part.name}
                </h1>

                {/* Pricing Box */}
                <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                      Estimated Retail Price
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{priceFormatted}</span>
                  </div>

                  <div className="text-right text-xs">
                    {part.inStock ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-4 h-4" /> Available in Store
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700 bg-rose-100/80 px-3 py-1.5 rounded-full">
                        <AlertCircle className="w-4 h-4" /> Temporarily Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs & Description */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Description & Compatibility
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {part.description || 'No specific warranty or compatibility details provided for this component.'}
                  </p>
                </div>

                {/* Trust Assurances */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-700">100% Verified Quality</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-700">In-Store Installation</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  onClick={() => setIsRequestModalOpen(true)}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Request Spare Part</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 border-slate-300 text-slate-700"
                  onClick={() => setIsEnquiryModalOpen(true)}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Enquire About Stock & Repair Options</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Request Entry Point Modal */}
          <CreateRequestModal
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
            part={part}
          />
        </>
      )}
    </CustomerLayout>
  );
};

export default CustomerPartDetails;
