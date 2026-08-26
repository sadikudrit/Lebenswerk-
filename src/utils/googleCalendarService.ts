/**
 * Google Calendar Integration Service for Apex Physiotherapy Clinic
 * Provides direct Google Calendar API (v3) event scheduling and OAuth Token integration.
 */

import { Appointment } from '../types';

const GCAL_ACCESS_TOKEN_KEY = 'gcal_access_token';
const GCAL_EXPIRES_AT_KEY = 'gcal_token_expires_at';
const GCAL_USER_EMAIL_KEY = 'gcal_user_email';

// Default OAuth Client ID if available in environment or runtime
const OAUTH_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '240022761392-oauth-client.apps.googleusercontent.com';
const REQUIRED_SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  error?: string;
}

/**
 * Checks if the Google Identity Services script is loaded; loads it dynamically if not.
 */
export function ensureGsiLoaded(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Google Identity Services script.');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Retrieves the stored Google Calendar access token if valid and not expired.
 */
export function getStoredGCalToken(): string | null {
  const token = localStorage.getItem(GCAL_ACCESS_TOKEN_KEY);
  const expiresAt = localStorage.getItem(GCAL_EXPIRES_AT_KEY);

  if (!token || !expiresAt) return null;

  if (Date.now() > Number(expiresAt)) {
    // Expired
    localStorage.removeItem(GCAL_ACCESS_TOKEN_KEY);
    localStorage.removeItem(GCAL_EXPIRES_AT_KEY);
    return null;
  }

  return token;
}

/**
 * Stores the retrieved Google Calendar access token.
 */
export function storeGCalToken(token: string, expiresInSeconds: number = 3500, userEmail?: string): void {
  localStorage.setItem(GCAL_ACCESS_TOKEN_KEY, token);
  localStorage.setItem(GCAL_EXPIRES_AT_KEY, String(Date.now() + expiresInSeconds * 1000));
  if (userEmail) {
    localStorage.setItem(GCAL_USER_EMAIL_KEY, userEmail);
  }
}

/**
 * Clears stored Google Calendar credentials.
 */
export function disconnectGoogleCalendar(): void {
  const token = localStorage.getItem(GCAL_ACCESS_TOKEN_KEY);
  if (token && (window as any).google?.accounts?.oauth2?.revoke) {
    try {
      (window as any).google.accounts.oauth2.revoke(token, () => {
        console.log('Revoked Google Calendar Token.');
      });
    } catch {
      // ignore
    }
  }
  localStorage.removeItem(GCAL_ACCESS_TOKEN_KEY);
  localStorage.removeItem(GCAL_EXPIRES_AT_KEY);
  localStorage.removeItem(GCAL_USER_EMAIL_KEY);
}

/**
 * Returns the currently connected user email, or null.
 */
export function getConnectedUserEmail(): string | null {
  return localStorage.getItem(GCAL_USER_EMAIL_KEY) || (getStoredGCalToken() ? 'Connected Google Account' : null);
}

/**
 * Prompts user with Google OAuth popup to grant calendar event access.
 */
export async function requestGoogleCalendarToken(): Promise<{ success: boolean; token?: string; error?: string }> {
  await ensureGsiLoaded();

  return new Promise((resolve) => {
    try {
      if (!(window as any).google?.accounts?.oauth2) {
        resolve({ success: false, error: 'Google Identity Services could not be initialized in this browser.' });
        return;
      }

      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: OAUTH_CLIENT_ID,
        scope: REQUIRED_SCOPES,
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('Google OAuth Error:', tokenResponse.error);
            resolve({ success: false, error: tokenResponse.error_description || tokenResponse.error });
            return;
          }

          if (tokenResponse.access_token) {
            const expiresIn = Number(tokenResponse.expires_in) || 3599;
            
            // Optionally fetch user profile info
            let userEmail = 'sadikudrit6@gmail.com';
            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                if (userData.email) userEmail = userData.email;
              }
            } catch {
              // fallback
            }

            storeGCalToken(tokenResponse.access_token, expiresIn, userEmail);
            resolve({ success: true, token: tokenResponse.access_token });
          } else {
            resolve({ success: false, error: 'No access token returned from Google.' });
          }
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      console.error('Failed to request Google access token:', err);
      resolve({ success: false, error: err.message || 'OAuth popup failed' });
    }
  });
}

/**
 * Calculates ISO Start & End dates for an appointment based on date, timeSlot, and duration.
 */
export function calculateEventTimeRange(date: string, timeSlot: string, durationMinutes: number): { startIso: string; endIso: string; timeZone: string } {
  // Parse time: "10:30 AM" or "02:00 PM"
  const [time, modifier] = timeSlot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = date.split('-').map(Number);
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatLocalIso = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  };

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  return {
    startIso: formatLocalIso(startDate),
    endIso: formatLocalIso(endDate),
    timeZone: userTimeZone,
  };
}

/**
 * Inserts an appointment directly into Google Calendar via Google Calendar API v3.
 */
export async function createGoogleCalendarEvent(
  appointment: Appointment,
  explicitToken?: string
): Promise<CalendarEventResult> {
  const token = explicitToken || getStoredGCalToken();

  if (!token) {
    return {
      success: false,
      error: 'No active Google Calendar authentication. Please connect your Google Calendar first.',
    };
  }

  const { startIso, endIso, timeZone } = calculateEventTimeRange(
    appointment.date,
    appointment.timeSlot,
    appointment.durationMinutes || 60
  );

  const eventPayload = {
    summary: `🩺 Physiotherapy: ${appointment.serviceName} (${appointment.patientName})`,
    description: [
      `APEX PHYSIOTHERAPY & REHABILITATION CLINIC`,
      `===========================================`,
      `📌 Confirmation Code: ${appointment.confirmationCode}`,
      `👤 Patient: ${appointment.patientName}`,
      `📧 Email: ${appointment.patientEmail}`,
      `📞 Phone: ${appointment.patientPhone}`,
      `👨‍⚕️ Attending Specialist: ${appointment.specialistName}`,
      `🩹 Focus Area: ${appointment.painArea} (Reported Pain: ${appointment.painLevel}/10)`,
      `📝 Clinical Notes: ${appointment.symptomsNotes || 'None'}`,
      `🏥 Consultation Format: ${appointment.meetingType === 'telehealth-video' ? 'Virtual Telehealth Video' : 'In-Clinic Treatment (Suite 400)'}`,
      `💳 Fee: $${appointment.price}`,
      `\nDirect Patient Portal: https://apexphysioclinic.com/portal`,
    ].join('\n'),
    location: appointment.meetingType === 'telehealth-video'
      ? 'Telehealth Video Conference Room (Apex Portal)'
      : 'Apex Spine & Physical Health Center, Suite 400, Medical Plaza',
    start: {
      dateTime: `${startIso}`,
      timeZone: timeZone,
    },
    end: {
      dateTime: `${endIso}`,
      timeZone: timeZone,
    },
    attendees: [
      { email: appointment.patientEmail, displayName: appointment.patientName },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 1440 }, // 24 hours prior
        { method: 'popup', minutes: 60 },   // 1 hour prior
        { method: 'popup', minutes: 15 },   // 15 min prior
      ],
    },
    colorId: '2', // Sage / Emerald green in Google Calendar
  };

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Calendar API Error:', response.status, errorData);
      
      if (response.status === 401) {
        localStorage.removeItem(GCAL_ACCESS_TOKEN_KEY);
        return {
          success: false,
          error: 'Google Calendar session expired. Please re-connect your Google Account.',
        };
      }

      return {
        success: false,
        error: errorData.error?.message || `Google Calendar API error (${response.status})`,
      };
    }

    const event = await response.json();
    console.log('✅ Google Calendar Event Created Successfully:', event.id, event.htmlLink);

    return {
      success: true,
      eventId: event.id,
      htmlLink: event.htmlLink,
    };
  } catch (err: any) {
    console.error('Failed to create event in Google Calendar:', err);
    return {
      success: false,
      error: err.message || 'Network error communicating with Google Calendar API.',
    };
  }
}
