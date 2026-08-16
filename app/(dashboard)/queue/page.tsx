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
  AlertCircle,
  Settings,
  Printer,
  Hash,
} from 'lucide-react';

export default function QueuePage() {
  const [services, setServices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [lastCalledTicket, setLastCalledTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrefix, setNewServicePrefix] = useState('');
  const [creating, setCreating] = useState(false);

  const loadQueueData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/queue');
      if (res.ok) {
        const d = await res.json();
        setServices(d.services || []);
        setTickets(d.tickets || []);
      } else if (res.status === 401) {
        setError('يجب تسجيل الدخول أولاً');
      } else {
        setError('فشل تحميل بيانات الطوابير');
      }
    } catch (e) {
      console.error(e);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueueData();
  }, []);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
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
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  };

  const callNext = async (serviceId: string, serviceName: string) => {
    setCallingId(serviceId);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call_next',
          serviceId,
          counterNumber: serviceName,
        }),
      });

      const d = await res.json();

      if (res.ok && d.success) {
        setLastCalledTicket(d.ticket);
        await loadQueueData();
        playChime();
      } else {
        alert(d.error || 'فشل استدعاء الزبون التالي');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ في الاتصال بالخادم');
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

      const d = await res.json();

      if (res.ok && d.success) {
        await loadQueueData();
        printTicket(d.ticket);
      } else {
        alert(d.error || 'فشل إصدار التذكرة');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ في الاتصال بالخادم');
    }
  };

  const createService = async () => {
    if (!newServiceName.trim() || !newServicePrefix.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_service',
          name: newServiceName.trim(),
          codePrefix: newServicePrefix.trim().toUpperCase(),
        }),
      });

      const d = await res.json();
      if (res.ok && d.success) {
        setNewServiceName('');
        setNewServicePrefix('');
        setSetupMode(false);
        await loadQueueData();
      } else {
        alert(d.error || 'فشل إنشاء الخدمة');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ في الاتصال بالخادم');
    } finally {
      setCreating(false);
    }
  };

  const printTicket = (ticket: any) => {
    const printWindow = window.open('', '_blank', 'width=300,height=500');
    if (!printWindow) {
      alert('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة للمتصفح.');
      return;
    }
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
        <div class="counter">${ticket.counterNumber || 'الاستقبال'}</div>
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <Header title="نظام إدارة أرقام الزبائن" subtitle="إصدار أرقام انتظار وعرضها على الشاشات" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RotateCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">جاري تحميل بيانات الطوابير...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <Header title="نظام إدارة أرقام الزبائن" subtitle="إصدار أرقام انتظار وعرضها على الشاشات" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center glass-panel rounded-2xl p-8 border border-red-200 max-w-md">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-600 font-semibold mb-4">{error}</p>
            <button onClick={loadQueueData} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no services configured
  if (services.length === 0) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <Header title="نظام إدارة أرقام الزبائن" subtitle="إصدار أرقام انتظار وعرضها على الشاشات" />

        <div className="flex items-center justify-center py-16">
          <div className="text-center glass-panel rounded-3xl p-10 border border-slate-200 max-w-lg">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">لم يتم إعداد أقسام بعد</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              أنشئ أقساماً (مثل: المبيعات، الخدمات، الشكاوى) لبدء إصدار أرقام انتظار للزبائن وعرضها على الشاشات.
            </p>
            <button
              onClick={() => setSetupMode(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إنشاء أول قسم
            </button>
          </div>
        </div>

        {setupMode && (
          <div className="max-w-lg mx-auto glass-panel rounded-2xl p-6 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" />
              إنشاء قسم جديد
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">اسم القسم</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="مثال: المبيعات، الخدمات، الاستقبال"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">رمز القسم (حرف واحد)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={newServicePrefix}
                  onChange={(e) => setNewServicePrefix(e.target.value)}
                  placeholder="مثال: S"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 uppercase"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={createService}
                  disabled={creating || !newServiceName.trim() || !newServicePrefix.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  {creating ? 'جاري الإنشاء...' : 'إنشاء القسم'}
                </button>
                <button
                  onClick={() => setSetupMode(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main view - services exist
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <Header title="نظام إدارة أرقام الزبائن" subtitle="إصدار أرقام انتظار وعرضها على الشاشات + طباعة على الطابعة الحرارية" />

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
          أصدر أرقاماً للزبائن عند الدخول، اطبعها على ورق حراري، واعرضها مباشرة على الشاشات الرقمية. الأرقام تتطلب تلقائياً وتُعرض بوضوح.
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
              <div className="text-xs text-indigo-300 font-semibold">تم استدعاء الزبون:</div>
              <div className="text-base font-bold text-white">
                تذكرة رقم <span className="font-mono text-amber-400">{lastCalledTicket.ticketNumber}</span> — {lastCalledTicket.serviceName}
              </div>
            </div>
          </div>
          <span className="text-xs text-indigo-300 font-mono">
            {new Date(lastCalledTicket.calledAt).toLocaleTimeString('ar-SA')}
          </span>
        </div>
      )}

      {/* Service Counters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-amber-500" />
            الأقسام والخدمات ({services.length} أقسام)
          </h3>
          <button
            onClick={() => setSetupMode(!setupMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            إضافة قسم
          </button>
        </div>

        {/* Quick Add Service Form */}
        {setupMode && (
          <div className="glass-panel rounded-xl p-4 border border-slate-200 flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">اسم القسم</label>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="مثال: المبيعات"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="w-20">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">الرمز</label>
              <input
                type="text"
                maxLength={2}
                value={newServicePrefix}
                onChange={(e) => setNewServicePrefix(e.target.value)}
                placeholder="S"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-indigo-400 uppercase text-center"
              />
            </div>
            <button
              onClick={createService}
              disabled={creating || !newServiceName.trim() || !newServicePrefix.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
            >
              {creating ? '...' : 'إنشاء'}
            </button>
            <button
              onClick={() => { setSetupMode(false); setNewServiceName(''); setNewServicePrefix(''); }}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-semibold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        )}

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
                  <span className="text-[11px] text-slate-400 block mb-1">الرقم الحالي</span>
                  <span className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                    {svc.codePrefix}-{svc.currentNumber}
                  </span>
                </div>
              </div>

              {/* Call Next Button */}
              <button
                onClick={() => callNext(svc.id, svc.name)}
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
                <Printer className="w-4 h-4" />
                <span>إصدار تذكرة + طباعة</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Ticket Logs */}
      {tickets.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            آخر التذاكر المستدعاة
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="p-3">رقم التذكرة</th>
                  <th className="p-3">القسم</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">وقت النداء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.slice(0, 10).map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-amber-600">{tkt.ticketNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{tkt.serviceName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        tkt.status === 'called' || tkt.status === 'serving'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : tkt.status === 'waiting'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {tkt.status === 'called' || tkt.status === 'serving' ? 'تم النداء' : tkt.status === 'waiting' ? 'في الانتظار' : tkt.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {tkt.calledAt ? new Date(tkt.calledAt).toLocaleTimeString('ar-SA') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
