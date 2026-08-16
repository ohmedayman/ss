import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const template = await db.getTemplateById(id);

  if (!template || template.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'القالب غير موجود' }, { status: 404 });
  }

  return NextResponse.json({ template });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();

    const template = await db.getTemplateById(id);
    if (!template || template.organizationId !== session.organization.id) {
      return NextResponse.json({ error: 'القالب غير موجود' }, { status: 404 });
    }

    const updated = await db.updateTemplate(id, {
      name: body.name !== undefined ? body.name.trim() : template.name,
      layout: body.layout !== undefined ? body.layout : template.layout,
      zones: body.zones !== undefined ? body.zones : template.zones,
      backgroundColor: body.backgroundColor !== undefined ? body.backgroundColor : template.backgroundColor,
      headerTitle: body.headerTitle !== undefined ? body.headerTitle : template.headerTitle,
      thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl : template.thumbnailUrl,
    });

    // Notify connected screens playing this template
    const screens = await db.getScreens(session.organization.id);
    screens.forEach(scr => {
      if (scr.activeContentType === 'template' && scr.activeContentId === id) {
        realtime.notifyScreen(scr.id, 'template_updated', { templateId: id });
      }
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'تعديل قالب شاشة',
      actionType: 'screen',
      details: `تم تعديل مناطق وإعدادات القالب "${template.name}"`,
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (error: any) {
    console.error('Update template error:', error);
    return NextResponse.json({ error: 'فشل تحديث القالب' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const template = await db.getTemplateById(id);

  if (!template || template.organizationId !== session.organization.id) {
    return NextResponse.json({ error: 'القالب غير موجود' }, { status: 404 });
  }

  const name = template.name;
  const deleted = await db.deleteTemplate(id, session.organization.id);

  if (deleted) {
    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'حذف قالب',
      actionType: 'screen',
      details: `تم حذف القالب "${name}"`,
    });
  }

  return NextResponse.json({ success: deleted });
}
