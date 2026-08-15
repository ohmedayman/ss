import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await req.json();

    const schedule = db.getData().schedules.find(s => s.id === id);
    if (!schedule || schedule.organizationId !== session.organization.id) {
      return NextResponse.json({ error: 'الجدول غير موجود' }, { status: 404 });
    }

    const updated = db.updateSchedule(id, {
      name: body.name !== undefined ? body.name.trim() : schedule.name,
      targetType: body.targetType !== undefined ? body.targetType : schedule.targetType,
      targetId: body.targetId !== undefined ? body.targetId : schedule.targetId,
      screenIds: body.screenIds !== undefined ? body.screenIds : schedule.screenIds,
      startDate: body.startDate !== undefined ? body.startDate : schedule.startDate,
      endDate: body.endDate !== undefined ? body.endDate : schedule.endDate,
      startTime: body.startTime !== undefined ? body.startTime : schedule.startTime,
      endTime: body.endTime !== undefined ? body.endTime : schedule.endTime,
      daysOfWeek: body.daysOfWeek !== undefined ? body.daysOfWeek : schedule.daysOfWeek,
      priority: body.priority !== undefined ? parseInt(body.priority.toString(), 10) : schedule.priority,
      isActive: body.isActive !== undefined ? body.isActive : schedule.isActive,
    });

    db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'تعديل جدول زمني',
      actionType: 'schedule',
      details: `تم تحديث مواعيد وقواعد الجدول "${schedule.name}"`,
    });

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل تحديث الجدول' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const schedule = db.getData().schedules.find(s => s.id === id);

  if (!schedule || schedule.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'الجدول غير موجود' }, { status: 404 });
  }

  const name = schedule.name;
  const deleted = db.deleteSchedule(id, session.organization.id);

  if (deleted) {
    db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'حذف جدول زمني',
      actionType: 'schedule',
      details: `تم حذف الجدول "${name}"`,
    });
  }

  return NextResponse.json({ success: deleted });
}
