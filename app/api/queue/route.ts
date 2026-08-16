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

    if (action === 'issue_ticket') {
      if (!serviceId) {
        return NextResponse.json({ error: 'مطلوب تحديد الخدمة' }, { status: 400 });
      }

      const service = await db.getQueueServiceById(serviceId);
      if (!service) {
        return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 });
      }

      const newNumber = (service.currentNumber || 0) + 1;
      await db.updateQueueService(serviceId, { currentNumber: newNumber });

      const ticket = {
        id: 'tkt-' + Math.random().toString(36).substring(2, 9),
        organizationId: session.organization.id,
        serviceId: service.id,
        serviceName: service.name,
        ticketNumber: `${service.codePrefix}-${newNumber}`,
        status: 'waiting' as const,
        counterNumber: '',
        calledAt: '',
        createdAt: new Date().toISOString(),
      };

      await db.createQueueTicket(ticket);

      await db.logActivity({
        organizationId: session.organization.id,
        userId: session.user.id,
        userName: session.user.fullName,
        action: 'إصدار تذكرة جديدة',
        actionType: 'system',
        details: `تم إصدار التذكرة ${ticket.ticketNumber} (${ticket.serviceName})`,
      });

      return NextResponse.json({ success: true, ticket });
    }

    if (action === 'create_service') {
      const { name, codePrefix } = await req.json();
      if (!name || !codePrefix) {
        return NextResponse.json({ error: 'مطلوب اسم القسم والرمز' }, { status: 400 });
      }

      const newService = {
        id: 'qs-' + Math.random().toString(36).substring(2, 9),
        organizationId: session.organization.id,
        branchId: '',
        name,
        codePrefix: codePrefix.toUpperCase(),
        currentNumber: 0,
        lastCalledNumber: 0,
        averageWaitMinutes: 5,
        isActive: true,
      };

      await db.setDocument('queue_services', newService.id, newService);

      await db.logActivity({
        organizationId: session.organization.id,
        userId: session.user.id,
        userName: session.user.fullName,
        action: 'إنشاء قسم طوابير جديد',
        actionType: 'system',
        details: `تم إنشاء قسم "${name}" برمز ${codePrefix}`,
      });

      return NextResponse.json({ success: true, service: newService });
    }

    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error: any) {
    console.error('Queue error:', error);
    return NextResponse.json({ error: 'خطأ في استدعاء التذكرة' }, { status: 500 });
  }
}
