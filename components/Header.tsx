'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Tv,
  Bell,
  UploadCloud,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenPairModal?: () => void;
  onOpenUploadModal?: () => void;
}

export default function Header({
  title,
  subtitle,
  onOpenPairModal,
  onOpenUploadModal,
}: HeaderProps) {
  const router = useRouter();
  const [hasNotifications, setHasNotifications] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUserProfile(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  };

  const sampleNotifications: any[] = [];

  return (
    <header className="h-18 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{subtitle}</p>}
      </div>

      {/* Actions & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Pair Screen Button */}
        {onOpenPairModal && (
          <button
            onClick={onOpenPairModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">ربط شاشة جديدة</span>
            <span className="sm:hidden">إضافة شاشة</span>
          </button>
        )}

        {/* Quick Upload Media */}
        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-medium border border-slate-200 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-indigo-500" />
            <span>رفع وسائط</span>
          </button>
        )}

        {/* Live Player Direct Link */}
        <Link
          href="/player"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 text-xs font-medium transition-all"
        >
          <Tv className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">المشغل</span>
        </Link>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setHasNotifications(false);
            }}
            className="relative p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="w-4 h-4" />
            {hasNotifications && (
              <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute left-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <span>الإشعارات</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {sampleNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">لا توجد إشعارات جديدة</p>
                  </div>
                ) : sampleNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50/80 transition-colors text-right flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                      notif.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {notif.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       notif.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                       <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{notif.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <Link
                  href="/activity"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  عرض سجل الأنشطة الكامل
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {userProfile?.user?.fullName ? userProfile.user.fullName.charAt(0) : 'م'}
            </div>
            <span className="text-xs font-semibold text-slate-700 hidden md:inline">{userProfile?.user?.fullName || 'مستخدم'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          </button>

          {isProfileOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <p className="font-bold text-xs text-slate-900">{userProfile?.user?.fullName || 'مستخدم جديد'}</p>
                <p className="text-[10px] text-slate-400 truncate">{userProfile?.user?.email || ''}</p>
                <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100">
                  {userProfile?.organization?.plan === 'pro' ? 'باقة المحترفين' : userProfile?.organization?.plan === 'free' ? 'مجاني' : userProfile?.organization?.plan || 'مجاني'}
                </span>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>الملف الشخصي</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>الإعدادات</span>
                </Link>

                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
