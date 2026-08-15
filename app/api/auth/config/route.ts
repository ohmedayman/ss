import { NextResponse } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    firebaseReady: isFirebaseConfigured(),
  });
}