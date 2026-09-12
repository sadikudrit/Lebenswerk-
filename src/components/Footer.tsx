import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  Building,
  Home,
  ExternalLink,
  Lock,
  Edit3
} from 'lucide-react';
import { brandLogo } from '../assets';
import { useSiteContent } from '../context/SiteContentContext';
import { InlineEditButton } from './InlineEditButton';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAiTriage?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
}) => {
  const { content, isAuthenticated, openCmsModal, openLoginModal } = useSiteContent();

  const footerData = content.footer || {
    bannerBadge: `Praxis ${content.contact.zipCity.split(' ')[1] || 'Biberist'} & Hausbesuche`,
    bannerTitle: 'Möchten Sie einen Termin vereinbaren?',
    bannerText: `Behandlungen an der ${content.contact.street} in ${content.contact.zipCity} oder bequeme Hausbesuche bei Ihnen zu Hause. Individuell und zuverlässig.`,
    bookingButtonText: 'Termin Jetzt Buchen',
    phoneButtonPrefix: 'anrufen',
    brandDescription: `Individuelle, persönliche und zuverlässige physiotherapeutische Betreuung an der ${content.contact.street} in ${content.contact.zipCity} sowie Domizilbehandlungen in der gesamten Region Solothurn & Biberist.`,
    locationBoxTitle: 'Standort & Region',
    locationBoxText: `${content.contact.street}, ${content.contact.zipCity} sowie mobile Hausbesuche im gesamten Kanton Solothurn.`,
    whatsappButtonText: 'Direkt via WhatsApp schreiben',
    hoursBoxTitle: 'Öffnungszeiten & Termine',
    hoursOnlineBookingText: 'Termin jetzt online anfragen',
    partnerBadge: 'Offizieller Verbandspartner',
    partnerSubtext: 'Mitglied beim Schweizer Physiotherapie Verband (physioswiss)',
    copyrightText: 'LEBENSWERK Physiotherapie',
    bottomSubtitle: 'Dipl. Physiotherapie HF/FH',
  };

  return (
    <footer id="contact" className="bg-[#1B5E20] text-[#E8F5E9] border-t border-[#A5D6A7]/30 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Contact Strip Banner */}
        <div className="p-8 rounded-3xl bg-[#E8F5E9] border border-[#A5D6A7] mb-14 grid lg:grid-cols-12 gap-8 items-center relative group">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A5D6A7] text-[#1B5E20] text-xs font-bold uppercase tracking-wider">
                <Building className="w-3.5 h-3.5" /> {footerData.bannerBadge}
              </span>
              <InlineEditButton section="footer" label="Termin-Banner & Footer bearbeiten" className="text-emerald-800" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B5E20] tracking-tight">
              {footerData.bannerTitle}
            </h3>
            <p className="text-sm text-[#1B5E20]/80 max-w-xl whitespace-pre-line">
              {footerData.bannerText}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4 text-[#66BB6A]" />
              <span>{footerData.bookingButtonText || 'Termin Jetzt Buchen'}</span>
            </button>

            <a
              href={`tel:${content.contact.phoneRaw}`}
              className="px-6 py-3.5 rounded-full bg-white hover:bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] font-bold text-sm transition-all flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-4 h-4 text-[#1B5E20]" />
              <span>{content.contact.phoneDisplay} {footerData.phoneButtonPrefix || 'anrufen'}</span>
            </a>
          </div>
        </div>

        {/* 3 Column Balanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#A5D6A7]/30">
          
          {/* Brand Column */}
          <div className="lg:col-span-6 space-y-4">
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
                <span className="font-display font-extrabold text-2xl tracking-tighter text-[#E8F5E9] block leading-none">
                  LEBENSWERK<span className="text-[#66BB6A]">.</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5D6A7] block mt-0.5">
                  Physiotherapie Biberist
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-[#E8F5E9]/80 leading-relaxed max-w-md whitespace-pre-line">
                {footerData.brandDescription}
              </p>
              <InlineEditButton section="footer" label="Footer-Texte bearbeiten" />
            </div>

            <div className="pt-2 text-xs space-y-2 text-[#E8F5E9]/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#66BB6A] underline decoration-[#66BB6A]/50 transition-colors flex items-center gap-1 font-semibold"
                >
                  {content.contact.street}, {content.contact.zipCity} (Google Maps) ↗
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <span>Mobile Hausbesuche in der {content.contact.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <a href={`tel:${content.contact.phoneRaw}`} className="hover:text-[#66BB6A] font-bold">{content.contact.phoneDisplay}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <a href={`mailto:${content.contact.email}`} className="hover:text-[#66BB6A]">{content.contact.email}</a>
              </div>
              <div className="flex items-center gap-2 font-bold text-[#66BB6A]">
                <Clock className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <span>Do {content.contact.hoursThursday} • Fr {content.contact.hoursFriday} • Sa {content.contact.hoursSaturday}</span>
              </div>
            </div>
          </div>

          {/* Patient Actions & Hours */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold text-[#E8F5E9] uppercase tracking-wider text-xs font-display">
              {footerData.hoursBoxTitle || 'Öffnungszeiten & Termine'}
            </h4>
            <ul className="space-y-2 text-[#E8F5E9]/80">
              <li className="flex justify-between font-medium py-1 border-b border-[#A5D6A7]/20">
                <span>Donnerstag:</span>
                <span className="font-bold text-[#66BB6A]">{content.contact.hoursThursday}</span>
              </li>
              <li className="flex justify-between font-medium py-1 border-b border-[#A5D6A7]/20">
                <span>Freitag:</span>
                <span className="font-bold text-[#66BB6A]">{content.contact.hoursFriday}</span>
              </li>
              <li className="flex justify-between font-medium py-1 border-b border-[#A5D6A7]/20">
                <span>Samstag:</span>
                <span className="font-bold text-[#66BB6A]">{content.contact.hoursSaturday}</span>
              </li>
              <li className="pt-2">
                <button onClick={onOpenBooking} className="text-[#66BB6A] hover:underline cursor-pointer font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{footerData.hoursOnlineBookingText || 'Termin jetzt online anfragen'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Service Notice */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold text-[#E8F5E9] uppercase tracking-wider text-xs font-display">
              {footerData.locationBoxTitle || 'Standort & Region'}
            </h4>
            <div className="p-4 rounded-2xl bg-[#E8F5E9]/10 border border-[#A5D6A7]/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[#66BB6A] font-bold text-sm">
                <Building className="w-4 h-4" />
                <span>Praxis & Domizil</span>
              </div>
              <p className="text-xs text-[#E8F5E9]/80 leading-relaxed">
                {footerData.locationBoxText}
              </p>
              <div className="pt-1">
                <a
                  href={`https://wa.me/${(content.contact.whatsappNumber || '+41764580442').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(content.contact.whatsappDefaultText || 'Guten Tag Herr Musliu, ich möchte gerne einen Physiotherapie-Termin anfragen.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#1EBE5D] transition-colors"
                >
                  <span>{footerData.whatsappButtonText || 'Direkt via WhatsApp schreiben'}</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Continuous Sliding Partner Logos Banner */}
        <div className="pt-10 pb-6 border-b border-[#A5D6A7]/20">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A5D6A7]">
              {footerData.partnerBadge || 'Offizieller Verbandspartner'}
            </span>
            <span className="text-[11px] text-[#E8F5E9]/70 hidden sm:inline-block">
              {footerData.partnerSubtext || 'Mitglied beim Schweizer Physiotherapie Verband (physioswiss)'}
            </span>
          </div>

          {/* Infinite Marquee Wrapper with soft edge fades */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-black/15 border border-[#A5D6A7]/20 py-4 px-2">
            {/* Left & Right gradient masks for smooth entering/exiting */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#1B5E20] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#1B5E20] to-transparent z-10" />

            {/* Marquee Track */}
            <div className="animate-marquee items-center gap-8 sm:gap-12">
              {/* Set 1 */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <div key={`partner-1-${idx}`} className="flex items-center gap-8 sm:gap-12 shrink-0">
                  <div className="flex items-center gap-3.5 bg-white hover:bg-slate-50 px-5 sm:px-7 py-3 rounded-2xl border border-white/80 shadow-md transition-all transform hover:scale-[1.03]">
                    <div className="h-8 sm:h-10 w-24 sm:w-32 flex items-center justify-center shrink-0">
                      <img 
                        src="/physioswiss.svg" 
                        alt="physioswiss - Schweizer Physiotherapie Verband" 
                        className="h-full w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Set 2 (Duplicate for infinite seamless loop) */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <div key={`partner-2-${idx}`} className="flex items-center gap-8 sm:gap-12 shrink-0">
                  <div className="flex items-center gap-3.5 bg-white hover:bg-slate-50 px-5 sm:px-7 py-3 rounded-2xl border border-white/80 shadow-md transition-all transform hover:scale-[1.03]">
                    <div className="h-8 sm:h-10 w-24 sm:w-32 flex items-center justify-center shrink-0">
                      <img 
                        src="/physioswiss.svg" 
                        alt="physioswiss - Schweizer Physiotherapie Verband" 
                        className="h-full w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Credits & Discrete Doctor CMS Access Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8F5E9]/60">
          <div>
            © {new Date().getFullYear()} {footerData.copyrightText || 'LEBENSWERK Physiotherapie'} • {content.contact.street}, {content.contact.zipCity}.
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span>{content.contact.zipCity}, Schweiz</span>
            <span>•</span>
            <span>{footerData.bottomSubtitle || 'Dipl. Physiotherapie HF/FH'}</span>
            <span>•</span>
            <button
              onClick={() => (isAuthenticated ? openCmsModal('footer') : openLoginModal())}
              className="inline-flex items-center gap-1.5 text-emerald-300/80 hover:text-emerald-200 underline decoration-emerald-400/40 hover:decoration-emerald-300 transition-colors cursor-pointer"
            >
              {isAuthenticated ? (
                <>
                  <Edit3 className="w-3 h-3 text-[#66BB6A]" />
                  <span>WordPress-Editor öffnen</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Praxis-Login (CMS)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
