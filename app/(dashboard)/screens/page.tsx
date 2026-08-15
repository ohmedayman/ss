'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PairScreenModal from '@/components/PairScreenModal';
import Link from 'next/link';
import {
  Tv,
  RotateCw,
  Camera,
  Trash2,
  Search,
  Layers,
  LayoutGrid,
  List,
  Eye,
} from 'lucide-react';

export default function ScreensPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'unpaired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadScreens = async () => {
    try {
      const res = await fetch('/api/screens');
      if (res.ok) {
        const data = await res.json();
        setScreens(data.screens || []);
      }
    } catch (e) {
      console.error('Failed to load screens:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScreens();
    const interval = setInterval(loadScreens, 15000);
    return () => clearInterval(interval);
  }, []);

  const sendCommand = async (screenId: string, command: string) => {
    setActionLoading(`${screenId}-${command}`);
    try {
      const res = await fetch(`/api/screens/${screenId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (res.ok) {
        await loadScreens();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteScreen = async (screenId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الشاشة "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/screens/${screenId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadScreens();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredScreens = screens.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registrationCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'online') return s.status === 'online' && s.isPaired;
    if (filterStatus === 'offline') return s.status === 'offline' && s.isPaired;
    if (filterStatus === 'unpaired') return !s.isPaired;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <Header
        title="إدارة الشاشات الرقمية"
        subtitle="مراقبة وإدارة جميع شاشات العرض عن بُعد وتحديث محتواها بشكل فوري"
        onOpenPairModal={() => setIsPairModalOpen(true)}
      />

      {/* Control Bar: Search, Filters, View Mode */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو كود التسجيل..."
            className="input pl-3 pr-9"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            الكل ({screens.length})
          </button>

          <button
            onClick={() => setFilterStatus('online')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              filterStatus === 'online'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-500 hover:text-emerald-600 border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>متصلة ({screens.filter((s) => s.status === 'online' && s.isPaired).length})</span>
          </button>

          <button
            onClick={() => setFilterStatus('offline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              filterStatus === 'offline'
                ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>غير متصلة ({screens.filter((s) => s.status === 'offline' && s.isPaired).length})</span>
          </button>

          <button
            onClick={() => setFilterStatus('unpaired')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              filterStatus === 'unpaired'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white text-slate-500 hover:text-amber-600 border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>في انتظار الاقتران ({screens.filter((s) => !s.isPaired).length})</span>
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="عرض الشبكة"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="عرض الجدول"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => {
            const isOnline = screen.status === 'online' && screen.isPaired;

            return (
              <div
                key={screen.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-slate-200 group"
              >
                {/* Live Preview / Screenshot */}
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-200">
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
                        {screen.isPaired ? 'لا تتوفر لقطة حية بعد' : 'جاهزة للاقتران'}
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
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

                  {/* Orientation */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-md text-[10px] text-slate-600 font-mono border border-slate-200">
                    {screen.resolution || '1920x1080'} • {screen.orientation === 'landscape' ? 'أفقي' : 'عمودي'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{screen.name}</h4>
                      <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {screen.registrationCode}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>المحتوى:</span>
                        <span className="text-slate-700 font-medium truncate">
                          {screen.activeContentType === 'playlist'
                            ? 'قائمة الإعلانات الرئيسية'
                            : screen.activeContentType === 'template'
                            ? 'قالب العيادات والانتظار'
                            : 'محتوى مخصص'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span>الصوت: {screen.volume}%</span>
                        <span>IP: {screen.ipAddress || '192.168.1.105'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remote Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => sendCommand(screen.id, 'reload')}
                      disabled={actionLoading === `${screen.id}-reload`}
                      title="إعادة تحميل المحتوى"
                      className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-indigo-500 ${actionLoading === `${screen.id}-reload` ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={() => sendCommand(screen.id, 'take_screenshot')}
                      disabled={actionLoading === `${screen.id}-take_screenshot`}
                      title="التقاط لقطة شاشة حية"
                      className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-cyan-500" />
                    </button>

                    <Link
                      href={`/screens/${screen.id}`}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all text-center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>غرفة التحكم</span>
                    </Link>

                    <button
                      onClick={() => deleteScreen(screen.id, screen.name)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 transition-colors cursor-pointer"
                      title="حذف الشاشة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode */
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="p-4">الشاشة</th>
                  <th className="p-4">كود التسجيل</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">المحتوى المعروض</th>
                  <th className="p-4">الدقة والاتجاه</th>
                  <th className="p-4">آخر اتصال</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScreens.map((screen) => {
                  const isOnline = screen.status === 'online' && screen.isPaired;

                  return (
                    <tr key={screen.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                            <Tv className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{screen.name}</p>
                            <p className="text-[11px] text-slate-400">{screen.tags?.join(', ') || 'شاشة'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-indigo-600">
                        {screen.registrationCode}
                      </td>

                      <td className="p-4">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-green" />
                            متصل الآن
                          </span>
                        ) : screen.isPaired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-medium text-[11px]">
                            غير متصل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-semibold text-[11px]">
                            بانتظار الاقتران
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-600">
                        {screen.activeContentType === 'playlist'
                          ? 'قائمة الإعلانات الرئيسية'
                          : screen.activeContentType === 'template'
                          ? 'قالب العيادات والانتظار'
                          : 'محتوى مخصص'}
                      </td>

                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {screen.resolution} • {screen.orientation === 'landscape' ? 'أفقي' : 'عمودي'}
                      </td>

                      <td className="p-4 text-slate-500 text-[11px]">
                        {screen.lastHeartbeatAt ? 'منذ دقيقة' : 'غير متصل'}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => sendCommand(screen.id, 'reload')}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 transition-colors"
                            title="تحديث"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                          </button>
                          <Link
                            href={`/screens/${screen.id}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
                          >
                            تحكم
                          </Link>
                          <button
                            onClick={() => deleteScreen(screen.id, screen.name)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pairing Modal */}
      <PairScreenModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        onSuccess={() => loadScreens()}
      />
    </div>
  );
}