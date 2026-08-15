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
  X,
} from 'lucide-react';

interface SidebarProps {
  storageUsedBytes?: number;
  storageLimitMb?: number;
  onlineScreens?: number;
  totalScreens?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  storageUsedBytes = 20370000,
  storageLimitMb = 10240,
  onlineScreens = 2,
  totalScreens = 4,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard, badge: undefined },
    {
      name: 'الشاشات الرقمية',
      href: '/screens',
      icon: Monitor,
      badge: `${onlineScreens}/${totalScreens}`,
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    { name: 'مكتبة الوسائط', href: '/media', icon: Film },
    { name: 'قوائم التشغيل', href: '/playlists', icon: ListVideo },
    { name: 'الجدولة الزمنية', href: '/schedules', icon: CalendarClock },
    {
      name: 'استوديو القوالب',
      href: '/templates',
      icon: LayoutTemplate,
      badge: 'جديد',
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      name: 'أرقام الانتظار (Queue)',
      href: '/queue',
      icon: UsersRound,
      badge: 'SaaS Ready',
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    { name: 'سجل الأنشطة', href: '/activity', icon: History },
    { name: 'إعدادات المؤسسة', href: '/settings', icon: Settings },
  ];

  const storageUsedMb = (storageUsedBytes / 1024 / 1024).toFixed(1);
  const storagePercentage = Math.min(100, Math.round(((storageUsedBytes / 1024 / 1024) / storageLimitMb) * 100));

  const handleNavClick = () => {
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-l border-slate-200 flex flex-col h-screen fixed top-0 right-0 z-50 select-none shadow-sm transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={handleNavClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ScreenFlow</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100">
                  SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400">إدارة الشاشات السحابية</p>
            </div>
          </Link>
          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Launch Player Button */}
        <div className="px-4 pt-4">
          <a
            href="/player"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition-all group"
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
                onClick={handleNavClick}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Storage & Organization Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          {/* Storage Bar */}
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-400">
                <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                المساحة المستهلكة
              </span>
              <span className="font-semibold text-slate-600 text-[11px]">
                {storageUsedMb} MB / {storageLimitMb / 1024} GB
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, storagePercentage)}%` }}
              />
            </div>
          </div>

          {/* User Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600">
                أ
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">أحمد عبد الله</p>
                <p className="text-[10px] text-emerald-600 font-medium">باقة الشركات (Pro)</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" title="متصل الآن" />
          </div>
        </div>
      </aside>
    </>
  );
}
