import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import ProductImage from '../common/ProductImage';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const PartCard = ({ part }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const priceFormatted = formatCurrency(part.price);

  // Dynamic Stock Status Determination
  const quantity = Number(part.quantity ?? 0);
  const minStock = Number(part.minimumStock ?? 5);

  let stockStatusLabel = 'In Stock';
  let stockStatusClass = 'text-emerald-700 bg-emerald-50 border-emerald-200/60';
  let dotClass = 'bg-emerald-500';

  if (part.status === 'INACTIVE' || quantity <= 0) {
    stockStatusLabel = 'Out of Stock';
    stockStatusClass = 'text-rose-700 bg-rose-50 border-rose-200/60';
    dotClass = 'bg-rose-500';
  } else if (quantity <= minStock) {
    stockStatusLabel = 'Low Stock';
    stockStatusClass = 'text-amber-700 bg-amber-50 border-amber-200/60';
    dotClass = 'bg-amber-500';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between group overflow-hidden h-full">
      <div className="space-y-3">
        {/* Top Header: Category Tag / Wishlist Heart */}
        <div className="flex items-center justify-between gap-2">
          {part.category?.name ? (
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md truncate max-w-[140px]">
              {part.category.name}
            </span>
          ) : (
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
              Spare Part
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            aria-label="Add to wishlist"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isWishlisted
                ? 'text-red-500 bg-red-50'
                : 'text-slate-400 hover:text-red-500 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Thumbnail / Part Image */}
        <Link to={`/parts/${part.id}`} className="block relative w-full h-40 sm:h-44 bg-slate-50/50 rounded-xl overflow-hidden p-2 group-hover:bg-blue-50/20 transition-colors">
          <ProductImage
            src={part.imageUrl}
            alt={part.name}
            type="part"
            imgClassName="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Part Number & Title */}
        <div className="space-y-1">
          {part.partNumber && (
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              PN: {part.partNumber}
            </span>
          )}
          <Link to={`/parts/${part.id}`}>
            <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {part.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Price & Action Section */}
      <div className="pt-3 border-t border-slate-100 mt-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {priceFormatted}
          </span>

          {/* Stock badge */}
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${stockStatusClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {stockStatusLabel}
          </span>
        </div>

        <Link
          to={`/parts/${part.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition-all active:scale-[0.98]"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default PartCard;
