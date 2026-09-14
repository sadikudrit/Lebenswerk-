import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Vercel Serverless Function for Appointment & Contact Inquiries
export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // use as is
      }
    }

    const {
      type = 'appointment',
      firstName,
      lastName,
      phone,
      email,
      description,
      treatmentLocation,
      preferredDate,
      preferredTime,
      serviceId,
      serviceName,
    } = body || {};

    if (!firstName || !lastName || !phone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Pflichtfelder fehlen: Vorname, Nachname, Telefon und E-Mail sind erforderlich.',
      });
    }

    const newInquiry = {
      id: `inq-${Date.now()}`,
      type,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      description: description ? String(description).trim() : 'Terminanfrage über Online-Buchungssystem',
      treatmentLocation: treatmentLocation || 'practice',
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || '',
      serviceId: serviceId || 'serv-1',
      serviceName: serviceName || 'Allgemeine Physiotherapie',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const typeLabel =
      type === 'appointment' ? 'Terminanfrage' : type === 'question' ? 'Allgemeine Frage' : 'Feedback';
    
    // Send doctor notification to both admin Gmail and practice mail so nothing is ever missed
    const doctorEmail =
      process.env.DOCTOR_NOTIFICATION_EMAIL?.trim() ||
      'sadikudrit6@gmail.com, info@lebenswerk.praxismail.ch';

    // Helper: Unified Email Dispatcher
    async function sendMail(params: {
      to: string;
      subject: string;
      html: string;
      fromName?: string;
    }): Promise<{ success: boolean; provider: string; error?: string; id?: string }> {
      const { to, subject, html, fromName = 'LEBENSWERK Physiotherapie' } = params;

      // 1. Working defaults ensures Vercel functions succeed immediately even without env vars
      const DEFAULT_SMTP_USER = 'sadikudrit6@gmail.com';
      const DEFAULT_SMTP_PASS = 'emeplqyoycdmdect';

      const smtpUser = (process.env.SMTP_USER?.trim() || DEFAULT_SMTP_USER).replace(/^["']|["']$/g, '');
      const smtpPass = (process.env.SMTP_PASS?.trim() || DEFAULT_SMTP_PASS).replace(/^["']|["']$/g, '').replace(/[\s]/g, '');
      const smtpHost = process.env.SMTP_HOST?.trim().replace(/^["']|["']$/g, '') || (smtpUser.includes('@gmail.com') ? 'smtp.gmail.com' : 'asmtp.mail.hostpoint.ch');
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : (smtpUser.includes('@gmail.com') ? 465 : 587);
      const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

      if (smtpUser && smtpPass) {
        try {
          let transporter: any;
          if (smtpUser.toLowerCase().includes('@gmail.com') || smtpHost.includes('gmail')) {
            transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: { user: smtpUser, pass: smtpPass },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 10000,
            });
          } else if (smtpUser.toLowerCase().includes('praxismail.ch') || smtpHost.includes('praxismail')) {
            transporter = nodemailer.createTransport({
              host: 'mail.praxismail.ch',
              port: 587,
              secure: false,
              auth: { user: smtpUser, pass: smtpPass },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 10000,
              tls: { rejectUnauthorized: false },
            });
          } else {
            transporter = nodemailer.createTransport({
              host: smtpHost,
              port: smtpPort || (smtpSecure ? 465 : 587),
              secure: smtpSecure,
              auth: { user: smtpUser, pass: smtpPass },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 10000,
              tls: { rejectUnauthorized: false },
            });
          }

          const info = await transporter.sendMail({
            from: `"${fromName}" <${smtpUser}>`,
            to,
            subject,
            html,
          });

          return { success: true, provider: smtpHost || 'Gmail SMTP', id: info.messageId };
        } catch (err: any) {
          console.error(`[Vercel Function SMTP Error]:`, err.message || err);
          return { success: false, provider: smtpHost || 'SMTP', error: err.message || 'SMTP authentication failed' };
        }
      }

      // 2. Fallback to Resend API if provided
      const resendKey = process.env.RESEND_API_KEY?.trim();
      if (resendKey) {
        try {
          const resend = new Resend(resendKey);
          const fromAddress = process.env.RESEND_FROM_EMAIL || `"${fromName}" <onboarding@resend.dev>`;
          const result = await resend.emails.send({
            from: fromAddress,
            to,
            subject,
            html,
          });
          if (result.error) {
            return { success: false, provider: 'Resend', error: result.error.message };
          }
          return { success: true, provider: 'Resend', id: result.data?.id };
        } catch (err: any) {
          return { success: false, provider: 'Resend', error: err.message };
        }
      }

      return {
        success: false,
        provider: 'None',
        error:
          'Keine E-Mail-Zugangsdaten in Vercel konfiguriert. Bitte setzen Sie SMTP_USER und SMTP_PASS (oder RESEND_API_KEY) in den Vercel Project Settings > Environment Variables.',
      };
    }

    // HTML Template: Doctor Notification
    const doctorHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #A5D6A7; border-radius: 16px; background: #ffffff; color: #1B5E20;">
        <div style="background: #1B5E20; color: #E8F5E9; padding: 20px; border-radius: 12px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Neue ${typeLabel} eingegangen</h2>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">LEBENSWERK Physiotherapie Biberist</p>
        </div>
        <div style="margin-top: 20px; font-size: 14px; line-height: 1.6;">
          <div style="background: #E8F5E9; padding: 16px; border-radius: 12px; border: 1px solid #A5D6A7; margin-bottom: 16px;">
            <p style="margin: 0 0 8px;"><strong>Kategorie:</strong> ${typeLabel}</p>
            <p style="margin: 0 0 8px;"><strong>Patient:</strong> ${newInquiry.firstName} ${newInquiry.lastName}</p>
            <p style="margin: 0 0 8px;"><strong>Telefon:</strong> <a href="tel:${newInquiry.phone}" style="color: #1B5E20; font-weight: bold;">${newInquiry.phone}</a></p>
            <p style="margin: 0 0 8px;"><strong>E-Mail:</strong> <a href="mailto:${newInquiry.email}" style="color: #1B5E20;">${newInquiry.email}</a></p>
            ${
              type === 'appointment'
                ? `
              <p style="margin: 0 0 8px;"><strong>Ort:</strong> ${newInquiry.treatmentLocation === 'home' ? '🏡 Mobile Hausbesuche (Domizilbehandlung)' : '🏥 Praxis Biberist (Hauptstrasse 19)'}</p>
              <p style="margin: 0 0 8px;"><strong>Therapie:</strong> ${newInquiry.serviceName}</p>
              ${newInquiry.preferredDate ? `<p style="margin: 0 0 8px;"><strong>Wunschtermin:</strong> ${newInquiry.preferredDate}</p>` : ''}
            `
                : ''
            }
          </div>
          <p><strong>Nachricht / Beschwerdebild:</strong></p>
          <div style="background: #ffffff; border: 1px solid #A5D6A7; padding: 14px; border-radius: 10px; font-style: italic; margin-bottom: 16px;">
            "${newInquiry.description}"
          </div>
          <p style="font-size: 12px; color: #4B7A50;">Eingegangen am ${new Date().toLocaleString('de-CH', { timeZone: 'Europe/Zurich' })}</p>
        </div>
      </div>
    `;

    // HTML Template: Patient Confirmation
    const patientHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #A5D6A7; border-radius: 16px; background: #ffffff; color: #1B5E20;">
        <div style="background: #1B5E20; color: #E8F5E9; padding: 20px; border-radius: 12px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Vielen Dank für Ihre Anfrage!</h2>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">LEBENSWERK Physiotherapie • Vigan Musliu</p>
        </div>
        <div style="margin-top: 20px; font-size: 14px; line-height: 1.6;">
          <p>Guten Tag <strong>${newInquiry.firstName} ${newInquiry.lastName}</strong>,</p>
          <p>wir haben Ihre ${typeLabel} erfolgreich erhalten. Wir melden uns zeitnah persönlich telefonisch oder per E-Mail bei Ihnen, um Ihren Termin abzustimmen.</p>
          
          <div style="background: #E8F5E9; padding: 16px; border-radius: 12px; border: 1px solid #A5D6A7; margin: 16px 0;">
            <p style="margin: 0 0 8px;"><strong>Therapie:</strong> ${newInquiry.serviceName}</p>
            <p style="margin: 0 0 8px;"><strong>Format:</strong> ${newInquiry.treatmentLocation === 'home' ? '🏡 Mobile Hausbesuche (Domizilbehandlung)' : '🏥 Praxis Biberist (Hauptstrasse 19, 4562 Biberist)'}</p>
            ${newInquiry.preferredDate ? `<p style="margin: 0 0 8px;"><strong>Wunschtermin:</strong> ${newInquiry.preferredDate}</p>` : ''}
            <p style="margin: 0;"><strong>Hinterlegte Telefonnummer:</strong> ${newInquiry.phone}</p>
          </div>

          <p style="font-size: 13px; color: #4B7A50;">Haben Sie eine dringende Frage? Sie erreichen uns direkt unter <a href="tel:+41764580442" style="color: #1B5E20; font-weight: bold;">076 458 04 42</a> oder per E-Mail an <a href="mailto:info@lebenswerk.praxismail.ch" style="color: #1B5E20;">info@lebenswerk.praxismail.ch</a>.</p>
          <hr style="border: none; border-top: 1px solid #E8F5E9; margin: 20px 0;" />
          <p style="font-size: 12px; color: #4B7A50; margin: 0;">Freundliche Grüsse<br><strong>Vigan Musliu</strong><br>Dipl. Physiotherapeut & Inhaber • LEBENSWERK Physiotherapie</p>
        </div>
      </div>
    `;

    // 1. Dispatch Email to Doctor / Practice
    const practiceEmailStatus = await sendMail({
      to: doctorEmail,
      subject: `🩺 [LEBENSWERK] Neue ${typeLabel} von ${newInquiry.firstName} ${newInquiry.lastName}`,
      html: doctorHtml,
    });

    // 2. Dispatch Confirmation Email to Patient / Tester!
    const patientEmailStatus = await sendMail({
      to: newInquiry.email,
      subject: `Ihre ${typeLabel} bei LEBENSWERK Physiotherapie (${newInquiry.firstName} ${newInquiry.lastName})`,
      html: patientHtml,
    });

    return res.status(201).json({
      success: true,
      inquiry: newInquiry,
      emailDelivery: {
        practice: practiceEmailStatus,
        patient: patientEmailStatus,
      },
    });
  } catch (error: any) {
    console.error('[API /api/contact Exception]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Serverfehler beim Verarbeiten der Anfrage',
    });
  }
}
