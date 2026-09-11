import React, { useState } from 'react';
import { Smartphone, Wrench, Package } from 'lucide-react';
import { getImageUrl } from '../../utils/image';

/**
 * Reusable ProductImage component with:
 * - Shimmer loading state
 * - Automatic URL normalization (backend /uploads handling)
 * - Safe fallback placeholder on error or missing image
 * - Type-aware icon fallbacks (mobile, part, or general product)
 */
const ProductImage = ({
  src,
  alt = 'Product image',
  type = 'mobile', // 'mobile' | 'part' | 'category' | 'general'
  className = '',
  imgClassName = 'w-full h-full object-contain',
  fallbackClassName = 'flex flex-col items-center justify-center text-slate-300 gap-1 p-4',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(src));

  const resolvedSrc = getImageUrl(src);

  const getFallbackIcon = () => {
    switch (type) {
      case 'part':
        return <Wrench className="w-10 h-10 stroke-[1.5] text-slate-300" />;
      case 'category':
        return <Package className="w-10 h-10 stroke-[1.5] text-slate-300" />;
      case 'mobile':
      default:
        return <Smartphone className="w-10 h-10 stroke-[1.5] text-slate-300" />;
    }
  };

  const getFallbackLabel = () => {
    switch (type) {
      case 'part':
        return 'Spare Part';
      case 'category':
        return 'Category';
      case 'mobile':
      default:
        return 'Smartphone';
    }
  };

  if (!resolvedSrc || hasError) {
    return (
      <div className={`w-full h-full ${fallbackClassName} ${className}`}>
        {getFallbackIcon()}
        <span className="text-[10px] font-medium tracking-wide uppercase text-slate-400">
          {getFallbackLabel()}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 skeleton-shimmer rounded-lg" />
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        className={`${imgClassName} ${isLoading ? 'opacity-0 scale-[0.97]' : 'opacity-100 scale-100'} transition-all duration-500 ease-out`}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

export default ProductImage;
