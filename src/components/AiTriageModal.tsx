import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface AiTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (serviceName?: string, painArea?: string) => void;
}

export interface TriageResult {
  urgencyLevel: string;
  suspectedPathology: string;
  recommendedService: string;
  recommendedSpecialist: string;
  immediateSelfCareAdvice: string[];
  questionsToPrepare: string[];
}

export const AiTriageModal: React.FC<AiTriageModalProps> = ({
  isOpen,
  onClose,
  onProceedToBooking,
}) => {
  const [painArea, setPainArea] = useState<string>('Lower Back & Sciatic Nerve');
  const [painLevel, setPainLevel] = useState<number>(6);
  const [duration, setDuration] = useState<string>('3 weeks, gradually worsening');
  const [description, setDescription] = useState<string>(
    'Sharp shooting sensation down posterior right thigh after prolonged desk sitting. Difficulty putting on socks in morning.'
  );
  const [priorSurgeries, setPriorSurgeries] = useState<string>('None');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  if (!isOpen) return null;

  const handleRunTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/symptom-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          painArea,
          painLevel,
          duration,
          description,
          priorSurgeries,
        }),
      });
      const data = await res.json();
      if (data.success && data.triage) {
        setTriageResult(data.triage);
      }
    } catch (err) {
      console.error('Triage failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative glass-panel-solid rounded-3xl shadow-2xl border border-white/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-triage-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-900/90 via-slate-900/90 to-teal-950/90 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="ai-triage-modal-title" className="font-bold text-base font-serif">
                AI Physiotherapy Symptom & Clinical Triage
              </h2>
              <p className="text-xs text-teal-200/80">
                Evidence-based preliminary musculoskeletal assessment
              </p>
            </div>
          </div>

          <button
            id="close-triage-modal-btn"
            onClick={onClose}
            aria-label="Close triage modal"
            className="p-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!triageResult ? (
            <form onSubmit={handleRunTriage} className="space-y-4">
              <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200 text-xs text-teal-950 flex items-start gap-2.5 backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <p>
                  This triage model analyzes symptoms against physical therapy diagnostic protocols to recommend the optimal therapeutic specialty and immediate acute self-care guidance.
                </p>
              </div>

              <div>
                <label htmlFor="triage-area-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Where is your primary pain or discomfort? *
                </label>
                <input
                  type="text"
                  id="triage-area-input"
                  required
                  value={painArea}
                  onChange={(e) => setPainArea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Lumbar spine, Shoulder rotator cuff, Neck & Headaches"
                />
              </div>

              {/* Severity Slider */}
              <div className="bg-white/60 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <label htmlFor="triage-pain-slider">Pain Severity (1 to 10)</label>
                  <span className="font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {painLevel} / 10
                  </span>
                </div>
                <input
                  type="range"
                  id="triage-pain-slider"
                  min="1"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="triage-duration-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Onset & Duration *
                  </label>
                  <input
                    type="text"
                    id="triage-duration-input"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="e.g. 2 weeks, sudden pop, gradual ache"
                  />
                </div>

                <div>
                  <label htmlFor="triage-surgeries-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Prior Surgeries or Trauma
                  </label>
                  <input
                    type="text"
                    id="triage-surgeries-input"
                    value={priorSurgeries}
                    onChange={(e) => setPriorSurgeries(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="e.g. ACL reconstruction 2022, none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="triage-description-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Symptoms & Functional Movement Limitations
                </label>
                <textarea
                  id="triage-description-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Describe the sensation: dull ache, sharp catching, pins and needles, stiffness upon waking, etc."
                />
              </div>

              <button
                type="submit"
                id="triage-generate-btn"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-semibold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Clinical Biomechanics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Clinical Triage Report</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Urgency Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Clinical Assessment
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  {triageResult.urgencyLevel}
                </span>
              </div>

              {/* Suspected Pathology */}
              <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/70 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Suspected Musculoskeletal Profile
                </span>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {triageResult.suspectedPathology}
                </p>
              </div>

              {/* Recommended Therapy & Specialist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200">
                  <span className="text-[11px] font-bold text-teal-800 uppercase block mb-1">
                    Recommended Treatment
                  </span>
                  <p className="text-sm font-bold text-teal-950">
                    {triageResult.recommendedService}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                    Recommended Attending Specialist
                  </span>
                  <p className="text-sm font-bold text-emerald-950">
                    {triageResult.recommendedSpecialist}
                  </p>
                </div>
              </div>

              {/* Immediate Self-Care Recommendations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Pre-Appointment Relief & Self-Care Tips
                </h4>
                <div className="space-y-1.5">
                  {triageResult.immediateSelfCareAdvice.map((tip, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/70 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions to prepare */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  Questions to Discuss in Clinic
                </h4>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 bg-white/70 p-3.5 rounded-2xl border border-slate-200/60">
                  {triageResult.questionsToPrepare.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  id="triage-proceed-booking-btn"
                  onClick={() => {
                    onClose();
                    onProceedToBooking(triageResult.recommendedService, painArea);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book with This Care Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id="triage-restart-btn"
                  onClick={() => setTriageResult(null)}
                  className="px-4 py-3 rounded-2xl bg-white/70 border border-slate-200/80 hover:bg-white text-slate-700 font-semibold text-xs transition-colors"
                >
                  Re-evaluate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white/60 backdrop-blur-xs border-t border-slate-200/60 px-6 py-3 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Confidential clinical triage engine</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
