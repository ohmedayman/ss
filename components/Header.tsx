'use client';

import React, { useState } from 'react';
import {
  Plus,
  Tv,
  Bell,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';

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
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <header className="h-18 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Actions & Utilities */}
      <div className="flex items-center gap-3">
        {/* Quick Pair Screen Button */}
        {onOpenPairModal && (
          <button
            onClick={onOpenPairModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ربط شاشة جديدة</span>
          </button>
        )}

        {/* Quick Upload Media */}
        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-medium border border-slate-200 transition-all cursor-pointer"
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
          <span>فتح المشغل</span>
        </Link>

        {/* Notifications Bell */}
        <button
          onClick={() => setHasNotifications(false)}
          className="relative p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer"
          title="الإشعارات والتنبيهات"
        >
          <Bell className="w-4 h-4" />
          {hasNotifications && (
            <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
}
