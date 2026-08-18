'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import PairScreenModal from '@/components/PairScreenModal';
import UploadMediaModal from '@/components/UploadMediaModal';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Monitor,
  Tv,
  Film,
  ListVideo,
  RotateCw,
  Camera,
  Layers,
  ArrowUpRight,
  Sparkles,
  Plus,
  AlertTriangle,
  Clock,
  UsersRound,
  Eye,
  HardDrive,
  Upload,
  CalendarClock,
  LayoutList,
  Wifi,
  WifiOff,
  Pencil,
  Terminal,
  Activity,
  User,
  Shield,
  Settings,
  Zap,
} from 'lucide-react';

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `منذ ${diffHr} ساعة`;
  const diffDay = Math.floor(diffHr / 24);
  return `منذ ${diffDay} يوم`;
}

function formatStorage(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getActionIcon(type: string) {
  switch (type) {
    case 'screen': return Monitor;
    case 'media': return Film;
    case 'playlist': return ListVideo;
    case 'schedule': return CalendarClock;
    case 'auth': return Shield;
    case 'settings': return Settings;
    default: return Activity;
  }
}

function getActionColor(type: string): { bg: string; text: string; dot: string } {
  switch (type) {
    case 'screen': return { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' };
    case 'media': return { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500' };
    case 'playlist': return { bg: 'bg-cyan-50', text: 'text-cyan-600', dot: 'bg-cyan-500' };
    case 'schedule': return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
    case 'auth': return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
    case 'settings': return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  }
}

export default function DashboardPage() {
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { data: statsData, isLoading: statsLoading } = useSWR<{ stats: any; recentLogs: any[] }>('/api/stats', {
    refreshInterval: 15000,
  });
  const { data: screensData, isLoading: screensLoading, mutate: mutateScreens } = useSWR<{ screens: any[] }>('/api/screens', {
    refreshInterval: 15000,
  });

  const stats = statsData?.stats;
  const recentLogs = statsData?.recentLogs || [];
  const screens = screensData?.screens || [];
  const loading = statsLoading || screensLoading;

  const sendScreenCommand = async (screenId: string, command: string) => {
    setActionLoadingId(`${screenId}-${command}`);
    try {
      const res = await fetch(`/api/screens/${screenId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (res.ok) {
        await mutateScreens();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const storagePercent = stats?.storageUsagePercent ?? 0;
  const storageGradient = storagePercent > 80
    ? 'from-rose-500 to-red-600'
    : storagePercent > 50
    ? 'from-amber-400 to-orange-500'
    : 'from-indigo-500 to-cyan-400';

  const onlineCount = stats?.onlineScreens ?? 0;
  const offlineCount = stats?.offlineScreens ?? 0;
  const totalScreens = onlineCount + offlineCount;

  const lastFiveLogs = useMemo(() => recentLogs.slice(0, 5), [recentLogs]);

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
      <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-white border border-slate-200 shadow-xl">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-cyan-100 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>مرحباً بك في منصة ScreenFlow</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              تحكم كامل في جميع شاشاتك عن بُعد وبثوانٍ معدودة
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              يمكنك ربط أي شاشة تلفاز ذكية أو متصفح ويب عبر كود التسجيل المباشر، وتعيين قوائم التشغيل، والجدولة الزمنية، وقوالب أرقام الانتظار بضغطة زر واحدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPairModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>ربط شاشة بكود</span>
            </button>
            <a
              href="/player"
              target="_blank"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-medium text-xs border border-slate-200 transition-all"
            >
              <Tv className="w-4 h-4 text-indigo-500" />
              <span>معاينة مشغل الشاشات</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: Analytics Charts — Storage / Donut / Timeline
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Storage Usage Bar */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-800">استهلاك التخزين</span>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {storagePercent}%
            </span>
          </div>

          {/* Gradient progress bar */}
          <div className="relative w-full h-5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${storageGradient} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${storagePercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
              {stats?.storageUsedBytes != null ? formatStorage(stats.storageUsedBytes) : '—'}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
            <span>
              {stats?.storageLimitMb
                ? `${(stats.storageLimitMb / 1024).toFixed(1)} GB`
                : '—'} حد الأقصى
            </span>
            <span className="text-slate-500 font-medium">
              {stats?.storageUsedBytes != null
                ? `${formatStorage(stats.storageUsedBytes)} مستخدم`
                : ''}
            </span>
          </div>
        </div>

        {/* Screens Online/Offline Donut */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col items-center justify-center">
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800">حالة الاتصال</span>
            </div>
          </div>

          {/* CSS Donut Chart */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="14" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="url(#donutGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${(onlineCount / (totalScreens || 1)) * 314} 314`}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-900">{onlineCount}</span>
              <span className="text-[10px] text-slate-400 font-medium">متصل</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">{onlineCount} متصل</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="text-slate-600 font-medium">{offlineCount} غير متصل</span>
            </div>
          </div>
        </div>

        {/* Activity Timeline (Last 5 actions) */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-slate-800">آخر الأنشطة</span>
            </div>
            <span className="text-[11px] text-slate-400">آخر 5 إجراءات</span>
          </div>

          <div className="flex-1 space-y-0">
            {lastFiveLogs.length > 0 ? lastFiveLogs.map((log, i) => {
              const colors = getActionColor(log.actionType);
              const Icon = getActionIcon(log.actionType);
              return (
                <div key={log.id || i} className="flex items-start gap-3 relative pb-3 last:pb-0">
                  {/* Connector line */}
                  {i < lastFiveLogs.length - 1 && (
                    <div className="absolute top-8 right-[15px] w-px h-full bg-slate-200" />
                  )}
                  {/* Dot / Icon */}
                  <div className={`relative z-10 w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-800 truncate">{log.action}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 mr-2">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{log.userName || 'النظام'}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <Activity className="w-6 h-6 mb-1 opacity-40" />
                <span className="text-[11px]">لا توجد أنشطة حديثة</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: Quick Actions Grid — 4 action cards
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ربط شاشة جديدة */}
        <button
          onClick={() => setIsPairModalOpen(true)}
          className="group glass-panel glass-panel-hover rounded-2xl p-5 text-right cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <Monitor className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">ربط شاشة جديدة</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">إضافة شاشة بالكود وبدء البث</p>
        </button>

        {/* رفع وسائط */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="group glass-panel glass-panel-hover rounded-2xl p-5 text-right cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">رفع وسائط</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">صور، فيديو، أو ملفات PDF</p>
        </button>

        {/* إنشاء قائمة تشغيل */}
        <Link
          href="/playlists"
          className="group glass-panel glass-panel-hover rounded-2xl p-5 text-right transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
            <LayoutList className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">إنشاء قائمة تشغيل</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">تنظيم المحتوى وتوقيت العرض</p>
        </Link>

        {/* جدولة محتوى */}
        <Link
          href="/schedules"
          className="group glass-panel glass-panel-hover rounded-2xl p-5 text-right transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
            <CalendarClock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">جدولة محتوى</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">تخصيص العرض حسب اليوم والوقت</p>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2.5: Featured Ready-made Stock Media Showcase
          ═══════════════════════════════════════════════════════════ */}
      <div className="glass-panel rounded-3xl p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden border border-indigo-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                مكتبة المحتوى الجاهز السحابية
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              تصاميم وفيديوهات احترافية جاهزة للبث المباشر على شاشاتك
            </h3>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              اختر أي تصميم أو فيديو عالي الدقة (مطاعم، كافيهات، عيادات، عروض مبيعات) واستورده لشاشتك بضغطة زر واحدة.
            </p>
          </div>

          <Link
            href="/media"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all shrink-0 cursor-pointer"
          >
            <span>استعراض كافة التصاميم (30+)</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Quick Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'stock-coffee-video',
              name: 'فيديو القهوة واللاتيه آرت',
              category: 'كافيهات ومقاهي',
              img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=70',
              type: 'فيديو 1080p',
            },
            {
              id: 'stock-burger-video',
              name: 'فيديو شوي البرجر والوجبات',
              category: 'مطاعم وسريعة',
              img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=70',
              type: 'فيديو 1080p',
            },
            {
              id: 'stock-sale-poster-img',
              name: 'بوستر التخفيضات الكبرى 50%',
              category: 'متاجر وتجزئة',
              img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=70',
              type: 'بوستر 4K',
            },
            {
              id: 'stock-clinic-video',
              name: 'فيديو الرعاية والعيادات الطبية',
              category: 'عيادات وصحة',
              img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=70',
              type: 'فيديو صالات الانتظار',
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-white/10 rounded-2xl overflow-hidden border border-white/15 flex flex-col justify-between group hover:border-amber-400/60 transition-all shadow-md"
            >
              <div className="relative aspect-video bg-black/40 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-white">
                  {item.category}
                </span>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-indigo-600/90 text-[9px] font-bold text-white">
                  {item.type}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                <Link
                  href="/media"
                  className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold text-center transition-colors block shadow-sm"
                >
                  استيراد وتخصيص الآن ⚡
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: Screen Status Cards — paired screens with detail
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900">الشاشات المقترنة</h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {screens.filter(s => s.isPaired).length} شاشة
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => mutateScreens()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              <span>تحديث</span>
            </button>
            <Link
              href="/screens"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
            >
              عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {screens.map((screen) => {
            const isOnline = screen.status === 'online' && screen.isPaired;
            const lastHb = screen.lastHeartbeatAt ? formatRelativeTime(screen.lastHeartbeatAt) : null;

            const contentTypeLabel = screen.activeContentType === 'playlist'
              ? 'قائمة تشغيل'
              : screen.activeContentType === 'template'
              ? 'قالب'
              : screen.activeContentType === 'image'
              ? 'صورة'
              : screen.activeContentType === 'video'
              ? 'فيديو'
              : 'محتوى مخصص';

            return (
              <div
                key={screen.id}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-200 group hover:shadow-lg transition-shadow"
              >
                {/* Screen Preview / Placeholder */}
                <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200">
                  {screen.screenshotUrl ? (
                    <img
                      src={screen.screenshotUrl}
                      alt={screen.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Tv className="w-10 h-10 mb-2 opacity-40" />
                      <span className="text-xs text-slate-400">
                        {screen.isPaired ? 'لا تتوفر لقطة حية بعد' : 'في انتظار الاقتران'}
                      </span>
                    </div>
                  )}

                  {/* Online/Offline Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-[11px] font-semibold">
                    {isOnline ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
                        <span className="text-emerald-600">متصل الآن</span>
                      </>
                    ) : screen.isPaired ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                        <span className="text-slate-500">غير متصل</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-amber-600">كود: {screen.registrationCode}</span>
                      </>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-md text-[10px] text-slate-600 font-mono border border-slate-200">
                    {screen.resolution || '1920x1080'} • {screen.orientation === 'landscape' ? 'أفقي' : 'عمودي'}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{screen.name}</h4>
                      <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {screen.registrationCode}
                      </span>
                    </div>

                    {/* Last Heartbeat */}
                    {lastHb && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>آخر اتصال: {lastHb}</span>
                      </div>
                    )}

                    {/* Current Content */}
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="shrink-0">المحتوى:</span>
                      <span className="text-slate-600 font-medium truncate">
                        {contentTypeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Remote Quick Controls */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5">
                    <button
                      onClick={() => sendScreenCommand(screen.id, 'reload')}
                      disabled={actionLoadingId === `${screen.id}-reload`}
                      title="إعادة تحميل"
                      className="flex-1 py-2 px-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-indigo-500 ${actionLoadingId === `${screen.id}-reload` ? 'animate-spin' : ''}`} />
                      <span>تحديث</span>
                    </button>

                    <button
                      onClick={() => sendScreenCommand(screen.id, 'take_screenshot')}
                      disabled={actionLoadingId === `${screen.id}-take_screenshot`}
                      title="لقطة شاشة"
                      className="flex-1 py-2 px-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-3.5 h-3.5 text-cyan-500" />
                      <span>لقطة شاشة</span>
                    </button>

                    <Link
                      href={`/screens/${screen.id}`}
                      title="لوحة التحكم"
                      className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-semibold flex items-center justify-center gap-1 border border-indigo-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>تحكم</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {screens.filter(s => s.isPaired).length === 0 && (
            <div className="col-span-full glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mb-4">
                <Tv className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-base">لا توجد شاشات مقترنة بعد</h4>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
                اربط شاشتك الأولى بسرعة عن طريق إدخال كود التسجيل من الشاشة الذكية
              </p>
              <button
                onClick={() => setIsPairModalOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                ابدأ بالربط الآن
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: Recent Activity Feed — enhanced with avatars & colors
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 text-base">آخر الأنشطة والعمليات</h3>
            </div>
            <Link href="/activity" className="text-xs text-indigo-600 hover:underline font-semibold">
              عرض السجل الكامل
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentLogs.length > 0 ? recentLogs.slice(0, 6).map((log, i) => {
              const colors = getActionColor(log.actionType);
              const Icon = getActionIcon(log.actionType);
              return (
                <div key={log.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                  {/* User Avatar / Action Icon */}
                  <div className={`relative w-9 h-9 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                    <span className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full ${colors.dot} border-2 border-white`} />
                  </div>

                  <div className="flex-1 text-xs min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-slate-800 truncate">{log.action}</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${colors.bg} ${colors.text} shrink-0`}>
                          {log.actionType}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {log.details}
                    </p>
                    {log.userName && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                        <User className="w-3 h-3" />
                        <span>{log.userName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Activity className="w-8 h-8 mb-2 opacity-40" />
                <span className="text-xs">لا توجد أنشطة مسجلة</span>
              </div>
            )}
          </div>
        </div>

        {/* Queue Management Ready Banner */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-b from-indigo-50 to-white border-indigo-100">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <UsersRound className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-600">جاهز للتوسع</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">نظام أرقام انتظار العملاء</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              تم تجهيز بنية النظام المعمارية وقاعدة البيانات لاستيعاب نظام إدارة الطوابير، وتوليد التذاكر، وشاشات العروض والبث المباشر بدون أي تعديلات هيكلية.
            </p>

            {/* Quick Stats in Queue Card */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-100 text-center">
                <span className="text-lg font-extrabold text-slate-900">{stats?.activeQueueServices ?? 0}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">خدمات نشطة</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-100 text-center">
                <span className="text-lg font-extrabold text-slate-900">{stats?.activeSchedules ?? 0}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">جدول زمني</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <Link
              href="/queue"
              className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs border border-amber-200 transition-colors"
            >
              <span>معاينة محاكي أرقام الانتظار</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/schedules"
              className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors"
            >
              <span>إدارة الجدولة الزمنية</span>
              <CalendarClock className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <PairScreenModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        onSuccess={() => mutateScreens()}
      />

      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => mutateScreens()}
      />
    </div>
  );
}
