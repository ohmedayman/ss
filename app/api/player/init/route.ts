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
    const screen = db.getScreenByToken(token);
    if (screen && screen.isPaired) {
      return NextResponse.json({
        isPaired: true,
        screen,
      });
    }
  }

  // Check by registration code
  if (code) {
    const screen = db.getScreenByCode(code);
    if (screen) {
      return NextResponse.json({
        isPaired: screen.isPaired,
        screen,
        registrationCode: screen.registrationCode,
      });
    }
  }

  // Otherwise generate a new registration code and placeholder screen
  const newCode = generateRandomCode();
  const org = db.getData().organizations[0];

  const screen = db.createScreen({
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
    tags: ['جديدة'],
  });

  return NextResponse.json({
    isPaired: false,
    registrationCode: newCode,
    screen,
  });
}
