import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Phone,
  MapPin
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { SpecialistsSection } from './components/SpecialistsSection';
import { BookingModal } from './components/BookingModal';
import { AiTriageModal } from './components/AiTriageModal';
import { Footer } from './components/Footer';
import { Service, Physiotherapist, Appointment } from './types';

// Fallback initial services for LEBENSWERK Mobile Physiotherapie & Praxis Biberist
const INITIAL_SERVICES: Service[] = [
  {
    id: "serv-1",
    name: "Klassische Physiotherapie",
    category: "classical-physio",
    durationMinutes: 50,
    price: 130,
    shortDescription: "Gezielte Behandlung bei Beschwerden des Bewegungsapparates in der Praxis Biberist oder bei Ihnen zu Hause.",
    fullDescription: "Individuelle, persönliche und verlässliche physiotherapeutische Betreuung. Umfassende Befundaufnahme, massgeschneiderte Übungsprotokolle sowie sanfte aktive und passive Mobilisation.",
    benefits: ["Lindert akute & chronische Gelenkschmerzen", "Optimiert die Biomechanik & Haltung", "Individuell abgestimmte Behandlungspläne", "Flexible Termine in der Praxis oder als Hausbesuch"],
    recommendedFor: ["Rücken- & Nackenbeschwerden", "Gelenk- & Wirbelsäulenblockaden", "Ischias & Bandscheibenprobleme", "Muskuläre Dysbalancen"],
    icon: "Activity",
    badge: "01 Kernbehandlung",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-2",
    name: "Manuelle Therapie & Mobilisation",
    category: "manual-therapy",
    durationMinutes: 50,
    price: 140,
    shortDescription: "Gezielte Mobilisation von Blockaden, Schmerzlinderung und Funktionsstörungen an Gelenken und Wirbelsäule.",
    fullDescription: "Spezifische manuelle Grifftechniken zur Wiederherstellung der Gelenkmechanik, Entlastung gereizter Nervenstrukturen und Lösung tiefer myofaszialer Verspannungen.",
    benefits: ["Lösung von Wirbelsäulen- & Gelenkblockaden", "Schnelle Schmerzlinderung", "Wiederherstellung des physiologischen Bewegungsausmasses", "Schonende, evidenzbasierte Behandlung"],
    recommendedFor: ["Wirbelsäulen- & Beckenblockaden", "Zervikogene Kopfschmerzen", "Schulterimpingement", "Hüft- & Kniebeschwerden"],
    icon: "Zap",
    badge: "02 Kernbehandlung",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-3",
    name: "Schmerztherapie & Triggerpunktbehandlung",
    category: "pain-therapy",
    durationMinutes: 45,
    price: 135,
    shortDescription: "Linderung akuter und chronischer Schmerzzustände durch moderne, evidenzbasierte Methoden.",
    fullDescription: "Gezielte Schmerztherapie unter Einsatz von myofaszialer Entlastung, Triggerpunktbehandlung, neuromuskulärer Reizsetzung und individuellen Dehn- und Entspannungsprogrammen.",
    benefits: ["Nachhaltige Linderung chronischer Schmerzen", "Lösung schmerzhafter Myogelosen & Triggerpunkte", "Förderung der lokalen Gewebedurchblutung", "Verbesserung von Schlafqualität & Lebensfreude"],
    recommendedFor: ["Chronische Rücken- & Nackenschmerzen", "Myofasziales Schmerzsyndrom", "Spannungskopfschmerzen", "Fibromyalgie & Überlastungsschmerzen"],
    icon: "Sparkles",
    badge: "03 Kernbehandlung",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-4",
    name: "Neurologische Rehabilitation",
    category: "neuro-rehab",
    durationMinutes: 60,
    price: 150,
    shortDescription: "Spezialisierte Rehabilitation nach Schlaganfall, bei Parkinson und neurologischen Bewegungseinschränkungen.",
    fullDescription: "Gezielte Neurorehabilitation nach Bobath-Konzept und alltagsorientiertem Training zur Wiedererlangung von Gleichgewicht, Gangsicherheit und selbstständigen Transfers.",
    benefits: ["Neuroplastisches Training von Bewegungsabläufen", "Sturzprävention & Sicherheitsanalyse im Alltag", "Gleichgewichts- & Gangschulung", "Förderung der Selbstständigkeit zu Hause"],
    recommendedFor: ["Zustand nach Schlaganfall (Apoplex)", "Morbus Parkinson", "Multiple Sklerose", "Ataxie & Gangunsicherheiten"],
    icon: "ShieldCheck",
    badge: "Spezialisierte Therapie",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-5",
    name: "Geriatrische Physiotherapie & Sturzprävention",
    category: "geriatric-care",
    durationMinutes: 45,
    price: 125,
    shortDescription: "Einfühlsame Erhaltung der Mobilität, Kraftaufbau und Sturzprophylaxe für Senioren in Biberist & Region.",
    fullDescription: "Schonende Bewegungstherapie in der Praxis, im Pflegeheim oder bei Hausbesuchen im Kanton Solothurn. Fördert die Gehfähigkeit, Beweglichkeit und das Vertrauen in den eigenen Körper.",
    benefits: ["Erhält die Selbstständigkeit im Alltag", "Stärkt die Haltemuskulatur", "Sicheres Gehtraining mit Rollator oder Gehstock", "Erhalt der Gelenkbeweglichkeit"],
    recommendedFor: ["Bewohner von Senioren- & Pflegeheimen", "Senioren mit Mobilitätseinschränkungen", "Sicherheit nach Stürzen", "Arthrose & Alterssteifigkeit"],
    icon: "Compass",
    badge: "Praxis & Hausbesuche",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-6",
    name: "Postoperative Rehabilitation & Frakturen",
    category: "post-surgery",
    durationMinutes: 50,
    price: 135,
    shortDescription: "Strukturierter Phasenaufbau nach Gelenkersatz (TEP), Arthroskopie oder Knochenbrüchen.",
    fullDescription: "Sichere Rehabilitation direkt nach dem Spitalaufenthalt. Wir begleiten Sie mit abschwellenden Massnahmen, Narbenmobilisation, schonendem Kraftaufbau und Gangschulung.",
    benefits: ["Sicherheit nach Spitalaustritt", "Manuelle Lymphdrainage & Abschwellung", "Progressive Wiederherstellung der Gelenkbeweglichkeit", "Treppensteigen & Alltagsbelastung"],
    recommendedFor: ["Hüft- oder Knie-Totalendoprothese (TEP)", "Schulteroperationen", "Nach Wirbelsäuleneingriffen", "Zustand nach Frakturen"],
    icon: "Clock",
    badge: "Postoperativ",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
  }
];

const INITIAL_SPECIALISTS: Physiotherapist[] = [
  {
    id: "doc-1",
    name: "Vigan Musliu",
    title: "Dipl. Physiotherapeut HF/FH & Praxisleiter",
    credentials: [
      "Dipl. Physiotherapeut HF/FH",
      "SRK Anerkannt (Schweizerisches Rotes Kreuz)",
      "Mitglied Physioswiss",
      "Zertifiziert in Manueller Therapie & Rehabilitation"
    ],
    experienceYears: 12,
    rating: 4.99,
    reviewsCount: 180,
    avatar: "/src/assets/images/doctor_vigan_musliu_1787647012290.jpg",
    bio: "Vigan Musliu bietet individuelle, persönliche und zuverlässige physiotherapeutische Betreuung an der Hauptstrasse 19 in 4562 Biberist sowie bei Hausbesuchen. Mit fundierter klinischer Erfahrung verbindet er evidenzbasierte manuelle Therapie, Schmerztherapie und aktive Rehabilitation.",
    specialties: ["Klassische Physiotherapie", "Manuelle Therapie & Mobilisation", "Schmerztherapie & Triggerpunkte", "Neurologische Rehabilitation", "Rehabilitation nach Operationen"],
    education: "Dipl. Physiotherapeut HF/FH • ZHAW / SRK Anerkannt",
    email: "info@lebenswerk.praxismail.ch",
    availableDays: ["Thu", "Fri", "Sat"],
    consultationFee: 130,
    languages: ["Deutsch (Muttersprache)", "Englisch", "Französisch"],
    nextAvailable: "Do 18:00–21:00 | Fr 17:00–20:00 | Sa 08:00–14:00"
  }
];

export default function App() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [specialists, setSpecialists] = useState<Physiotherapist[]>(INITIAL_SPECIALISTS);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isAiTriageOpen, setIsAiTriageOpen] = useState<boolean>(false);

  // Booking pre-fills
  const [bookingInitialServiceId, setBookingInitialServiceId] = useState<string | undefined>();
  const [bookingInitialDate, setBookingInitialDate] = useState<string | undefined>();
  const [bookingInitialPainArea, setBookingInitialPainArea] = useState<string | undefined>();

  // Booking toast notification state
  const [recentBooking, setRecentBooking] = useState<Appointment | null>(null);

  // Fetch live backend catalogue
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, specRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/specialists'),
        ]);
        const servData = await servRes.json();
        const specData = await specRes.json();

        if (servData.success && Array.isArray(servData.services)) {
          setServices(servData.services);
        }
        if (specData.success && Array.isArray(specData.specialists)) {
          setSpecialists(specData.specialists);
        }
      } catch (err) {
        console.warn('Using client-side service fallbacks:', err);
      }
    };

    fetchData();
  }, []);

  const handleOpenBooking = (serviceId?: string, date?: string, painArea?: string) => {
    setBookingInitialServiceId(serviceId);
    setBookingInitialDate(date);
    setBookingInitialPainArea(painArea);
    setIsBookingOpen(true);
  };

  const handleAppointmentCreated = (appointment: Appointment) => {
    setRecentBooking(appointment);
    setTimeout(() => {
      setRecentBooking(null);
    }, 8000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-900 selection:bg-teal-200 selection:text-teal-900">
      
      {/* Ambient background light nodes for rich frosted depth */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-300/25 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-[30rem] h-[30rem] bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/3 w-[28rem] h-[28rem] bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      {/* Toast Notification for Confirmed Bookings */}
      {recentBooking && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm glass-panel-solid text-slate-900 p-4 rounded-2xl shadow-2xl border border-teal-500/30 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-slate-900">
              Appointment Scheduled: {recentBooking.confirmationCode}
            </p>
            <p className="text-slate-600 mt-0.5">
              {recentBooking.serviceName} on {recentBooking.date} at {recentBooking.timeSlot}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setRecentBooking(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenAiTriage={() => setIsAiTriageOpen(true)}
      />

      {/* Primary Content View */}
      <main className="flex-1 pb-16 md:pb-0">
        <HeroSection
          services={services}
          onOpenBooking={(serviceId, date) => handleOpenBooking(serviceId, date)}
          onOpenAiTriage={() => setIsAiTriageOpen(true)}
        />

        <ServicesSection
          services={services}
          onSelectServiceForBooking={(serviceId) => handleOpenBooking(serviceId)}
        />

        <SpecialistsSection
          specialists={specialists}
          onSelectSpecialistForBooking={(specId) => {
            const spec = specialists.find((s) => s.id === specId);
            const defaultServ = spec?.specialties[0]?.includes('Spine') ? 'serv-1' : 'serv-2';
            handleOpenBooking(defaultServ);
          }}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenAiTriage={() => setIsAiTriageOpen(true)}
      />

      {/* Sticky Bottom Quick Action Dock for Mobile Devices (< md) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#A5D6A7] p-2.5 px-4 md:hidden flex items-center justify-between gap-2 shadow-2xl safe-bottom">
        <a
          href="tel:0764580442"
          className="flex-1 py-2.5 px-3 rounded-full bg-[#E8F5E9] hover:bg-[#A5D6A7]/50 text-[#1B5E20] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#A5D6A7] transition-all"
        >
          <Phone className="w-3.5 h-3.5 text-[#66BB6A]" />
          <span className="truncate">076 458 04 42</span>
        </a>

        <button
          onClick={() => handleOpenBooking()}
          className="flex-1 py-2.5 px-3 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#66BB6A]" />
          <span className="truncate">Kontakt & Termin</span>
        </button>

        <a
          href="https://www.google.com/maps/search/?api=1&query=Hauptstrasse+19+4562+Biberist"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-full bg-[#E8F5E9] hover:bg-white text-[#1B5E20] border border-[#A5D6A7] flex items-center justify-center shrink-0"
          title="Praxis Biberist auf Google Maps"
          aria-label="Praxis Standort"
        >
          <MapPin className="w-4 h-4 text-[#1B5E20]" />
        </a>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        specialists={specialists}
        initialServiceId={bookingInitialServiceId}
        initialDate={bookingInitialDate}
        initialPainArea={bookingInitialPainArea}
        onAppointmentCreated={handleAppointmentCreated}
      />

      <AiTriageModal
        isOpen={isAiTriageOpen}
        onClose={() => setIsAiTriageOpen(false)}
        onProceedToBooking={(serviceName, painArea) => {
          const matchedService = services.find((s) => s.name === serviceName);
          handleOpenBooking(matchedService?.id || 'serv-1', undefined, painArea);
        }}
      />

    </div>
  );
}
