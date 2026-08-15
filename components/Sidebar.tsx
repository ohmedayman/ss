'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Monitor,
  Film,
  ListVideo,
  CalendarClock,
  LayoutTemplate,
  UsersRound,
  History,
  Settings,
  Tv,
  LayoutDashboard,
  HardDrive,
  ExternalLink,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  storageUsedBytes?: number;
  storageLimitMb?: number;
  onlineScreens?: number;
  totalScreens?: number;
}

export default function Sidebar({
  storageUsedBytes = 20370000,
  storageLimitMb = 10240,
  onlineScreens = 2,
  totalScreens = 4,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'لوحة التحكم',
      href: '/',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      name: 'الشاشات الرقمية',
      href: '/screens',
      icon: Monitor,
      badge: `${onlineScreens}/${totalScreens}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      name: 'مكتبة الوسائط',
      href: '/media',
      icon: Film,
    },
    {
      name: 'قوائم التشغيل',
      href: '/playlists',
      icon: ListVideo,
    },
    {
      name: 'الجدولة الزمنية',
      href: '/schedules',
      icon: CalendarClock,
    },
    {
      name: 'استوديو القوالب',
      href: '/templates',
      icon: LayoutTemplate,
      badge: 'جديد',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      name: 'أرقام الانتظار (Queue)',
      href: '/queue',
      icon: UsersRound,
      badge: 'SaaS Ready',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      name: 'سجل الأنشطة',
      href: '/activity',
      icon: History,
    },
    {
      name: 'إعدادات المؤسسة',
      href: '/settings',
      icon: Settings,
    },
  ];

  const storageUsedMb = (storageUsedBytes / 1024 / 1024).toFixed(1);
  const storagePercentage = Math.min(100, Math.round(((storageUsedBytes / 1024 / 1024) / storageLimitMb) * 100));

  return (
    <aside className="w-64 bg-[#0e1424] border-l border-slate-800/80 flex flex-col h-screen fixed top-0 right-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">ScreenFlow</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                SaaS
              </span>
            </div>
            <p className="text-xs text-slate-400">إدارة الشاشات السحابية</p>
          </div>
        </Link>
      </div>

      {/* Launch Player Button */}
      <div className="px-4 pt-4">
        <a
          href="/player"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-indigo-200" />
            <span>مشغل الشاشة (Web Player)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-[-2px] transition-transform" />
        </a>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 px-3 py-1">القائمة الرئيسية</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Storage & Organization Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0b0f19]/60 space-y-3">
        {/* Storage Bar */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              المساحة المستهلكة
            </span>
            <span className="font-semibold text-slate-200 text-[11px]">
              {storageUsedMb} MB / {storageLimitMb / 1024} GB
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, storagePercentage)}%` }}
            />
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
              أ
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">أحمد عبد الله</p>
              <p className="text-[10px] text-emerald-400 font-medium">باقة الشركات (Pro)</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" title="متصل الآن" />
        </div>
      </div>
    </aside>
  );
}
