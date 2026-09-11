import React, { useState } from 'react';
import {
  Smartphone,
  BatteryCharging,
  Zap,
  Cpu,
  Wrench,
  ArrowRight,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import technicianRepairImg from '../../assets/images/technician_repair.jpg';
import CreateEnquiryModal from '../enquiry/CreateEnquiryModal';
import { ScrollReveal } from '../../hooks/useScrollReveal';

const repairServices = [
  {
    id: 'screen',
    name: 'Screen Replacement',
    icon: Smartphone,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'battery',
    name: 'Battery Replacement',
    icon: BatteryCharging,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    id: 'charging',
    name: 'Charging Problem',
    icon: Zap,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'software',
    name: 'Software Issues',
    icon: Cpu,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-100',
  },
  {
    id: 'other',
    name: 'Other Repairs',
    icon: Wrench,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
];

const ServiceSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <section aria-label="Need a Repair or Service?" className="h-full">
      <ScrollReveal className="h-full">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#dbeafe]/80 via-[#e0f2fe]/90 to-[#f0f9ff] border border-blue-200/80 shadow-md p-6 sm:p-7 flex flex-col justify-between h-full">
          {/* Subtle glowing ambient circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-sky-300/30 rounded-full blur-3xl pointer-events-none anim-glow-pulse" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-300/25 rounded-full blur-3xl pointer-events-none anim-glow-pulse anim-delay-1000" />

          <div className="relative z-10 space-y-5">
            {/* Header & Description */}
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Need a Repair or Service?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Get professional support from our experienced technicians.
              </p>
            </div>

            {/* CTA Button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  setIsModalOpen(true);
                }}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 transition-all active:scale-[0.98] hover:scale-[1.02]"
              >
                <span>Request a Service</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Split Content: Services List & 3D Repair Visual */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
              {/* Left Column: Vertical Checklist of 5 Services */}
              <div className="sm:col-span-6 space-y-2">
                {repairServices.map((service, idx) => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceClick(service)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/70 hover:bg-white text-left border border-white/80 hover:border-blue-200 hover:shadow-xs transition-all duration-200 group text-slate-800"
                    >
                      <div className={`w-7 h-7 rounded-lg ${service.iconBg} ${service.iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <span className="text-xs font-bold group-hover:text-blue-600 transition-colors truncate">
                        {service.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: 3D Disassembled Smartphone Visual */}
              <div className="sm:col-span-6 relative flex flex-col items-center justify-center">
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/80 shadow-xl bg-white/60 backdrop-blur-sm anim-float">
                  <img
                    src={technicianRepairImg}
                    alt="Smartphone repair and internal components"
                    className="w-full h-40 sm:h-44 object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-2.5 right-3 text-right">
                    <span className="italic font-serif text-white text-xs drop-shadow font-semibold tracking-wide">
                      Expert Care for Your Device
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Interactive Service Request / Enquiry Modal */}
      <CreateEnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSubject={selectedService ? `Repair Service: ${selectedService.name}` : 'General Mobile Repair Request'}
      />
    </section>
  );
};

export default ServiceSection;
