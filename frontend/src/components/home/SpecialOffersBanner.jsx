import React from 'react';
import { Link } from 'react-router-dom';
import { Percent, ArrowRight, Sparkles } from 'lucide-react';
import giftBoxImg from '../../assets/images/gift_box.jpg';
import { ScrollReveal } from '../../hooks/useScrollReveal';

const SpecialOffersBanner = () => {
  return (
    <ScrollReveal>
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl p-5 sm:p-7 border border-blue-400/30">
        {/* Subtle background ambient sparkles & glow */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Percentage Icon + Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <Percent className="w-7 h-7 text-sky-200 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                Special Offers
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
                on Mobiles & Parts
              </p>
            </div>
          </div>

          {/* Center: Highlight Features */}
          <div className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-blue-100">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
              Quality Products
            </span>
            <span className="text-blue-300/60">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
              Expert Service
            </span>
            <span className="text-blue-300/60">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
              Better Prices
            </span>
          </div>

          {/* Right: CTA Button & 3D Gift Box Visual */}
          <div className="flex items-center gap-5 shrink-0">
            <Link
              to="/mobiles"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-blue-700 font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 hover:scale-105"
            >
              <span>Explore Offers</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* 3D Gift Box */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-white/30 anim-float hidden sm:block">
              <img
                src={giftBoxImg}
                alt="Special gift rewards and discounts"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default SpecialOffersBanner;
