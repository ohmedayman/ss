import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const playlists = await db.getPlaylists(session.organization.id);
  const allMedia = await db.getMedia(session.organization.id);
  const mediaMap = new Map(allMedia.map(m => [m.id, m]));

  // Populate media items
  const enriched = playlists.map(pl => ({
    ...pl,
    items: pl.items.map(item => ({
      ...item,
      media: item.mediaId ? mediaMap.get(item.mediaId) : undefined,
    })),
  }));

  return NextResponse.json({ playlists: enriched });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const {
      name,
      description,
      isLoop = true,
      defaultTransition = 'fade',
      items = [],
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم قائمة التشغيل مطلوب' }, { status: 400 });
    }

    const totalDuration = items.reduce((acc: number, item: any) => acc + (parseInt(item.durationSeconds, 10) || 10), 0);

    const newPlaylist = await db.createPlaylist({
      organizationId: session.organization.id,
      name: name.trim(),
      description,
      isLoop,
      defaultTransition,
      totalDurationSeconds: totalDuration,
      items: items.map((item: any, idx: number) => ({
        id: 'pli-' + Math.random().toString(36).substring(2, 9),
        playlistId: '',
        mediaId: item.mediaId,
        customUrl: item.customUrl,
        customText: item.customText,
        orderIndex: idx,
        durationSeconds: parseInt(item.durationSeconds, 10) || 10,
        transition: item.transition || defaultTransition,
        isMuted: item.isMuted !== undefined ? item.isMuted : true,
      })),
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إنشاء قائمة تشغيل',
      actionType: 'playlist',
      details: `تم إنشاء قائمة التشغيل "${newPlaylist.name}" بعدد ${items.length} عناصر`,
    });

    return NextResponse.json({ success: true, playlist: newPlaylist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إنشاء قائمة التشغيل' }, { status: 500 });
  }
}
