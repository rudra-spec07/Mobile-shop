import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { getImageUrl } from '../../utils/image';

const MobileImageGallery = ({ images = [], mobileName = 'Mobile' }) => {
  const primaryImg = images.find((img) => img.isPrimary) || images[0];
  const [selectedImage, setSelectedImage] = useState(getImageUrl(primaryImg?.imageUrl));

  useEffect(() => {
    const active = images.find((img) => img.isPrimary) || images[0];
    setSelectedImage(getImageUrl(active?.imageUrl));
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-72 sm:h-96 bg-slate-50/80 rounded-2xl flex flex-col items-center justify-center text-slate-300 border border-slate-200/80">
        <Smartphone className="w-16 h-16 stroke-[1.2]" />
        <span className="text-xs text-slate-400 mt-2 font-medium">No Images Available</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Preview Container */}
      <div className="relative w-full h-72 sm:h-96 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-center overflow-hidden shadow-xs group">
        <img
          src={selectedImage}
          alt={mobileName}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Thumbnail Carousel Selector */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {images.map((img, idx) => {
            const formattedUrl = getImageUrl(img.imageUrl);
            const isSelected = selectedImage === formattedUrl;
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedImage(formattedUrl)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 overflow-hidden transition-all bg-slate-50 p-1.5 ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={formattedUrl}
                  alt={`${mobileName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
                {img.isPrimary && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white shadow-xs" title="Primary Image" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileImageGallery;
