'use client';

import React, { useState, useEffect } from 'react';
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
  QrCode,
  Image as ImageIcon,
  Check,
  X,
} from 'lucide-react';
import { queueServiceSchema, QueueServiceFormData } from '@/lib/validations';

export default function QueuePage() {
  const [callingId, setCallingId] = useState<string | null>(null);
  const [lastCalledTicket, setLastCalledTicket] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [isReceiptSettingsOpen, setIsReceiptSettingsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Thermal Printer Customization Settings
  const [receiptLogoUrl, setReceiptLogoUrl] = useState('https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80');
  const [facilityName, setFacilityName] = useState('مجمع الأفق الطبي الاستشاري');
  const [footerNote, setFooterNote] = useState('شكراً لزيارتكم • نسعد بخدمتكم دائماً');
  const [showQr, setShowQr] = useState(true);

  // Load saved printer settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sf_receipt_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.receiptLogoUrl) setReceiptLogoUrl(parsed.receiptLogoUrl);
        if (parsed.facilityName) setFacilityName(parsed.facilityName);
        if (parsed.footerNote) setFooterNote(parsed.footerNote);
        if (parsed.showQr !== undefined) setShowQr(parsed.showQr);
      }
    } catch (e) {}
  }, []);

  const saveReceiptSettings = () => {
    try {
      localStorage.setItem(
        'sf_receipt_settings',
        JSON.stringify({ receiptLogoUrl, facilityName, footerNote, showQr })
      );
      setSuccessMsg('تم حفظ إعدادات ورقة الطابعة الحرارية بنجاح ✨');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsReceiptSettingsOpen(false);
    } catch (e) {}
  };

  const serviceForm = useForm<QueueServiceFormData>({
    resolver: zodResolver(queueServiceSchema),
    defaultValues: { name: '', codePrefix: '' },
  });

  const { data, isLoading: loading, mutate } = useSWR<{ services: any[]; tickets: any[] }>('/api/queue', {
    refreshInterval: 5000,
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
        setSuccessMsg(`تم نداء التذكرة ${d.ticket.ticketNumber} وبثها للشاشات بنجاح 🔔`);
        setTimeout(() => setSuccessMsg(''), 4000);
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
    const printWindow = window.open('', '_blank', 'width=340,height=550');
    if (!printWindow) {
      alert('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة للطباعة.');
      return;
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TICKET:${ticket.ticketNumber}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تذكرة انتظار رقم ${ticket.ticketNumber}</title>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 2mm; }
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Courier New', monospace, 'Cairo', Tahoma, sans-serif;
            width: 72mm;
            padding: 4mm 2mm;
            text-align: center;
            direction: rtl;
            color: #000;
          }
          .logo-img {
            max-height: 48px;
            max-width: 140px;
            object-contain: contain;
            margin: 0 auto 6px auto;
            display: block;
          }
          .facility-name {
            font-size: 14px;
            font-weight: 900;
            margin-bottom: 4px;
          }
          .service-name {
            font-size: 12px;
            font-weight: bold;
            margin: 4px 0;
          }
          .cut-line {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .ticket-number-label {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .ticket-number {
            font-size: 44px;
            font-weight: 900;
            letter-spacing: 2px;
            margin: 4px 0;
            line-height: 1.1;
          }
          .counter-info {
            font-size: 11px;
            font-weight: bold;
            margin: 4px 0;
          }
          .qr-container {
            margin: 8px 0;
          }
          .qr-img {
            width: 75px;
            height: 75px;
            margin: 0 auto;
            display: block;
          }
          .date-info {
            font-size: 9px;
            color: #333;
            margin-top: 6px;
          }
          .footer-note {
            font-size: 10px;
            font-weight: bold;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        ${receiptLogoUrl ? `<img src="${receiptLogoUrl}" class="logo-img" alt="Logo" />` : ''}
        <div class="facility-name">${facilityName || 'مجمع الأفق الطبي الاستشاري'}</div>
        <div class="cut-line"></div>
        <div class="service-name">${ticket.serviceName || 'الاستقبال والعيادات'}</div>
        <div class="cut-line"></div>
        <div class="ticket-number-label">رقم الانتظار</div>
        <div class="ticket-number">${ticket.ticketNumber}</div>
        <div class="counter-info">مكتب الخدمة: ${ticket.counterNumber || 'شباك 1'}</div>
        
        ${showQr ? `
          <div class="qr-container">
            <img src="${qrCodeUrl}" class="qr-img" alt="QR" />
            <div style="font-size: 8px; margin-top: 2px;">امسح الباركود لمتابعة دورك</div>
          </div>
        ` : ''}

        <div class="cut-line"></div>
        <div class="date-info">${new Date(ticket.createdAt || Date.now()).toLocaleString('ar-SA')}</div>
        <div class="footer-note">${footerNote}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
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
        subtitle="إصدار أرقام انتظار وعرضها المباشر على الشاشات + نداء صوتي وطباعة حرارية مخصصة"
      />

      {/* Global Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Info Banner & Live Ticket Display */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0e1424] border border-amber-500/30 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>نظام النداء والشاشات الفوري المتصل بالسحابة</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              نداء وتوجيه الزبائن على الشاشات بضغطة واحدة
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl">
              عند نداء التذكرة يتم تشغيل رنين صوتي في الشاشات وعرض الرقم فوراً، مع إمكانية طباعة تذاكر حرارية تحمل لوجو المؤسسة واسم العيادة.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsReceiptSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 cursor-pointer backdrop-blur-md transition-all"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>تخصيص ورقة الطابعة واللوجو</span>
            </button>

            <button
              onClick={() => {
                printTicket({
                  ticketNumber: 'A-104',
                  serviceName: 'قسم الاستقبال والعيادات',
                  counterNumber: 'شباك 1',
                  createdAt: new Date().toISOString(),
                });
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ طباعة تذكرة تجريبية</span>
            </button>
          </div>
        </div>

        {/* Live Active Ticket Preview Banner */}
        {lastCalledTicket && (
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4 bg-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 pulse-green" />
              <span className="text-xs text-slate-300">الرقم المستدعى حالياً على الشاشات:</span>
              <span className="text-2xl font-black font-mono text-amber-400 px-3 py-1 bg-black/40 rounded-xl border border-amber-400/30">
                {lastCalledTicket.ticketNumber}
              </span>
            </div>
            <div className="text-xs text-slate-300">
              القسم: <span className="font-bold text-white">{lastCalledTicket.serviceName}</span> • الشباك: <span className="font-bold text-white">{lastCalledTicket.counterNumber}</span>
            </div>
          </div>
        )}
      </div>

      {/* Services Grid (Call Next & Issue Tickets) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-indigo-600" />
            أقسام الخدمة وطوابير الانتظار المتاحة ({services.length})
          </h3>

          <button
            onClick={() => setSetupMode(!setupMode)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ إضافة قسم / شباك جديد</span>
          </button>
        </div>

        {/* Create Service Inline Form */}
        {setupMode && (
          <div className="glass-panel p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 animate-in fade-in duration-200">
            <form onSubmit={serviceForm.handleSubmit(createService)} className="space-y-4">
              <h4 className="font-bold text-xs text-indigo-950">إضافة قسم انتظار جديد</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">اسم القسم / الخدمة</label>
                  <input
                    {...serviceForm.register('name')}
                    placeholder="مثال: قسم العيادات التخصصية"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  {serviceForm.formState.errors.name && (
                    <span className="text-[10px] text-rose-500">{serviceForm.formState.errors.name.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رمز التذكرة (Prefix)</label>
                  <input
                    {...serviceForm.register('codePrefix')}
                    placeholder="مثال: A أو B أو C"
                    maxLength={3}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                  {serviceForm.formState.errors.codePrefix && (
                    <span className="text-[10px] text-rose-500">{serviceForm.formState.errors.codePrefix.message}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSetupMode(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  {creating ? 'جاري الإضافة...' : 'حفظ القسم'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => {
            const isCalling = callingId === svc.id;

            return (
              <div
                key={svc.id}
                className="glass-panel p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{svc.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">الرمز: {svc.codePrefix}</span>
                  </div>
                  <button
                    onClick={() => deleteService(svc.id, svc.name)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                    title="حذف القسم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Counter Stats */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">آخر رقم تم نداءه</span>
                    <span className="text-2xl font-black font-mono text-indigo-600">
                      {svc.codePrefix}-{svc.lastCalledNumber || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">الرقم الحالي المطبوع</span>
                    <span className="text-2xl font-black font-mono text-slate-700">
                      {svc.codePrefix}-{svc.currentNumber || 0}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => callNext(svc.id, svc.name)}
                    disabled={isCalling}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <BellRing className="w-4 h-4" />
                    <span>{isCalling ? 'جاري النداء...' : '🔔 استدعاء الزبون التالي (Call Next)'}</span>
                  </button>

                  <button
                    onClick={() => issueTicket(svc.id)}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>🖨️ طباعة تذكرة لعميل جديد (Print Ticket)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Recent Tickets Call Log */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          سجل التذاكر المستدعاة مؤخراً ({tickets.length})
        </h3>

        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="p-3 font-semibold">رقم التذكرة</th>
                  <th className="p-3 font-semibold">القسم / الخدمة</th>
                  <th className="p-3 font-semibold">الشباك</th>
                  <th className="p-3 font-semibold">الحالة</th>
                  <th className="p-3 font-semibold">وقت الاستدعاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.slice(0, 8).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600">{t.ticketNumber}</td>
                    <td className="p-3 text-slate-800 font-medium">{t.serviceName}</td>
                    <td className="p-3 text-slate-600">{t.counterNumber || 'شباك 1'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        تم النداء 🔔
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(t.calledAt || t.createdAt).toLocaleTimeString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THERMAL PRINTER CUSTOMIZATION MODAL (لوجو المؤسسة + اسم المنشأة)         */}
      {/* ========================================================================= */}
      {isReceiptSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    إعدادات ورقة الطابعة الحرارية والشعار
                  </h3>
                  <p className="text-xs text-slate-400">
                    خصص الشعار واسم المجمع والنصوص الظاهرة على ورق التذاكر
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptSettingsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  رابط شعار المؤسسة (Company Logo URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={receiptLogoUrl}
                    onChange={(e) => setReceiptLogoUrl(e.target.value)}
                    placeholder="https://your-domain.com/logo.png"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  {receiptLogoUrl && (
                    <div className="w-12 h-10 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 border border-slate-200">
                      <img src={receiptLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  اسم المنشأة / المجمع الطبي
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="مثال: مجمع الأفق الطبي الاستشاري"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ملاحظة تذييل الورقة (Footer Message)
                </label>
                <input
                  type="text"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  placeholder="مثال: شكراً لزيارتكم • نسعد بخدمتكم دائماً"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="showQr"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="showQr" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  تضمين باركود QR Code على التذكرة لمتابعة الدور على الهاتف
                </label>
              </div>

              {/* Preview Box */}
              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-800 font-mono text-[11px] space-y-1">
                <span className="text-[10px] text-slate-400 font-sans block mb-1">معاينة شكل التذكرة الحرارية:</span>
                {receiptLogoUrl && <img src={receiptLogoUrl} className="h-6 mx-auto object-contain mb-1" alt="" />}
                <div className="font-bold">{facilityName}</div>
                <div className="text-[10px] text-slate-500">--------------------------------</div>
                <div className="text-lg font-black text-indigo-600">A-104</div>
                <div className="text-[10px] text-slate-500">--------------------------------</div>
                <div className="text-[9px] text-slate-400">{footerNote}</div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsReceiptSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveReceiptSettings}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/20"
              >
                حفظ الإعدادات ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
