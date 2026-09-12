import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Save, 
  Eye, 
  LogOut, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Sparkles,
  Sliders,
  Settings
} from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

export const WordPressAdminBar: React.FC = () => {
  const {
    isAuthenticated,
    isEditMode,
    setIsEditMode,
    hasUnsavedChanges,
    saveToServer,
    isSaving,
    openCmsModal,
    logout,
    resetToDefault,
  } = useSiteContent();

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isAuthenticated) return null;

  const handleSave = async () => {
    const result = await saveToServer();
    setNotification({
      message: result.message,
      type: result.success ? 'success' : 'error',
    });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleReset = async () => {
    if (window.confirm('Möchten Sie wirklich alle Texte auf die Standardtexte zurücksetzen?')) {
      const result = await resetToDefault();
      setNotification({
        message: result.message,
        type: 'success',
      });
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-[#143d17] text-white border-b border-[#2e7d32] shadow-md px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs font-medium">
          
          {/* Brand & Status */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#66BB6A] animate-pulse" />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wide uppercase text-white font-mono text-[11px] sm:text-xs">
                LEBENSWERK CMS
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-black/20 text-[#A5D6A7] text-[10px] font-bold">
                WordPress-Modus
              </span>
            </div>
          </div>

          {/* Quick CMS Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Open Full CMS Editor */}
            <button
              type="button"
              onClick={() => openCmsModal('hero')}
              className="px-3 py-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#388E3C] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#A5D6A7]" />
              <span>Inhalte bearbeiten</span>
            </button>

            {/* Toggle Inline Edit Pencils */}
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isEditMode
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                  : 'bg-black/30 text-white/90 hover:bg-black/40'
              }`}
              title="Aktiviert Bearbeitungssymbole direkt an den Texten auf der Seite"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Direkt-Editor: AN' : 'Direkt-Editor: AUS'}</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-[#43A047] hover:bg-[#4CAF50] text-white animate-pulse ring-2 ring-white/50'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Wird gespeichert...' : hasUnsavedChanges ? 'Änderungen veröffentlichen' : 'Gespeichert'}</span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white text-xs transition-all cursor-pointer"
              title="Auf Standardtexte zurücksetzen"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standard</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 hover:text-white text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="CMS-Modus beenden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-16 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 max-w-sm ${
              notification.type === 'success'
                ? 'bg-[#1B5E20] text-white border-[#A5D6A7]'
                : 'bg-red-600 text-white border-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-[#A5D6A7] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
