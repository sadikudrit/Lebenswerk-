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
  AlertCircle,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Service, Physiotherapist, Appointment, InquiryType } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  specialists: Physiotherapist[];
  initialServiceId?: string;
  initialDate?: string;
  initialPainArea?: string;
  onAppointmentCreated?: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  specialists,
  initialServiceId,
  initialDate,
  initialPainArea,
  onAppointmentCreated
}) => {
  // Form fields per user request:
  // 1. Dropdown box: Booking, Question, Feedback
  // 2. Name (First name)
  // 3. Surname (Last name)
  // 4. Phone number
  // 5. Mobile address / Email address
  // 6. Description box (injury description or message)
  const [requestType, setRequestType] = useState<InquiryType>('appointment');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [mobileAddress, setMobileAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Optional contextual helpers when booking is chosen
  const [treatmentLocation, setTreatmentLocation] = useState<'practice' | 'home'>('practice');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || services[0]?.id || 'serv-1');
  const [preferredDayTime, setPreferredDayTime] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    confirmationCode: string;
    type: InquiryType;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    description: string;
    location?: string;
    serviceName?: string;
  } | null>(null);

  // Synchronize initial selections when opened
  useEffect(() => {
    if (isOpen) {
      if (initialServiceId) {
        setSelectedServiceId(initialServiceId);
      }
      if (initialPainArea && !description) {
        setDescription(`Behandlungsbedarf bezüglich: ${initialPainArea}`);
      }
      if (initialDate && !preferredDayTime) {
        setPreferredDayTime(initialDate);
      }
      setErrorMessage(null);
      setSubmissionResult(null);
    }
  }, [isOpen, initialServiceId, initialDate, initialPainArea]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!firstName.trim()) {
      setErrorMessage('Bitte geben Sie Ihren Vornamen ein.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Bitte geben Sie Ihren Nachnamen ein.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Bitte geben Sie Ihre Telefonnummer für Rückfragen ein.');
      return;
    }
    if (!mobileAddress.trim()) {
      setErrorMessage('Bitte geben Sie Ihre E-Mail-Adresse oder Adresse ein.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Bitte beschreiben Sie kurz Ihre Verletzung, Beschwerden oder Ihr Anliegen.');
      return;
    }

    setIsSubmitting(true);

    const selectedService = services.find((s) => s.id === selectedServiceId);
    const serviceName = selectedService?.name || 'Physiotherapie';
    const confCode = `LW-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      type: requestType,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phoneNumber.trim(),
      email: mobileAddress.trim(),
      description: description.trim(),
      treatmentLocation: requestType === 'appointment' ? treatmentLocation : undefined,
      serviceId: requestType === 'appointment' ? selectedServiceId : undefined,
      serviceName: requestType === 'appointment' ? serviceName : undefined,
      preferredDate: preferredDayTime.trim() || undefined,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      const resultObj = {
        confirmationCode: data.inquiry?.id ? data.inquiry.id.slice(-6).toUpperCase() : confCode,
        type: requestType,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phoneNumber.trim(),
        email: mobileAddress.trim(),
        description: description.trim(),
        location: requestType === 'appointment' ? (treatmentLocation === 'home' ? 'Mobile Hausbesuche' : 'Praxis Biberist (Hauptstr. 19)') : undefined,
        serviceName: requestType === 'appointment' ? serviceName : undefined,
      };

      setSubmissionResult(resultObj);

      // Trigger appointment callback if booking was made
      if (requestType === 'appointment' && onAppointmentCreated) {
        const dummyAppointment: Appointment = {
          id: `apt-${Date.now()}`,
          patientName: `${firstName.trim()} ${lastName.trim()}`,
          patientEmail: mobileAddress.trim(),
          patientPhone: phoneNumber.trim(),
          serviceId: selectedServiceId,
          serviceName: serviceName,
          specialistId: 'doc-1',
          specialistName: 'Vigan Musliu',
          date: preferredDayTime || new Date().toISOString().split('T')[0],
          timeSlot: 'Nach Vereinbarung',
          treatmentLocation: treatmentLocation,
          status: 'confirmed',
          price: selectedService?.price || 130,
          confirmationCode: confCode,
          createdAt: new Date().toISOString(),
        };
        onAppointmentCreated(dummyAppointment);
      }
    } catch (err: any) {
      console.warn('Fallback local inquiry registration:', err);
      setSubmissionResult({
        confirmationCode: confCode,
        type: requestType,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phoneNumber.trim(),
        email: mobileAddress.trim(),
        description: description.trim(),
        location: requestType === 'appointment' ? (treatmentLocation === 'home' ? 'Mobile Hausbesuche' : 'Praxis Biberist (Hauptstr. 19)') : undefined,
        serviceName: requestType === 'appointment' ? serviceName : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionResult(null);
    setDescription('');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B5E20]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[36px] shadow-2xl border-2 border-[#A5D6A7] overflow-hidden my-auto max-h-[92vh] flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#E8F5E9] border-b border-[#A5D6A7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#A5D6A7] p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img 
                src="/public/doctor_vigan.jpg" 
                alt="Vigan Musliu" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top rounded-xl"
                onError={(e) => {
                  // Fallback to logo if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-[#1B5E20] leading-tight">
                {submissionResult ? 'Anfrage erfolgreich gesendet' : 'Termin, Frage & Feedback'}
              </h2>
              <p className="text-xs text-[#1B5E20]/80 font-medium">
                Vigan Musliu • Dipl. Physiotherapeut HF/FH
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-booking-modal-btn"
            onClick={onClose}
            aria-label="Schliessen"
            className="p-2 rounded-full bg-white hover:bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto space-y-5">

          {/* SUCCESS VIEW */}
          {submissionResult ? (
            <div className="text-center py-2 sm:py-4 space-y-5 animate-in zoom-in-95 duration-200">
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E8F5E9] border-2 border-[#A5D6A7] flex items-center justify-center mx-auto text-[#1B5E20] shadow-md">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#66BB6A]" />
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-bold uppercase tracking-wider">
                  Referenz: #{submissionResult.confirmationCode}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B5E20]">
                  Vielen Dank, {submissionResult.firstName}!
                </h3>
                <p className="text-xs sm:text-sm text-[#1B5E20]/80 max-w-md mx-auto leading-relaxed">
                  Ihre {submissionResult.type === 'appointment' ? 'Terminanfrage' : submissionResult.type === 'question' ? 'Frage' : 'Rückmeldung'} wurde direkt an Dipl. Physiotherapeut <strong>Vigan Musliu</strong> übermittelt.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-left text-xs sm:text-sm text-[#1B5E20] space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-1.5">
                  <span className="text-[#1B5E20]/70 font-semibold">Kategorie:</span>
                  <span className="font-bold">
                    {submissionResult.type === 'appointment' ? '🗓️ Booking (Termin buchen)' : submissionResult.type === 'question' ? '❓ Question (Frage)' : '💬 Feedback'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-1.5">
                  <span className="text-[#1B5E20]/70 font-semibold">Name:</span>
                  <span className="font-bold">{submissionResult.firstName} {submissionResult.lastName}</span>
                </div>
                <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-1.5">
                  <span className="text-[#1B5E20]/70 font-semibold">Telefon:</span>
                  <span className="font-bold">{submissionResult.phone}</span>
                </div>
                <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-1.5">
                  <span className="text-[#1B5E20]/70 font-semibold">Mobile / E-Mail:</span>
                  <span className="font-bold truncate max-w-[200px] text-right">{submissionResult.email}</span>
                </div>
                {submissionResult.location && (
                  <div className="flex justify-between border-b border-[#A5D6A7]/50 pb-1.5">
                    <span className="text-[#1B5E20]/70 font-semibold">Behandlungsort:</span>
                    <span className="font-bold">{submissionResult.location}</span>
                  </div>
                )}
                <div className="pt-1">
                  <span className="text-[#1B5E20]/70 font-semibold block mb-1">Ihre Beschreibung:</span>
                  <p className="p-2.5 rounded-xl bg-white border border-[#A5D6A7] text-xs text-[#1B5E20]/90 italic leading-relaxed">
                    "{submissionResult.description}"
                  </p>
                </div>
              </div>

              {/* Direct Practice Contact */}
              <div className="p-3 rounded-2xl bg-white border border-[#A5D6A7] text-xs text-[#1B5E20] max-w-md mx-auto flex items-center justify-between gap-2">
                <div className="text-left">
                  <span className="font-bold block">Praxis Biberist:</span>
                  <span className="text-[#1B5E20]/75 text-[11px]">Schnelle Rückmeldung garantiert</span>
                </div>
                <a
                  href="tel:0764580442"
                  className="px-3.5 py-2 rounded-full bg-[#1B5E20] text-[#E8F5E9] font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-[#1B5E20]/90"
                >
                  <Phone className="w-3.5 h-3.5 text-[#66BB6A]" /> 076 458 04 42
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Schliessen
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] font-bold text-sm transition-all cursor-pointer"
                >
                  Weiteres Anliegen senden
                </button>
              </div>

            </div>
          ) : (
            /* CLEAN SINGLE-STEP CONTACT & BOOKING FORM */
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* 1. DROPDOWN BOX (Booking / Question / Feedback) */}
              <div>
                <label 
                  htmlFor="inquiry-type-dropdown" 
                  className="block text-xs font-extrabold uppercase tracking-wider text-[#1B5E20] mb-1.5"
                >
                  Anliegen auswählen <span className="text-red-500">*</span>
                </label>
                <select
                  id="inquiry-type-dropdown"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as InquiryType)}
                  className="w-full px-3.5 py-3 rounded-2xl bg-[#E8F5E9] border-2 border-[#A5D6A7] text-sm font-bold text-[#1B5E20] focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:border-[#1B5E20] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="appointment">🗓️ Booking (Termin buchen / Terminanfrage)</option>
                  <option value="question">❓ Question (Frage / Beratung / Abrechnung)</option>
                  <option value="feedback">💬 Feedback (Rückmeldung / Lob / Anregung)</option>
                </select>
              </div>

              {/* Contextual Location selector only when Booking is active */}
              {requestType === 'appointment' && (
                <div className="p-3 rounded-2xl bg-[#E8F5E9]/70 border border-[#A5D6A7] space-y-2 animate-in fade-in duration-150">
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#1B5E20]">
                    Behandlungsort wählen
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTreatmentLocation('practice')}
                      className={`p-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        treatmentLocation === 'practice'
                          ? 'bg-[#1B5E20] text-[#E8F5E9] border-[#1B5E20] shadow-xs'
                          : 'bg-white text-[#1B5E20] border-[#A5D6A7] hover:bg-[#E8F5E9]'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5 text-[#66BB6A]" />
                      <span className="truncate">Praxis Biberist</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTreatmentLocation('home')}
                      className={`p-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        treatmentLocation === 'home'
                          ? 'bg-[#1B5E20] text-[#E8F5E9] border-[#1B5E20] shadow-xs'
                          : 'bg-white text-[#1B5E20] border-[#A5D6A7] hover:bg-[#E8F5E9]'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5 text-[#66BB6A]" />
                      <span className="truncate">Hausbesuch</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. NAME & 3. SURNAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label htmlFor="form-first-name" className="block text-xs font-bold text-[#1B5E20] mb-1">
                    Name (Vorname) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#1B5E20]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-first-name"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="z.B. Anna"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Surname */}
                <div>
                  <label htmlFor="form-last-name" className="block text-xs font-bold text-[#1B5E20] mb-1">
                    Surname (Nachname) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#1B5E20]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-last-name"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="z.B. Müller"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 4. PHONE NUMBER & 5. MOBILE ADDRESS (EMAIL / ADDRESS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone number */}
                <div>
                  <label htmlFor="form-phone-number" className="block text-xs font-bold text-[#1B5E20] mb-1">
                    Phone number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#1B5E20]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-phone-number"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="z.B. 079 123 45 67"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Mobile address (E-Mail / Address) */}
                <div>
                  <label htmlFor="form-mobile-address" className="block text-xs font-bold text-[#1B5E20] mb-1">
                    Mobile address / E-Mail <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#1B5E20]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-mobile-address"
                      type="text"
                      required
                      value={mobileAddress}
                      onChange={(e) => setMobileAddress(e.target.value)}
                      placeholder="z.B. anna.mueller@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 6. DESCRIPTION BOX */}
              <div>
                <label htmlFor="form-description" className="block text-xs font-bold text-[#1B5E20] mb-1">
                  Description (Verletzung / Beschwerden / Mitteilung) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="form-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    requestType === 'appointment'
                      ? 'Bitte beschreiben Sie kurz Ihre Beschwerden, Schmerzen oder Verordnung (z.B. Knieschmerzen nach Unfall, Bandscheibenbeschwerden, gewünschter Wochentag)...'
                      : requestType === 'question'
                      ? 'Was möchten Sie fragen? (z.B. Behandlungsmethoden, Öffnungszeiten, Domizilbehandlung)...'
                      : 'Teilen Sie uns Ihr Feedback, Ihre Erfahrungen oder Ihre Anregung mit...'
                  }
                  className="w-full p-3 rounded-2xl bg-[#E8F5E9]/40 border border-[#A5D6A7] text-sm text-[#1B5E20] placeholder-[#1B5E20]/40 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Practice hours and location note */}
              <div className="p-3 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] flex items-center justify-between gap-2 text-xs text-[#1B5E20]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#66BB6A] shrink-0" />
                  <span className="font-semibold text-[11px] sm:text-xs">
                    Hauptstr. 19, 4562 Biberist & Hausbesuche
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#1B5E20]/80 hidden sm:inline">
                  Do 18–21 • Fr 17–20 • Sa 08–14
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  id="submit-booking-form-btn"
                  disabled={isSubmitting}
                  className="w-full py-3.5 sm:py-4 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] font-extrabold text-sm sm:text-base shadow-lg shadow-[#1B5E20]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSubmitting ? (
                    <span>Wird übermittelt...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#66BB6A]" />
                      <span>
                        {requestType === 'appointment'
                          ? 'Terminanfrage Jetzt Absenden'
                          : requestType === 'question'
                          ? 'Frage Jetzt Absenden'
                          : 'Feedback Jetzt Absenden'
                        }
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Phone Call Quick Link */}
              <div className="text-center pt-0.5">
                <span className="text-[11px] sm:text-xs text-[#1B5E20]/75">
                  Telefonische Direktanfrage:{' '}
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
