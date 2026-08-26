import React from 'react';
import { 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  Globe,
  Home,
  Building,
  Hospital,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  HeartPulse,
  UserCheck,
  MapPin
} from 'lucide-react';
import { Physiotherapist } from '../types';

interface SpecialistsSectionProps {
  specialists: Physiotherapist[];
  onSelectSpecialistForBooking: (specialistId: string) => void;
}

export const SpecialistsSection: React.FC<SpecialistsSectionProps> = ({
  specialists,
  onSelectSpecialistForBooking,
}) => {
  // Primary Lead Doctor (defaults to first specialist or fallback profile)
  const leadDoctor = specialists[0] || {
    id: "doc-1",
    name: "Vigan Musliu",
    title: "Dipl. Physiotherapeut HF/FH & Praxisleiter",
    credentials: [
      "Dipl. Physiotherapeut HF/FH",
      "SRK Anerkannt (Schweizerisches Rotes Kreuz)",
      "Mitglied Physioswiss (Schweizer Physiotherapie Verband)",
      "Zertifiziert in Manueller Therapie & Neurologischer Rehabilitation"
    ],
    experienceYears: 12,
    rating: 4.99,
    reviewsCount: 180,
    avatar: "/src/assets/images/doctor_vigan_musliu_1787647012290.jpg",
    bio: "Mit fundierter klinischer Erfahrung und Spezialisierung in evidenzbasierter Physiotherapie und Rehabilitation bietet Vigan Musliu gezielte, patientenorientierte Behandlungen an der Hauptstrasse 19 in 4562 Biberist sowie mobile Hausbesuche in der Region.",
    specialties: [
      "Klassische Physiotherapie",
      "Manuelle Gelenkmobilisation",
      "Rücken- & Wirbelsäulentherapie",
      "Neurologische Rehabilitation",
      "Postoperative Rehabilitation",
      "Triggerpunkt- & Schmerztherapie"
    ],
    education: "Dipl. Physiotherapeut HF/FH • Schweizerisches Rotes Kreuz (SRK) Anerkannt",
    availableDays: ["Thu", "Fri", "Sat"],
    consultationFee: 130,
    languages: ["Deutsch (Muttersprache)", "Englisch", "Französisch"],
    nextAvailable: "Do 18:00–21:00 | Fr 17:00–20:00 | Sa 08:00–14:00"
  };

  return (
    <section id="specialists" className="py-14 sm:py-20 lg:py-28 bg-[#E8F5E9] border-t border-[#A5D6A7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white text-[#1B5E20] text-xs font-bold uppercase tracking-wider border border-[#A5D6A7] shadow-xs">
            <Building className="w-4 h-4 text-[#66BB6A]" />
            <span>Praxis Biberist & Domizilbehandlung</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#1B5E20] tracking-tight">
            Ihr Dipl. Physiotherapeut
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-[#1B5E20]/80 font-normal leading-relaxed">
            Schweizer Qualitätsstandards und persönliche Betreuung an der <strong>Hauptstrasse 19 in 4562 Biberist</strong> sowie bequeme Hausbesuche bei Ihnen zu Hause.
          </p>
        </div>

        {/* Featured Big Doctor Profile Card */}
        <div className="bg-white border-2 border-[#A5D6A7] rounded-3xl sm:rounded-[44px] shadow-xl overflow-hidden mb-8 sm:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 p-5 sm:p-8 lg:p-12 items-center">
            
            {/* Big Doctor Picture Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-xs sm:max-w-md">
                
                {/* Doctor Main Large Photo Frame */}
                <div className="w-full aspect-[3/4] sm:aspect-[4/5] rounded-3xl sm:rounded-[36px] overflow-hidden border-4 border-[#E8F5E9] shadow-2xl relative bg-[#E8F5E9]">
                  <img
                    src="/public/doctor_vigan.jpg"
                    alt={leadDoctor.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-500"
                  />
                  
                  {/* Subtle gradient vignette at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B5E20]/75 via-transparent to-transparent pointer-events-none" />

                  {/* Overlaid Doctor Badge in Photo */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                    <div className="flex items-center gap-1 text-amber-300 font-extrabold text-xs sm:text-sm mb-0.5">
                      <Star className="w-4 h-4 fill-amber-300" />
                      <span>{leadDoctor.rating} Bewertung</span>
                      <span className="text-white/80 text-[11px] sm:text-xs font-medium">({leadDoctor.reviewsCount} Rezensionen)</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#E8F5E9] font-medium">
                      {leadDoctor.experienceYears}+ Jahre klinische Erfahrung
                    </p>
                  </div>
                </div>

                {/* Status Float Badge */}
                <div className="absolute -top-2.5 sm:-top-3 -right-2 sm:-right-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-[#1B5E20] text-[#E8F5E9] text-xs font-bold shadow-lg flex items-center gap-1.5 sm:gap-2 border-2 border-white">
                  <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#66BB6A]" />
                  <span>Dipl. Physiotherapeut HF/FH</span>
                </div>

                {/* Swiss Accreditations Under Photo */}
                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-[10px] sm:text-[11px] font-bold text-[#1B5E20]">
                    🏥 Praxis Biberist
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-[10px] sm:text-[11px] font-bold text-[#1B5E20]">
                    🏡 Mobile Hausbesuche
                  </div>
                </div>

              </div>
            </div>

            {/* Doctor Description & Clinical Bio (7 cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Doctor Name & Title */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-[11px] sm:text-xs font-extrabold uppercase tracking-wide border border-[#A5D6A7]">
                    Praxisleiter & Dipl. Physiotherapeut
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white text-[#1B5E20] text-[11px] sm:text-xs font-bold border border-[#A5D6A7] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#66BB6A]" /> Physioswiss Mitglied
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-[#1B5E20] tracking-tight">
                  {leadDoctor.name}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-[#66BB6A] mt-0.5 sm:mt-1">
                  {leadDoctor.title}
                </p>
              </div>

              {/* Bio & Clinical Description */}
              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm lg:text-base text-[#1B5E20]/85 leading-relaxed">
                <p>
                  {leadDoctor.bio}
                </p>
                <p className="text-xs sm:text-sm text-[#1B5E20]/80">
                  Ob in der modernen Praxis an der Hauptstrasse 19 in Biberist oder im Rahmen von Domizilbehandlungen bei Ihnen zu Hause: Jede Behandlung wird individuell auf Ihre Bedürfnisse, Biomechanik und Schmerzfreiheit abgestimmt.
                </p>
              </div>

              {/* Doctor Details & Schedule Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                
                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
                    <GraduationCap className="w-4 h-4 text-[#66BB6A] shrink-0" />
                    <span>Ausbildung & Anerkennung</span>
                  </div>
                  <p className="text-xs text-[#1B5E20]/80 font-medium">
                    {leadDoctor.education}
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
                    <Globe className="w-4 h-4 text-[#66BB6A] shrink-0" />
                    <span>Sprachen</span>
                  </div>
                  <p className="text-xs text-[#1B5E20]/80 font-medium">
                    {leadDoctor.languages.join(', ')}
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
                    <Building className="w-4 h-4 text-[#66BB6A] shrink-0" />
                    <span>Behandlungsorte</span>
                  </div>
                  <p className="text-xs text-[#1B5E20]/80 font-medium">
                    Praxis Biberist (Hauptstr. 19) & Mobile Hausbesuche
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
                    <Clock className="w-4 h-4 text-[#66BB6A] shrink-0" />
                    <span>Arbeitszeiten</span>
                  </div>
                  <p className="text-xs text-[#1B5E20] font-bold">
                    Do 18:00–21:00 • Fr 17:00–20:00 • Sa 08:00–14:00
                  </p>
                </div>

              </div>

              {/* Doctor Specialties Badges */}
              <div className="space-y-2 pt-1 sm:pt-2">
                <span className="block text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                  Behandlungsschwerpunkte:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {leadDoctor.specialties.map((spec, index) => (
                    <span
                      key={index}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white border border-[#A5D6A7] text-[11px] sm:text-xs font-bold text-[#1B5E20] shadow-xs"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Direct Contact */}
              <div className="pt-3 sm:pt-4 border-t border-[#A5D6A7] flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                <button
                  id="book-lead-doctor-btn"
                  onClick={() => onSelectSpecialistForBooking(leadDoctor.id)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] text-center"
                >
                  <Calendar className="w-4 h-4 text-[#66BB6A]" />
                  <span>Termin Buchen</span>
                </button>

                <a
                  id="doctor-hospital-maps-btn"
                  href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#1B5E20] text-[#1B5E20] hover:text-[#E8F5E9] border-2 border-[#1B5E20] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs group cursor-pointer text-center"
                >
                  <MapPin className="w-4 h-4 text-[#1B5E20] group-hover:text-[#66BB6A]" />
                  <span>Praxis auf Google Maps</span>
                </a>

                <a
                  href="tel:0764580442"
                  className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-[#E8F5E9] hover:bg-white text-[#1B5E20] border border-[#A5D6A7] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center"
                >
                  <Phone className="w-4 h-4 text-[#66BB6A]" />
                  <span>076 458 04 42</span>
                </a>

                <a
                  href="mailto:info@lebenswerk.praxismail.ch"
                  className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-[#E8F5E9] hover:bg-white text-[#1B5E20] border border-[#A5D6A7] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center truncate"
                >
                  <Mail className="w-4 h-4 text-[#66BB6A] shrink-0" />
                  <span className="truncate">info@lebenswerk.praxismail.ch</span>
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
