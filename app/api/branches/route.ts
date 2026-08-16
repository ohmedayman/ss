import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const branches = await db.getBranches(session.organization.id);
  return NextResponse.json({ branches });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { name, city, address, phone } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'اسم الفرع مطلوب' }, { status: 400 });
    }

    const branch = await db.createBranch({
      organizationId: session.organization.id,
      name: name.trim(),
      city: city || '',
      address: address || '',
      phone: phone || '',
      isActive: true,
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إضافة فرع جديد',
      actionType: 'screen',
      details: `تمت إضافة فرع جديد "${branch.name}"`,
    });

    return NextResponse.json({ success: true, branch });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إضافة الفرع' }, { status: 500 });
  }
}
