import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';

export async function GET() {
  const session = await getSession();
  const services = db.getQueueServices(session.organization.id);
  const tickets = db.getQueueTickets(session.organization.id);
  return NextResponse.json({ services, tickets });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { action, serviceId, counterNumber = 'مكتب 1' } = await req.json();

    if (action === 'call_next') {
      if (!serviceId) {
        return NextResponse.json({ error: 'معرف الخدمة مطلوب' }, { status: 400 });
      }

      const ticket = db.callNextTicket(serviceId, counterNumber);
      if (!ticket) {
        return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 });
      }

      // Broadcast queue update to all screens in real-time
      const screens = db.getScreens(session.organization.id);
      screens.forEach(s => {
        realtime.notifyScreen(s.id, 'queue_called', { ticket });
      });

      db.logActivity({
        organizationId: session.organization.id,
        userId: session.user.id,
        userName: session.user.fullName,
        action: 'نداء رقم انتظار',
        actionType: 'system',
        details: `تم استدعاء الرقم ${ticket.ticketNumber} إلى ${ticket.counterNumber} (${ticket.serviceName})`,
      });

      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: 'إجراء غير مدعوم' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في نظام الانتظار' }, { status: 500 });
  }
}
