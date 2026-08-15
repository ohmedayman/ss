import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const templates = db.getTemplates(session.organization.id);
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const {
      name,
      layout = 'split_3_sidebar',
      zones = [],
      backgroundColor = '#0f172a',
      headerTitle,
      thumbnailUrl,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم القالب مطلوب' }, { status: 400 });
    }

    const template = db.createTemplate({
      organizationId: session.organization.id,
      name: name.trim(),
      layout,
      zones,
      backgroundColor,
      headerTitle,
      thumbnailUrl,
    });

    db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إنشاء قالب شاشة',
      actionType: 'screen',
      details: `تم إنشاء قالب شاشة جديد: "${template.name}"`,
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إنشاء القالب' }, { status: 500 });
  }
}
