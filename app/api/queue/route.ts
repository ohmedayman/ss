import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const services = await db.getQueueServices(session.organization.id);
  const tickets = await db.getQueueTickets(session.organization.id);
  return NextResponse.json({ services, tickets });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { action, serviceId, counterNumber = 'شباك 1' } = await req.json();

    if (action === 'call_next') {
      if (!serviceId) {
        return NextResponse.json({ error: 'مطلوب تحديد الخدمة' }, { status: 400 });
      }

      const ticket = await db.callNextTicket(serviceId, counterNumber);
      if (!ticket) {
        return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 });
      }

      // Broadcast queue update to all screens in real-time
      const screens = await db.getScreens(session.organization.id);
      screens.forEach(s => {
        realtime.notifyScreen(s.id, 'queue_called', { ticket });
      });

      await db.logActivity({
        organizationId: session.organization.id,
        userId: session.user.id,
        userName: session.user.fullName,
        action: 'نداء تذكرة جديدة',
        actionType: 'system',
        details: `تم استدعاء التذكرة ${ticket.ticketNumber} إلى ${ticket.counterNumber} (${ticket.serviceName})`,
      });

      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في استدعاء التذكرة' }, { status: 500 });
  }
}
