import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(getServiceAccountRaw());
}

function getServiceAccountRaw(): string {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return process.env.FIREBASE_SERVICE_ACCOUNT;
  try {
    const filePath = join(process.cwd(), 'firebase-service-account.json');
    if (existsSync(filePath)) return readFileSync(filePath, 'utf-8');
  } catch (e) {
    // ignore missing/invalid file
  }
  return '';
}

async function loadFirebaseAdmin() {
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');

  if (getApps().length) {
    app = getApps()[0];
    return;
  }

  const serviceAccountRaw = getServiceAccountRaw();
  if (!serviceAccountRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured');
  }
  const serviceAccount = JSON.parse(serviceAccountRaw);
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export async function getAdminApp(): Promise<any> {
  if (app) return app;
  await loadFirebaseAdmin();
  return app;
}

export async function getDb(): Promise<any> {
  if (db) return db;
  const { getFirestore } = await import('firebase-admin/firestore');
  db = getFirestore(await getAdminApp());
  return db;
}

export async function getAdminAuth(): Promise<any> {
  if (auth) return auth;
  const { getAuth } = await import('firebase-admin/auth');
  auth = getAuth(await getAdminApp());
  return auth;
}

export async function getAdminStorage(): Promise<any> {
  if (storage) return storage;
  const { getStorage } = await import('firebase-admin/storage');
  storage = getStorage(await getAdminApp());
  return storage;
}
