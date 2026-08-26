import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Activity, 
  Phone, 
  MapPin, 
  Home, 
  Building, 
  Sparkles, 
  Mail,
  ExternalLink
} from 'lucide-react';
import { Service } from '../types';

interface HeroSectionProps {
  services: Service[];
  onOpenBooking: (serviceId?: string, date?: string) => void;
  onOpenAiTriage?: () => void;
  onScrollToBodyMap?: () => void;
}

// Helper function to find the nearest upcoming working day: Thursday (4), Friday (5), or Saturday (6)
const getNextAvailableWorkingDate = (): string => {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  if (day === 4 || day === 5 || day === 6) {
    return d.toISOString().split('T')[0];
  }
  const daysUntilThu = (4 - day + 7) % 7;
  const nextThu = new Date(d.getTime() + (daysUntilThu === 0 ? 7 : daysUntilThu) * 86400000);
  return nextThu.toISOString().split('T')[0];
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  services,
  onOpenBooking,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<'practice' | 'home'>('practice');
  const [selectedDate, setSelectedDate] = useState<string>(getNextAvailableWorkingDate());

  return (
    <section id="about" className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden bg-[#E8F5E9] border-b border-[#A5D6A7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetrical Grid */}
        <div className="grid grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Text Column (7 cols) */}
          <div className="col-span-12 lg:col-span-7 hero-text-container space-y-4 sm:space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white border border-[#A5D6A7] text-[#1B5E20] text-[11px] sm:text-xs font-bold tracking-wider shadow-xs max-w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A5D6A7] flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20]" />
              </span>
              <span className="truncate">PRAXIS BIBERIST & HAUSBESUCHE • DO, FR & SA</span>
            </div>

            {/* Main Display Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-[#1B5E20] tracking-tight sm:tracking-tighter leading-[1.1] sm:leading-[0.94] break-words">
              Gezielte Therapie in der<br />
              <span className="text-[#66BB6A]">Praxis & Zuhause.</span>
            </h1>

            {/* Organic Description */}
            <p className="text-base sm:text-lg lg:text-xl text-[#1B5E20]/85 leading-relaxed max-w-2xl font-normal">
              Individuelle, persönliche und evidenzbasierte Physiotherapie von <strong>Dipl. Physiotherapeut Vigan Musliu</strong>. Praxis an der <strong>Hauptstrasse 19, 4562 Biberist</strong> sowie mobile <strong>Hausbesuche</strong> in der gesamten Region Solothurn & Biberist.
            </p>

            {/* Schedule Highlights Pill Grid */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#A5D6A7] shadow-xs space-y-2 max-w-xl">
              <span className="text-xs font-extrabold text-[#1B5E20] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#66BB6A]" /> Arbeitszeiten & Termine:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-[#1B5E20]">
                <div className="p-2 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7]/60 text-center">
                  <span className="block text-[11px] text-[#1B5E20]/70 font-semibold">Donnerstag</span>
                  <span>18:00 – 21:00</span>
                </div>
                <div className="p-2 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7]/60 text-center">
                  <span className="block text-[11px] text-[#1B5E20]/70 font-semibold">Freitag</span>
                  <span>17:00 – 20:00</span>
                </div>
                <div className="p-2 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7]/60 text-center">
                  <span className="block text-[11px] text-[#1B5E20]/70 font-semibold">Samstag</span>
                  <span>08:00 – 14:00</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Schedule Appointment & Google Maps Location */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                id="hero-schedule-appointment-btn"
                onClick={() => onOpenBooking()}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#1B5E20] text-[#E8F5E9] font-extrabold hover:bg-[#1B5E20]/90 transition-all shadow-lg shadow-[#1B5E20]/20 hover:scale-[1.02] transform cursor-pointer flex items-center justify-center gap-2.5 text-sm sm:text-base text-center"
              >
                <Calendar className="w-4 h-4 text-[#66BB6A]" />
                <span>Termin / Frage Senden</span>
              </button>

              <a
                id="hero-praxis-location-maps-btn"
                href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#1B5E20] font-extrabold hover:bg-[#1B5E20] hover:text-[#E8F5E9] border-2 border-[#1B5E20] transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base text-center group"
              >
                <MapPin className="w-4 h-4 text-[#1B5E20] group-hover:text-[#66BB6A]" />
                <span>Hauptstrasse 19 (Google Maps)</span>
              </a>
            </div>

            {/* Direct Contact Numbers & Coverage */}
            <div className="pt-3 sm:pt-4 border-t border-[#A5D6A7] flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#1B5E20]">
              <a 
                href="tel:0764580442" 
                className="flex items-center gap-1.5 sm:gap-2 font-bold text-[#1B5E20] hover:text-[#66BB6A] bg-white px-3 sm:px-3.5 py-1.5 rounded-full border border-[#A5D6A7] shadow-xs text-[11px] sm:text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-[#66BB6A]" /> 076 458 04 42
              </a>
              <a 
                href="mailto:info@lebenswerk.praxismail.ch" 
                className="flex items-center gap-1.5 sm:gap-2 font-bold text-[#1B5E20] hover:text-[#66BB6A] bg-white px-3 sm:px-3.5 py-1.5 rounded-full border border-[#A5D6A7] shadow-xs text-[11px] sm:text-xs truncate max-w-full"
              >
                <Mail className="w-3.5 h-3.5 text-[#66BB6A] shrink-0" /> <span className="truncate">info@lebenswerk.praxismail.ch</span>
              </a>
              <span className="flex items-center gap-1.5 text-[#1B5E20] font-bold bg-[#E8F5E9] px-3 sm:px-3.5 py-1.5 rounded-full border border-[#A5D6A7] text-[11px] sm:text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#66BB6A]" /> Biberist & Hausbesuche
              </span>
            </div>

          </div>

          {/* Visual Column & Overlap Layout (5 cols) */}
          <div className="col-span-12 lg:col-span-5 relative mt-4 lg:mt-0">
            {/* Main Soft Container */}
            <div className="w-full bg-white border border-[#A5D6A7] rounded-3xl sm:rounded-[44px] shadow-2xl shadow-[#1B5E20]/10 p-5 sm:p-7 relative overflow-hidden">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#A5D6A7] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border border-[#A5D6A7] bg-white p-0.5 shrink-0">
                    <img 
                      src="/src/assets/images/lebenswerk_logo_1787647029212.jpg" 
                      alt="Logo" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#1B5E20]">Kontakt & Terminanfrage</h3>
                    <p className="text-xs text-[#1B5E20]/70">Praxis Biberist oder Hausbesuch</p>
                  </div>
                </div>
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#66BB6A]" />
                </span>
              </div>

              {/* Location Toggle in Quick Form */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-[#E8F5E9] rounded-2xl border border-[#A5D6A7]">
                <button
                  type="button"
                  onClick={() => setSelectedLocation('practice')}
                  className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedLocation === 'practice'
                      ? 'bg-[#1B5E20] text-[#E8F5E9] shadow-sm'
                      : 'text-[#1B5E20] hover:bg-white/60'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Praxis Biberist</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLocation('home')}
                  className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedLocation === 'home'
                      ? 'bg-[#1B5E20] text-[#E8F5E9] shadow-sm'
                      : 'text-[#1B5E20] hover:bg-white/60'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Hausbesuch</span>
                </button>
              </div>

              {/* Booking Action */}
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4 text-[#66BB6A]" />
                    <span>Verfügbare Behandlungszeiten:</span>
                  </div>
                  <div className="text-[11px] text-[#1B5E20]/90 space-y-0.5">
                    <p>• <strong>Donnerstag:</strong> 18:00 – 21:00 Uhr</p>
                    <p>• <strong>Freitag:</strong> 17:00 – 20:00 Uhr</p>
                    <p>• <strong>Samstag:</strong> 08:00 – 14:00 Uhr</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="hero-find-slots-btn"
                  onClick={() => onOpenBooking(undefined, selectedDate)}
                  className="w-full py-3.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Anfrage / Termin jetzt senden</span>
                  <ArrowRight className="w-4 h-4 text-[#66BB6A]" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

