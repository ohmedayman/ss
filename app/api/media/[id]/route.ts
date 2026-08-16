import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { deleteFromFirebaseStorage, isStorageConfigured } from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const item = await db.getMediaById(id);
  if (!item || item.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 });
  }

  const body = await req.json();
  const { name, folder, tags, customTickerText, customUrl } = body;

  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (folder !== undefined) updates.folder = folder;
  if (tags !== undefined) updates.tags = tags;
  if (customTickerText !== undefined) updates.customTickerText = customTickerText;
  if (customUrl !== undefined) updates.customUrl = customUrl;

  const updated = await db.updateMedia(id, updates);

  await db.logActivity({
    organizationId: session.organization.id,
    userId: session.user.id,
    userName: session.user.fullName,
    action: 'تعديل وسائط',
    actionType: 'media',
    details: `تم تعديل "${name || item.name}"`,
  });

  return NextResponse.json({ success: true, media: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const item = await db.getMediaById(id);

  if (!item || item.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 });
  }

  const name = item.name;

  // Delete from storage when hosted remotely (Firebase)
  if (isStorageConfigured() && item.fileUrl) {
    await deleteFromFirebaseStorage(item.fileUrl);
  }

  const deleted = await db.deleteMedia(id, session.organization.id);

  if (deleted) {
    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'حذف ملف وسائط',
      actionType: 'media',
      details: `تم حذف ملف الوسائط "${name}"`,
    });
  }

  return NextResponse.json({ success: deleted });
}
