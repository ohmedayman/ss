import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deleted = await db.deleteBranch(id, session.organization.id);

  if (deleted) {
    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'حذف فرع',
      actionType: 'screen',
      details: `تم حذف الفرع`,
    });
  }

  return NextResponse.json({ success: deleted });
}
