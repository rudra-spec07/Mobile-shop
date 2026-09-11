import React from 'react';
import { ShieldCheck, Settings, Users, Lock } from 'lucide-react';
import { ScrollReveal } from '../../hooks/useScrollReveal';

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: 'Genuine Products',
    description: 'Original & verified products',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    icon: Settings,
    title: 'Quality Parts',
    description: 'Reliable spare parts',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Expert Service',
    description: 'Professional technicians',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    icon: Lock,
    title: 'Secure & Reliable',
    description: 'Trusted customer service',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
];

const TrustStrip = () => {
  return (
    <section aria-label="Trust Features">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
        {trustFeatures.map((item, idx) => {
          const Icon = item.icon;
          return (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
};

export default TrustStrip;
