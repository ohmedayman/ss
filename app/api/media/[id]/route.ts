import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { deleteFromFirebaseStorage, isStorageConfigured } from '@/lib/storage';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
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
