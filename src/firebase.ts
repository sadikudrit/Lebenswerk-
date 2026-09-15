import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  type Unsubscribe, 
  type Firestore 
} from 'firebase/firestore';
import type { SiteContent } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const CONTENT_DOC_PATH = 'cms_content/site_content';

/**
 * Real-time subscription to site content from Cloud Firestore.
 * When any device saves a CMS edit, all subscribed devices immediately receive the update.
 */
export function subscribeToSiteContent(
  onData: (content: SiteContent) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'cms_content', 'site_content');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteContent;
        onData(data);
      }
    },
    (error) => {
      console.warn('[Firestore Subscription Notice]:', error.message);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Fetches the current site content document from Cloud Firestore.
 */
export async function getSiteContentFromFirestore(): Promise<SiteContent | null> {
  const path = CONTENT_DOC_PATH;
  try {
    const docRef = doc(db, 'cms_content', 'site_content');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as SiteContent;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves site content directly to Cloud Firestore.
 * Persists changes permanently so they appear across all devices.
 */
export async function saveSiteContentToFirestore(content: SiteContent): Promise<boolean> {
  const path = CONTENT_DOC_PATH;
  try {
    const docRef = doc(db, 'cms_content', 'site_content');
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
