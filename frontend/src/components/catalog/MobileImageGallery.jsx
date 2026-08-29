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
      <div className="w-full h-80 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-200">
        <Smartphone className="w-16 h-16 stroke-[1.2]" />
        <span className="text-xs text-slate-500 mt-2 font-medium">No Images Available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Preview Container */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden shadow-xs">
        <img
          src={selectedImage}
          alt={mobileName}
          className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Thumbnail Carousel Selector */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => {
            const formattedUrl = getImageUrl(img.imageUrl);
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedImage(formattedUrl)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all bg-slate-50 p-1 ${
                  selectedImage === formattedUrl
                    ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105'
                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={formattedUrl}
                  alt={`${mobileName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
                {img.isPrimary && (
                  <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-[8px] font-bold text-white text-center py-0.5">
                    Primary
                  </span>
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
