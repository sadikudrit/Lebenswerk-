export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();

  let activeProvider = 'None';
  if (smtpUser && smtpPass) {
    activeProvider = smtpHost || (smtpUser.includes('@gmail.com') ? 'Gmail' : 'SMTP');
  } else if (resendKey) {
    activeProvider = 'Resend API';
  }

  return res.json({
    activeProvider,
    smtpConfigured: !!(smtpUser && smtpPass),
    resendConfigured: !!resendKey,
    configuredSender: smtpUser || (resendKey ? 'onboarding@resend.dev' : 'Not configured'),
    doctorRecipient: process.env.DOCTOR_NOTIFICATION_EMAIL || 'info@lebenswerk.praxismail.ch',
    timestamp: new Date().toISOString(),
  });
}
