import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionFromIdToken, setSessionCookie } from '@/lib/auth';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';
import { User } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { email, password, idToken } = await req.json();

    // --- Firebase Auth path (production) ---
    if (idToken && isFirebaseConfigured()) {
      const decoded = await (await getAdminAuth()).verifyIdToken(idToken);
      const uid = decoded.uid;

      let user = await db.getUser(uid);
      if (!user) {
        const emailLower = (decoded.email || email || '').toLowerCase();
        const existing = emailLower ? await db.getUserByEmail(emailLower) : undefined;
        if (existing) {
          user = existing;
          await db.updateUser(existing.id, { lastLoginAt: new Date().toISOString() } as Partial<User>);
        } else {
          const org = await db.getOrganization('org-screenflow-demo');
          const now = new Date().toISOString();
          const created: User = {
            id: uid,
            organizationId: org?.id || 'org-screenflow-demo',
            email: emailLower || (decoded.email || ''),
            fullName: decoded.name || emailLower || 'مستخدم جديد',
            role: 'owner',
            isActive: true,
            lastLoginAt: now,
            createdAt: now,
          };
          user = await db.createUser(created);
        }
      } else {
        user = await db.updateUser(uid, { lastLoginAt: new Date().toISOString() }) || user;
      }

      await createSessionFromIdToken(idToken);

      await db.logActivity({
        organizationId: user.organizationId,
        userId: user.id,
        userName: user.fullName,
        action: 'تسجيل دخول',
        actionType: 'auth',
        details: `تم تسجيل الدخول بنجاح بواسطة ${user.email}`,
      });

      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      });
    }

    // --- Local/demo fallback (no Firebase) ---
    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
    }

    let user = await db.getUserByEmail(email);
    if (!user) {
      const data = await db.getData();
      user = data.users[0];
    }

    await setSessionCookie(user.id);

    await db.logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.fullName,
      action: 'تسجيل دخول',
      actionType: 'auth',
      details: `تم تسجيل الدخول بنجاح بواسطة ${user.email}`,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 });
  }
}
