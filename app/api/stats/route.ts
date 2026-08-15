import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.organization.id;

  const screens = await db.getScreens(orgId);
  const media = await db.getMedia(orgId);
  const playlists = await db.getPlaylists(orgId);
  const templates = await db.getTemplates(orgId);
  const schedules = await db.getSchedules(orgId);
  const logs = await db.getActivityLogs(orgId, 10);
  const queueServices = await db.getQueueServices(orgId);

  const now = Date.now();
  const onlineScreens = screens.filter(s => {
    if (!s.isPaired) return false;
    if (!s.lastHeartbeatAt) return false;
    return now - new Date(s.lastHeartbeatAt).getTime() < 45000;
  });

  const offlineScreens = screens.filter(s => !onlineScreens.some(os => os.id === s.id));

  const totalStorageBytes = session.organization.storageUsedBytes || 0;
  const storageLimitBytes = (session.organization.storageLimitMb || 10240) * 1024 * 1024;
  const storageUsagePercent = Math.min(100, Math.round((totalStorageBytes / storageLimitBytes) * 100));

  return NextResponse.json({
    stats: {
      totalScreens: screens.length,
      onlineScreens: onlineScreens.length,
      offlineScreens: offlineScreens.length,
      pairedScreens: screens.filter(s => s.isPaired).length,
      unpairedScreens: screens.filter(s => !s.isPaired).length,
      totalMedia: media.length,
      totalPlaylists: playlists.length,
      totalTemplates: templates.length,
      activeSchedules: schedules.filter(s => s.isActive).length,
      storageUsedBytes: totalStorageBytes,
      storageLimitMb: session.organization.storageLimitMb || 10240,
      storageUsagePercent,
      activeQueueServices: queueServices.length,
    },
    recentLogs: logs,
    organization: session.organization,
    user: session.user,
  });
}
