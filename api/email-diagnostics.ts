export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const smtpUser = process.env.SMTP_USER?.trim() || 'sadikudrit6@gmail.com';
  const smtpPass = process.env.SMTP_PASS?.trim() || 'emeplqyoycdmdect';
  const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const resendKey = process.env.RESEND_API_KEY?.trim();

  let activeProvider = 'Gmail SMTP';
  if (smtpUser && smtpPass) {
    activeProvider = smtpHost || (smtpUser.includes('@gmail.com') ? 'Gmail SMTP' : 'SMTP');
  } else if (resendKey) {
    activeProvider = 'Resend API';
  }

  return res.json({
    activeProvider,
    smtpConfigured: true,
    resendConfigured: !!resendKey,
    configuredSender: smtpUser,
    doctorRecipient: process.env.DOCTOR_NOTIFICATION_EMAIL || 'sadikudrit6@gmail.com, info@lebenswerk.praxismail.ch',
    timestamp: new Date().toISOString(),
  });
}
