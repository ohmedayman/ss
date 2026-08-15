import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';
import { CommandType } from '@/lib/types';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { command, payload } = await req.json();

    const screen = await db.getScreenById(id);
    if (!screen || screen.organizationId !== session.organization.id) {
      return NextResponse.json({ error: 'الشاشة غير موجودة' }, { status: 404 });
    }

    const validCommands: CommandType[] = [
      'reload',
      'reboot',
      'take_screenshot',
      'clear_cache',
      'push_content',
      'set_volume',
    ];

    if (!validCommands.includes(command)) {
      return NextResponse.json({ error: 'أمر غير صالح' }, { status: 400 });
    }

    const newCmd = await db.addCommand({
      screenId: id,
      organizationId: session.organization.id,
      command,
      payload,
      status: 'pending',
    });

    // Realtime dispatch
    realtime.notifyScreen(id, 'command', newCmd);

    const commandLabels: Record<CommandType, string> = {
      reload: 'إعادة تحميل المحتوى',
      reboot: 'إعادة تشغيل المشغل',
      take_screenshot: 'التقاط لقطة شاشة حية',
      clear_cache: 'مسح الذاكرة المؤقتة',
      push_content: 'دفع المحتوى فورياً',
      set_volume: 'ضبط مستوى الصوت',
    };

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إرسال أمر تحكم للشاشة',
      actionType: 'screen',
      details: `تم إرسال أمر "${commandLabels[command as CommandType] || command}" إلى شاشة "${screen.name}"`,
    });

    return NextResponse.json({ success: true, command: newCmd });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إرسال الأمر' }, { status: 500 });
  }
}
