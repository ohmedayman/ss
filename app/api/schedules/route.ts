import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const schedules = db.getSchedules(session.organization.id);
  return NextResponse.json({ schedules });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const {
      name,
      targetType = 'playlist',
      targetId,
      screenIds = [],
      startDate = new Date().toISOString().split('T')[0],
      endDate = '2030-12-31',
      startTime = '08:00',
      endTime = '22:00',
      daysOfWeek = [0, 1, 2, 3, 4, 5, 6],
      priority = 1,
      isActive = true,
    } = body;

    if (!name || !name.trim() || !targetId) {
      return NextResponse.json({ error: 'الاسم والمحتوى المستهدف مطلوبان للجدول' }, { status: 400 });
    }

    const schedule = db.createSchedule({
      organizationId: session.organization.id,
      name: name.trim(),
      targetType,
      targetId,
      screenIds,
      startDate,
      endDate,
      startTime,
      endTime,
      daysOfWeek,
      priority: parseInt(priority.toString(), 10) || 1,
      isActive,
    });

    db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إنشاء جدول زمني',
      actionType: 'schedule',
      details: `تم إنشاء جدول جديد: "${schedule.name}" من ${schedule.startTime} إلى ${schedule.endTime}`,
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إنشاء الجدول' }, { status: 500 });
  }
}
