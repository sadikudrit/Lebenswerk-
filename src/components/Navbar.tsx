import React, { useState } from 'react';
import { 
  Calendar, 
  Bell, 
  Phone, 
  Clock, 
  MapPin,
  ExternalLink,
  Mail,
  Menu,
  X,
  ShieldCheck,
  Building,
  Home
} from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAiTriage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#E8F5E9]/95 border-b border-[#A5D6A7] transition-all w-full overflow-hidden">
      {/* Top Announcement Strip with Practice Schedule & Direct Contacts */}
      <div className="bg-[#1B5E20] text-[#E8F5E9] text-xs py-1.5 px-3 sm:px-6 border-b border-white/10 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Schedule status & location */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#66BB6A]/20 text-[#66BB6A] font-bold text-[10px] sm:text-[11px] border border-[#66BB6A]/40 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#66BB6A] animate-ping" />
              Do, Fr & Sa
            </span>
            <span className="text-[#E8F5E9]/90 text-[10px] sm:text-xs truncate hidden sm:inline">
              Do 18–21 • Fr 17–20 • Sa 08–14 • Hauptstr. 19, Biberist
            </span>
            <span className="text-[#E8F5E9]/90 text-[10px] truncate sm:hidden">
              Hauptstr. 19, Biberist
            </span>
          </div>

          {/* Direct Contacts */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-[#E8F5E9]/90 text-[11px] sm:text-xs shrink-0">
            <a 
              href="mailto:info@lebenswerk.praxismail.ch"
              className="hidden lg:inline-flex items-center gap-1 text-[#E8F5E9]/90 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#66BB6A]" /> info@lebenswerk.praxismail.ch
            </a>
            <a 
              href="tel:0764580442" 
              className="inline-flex items-center gap-1 text-[#66BB6A] hover:text-white font-bold transition-colors text-[11px] sm:text-xs"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" /> 076 458 04 42
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-18 md:h-20 gap-2">
          
          {/* Brand Logo - Official Lebenswerk Logo + Text */}
          <div 
            id="brand-logo" 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsMobileMenuOpen(false);
            }} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
          >
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl overflow-hidden border border-[#A5D6A7] bg-white shadow-xs flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform shrink-0">
              <img 
                src="/src/assets/images/lebenswerk_logo_1787647029212.jpg" 
                alt="LEBENSWERK Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-display font-extrabold text-base sm:text-2xl lg:text-3xl tracking-tighter text-[#1B5E20] block leading-none truncate">
                LEBENSWERK<span className="text-[#66BB6A]">.</span>
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#1B5E20]/70 block mt-0.5 truncate">
                Physiotherapie Biberist
              </span>
            </div>
          </div>

          {/* Prominent Practice Location & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Direct Google Maps Biberist Practice Location Button */}
            <a
              id="header-praxis-maps-btn"
              href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
              target="_blank"
              rel="noopener noreferrer"
              title="Praxis Hauptstrasse 19, 4562 Biberist auf Google Maps öffnen"
              className="hidden md:inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white hover:bg-[#1B5E20] text-[#1B5E20] hover:text-[#E8F5E9] border-2 border-[#1B5E20] text-xs sm:text-sm font-extrabold shadow-xs hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] group cursor-pointer"
            >
              <span className="p-0.5 sm:p-1 rounded-full bg-[#E8F5E9] text-[#1B5E20] group-hover:bg-[#66BB6A] group-hover:text-[#1B5E20] transition-colors">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1B5E20]" />
              </span>
              <span className="hidden xl:inline">Hauptstr. 19, 4562 Biberist</span>
              <span className="xl:hidden">Praxis Biberist</span>
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70 group-hover:opacity-100" />
            </a>

            {/* Schedule Appointment CTA */}
            <button
              id="nav-book-now-cta"
              onClick={onOpenBooking}
              className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 lg:px-6 py-1.5 sm:py-2.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-extrabold text-[11px] sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-[1.02] shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#66BB6A] shrink-0" />
              <span className="hidden xs:inline sm:inline">Kontakt & Termin</span>
              <span className="xs:hidden sm:hidden">Termin</span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Menü schliessen" : "Menü öffnen"}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-white border border-[#A5D6A7] text-[#1B5E20] hover:bg-[#E8F5E9] transition-colors cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer / Slide-Down Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b-2 border-[#A5D6A7] shadow-xl animate-in slide-in-from-top duration-200">
          <div className="p-4 space-y-3">
            
            {/* Quick Practice Info Card */}
            <div className="p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-2 text-xs text-[#1B5E20]">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#66BB6A]" />
                  Praxis Hauptstrasse 19, Biberist
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#1B5E20] text-white text-[10px]">
                  Biberist & Mobil
                </span>
              </div>
              <p className="text-[11px] text-[#1B5E20]/80">
                <strong>Öffnungszeiten:</strong> Do 18:00–21:00 • Fr 17:00–20:00 • Sa 08:00–14:00
              </p>
            </div>

            {/* Direct Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:0764580442"
                className="py-3 px-3 rounded-xl bg-[#1B5E20] text-[#E8F5E9] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm text-center"
              >
                <Phone className="w-4 h-4 text-[#66BB6A]" />
                <span>076 458 04 42</span>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl bg-white border-2 border-[#1B5E20] text-[#1B5E20] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs text-center"
              >
                <MapPin className="w-4 h-4 text-[#1B5E20]" />
                <span>Google Maps</span>
              </a>
            </div>

            {/* Navigation Anchor Links */}
            <div className="pt-2 border-t border-[#A5D6A7]/60 space-y-1">
              <a
                href="#specialists"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-xs font-bold text-[#1B5E20] hover:bg-[#E8F5E9]"
              >
                👨‍⚕️ Über Vigan Musliu (Dipl. Physiotherapeut)
              </a>
              <a
                href="#services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-xs font-bold text-[#1B5E20] hover:bg-[#E8F5E9]"
              >
                🩺 Behandlungsangebot & Domizilbehandlung
              </a>
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-xs font-bold text-[#1B5E20] hover:bg-[#E8F5E9]"
              >
                📍 Standort, Anfahrt & Kontakt
              </a>
            </div>

            {/* Schedule Button inside Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Calendar className="w-4 h-4 text-[#66BB6A]" />
              <span>Kontakt & Terminanfrage</span>
            </button>

          </div>
        </div>
      )}
    </header>
  );
};
