import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Trash2, 
  Clock, 
  CalendarCheck,
  Sparkles
} from 'lucide-react';
import { 
  getStoredGCalToken, 
  getConnectedUserEmail, 
  requestGoogleCalendarToken, 
  disconnectGoogleCalendar, 
  createGoogleCalendarEvent,
  ensureGsiLoaded
} from '../utils/googleCalendarService';
import { Appointment } from '../types';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentAppointments?: Appointment[];
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  recentAppointments = [],
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSyncingTest, setIsSyncingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; url?: string; message: string } | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('gcal_auto_sync_enabled') !== 'false';
  });

  const checkConnectionStatus = () => {
    const token = getStoredGCalToken();
    setIsConnected(!!token);
    setUserEmail(getConnectedUserEmail());
  };

  useEffect(() => {
    if (isOpen) {
      checkConnectionStatus();
      ensureGsiLoaded();
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setTestResult(null);
    try {
      const result = await requestGoogleCalendarToken();
      if (result.success) {
        checkConnectionStatus();
        setTestResult({
          success: true,
          message: 'Google Calendar successfully connected! Future bookings will be automatically scheduled.',
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to authenticate with Google Calendar.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'OAuth popup was closed or interrupted.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGoogleCalendar();
    checkConnectionStatus();
    setTestResult({
      success: true,
      message: 'Google Calendar disconnected.',
    });
  };

  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSyncEnabled(checked);
    localStorage.setItem('gcal_auto_sync_enabled', checked ? 'true' : 'false');
  };

  const handleSendTestCalendarEvent = async () => {
    setIsSyncingTest(true);
    setTestResult(null);

    const testAppointment: Appointment = {
      id: `test-apt-${Date.now()}`,
      confirmationCode: `APX-CAL-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: 'Sadik Udrit (Test Booking)',
      patientEmail: userEmail || 'sadikudrit6@gmail.com',
      patientPhone: '+41 78 922 72 74',
      serviceId: 'serv-1',
      serviceName: 'Comprehensive Spinal & Postural Assessment',
      specialistId: 'doc-1',
      specialistName: 'Dr. Elena Rostova, DPT',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeSlot: '10:00 AM',
      durationMinutes: 60,
      meetingType: 'hospital-clinic',
      painArea: 'Lumbar Spine & Sacroiliac Joint',
      painLevel: 6,
      symptomsNotes: 'Live test event dispatched from Doctor\'s Hospital Physiotherapy Calendar Sync Engine.',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      googleCalendarSynced: true,
      remindersEnabled: { email24h: true, email2h: true, sms: true },
      price: 165,
    };

    try {
      const res = await createGoogleCalendarEvent(testAppointment);
      if (res.success && res.htmlLink) {
        setTestResult({
          success: true,
          url: res.htmlLink,
          message: 'Calendar Event scheduled! Click below to view it live in your Google Calendar.',
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Failed to insert event into Google Calendar.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error communicating with Google Calendar API.',
      });
    } finally {
      setIsSyncingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gcal-modal-title"
      >
        {/* Header */}
        <div className="bg-[#1B5E20] text-[#E8F5E9] px-6 py-5 flex items-center justify-between border-b border-[#A5D6A7]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#66BB6A]/20 border border-[#66BB6A]/30 flex items-center justify-center text-[#66BB6A]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="gcal-modal-title" className="font-bold text-base font-display text-[#E8F5E9]">
                  Google Calendar Live Sync
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A5D6A7] text-[#1B5E20]">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-[#E8F5E9]/80">Direct 2-Way Google Calendar Event Integration</p>
            </div>
          </div>

          <button
            type="button"
            id="close-gcal-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8F5E9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Card */}
          <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
            isConnected
              ? 'bg-[#E8F5E9] border-[#66BB6A] text-[#1B5E20]'
              : 'bg-[#E8F5E9]/50 border-[#A5D6A7] text-[#1B5E20]'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${
                isConnected ? 'bg-[#1B5E20] animate-pulse' : 'bg-slate-400'
              }`} />
              <div>
                <h4 className="font-bold text-sm text-[#1B5E20]">
                  {isConnected ? 'Connected to Google Calendar' : 'Google Calendar Not Connected'}
                </h4>
                <p className="text-xs text-[#1B5E20]/80 mt-0.5">
                  {isConnected 
                    ? `Active Account: ${userEmail || 'sadikudrit6@gmail.com'}. New patient bookings will sync directly to your schedule.`
                    : 'Connect your Google Calendar so all appointment bookings appear automatically on your phone and desktop calendar.'}
                </p>
              </div>
            </div>

            {isConnected ? (
              <button
                type="button"
                id="disconnect-gcal-btn"
                onClick={handleDisconnect}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold px-2.5 py-1 rounded-lg hover:bg-rose-50 border border-rose-200 transition cursor-pointer shrink-0"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                id="connect-gcal-btn"
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] shadow-sm transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#66BB6A]" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-3.5 h-3.5 text-[#66BB6A]" />
                    <span>Connect Google Calendar</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#E8F5E9] rounded-2xl border border-[#A5D6A7]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#1B5E20]" />
                <span className="text-xs font-bold text-[#1B5E20]">Auto-Sync on Every Booking</span>
              </div>
              <p className="text-[11px] text-[#1B5E20]/80">
                Instantly schedule consultation events into your primary Google Calendar without extra clicks.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="auto-sync-gcal-checkbox"
                checked={autoSyncEnabled} 
                onChange={(e) => handleToggleAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#A5D6A7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#A5D6A7] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B5E20]"></div>
            </label>
          </div>

          {/* Test Calendar Event Dispatch Tool */}
          <div className="border border-[#A5D6A7] rounded-2xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B5E20] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#66BB6A]" /> Test Live Event Injection
              </span>
              <span className="text-[10px] text-[#1B5E20]/70 font-semibold">Verify Real-Time Creation</span>
            </div>
            <p className="text-xs text-[#1B5E20]/80">
              Create an instant test appointment event in your Google Calendar with patient triage notes and 24h/2h reminders.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                id="dispatch-test-gcal-event-btn"
                onClick={handleSendTestCalendarEvent}
                disabled={isSyncingTest || !isConnected}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] text-xs font-bold shadow-sm transition disabled:opacity-40 cursor-pointer"
              >
                {isSyncingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#66BB6A]" />
                    <span>Inserting into Google Calendar...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-[#66BB6A]" />
                    <span>Create Test Event in Google Calendar</span>
                  </>
                )}
              </button>

              {!isConnected && (
                <span className="text-[11px] text-[#1B5E20]/70 font-semibold">
                  Connect account first
                </span>
              )}
            </div>

            {/* Test Result Notice */}
            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 mt-2 ${
                testResult.success ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#66BB6A]' : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <p className="font-bold">{testResult.message}</p>
                  {testResult.url && (
                    <a
                      href={testResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#1B5E20] hover:underline font-extrabold text-xs pt-1"
                    >
                      <span>Open Event in Google Calendar &rarr;</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#1B5E20]">
            <div className="flex items-start gap-2 p-3 bg-[#E8F5E9] rounded-xl border border-[#A5D6A7]">
              <ShieldCheck className="w-4 h-4 text-[#66BB6A] shrink-0 mt-0.5" />
              <span>Direct Google OAuth with scoped calendar permission.</span>
            </div>
            <div className="flex items-start gap-2 p-3 bg-[#E8F5E9] rounded-xl border border-[#A5D6A7]">
              <Clock className="w-4 h-4 text-[#66BB6A] shrink-0 mt-0.5" />
              <span>Includes built-in 24-hour and 1-hour Google Calendar notification alerts.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#E8F5E9] border-t border-[#A5D6A7] px-6 py-3.5 flex items-center justify-between">
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#1B5E20] hover:underline font-bold"
          >
            <span>Open Google Calendar Web App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            id="close-gcal-footer-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-[#E8F5E9] text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
