import React from 'react';
import { Users, Star, ShieldCheck, Lock, MessageSquare } from 'lucide-react';
import { ScrollReveal } from '../../hooks/useScrollReveal';

const statsData = [
  {
    icon: Users,
    value: '10K+',
    label: 'Happy Customers',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    icon: Star,
    value: '4.8/5',
    label: 'Customer Rating',
    color: 'text-amber-500 fill-amber-400',
    bg: 'bg-amber-100',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Genuine Products',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    icon: Lock,
    value: 'Expert Technicians',
    label: 'Years of Experience',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
];

const StatsStrip = () => {
  return (
    <section aria-label="Customer Trust & Stats" className="pt-2">
      <ScrollReveal>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* 4 Stats Glass Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 w-full lg:w-auto flex-1">
            {statsData.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Need Help Floating / Inline Chat Trigger */}
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-blue-200/80 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer group">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 leading-none">Need Help?</div>
              <div className="text-[10px] text-slate-500 font-medium">Chat with us</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-transform group-hover:scale-105">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default StatsStrip;
