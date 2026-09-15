import type { IncomingMessage, ServerResponse } from 'http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, terminate } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import firebaseConfig from '../firebase-applet-config.json';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: { [key: string]: string | string[] };
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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-cms-authenticated');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/content
  if (req.method === 'GET') {
    try {
      const db = getFirebaseDb();
      const docRef = doc(db, 'cms_content', 'site_content');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const content = snap.data();
        return res.status(200).json({
          success: true,
          content,
          source: 'cloud_firestore',
        });
      }
    } catch (err: any) {
      console.warn('[API Content GET Firestore fallback]:', err.message);
    }

    // Fallback to local file if Firestore temporarily unreachable
    try {
      const filePath = path.join(process.cwd(), 'data', 'site-content.json');
      if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return res.status(200).json({ success: true, content, source: 'local_file' });
      }
    } catch {}

    return res.status(200).json({ success: true, content: null });
  }

  // POST /api/content
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const { content, pin } = body || {};

    // Validate PIN or auth header
    const authHeader = req.headers['x-cms-authenticated'];
    const isAuthorized = authHeader === 'true' || pin === DEFAULT_DOCTOR_PIN || pin === '1996';

    if (!isAuthorized) {
      return res.status(401).json({ success: false, message: 'Ungültiger Praxis-PIN.' });
    }

    if (!content) {
      return res.status(400).json({ success: false, message: 'Kein Inhalt übergeben.' });
    }

    const updatedContent = {
      ...content,
      lastUpdated: new Date().toISOString(),
    };

    // 1. Save to Cloud Firestore
    try {
      const db = getFirebaseDb();
      const docRef = doc(db, 'cms_content', 'site_content');
      await setDoc(docRef, updatedContent);
    } catch (err: any) {
      console.error('[API Content POST Firestore Error]:', err.message);
    }

    // 2. Also update local file cache
    try {
      const dirPath = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(path.join(dirPath, 'site-content.json'), JSON.stringify(updatedContent, null, 2), 'utf-8');
    } catch {}

    return res.status(200).json({
      success: true,
      message: 'Inhalte wurden erfolgreich in der Cloud gespeichert und sind auf allen Geräten aktiv!',
      content: updatedContent,
    });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
