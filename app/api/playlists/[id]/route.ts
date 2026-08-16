import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const playlist = await db.getPlaylistById(id);

  if (!playlist || playlist.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'قائمة التشغيل غير موجودة' }, { status: 404 });
  }

  const allMedia = await db.getMedia(session.organization.id);
  const mediaMap = new Map(allMedia.map(m => [m.id, m]));

  const enriched = {
    ...playlist,
    items: playlist.items.map(item => ({
      ...item,
      media: item.mediaId ? mediaMap.get(item.mediaId) : undefined,
    })),
  };

  return NextResponse.json({ playlist: enriched });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();

    const playlist = await db.getPlaylistById(id);
    if (!playlist || playlist.organizationId !== session.organization.id) {
      return NextResponse.json({ error: 'قائمة التشغيل غير موجودة' }, { status: 404 });
    }

    const {
      name,
      description,
      isLoop,
      defaultTransition,
      items,
    } = body;

    const totalDuration = items && Array.isArray(items)
      ? items.reduce((acc: number, item: any) => acc + (parseInt(item.durationSeconds, 10) || 10), 0)
      : playlist.totalDurationSeconds;

    const updated = await db.updatePlaylist(id, {
      name: name !== undefined ? name.trim() : playlist.name,
      description: description !== undefined ? description : playlist.description,
      isLoop: isLoop !== undefined ? isLoop : playlist.isLoop,
      defaultTransition: defaultTransition !== undefined ? defaultTransition : playlist.defaultTransition,
      totalDurationSeconds: totalDuration,
      items: items !== undefined ? items.map((item: any, idx: number) => ({
        id: item.id || ('pli-' + Math.random().toString(36).substring(2, 9)),
        playlistId: id,
        mediaId: item.mediaId,
        customUrl: item.customUrl,
        customText: item.customText,
        orderIndex: idx,
        durationSeconds: parseInt(item.durationSeconds, 10) || 10,
        transition: item.transition || defaultTransition || 'fade',
        isMuted: item.isMuted !== undefined ? item.isMuted : true,
      })) : playlist.items,
    });

    // Notify all screens playing this playlist to refresh seamlessly
    const screens = await db.getScreens(session.organization.id);
    screens.forEach(scr => {
      if (scr.activeContentType === 'playlist' && scr.activeContentId === id) {
        realtime.notifyScreen(scr.id, 'playlist_updated', { playlistId: id });
      }
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'تعديل قائمة تشغيل',
      actionType: 'playlist',
      details: `تم تحديث عناصر وتوقيتات قائمة التشغيل "${playlist.name}"`,
    });

    return NextResponse.json({ success: true, playlist: updated });
  } catch (error: any) {
    console.error('Update playlist error:', error);
    return NextResponse.json({ error: 'فشل تحديث قائمة التشغيل' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const playlist = await db.getPlaylistById(id);

  if (!playlist || playlist.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'قائمة التشغيل غير موجودة' }, { status: 404 });
  }

  const name = playlist.name;
  const deleted = await db.deletePlaylist(id, session.organization.id);

  if (deleted) {
    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'حذف قائمة تشغيل',
      actionType: 'playlist',
      details: `تم حذف قائمة التشغيل "${name}"`,
    });
  }

  return NextResponse.json({ success: deleted });
}
