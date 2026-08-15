import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const screens = await db.getScreens(session.organization.id);

  return NextResponse.json({
    user: {
      fullName: session.user.fullName,
      email: session.user.email,
      phone: session.user.phone || '',
      avatarUrl: session.user.avatarUrl || '',
    },
    organization: {
      name: session.organization.name,
      slug: session.organization.slug,
      plan: session.organization.plan,
      storageLimitMb: session.organization.storageLimitMb,
      storageUsedBytes: session.organization.storageUsedBytes,
      maxScreens: session.organization.maxScreens,
      screensCount: screens.length,
      logoUrl: session.organization.logoUrl || '',
    },
    notifications: {
      email: true,
      offlineAlerts: true,
      weeklyReports: true,
      subscriptionAlerts: true,
    },
    session: {
      ip: '192.168.1.50',
      device: 'Chrome 124 — Windows 11',
      lastActive: new Date().toISOString(),
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (body.user) {
    await db.updateUser(session.user.id, {
      fullName: body.user.fullName,
      phone: body.user.phone,
    });
  }

  if (body.organization) {
    await db.updateOrganization(session.organization.id, {
      name: body.organization.name,
      slug: body.organization.slug,
      logoUrl: body.organization.logoUrl,
    });
  }

  return NextResponse.json({ success: true });
}
