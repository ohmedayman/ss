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
  Film,
  Image as ImageIcon,
  Send,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ColorPreset {
  id: string;
  name: string;
  backgroundColor: string;
  sidebarColor: string;
  cardColor: string;
  accentColor: string;
  tickerBgColor: string;
  tickerTextColor: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'navy_gold',
    name: '🌌 ليلي فاخر (كحلي وذهبي)',
    backgroundColor: '#020617',
    sidebarColor: '#0f172a',
    cardColor: '#1e1b4b',
    accentColor: '#f59e0b',
    tickerBgColor: '#1e1b4b',
    tickerTextColor: '#fde68a',
  },
  {
    id: 'clinic_teal',
    name: '🩺 طبي مهدئ (عيادات ومستشفيات)',
    backgroundColor: '#042f2e',
    sidebarColor: '#134e4a',
    cardColor: '#0f766e',
    accentColor: '#2dd4bf',
    tickerBgColor: '#115e59',
    tickerTextColor: '#ccfbf1',
  },
  {
    id: 'espresso_amber',
    name: '☕ كافيه ومطاعم (كراميل وإسبريسو)',
    backgroundColor: '#1c1917',
    sidebarColor: '#292524',
    cardColor: '#44403c',
    accentColor: '#fbbf24',
    tickerBgColor: '#292524',
    tickerTextColor: '#fef3c7',
  },
  {
    id: 'purple_neon',
    name: '🛍️ تسويق وعروض (بنفسجي ونيون)',
    backgroundColor: '#0f0728',
    sidebarColor: '#1e084e',
    cardColor: '#3b0764',
    accentColor: '#e879f9',
    tickerBgColor: '#2e1065',
    tickerTextColor: '#fae8ff',
  },
  {
    id: 'royal_blue',
    name: '🏢 أعمال ملكي (بنوك وشركات)',
    backgroundColor: '#082f49',
    sidebarColor: '#075985',
    cardColor: '#0369a1',
    accentColor: '#38bdf8',
    tickerBgColor: '#075985',
    tickerTextColor: '#e0f2fe',
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignModalTpl, setAssignModalTpl] = useState<any | null>(null);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [headerTitle, setHeaderTitle] = useState('مجمع الأفق الطبي الاستشاري');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80');
  const [layout, setLayout] = useState<string>('split_3_sidebar');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('pl-general-ads');
  const [tickerText, setTickerText] = useState('🎉 أهلاً بكم في شاشات العرض الذكية • عروض حصرية ومستمرة يومياً');
  
  // Colors Customizer State
  const [backgroundColor, setBackgroundColor] = useState('#020617');
  const [sidebarColor, setSidebarColor] = useState('#0f172a');
  const [cardColor, setCardColor] = useState('#1e1b4b');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [tickerBgColor, setTickerBgColor] = useState('#1e1b4b');
  const [tickerTextColor, setTickerTextColor] = useState('#fde68a');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [tplRes, plRes, medRes, scrRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/playlists'),
        fetch('/api/media'),
        fetch('/api/screens'),
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
      if (medRes.ok) {
        const med = await medRes.json();
        setMediaList(med.media || []);
      }
      if (scrRes.ok) {
        const scr = await scrRes.json();
        setScreens(scr.screens || []);
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

  const applyColorPreset = (preset: ColorPreset) => {
    setBackgroundColor(preset.backgroundColor);
    setSidebarColor(preset.sidebarColor);
    setCardColor(preset.cardColor);
    setAccentColor(preset.accentColor);
    setTickerBgColor(preset.tickerBgColor);
    setTickerTextColor(preset.tickerTextColor);
  };

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
          title: 'شاشة أرقام الانتظار',
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
          logoUrl: logoUrl.trim() || undefined,
          layout,
          backgroundColor,
          sidebarColor,
          cardColor,
          accentColor,
          tickerBgColor,
          tickerTextColor,
          zones,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch (err) {}
        await loadData();
        setSelectedTemplate(d.template);
        setIsCreateModalOpen(false);
        setName('');
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

  const assignTemplateToScreen = async (screenId: string) => {
    if (!assignModalTpl) return;
    try {
      const res = await fetch(`/api/screens/${screenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeContentType: 'template',
          activeContentId: assignModalTpl.id,
        }),
      });

      if (res.ok) {
        setAssignSuccessMsg(`تم إسناد قالب "${assignModalTpl.name}" للشاشة وبدء البث فورياً! 📺`);
        setTimeout(() => {
          setAssignModalTpl(null);
          setAssignSuccessMsg('');
        }, 1500);
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
        subtitle="تخصيص كامل للألوان، إضافة شعار المؤسسة (Logo)، وتحديد الفيديو الرئيسي وشاشات الانتظار"
      />

      {/* Action Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          لديك <span className="font-bold text-indigo-600">{templates.length}</span> قوالب شاشات ذكية مخصصة مع شاشات انتظار وألوان متكاملة
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ إنشاء وتخصيص قالب جديد (لوجو + ألوان + فيديو)</span>
        </button>
      </div>

      {/* Grid: Template Selector + Live Interactive TV Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Templates List */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-600" />
            القوالب الجاهزة والمحفوظة
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
                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 pulse-green" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignModalTpl(tpl);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="تشغيل هذا القالب على شاشة"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(tpl.id, tpl.name);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="حذف القالب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                    {tpl.headerTitle || 'تخطيط احترافي متعدد المناطق'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: tpl.accentColor || '#f59e0b' }}
                        title="لون التمييز"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: tpl.sidebarColor || '#0f172a' }}
                        title="لون الشريط الجانبي"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: tpl.cardColor || '#1e1b4b' }}
                        title="لون البطاقات"
                      />
                    </div>

                    <span className="text-[10px] text-indigo-600 font-semibold">
                      {tpl.zones?.length || 4} مناطق تفاعلية
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Interactive TV Screen Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              المعاينة التفاعلية المباشرة للقالب (Live Screen Simulator)
            </h3>
            <div className="flex items-center gap-2">
              {selectedTemplate && (
                <button
                  onClick={() => setAssignModalTpl(selectedTemplate)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>بث للشاشة الآن</span>
                </button>
              )}
              <span className="text-xs text-slate-400 font-mono">1920x1080 Full HD</span>
            </div>
          </div>

          {selectedTemplate && (
            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-700/80 p-3 bg-slate-950 shadow-2xl">
              {/* Virtual TV Frame */}
              <div
                className="w-full aspect-video rounded-2xl overflow-hidden flex flex-col relative text-white select-none shadow-2xl border border-slate-700/50 transition-colors duration-300"
                style={{ backgroundColor: selectedTemplate.backgroundColor || '#020617' }}
              >
                {/* 1. Header Bar with Logo on Right (in RTL) */}
                <div
                  className="h-12 border-b px-5 flex items-center justify-between"
                  style={{
                    backgroundColor: selectedTemplate.sidebarColor || '#0f172a',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Right Side: Logo + Title */}
                  <div className="flex items-center gap-3">
                    {selectedTemplate.logoUrl ? (
                      <img
                        src={selectedTemplate.logoUrl}
                        alt="Logo"
                        className="h-8 max-w-[100px] object-contain rounded-md bg-white/10 p-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        <Tv className="w-4 h-4" />
                      </div>
                    )}
                    <span className="font-bold text-xs text-white">
                      {selectedTemplate.headerTitle || 'شاشات العرض الذكية'}
                    </span>
                  </div>

                  {/* Left Side: Clock */}
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
                    <span className="font-bold text-white">10:47 م</span>
                    <span className="text-[10px] text-slate-400">الرياض 32°C</span>
                  </div>
                </div>

                {/* 2. Split Zones Body */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Main Video Area */}
                  <div className="flex-1 p-3 flex flex-col justify-center items-center relative overflow-hidden bg-black/50">
                    <video
                      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5">
                      <Film className="w-3 h-3 text-indigo-400" />
                      <span>منطقة الفيديو الترويجي</span>
                    </div>
                  </div>

                  {/* Sidebar Zones */}
                  <div
                    className="w-64 border-r p-3.5 flex flex-col justify-between space-y-3"
                    style={{
                      backgroundColor: selectedTemplate.sidebarColor || '#0f172a',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {/* Queue Display Widget */}
                    <div
                      className="p-4 rounded-2xl text-center shadow-lg border transition-all"
                      style={{
                        backgroundColor: selectedTemplate.cardColor || '#1e1b4b',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-indigo-200 font-bold mb-1">
                        <UsersRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>الرقم المستدعى حالياً</span>
                      </div>
                      <div
                        className="text-4xl font-black font-mono tracking-wider my-1"
                        style={{ color: selectedTemplate.accentColor || '#f59e0b' }}
                      >
                        A-104
                      </div>
                      <div className="text-[10px] text-slate-300 font-semibold">
                        الاستقبال • عيادة 1
                      </div>
                    </div>

                    {/* Live Clock Widget */}
                    <div
                      className="p-3.5 rounded-2xl text-center space-y-1 border"
                      style={{
                        backgroundColor: selectedTemplate.cardColor || '#1e1b4b',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div className="text-xl font-bold font-mono text-white">
                        22:47:30
                      </div>
                      <div className="text-[10px] text-slate-400">
                        الثلاثاء • مواعيد العمل حتى 11 م
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Ticker Marquee with Custom Colors */}
                <div
                  className="h-8 border-t flex items-center px-4 overflow-hidden"
                  style={{
                    backgroundColor: selectedTemplate.tickerBgColor || '#1e1b4b',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: selectedTemplate.tickerTextColor || '#fde68a',
                  }}
                >
                  <div className="flex items-center gap-2 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 pulse-green" />
                    <span style={{ color: selectedTemplate.accentColor || '#f59e0b' }}>تنبيه إخباري:</span>
                    <span className="truncate">
                      {selectedTemplate.zones?.find((z: any) => z.type === 'ticker')?.text ||
                        '🎉 مرحباً بكم في شاشات العرض الذكية • خصومات وعروض حصرية مستمرة طوال الأسبوع!'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Assign to Screen Modal */}
      {assignModalTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  بث قالب "{assignModalTpl.name}" على شاشة
                </h3>
              </div>
              <button
                onClick={() => setAssignModalTpl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold text-center">
                {assignSuccessMsg}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {screens.map((scr) => (
                  <button
                    key={scr.id}
                    onClick={() => assignTemplateToScreen(scr.id)}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-right flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-900">{scr.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">كود: {scr.registrationCode}</div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      scr.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {scr.status === 'online' ? 'متصل الآن' : 'غير متصل'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE & CUSTOMIZE TEMPLATE MODAL (لوجو + ألوان + فيديو)                */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    إنشاء وتخصيص قالب شاشة متكامل
                  </h3>
                  <p className="text-xs text-slate-400">
                    حدد ألوان الهوية والشعار والفيديو وشاشة الانتظار
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateTemplate} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. Basic Info: Name, Header Title, Logo */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 border-b pb-2">
                  <Tv className="w-4 h-4 text-indigo-600" />
                  <span>1. بيانات الشاشة والشعار (Header & Logo)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      اسم المنشأة / العنوان العلوي
                    </label>
                    <input
                      type="text"
                      value={headerTitle}
                      onChange={(e) => setHeaderTitle(e.target.value)}
                      placeholder="مثال: مجمع الأفق الطبي الاستشاري"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      رابط شعار المؤسسة (Company Logo URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://your-domain.com/logo.png"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      {logoUrl && (
                        <div className="w-12 h-10 rounded-xl bg-slate-900 p-1 flex items-center justify-center shrink-0 border border-slate-200">
                          <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Main Content Video / Playlist Selection */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 border-b pb-2">
                  <Film className="w-4 h-4 text-indigo-600" />
                  <span>2. محتوى المنطقة الرئيسية (فيديو أو قائمة تشغيل)</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    اختر الفيديو أو قائمة التشغيل
                  </label>
                  <select
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name} ({pl.items?.length || 0} عناصر • {pl.totalDurationSeconds || 30}s)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Full Colors Customizer & Presets */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 border-b pb-2">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  <span>3. تخصيص الألوان والهوية البصرية بالكامل (Color Palette)</span>
                </h4>

                {/* 1-Click Color Presets */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-2">
                    نماذج ألوان جاهزة بضغطة زر واحدة:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyColorPreset(preset)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-right flex items-center justify-between transition-all cursor-pointer group"
                      >
                        <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-900">
                          {preset.name}
                        </span>
                        <div className="flex gap-1">
                          <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: preset.sidebarColor }} />
                          <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: preset.cardColor }} />
                          <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: preset.accentColor }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Color Pickers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      لون الخلفية العامة
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <span className="font-mono text-xs text-slate-600 uppercase">{backgroundColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      لون الشريط الجانبي
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={sidebarColor}
                        onChange={(e) => setSidebarColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <span className="font-mono text-xs text-slate-600 uppercase">{sidebarColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      لون بطاقات الودجات
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cardColor}
                        onChange={(e) => setCardColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <span className="font-mono text-xs text-slate-600 uppercase">{cardColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      لون أرقام الانتظار (A-104)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <span className="font-mono text-xs text-slate-600 uppercase">{accentColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      خلفية شريط الأخبار
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tickerBgColor}
                        onChange={(e) => setTickerBgColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <span className="font-mono text-xs text-slate-600 uppercase">{tickerBgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      نص شريط الأخبار
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tickerTextColor}
                        onChange={(e) => setTickerTextColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <span className="font-mono text-xs text-slate-600 uppercase">{tickerTextColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Bottom Ticker Marquee */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  نص الشريط الإعلاني المتحرك (Ticker Marquee)
                </label>
                <textarea
                  value={tickerText}
                  onChange={(e) => setTickerText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ وتطبيق القالب 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
