import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionFromIdToken } from '@/lib/auth';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';
import { User, Organization } from '@/lib/types';

export async function POST(req: Request) {
  try {
    if (!isFirebaseConfigured()) {
      return NextResponse.json({ error: 'التسجيل متاح فقط عبر Firebase' }, { status: 400 });
    }

    const { idToken, fullName, companyName } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Token مطلوب' }, { status: 400 });
    }

    const decoded = await (await getAdminAuth()).verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = (decoded.email || '').toLowerCase();

    // Check if user already exists
    const existingUser = await db.getUser(uid);
    if (existingUser) {
      // Already registered — just login
      await createSessionFromIdToken(idToken);
      return NextResponse.json({
        success: true,
        user: { id: existingUser.id, email: existingUser.email, fullName: existingUser.fullName, role: existingUser.role },
      });
    }

    // Create new organization
    const now = new Date().toISOString();
    const orgId = 'org-' + uid.substring(0, 12);
    const orgSlug = (companyName || 'my-org')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-|-$/g, '');

    const newOrg: Organization = {
      id: orgId,
      name: companyName || 'مشروعي',
      slug: orgSlug,
      logoUrl: '',
      plan: 'free',
      storageLimitMb: 5120,
      storageUsedBytes: 0,
      maxScreens: 5,
      createdAt: now,
      updatedAt: now,
    };
    await db.createOrganization(newOrg);

    // Create user
    const newUser: User = {
      id: uid,
      organizationId: orgId,
      email,
      fullName: fullName || decoded.name || email.split('@')[0],
      role: 'owner',
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
    };
    await db.createUser(newUser);

    // Seed default data for the new org
    await seedOrgDefaults(orgId);

    // Create session
    await createSessionFromIdToken(idToken);

    await db.logActivity({
      organizationId: orgId,
      userId: uid,
      userName: newUser.fullName,
      action: 'إنشاء حساب جديد',
      actionType: 'auth',
      details: `تم إنشاء الحساب والمنظمة "${newOrg.name}" بنجاح`,
    });

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 });
  }
}

async function seedOrgDefaults(orgId: string) {
  const now = new Date().toISOString();

  // Default branches
  const branchMain = 'br-' + orgId.substring(4, 12) + '-main';
  await db.setDocument('branches', branchMain, {
    id: branchMain,
    organizationId: orgId,
    name: 'الفرع الرئيسي',
    city: '',
    address: '',
    phone: '',
    isActive: true,
  });

  // Default media
  const med1 = 'med-' + Math.random().toString(36).substring(2, 8);
  const med2 = 'med-' + Math.random().toString(36).substring(2, 8);
  const med3 = 'med-' + Math.random().toString(36).substring(2, 8);

  const mediaItems = [
    {
      id: med1, organizationId: orgId, name: 'مرحباً بكم في شاشاتنا',
      fileType: 'image', fileUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 2450000, durationSeconds: 10, width: 1920, height: 1080,
      folder: 'عام', tags: ['ترحيب'], createdAt: now, updatedAt: now,
    },
    {
      id: med2, organizationId: orgId, name: 'عرض ترويجي',
      fileType: 'image', fileUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 3120000, durationSeconds: 12, width: 1920, height: 1080,
      folder: 'إعلانات', tags: ['عرض'], createdAt: now, updatedAt: now,
    },
    {
      id: med3, organizationId: orgId, name: 'شريط الأخبار',
      fileType: 'ticker_text', fileUrl: '', customTickerText: 'مرحباً بكم في منصة ScreenFlow لإدارة الشاشات الرقمية',
      fileSizeBytes: 256, durationSeconds: 20,
      folder: 'نصوص', tags: ['شريط_متحرك'], createdAt: now, updatedAt: now,
    },
  ];

  for (const m of mediaItems) {
    await db.setDocument('media', m.id, m);
  }

  // Default playlist
  const plId = 'pl-' + Math.random().toString(36).substring(2, 8);
  await db.setDocument('playlists', plId, {
    id: plId, organizationId: orgId, name: 'قائمة التشغيل الرئيسية',
    description: 'القائمة الافتراضية للشاشات', isLoop: true, defaultTransition: 'fade',
    totalDurationSeconds: 32,
    items: [
      { id: 'pli-' + Math.random().toString(36).substring(2, 8), playlistId: plId, mediaId: med1, orderIndex: 0, durationSeconds: 10, transition: 'fade', isMuted: true },
      { id: 'pli-' + Math.random().toString(36).substring(2, 8), playlistId: plId, mediaId: med2, orderIndex: 1, durationSeconds: 12, transition: 'slide_left', isMuted: true },
      { id: 'pli-' + Math.random().toString(36).substring(2, 8), playlistId: plId, mediaId: med3, orderIndex: 2, durationSeconds: 20, transition: 'fade', isMuted: true },
    ],
    createdAt: now, updatedAt: now,
  });

  // Default template
  const tplId = 'tpl-' + Math.random().toString(36).substring(2, 8);
  await db.setDocument('templates', tplId, {
    id: tplId, organizationId: orgId, name: 'القالب الأساسي',
    layout: 'full_screen', backgroundColor: '#0f172a', headerTitle: '',
    thumbnailUrl: '', zones: [], createdAt: now, updatedAt: now,
  });
}
