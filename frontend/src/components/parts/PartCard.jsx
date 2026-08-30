import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight } from 'lucide-react';
import PartStatusBadge from './PartStatusBadge';

const PartCard = ({ part }) => {
  const priceFormatted = Number(part.price || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Thumbnail Container */}
      <div className="relative h-48 bg-slate-50 flex items-center justify-center p-4 overflow-hidden border-b border-slate-100">
        {part.imageUrl ? (
          <img
            src={part.imageUrl}
            alt={part.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="flex flex-col items-center justify-center text-slate-400 gap-2"
          style={{ display: part.imageUrl ? 'none' : 'flex' }}
        >
          <Wrench className="w-10 h-10 stroke-[1.5]" />
          <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Spare Part</span>
        </div>

        {/* Category Pill */}
        {part.category?.name && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
            {part.category.name}
          </span>
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <PartStatusBadge status={part.stockStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-mono text-slate-500 mb-1 tracking-wider uppercase">
            PN: {part.partNumber || 'N/A'}
          </div>
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {part.name}
          </h3>
          {part.description && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {part.description}
            </p>
          )}
        </div>

        {/* Footer info & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Price</span>
            <span className="text-lg font-bold text-slate-900">₹{priceFormatted}</span>
          </div>

          <Link
            to={`/parts/${part.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-2 rounded-xl transition-all"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PartCard;
