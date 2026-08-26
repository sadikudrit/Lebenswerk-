import React, { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { BodyAreaPainPoint } from '../types';

interface InteractiveBodyMapProps {
  onSelectAreaForBooking: (areaName: string, serviceId?: string) => void;
  onOpenAiTriage: () => void;
}

const BODY_AREAS: BodyAreaPainPoint[] = [
  {
    id: 'lower-back',
    name: 'Lower Back & Lumbar Spine',
    commonInjuries: ['Lumbar Disc Herniation / Bulge', 'Sciatica & Radiating Nerve Pain', 'Lumbar Facet Arthritis', 'Muscular Spasm & Sacroiliac Dysfunction'],
    symptoms: ['Sharp pain when bending forward', 'Numbness or tingling down buttock/leg', 'Morning lumbar stiffness', 'Difficulty standing upright after sitting'],
    recommendedServiceId: 'serv-1',
    recommendedPhysioSpecialty: 'Spinal Decompression & McKenzie Protocol',
    selfCareAdvice: 'Avoid sitting for over 35 consecutive minutes. Perform gentle prone press-ups or pelvic tilts; avoid aggressive forward trunk flexion.'
  },
  {
    id: 'neck-cervical',
    name: 'Neck & Cervical Spine',
    commonInjuries: ['Tech Neck / Cervical Kyphosis', 'Cervicogenic Tension Headaches', 'Cervical Radiculopathy', 'Whiplash Strain'],
    symptoms: ['Stiff neck when turning head', 'Aching between shoulder blades', 'Throbbing base of skull pain', 'Arm tingling / pins & needles'],
    recommendedServiceId: 'serv-5',
    recommendedPhysioSpecialty: 'Posture Correction & Cervical Mobilization',
    selfCareAdvice: 'Elevate computer monitor to eye level. Perform gentle chin tucks every 60 minutes. Apply warm heat compress for tight trapezius muscles.'
  },
  {
    id: 'shoulder',
    name: 'Shoulder & Rotator Cuff',
    commonInjuries: ['Rotator Cuff Tendinopathy', 'Subacromial Impingement', 'Adhesive Capsulitis (Frozen Shoulder)', 'Labrum / SLAP Tear'],
    symptoms: ['Pain reaching overhead or behind back', 'Weakness when lifting groceries', 'Inability to sleep on affected side', 'Clicking or pinching sensation'],
    recommendedServiceId: 'serv-2',
    recommendedPhysioSpecialty: 'Sports Biomechanics & Scapulohumeral Rhythm',
    selfCareAdvice: 'Avoid repetitive overhead lifting. Keep elbows close to side when carrying objects. Perform gentle pendulum arm circles.'
  },
  {
    id: 'knee',
    name: 'Knee Joint & Ligaments',
    commonInjuries: ['Patellofemoral Pain Syndrome (Runner Knee)', 'ACL/MCL Ligament Sprain', 'Meniscus Tear', 'Patellar Tendonitis / Jumper Knee'],
    symptoms: ['Ache behind kneecap on stairs', 'Knee giving out or locking', 'Post-run swelling & effusion', 'Stiffness after prolonged sitting'],
    recommendedServiceId: 'serv-2',
    recommendedPhysioSpecialty: 'Kinetic Chain Load Progression & Neuromuscular Retraining',
    selfCareAdvice: 'Ice knee for 15 minutes post-exercise. Strengthen hip abductors (glute medius) to prevent knee valgus collapse.'
  },
  {
    id: 'hip-pelvis',
    name: 'Hip & Pelvic Complex',
    commonInjuries: ['Piriformis Syndrome', 'Femoroacetabular Impingement (FAI)', 'Trochanteric Bursitis', 'Hip Labral Strain'],
    symptoms: ['Deep ache in groin or outer hip', 'Shooting sciatic-like glute pain', 'Catching sensation during squatting', 'Pain getting in/out of car'],
    recommendedServiceId: 'serv-1',
    recommendedPhysioSpecialty: 'Pelvic Alignment & Soft Tissue Release',
    selfCareAdvice: 'Perform gentle figure-4 stretches on back. Avoid crossing legs while seated.'
  },
  {
    id: 'ankle-foot',
    name: 'Ankle & Foot Complex',
    commonInjuries: ['Plantar Fasciitis', 'Inversion Ankle Sprain', 'Achilles Tendinopathy', 'Shin Splints (MTSS)'],
    symptoms: ['First-step morning heel agony', 'Lateral ankle instability or rolling', 'Thickened tender Achilles tendon', 'Arch fatigue after standing'],
    recommendedServiceId: 'serv-2',
    recommendedPhysioSpecialty: 'Gait Analysis & Eccentric Calf Loading',
    selfCareAdvice: 'Roll frozen water bottle under arch for 5 minutes. Perform eccentric calf lowers on a step edge with straight and bent knees.'
  },
  {
    id: 'elbow-wrist',
    name: 'Elbow, Wrist & Hand',
    commonInjuries: ['Lateral Epicondylalgia (Tennis Elbow)', 'Medial Epicondylalgia (Golfer Elbow)', 'Carpal Tunnel Syndrome', 'De Quervain Tenosynovitis'],
    symptoms: ['Weak grip strength', 'Burning at outer elbow bone', 'Numbness in thumb, index, middle fingers', 'Pain typing or turning door keys'],
    recommendedServiceId: 'serv-4',
    recommendedPhysioSpecialty: 'Dry Needling & Neural Gliding',
    selfCareAdvice: 'Use vertical ergonomic mouse. Take 2-minute micro-breaks to stretch forearm flexors and extensors.'
  }
];

export const InteractiveBodyMap: React.FC<InteractiveBodyMapProps> = ({
  onSelectAreaForBooking,
  onOpenAiTriage,
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('lower-back');

  const currentArea = BODY_AREAS.find((a) => a.id === selectedAreaId) || BODY_AREAS[0];

  return (
    <section id="body-triage" className="py-20 border-b border-white/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-teal-800 text-xs font-semibold shadow-xs uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            Interactive Triage Map
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
            Where Does It Hurt?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Select your pain region below to understand common clinical diagnoses, recommended physical therapy techniques, and direct booking routes.
          </p>
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Anatomical Selectors */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Anatomical Region
              </span>
              <button
                id="body-map-ai-shortcut-btn"
                onClick={onOpenAiTriage}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Symptom Checker
              </button>
            </div>

            <div className="space-y-2">
              {BODY_AREAS.map((area) => {
                const isSelected = area.id === selectedAreaId;
                return (
                  <button
                    key={area.id}
                    id={`body-area-btn-${area.id}`}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer backdrop-blur-xs ${
                      isSelected
                        ? 'bg-teal-700 border-teal-700 text-white shadow-md shadow-teal-700/20'
                        : 'bg-white/60 border-white/80 text-slate-800 hover:bg-white/90 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-500'}`} />
                      <span className="font-semibold text-sm">{area.name}</span>
                    </div>
                    <span className={`text-xs ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                      {area.commonInjuries.length} Conditions
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dynamic Clinical Assessment & Care Pathway Card */}
          <div className="lg:col-span-7 glass-panel-solid p-7 rounded-3xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/70">
              <div>
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Targeted Pain Profile
                </span>
                <h3 className="text-2xl font-bold text-slate-900 font-serif mt-1">
                  {currentArea.name}
                </h3>
              </div>

              <button
                id="area-book-direct-btn"
                onClick={() => onSelectAreaForBooking(currentArea.name, currentArea.recommendedServiceId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-sm font-semibold shadow-md shadow-teal-700/20 transition-all cursor-pointer active:scale-98"
              >
                <span>Book for this Area</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Details */}
            <div className="mt-6 space-y-6">
              
              {/* Common Conditions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-teal-700" />
                  Frequent Clinical Conditions Treated
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentArea.commonInjuries.map((injury, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-white/70 border border-slate-200/80 text-slate-800 text-xs font-medium backdrop-blur-xs"
                    >
                      {injury}
                    </span>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Typical Patient Symptoms
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {currentArea.symptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white/60 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Evidence-Based Physio Protocol */}
              <div className="p-4 rounded-2xl bg-teal-50/80 backdrop-blur-xs border border-teal-200/80">
                <div className="flex items-center gap-2 text-teal-950 font-bold text-sm">
                  <Activity className="w-4 h-4 text-teal-700" />
                  Recommended Treatment Protocol: {currentArea.recommendedPhysioSpecialty}
                </div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  <strong>Therapist Self-Care Tip:</strong> {currentArea.selfCareAdvice}
                </p>
              </div>

            </div>

            {/* Bottom Quick Callout */}
            <div className="mt-6 pt-4 border-t border-[#A5D6A7]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#1B5E20]/80">
              <a href="tel:0764580442" className="flex items-center gap-1.5 font-bold hover:text-[#66BB6A] transition-colors">
                <HelpCircle className="w-3.5 h-3.5 text-[#66BB6A] shrink-0" /> Telefonische Auskunft: 076 458 04 42
              </a>
              <span className="text-[#1B5E20] font-semibold text-[11px] sm:text-xs">Dipl. Physiotherapeut Vigan Musliu</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
