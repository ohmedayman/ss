import { NextResponse } from 'next/server';
import { STOCK_MEDIA_CATALOG, StockMediaItem } from '@/lib/stock-media';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  let items = [...STOCK_MEDIA_CATALOG];

  if (category && category !== 'all') {
    items = items.filter((item) => item.category === category);
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    total: items.length,
    items,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stockId, customName } = await req.json();

    const stockItem = STOCK_MEDIA_CATALOG.find((item) => item.id === stockId);
    if (!stockItem) {
      return NextResponse.json({ error: 'عنصر المحتوى الجاهز غير موجود' }, { status: 404 });
    }

    // Import into organization's media library
    const newMedia = await db.createMedia({
      organizationId: session.organization.id,
      name: customName && customName.trim() ? customName.trim() : stockItem.name,
      fileType: stockItem.fileType,
      fileUrl: stockItem.fileUrl,
      thumbnailUrl: stockItem.thumbnailUrl,
      fileSizeBytes: stockItem.fileSizeBytes,
      durationSeconds: stockItem.durationSeconds,
      width: stockItem.width,
      height: stockItem.height,
      folder: stockItem.categoryLabel,
      tags: stockItem.tags,
      customTickerText: stockItem.customTickerText,
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'استيراد محتوى جاهز من الإنترنت',
      actionType: 'media',
      details: `تم استيراد "${newMedia.name}" من مكتبة المحتوى الجاهز (${newMedia.fileType})`,
    });

    return NextResponse.json({
      success: true,
      media: newMedia,
      message: 'تم استيراد المحتوى وإضافته لمكتبتك بنجاح 🎉',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل استيراد المحتوى' }, { status: 500 });
  }
}
