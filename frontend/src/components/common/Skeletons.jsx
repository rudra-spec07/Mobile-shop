import React from 'react';

/**
 * Skeleton card for loading Mobiles and Spare Parts
 */
export const ProductSkeleton = ({ count = 4, isPart = false }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 flex flex-col justify-between animate-pulse skeleton-shimmer h-full"
        >
          <div className="space-y-3">
            {/* Image Box */}
            <div className="w-full h-44 sm:h-48 bg-slate-100 rounded-xl flex items-center justify-center relative">
              <div className="w-16 h-16 bg-slate-200 rounded-lg" />
            </div>

            {/* Tags / Brand */}
            <div className="flex items-center justify-between pt-1">
              <div className="h-4 w-16 bg-slate-200 rounded-md" />
              {isPart && <div className="h-3 w-20 bg-slate-100 rounded" />}
            </div>

            {/* Title */}
            <div className="h-4 w-3/4 bg-slate-200 rounded" />

            {/* Specs */}
            <div className="flex gap-2">
              <div className="h-3 w-12 bg-slate-100 rounded" />
              <div className="h-3 w-14 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Price & Action */}
          <div className="pt-3 border-t border-slate-100 mt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-14 bg-slate-100 rounded-full" />
            </div>
            <div className="h-8 w-full bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton for loading Categories
 */
export const CategorySkeleton = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3 animate-pulse skeleton-shimmer"
        >
          <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
            <div className="h-2.5 w-32 bg-slate-100 rounded" />
          </div>
          <div className="w-7 h-7 bg-slate-100 rounded-full shrink-0" />
        </div>
      ))}
    </>
  );
};

export default {
  ProductSkeleton,
  CategorySkeleton,
};
