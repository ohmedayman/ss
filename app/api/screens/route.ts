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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const screens = await db.getScreens(session.organization.id);

  // Calculate online/offline dynamically without persisting to DB on every read
  const now = Date.now();
  const screensWithStatus = screens.map(s => {
    if (s.isPaired && s.lastHeartbeatAt) {
      const diff = now - new Date(s.lastHeartbeatAt).getTime();
      const isOnline = diff < 45000;
      if (isOnline !== (s.status === 'online')) {
        return { ...s, status: isOnline ? 'online' : 'offline' as const };
      }
    }
    return s;
  });

  return NextResponse.json({ screens: screensWithStatus });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const screenData: Record<string, any> = {
      organizationId: session.organization.id,
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
    };
    if (branchId) screenData.branchId = branchId;

    const newScreen = await db.createScreen(screenData as any);

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
    console.error('Create screen error:', error);
    return NextResponse.json({ error: 'فشل إضافة الشاشة' }, { status: 500 });
  }
}
