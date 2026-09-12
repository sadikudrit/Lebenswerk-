import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  ExternalLink,
  HeartPulse
} from 'lucide-react';
import { Service } from '../types';
import { brandLogo } from '../assets';
import { useSiteContent } from '../context/SiteContentContext';
import { InlineEditButton } from './InlineEditButton';

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
  const { content } = useSiteContent();
  const [selectedLocation, setSelectedLocation] = useState<'practice' | 'home'>('practice');
  const [selectedDate, setSelectedDate] = useState<string>(getNextAvailableWorkingDate());

  return (
    <section id="about" className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden bg-[#E8F5E9] border-b border-[#A5D6A7]">
      
      {/* Background Animated Subtle Float Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.5, 0.35],
          x: [0, 15, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-[#A5D6A7]/40 rounded-full blur-3xl pointer-events-none -z-10" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.12, 1],
          opacity: [0.3, 0.45, 0.3],
          y: [0, -20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 -left-20 w-80 h-80 bg-[#66BB6A]/20 rounded-full blur-3xl pointer-events-none -z-10" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Asymmetrical Grid */}
        <div className="grid grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Text Column (7 cols) with Staggered Motion */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="col-span-12 lg:col-span-7 hero-text-container space-y-4 sm:space-y-6"
          >
            
            {/* Tag Badge with Live Pulsing Green Ring */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white border border-[#A5D6A7] text-[#1B5E20] text-[11px] sm:text-xs font-bold tracking-wider shadow-xs max-w-full"
            >
              <span className="relative flex h-3 w-3 items-center justify-center shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#66BB6A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B5E20]" />
              </span>
              <span className="truncate">{content.hero.badgeText}</span>
            </motion.div>

            {/* Main Display Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-[#1B5E20] tracking-tight sm:tracking-tighter leading-[1.1] sm:leading-[0.98] break-words"
            >
              {content.hero.headlineMain}<br />
              <motion.span 
                className="text-[#66BB6A] inline-block"
                animate={{ color: ["#66BB6A", "#2E7D32", "#66BB6A"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                {content.hero.headlineHighlight}
              </motion.span>
            </motion.h1>

            {/* Organic Description with Inline CMS Trigger */}
            <div className="relative group">
              <InlineEditButton section="hero" label="Absätze anpassen" className="mb-2" />
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-base sm:text-lg lg:text-xl text-[#1B5E20]/85 leading-relaxed max-w-2xl font-normal space-y-2.5"
              >
                <span className="block font-medium text-[#1B5E20] whitespace-pre-line">
                  {content.hero.paragraph1}
                </span>
                <span className="block text-sm sm:text-base lg:text-lg text-[#1B5E20]/80 whitespace-pre-line">
                  {content.hero.paragraph2}
                </span>
              </motion.p>
            </div>

            {/* Schedule Highlights Pill Grid with Animated Heartbeat Wave */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#A5D6A7] shadow-xs space-y-2 max-w-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1B5E20] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#66BB6A]" /> {content.hero.scheduleTitle || 'Arbeitszeiten & Termine:'}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-md border border-[#A5D6A7]">
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    <HeartPulse className="w-3 h-3 text-[#1B5E20]" />
                  </motion.span>
                  Online buchbar
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-[#1B5E20]">
                <div className="p-2 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7]/60 text-center hover:bg-[#A5D6A7]/30 transition-colors">
                  <span className="block text-[11px] text-[#1B5E20]/70 font-semibold">Donnerstag</span>
                  <span>{content.hero.scheduleThursday.replace(/Donnerstag:\s*/i, '').replace(/\s*Uhr/i, '') || '18:00 – 21:00'}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7]/60 text-center hover:bg-[#A5D6A7]/30 transition-colors">
                  <span className="block text-[11px] text-[#1B5E20]/70 font-semibold">Freitag</span>
                  <span>{content.hero.scheduleFriday.replace(/Freitag:\s*/i, '').replace(/\s*Uhr/i, '') || '17:00 – 20:00'}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7]/60 text-center hover:bg-[#A5D6A7]/30 transition-colors">
                  <span className="block text-[11px] text-[#1B5E20]/70 font-semibold">Samstag</span>
                  <span>{content.hero.scheduleSaturday.replace(/Samstag:\s*/i, '').replace(/\s*Uhr/i, '') || '08:00 – 14:00'}</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons: Schedule Appointment & Google Maps Location */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="hero-schedule-appointment-btn"
                onClick={() => onOpenBooking()}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#1B5E20] text-[#E8F5E9] font-extrabold hover:bg-[#1B5E20]/90 transition-all shadow-lg shadow-[#1B5E20]/20 cursor-pointer flex items-center justify-center gap-2.5 text-sm sm:text-base text-center"
              >
                <Calendar className="w-4 h-4 text-[#66BB6A]" />
                <span>Termin / Frage Senden</span>
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="hero-praxis-location-maps-btn"
                href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#1B5E20] font-extrabold hover:bg-[#1B5E20] hover:text-[#E8F5E9] border-2 border-[#1B5E20] transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base text-center group"
              >
                <MapPin className="w-4 h-4 text-[#1B5E20] group-hover:text-[#66BB6A]" />
                <span>Hauptstrasse 19 (Google Maps)</span>
              </motion.a>
            </motion.div>

            {/* Direct Contact Numbers & Coverage */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="pt-3 sm:pt-4 border-t border-[#A5D6A7] flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#1B5E20]"
            >
              <a 
                href={`tel:${content.contact.phoneRaw}`} 
                className="flex items-center gap-1.5 sm:gap-2 font-bold text-[#1B5E20] hover:text-[#66BB6A] bg-white px-3 sm:px-3.5 py-1.5 rounded-full border border-[#A5D6A7] shadow-xs text-[11px] sm:text-xs hover:shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#66BB6A]" /> {content.contact.phoneDisplay}
              </a>
              <a 
                href={`mailto:${content.contact.email}`} 
                className="flex items-center gap-1.5 sm:gap-2 font-bold text-[#1B5E20] hover:text-[#66BB6A] bg-white px-3 sm:px-3.5 py-1.5 rounded-full border border-[#A5D6A7] shadow-xs text-[11px] sm:text-xs truncate max-w-full hover:shadow-sm transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#66BB6A] shrink-0" /> <span className="truncate">{content.contact.email}</span>
              </a>
              <span className="flex items-center gap-1.5 text-[#1B5E20] font-bold bg-[#E8F5E9] px-3 sm:px-3.5 py-1.5 rounded-full border border-[#A5D6A7] text-[11px] sm:text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#66BB6A]" /> Biberist & Hausbesuche
              </span>
            </motion.div>

          </motion.div>

          {/* Visual Column & Overlap Layout (5 cols) with Floating Animation */}
          <div className="col-span-12 lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Floating 24/7 Booking Badge at Bottom Right */}
            <motion.div 
              animate={{ 
                y: [0, 8, 0],
                rotate: [0.5, -0.5, 0.5]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -bottom-4 -right-2 sm:-right-4 z-20 bg-white text-[#1B5E20] px-3.5 py-2 rounded-2xl shadow-xl border-2 border-[#A5D6A7] text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#66BB6A] shrink-0" />
              <span>Online-Anfrage • 24/7</span>
            </motion.div>

            {/* Main Soft Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full bg-white border-2 border-[#A5D6A7] rounded-3xl sm:rounded-[44px] shadow-2xl shadow-[#1B5E20]/10 p-5 sm:p-7 relative overflow-hidden"
            >
              
              <div className="flex items-center justify-between pb-4 border-b border-[#A5D6A7] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border border-[#A5D6A7] bg-white p-0.5 shrink-0">
                    <img 
                      src={brandLogo} 
                      alt="LEBENSWERK Logo" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/lebenswerk_logo.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#1B5E20]">Kontakt & Terminanfrage</h3>
                    <p className="text-xs text-[#1B5E20]/70">Praxis Biberist oder Hausbesuch</p>
                  </div>
                </div>
                <motion.span 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] flex items-center justify-center shrink-0"
                >
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#66BB6A]" />
                </motion.span>
              </div>

              {/* Location Toggle in Quick Form */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-[#E8F5E9] rounded-2xl border border-[#A5D6A7]">
                <button
                  type="button"
                  onClick={() => setSelectedLocation('practice')}
                  className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  id="hero-find-slots-btn"
                  onClick={() => onOpenBooking(undefined, selectedDate)}
                  className="w-full py-3.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Anfrage / Termin jetzt senden</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4 text-[#66BB6A]" />
                  </motion.span>
                </motion.button>
              </div>

            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};

