'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  LayoutTemplate,
  Sparkles,
  Plus,
  Tv,
  Clock,
  CloudSun,
  Type,
  UsersRound,
  Eye,
  CheckCircle2,
  Layers,
  Monitor,
  Trash2,
  X,
  Palette,
  Check,
} from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Template Form State
  const [name, setName] = useState('');
  const [headerTitle, setHeaderTitle] = useState('');
  const [layout, setLayout] = useState<string>('split_3_sidebar');
  const [backgroundColor, setBackgroundColor] = useState('#0f172a');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('pl-general-ads');
  const [tickerText, setTickerText] = useState('🎉 أهلاً بكم في شاشات العرض الذكية • عروض حصرية ومستمرة يومياً');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [tplRes, plRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/playlists'),
      ]);

      if (tplRes.ok) {
        const d = await tplRes.json();
        setTemplates(d.templates || []);
        if (d.templates?.length > 0 && !selectedTemplate) {
          setSelectedTemplate(d.templates[0]);
        }
      }
      if (plRes.ok) {
        const pl = await plRes.json();
        setPlaylists(pl.playlists || []);
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

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const zones = [
        {
          id: 'zone-main',
          title: 'المنطقة الرئيسية',
          type: 'playlist',
          contentId: selectedPlaylistId,
        },
        {
          id: 'zone-sidebar-queue',
          title: 'شاشة الانتظار',
          type: 'queue_display',
        },
        {
          id: 'zone-sidebar-clock',
          title: 'الساعة والطقس',
          type: 'clock',
        },
        {
          id: 'zone-ticker',
          title: 'الشريط الإخباري',
          type: 'ticker',
          text: tickerText,
        },
      ];

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          headerTitle: headerTitle.trim() || undefined,
          layout,
          backgroundColor,
          zones,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        await loadData();
        setSelectedTemplate(d.template);
        setIsCreateModalOpen(false);
        setName('');
        setHeaderTitle('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string, tplName: string) => {
    if (!confirm(`هل أنت متأكد من حذف القالب "${tplName}"؟`)) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
        setSelectedTemplate(templates.find((t) => t.id !== id) || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <Header
        title="استوديو القوالب والتصميمات (Templates Studio)"
        subtitle="شاشات جاهزة متعددة المناطق مع ودجات الطقس والساعة والشريط الإخباري وشاشات الانتظار"
      />

      {/* Action Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="text-xs text-slate-600">
          لديك <span className="font-bold text-indigo-600">{templates.length}</span> قوالب شاشات ذكية متعددة المناطق
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء قالب مخصص جديد</span>
        </button>
      </div>

      {/* Grid: Template Selector + Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Templates List */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-600" />
            القوالب الجاهزة المتاحة
          </h3>

          <div className="space-y-3">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-xs">{tpl.name}</h4>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 pulse-green" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(tpl.id, tpl.name);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                        title="حذف القالب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                    {tpl.headerTitle || 'تخطيط احترافي متعدد المناطق'}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {tpl.zones?.map((z: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                      >
                        {z.type === 'playlist'
                          ? 'فيديو/صور'
                          : z.type === 'queue_display'
                          ? 'أرقام انتظار'
                          : z.type === 'clock'
                          ? 'ساعة وطقس'
                          : z.type === 'ticker'
                          ? 'شريط إخباري'
                          : 'محتوى'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Interactive Interactive Preview Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              المعاينة التفاعلية المباشرة للقالب
            </h3>
            <span className="text-xs text-slate-400 font-mono">1920x1080 Full HD</span>
          </div>

          {selectedTemplate && (
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 p-3 bg-slate-900 shadow-xl">
              {/* Virtual TV Frame */}
              <div
                className="w-full aspect-video rounded-xl overflow-hidden flex flex-col relative text-white select-none shadow-2xl border border-slate-700/50"
                style={{ backgroundColor: selectedTemplate.backgroundColor || '#0f172a' }}
              >
                {/* Header Title Bar if any */}
                {selectedTemplate.headerTitle && (
                  <div className="h-10 bg-slate-900/90 border-b border-slate-700/80 px-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <Tv className="w-4 h-4 text-indigo-400" />
                      <span>{selectedTemplate.headerTitle}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="font-mono">{new Date().toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                )}

                {/* Split zones body */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Main Zone (Left in RTL = Right in LTR) */}
                  <div className="flex-1 p-3 flex flex-col justify-center items-center relative overflow-hidden bg-slate-950/60">
                    <img
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white">
                      منطقة الفيديو والصور الرئيسية
                    </div>
                  </div>

                  {/* Sidebar Zones */}
                  {selectedTemplate.layout === 'split_3_sidebar' && (
                    <div className="w-64 bg-slate-900/90 border-r border-slate-800 p-3 flex flex-col justify-between space-y-3">
                      {/* Queue Display Widget */}
                      <div className="bg-gradient-to-br from-indigo-900/80 to-slate-900 p-3.5 rounded-xl border border-indigo-500/30 text-center shadow-lg">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-300 font-semibold mb-1">
                          <UsersRound className="w-3.5 h-3.5" />
                          <span>الرقم الحالي</span>
                        </div>
                        <div className="text-3xl font-black font-mono text-amber-400 tracking-wider">
                          A-104
                        </div>
                        <div className="text-[10px] text-slate-300 mt-1 font-medium">
                          عيادة الاستشارات 3
                        </div>
                      </div>

                      {/* Live Clock & Weather Widget */}
                      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-xl font-bold font-mono text-white">
                          14:35
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          الرياض • 32° مشمس ☀️
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Ticker Marquee */}
                <div className="h-9 bg-indigo-950/90 border-t border-indigo-900/50 flex items-center px-4 overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 pulse-green" />
                    <span className="font-bold text-amber-300 shrink-0">تنبيه إخباري:</span>
                    <span className="truncate">
                      {selectedTemplate.zones?.find((z: any) => z.type === 'ticker')?.text ||
                        '🎉 مرحباً بكم في شاشات العرض الذكية - خصومات وعروض خاصة طوال هذا الشهر!'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create New Template Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">إنشاء قالب شاشة مخصص</h3>
                  <p className="text-xs text-slate-400">حدد تقسيم المناطق والمحتوى والودجات</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  اسم القالب <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: قالب بهو الاستقبال والانتظار"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  عنوان الشريط العلوي للشاشة (Header Title)
                </label>
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  placeholder="مثال: مجمع الأفق الطبي الاستشاري"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Layout Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  نوع التقسيم والتخطيط
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayout('split_3_sidebar')}
                    className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      layout === 'split_3_sidebar'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">شريط جانبي + ساعة + انتظار</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">مثالي للعيادات والبنوك والمكاتب</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayout('split_2_horizontal')}
                    className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      layout === 'split_2_horizontal'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">شاشة عروض + شريط إخباري</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">للمطاعم والمقاهي والمحلات</div>
                  </button>
                </div>
              </div>

              {/* Main Zone Playlist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  قائمة التشغيل للمنطقة الرئيسية
                </label>
                <select
                  value={selectedPlaylistId}
                  onChange={(e) => setSelectedPlaylistId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl.items?.length || 0} عناصر)
                    </option>
                  ))}
                </select>
              </div>

              {/* Ticker Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  نص الشريط الإعلاني السفلي (Ticker Marquee)
                </label>
                <textarea
                  value={tickerText}
                  onChange={(e) => setTickerText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ وإنشاء القالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
