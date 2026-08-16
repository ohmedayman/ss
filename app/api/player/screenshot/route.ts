import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';

export async function POST(req: Request) {
  try {
    const { screenId, code, screenshotBase64 } = await req.json();

    let screen = screenId ? await db.getScreenById(screenId) : undefined;
    if (!screen && code) {
      screen = await db.getScreenByCode(code);
    }

    if (!screen) {
      return NextResponse.json({ error: 'الشاشة غير موجودة' }, { status: 404 });
    }

    const now = new Date().toISOString();
    await db.updateScreen(screen.id, {
      screenshotUrl: screenshotBase64,
      lastScreenshotAt: now,
    });

    realtime.notifyDashboard(screen.organizationId, 'screen_screenshot_updated', {
      screenId: screen.id,
      screenshotUrl: screenshotBase64,
      lastScreenshotAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Screenshot error:', error);
    return NextResponse.json({ error: 'خطأ في رفع لقطة الشاشة' }, { status: 500 });
  }
}
