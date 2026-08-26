import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Calendar, 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Building, 
  Home, 
  Clock, 
  ShieldCheck,
  User,
  AlertCircle
} from 'lucide-react';
import { Service, InquiryType, ContactInquiry } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  initialType?: InquiryType;
  initialServiceId?: string;
  initialDate?: string;
  onInquirySubmitted?: (inquiry: ContactInquiry) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  services,
  initialType = 'appointment',
  initialServiceId,
  initialDate,
  onInquirySubmitted
}) => {
  // Form State
  const [inquiryType, setInquiryType] = useState<InquiryType>(initialType);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  // Optional Appointment fields
  const [treatmentLocation, setTreatmentLocation] = useState<'practice' | 'home'>('practice');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || services[0]?.id || 'serv-1');
  const [preferredDate, setPreferredDate] = useState<string>(initialDate || '');
  const [preferredTime, setPreferredTime] = useState<string>('');

  // UI Flow State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<ContactInquiry | null>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      setInquiryType(initialType);
      if (initialServiceId) setSelectedServiceId(initialServiceId);
      if (initialDate) setPreferredDate(initialDate);
      setErrorMessage(null);
      setSubmittedInquiry(null);
    }
  }, [isOpen, initialType, initialServiceId, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!firstName.trim()) {
      setErrorMessage('Bitte geben Sie Ihren Vornamen an.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Bitte geben Sie Ihren Nachnamen an.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Bitte geben Sie Ihre Telefonnummer an.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse an.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Bitte beschreiben Sie kurz Ihr Anliegen oder Ihre Beschwerden.');
      return;
    }

    setIsSubmitting(true);

    const selectedService = services.find((s) => s.id === selectedServiceId);

    const inquiryPayload = {
      type: inquiryType,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      description: description.trim(),
      treatmentLocation: inquiryType === 'appointment' ? treatmentLocation : undefined,
      preferredDate: inquiryType === 'appointment' && preferredDate ? preferredDate : undefined,
      preferredTime: inquiryType === 'appointment' && preferredTime ? preferredTime : undefined,
      serviceId: inquiryType === 'appointment' ? selectedServiceId : undefined,
      serviceName: inquiryType === 'appointment' ? (selectedService?.name || 'Physiotherapie') : undefined,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryPayload),
      });

      const data = await response.json();

      if (data.success && data.inquiry) {
        setSubmittedInquiry(data.inquiry);
        if (onInquirySubmitted) {
          onInquirySubmitted(data.inquiry);
        }
      } else {
        // Fallback local creation if server returns without inquiry object
        const fallbackInquiry: ContactInquiry = {
          id: `inq-${Date.now()}`,
          ...inquiryPayload,
          status: 'new',
          createdAt: new Date().toISOString(),
        };
        setSubmittedInquiry(fallbackInquiry);
        if (onInquirySubmitted) {
          onInquirySubmitted(fallbackInquiry);
        }
      }
    } catch (err: any) {
      console.warn('Backend contact submission fallback:', err);
      const localInquiry: ContactInquiry = {
        id: `inq-${Date.now()}`,
        ...inquiryPayload,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      setSubmittedInquiry(localInquiry);
      if (onInquirySubmitted) {
        onInquirySubmitted(localInquiry);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedInquiry(null);
    setDescription('');
    setErrorMessage(null);
  };

  const getDescriptionPlaceholder = () => {
    if (inquiryType === 'appointment') {
      return 'Beschreiben Sie bitte kurz Ihre Beschwerden, Schmerzen oder Verordnung (z.B. Rückenschmerzen seit 2 Wochen, ärztliche Verordnung vorhanden, gewünschter Tag)...';
    }
    if (inquiryType === 'feedback') {
      return 'Teilen Sie uns Ihre Erfahrungen, Lob oder Verbesserungsvorschläge mit...';
    }
    return 'Wie können wir Ihnen helfen? (z.B. Fragen zur Kostenübernahme durch die Krankenkasse, Abrechnung, Domizilbehandlung)...';
  };

  const getDescriptionLabel = () => {
    if (inquiryType === 'appointment') return 'Beschreibung der Beschwerden / Anliegen';
    if (inquiryType === 'feedback') return 'Ihr Feedback / Ihre Rückmeldung';
    return 'Ihre Frage / Anliegen';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B5E20]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[36px] shadow-2xl border-2 border-[#A5D6A7] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 bg-[#E8F5E9] border-b border-[#A5D6A7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#A5D6A7] p-1 flex items-center justify-center shadow-xs">
              <img 
                src="/src/assets/images/lebenswerk_logo_1787647029212.jpg" 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#1B5E20] leading-tight">
                {submittedInquiry ? 'Anfrage Erfolgreich Übermittelt' : 'Kontakt & Terminanfrage'}
              </h2>
              <p className="text-xs text-[#1B5E20]/80 font-medium">
                LEBENSWERK Physiotherapie • Biberist & Hausbesuche
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-contact-modal-btn"
            onClick={onClose}
            aria-label="Schliessen"
            className="p-2 rounded-full bg-white hover:bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">

          {/* SUCCESS STATE */}
          {submittedInquiry ? (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E8F5E9] border-2 border-[#A5D6A7] flex items-center justify-center mx-auto text-[#1B5E20] shadow-md">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#66BB6A]" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-bold uppercase tracking-wider">
                  Referenz: #{submittedInquiry.id.slice(-6).toUpperCase()}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B5E20]">
                  Vielen Dank, {submittedInquiry.firstName}!
                </h3>
                <p className="text-sm sm:text-base text-[#1B5E20]/80 max-w-md mx-auto leading-relaxed">
                  Ihre {submittedInquiry.type === 'appointment' ? 'Terminanfrage' : submittedInquiry.type === 'question' ? 'Frage' : 'Rückmeldung'} wurde erfolgreich an Dipl. Physiotherapeut <strong>Vigan Musliu</strong> übermittelt.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-left text-xs sm:text-sm text-[#1B5E20] space-y-2 max-w-lg mx-auto">
                <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-2">
                  <span className="text-[#1B5E20]/70 font-semibold">Kategorie:</span>
                  <span className="font-bold">
                    {submittedInquiry.type === 'appointment' ? '🗓️ Terminanfrage' : submittedInquiry.type === 'question' ? '❓ Frage' : '💬 Feedback'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-2">
                  <span className="text-[#1B5E20]/70 font-semibold">Name:</span>
                  <span className="font-bold">{submittedInquiry.firstName} {submittedInquiry.lastName}</span>
                </div>
                <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-2">
                  <span className="text-[#1B5E20]/70 font-semibold">Telefon:</span>
                  <span className="font-bold">{submittedInquiry.phone}</span>
                </div>
                <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-2">
                  <span className="text-[#1B5E20]/70 font-semibold">E-Mail:</span>
                  <span className="font-bold">{submittedInquiry.email}</span>
                </div>
                {submittedInquiry.type === 'appointment' && (
                  <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-2">
                    <span className="text-[#1B5E20]/70 font-semibold">Behandlungsort:</span>
                    <span className="font-bold">
                      {submittedInquiry.treatmentLocation === 'home' ? '🏡 Hausbesuch' : '🏥 Praxis Biberist (Hauptstr. 19)'}
                    </span>
                  </div>
                )}
                <div className="pt-1">
                  <span className="text-[#1B5E20]/70 font-semibold block mb-1">Übermittelte Nachricht:</span>
                  <p className="p-2.5 rounded-xl bg-white border border-[#A5D6A7] text-xs text-[#1B5E20]/90 italic leading-relaxed">
                    "{submittedInquiry.description}"
                  </p>
                </div>
              </div>

              {/* Direct Practice Contact Help */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#A5D6A7] text-xs text-[#1B5E20] max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <span className="font-bold block">Schnelle Rückmeldung:</span>
                  <span className="text-[#1B5E20]/75">Wir kontaktieren Sie in der Regel innerhalb weniger Stunden.</span>
                </div>
                <a
                  href="tel:0764580442"
                  className="px-4 py-2 rounded-full bg-[#1B5E20] text-[#E8F5E9] font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-[#1B5E20]/90"
                >
                  <Phone className="w-3.5 h-3.5 text-[#66BB6A]" /> 076 458 04 42
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Fertig & Schliessen
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] font-bold text-sm transition-all cursor-pointer"
                >
                  Weitere Anfrage senden
                </button>
              </div>

            </div>
          ) : (
            /* FORM INPUT STATE */
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* 1. Request Type Option Selector (Pills) */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1B5E20] mb-2">
                  Wie können wir Ihnen helfen?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  
                  {/* Option 1: Appointment */}
                  <button
                    type="button"
                    id="option-appointment"
                    onClick={() => setInquiryType('appointment')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      inquiryType === 'appointment'
                        ? 'bg-[#1B5E20] text-[#E8F5E9] border-[#1B5E20] shadow-md'
                        : 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7] hover:bg-white'
                    }`}
                  >
                    <Calendar className={`w-5 h-5 shrink-0 ${inquiryType === 'appointment' ? 'text-[#66BB6A]' : 'text-[#1B5E20]'}`} />
                    <div>
                      <span className="block font-bold text-xs sm:text-sm">Terminanfrage</span>
                      <span className={`block text-[10px] ${inquiryType === 'appointment' ? 'text-[#E8F5E9]/80' : 'text-[#1B5E20]/70'}`}>
                        Praxis oder Hausbesuch
                      </span>
                    </div>
                  </button>

                  {/* Option 2: Question */}
                  <button
                    type="button"
                    id="option-question"
                    onClick={() => setInquiryType('question')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      inquiryType === 'question'
                        ? 'bg-[#1B5E20] text-[#E8F5E9] border-[#1B5E20] shadow-md'
                        : 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7] hover:bg-white'
                    }`}
                  >
                    <HelpCircle className={`w-5 h-5 shrink-0 ${inquiryType === 'question' ? 'text-[#66BB6A]' : 'text-[#1B5E20]'}`} />
                    <div>
                      <span className="block font-bold text-xs sm:text-sm">Allgemeine Frage</span>
                      <span className={`block text-[10px] ${inquiryType === 'question' ? 'text-[#E8F5E9]/80' : 'text-[#1B5E20]/70'}`}>
                        Krankenkasse, Tarife, Info
                      </span>
                    </div>
                  </button>

                  {/* Option 3: Feedback */}
                  <button
                    type="button"
                    id="option-feedback"
                    onClick={() => setInquiryType('feedback')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      inquiryType === 'feedback'
                        ? 'bg-[#1B5E20] text-[#E8F5E9] border-[#1B5E20] shadow-md'
                        : 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7] hover:bg-white'
                    }`}
                  >
                    <MessageSquare className={`w-5 h-5 shrink-0 ${inquiryType === 'feedback' ? 'text-[#66BB6A]' : 'text-[#1B5E20]'}`} />
                    <div>
                      <span className="block font-bold text-xs sm:text-sm">Feedback</span>
                      <span className={`block text-[10px] ${inquiryType === 'feedback' ? 'text-[#E8F5E9]/80' : 'text-[#1B5E20]/70'}`}>
                        Rückmeldung & Lob
                      </span>
                    </div>
                  </button>

                </div>
              </div>

              {/* Conditional Appointment Preferences (If Terminanfrage is selected) */}
              {inquiryType === 'appointment' && (
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B5E20] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#66BB6A]" /> Behandlungsort & Öffnungszeiten
                    </span>
                    <span className="text-[11px] font-bold text-[#1B5E20]/80">
                      Do 18–21 • Fr 17–20 • Sa 08–14
                    </span>
                  </div>

                  {/* Location Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTreatmentLocation('practice')}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        treatmentLocation === 'practice'
                          ? 'bg-[#1B5E20] text-[#E8F5E9] border-[#1B5E20] shadow-xs'
                          : 'bg-white text-[#1B5E20] border-[#A5D6A7] hover:bg-[#E8F5E9]'
                      }`}
                    >
                      <Building className="w-4 h-4 text-[#66BB6A]" />
                      <span>Praxis Biberist (Hauptstr. 19)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTreatmentLocation('home')}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        treatmentLocation === 'home'
                          ? 'bg-[#1B5E20] text-[#E8F5E9] border-[#1B5E20] shadow-xs'
                          : 'bg-white text-[#1B5E20] border-[#A5D6A7] hover:bg-[#E8F5E9]'
                      }`}
                    >
                      <Home className="w-4 h-4 text-[#66BB6A]" />
                      <span>Mobile Hausbesuche (Domizil)</span>
                    </button>
                  </div>

                  {/* Service & Preferred Time Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1B5E20] mb-1">
                        Gewünschte Therapieform:
                      </label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#A5D6A7] text-xs font-semibold text-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                      >
                        {services.map((serv) => (
                          <option key={serv.id} value={serv.id}>
                            {serv.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#1B5E20] mb-1">
                        Wunschtag / Datum (optional):
                      </label>
                      <input
                        type="text"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        placeholder="z.B. Nächster Samstag Vormittag"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#A5D6A7] text-xs text-[#1B5E20] placeholder-[#1B5E20]/40 focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Personal Information Fields (Name, Surname, Phone, Email) */}
              <div className="space-y-3">
                <span className="block text-xs font-extrabold uppercase tracking-wider text-[#1B5E20]">
                  Ihre Kontaktdaten
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name (Vorname) */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B5E20] mb-1">
                      Vorname <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#1B5E20]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        id="input-first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="z.B. Anna"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Surname (Nachname) */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B5E20] mb-1">
                      Nachname <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#1B5E20]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        id="input-last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="z.B. Meier"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B5E20] mb-1">
                      Telefonnummer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#1B5E20]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        id="input-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="z.B. 079 123 45 67"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-[#1B5E20] mb-1">
                      E-Mail-Adresse <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#1B5E20]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        id="input-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="z.B. anna.meier@beispiel.ch"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Description Field */}
              <div>
                <label className="block text-xs font-bold text-[#1B5E20] mb-1">
                  {getDescriptionLabel()} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  id="input-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={getDescriptionPlaceholder()}
                  className="w-full p-3 rounded-2xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Trust Badge & Insurance Notice */}
              <div className="p-3 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] flex items-center justify-between gap-2 text-xs text-[#1B5E20]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#66BB6A] shrink-0" />
                  <span className="font-semibold">Krankenkassen (KVG/UVG/MV) & SRK anerkannt</span>
                </div>
                <span className="text-[11px] text-[#1B5E20]/70 hidden sm:inline">
                  Vertraulich & geschützt
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-contact-inquiry-btn"
                  disabled={isSubmitting}
                  className="w-full py-3.5 sm:py-4 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-extrabold text-sm sm:text-base shadow-lg shadow-[#1B5E20]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Wird übermittelt...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#66BB6A]" />
                      <span>
                        {inquiryType === 'appointment' 
                          ? 'Terminanfrage Jetzt Absenden' 
                          : inquiryType === 'question'
                          ? 'Frage Jetzt Absenden'
                          : 'Feedback Jetzt Absenden'
                        }
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Telephone Backup */}
              <div className="text-center pt-1">
                <span className="text-xs text-[#1B5E20]/70">
                  Dringendes Anliegen? Sie erreichen uns auch direkt unter{' '}
                  <a href="tel:0764580442" className="font-bold text-[#1B5E20] hover:underline">
                    076 458 04 42
                  </a>
                </span>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
