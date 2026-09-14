import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  FileText, 
  User, 
  MapPin, 
  Megaphone, 
  Key, 
  Plus, 
  Trash2,
  Clock,
  Phone,
  MessageCircle,
  HelpCircle,
  ExternalLink,
  Layout,
  CalendarCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

export const PraxisCmsModal: React.FC = () => {
  const {
    content,
    isCmsModalOpen,
    closeCmsModal,
    activeCmsTab,
    setActiveCmsTab,
    updateHero,
    updateDoctor,
    updateContact,
    updateFooter,
    updateAnnouncement,
    saveToServer,
    resetToDefault,
    isSaving,
    hasUnsavedChanges,
    lastSavedAt,
  } = useSiteContent();

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [newSpecialty, setNewSpecialty] = useState('');

  // Local state for PIN change
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeStatus, setPinChangeStatus] = useState<string | null>(null);

  if (!isCmsModalOpen) return null;

  const handleSave = async () => {
    const res = await saveToServer();
    setNotification({
      message: res.message,
      type: res.success ? 'success' : 'error',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReset = async () => {
    if (window.confirm('Möchten Sie wirklich alle Texte auf die Standardwerte zurücksetzen?')) {
      const res = await resetToDefault();
      setNotification({ message: res.message, type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim()) {
      updateDoctor({
        specialties: [...content.doctor.specialties, newSpecialty.trim()],
      });
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    const updated = content.doctor.specialties.filter((_, i) => i !== index);
    updateDoctor({ specialties: updated });
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/content/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin: currentPinInput, newPin: newPinInput }),
      });
      const data = await res.json();
      if (data.success) {
        setPinChangeStatus('PIN erfolgreich geändert!');
        setCurrentPinInput('');
        setNewPinInput('');
      } else {
        setPinChangeStatus(data.message || 'Fehler beim Ändern des PINs');
      }
    } catch {
      setPinChangeStatus('Verbindungsfehler beim Ändern des PINs');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-4xl bg-white rounded-3xl border-2 border-[#A5D6A7] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#1B5E20] text-white flex items-center justify-between border-b border-[#A5D6A7]/40 shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#A5D6A7]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-base sm:text-lg leading-tight truncate">
                  Praxis-Inhalte & Texte anpassen
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#E8F5E9]/80 hidden sm:inline">
                    Vigan Musliu • Praxis LEBENSWERK
                  </span>
                  <span className="text-white/40 hidden sm:inline">•</span>
                  {/* Realtime Save Status Indicator */}
                  {isSaving ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-300" />
                      <span>Wird gespeichert...</span>
                    </span>
                  ) : hasUnsavedChanges ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Ungespeichert (Auto-Save aktiv)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Live gesichert {lastSavedAt ? `(${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-[#66BB6A] hover:bg-[#81C784] text-[#1B5E20] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Jetzt speichern und sofort live schalten"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{isSaving ? 'Speichert...' : 'Jetzt Speichern'}</span>
                <span className="sm:hidden">Speichern</span>
              </button>

              <button
                onClick={closeCmsModal}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Schliessen (Änderungen werden automatisch gesichert)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto shrink-0 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveCmsTab('hero')}
              className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activeCmsTab === 'hero'
                  ? 'bg-white text-[#1B5E20] border-[#1B5E20] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B5E20] border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 text-[#66BB6A]" />
              <span>Startseite & Absätze</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCmsTab('doctor')}
              className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activeCmsTab === 'doctor'
                  ? 'bg-white text-[#1B5E20] border-[#1B5E20] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B5E20] border-transparent'
              }`}
            >
              <User className="w-4 h-4 text-[#66BB6A]" />
              <span>Über Vigan Musliu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCmsTab('contact')}
              className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activeCmsTab === 'contact'
                  ? 'bg-white text-[#1B5E20] border-[#1B5E20] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B5E20] border-transparent'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#66BB6A]" />
              <span>Öffnungszeiten & Kontakt</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCmsTab('footer')}
              className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activeCmsTab === 'footer'
                  ? 'bg-white text-[#1B5E20] border-[#1B5E20] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B5E20] border-transparent'
              }`}
            >
              <Layout className="w-4 h-4 text-[#66BB6A]" />
              <span>Footer & Termin-Banner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCmsTab('announcement')}
              className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activeCmsTab === 'announcement'
                  ? 'bg-white text-[#1B5E20] border-[#1B5E20] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B5E20] border-transparent'
              }`}
            >
              <Megaphone className="w-4 h-4 text-[#66BB6A]" />
              <span>Ankündigungs-Banner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCmsTab('settings')}
              className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activeCmsTab === 'settings'
                  ? 'bg-white text-[#1B5E20] border-[#1B5E20] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B5E20] border-transparent'
              }`}
            >
              <Key className="w-4 h-4 text-[#66BB6A]" />
              <span>Sicherheit & PIN</span>
            </button>
          </div>

          {/* Modal Body / Tab Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white text-slate-800">
            
            {/* Notification alert */}
            {notification && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border ${
                  notification.type === 'success'
                    ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {notification.type === 'success' ? (
                  <Check className="w-5 h-5 text-[#2E7D32] shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
            )}

            {/* TAB 1: HERO & ABSÄTZE */}
            {activeCmsTab === 'hero' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] space-y-1">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#66BB6A]" />
                    <span>Hauptbereich & Startabsätze</span>
                  </h4>
                  <p className="text-[#1B5E20]/80">
                    Hier können Sie alle Absätze und Überschriften auf der Startseite beliebig umformulieren. Jede Änderung wird nach dem Klick auf "Speichern" sofort sichtbar.
                  </p>
                </div>

                {/* Paragraph 1 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                      Absatz 1 (Fokus-Einleitung):
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {content.hero.paragraph1.length} Zeichen
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={content.hero.paragraph1}
                    onChange={(e) => updateHero({ paragraph1: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-slate-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#A5D6A7] text-sm text-[#1B5E20] leading-relaxed outline-hidden transition-all bg-white font-medium shadow-xs"
                    placeholder="Persönliche, individuelle und evidenzbasierte Physiotherapie in Biberist..."
                  />
                </div>

                {/* Paragraph 2 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                      Absatz 2 (Praxis & Domizil Details):
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {content.hero.paragraph2.length} Zeichen
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={content.hero.paragraph2}
                    onChange={(e) => updateHero({ paragraph2: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-slate-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#A5D6A7] text-sm text-[#1B5E20] leading-relaxed outline-hidden transition-all bg-white font-normal shadow-xs"
                    placeholder="In meiner Praxis an der Hauptstrasse 19, 4562 Biberist begleite ich Sie persönlich..."
                  />
                </div>

                {/* Main Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Hauptüberschrift Zeile 1:
                    </label>
                    <input
                      type="text"
                      value={content.hero.headlineMain}
                      onChange={(e) => updateHero({ headlineMain: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1B5E20] text-xs font-bold text-[#1B5E20]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Hauptüberschrift Zeile 2 (Akzentfarbe):
                    </label>
                    <input
                      type="text"
                      value={content.hero.headlineHighlight}
                      onChange={(e) => updateHero({ headlineHighlight: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1B5E20] text-xs font-bold text-[#2E7D32]"
                    />
                  </div>
                </div>

                {/* Badge text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Oberer Status-Badge:
                  </label>
                  <input
                    type="text"
                    value={content.hero.badgeText}
                    onChange={(e) => updateHero({ badgeText: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1B5E20] text-xs font-medium text-[#1B5E20]"
                  />
                </div>

                {/* Schedule Highlights */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">
                    Sprechzeiten im Startbereich:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Donnerstag:</span>
                      <input
                        type="text"
                        value={content.hero.scheduleThursday}
                        onChange={(e) => updateHero({ scheduleThursday: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#1B5E20]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Freitag:</span>
                      <input
                        type="text"
                        value={content.hero.scheduleFriday}
                        onChange={(e) => updateHero({ scheduleFriday: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#1B5E20]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Samstag:</span>
                      <input
                        type="text"
                        value={content.hero.scheduleSaturday}
                        onChange={(e) => updateHero({ scheduleSaturday: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#1B5E20]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DOCTOR PROFILE & BIO */}
            {activeCmsTab === 'doctor' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] space-y-1">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#66BB6A]" />
                    <span>Profil & Biografie von Dipl. Physiotherapeut Vigan Musliu</span>
                  </h4>
                  <p className="text-[#1B5E20]/80">
                    Passen Sie Ihre Biografie, Ausbildungen, Sprachen und Behandlungsschwerpunkte an.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Vollständiger Name:
                    </label>
                    <input
                      type="text"
                      value={content.doctor.name}
                      onChange={(e) => updateDoctor({ name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#1B5E20]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Titel / Berufsbezeichnung:
                    </label>
                    <input
                      type="text"
                      value={content.doctor.title}
                      onChange={(e) => updateDoctor({ title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#1B5E20]"
                    />
                  </div>
                </div>

                {/* Doctor Bio Paragraph 1 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                    Biografie / Über mich – Absatz 1:
                  </label>
                  <textarea
                    rows={3}
                    value={content.doctor.bioParagraph1}
                    onChange={(e) => updateDoctor({ bioParagraph1: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-slate-300 focus:border-[#1B5E20] text-sm text-[#1B5E20] leading-relaxed"
                  />
                </div>

                {/* Doctor Bio Paragraph 2 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                    Biografie / Philosophie – Absatz 2:
                  </label>
                  <textarea
                    rows={3}
                    value={content.doctor.bioParagraph2}
                    onChange={(e) => updateDoctor({ bioParagraph2: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-slate-300 focus:border-[#1B5E20] text-sm text-[#1B5E20] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Ausbildung & Anerkennung:
                    </label>
                    <input
                      type="text"
                      value={content.doctor.education}
                      onChange={(e) => updateDoctor({ education: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-[#1B5E20]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Sprachen:
                    </label>
                    <input
                      type="text"
                      value={content.doctor.languages}
                      onChange={(e) => updateDoctor({ languages: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-[#1B5E20]"
                    />
                  </div>
                </div>

                {/* Specialties Management */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                    Behandlungsschwerpunkte (Tags):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {content.doctor.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs font-bold text-[#1B5E20]"
                      >
                        <span>{spec}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(idx)}
                          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 max-w-md pt-1">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSpecialty();
                        }
                      }}
                      placeholder="Neuer Schwerpunkt..."
                      className="flex-1 p-2 rounded-xl border border-slate-300 text-xs text-[#1B5E20]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecialty}
                      className="px-3 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Hinzufügen</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CONTACT & HOURS */}
            {activeCmsTab === 'contact' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] space-y-1">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#66BB6A]" />
                    <span>Kontaktdaten, Adresse & WhatsApp</span>
                  </h4>
                  <p className="text-[#1B5E20]/80">
                    Hier hinterlegte Nummern und Adressen werden auf der gesamten Website (Kopfzeile, Kontaktkarte, WhatsApp-Button und Footer) synchronisiert.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Strasse & Hausnummer:
                    </label>
                    <input
                      type="text"
                      value={content.contact.street}
                      onChange={(e) => updateContact({ street: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#1B5E20]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      PLZ & Ortschaft:
                    </label>
                    <input
                      type="text"
                      value={content.contact.zipCity}
                      onChange={(e) => updateContact({ zipCity: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#1B5E20]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Telefonnummer (Anzeige):
                    </label>
                    <input
                      type="text"
                      value={content.contact.phoneDisplay}
                      onChange={(e) => updateContact({ phoneDisplay: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#1B5E20]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      E-Mail-Adresse:
                    </label>
                    <input
                      type="email"
                      value={content.contact.email}
                      onChange={(e) => updateContact({ email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#1B5E20]"
                    />
                  </div>
                </div>

                {/* WhatsApp Section */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp-Direktverbindung</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        WhatsApp Rufnummer (international, ohne Leerzeichen):
                      </label>
                      <input
                        type="text"
                        value={content.contact.whatsappNumber}
                        onChange={(e) => updateContact({ whatsappNumber: e.target.value })}
                        className="w-full p-2 rounded-xl border border-emerald-300 text-xs font-bold text-[#1B5E20]"
                        placeholder="+41764580442"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Vorausgefüllte Patientennachricht:
                      </label>
                      <input
                        type="text"
                        value={content.contact.whatsappDefaultText}
                        onChange={(e) => updateContact({ whatsappDefaultText: e.target.value })}
                        className="w-full p-2 rounded-xl border border-emerald-300 text-xs text-[#1B5E20]"
                      />
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">
                    Öffnungszeiten (Footer & Terminübersicht):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Donnerstag:</span>
                      <input
                        type="text"
                        value={content.contact.hoursThursday}
                        onChange={(e) => updateContact({ hoursThursday: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#1B5E20]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Freitag:</span>
                      <input
                        type="text"
                        value={content.contact.hoursFriday}
                        onChange={(e) => updateContact({ hoursFriday: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#1B5E20]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Samstag:</span>
                      <input
                        type="text"
                        value={content.contact.hoursSaturday}
                        onChange={(e) => updateContact({ hoursSaturday: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#1B5E20]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ANNOUNCEMENT BANNER */}
            {activeCmsTab === 'announcement' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] space-y-1">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-[#66BB6A]" />
                    <span>Oberer Ankündigungsbalken (Notification Banner)</span>
                  </h4>
                  <p className="text-[#1B5E20]/80">
                    Schalten Sie bei Bedarf einen auffälligen Infobalken ganz oben auf der Website ein – ideal für Ferienmeldungen, Vertretungen oder neue Angebote.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="enable-announcement-toggle"
                    checked={content.announcement.enabled}
                    onChange={(e) => updateAnnouncement({ enabled: e.target.checked })}
                    className="w-5 h-5 rounded-md text-[#1B5E20] focus:ring-[#A5D6A7] cursor-pointer"
                  />
                  <label htmlFor="enable-announcement-toggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Ankündigungsbanner auf der Website aktivieren
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Nachrichtentext:
                  </label>
                  <textarea
                    rows={2}
                    value={content.announcement.text}
                    onChange={(e) => updateAnnouncement({ text: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800"
                    placeholder="z.B. Praxisferien: Vom 1. bis 8. Oktober ist die Praxis für Neuanmeldungen geschlossen..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Badge / Kennzeichnung (z.B. Info, Hinweis, Wichtig):
                    </label>
                    <input
                      type="text"
                      value={content.announcement.badge || ''}
                      onChange={(e) => updateAnnouncement({ badge: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Button-Beschriftung (optional):
                    </label>
                    <input
                      type="text"
                      value={content.announcement.linkText || ''}
                      onChange={(e) => updateAnnouncement({ linkText: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FOOTER & TERMIN-BANNER */}
            {activeCmsTab === 'footer' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] space-y-1">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-[#66BB6A]" />
                    <span>Footer & «Möchten Sie einen Termin vereinbaren?» Banner</span>
                  </h4>
                  <p className="text-[#1B5E20]/80">
                    Hier bearbeiten Sie den großen Banner vor der Fußzeile sowie alle Standortbeschreibungen, Texte und Partnerangaben im Footer.
                  </p>
                </div>

                {/* Sektion 1: Termin-Banner */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h5 className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-[#66BB6A]" />
                      <span>Terminanfrage-Banner («Möchten Sie einen Termin vereinbaren?»)</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Der auffällige Kontakt-Banner oberhalb des Footers auf der Startseite.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Hauptüberschrift (Banner-Titel):
                    </label>
                    <input
                      type="text"
                      value={content.footer?.bannerTitle || ''}
                      onChange={(e) => updateFooter({ bannerTitle: e.target.value })}
                      placeholder="Möchten Sie einen Termin vereinbaren?"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold text-[#1B5E20]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Badge über der Überschrift:
                    </label>
                    <input
                      type="text"
                      value={content.footer?.bannerBadge || ''}
                      onChange={(e) => updateFooter({ bannerBadge: e.target.value })}
                      placeholder="Praxis Biberist & Hausbesuche"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Beschreibungstext unter der Überschrift:
                    </label>
                    <textarea
                      rows={2}
                      value={content.footer?.bannerText || ''}
                      onChange={(e) => updateFooter({ bannerText: e.target.value })}
                      placeholder="Behandlungen an der Hauptstrasse 19 in 4562 Biberist oder bequeme Hausbesuche bei Ihnen zu Hause. Individuell und zuverlässig."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Button-Text (Termin buchen):
                      </label>
                      <input
                        type="text"
                        value={content.footer?.bookingButtonText || ''}
                        onChange={(e) => updateFooter({ bookingButtonText: e.target.value })}
                        placeholder="Termin Jetzt Buchen"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Zusatztext Anruf-Button (z.B. «anrufen»):
                      </label>
                      <input
                        type="text"
                        value={content.footer?.phoneButtonPrefix || ''}
                        onChange={(e) => updateFooter({ phoneButtonPrefix: e.target.value })}
                        placeholder="anrufen"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Sektion 2: Praxisbeschreibung im Footer */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h5 className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                      Praxisbeschreibung (Footer links unter dem Logo)
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kurze Zusammenfassung Ihrer Praxisphilosophie und Ihres Einzugsgebiets.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Beschreibungstext:
                    </label>
                    <textarea
                      rows={3}
                      value={content.footer?.brandDescription || ''}
                      onChange={(e) => updateFooter({ brandDescription: e.target.value })}
                      placeholder="Individuelle, persönliche und zuverlässige physiotherapeutische Betreuung an der Hauptstrasse 19 in 4562 Biberist sowie Domizilbehandlungen in der gesamten Region Solothurn & Biberist."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Sektion 3: Standort & Region Box (Footer rechts) */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h5 className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                      Standort & Region Box (Footer Spalte rechts)
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Informationen zum Praxisstandort und Hausbesuchen inklusive WhatsApp-Button.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Titel der Box:
                      </label>
                      <input
                        type="text"
                        value={content.footer?.locationBoxTitle || ''}
                        onChange={(e) => updateFooter({ locationBoxTitle: e.target.value })}
                        placeholder="Standort & Region"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        WhatsApp-Button Text:
                      </label>
                      <input
                        type="text"
                        value={content.footer?.whatsappButtonText || ''}
                        onChange={(e) => updateFooter({ whatsappButtonText: e.target.value })}
                        placeholder="Direkt via WhatsApp schreiben"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Textinhalt der Box:
                    </label>
                    <textarea
                      rows={2}
                      value={content.footer?.locationBoxText || ''}
                      onChange={(e) => updateFooter({ locationBoxText: e.target.value })}
                      placeholder="Hauptstrasse 19, 4562 Biberist sowie mobile Hausbesuche im gesamten Kanton Solothurn."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Sektion 4: Öffnungszeiten & Partner-Verband */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h5 className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                      Öffnungszeiten-Titel & Verbandspartner
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Titel der Öffnungszeiten-Spalte:
                      </label>
                      <input
                        type="text"
                        value={content.footer?.hoursBoxTitle || ''}
                        onChange={(e) => updateFooter({ hoursBoxTitle: e.target.value })}
                        placeholder="Öffnungszeiten & Termine"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Link-Text Online-Terminanfrage:
                      </label>
                      <input
                        type="text"
                        value={content.footer?.hoursOnlineBookingText || ''}
                        onChange={(e) => updateFooter({ hoursOnlineBookingText: e.target.value })}
                        placeholder="Termin jetzt online anfragen"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Verbandspartner Label:
                      </label>
                      <input
                        type="text"
                        value={content.footer?.partnerBadge || ''}
                        onChange={(e) => updateFooter({ partnerBadge: e.target.value })}
                        placeholder="Offizieller Verbandspartner"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Verbandspartner Untertitel:
                      </label>
                      <input
                        type="text"
                        value={content.footer?.partnerSubtext || ''}
                        onChange={(e) => updateFooter({ partnerSubtext: e.target.value })}
                        placeholder="Mitglied beim Schweizer Physiotherapie Verband (physioswiss)"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Sektion 5: Fußzeile & Copyright */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h5 className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                      Fußzeile & Copyright
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Copyright Bezeichnung:
                      </label>
                      <input
                        type="text"
                        value={content.footer?.copyrightText || ''}
                        onChange={(e) => updateFooter({ copyrightText: e.target.value })}
                        placeholder="LEBENSWERK Physiotherapie"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Qualifikations-Zusatz (z.B. Praxis für Physiotherapie & Domizilbehandlungen):
                      </label>
                      <input
                        type="text"
                        value={content.footer?.bottomSubtitle || ''}
                        onChange={(e) => updateFooter({ bottomSubtitle: e.target.value })}
                        placeholder="Praxis für Physiotherapie & Domizilbehandlungen"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: SECURITY & PIN */}
            {activeCmsTab === 'settings' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] space-y-1">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#66BB6A]" />
                    <span>Sicherheit & Praxis-PIN</span>
                  </h4>
                  <p className="text-[#1B5E20]/80">
                    Schützen Sie Ihren WordPress-Editor mit einem persönlichen PIN.
                  </p>
                </div>

                <form onSubmit={handleChangePin} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg space-y-4">
                  <h5 className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                    PIN ändern
                  </h5>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Aktueller PIN:
                    </label>
                    <input
                      type="password"
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="Aktueller PIN"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Neuer PIN (mind. 4 Zeichen):
                    </label>
                    <input
                      type="password"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="Neuer Wunsch-PIN"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                    />
                  </div>

                  {pinChangeStatus && (
                    <p className="text-xs font-bold text-[#1B5E20]">
                      {pinChangeStatus}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#1B5E20]/90 transition-colors cursor-pointer"
                  >
                    PIN speichern
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <h5 className="text-xs font-bold text-slate-800">
                    Sicherheits-Backup & Zurücksetzen
                  </h5>
                  <p className="text-xs text-slate-500">
                    Falls Sie einmal alle Texte auf die ursprünglichen Standardtexte zurücksetzen möchten, können Sie dies hier mit einem Klick tun.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Auf Standardwerte zurücksetzen</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer with Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Texte auf Standardwerte zurücksetzen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Zurücksetzen</span>
              </button>

              {hasUnsavedChanges ? (
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Ungespeicherte Änderungen (Auto-Save aktiv)</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Alle Änderungen live gesichert</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeCmsModal}
                className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                title="Schliessen (Ungespeicherte Änderungen werden automatisch gesichert)"
              >
                Schliessen
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all transform hover:scale-102 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Wird gespeichert...' : 'Änderungen jetzt veröffentlichen'}</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
