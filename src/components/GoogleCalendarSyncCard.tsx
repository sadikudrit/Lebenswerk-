import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Home
} from 'lucide-react';

interface GoogleCalendarSyncCardProps {
  onOpenBooking: () => void;
  onOpenGoogleCalendarModal?: () => void;
}

export const GoogleCalendarSyncCard: React.FC<GoogleCalendarSyncCardProps> = ({
  onOpenBooking,
  onOpenGoogleCalendarModal,
}) => {
  const [isSimulatingSync, setIsSimulatingSync] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('Live Connected');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const handleTestSync = () => {
    setIsSimulatingSync(true);
    setTimeout(() => {
      setIsSimulatingSync(false);
      setSyncStatus('Live Connected (0 Conflicts)');
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 900);
  };

  return (
    <section className="py-20 bg-[#FEFDFB] border-t border-[#F1E9DA] relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="bg-white rounded-[36px] p-8 lg:p-12 border border-[#F1E9DA] relative overflow-hidden shadow-xl shadow-[#022C22]/5">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            
            {/* Left: Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D1FAE5] border border-[#10B981]/30 text-xs font-semibold text-[#064E3B]">
                <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Google Calendar Real-Time 2-Way Sync</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#022C22] tracking-tighter">
                Seamless Scheduling. <br />
                Direct to Google Calendar & Doctor Inbox.
              </h2>

              <p className="text-sm sm:text-base text-[#022C22]/70 leading-relaxed font-normal">
                When a home visit booking is made in Solothurn, an appointment slot is instantly synchronized into Google Calendar and dispatched directly to the therapist with your exact home address and treatment preferences.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-[#022C22] bg-[#FDF8F1] p-3 rounded-2xl border border-[#F1E9DA]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Real-time availability locking</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#022C22] bg-[#FDF8F1] p-3 rounded-2xl border border-[#F1E9DA]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>1-Click Add to Google Calendar</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#022C22] bg-[#FDF8F1] p-3 rounded-2xl border border-[#F1E9DA]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Direct email alert with address</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#022C22] bg-[#FDF8F1] p-3 rounded-2xl border border-[#F1E9DA]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Standard .ICS calendar invitation</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Sync Terminal Card */}
            <div className="lg:col-span-5 bg-[#022C22] text-[#FDF8F1] p-6 sm:p-7 rounded-[28px] shadow-xl space-y-4 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-bold font-display tracking-tight text-[#FDF8F1]">
                    Google Calendar Integration
                  </span>
                </div>
                <span className="text-[10px] text-[#10B981] bg-[#064E3B] px-2 py-0.5 rounded-full border border-[#10B981]/30 font-mono">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-[#FDF8F1]/80">
                <div className="flex justify-between">
                  <span className="text-[#FDF8F1]/50">Status:</span>
                  <span className="text-[#10B981] font-semibold">{syncStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FDF8F1]/50">Last Synced:</span>
                  <span>{lastSyncTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FDF8F1]/50">Doctor Inbox:</span>
                  <span className="text-[#FDF8F1]">sadikudrit6@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FDF8F1]/50">Service Area:</span>
                  <span className="text-[#FDF8F1]">Solothurn, CH</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                <button
                  type="button"
                  id="test-calendar-sync-btn"
                  onClick={handleTestSync}
                  disabled={isSimulatingSync}
                  className="flex-1 py-2.5 rounded-full bg-[#064E3B] hover:bg-[#065F46] text-[#FDF8F1] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#10B981] ${isSimulatingSync ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingSync ? 'Syncing...' : 'Ping Live Calendar'}</span>
                </button>

                {onOpenGoogleCalendarModal && (
                  <button
                    type="button"
                    onClick={onOpenGoogleCalendarModal}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FDF8F1] transition-colors"
                    title="Open Google Calendar Settings"
                  >
                    <ExternalLink className="w-4 h-4 text-[#10B981]" />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
