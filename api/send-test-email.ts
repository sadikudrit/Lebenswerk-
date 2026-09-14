import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { email } = body || {};
    const targetEmail = (email || process.env.DOCTOR_NOTIFICATION_EMAIL || 'sadikudrit6@gmail.com').trim();

    const smtpUser = process.env.SMTP_USER?.trim().replace(/^["']|["']$/g, '');
    const smtpPass = process.env.SMTP_PASS?.replace(/^["']|["']$/g, '');
    const smtpHost = process.env.SMTP_HOST?.trim().replace(/^["']|["']$/g, '');
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    const testSubject = `✅ [LEBENSWERK] E-Mail Testnachricht (${new Date().toLocaleTimeString('de-CH')})`;
    const testHtml = `
      <div style="font-family: sans-serif; max-width: 540px; padding: 20px; border: 1px solid #A5D6A7; border-radius: 12px; color: #1B5E20;">
        <h2 style="color: #1B5E20; margin-top: 0;">E-Mail-Versand erfolgreich konfiguriert!</h2>
        <p>Dies ist eine automatische Testnachricht von Ihrer <strong>LEBENSWERK Physiotherapie</strong> Website.</p>
        <div style="background: #E8F5E9; padding: 12px; border-radius: 8px;">
          <p style="margin: 0;"><strong>Empfänger:</strong> ${targetEmail}</p>
          <p style="margin: 4px 0 0;"><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-CH', { timeZone: 'Europe/Zurich' })}</p>
        </div>
      </div>
    `;

    if (smtpUser && smtpPass) {
      try {
        let transporterConfig: any;
        if (smtpHost) {
          transporterConfig = {
            host: smtpHost,
            port: smtpPort || (smtpSecure ? 465 : 587),
            secure: smtpSecure,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false }
          };
        } else if (smtpUser.toLowerCase().includes('praxismail.ch')) {
          transporterConfig = {
            host: 'mail.praxismail.ch',
            port: 587,
            secure: false,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false }
          };
        } else if (smtpUser.toLowerCase().includes('@gmail.com')) {
          transporterConfig = {
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass.replace(/[\s]/g, '') }
          };
        } else {
          transporterConfig = {
            host: 'asmtp.mail.hostpoint.ch',
            port: 465,
            secure: true,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false }
          };
        }

        const transporter = nodemailer.createTransport(transporterConfig);
        const info = await transporter.sendMail({
          from: `"LEBENSWERK System" <${smtpUser}>`,
          to: targetEmail,
          subject: testSubject,
          html: testHtml,
        });

        return res.json({
          success: true,
          provider: smtpHost || 'SMTP',
          messageId: info.messageId,
          message: `E-Mail erfolgreich via SMTP an ${targetEmail} gesendet!`
        });
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: `SMTP Fehler: ${err.message}`
        });
      }
    }

    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'LEBENSWERK <onboarding@resend.dev>',
          to: targetEmail,
          subject: testSubject,
          html: testHtml,
        });
        if (result.error) throw new Error(result.error.message);
        return res.json({
          success: true,
          provider: 'Resend',
          message: `E-Mail erfolgreich via Resend an ${targetEmail} gesendet!`
        });
      } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message });
      }
    }

    return res.status(400).json({
      success: false,
      error: 'Keine E-Mail Zugangsdaten in Vercel gefunden (SMTP_USER / SMTP_PASS oder RESEND_API_KEY fehlen).'
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
