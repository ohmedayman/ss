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
  let screens = await db.getScreens(session.organization.id);

  // Auto-provision ready starter screens if organization has no screens yet
  if (screens.length === 0) {
    const branches = await db.getBranches(session.organization.id);
    const branchId = branches[0]?.id;

    const s1 = await db.createScreen({
      organizationId: session.organization.id,
      branchId,
      name: 'شاشة الاستقبال والعروض الرئيسية',
      registrationCode: 'SF-1082',
      pairingToken: 'tok_scr_1_' + session.organization.id,
      isPaired: true,
      status: 'online',
      lastHeartbeatAt: new Date().toISOString(),
      orientation: 'landscape',
      resolution: '1920x1080',
      activeContentType: 'playlist',
      activeContentId: 'pl-general-ads',
      screenshotUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&q=70',
      volume: 80,
      brightness: 100,
      notes: 'شاشة الاستقبال الرئيسية في المدخل الرئيسي',
      tags: ['استقبال', 'رئيسية'],
    });

    const s2 = await db.createScreen({
      organizationId: session.organization.id,
      branchId,
      name: 'شاشة صالة الانتظار ونظام الطوابير',
      registrationCode: 'SF-2026',
      pairingToken: 'tok_scr_2_' + session.organization.id,
      isPaired: true,
      status: 'online',
      lastHeartbeatAt: new Date().toISOString(),
      orientation: 'landscape',
      resolution: '1920x1080',
      activeContentType: 'template',
      activeContentId: 'tpl-clinic-waiting',
      screenshotUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=640&q=70',
      volume: 75,
      brightness: 100,
      notes: 'شاشة الانتظار المربوطة بنظام التنبيه الصوتي وأرقام الانتظار',
      tags: ['عيادات', 'طوابير', 'انتظار'],
    });

    screens = [s1, s2];
  }

  // Calculate online/offline dynamically without persisting to DB on every read
  const now = Date.now();
  const screensWithStatus = screens.map(s => {
    if (s.isPaired && s.lastHeartbeatAt) {
      const diff = now - new Date(s.lastHeartbeatAt).getTime();
      const isOnline = diff < 60000;
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
