'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
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
  Trash2,
  Megaphone,
} from 'lucide-react';
import { queueServiceSchema, QueueServiceFormData } from '@/lib/validations';

export default function QueuePage() {
  const [callingId, setCallingId] = useState<string | null>(null);
  const [lastCalledTicket, setLastCalledTicket] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const serviceForm = useForm<QueueServiceFormData>({
    resolver: zodResolver(queueServiceSchema),
    defaultValues: { name: '', codePrefix: '' },
  });

  const { data, isLoading: loading, mutate } = useSWR<{ services: any[]; tickets: any[] }>('/api/queue', {
    refreshInterval: 10000,
  });

  const services = data?.services || [];
  const tickets = data?.tickets || [];

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
        await mutate();
        playChime();
        setSuccessMsg(`تم نداء التذكرة ${d.ticket.ticketNumber} بنجاح 🔔`);
        setTimeout(() => setSuccessMsg(''), 3000);
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
        await mutate();
        printTicket(d.ticket);
      } else {
        alert(d.error || 'فشل إصدار التذكرة');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ في الاتصال بالخادم');
    }
  };

  const createService = async (formData: QueueServiceFormData) => {
    setCreating(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_service',
          name: formData.name.trim(),
          codePrefix: formData.codePrefix.trim().toUpperCase(),
        }),
      });

      const d = await res.json();
      if (res.ok && d.success) {
        serviceForm.reset();
        setSetupMode(false);
        await mutate();
        setSuccessMsg(`تم إنشاء قسم "${formData.name}" بنجاح ✨`);
        setTimeout(() => setSuccessMsg(''), 3000);
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

  const deleteService = async (serviceId: string, serviceName: string) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${serviceName}"؟`)) return;
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_service',
          serviceId,
        }),
      });

      if (res.ok) {
        await mutate();
      }
    } catch (e) {
      console.error(e);
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
          .logo { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
          .line { border-top: 1px dashed #000; margin: 6px 0; }
          .ticket-number { font-size: 40px; font-weight: bold; margin: 12px 0; }
          .service-name { font-size: 13px; font-weight: bold; margin: 4px 0; }
          .date { font-size: 9px; color: #666; margin-top: 6px; }
          .counter { font-size: 11px; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="logo">ScreenFlow Digital Signage</div>
        <div class="line"></div>
        <div class="service-name">${ticket.serviceName || 'خدمة العملاء'}</div>
        <div class="line"></div>
        <div class="ticket-number">${ticket.ticketNumber}</div>
        <div class="line"></div>
        <div class="counter">مكتب الخدمة: ${ticket.counterNumber || 'شباك 1'}</div>
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
        <Header title="نظام إدارة أرقام الزبائن والانتظار" subtitle="إصدار أرقام انتظار وعرضها المباشر على الشاشات" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RotateCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">جاري تحميل بيانات الأقسام والطوابير...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <Header
        title="نظام إدارة أرقام الزبائن والانتظار"
        subtitle="إصدار أرقام انتظار وعرضها المباشر على الشاشات + نداء صوتي وطباعة حرارية"
      />

      {/* Global Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0e1424] border border-amber-500/30 shadow-xl text-white">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
          <Sparkles className="w-4 h-4" />
          <span>نظام الطوابير الذكي (Smart Queue System)</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-white">
          إصدار أرقام انتظار للزبائن + بث فوري على الشاشات مع نغمة التنبيه 🔔
        </h2>
        <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          أصدر أرقاماً للمراجعين عند الدخول، واضغط على "نداء الزبون التالي" لبث الرقم فورياً على كافة شاشات العرض الذكية المتصلة مع نغمة رنين تلقائية.
        </p>
      </div>

      {/* Live Caller Notification Card */}
      {lastCalledTicket && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-500/40 flex items-center justify-between animate-in fade-in duration-300 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Megaphone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-xs text-indigo-300 font-semibold">آخر استدعاء مباشر:</div>
              <div className="text-lg font-black text-white">
                تذكرة رقم <span className="font-mono text-amber-400 text-2xl">{lastCalledTicket.ticketNumber}</span> — {lastCalledTicket.serviceName}
              </div>
            </div>
          </div>
          <span className="text-xs text-indigo-300 font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            {new Date(lastCalledTicket.calledAt).toLocaleTimeString('ar-SA')}
          </span>
        </div>
      )}

      {/* Service Counters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-amber-500" />
            <span>الأقسام ومحطات الخدمة ({services.length} أقسام)</span>
          </h3>
          <button
            onClick={() => setSetupMode(!setupMode)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة قسم جديد</span>
          </button>
        </div>

        {/* Quick Add Service Form */}
        {setupMode && (
          <form onSubmit={serviceForm.handleSubmit(createService)} className="glass-panel rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row gap-3 items-end animate-in fade-in duration-150">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">اسم القسم / الشباك</label>
              <input
                type="text"
                {...serviceForm.register('name')}
                placeholder="مثال: قسم المبيعات، عيادة الاستشارات"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 ${serviceForm.formState.errors.name ? 'border-red-300' : 'border-slate-200'}`}
              />
              {serviceForm.formState.errors.name && <p className="text-[11px] text-red-500 mt-1">{serviceForm.formState.errors.name.message}</p>}
            </div>
            <div className="w-full sm:w-28">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">الرمز (حرف)</label>
              <input
                type="text"
                maxLength={2}
                {...serviceForm.register('codePrefix')}
                placeholder="A"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs text-center font-bold uppercase focus:outline-none focus:border-indigo-500 ${serviceForm.formState.errors.codePrefix ? 'border-red-300' : 'border-slate-200'}`}
              />
              {serviceForm.formState.errors.codePrefix && <p className="text-[11px] text-red-500 mt-1">{serviceForm.formState.errors.codePrefix.message}</p>}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                {creating ? 'جاري الإنشاء...' : 'إنشاء القسم'}
              </button>
              <button
                type="button"
                onClick={() => { setSetupMode(false); serviceForm.reset(); }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="glass-panel rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    رمز: {svc.codePrefix}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      انتظار: ~{svc.averageWaitMinutes} د
                    </span>
                    <button
                      onClick={() => deleteService(svc.id, svc.name)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="حذف القسم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{svc.name}</h4>

                {/* Current Number Display */}
                <div className="my-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 border border-indigo-900/40 text-center shadow-inner">
                  <span className="text-[11px] text-indigo-300 block mb-1 font-semibold">الرقم المستدعى حالياً</span>
                  <span className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                    {svc.codePrefix}-{svc.currentNumber}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {/* Call Next Button */}
                <button
                  onClick={() => callNext(svc.id, svc.name)}
                  disabled={callingId === svc.id}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{callingId === svc.id ? 'جاري نداء الرقم...' : 'نداء الزبون التالي 📢'}</span>
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
            </div>
          ))}
        </div>
      </div>

      {/* Live Ticket Logs */}
      {tickets.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>سجل التذاكر المستدعاة مؤخراً</span>
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
                  <tr key={tkt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-600 text-sm">{tkt.ticketNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">{tkt.serviceName}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        tkt.status === 'called' || tkt.status === 'serving'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : tkt.status === 'waiting'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
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
