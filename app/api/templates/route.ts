import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const templates = await db.getTemplates(session.organization.id);
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const {
      name,
      layout = 'split_3_sidebar',
      zones = [],
      backgroundColor = '#0a0f1d',
      sidebarColor = '#0f172a',
      cardColor = '#1e1b4b',
      accentColor = '#f59e0b',
      textColor = '#ffffff',
      tickerBgColor = '#1e1b4b',
      tickerTextColor = '#e0e7ff',
      headerTitle,
      logoUrl,
      thumbnailUrl,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم القالب مطلوب' }, { status: 400 });
    }

    const template = await db.createTemplate({
      organizationId: session.organization.id,
      name: name.trim(),
      layout,
      zones,
      backgroundColor,
      sidebarColor,
      cardColor,
      accentColor,
      textColor,
      tickerBgColor,
      tickerTextColor,
      headerTitle,
      logoUrl,
      thumbnailUrl,
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إنشاء قالب شاشة',
      actionType: 'screen',
      details: `تم إنشاء قالب شاشة جديد: "${template.name}"`,
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'فشل إنشاء القالب' }, { status: 500 });
  }
}
