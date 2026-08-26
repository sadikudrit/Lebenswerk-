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
  ExternalLink
} from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAiTriage?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
}) => {
  return (
    <footer id="contact" className="bg-[#1B5E20] text-[#E8F5E9] border-t border-[#A5D6A7]/30 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Contact Strip Banner */}
        <div className="p-8 rounded-3xl bg-[#E8F5E9] border border-[#A5D6A7] mb-14 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A5D6A7] text-[#1B5E20] text-xs font-bold uppercase tracking-wider">
              <Building className="w-3.5 h-3.5" /> Praxis Biberist & Hausbesuche
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B5E20] tracking-tight">
              Möchten Sie einen Termin vereinbaren?
            </h3>
            <p className="text-sm text-[#1B5E20]/80 max-w-xl">
              Behandlungen an der Hauptstrasse 19 in 4562 Biberist oder bequeme Hausbesuche bei Ihnen zu Hause. Individuell und zuverlässig.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4 text-[#66BB6A]" />
              <span>Termin Jetzt Buchen</span>
            </button>

            <a
              href="tel:0764580442"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] font-bold text-sm transition-all flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-4 h-4 text-[#1B5E20]" />
              <span>076 458 04 42 anrufen</span>
            </a>
          </div>
        </div>

        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#A5D6A7]/30">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden border border-[#A5D6A7] bg-white p-0.5 shrink-0">
                <img 
                  src="/src/assets/images/lebenswerk_logo_1787647029212.jpg" 
                  alt="LEBENSWERK Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
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

            <p className="text-xs text-[#E8F5E9]/80 leading-relaxed max-w-md">
              Individuelle, persönliche und zuverlässige physiotherapeutische Betreuung an der Hauptstrasse 19 in 4562 Biberist sowie Domizilbehandlungen in der gesamten Region Solothurn & Biberist.
            </p>

            <div className="pt-2 text-xs space-y-2 text-[#E8F5E9]/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#66BB6A] underline decoration-[#66BB6A]/50 transition-colors flex items-center gap-1 font-semibold"
                >
                  Hauptstrasse 19, 4562 Biberist (Google Maps) ↗
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <span>Mobile Hausbesuche in der Region Solothurn & Biberist</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <a href="tel:0764580442" className="hover:text-[#66BB6A] font-bold">076 458 04 42</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <a href="mailto:info@lebenswerk.praxismail.ch" className="hover:text-[#66BB6A]">info@lebenswerk.praxismail.ch</a>
              </div>
              <div className="flex items-center gap-2 font-bold text-[#66BB6A]">
                <Clock className="w-4 h-4 text-[#66BB6A] shrink-0" />
                <span>Do 18:00–21:00 • Fr 17:00–20:00 • Sa 08:00–14:00</span>
              </div>
            </div>
          </div>

          {/* Treatments Links */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold text-[#E8F5E9] uppercase tracking-wider text-xs font-display">
              Behandlungen & Therapien
            </h4>
            <ul className="space-y-2 text-[#E8F5E9]/80">
              <li><a href="#services" className="hover:text-[#66BB6A] transition-colors">01 Klassische Physiotherapie</a></li>
              <li><a href="#services" className="hover:text-[#66BB6A] transition-colors">02 Manuelle Therapie & Mobilisation</a></li>
              <li><a href="#services" className="hover:text-[#66BB6A] transition-colors">03 Schmerztherapie & Triggerpunkte</a></li>
              <li><a href="#services" className="hover:text-[#66BB6A] transition-colors">04 Neurologische Rehabilitation</a></li>
              <li><a href="#services" className="hover:text-[#66BB6A] transition-colors">05 Geriatrische Physiotherapie & Sturzprävention</a></li>
              <li><a href="#services" className="hover:text-[#66BB6A] transition-colors">06 Postoperative Rehabilitation</a></li>
            </ul>
          </div>

          {/* Patient Actions */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <h4 className="font-bold text-[#E8F5E9] uppercase tracking-wider text-xs font-display">
              Praxiszeiten
            </h4>
            <ul className="space-y-1.5 text-[#E8F5E9]/80">
              <li className="flex justify-between font-medium">
                <span>Donnerstag:</span>
                <span className="font-bold text-[#66BB6A]">18:00–21:00</span>
              </li>
              <li className="flex justify-between font-medium">
                <span>Freitag:</span>
                <span className="font-bold text-[#66BB6A]">17:00–20:00</span>
              </li>
              <li className="flex justify-between font-medium">
                <span>Samstag:</span>
                <span className="font-bold text-[#66BB6A]">08:00–14:00</span>
              </li>
              <li className="pt-2">
                <button onClick={onOpenBooking} className="text-[#66BB6A] hover:underline cursor-pointer font-bold">
                  → Termin jetzt online buchen
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Service Notice */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <h4 className="font-bold text-[#E8F5E9] uppercase tracking-wider text-xs font-display">
              Standort & Region
            </h4>
            <div className="p-3.5 rounded-2xl bg-[#E8F5E9]/10 border border-[#A5D6A7]/30 space-y-2">
              <div className="flex items-center gap-1.5 text-[#66BB6A] font-bold">
                <Building className="w-4 h-4" />
                <span>Praxis & Domizil</span>
              </div>
              <p className="text-[11px] text-[#E8F5E9]/80 leading-normal">
                Hauptstrasse 19, 4562 Biberist sowie mobile Hausbesuche in der gesamten Region Solothurn.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8F5E9]/60">
          <div>
            © {new Date().getFullYear()} LEBENSWERK Physiotherapie • Hauptstrasse 19, 4562 Biberist.
          </div>
          <div className="flex items-center gap-6">
            <span>Biberist & Solothurn, Schweiz</span>
            <span>•</span>
            <span>Dipl. Physiotherapie HF/FH</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
