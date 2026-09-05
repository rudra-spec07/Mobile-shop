import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight } from 'lucide-react';
import PartStatusBadge from './PartStatusBadge';

const PartCard = ({ part }) => {
  const priceFormatted = Number(part.price || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden h-full">
      <div className="space-y-3">
        {/* Thumbnail Container */}
        <div className="relative w-full h-44 sm:h-48 bg-slate-50/80 rounded-xl flex items-center justify-center p-3 overflow-hidden border border-slate-100 group-hover:bg-blue-50/20 transition-colors">
          {part.imageUrl ? (
            <img
              src={part.imageUrl}
              alt={part.name}
              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="flex flex-col items-center justify-center text-slate-300 gap-1"
            style={{ display: part.imageUrl ? 'none' : 'flex' }}
          >
            <Wrench className="w-10 h-10 stroke-[1.5]" />
            <span className="text-[10px] font-medium uppercase text-slate-400">Spare Part</span>
          </div>

          {/* Category Pill */}
          {part.category?.name && (
            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
              {part.category.name}
            </span>
          )}

          {/* Stock Status Badge */}
          <div className="absolute top-2 right-2">
            <PartStatusBadge status={part.stockStatus} />
          </div>
        </div>

        {/* Content Header */}
        <div className="space-y-1">
          {part.partNumber && (
            <div className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
              PN: {part.partNumber}
            </div>
          )}
          <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {part.name}
          </h3>
          {part.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
              {part.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer info & Action */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Price</span>
          <span className="text-base font-extrabold text-slate-900">₹{priceFormatted}</span>
        </div>

        <Link
          to={`/parts/${part.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-all"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default PartCard;
