import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
    }

    // In demo, find user or allow demo admin
    let user = db.getUserByEmail(email);
    if (!user) {
      // Fallback to first user for demo convenience
      user = db.getData().users[0];
    }

    await setSessionCookie(user.id);

    db.logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.fullName,
      action: 'تسجيل دخول',
      actionType: 'auth',
      details: `تم تسجيل الدخول بنجاح بواسطة ${user.email}`,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 });
  }
}
