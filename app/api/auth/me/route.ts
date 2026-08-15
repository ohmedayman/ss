import { NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    user: session.user,
    organization: session.organization,
  });
}
