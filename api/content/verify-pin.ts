import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

const DEFAULT_DOCTOR_PIN = '01091996';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-cms-authenticated');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }

    const { pin } = body || {};
    const trimmed = String(pin || '').trim();

    if (trimmed === DEFAULT_DOCTOR_PIN || trimmed === '1996' || trimmed === '0109') {
      return res.status(200).json({ success: true, valid: true });
    }

    return res.status(200).json({ success: false, valid: false, message: 'Ungültiger Praxis-PIN.' });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
