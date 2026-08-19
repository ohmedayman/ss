import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let services = await db.getQueueServices(session.organization.id);

  // If organization has no queue services yet, auto-initialize 3 default departments starting from ticket #1
  if (services.length === 0) {
    const defaultServices = [
      {
        id: 'qs-' + Math.random().toString(36).substring(2, 9),
        organizationId: session.organization.id,
        branchId: '',
        name: 'قسم المبيعات',
        codePrefix: 'S',
        currentNumber: 0,
        lastCalledNumber: 0,
        averageWaitMinutes: 3,
        isActive: true,
      },
      {
        id: 'qs-' + Math.random().toString(36).substring(2, 9),
        organizationId: session.organization.id,
        branchId: '',
        name: 'قسم الاستقبال العام',
        codePrefix: 'A',
        currentNumber: 0,
        lastCalledNumber: 0,
        averageWaitMinutes: 5,
        isActive: true,
      },
      {
        id: 'qs-' + Math.random().toString(36).substring(2, 9),
        organizationId: session.organization.id,
        branchId: '',
        name: 'قسم خدمة العملاء',
        codePrefix: 'C',
        currentNumber: 0,
        lastCalledNumber: 0,
        averageWaitMinutes: 8,
        isActive: true,
      },
    ];

    for (const s of defaultServices) {
      await db.createQueueService(s);
    }

    services = await db.getQueueServices(session.organization.id);
  }

  const tickets = await db.getQueueTickets(session.organization.id);
  return NextResponse.json({ services, tickets });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, serviceId, counterNumber = 'شباك 1', name, codePrefix } = body;

    // 1. Call Next Customer (استدعاء الزبون التالي)
    if (action === 'call_next') {
      if (!serviceId) {
        return NextResponse.json({ error: 'مطلوب تحديد الخدمة' }, { status: 400 });
      }

      const service = await db.getQueueServiceById(serviceId);
      if (!service) {
        return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 });
      }

      // Next called number starts from 1 if currently 0
      const nextCalled = (service.lastCalledNumber || 0) + 1;
      await db.updateQueueService(serviceId, {
        lastCalledNumber: nextCalled,
        currentNumber: Math.max(service.currentNumber || 0, nextCalled),
      });

      const ticketNumber = `${service.codePrefix}-${nextCalled}`;

      const ticket = {
        id: 'tkt-' + Math.random().toString(36).substring(2, 9),
        organizationId: session.organization.id,
        serviceId: service.id,
        serviceName: service.name,
        ticketNumber: ticketNumber,
        status: 'serving' as const,
        counterNumber: counterNumber || service.name,
        calledAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await db.createQueueTicket(ticket);

      // Broadcast real-time event to all screens and players
      const screens = await db.getScreens(session.organization.id);
      screens.forEach((screen) => {
        realtime.notifyScreen(screen.id, 'queue_called', {
          ticket,
          ticketNumber: ticket.ticketNumber,
          counterName: ticket.counterNumber || service.name,
          serviceName: service.name,
        });
        if (screen.registrationCode) {
          realtime.notifyScreen(screen.registrationCode, 'queue_called', {
            ticket,
            ticketNumber: ticket.ticketNumber,
            counterName: ticket.counterNumber || service.name,
            serviceName: service.name,
          });
        }
      });

      // Broadcast globally and on organization channel
      realtime.notifyScreen(session.organization.id, 'queue_called', {
        ticket,
        ticketNumber: ticket.ticketNumber,
        counterName: ticket.counterNumber || service.name,
        serviceName: service.name,
      });
      realtime.notifyScreen('screen:all', 'queue_called', {
        ticket,
        ticketNumber: ticket.ticketNumber,
        counterName: ticket.counterNumber || service.name,
        serviceName: service.name,
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

    // 2. Issue Ticket for Customer & Print (إصدار تذكرة جديدة من رقم 1)
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
        counterNumber: counterNumber || service.name,
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

    // 3. Reset Counter back to 0 (تصفير العداد للبدء من رقم 1)
    if (action === 'reset_counter') {
      if (!serviceId) {
        return NextResponse.json({ error: 'مطلوب تحديد الخدمة' }, { status: 400 });
      }
      await db.updateQueueService(serviceId, {
        currentNumber: 0,
        lastCalledNumber: 0,
      });

      await db.logActivity({
        organizationId: session.organization.id,
        userId: session.user.id,
        userName: session.user.fullName,
        action: 'تصفير عداد القسم',
        actionType: 'system',
        details: `تم تصفير عداد القسم لبدء الترقيم من رقم 1`,
      });

      return NextResponse.json({ success: true, message: 'تم تصفير العداد للبدء من رقم 1' });
    }

    // 4. Create New Service / Department (إنشاء قسم جديد)
    if (action === 'create_service') {
      if (!name || !codePrefix) {
        return NextResponse.json({ error: 'مطلوب اسم القسم والرمز' }, { status: 400 });
      }

      const newService = {
        id: 'qs-' + Math.random().toString(36).substring(2, 9),
        organizationId: session.organization.id,
        branchId: '',
        name: name.trim(),
        codePrefix: codePrefix.trim().toUpperCase(),
        currentNumber: 0,
        lastCalledNumber: 0,
        averageWaitMinutes: 5,
        isActive: true,
      };

      await db.createQueueService(newService);

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

    // 5. Delete Service / Department
    if (action === 'delete_service') {
      if (!serviceId) {
        return NextResponse.json({ error: 'مطلوب تحديد القسم' }, { status: 400 });
      }
      await db.deleteQueueService(serviceId, session.organization.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error: any) {
    console.error('Queue error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ في معالجة طلب الطوابير' }, { status: 500 });
  }
}
