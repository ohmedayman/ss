import { cookies } from 'next/headers';
import { db, DEFAULT_ORG_ID, DEFAULT_USER_ID } from './db';
import { getAdminAuth, isFirebaseConfigured } from './firebase/admin';
import { User, Organization } from './types';

const SESSION_COOKIE_NAME = 'sf_session';

export interface SessionData {
  user: User;
  organization: Organization;
}

async function loadDefaultSession(): Promise<SessionData> {
  let user = await db.getUser(DEFAULT_USER_ID);
  let org = await db.getOrganization(DEFAULT_ORG_ID);
  if (!user || !org) {
    const data = await db.getData();
    user = data.users[0];
    org = data.organizations[0];
  }
  return {
    user: user!,
    organization: org!,
  };
}

export async function getSession(): Promise<SessionData | null> {
  await db.seedIfEmpty();

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (session && isFirebaseConfigured()) {
    try {
      const decoded = await (await getAdminAuth()).verifySessionCookie(session, true);
      const user = await db.getUser(decoded.uid);
      if (user) {
        const org = await db.getOrganization(user.organizationId);
        if (org) return { user, organization: org };
      } else {
        console.warn('getSession: user not found for uid:', decoded.uid);
      }
    } catch (e: any) {
      console.warn('getSession: session cookie invalid:', e.message);
    }
  }

  // Local dev fallback (no Firebase configured)
  if (!isFirebaseConfigured()) {
    return loadDefaultSession();
  }

  // Production with Firebase: no valid session
  return null;
}

// Create an HTTP-only session cookie from a Firebase ID token (client-side sign-in)
export async function createSessionFromIdToken(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
  const sessionCookie = await (await getAdminAuth()).createSessionCookie(idToken, { expiresIn });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

// Local/demo fallback session
export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
