import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Screen, Playlist, ScreenTemplate, MediaItem, QueueService, QueueTicket } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const screenId = searchParams.get('screenId');
  const code = searchParams.get('code');
  const token = searchParams.get('token');

  let screen: Screen | undefined;

  if (screenId) {
    screen = await db.getScreenById(screenId);
  } else if (token) {
    screen = await db.getScreenByToken(token);
  } else if (code) {
    screen = await db.getScreenByCode(code);
  }

  if (!screen) {
    return NextResponse.json({ error: 'الشاشة غير موجودة أو غير مقترنة' }, { status: 404 });
  }

  // Check if screen has an active schedule running right now
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 6 = Sat
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHour}:${currentMinute}`;
  const currentDateStr = now.toISOString().split('T')[0];

  const schedules = (await db.getSchedules(screen.organizationId)).filter(s => s.isActive);
  let effectiveContentType = screen.activeContentType;
  let effectiveContentId = screen.activeContentId;

  for (const sch of schedules) {
    const appliesToScreen = sch.screenIds.length === 0 || sch.screenIds.includes(screen.id);
    const dateInRange = (!sch.startDate || currentDateStr >= sch.startDate) && (!sch.endDate || currentDateStr <= sch.endDate);
    const dayMatches = sch.daysOfWeek.includes(currentDay);
    const timeInRange = (!sch.startTime || currentTimeStr >= sch.startTime) && (!sch.endTime || currentTimeStr <= sch.endTime);

    if (appliesToScreen && dateInRange && dayMatches && timeInRange) {
      effectiveContentType = sch.targetType;
      effectiveContentId = sch.targetId;
      break;
    }
  }

  // Resolve content payload
  let payload: {
    contentType: string;
    playlist?: Playlist;
    template?: ScreenTemplate;
    media?: MediaItem;
    webUrl?: string;
    canvasLayers?: any[];
    canvasBackground?: string;
    queueServices?: QueueService[];
    queueTickets?: QueueTicket[];
    allMediaItems?: Record<string, MediaItem>;
  } = {
    contentType: effectiveContentType,
  };

  const allMedia = await db.getMedia(screen.organizationId);
  const mediaMap: Record<string, MediaItem> = {};
  allMedia.forEach(m => {
    mediaMap[m.id] = m;
  });
  payload.allMediaItems = mediaMap;

  if (effectiveContentType === 'playlist') {
    const playlist = await db.getPlaylistById(effectiveContentId || 'pl-general-ads');
    if (playlist) {
      const enrichedItems = playlist.items.map(item => ({
        ...item,
        media: item.mediaId ? mediaMap[item.mediaId] : undefined,
      }));
      payload.playlist = {
        ...playlist,
        items: enrichedItems,
      };
    }
  } else if (effectiveContentType === 'template') {
    const template = await db.getTemplateById(effectiveContentId || 'tpl-clinic-waiting');
    if (template) {
      payload.template = template;
      payload.queueServices = await db.getQueueServices(screen.organizationId);
      payload.queueTickets = await db.getQueueTickets(screen.organizationId);

      const playlistZone = template.zones.find(z => z.type === 'playlist');
      if (playlistZone && playlistZone.contentId) {
        const pl = await db.getPlaylistById(playlistZone.contentId);
        if (pl) {
          payload.playlist = {
            ...pl,
            items: pl.items.map(item => ({
              ...item,
              media: item.mediaId ? mediaMap[item.mediaId] : undefined,
            })),
          };
        }
      }
    }
  } else if (effectiveContentType === 'media') {
    const media = await db.getMediaById(effectiveContentId || 'med-1');
    if (media) {
      payload.media = media;
    }
  } else if (effectiveContentType === 'url') {
    payload.webUrl = effectiveContentId || 'https://www.alarabiya.net';
  } else if (effectiveContentType === 'canvas') {
    // Canvas mode: layers are stored on the screen object itself
    payload.canvasLayers = screen.canvasLayers || [];
    payload.canvasBackground = screen.canvasBackground || '#0f172a';
  }

  return NextResponse.json({
    screen,
    content: payload,
    timestamp: Date.now(),
  });
}
