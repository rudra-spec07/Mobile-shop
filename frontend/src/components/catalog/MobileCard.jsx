import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, ArrowRight, Star } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import MobileStatusBadge from './MobileStatusBadge';
import { getImageUrl } from '../../utils/image';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const MobileCard = ({ mobile }) => {
  const rawPrimaryImage = mobile.images?.find((img) => img.isPrimary)?.imageUrl || mobile.images?.[0]?.imageUrl;
  const primaryImage = getImageUrl(rawPrimaryImage);
  const regularPrice = Number(mobile.price);
  const sellingPrice = mobile.sellingPrice !== null && mobile.sellingPrice !== undefined ? Number(mobile.sellingPrice) : null;
  const hasDiscount = sellingPrice !== null && sellingPrice < regularPrice;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden h-full">
      <div className="space-y-3">
        {/* Thumbnail / Image Container */}
        <div className="relative w-full h-44 sm:h-48 bg-slate-50/80 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-blue-50/20 transition-colors p-2">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={mobile.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="flex flex-col items-center justify-center text-slate-300"
            style={{ display: primaryImage ? 'none' : 'flex' }}
          >
            <Smartphone className="w-10 h-10 stroke-[1.5]" />
            <span className="text-[10px] text-slate-400 mt-1 font-medium">No Image</span>
          </div>

          {/* Featured Badge */}
          {mobile.featured && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}

          {/* Status Pill */}
          <div className="absolute top-2 right-2">
            <MobileStatusBadge status={mobile.status} />
          </div>
        </div>

        {/* Header Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {mobile.brand?.name || 'Brand'}
            </span>
            {mobile.modelNumber && (
              <span className="text-[10px] font-medium text-slate-400">
                {mobile.modelNumber}
              </span>
            )}
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors pt-0.5">
            {mobile.name}
          </h3>
        </div>

        {/* Spec Highlights */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          {mobile.ram && (
            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
              {mobile.ram} RAM
            </span>
          )}
          {mobile.storage && (
            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
              {mobile.storage} Storage
            </span>
          )}
          {mobile.color && (
            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
              {mobile.color}
            </span>
          )}
        </div>
      </div>

      {/* Pricing & Footer Action */}
      <div className="pt-3 border-t border-slate-100 mt-3 space-y-2.5">
        <div className="flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(sellingPrice)}
              </span>
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatCurrency(regularPrice)}
              </span>
            </>
          ) : (
            <span className="text-base font-extrabold text-slate-900">
              {formatCurrency(regularPrice)}
            </span>
          )}
        </div>

        <Link to={`/mobiles/${mobile.id}`} className="block w-full">
          <Button variant="primary" size="sm" className="w-full justify-center rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-xs py-2">
            View Details
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MobileCard;
