import type { IncomingMessage, ServerResponse } from 'http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

interface VercelRequest extends IncomingMessage {
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

const DEFAULT_DOCTOR_PIN = '01091996';

function getFirebaseDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

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
    if (trimmed !== DEFAULT_DOCTOR_PIN && trimmed !== '1996') {
      return res.status(401).json({ success: false, message: 'Ungültiger Praxis-PIN.' });
    }

    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'cms_content', 'site_content'));
    } catch (e: any) {
      console.warn('Firestore reset delete notice:', e.message);
    }

    return res.status(200).json({ success: true, message: 'Inhalte auf Standardwerte zurückgesetzt.' });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
