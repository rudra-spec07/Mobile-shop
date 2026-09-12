import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, ArrowRight } from 'lucide-react';
import ProductImage from '../common/ProductImage';

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const MobileCard = ({ mobile }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const rawPrimaryImage = mobile.images?.find((img) => img.isPrimary)?.imageUrl || mobile.images?.[0]?.imageUrl || mobile.imageUrl;
  const regularPrice = Number(mobile.price || 0);
  const sellingPrice = mobile.sellingPrice !== null && mobile.sellingPrice !== undefined ? Number(mobile.sellingPrice) : null;
  const hasDiscount = sellingPrice !== null && sellingPrice < regularPrice;
  const discountPercent = hasDiscount ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100) : 0;
  const activePrice = hasDiscount ? sellingPrice : regularPrice;

  // Build specifications string (e.g. "8GB • 128GB")
  const specs = [mobile.ram, mobile.storage].filter(Boolean).join(' • ');
  const isInStock = mobile.status === 'ACTIVE';

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
          ) : mobile.featured ? (
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            New
          </span>
          ) : mobile.brand?.name ? (
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 truncate max-w-[100px]">
            {mobile.brand.name}
          </span>
          ) : (
          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Hot
          </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            aria-label="Add to wishlist"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${isWishlisted
                ? 'text-red-500 bg-red-50 scale-110'
                : 'text-slate-400 hover:text-red-500 hover:bg-slate-50'
              }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Image */}
        <Link to={`/mobiles/${mobile.id}`} className="block relative w-full h-36 sm:h-40 bg-slate-50/60 rounded-xl overflow-hidden p-2 group-hover:bg-blue-50/30 transition-colors">
          <ProductImage
            src={rawPrimaryImage}
            alt={mobile.name}
            type="mobile"
            imgClassName="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
          />
        </Link>

        {/* Brand & Title */}
        <div className="space-y-0.5">
          {mobile.brand?.name && (
            <p className="text-[11px] font-medium text-slate-400 leading-tight">
              {mobile.brand.name}
            </p>
          )}

          <Link to={`/mobiles/${mobile.id}`}>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors leading-snug">
              {mobile.name}
            </h3>
          </Link>

          {specs ? (
            <p className="text-[11px] font-semibold text-slate-500">
              {specs}
            </p>
          ) : null}

          {/* Rating */}
          <div className="flex items-center gap-1 pt-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-800">4.8</span>
            <span className="text-[10px] text-slate-400">(120)</span>
          </div>
        </div>
      </div>

      {/* Price & Action Section */}
      <div className="pt-2.5 border-t border-slate-100 mt-2 space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {formatCurrency(activePrice)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through font-medium">
                {formatCurrency(regularPrice)}
              </span>
            )}
          </div>

          {/* Stock badge */}
          {isInStock ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 shrink-0">
              In Stock
            </span>
          ) : (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80 shrink-0">
              Out of Stock
            </span>
          )}
        </div>

        <Link
          to={`/mobiles/${mobile.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50/90 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200/70 hover:border-transparent text-xs font-bold transition-all duration-200 active:scale-[0.98] shadow-2xs hover:shadow-sm"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileCard;
