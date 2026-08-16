'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  UsersRound,
  Sparkles,
  Volume2,
  Tv,
  CheckCircle2,
  Clock,
  Building,
  ArrowUpRight,
  Plus,
  Play,
  RotateCw,
  BellRing,
} from 'lucide-react';

export default function QueuePage() {
  const [services, setServices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [lastCalledTicket, setLastCalledTicket] = useState<any | null>(null);

  const loadQueueData = async () => {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const d = await res.json();
        setServices(d.services || []);
        setTickets(d.tickets || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadQueueData();
  }, []);

  const callNext = async (serviceId: string, counterName: string) => {
    setCallingId(serviceId);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call_next',
          serviceId,
          counterNumber: counterName,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setLastCalledTicket(d.ticket);
        await loadQueueData();

        // Audio Chime
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.6);
        } catch (e) {}
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCallingId(null);
    }
  };

  const issueTicket = async (serviceId: string) => {
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue_ticket',
          serviceId,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        await loadQueueData();
        // Print ticket to thermal printer
        printTicket(d.ticket);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const printTicket = (ticket: any) => {
    const printWindow = window.open('', '_blank', 'width=300,height=500');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 2mm; }
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 72mm;
            padding: 3mm;
            text-align: center;
            direction: rtl;
          }
          .logo { font-size: 10px; font-weight: bold; margin-bottom: 4px; }
          .line { border-top: 1px dashed #000; margin: 4px 0; }
          .ticket-number { font-size: 36px; font-weight: bold; margin: 8px 0; }
          .service-name { font-size: 12px; margin: 4px 0; }
          .date { font-size: 9px; color: #666; }
          .counter { font-size: 10px; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="logo">ScreenFlow</div>
        <div class="line"></div>
        <div class="service-name">${ticket.serviceName || 'خدمة عامة'}</div>
        <div class="line"></div>
        <div class="ticket-number">${ticket.ticketNumber}</div>
        <div class="line"></div>
        <div class="counter">${ticket.counterNumber || 'شباك الاستقبال'}</div>
        <div class="date">${new Date(ticket.createdAt).toLocaleString('ar-SA')}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <Header
        title="نظام إدارة أرقام الزبائن"
        subtitle="إصدار أرقام انتظار للزبائن وعرضها على الشاشات + طباعة على الطابعة الحرارية"
      />

      {/* Info Banner */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0e1424] border border-amber-500/30">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
          <Sparkles className="w-4 h-4" />
          <span>نظام إدارة الزبائن</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-white">
          إصدار أرقام انتظار للزبائن + طباعة حرارية + عرض مباشر على الشاشات
        </h2>
        <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          ا issuing أرقام للزبائن عند الدخول، طباعة على ورق حراري، وعرض مباشر على الشاشات الرقمية. الأرقام تتطلب تلقائياً وتُعرض بوضوح.
        </p>
      </div>

      {/* Live Caller Notification Card */}
      {lastCalledTicket && (
        <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs text-indigo-300 font-semibold">نداء صوتي مباشر للعميل:</div>
              <div className="text-base font-bold text-white">
                تذكرة رقم <span className="font-mono text-amber-400">{lastCalledTicket.ticketNumber}</span> إلى {lastCalledTicket.counterNumber}
              </div>
            </div>
          </div>
          <span className="text-xs text-indigo-300 font-mono">
            {new Date(lastCalledTicket.calledAt).toLocaleTimeString('ar-SA')}
          </span>
        </div>
      )}

      {/* Service Counters Simulator */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <UsersRound className="w-4 h-4 text-amber-500" />
          محطة نداء العملاء والمكاتب (Counter Simulator)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="glass-panel rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    رمز: {svc.codePrefix}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    متوسط الانتظار: {svc.averageWaitMinutes} دقائق
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{svc.name}</h4>

                {/* Current Number Display */}
                <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-700 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">الرقم المستدعى حالياً</span>
                  <span className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                    {svc.codePrefix}-{svc.currentNumber}
                  </span>
                </div>
              </div>

              {/* Call Next Button */}
              <button
                onClick={() => callNext(svc.id, `شباك ${svc.codePrefix}`)}
                disabled={callingId === svc.id}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{callingId === svc.id ? 'جاري النداء...' : 'نداء الزبون التالي'}</span>
              </button>

              {/* Issue Ticket Button */}
              <button
                onClick={() => issueTicket(svc.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إصدار تذكرة + طباعة</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Ticket Logs */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          سجل التذاكر المستدعاة مؤخراً
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="p-3">رقم التذكرة</th>
                <th className="p-3">الخدمة</th>
                <th className="p-3">الشباك / المكتب</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">وقت النداء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-amber-600">{tkt.ticketNumber}</td>
                  <td className="p-3 font-medium text-slate-800">{tkt.serviceName}</td>
                  <td className="p-3 text-slate-600">{tkt.counterNumber || 'مكتب 1'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">
                      تم النداء
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {new Date(tkt.createdAt).toLocaleTimeString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
