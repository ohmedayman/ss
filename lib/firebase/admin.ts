import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: Storage | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT) || getApps().length > 0;
}

export function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured');
  }
  const serviceAccount = JSON.parse(serviceAccountRaw);
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  return app;
}

export function getDb(): Firestore {
  if (!db) db = getFirestore(getAdminApp());
  return db;
}

export function getAdminAuth(): Auth {
  if (!auth) auth = getAuth(getAdminApp());
  return auth;
}

export function getAdminStorage(): Storage {
  if (!storage) storage = getStorage(getAdminApp());
  return storage;
}
