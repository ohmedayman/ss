import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const screen = await db.getScreenById(id);

  if (!screen || screen.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'الشاشة غير موجودة' }, { status: 404 });
  }

  const commands = await db.getPendingCommands(id);

  return NextResponse.json({ screen, pendingCommands: commands });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();

    const screen = await db.getScreenById(id);
    if (!screen || screen.organizationId !== session.organization.id) {
      return NextResponse.json({ error: 'الشاشة غير موجودة' }, { status: 404 });
    }

    const updated = await db.updateScreen(id, {
      name: body.name !== undefined ? body.name : screen.name,
      orientation: body.orientation !== undefined ? body.orientation : screen.orientation,
      resolution: body.resolution !== undefined ? body.resolution : screen.resolution,
      activeContentType: body.activeContentType !== undefined ? body.activeContentType : screen.activeContentType,
      activeContentId: body.activeContentId !== undefined ? body.activeContentId : screen.activeContentId,
      branchId: body.branchId !== undefined ? body.branchId : screen.branchId,
      volume: body.volume !== undefined ? body.volume : screen.volume,
      brightness: body.brightness !== undefined ? body.brightness : screen.brightness,
      notes: body.notes !== undefined ? body.notes : screen.notes,
      tags: body.tags !== undefined ? body.tags : screen.tags,
      isPaired: body.isPaired !== undefined ? body.isPaired : screen.isPaired,
    });

    // Notify real-time player to refresh content immediately
    realtime.notifyScreen(id, 'content_updated', {
      activeContentType: updated?.activeContentType,
      activeContentId: updated?.activeContentId,
      volume: updated?.volume,
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'تحديث بيانات الشاشة',
      actionType: 'screen',
      details: `تم تحديث إعدادات ومحتوى شاشة "${screen.name}"`,
    });

    return NextResponse.json({ success: true, screen: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل تحديث الشاشة' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const screen = await db.getScreenById(id);

  if (!screen || screen.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'الشاشة غير موجودة' }, { status: 404 });
  }

  const screenName = screen.name;
  const deleted = await db.deleteScreen(id, session.organization.id);

  if (deleted) {
    // Notify player if connected that it's unlinked
    realtime.notifyScreen(id, 'unlinked', {});

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'حذف شاشة',
      actionType: 'screen',
      details: `تم حذف الشاشة "${screenName}" من النظام`,
    });
  }

  return NextResponse.json({ success: deleted });
}
