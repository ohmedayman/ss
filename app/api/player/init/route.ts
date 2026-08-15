import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateRandomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'SF-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const code = searchParams.get('code');

  // Check by pairing token
  if (token) {
    try {
      const screen = await db.getScreenByToken(token);
      if (screen && screen.isPaired) {
        return NextResponse.json({
          isPaired: true,
          screen,
        });
      }
    } catch (e) {
      console.error('Player init token lookup failed:', e);
    }
  }

  // Check by registration code
  if (code) {
    try {
      const screen = await db.getScreenByCode(code);
      if (screen) {
        // Make sure the code is saved for future refreshes
        return NextResponse.json({
          isPaired: screen.isPaired,
          screen,
          registrationCode: screen.registrationCode,
        });
      }
    } catch (e) {
      console.error('Player init code lookup failed:', e);
    }
  }

  // ONLY create a new screen if there is truly no code/token at all
  // (first-time visitor with empty localStorage)
  const newCode = generateRandomCode();
  const data = await db.getData();
  const org = data.organizations[0];

  try {
    const screen = await db.createScreen({
      organizationId: org ? org.id : 'org-screenflow-demo',
      name: `شاشة جديدة (${newCode})`,
      registrationCode: newCode,
      isPaired: false,
      status: 'offline',
      orientation: 'landscape',
      resolution: '1920x1080',
      activeContentType: 'playlist',
      activeContentId: 'pl-general-ads',
      volume: 80,
      brightness: 100,
      tags: ['شاشة'],
    });

    return NextResponse.json({
      isPaired: false,
      registrationCode: newCode,
      screen,
    });
  } catch (e: any) {
    console.error('Player init create screen failed:', e);
    return NextResponse.json({
      isPaired: false,
      registrationCode: newCode,
      screen: null,
      error: e.message,
    });
  }
}
