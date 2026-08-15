import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const item = db.getMediaById(id);

  if (!item || item.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 });
  }

  const name = item.name;
  const deleted = db.deleteMedia(id, session.organization.id);

  if (deleted) {
    db.logActivity({
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
