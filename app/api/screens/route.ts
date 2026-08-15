import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';

function generateRegistrationCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'SF-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  const session = await getSession();
  const screens = await db.getScreens(session.organization.id);

  // Calculate online/offline dynamically if heartbeat is older than 35 seconds
  const now = Date.now();
  const updatedScreens: typeof screens = [];
  for (const s of screens) {
    let screen = s;
    if (s.isPaired && s.lastHeartbeatAt) {
      const diff = now - new Date(s.lastHeartbeatAt).getTime();
      const isOnline = diff < 45000; // 45 seconds tolerance
      if (isOnline !== (s.status === 'online')) {
        const updated = await db.updateScreen(s.id, { status: isOnline ? 'online' : 'offline' });
        screen = updated || s;
      }
    }
    updatedScreens.push(screen);
  }

  return NextResponse.json({ screens: updatedScreens });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();

    const {
      name,
      orientation = 'landscape',
      resolution = '1920x1080',
      activeContentType = 'playlist',
      activeContentId,
      branchId,
      notes,
      tags = [],
    } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'اسم الشاشة مطلوب' }, { status: 400 });
    }

    const regCode = generateRegistrationCode();

    const newScreen = await db.createScreen({
      organizationId: session.organization.id,
      branchId,
      name: name.trim(),
      registrationCode: regCode,
      isPaired: false,
      status: 'offline',
      orientation,
      resolution,
      activeContentType,
      activeContentId,
      volume: 80,
      brightness: 100,
      notes,
      tags,
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إضافة شاشة جديدة',
      actionType: 'screen',
      details: `تمت إضافة شاشة جديدة باسم "${newScreen.name}" برمز اقتران ${newScreen.registrationCode}`,
    });

    realtime.notifyDashboard(session.organization.id, 'screen_created', newScreen);

    return NextResponse.json({ success: true, screen: newScreen });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إضافة الشاشة' }, { status: 500 });
  }
}
