import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { newPassword } = await req.json();

    if (!newPassword) {
      return NextResponse.json({ error: 'مطلوب كلمة المرور الجديدة' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
    }

    if (isFirebaseConfigured()) {
      const auth = await getAdminAuth();
      await auth.updateUser(session.user.id, { password: newPassword });
    } else {
      console.warn('Password change skipped: Firebase not configured (local dev mode)');
    }

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'تغيير كلمة المرور',
      actionType: 'auth',
      details: 'تم تغيير كلمة المرور بنجاح',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'فشل تغيير كلمة المرور' }, { status: 500 });
  }
}
