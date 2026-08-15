import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';

export async function POST(req: Request) {
  try {
    const { screenId, code, appVersion, resolution, ipAddress } = await req.json();

    let screen = screenId ? await db.getScreenById(screenId) : undefined;
    if (!screen && code) {
      screen = await db.getScreenByCode(code);
    }

    if (!screen) {
      return NextResponse.json({ error: 'الشاشة غير موجودة' }, { status: 404 });
    }

    const updated = await db.updateScreen(screen.id, {
      status: 'online',
      lastHeartbeatAt: new Date().toISOString(),
      appVersion: appVersion || screen.appVersion,
      resolution: resolution || screen.resolution,
      ipAddress: ipAddress || screen.ipAddress,
    });

    // Notify dashboard of screen status heartbeat
    realtime.notifyDashboard(screen.organizationId, 'screen_heartbeat', {
      screenId: screen.id,
      status: 'online',
      lastHeartbeatAt: updated?.lastHeartbeatAt,
    });

    // Retrieve pending commands for this screen
    const pendingCommands = await db.getPendingCommands(screen.id);

    return NextResponse.json({
      success: true,
      status: 'online',
      pendingCommands,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Heartbeat error' }, { status: 500 });
  }
}
