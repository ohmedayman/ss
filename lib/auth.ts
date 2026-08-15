import { cookies } from 'next/headers';
import { db } from './db';
import { User, Organization } from './types';

const SESSION_COOKIE_NAME = 'sf_session';
const DEFAULT_ORG_ID = 'org-screenflow-demo';
const DEFAULT_USER_ID = 'usr-admin-1';

export interface SessionData {
  user: User;
  organization: Organization;
}

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // If a valid session cookie exists, we could decode it.
  // For demo/development, default to our configured admin user and organization
  let user = db.getUser(DEFAULT_USER_ID);
  let org = db.getOrganization(DEFAULT_ORG_ID);

  if (!user || !org) {
    const data = db.getData();
    user = data.users[0];
    org = data.organizations[0];
  }

  return {
    user: user!,
    organization: org!,
  };
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
