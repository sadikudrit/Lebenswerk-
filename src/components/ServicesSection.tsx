import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Compass, 
  Home,
  Building
} from 'lucide-react';
import { Service } from '../types';

interface ServicesSectionProps {
  services: Service[];
  onSelectServiceForBooking: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceForBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Alle Behandlungen' },
    { id: 'classical-physio', label: 'Klassische Physiotherapie' },
    { id: 'manual-therapy', label: 'Manuelle Therapie' },
    { id: 'pain-therapy', label: 'Schmerztherapie' },
    { id: 'neuro-rehab', label: 'Neurologie' },
    { id: 'geriatric-care', label: 'Geriatrie & Domizil' },
  ];

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#E8F5E9]/60 border-t border-[#A5D6A7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#1B5E20] text-xs font-bold uppercase tracking-wider border border-[#A5D6A7] shadow-xs">
            <Building className="w-3.5 h-3.5 text-[#66BB6A]" />
            Praxis Biberist & Mobile Hausbesuche
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-[#1B5E20]">
            Unser Behandlungsangebot
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#1B5E20]/80 font-normal leading-relaxed">
            Gezielte, ganzheitliche und evidenzbasierte physiotherapeutische Betreuung an der Hauptstrasse 19 in Biberist oder bei Ihnen zu Hause.
          </p>
        </div>

        {/* Category Tabs - Touch friendly & horizontally scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap justify-start sm:justify-center mb-8 sm:mb-12 pb-2 sm:pb-0 scrollbar-none px-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`service-cat-btn-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#1B5E20] text-[#E8F5E9] shadow-md'
                  : 'bg-white border border-[#A5D6A7] text-[#1B5E20] hover:bg-[#E8F5E9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Treatment Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {filteredServices.map((service, index) => {
            const formattedIndex = String(index + 1).padStart(2, '0');
            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-[#A5D6A7] hover:border-[#1B5E20] hover:shadow-xl hover:shadow-[#1B5E20]/5 transition-all group overflow-hidden relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#1B5E20] text-[#E8F5E9] flex items-center justify-center text-sm font-display font-bold group-hover:scale-105 transition-transform">
                      {formattedIndex}
                    </div>
                    <span className="text-[11px] font-bold text-[#1B5E20] bg-[#E8F5E9] border border-[#A5D6A7] px-3 py-1 rounded-full">
                      Praxis & Domizil
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl sm:text-2xl font-display font-bold text-[#1B5E20] tracking-tight">
                    {service.name}
                  </h3>
                  
                  <p className="mt-2.5 text-xs sm:text-sm text-[#1B5E20]/80 leading-relaxed font-normal">
                    {service.shortDescription}
                  </p>

                  {/* Benefits */}
                  <div className="mt-4 space-y-1.5 pt-3 border-t border-[#A5D6A7]/50">
                    {service.benefits.slice(0, 3).map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#1B5E20]/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#66BB6A] shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-5 pt-3.5 border-t border-[#A5D6A7]/50 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#1B5E20]/80 font-bold truncate">
                    Individuelle Betreuung
                  </span>
                  
                  <button
                    type="button"
                    id={`book-service-${service.id}`}
                    onClick={() => onSelectServiceForBooking(service.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B5E20] text-[#E8F5E9] hover:bg-[#1B5E20]/90 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                  >
                    <span>Termin anfragen</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#66BB6A]" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
