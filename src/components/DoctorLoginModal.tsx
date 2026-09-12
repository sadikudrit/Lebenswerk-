import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

interface DoctorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DoctorLoginModal: React.FC<DoctorLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithPin } = useSiteContent();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Bitte geben Sie Ihren Praxis-PIN ein.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const valid = await loginWithPin(pin);
    setIsLoading(false);

    if (valid) {
      setPin('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError('Ungültiger Praxis-PIN. Bitte überprüfen Sie Ihre Eingabe.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white rounded-3xl border-2 border-[#A5D6A7] shadow-2xl overflow-hidden p-6 sm:p-8 relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] border-2 border-[#A5D6A7] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7 text-[#1B5E20]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#66BB6A] uppercase tracking-wider">
                Praxis LEBENSWERK
              </span>
              <h3 className="text-2xl font-display font-extrabold text-[#1B5E20]">
                Inhalts-Editor (CMS)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Geben Sie Ihren PIN ein, um Texte, Absätze und Inhalte auf der Website wie in WordPress direkt anzupassen.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-2">
                Praxis-PIN eingeben
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#A5D6A7] text-center text-xl tracking-widest font-mono font-bold text-[#1B5E20] outline-hidden transition-all bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Wird überprüft...</span>
              ) : (
                <>
                  <span>Editor öffnen</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500">
                🔒 Geschützter Administrationsbereich für LEBENSWERK Physiotherapie
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
