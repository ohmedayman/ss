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
  RotateCcw,
} from 'lucide-react';
import { queueServiceSchema, QueueServiceFormData } from '@/lib/validations';
import LogoUploader from '@/components/LogoUploader';

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

  const fetcher = (url: string) => fetch(url).then((r) => r.json());

  const { data, isLoading: loading, mutate } = useSWR<{ services: any[]; tickets: any[] }>(
    '/api/queue',
    fetcher,
    {
      refreshInterval: 3000,
    }
  );

  const services = data?.services || [];
  const tickets = data?.tickets || [];

  // Play harmonic 3-tone chime sound
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const playTone = (freq: number, startTime: number, duration: number, vol: number = 0.35) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      playTone(587.33, now, 0.25, 0.4);
      playTone(880.00, now + 0.18, 0.3, 0.45);
      playTone(1174.66, now + 0.38, 0.5, 0.5);
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  };

  // Speak Arabic Queue Announcement (ElevenLabs Studio Voice + Fallback)
  const speakQueueTicket = async (ticketNumber: string, counterName: string) => {
    try {
      playChime();
      const rawNum = ticketNumber.replace(/^[A-Za-z\u0600-\u06FF]-?/, '');
      const spokenNum = rawNum || ticketNumber;
      let spokenCounter = counterName || 'شباك الخدمة';
      if (spokenCounter.startsWith('قسم ')) {
        spokenCounter = spokenCounter.replace('قسم ', 'شباك ');
      }
      const announcementText = `عميل رقم ${spokenNum}، ${spokenCounter}`;

      let playedElevenLabs = false;
      try {
        const res = await fetch('/api/queue/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: announcementText }),
        });

        if (res.ok && res.headers.get('content-type')?.includes('audio')) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.volume = 1.0;
          setTimeout(() => {
            audio.play().catch(() => {});
          }, 650);
          playedElevenLabs = true;
        }
      } catch (e) {}

      if (!playedElevenLabs) {
        setTimeout(() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(announcementText);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.88;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const arabicVoice = voices.find(
              (v) =>
                v.lang.startsWith('ar') ||
                v.name.toLowerCase().includes('arabic') ||
                v.name.toLowerCase().includes('maged') ||
                v.name.toLowerCase().includes('laila') ||
                v.name.toLowerCase().includes('tarik')
            );
            if (arabicVoice) utterance.voice = arabicVoice;
            window.speechSynthesis.speak(utterance);
          }
        }, 700);
      }
    } catch (e) {
      console.error(e);
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
        speakQueueTicket(d.ticket.ticketNumber, serviceName);
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

  const resetCounter = async (serviceId: string, serviceName: string) => {
    if (!confirm(`هل تريد تصفير عداد "${serviceName}" والبدء من رقم 1؟`)) return;
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_counter', serviceId }),
      });
      if (res.ok) {
        await mutate();
        setSuccessMsg(`تم تصفير العداد لـ "${serviceName}" وسيبدأ النداء والطباعة من رقم 1 ✨`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
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
        await mutate();
        serviceForm.reset();
        setSetupMode(false);
        setSuccessMsg(`تمت إضافة القسم "${formData.name}" بنجاح ويبدأ من رقم 1 ✨`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert(d.error || 'فشل إضافة القسم');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ في الاتصال بالخادم');
    } finally {
      setCreating(false);
    }
  };

  const deleteService = async (serviceId: string, serviceName: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف قسم "${serviceName}"؟`)) return;
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_service', serviceId }),
      });
      if (res.ok) {
        await mutate();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Thermal Printer Print Ticket Function
  const printTicket = (ticket: any) => {
    const printWindow = window.open('', '_blank', 'width=350,height=550');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة للطباعة');
      return;
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
      typeof window !== 'undefined' ? `${window.location.origin}/player?ticket=${ticket.ticketNumber}` : 'https://screenflow.app'
    )}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تذكرة انتظار - ${ticket.ticketNumber}</title>
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
        subtitle="إصدار أرقام انتظار من رقم 1 وعرضها المباشر على الشاشات + نداء صوتي وطباعة حرارية مخصصة"
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
              عند نداء التذكرة يتم تشغيل رنين صوتي في الشاشات ونطق العبارة العربية: <strong className="text-amber-300 font-bold">"عميل رقم 1، شباك المبيعات"</strong>، مع إمكانية طباعة تذاكر حرارية تحمل لوجو المؤسسة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => speakQueueTicket('1', 'شباك المبيعات')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>🗣️ تجربة النداء الصوتي</span>
            </button>

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
                  ticketNumber: 'S-1',
                  serviceName: 'قسم المبيعات والطلبات',
                  counterNumber: 'شباك المبيعات',
                  createdAt: new Date().toISOString(),
                });
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ طباعة تذكرة رقم 1 تجريبية</span>
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
              <h4 className="font-bold text-xs text-indigo-950">إضافة قسم انتظار جديد يبدأ من رقم 1</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">اسم القسم / الخدمة</label>
                  <input
                    {...serviceForm.register('name')}
                    placeholder="مثال: قسم المبيعات"
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
                    placeholder="مثال: S أو A أو B"
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => resetCounter(svc.id, svc.name)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                      title="تصفير العداد إلى رقم 1"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteService(svc.id, svc.name)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      title="حذف القسم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* Recent Tickets Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          سجل التذاكر المستدعاة مؤخراً ({tickets.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="pb-3">رقم التذكرة</th>
                <th className="pb-3">القسم / الخدمة</th>
                <th className="pb-3">الشباك</th>
                <th className="pb-3">الحالة</th>
                <th className="pb-3">وقت الاستدعاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.slice(0, 8).map((t) => (
                <tr key={t.id} className="text-slate-700">
                  <td className="py-3 font-mono font-bold text-indigo-600">{t.ticketNumber}</td>
                  <td className="py-3">{t.serviceName}</td>
                  <td className="py-3">{t.counterNumber || 'شباك 1'}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                      تم النداء
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">
                    {t.calledAt ? new Date(t.calledAt).toLocaleTimeString('ar-SA') : 'منذ قليل'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thermal Printer Customization Modal */}
      {isReceiptSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">تخصيص ورقة الطابعة الحرارية (80mm / 58mm)</h3>
                  <p className="text-xs text-slate-400">تعديل الشعار، اسم العيادة، وملاحظات التذكرة</p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptSettingsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <LogoUploader
                value={receiptLogoUrl}
                onChange={setReceiptLogoUrl}
                label="شعار المؤسسة أعلى ورقة التذكرة (Logo)"
              />

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
                  ملاحظة أسفل التذكرة (Footer Note)
                </label>
                <input
                  type="text"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  placeholder="شكراً لزيارتكم • نسعد بخدمتكم دائماً"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="showQrCheck"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <label htmlFor="showQrCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  طباعة رمز باركود QR Code في التذكرة لمتابعة الدور
                </label>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsReceiptSettingsOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveReceiptSettings}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
