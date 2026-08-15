'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  CalendarClock,
  Plus,
  Clock,
  Calendar,
  Layers,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Monitor,
  Power,
} from 'lucide-react';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState('playlist');
  const [targetId, setTargetId] = useState('pl-offers-morning');
  const [selectedScreenIds, setSelectedScreenIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4]); // Sun-Thu
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const daysMap = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الإثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
    { id: 5, name: 'الجمعة' },
    { id: 6, name: 'السبت' },
  ];

  const loadData = async () => {
    try {
      const [schRes, plRes, scrRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/playlists'),
        fetch('/api/screens'),
      ]);

      if (schRes.ok) {
        const d = await schRes.json();
        setSchedules(d.schedules || []);
      }
      if (plRes.ok) {
        const d = await plRes.json();
        setPlaylists(d.playlists || []);
      }
      if (scrRes.ok) {
        const d = await scrRes.json();
        setScreens(d.screens || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setTargetType('playlist');
    setTargetId(playlists[0]?.id || 'pl-offers-morning');
    setSelectedScreenIds([]);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('2026-12-31');
    setStartTime('08:00');
    setEndTime('12:00');
    setDaysOfWeek([0, 1, 2, 3, 4]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const toggleDay = (dayId: number) => {
    if (daysOfWeek.includes(dayId)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== dayId));
    } else {
      setDaysOfWeek([...daysOfWeek, dayId].sort());
    }
  };

  const saveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const url = editingId ? `/api/schedules/${editingId}` : '/api/schedules';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          targetType,
          targetId,
          screenIds: selectedScreenIds,
          startDate,
          endDate,
          startTime,
          endTime,
          daysOfWeek,
          isActive,
        }),
      });

      if (res.ok) {
        await loadData();
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الجدول "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActiveStatus = async (sch: any) => {
    try {
      await fetch(`/api/schedules/${sch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sch.isActive }),
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <Header
        title="الجدولة الزمنية للمحتوى"
        subtitle="برمجة أوقات وأيام عرض الإعلانات والقوائم تلقائياً وفق جدول زمني دقيق"
      />

      {/* Action Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="text-xs text-slate-300">
          لديك <span className="font-bold text-indigo-400">{schedules.length}</span> جداول مبرمجة
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة جدول زمني جديد</span>
        </button>
      </div>

      {/* Schedules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schedules.map((sch) => {
          return (
            <div
              key={sch.id}
              className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                      <CalendarClock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{sch.name}</h3>
                      <span className="text-[11px] text-slate-400">
                        الهدف: قائمة العروض الصباحية
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleActiveStatus(sch)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      sch.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sch.isActive ? 'bg-emerald-400 pulse-green' : 'bg-slate-500'}`} />
                    <span>{sch.isActive ? 'مفعل ويعمل' : 'معطل مؤقتاً'}</span>
                  </button>
                </div>

                {/* Time & Days details */}
                <div className="space-y-2 text-xs bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      ساعات التشغيل:
                    </span>
                    <span className="font-mono font-bold text-indigo-300">
                      {sch.startTime} - {sch.endTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      فترة السريان:
                    </span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {sch.startDate} إلى {sch.endDate}
                    </span>
                  </div>
                </div>

                {/* Days of Week Badges */}
                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 block mb-1.5">أيام الأسبوع النشطة:</span>
                  <div className="flex flex-wrap gap-1">
                    {daysMap.map((d) => {
                      const isIncluded = sch.daysOfWeek?.includes(d.id);
                      return (
                        <span
                          key={d.id}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border ${
                            isIncluded
                              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 font-semibold'
                              : 'bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          {d.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {sch.screenIds?.length === 0
                      ? 'ينطبق على جميع الشاشات'
                      : `محدد على ${sch.screenIds?.length} شاشات`}
                  </span>
                </div>

                <button
                  onClick={() => deleteSchedule(sch.id, sch.name)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="حذف الجدول"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">إنشاء جدول زمني جديد</h3>
                  <p className="text-xs text-slate-400">حدد ساعات وأيام تشغيل المحتوى</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم الجدول الزمني <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عروض الغداء الخاصة"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Target Playlist */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  قائمة التشغيل المستهدفة
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl.totalDurationSeconds} ثانية)
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    وقت البداية (من)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono text-center focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    وقت النهاية (إلى)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono text-center focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Days Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  أيام التشغيل
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {daysMap.map((d) => {
                    const isSelected = daysOfWeek.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleDay(d.id)}
                        className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/25"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الجدول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
