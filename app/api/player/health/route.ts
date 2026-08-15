import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';

export async function POST(req: Request) {
  try {
    const {
      screenId,
      code,
      batteryLevel,
      batteryCharging,
      storageUsedMb,
      storageTotalMb,
      uptimeHours,
      cpuUsage,
      memoryUsageMb,
      memoryTotalMb,
      networkType,
      networkSpeedMbps,
      temperatureC,
    } = await req.json();

    let screen = screenId ? await db.getScreenById(screenId) : undefined;
    if (!screen && code) {
      screen = await db.getScreenByCode(code);
    }

    if (!screen) {
      return NextResponse.json({ error: 'الشاشة غير موجودة' }, { status: 404 });
    }

    const healthData: Record<string, any> = { healthReportedAt: new Date().toISOString() };
    if (batteryLevel !== undefined) healthData.batteryLevel = batteryLevel;
    if (batteryCharging !== undefined) healthData.batteryCharging = batteryCharging;
    if (storageUsedMb !== undefined) healthData.storageUsedMb = storageUsedMb;
    if (storageTotalMb !== undefined) healthData.storageTotalMb = storageTotalMb;
    if (uptimeHours !== undefined) healthData.uptimeHours = uptimeHours;
    if (cpuUsage !== undefined) healthData.cpuUsage = cpuUsage;
    if (memoryUsageMb !== undefined) healthData.memoryUsageMb = memoryUsageMb;
    if (memoryTotalMb !== undefined) healthData.memoryTotalMb = memoryTotalMb;
    if (networkType !== undefined) healthData.networkType = networkType;
    if (networkSpeedMbps !== undefined) healthData.networkSpeedMbps = networkSpeedMbps;
    if (temperatureC !== undefined) healthData.temperatureC = temperatureC;

    const updated = await db.updateScreen(screen.id, healthData);

    realtime.notifyDashboard(screen.organizationId, 'screen_health', {
      screenId: screen.id,
      ...healthData,
    });

    return NextResponse.json({ success: true, screen: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Health report error' }, { status: 500 });
  }
}
