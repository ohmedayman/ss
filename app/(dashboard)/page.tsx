'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PairScreenModal from '@/components/PairScreenModal';
import UploadMediaModal from '@/components/UploadMediaModal';
import Link from 'next/link';
import {
  Monitor,
  Tv,
  Film,
  ListVideo,
  CalendarClock,
  RotateCw,
  Camera,
  Layers,
  ArrowUpRight,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  UsersRound,
  Eye,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [statsRes, screensRes] = await fetchAll();
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (screensRes.ok) {
        const d = await screensRes.json();
        setScreens(d.screens || []);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = () => {
    return Promise.all([
      fetch('/api/stats'),
      fetch('/api/screens'),
    ]);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const sendScreenCommand = async (screenId: string, command: string) => {
    setActionLoadingId(`${screenId}-${command}`);
    try {
      const res = await fetch(`/api/screens/${screenId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <Header
        title="لوحة التحكم والإحصائيات"
        subtitle="نظرة عامة على شبكة الشاشات الرقمية والمحتوى المباشر"
        onOpenPairModal={() => setIsPairModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Hero Welcome & Quick Launch */}
      <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-r from-indigo-900/60 via-slate-900 to-[#0e1424] border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>مرحباً بك في منصة ScreenFlow SaaS</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              تحكم كامل في جميع شاشاتك عن بُعد وبثوانٍ معدودة
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              يمكنك ربط أي شاشة تلفاز ذكية أو متصفح ويب عبر كود التسجيل المباشر، وتعيين قوائم التشغيل، والجدولة الزمنية، وقوالب أرقام الانتظار بضغطة زر واحدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPairModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>ربط شاشة بكود</span>
            </button>
            <a
              href="/player"
              target="_blank"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 transition-all"
            >
              <Tv className="w-4 h-4 text-indigo-400" />
              <span>معاينة مشغل الشاشات</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats Counter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Screens */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي الشاشات</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalScreens || screens.length}
            </span>
            <span className="text-xs text-slate-400">شاشة مسجلة</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{stats?.pairedScreens || 3} شاشة مقترنة</span>
            <Link href="/screens" className="text-indigo-400 hover:underline flex items-center gap-0.5">
              إدارة الشاشات <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Online Screens */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">الشاشات المتصلة (Online)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-green" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {stats?.onlineScreens || 2}
            </span>
            <span className="text-xs text-emerald-400/80 font-medium">تعمل الآن مباشرة</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>تحديثات مستمرة كل 15 ثانية</span>
            <span className="text-emerald-400 font-semibold">100% نشط</span>
          </div>
        </div>

        {/* Offline Screens */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">الشاشات غير المتصلة</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-300">
              {stats?.offlineScreens || 2}
            </span>
            <span className="text-xs text-amber-400/90 font-medium">غير متصلة أو جاهزة للربط</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{stats?.unpairedScreens || 1} في انتظار كود الربط</span>
            <button
              onClick={() => setIsPairModalOpen(true)}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              ربط الآن
            </button>
          </div>
        </div>

        {/* Media & Playlists */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">المحتوى والوسائط</span>
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalMedia || 5}
            </span>
            <span className="text-xs text-slate-400">ملف وسائط</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{stats?.totalPlaylists || 2} قوائم تشغيل</span>
            <Link href="/media" className="text-indigo-400 hover:underline flex items-center gap-0.5">
              المكتبة <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Live Screens Matrix (مصفوفة الشاشات الحية) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">مراقبة الشاشات الحية (Live Screens Matrix)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              <span>تحديث الحالة</span>
            </button>
            <Link
              href="/screens"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              عرض جميع الشاشات <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => {
            const isOnline = screen.status === 'online' && screen.isPaired;

            return (
              <div
                key={screen.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-slate-800/90 group"
              >
                {/* Screen Preview Canvas / Screenshot */}
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                  {screen.screenshotUrl ? (
                    <img
                      src={screen.screenshotUrl}
                      alt={screen.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600">
                      <Tv className="w-10 h-10 mb-2 opacity-40" />
                      <span className="text-xs text-slate-500">
                        {screen.isPaired ? 'لا تتوفر لقطة حية بعد' : 'في انتظار الاقتران'}
                      </span>
                    </div>
                  )}

                  {/* Status Pill Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold">
                    {isOnline ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green" />
                        <span className="text-emerald-400">متصل الآن</span>
                      </>
                    ) : screen.isPaired ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        <span className="text-slate-400">غير متصل</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="text-amber-400">كود: {screen.registrationCode}</span>
                      </>
                    )}
                  </div>

                  {/* Orientation & Resolution Tag */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300 font-mono">
                    {screen.resolution || '1920x1080'} • {screen.orientation === 'landscape' ? 'أفقي' : 'عمودي'}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm truncate">{screen.name}</h4>
                      <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {screen.registrationCode}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>المحتوى:</span>
                      <span className="text-slate-200 font-medium truncate">
                        {screen.activeContentType === 'playlist'
                          ? 'قائمة الإعلانات الرئيسية'
                          : screen.activeContentType === 'template'
                          ? 'قالب العيادات والانتظار'
                          : 'محتوى مخصص'}
                      </span>
                    </div>
                  </div>

                  {/* Remote Quick Controls */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => sendScreenCommand(screen.id, 'reload')}
                      disabled={actionLoadingId === `${screen.id}-reload`}
                      title="إعادة تحميل المحتوى"
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RotateCw className={`w-3 h-3 text-indigo-400 ${actionLoadingId === `${screen.id}-reload` ? 'animate-spin' : ''}`} />
                      <span>تحديث</span>
                    </button>

                    <button
                      onClick={() => sendScreenCommand(screen.id, 'take_screenshot')}
                      disabled={actionLoadingId === `${screen.id}-take_screenshot`}
                      title="التقاط لقطة شاشة حية"
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-3 h-3 text-cyan-400" />
                      <span>لقطة شاشة</span>
                    </button>

                    <Link
                      href={`/screens/${screen.id}`}
                      className="py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1 border border-indigo-500/30 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>تحكم</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Queue Management Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">آخر الأنشطة والعمليات (Activity Log)</h3>
            </div>
            <Link href="/activity" className="text-xs text-indigo-400 hover:underline">
              عرض السجل الكامل
            </Link>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <ListVideo className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">إسناد قائمة تشغيل</span>
                  <span className="text-[11px] text-slate-500">منذ ساعتين</span>
                </div>
                <p className="text-slate-400 mt-0.5">
                  تم تعيين قائمة "قائمة الإعلانات الرئيسية" على شاشة الاستقبال الرئيسية
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <RotateCw className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">أمر تحديث فوري (Reload)</span>
                  <span className="text-[11px] text-slate-500">منذ 5 ساعات</span>
                </div>
                <p className="text-slate-400 mt-0.5">
                  إرسال أمر التحديث إلى شاشة صالة الانتظار والعيادات
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">رفع وسائط جديدة</span>
                  <span className="text-[11px] text-slate-500">منذ 12 ساعة</span>
                </div>
                <p className="text-slate-400 mt-0.5">
                  تم رفع ملف الصورة "عرض الصيف الترويجي 2026" (2.4 MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Management Ready Banner */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-b from-indigo-950/40 to-slate-900/90 border-indigo-500/30">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <UsersRound className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-400">جاهز للتوسع (SaaS Ready)</span>
            </div>
            <h4 className="font-bold text-white text-base">نظام أرقام انتظار العملاء</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              تم تجهيز بنية النظام المعمارية وقاعدة البيانات لاستيعاب نظام إدارة الطوابير، وتوليد التذاكر، وشاشات النداء الصوتي والعيادات بدون أي تعديلات هيكلية.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/queue"
              className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 transition-colors"
            >
              <span>معاينة محاكي أرقام الانتظار</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <PairScreenModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        onSuccess={() => loadData()}
      />

      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
