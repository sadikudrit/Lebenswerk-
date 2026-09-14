import React from 'react';
import { motion } from 'motion/react';
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
  MapPin,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { Physiotherapist } from '../types';
import { doctorPhoto } from '../assets';
import { useSiteContent } from '../context/SiteContentContext';
import { InlineEditButton } from './InlineEditButton';

interface SpecialistsSectionProps {
  specialists: Physiotherapist[];
  onSelectSpecialistForBooking: (specialistId: string) => void;
}

export const SpecialistsSection: React.FC<SpecialistsSectionProps> = ({
  specialists,
  onSelectSpecialistForBooking,
}) => {
  const { content } = useSiteContent();
  // Primary Lead Doctor (defaults to first specialist or fallback profile)
  const leadDoctor = specialists[0] || {
    id: "doc-1",
    name: "Vigan Musliu",
    title: "Dipl. Physiotherapeut & Inhaber",
    credentials: [
      "Dipl. Physiotherapeut",
      "SRK Anerkannt (Schweizerisches Rotes Kreuz)",
      "Mitglied Physioswiss (Schweizer Physiotherapie Verband)",
      "Zertifiziert in Manueller Therapie & Rehabilitation"
    ],
    experienceYears: 12,
    rating: 4.99,
    reviewsCount: 180,
    avatar: doctorPhoto,
    bio: "Mit fundierter klinischer Erfahrung und Spezialisierung in evidenzbasierter Physiotherapie und Rehabilitation bietet Vigan Musliu gezielte, patientenorientierte Behandlungen an der Hauptstrasse 19 in 4562 Biberist sowie mobile Hausbesuche in der Region.",
    specialties: [
      "Klassische Physiotherapie",
      "Manuelle Gelenkmobilisation",
      "Rücken- & Wirbelsäulentherapie",
      "Neurologische Rehabilitation",
      "Postoperative Rehabilitation",
      "Triggerpunkt- & Schmerztherapie"
    ],
    education: "Hier sollte die Berufsbezeichnung genau so angegeben werden, wie sie auf Ihrer Schweizer Anerkennung bzw. Ihrem Diplom bestätigt ist. Wenn Ihr ausländischer Physiotherapieabschluss durch das SRK anerkannt wurde, empfiehlt sich beispielsweise eine sachliche Formulierung wie: Physiotherapeut, in der Schweiz SRK-anerkannt. Eine Institution wie ZHAW sollte nur genannt werden, wenn dort tatsächlich ein entsprechender Abschluss oder eine Weiterbildung absolviert wurde",
    availableDays: ["Thu", "Fri", "Sat"],
    consultationFee: 130,
    languages: ["Deutsch", "Englisch", "Albanisch"],
    nextAvailable: "Do 18:00–21:00 | Fr 17:00–20:00 | Sa 08:00–14:00"
  };

  return (
    <section id="specialists" className="py-14 sm:py-20 lg:py-28 bg-[#E8F5E9] border-t border-[#A5D6A7] relative overflow-hidden">
      
      {/* Ambient animated gradient circle */}
      <motion.div 
        animate={{ 
          scale: [1, 1.12, 1],
          opacity: [0.25, 0.4, 0.25]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-24 w-96 h-96 bg-[#A5D6A7]/40 rounded-full blur-3xl pointer-events-none -z-10" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 sm:space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white text-[#1B5E20] text-xs font-bold uppercase tracking-wider border border-[#A5D6A7] shadow-xs">
            <Building className="w-4 h-4 text-[#66BB6A]" />
            <span>{content.doctor.sectionBadge || 'Praxis Biberist & Domizilbehandlung'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#1B5E20] tracking-tight">
            {content.doctor.sectionTitle || 'Ihr Dipl. Physiotherapeut'}
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-[#1B5E20]/80 font-normal leading-relaxed">
            {content.doctor.sectionSubtitle}
          </p>
        </motion.div>

        {/* Featured Big Doctor Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="bg-white border-2 border-[#A5D6A7] rounded-3xl sm:rounded-[44px] shadow-xl overflow-hidden mb-8 sm:mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 p-5 sm:p-8 lg:p-12 items-center">
            
            {/* Big Doctor Picture Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-xs sm:max-w-md">
                
                {/* Doctor Main Large Photo Frame */}
                <div className="w-full aspect-[3/4] sm:aspect-[4/5] rounded-3xl sm:rounded-[36px] overflow-hidden border-4 border-[#E8F5E9] shadow-2xl relative bg-[#E8F5E9] group">
                  <img
                    src={leadDoctor.avatar || doctorPhoto}
                    alt={content.doctor.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-104 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/doctor_vigan.jpg';
                    }}
                  />
                  
                  {/* Subtle gradient vignette at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B5E20]/75 via-transparent to-transparent pointer-events-none" />

                  {/* Overlaid Doctor Name in Photo */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                    <p className="text-base sm:text-lg font-display font-extrabold text-white tracking-wide drop-shadow-sm">
                      {content.doctor.name || 'Vigan Musliu'}
                    </p>
                  </div>
                </div>

                {/* Status Float Badge with smooth floating movement */}
                <motion.div 
                  animate={{ 
                    y: [0, -6, 0] 
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -top-2.5 sm:-top-3 -right-2 sm:-right-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-[#1B5E20] text-[#E8F5E9] text-xs font-bold shadow-lg flex items-center gap-1.5 sm:gap-2 border-2 border-white"
                >
                  <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#66BB6A]" />
                  <span>{content.doctor.roleBadge || 'Dipl. Physiotherapeut • SRK-Anerkannt'}</span>
                </motion.div>

                {/* Swiss Accreditations & WhatsApp Direct Link Under Photo */}
                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-[#A5D6A7] flex items-center justify-center gap-1.5 shadow-xs">
                    <img 
                      src="/physioswiss.svg" 
                      alt="physioswiss" 
                      className="h-4 sm:h-5 w-auto object-contain"
                    />
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#1C3888]">Mitglied</span>
                  </div>
                  <a 
                    href={`https://wa.me/${(content.contact.whatsappNumber || '+41764580442').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(content.contact.whatsappDefaultText || 'Guten Tag Herr Musliu, ich möchte gerne einen Physiotherapie-Termin anfragen.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white border border-[#25D366] text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all transform hover:scale-[1.03] active:scale-[0.98]"
                    title="Direkt via WhatsApp schreiben"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>
            </div>

            {/* Doctor Description & Clinical Bio (7 cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Doctor Name & Title */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-[11px] sm:text-xs font-extrabold uppercase tracking-wide border border-[#A5D6A7]">
                    {content.doctor.roleBadge || 'Inhaber & Dipl. Physiotherapeut'}
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white text-[#1B5E20] text-[11px] sm:text-xs font-bold border border-[#A5D6A7] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#66BB6A]" /> {content.doctor.membershipBadge || 'Physioswiss Mitglied'}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-[#1B5E20] tracking-tight">
                  {content.doctor.name}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-[#66BB6A] mt-0.5 sm:mt-1">
                  {content.doctor.title}
                </p>
              </div>

              {/* Bio & Clinical Description with Inline Edit trigger */}
              <div className="relative group space-y-2">
                <InlineEditButton section="doctor" label="Biografie bearbeiten" className="mb-1" />
                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm lg:text-base text-[#1B5E20]/85 leading-relaxed">
                  <p className="whitespace-pre-line">
                    {content.doctor.bioParagraph1}
                  </p>
                  <p className="text-xs sm:text-sm text-[#1B5E20]/80 whitespace-pre-line">
                    {content.doctor.bioParagraph2}
                  </p>
                </div>
              </div>

              {/* Doctor Details & Schedule Grid */}
              <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                
                {/* Ausbildung & Anerkennung - Full width for spacious layout without oversized bold typography */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
                    <GraduationCap className="w-4 h-4 text-[#66BB6A] shrink-0" />
                    <span>Ausbildung & Anerkennung</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1B5E20]/85 font-normal leading-relaxed whitespace-pre-line">
                    {content.doctor.education}
                  </p>
                </div>

                {/* Lower 3-column row: Sprachen, Behandlungsorte & Arbeitszeiten */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  
                  {/* Sprachen - Moved downward next to Behandlungsorte & Arbeitszeiten */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
                      <Globe className="w-4 h-4 text-[#66BB6A] shrink-0" />
                      <span>Sprachen</span>
                    </div>
                    <p className="text-xs text-[#1B5E20]/80 font-medium">
                      {content.doctor.languages}
                    </p>
                  </div>

                  {/* Behandlungsorte */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
                      <Building className="w-4 h-4 text-[#66BB6A] shrink-0" />
                      <span>Behandlungsorte</span>
                    </div>
                    <p className="text-xs text-[#1B5E20]/80 font-medium leading-snug">
                      {content.contact.street}, {content.contact.zipCity} & Mobile Hausbesuche
                    </p>
                  </div>

                  {/* Arbeitszeiten */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
                      <Clock className="w-4 h-4 text-[#66BB6A] shrink-0" />
                      <span>Arbeitszeiten</span>
                    </div>
                    <p className="text-xs text-[#1B5E20]/80 font-medium leading-snug">
                      Do {content.contact.hoursThursday} • Fr {content.contact.hoursFriday} • Sa {content.contact.hoursSaturday}
                    </p>
                  </div>

                </div>

              </div>

              {/* Doctor Specialties Badges */}
              <div className="space-y-2 pt-1 sm:pt-2">
                <span className="block text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                  Behandlungsschwerpunkte:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {content.doctor.specialties.map((spec, index) => (
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
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="book-lead-doctor-btn"
                  onClick={() => onSelectSpecialistForBooking(leadDoctor.id)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Calendar className="w-4 h-4 text-[#66BB6A]" />
                  <span>Termin Buchen</span>
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="doctor-hospital-maps-btn"
                  href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#1B5E20] text-[#1B5E20] hover:text-[#E8F5E9] border-2 border-[#1B5E20] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs group cursor-pointer text-center"
                >
                  <MapPin className="w-4 h-4 text-[#1B5E20] group-hover:text-[#66BB6A]" />
                  <span>Praxis auf Google Maps</span>
                </motion.a>

                <a
                  href={`tel:${content.contact.phoneRaw}`}
                  className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-[#E8F5E9] hover:bg-white text-[#1B5E20] border border-[#A5D6A7] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center hover:shadow-xs"
                >
                  <Phone className="w-4 h-4 text-[#66BB6A]" />
                  <span>{content.contact.phoneDisplay}</span>
                </a>

                <a
                  href={`mailto:${content.contact.email}`}
                  className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-[#E8F5E9] hover:bg-white text-[#1B5E20] border border-[#A5D6A7] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center truncate hover:shadow-xs"
                >
                  <Mail className="w-4 h-4 text-[#66BB6A] shrink-0" />
                  <span className="truncate">{content.contact.email}</span>
                </a>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
