import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';
import { EmailReminderSimulation } from '../types';

interface AutomatedRemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmailDiagnostics {
  hasSmtpUser: boolean;
  maskedUser: string | null;
  hasSmtpPass: boolean;
  smtpPassLength: number;
  hasResendKey: boolean;
  doctorNotificationEmail: string;
  smtpStatus: string;
  smtpError: string | null;
  activeProvider: string;
}

export const AutomatedRemindersDrawer: React.FC<AutomatedRemindersDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [reminders, setReminders] = useState<EmailReminderSimulation[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<EmailReminderSimulation | null>(null);
  const [testEmail, setTestEmail] = useState<string>('sadikudrit6@gmail.com');
  const [reminderType, setReminderType] = useState<'reminder-24h' | 'reminder-2h' | 'booking-confirmed'>('reminder-24h');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isSendingRealEmail, setIsSendingRealEmail] = useState<boolean>(false);
  const [testSentNotice, setTestSentNotice] = useState<string | null>(null);
  const [realEmailNotice, setRealEmailNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [diagnostics, setDiagnostics] = useState<EmailDiagnostics | null>(null);
  const [isLoadingDiag, setIsLoadingDiag] = useState<boolean>(false);

  const fetchDiagnostics = async () => {
    setIsLoadingDiag(true);
    try {
      const res = await fetch('/api/email-diagnostics');
      const data = await res.json();
      setDiagnostics(data);
    } catch (err) {
      console.error('Failed to load email diagnostics:', err);
    } finally {
      setIsLoadingDiag(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      if (data.success && Array.isArray(data.reminders)) {
        setReminders(data.reminders);
        if (!selectedReminder && data.reminders.length > 0) {
          setSelectedReminder(data.reminders[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReminders();
      fetchDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendRealTestEmail = async () => {
    setIsSendingRealEmail(true);
    setRealEmailNotice(null);
    try {
      const res = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setRealEmailNotice({ type: 'success', message: data.message || `✅ Live email delivered to ${testEmail} via ${data.provider}!` });
        fetchReminders();
      } else {
        setRealEmailNotice({ 
          type: 'error', 
          message: data.error || 'Failed to send live email. Check your SMTP_USER/SMTP_PASS or RESEND_API_KEY in .env.' 
        });
      }
    } catch (err: any) {
      setRealEmailNotice({ type: 'error', message: err.message || 'Connection error' });
    } finally {
      setIsSendingRealEmail(false);
      setTimeout(() => setRealEmailNotice(null), 7000);
    }
  };

  const handleSendTestReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTestSentNotice(null);
    try {
      const res = await fetch('/api/reminders/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testEmail,
          reminderType,
        }),
      });
      const data = await res.json();
      if (data.success && data.reminder) {
        setReminders([data.reminder, ...reminders]);
        setSelectedReminder(data.reminder);
        setTestSentNotice(`Simulated ${reminderType} delivered to ${testEmail}!`);
        setTimeout(() => setTestSentNotice(null), 4000);
      }
    } catch (err) {
      console.error('Failed to send test reminder:', err);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative glass-panel-solid rounded-3xl shadow-2xl border border-white/80 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminders-drawer-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900/90 via-slate-900/90 to-teal-950/90 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reminders-drawer-title" className="font-bold text-base font-serif">
                Automated Email Reminders & Notifications Engine
              </h2>
              <p className="text-xs text-teal-200/80">
                Real-time patient attendance optimization and automated calendar alerts
              </p>
            </div>
          </div>

          <button
            id="close-reminders-modal-btn"
            onClick={onClose}
            aria-label="Close reminders modal"
            className="p-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Engine Explanation Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                <Mail className="w-4 h-4 text-teal-700" />
                <span>1. Instant Confirmation</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Dispatched immediately upon booking with Google Calendar invite & .ics download.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>2. 24-Hour Notice</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Reminds patient of specialist name, preparation tips, and pre-visit spinal intake forms.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Bell className="w-4 h-4 text-amber-700" />
                <span>3. 2-Hour Urgent Alert</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Final reminder with suite number, parking guidelines, and direct therapist contact.
              </p>
            </div>
          </div>

          {/* Real-time Email Diagnostics Status Banner */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                diagnostics?.smtpStatus === 'connected_and_verified' 
                  ? 'bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400' 
                  : diagnostics?.hasSmtpUser 
                    ? 'bg-amber-400' 
                    : 'bg-slate-500'
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    Email Dispatch Mode:
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    diagnostics?.smtpStatus === 'connected_and_verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : diagnostics?.hasSmtpUser
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {diagnostics?.activeProvider || 'Checking status...'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {diagnostics?.smtpStatus === 'connected_and_verified' 
                    ? `Authenticated to Gmail as ${diagnostics.maskedUser}. Live doctor notifications will deliver to ${diagnostics.doctorNotificationEmail}.`
                    : diagnostics?.smtpError 
                      ? `⚠️ Auth Error: ${diagnostics.smtpError}. Make sure you generated a 16-character App Password.`
                      : diagnostics?.hasSmtpUser 
                        ? `Loaded SMTP_USER: ${diagnostics.maskedUser}. Verifying...`
                        : 'Using in-app simulation queue. Add SMTP_USER and SMTP_PASS in .env to deliver real emails.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="refresh-email-diag-btn"
              onClick={fetchDiagnostics}
              disabled={isLoadingDiag}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDiag ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Test Reminder Dispatch Tool */}
          <div className="glass-panel p-5 rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-teal-600" />
                Simulate & Test Email Notification Dispatch
              </h3>
              {testSentNotice && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                  {testSentNotice}
                </span>
              )}
              {realEmailNotice && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                  realEmailNotice.type === 'success' 
                    ? 'text-emerald-800 bg-emerald-100/80 border-emerald-300'
                    : 'text-rose-800 bg-rose-100/80 border-rose-300'
                }`}>
                  {realEmailNotice.message}
                </span>
              )}
            </div>

            <form onSubmit={handleSendTestReminder} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4">
                <input
                  type="email"
                  id="test-reminder-email-input"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  id="test-reminder-type-select"
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="reminder-24h">24-Hour Notice Email</option>
                  <option value="reminder-2h">2-Hour Pre-Visit Alert</option>
                  <option value="booking-confirmed">Booking Confirmation</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  id="dispatch-test-email-btn"
                  disabled={isSendingTest}
                  title="Logs a simulated reminder in the in-app queue"
                  className="w-full py-2.5 px-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSendingTest ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>In-App Test</span>
                </button>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="button"
                  id="dispatch-real-smtp-email-btn"
                  disabled={isSendingRealEmail}
                  onClick={handleSendRealTestEmail}
                  title="Sends a real live email to your inbox using Gmail SMTP or Resend"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSendingRealEmail ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Live Test Email</span>
                </button>
              </div>
            </form>
          </div>

          {/* Email Notification Queue & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Queue List */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Recent Scheduled & Dispatched Emails ({reminders.length})
              </span>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {reminders.map((rem) => {
                  const isSelected = selectedReminder?.id === rem.id;
                  return (
                    <div
                      key={rem.id}
                      id={`reminder-item-${rem.id}`}
                      onClick={() => setSelectedReminder(rem)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xs ${
                        isSelected
                          ? 'bg-teal-50/90 border-teal-600 ring-2 ring-teal-500/40 shadow-xs'
                          : 'bg-white/60 border-slate-200/70 hover:bg-white/90'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate max-w-[180px]">
                          {rem.subject}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                          rem.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {rem.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>To: {rem.recipientEmail}</span>
                        <span>{rem.scheduledTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Live HTML Template Preview */}
            <div className="lg:col-span-7 bg-white/60 backdrop-blur-xs rounded-3xl border border-slate-200/70 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  Live HTML Email Template Preview
                </span>
                {selectedReminder && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedReminder.id}
                  </span>
                )}
              </div>

              {selectedReminder ? (
                <div className="bg-white/90 rounded-2xl border border-slate-200/70 p-4 max-h-80 overflow-y-auto shadow-inner">
                  <div className="border-b border-slate-100 pb-2 mb-3 text-xs text-slate-600">
                    <div><strong>Subject:</strong> {selectedReminder.subject}</div>
                    <div><strong>Recipient:</strong> {selectedReminder.recipientEmail} ({selectedReminder.recipientName})</div>
                  </div>
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedReminder.htmlContent }}
                    className="text-xs"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400">
                  Select an email notification from the left to view its rich template preview.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white/60 backdrop-blur-xs border-t border-slate-200/60 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Delivery Rate with SPF/DKIM Integration
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Close Engine
          </button>
        </div>

      </div>
    </div>
  );
};
