'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Monitor,
  Tv,
  ArrowRight,
  RotateCw,
  Camera,
  Power,
  Volume2,
  Sun,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Save,
  HardDrive,
  Wifi,
  Clock,
  Settings,
  Paintbrush,
  Radio,
  Link2,
} from 'lucide-react';
import ScreenCanvasEditor from '@/components/ScreenCanvasEditor';
import { ScreenLayer } from '@/lib/types';

export default function ScreenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const screenId = params?.id as string;

  const [screen, setScreen] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  // Editable fields
  const [name, setName] = useState('');
  const [orientation, setOrientation] = useState('landscape');
  const [activeContentType, setActiveContentType] = useState('playlist');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [activeContentId, setActiveContentId] = useState('');
  const [volume, setVolume] = useState(80);
  const [notes, setNotes] = useState('');
  const [canvasLayers, setCanvasLayers] = useState<ScreenLayer[]>([]);
  const [canvasBackground, setCanvasBackground] = useState('#0f172a');

  const loadData = async () => {
    try {
      const [scrRes, plRes, tplRes, mediaRes] = await Promise.all([
        fetch(`/api/screens/${screenId}`),
        fetch('/api/playlists'),
        fetch('/api/templates'),
        fetch('/api/media'),
      ]);

      if (scrRes.ok) {
        const d = await scrRes.json();
        setScreen(d.screen);
        setName(d.screen.name);
        setOrientation(d.screen.orientation);
        setActiveContentType(d.screen.activeContentType);
        setActiveContentId(d.screen.activeContentId || '');
        setVolume(d.screen.volume || 80);
        setNotes(d.screen.notes || '');
        setCanvasLayers(d.screen.canvasLayers || []);
        setCanvasBackground(d.screen.canvasBackground || '#0f172a');
        setLiveStreamUrl(d.screen.liveStreamUrl || '');
      }
      if (plRes.ok) {
        const d = await plRes.json();
        setPlaylists(d.playlists || []);
      }
      if (tplRes.ok) {
        const d = await tplRes.json();
        setTemplates(d.templates || []);
      }
      if (mediaRes.ok) {
        const d = await mediaRes.json();
        setMedia(d.media || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [screenId]);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`/api/screens/${screenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          orientation,
          activeContentType,
          activeContentId: activeContentType === 'canvas' ? 'canvas-layout' : activeContentType === 'live_stream' ? 'live-stream' : activeContentId,
          volume,
          notes,
          canvasLayers: activeContentType === 'canvas' ? canvasLayers : undefined,
          canvasBackground: activeContentType === 'canvas' ? canvasBackground : undefined,
          liveStreamUrl: activeContentType === 'live_stream' ? liveStreamUrl : undefined,
        }),
      });

      if (res.ok) {
        setMsg('تم حفظ التغييرات ودفعها للشاشة فورياً ✅');
        await loadData();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const sendCommand = async (command: string) => {
    setActionLoading(command);
    try {
      const res = await fetch(`/api/screens/${screenId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (res.ok) {
        setMsg(`تم إرسال أمر (${command}) للشاشة بنجاح`);
        setTimeout(() => setMsg(''), 3000);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !screen) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-indigo-400">
          <RotateCw className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">جاري تحميل بيانات الشاشة...</span>
        </div>
      </div>
    );
  }

  const isOnline = screen.status === 'online' && screen.isPaired;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/screens"
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{screen.name}</h1>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {screen.registrationCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">إدارة الشاشة والبث المباشر عن بُعد</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs">
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
                <span className="text-emerald-600 font-semibold">متصل الآن ومزامن</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-slate-500">غير متصل</span>
              </>
            )}
          </div>

          <a
            href={`/player?screen=${screen.registrationCode}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-500" />
            <span>فتح شاشة العرض</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Grid: Live Canvas Simulator vs Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Canvas Simulator & Diagnostics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview Screen Canvas */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-xs">لقطة المعاينة الحية (Live Screenshot)</h3>
              </div>
              <span className="text-[11px] text-slate-500">
                {screen.lastScreenshotAt ? `آخر تحديث: ${new Date(screen.lastScreenshotAt).toLocaleTimeString('ar-SA')}` : 'البث المباشر'}
              </span>
            </div>

            <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
              {screen.screenshotUrl ? (
                <img
                  src={screen.screenshotUrl}
                  alt={screen.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 p-8 text-center">
                  <Tv className="w-16 h-16 mb-3 opacity-30 text-indigo-400" />
                  <p className="text-sm font-semibold text-slate-400">الشاشة تعمل الآن</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    اضغط على زر "التقاط لقطة شاشة" لجلب صورة فورية لما يعرضه التلفاز الآن
                  </p>
                </div>
              )}
            </div>

            {/* Quick Canvas Toolbar */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>الدقة: {screen.resolution}</span>
                <span>الاتجاه: {screen.orientation === 'landscape' ? 'أفقي (Landscape)' : 'عمودي (Portrait)'}</span>
              </div>
              <button
                onClick={() => sendCommand('take_screenshot')}
                disabled={actionLoading === 'take_screenshot'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-500" />
                <span>{actionLoading === 'take_screenshot' ? 'جاري الالتقاط...' : 'التقاط لقطة حية'}</span>
              </button>
            </div>
          </div>

          {/* Remote Actions Box */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              أوامر التحكم عن بُعد (Remote Commands)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => sendCommand('reload')}
                disabled={actionLoading === 'reload'}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 text-center transition-all cursor-pointer group"
              >
                <RotateCw className={`w-5 h-5 mx-auto mb-1.5 text-indigo-500 ${actionLoading === 'reload' ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
                <span className="block text-xs font-semibold text-slate-700">إعادة تحميل</span>
                <span className="text-[10px] text-slate-400">تحديث المحتوى</span>
              </button>

              <button
                onClick={() => sendCommand('clear_cache')}
                disabled={actionLoading === 'clear_cache'}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 text-center transition-all cursor-pointer group"
              >
                <HardDrive className="w-5 h-5 mx-auto mb-1.5 text-cyan-500" />
                <span className="block text-xs font-semibold text-slate-700">مسح الذاكرة</span>
                <span className="text-[10px] text-slate-400">تفريغ الكاش</span>
              </button>

              <button
                onClick={() => sendCommand('reboot')}
                disabled={actionLoading === 'reboot'}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 text-center transition-all cursor-pointer group"
              >
                <Power className="w-5 h-5 mx-auto mb-1.5 text-amber-500" />
                <span className="block text-xs font-semibold text-slate-700">إعادة التشغيل</span>
                <span className="text-[10px] text-slate-400">Reboot المشغل</span>
              </button>

              <button
                onClick={() => sendCommand('take_screenshot')}
                disabled={actionLoading === 'take_screenshot'}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 text-center transition-all cursor-pointer group"
              >
                <Camera className="w-5 h-5 mx-auto mb-1.5 text-emerald-500" />
                <span className="block text-xs font-semibold text-slate-700">لقطة شاشة</span>
                <span className="text-[10px] text-slate-400">معاينة فورية</span>
              </button>
            </div>
          </div>

          {/* Technical Diagnostics */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-500" />
              البيانات التقنية والاتصال
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1">عنوان IP للشاشة</span>
                <span className="font-mono text-slate-700 font-semibold">{screen.ipAddress || 'غير متوفر'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1">إصدار المشغل (App)</span>
                <span className="font-mono text-slate-700 font-semibold">{screen.appVersion || 'v1.4.2 Smart Player'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1">آخر نبضة اتصال</span>
                <span className="text-slate-700 font-semibold">
                  {screen.lastHeartbeatAt ? new Date(screen.lastHeartbeatAt).toLocaleTimeString('ar-SA') : 'غير متوفر'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & Content Selector */}
        <div className="space-y-6">
          {/* Content Assignment Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              المحتوى المسند للشاشة
            </h3>

            {/* Type Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">نوع المحتوى</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveContentType('playlist');
                    if (playlists.length > 0) setActiveContentId(playlists[0].id);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    activeContentType === 'playlist'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  قائمة تشغيل
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveContentType('template');
                    if (templates.length > 0) setActiveContentId(templates[0].id);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    activeContentType === 'template'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  قالب ذكي
                </button>

                <button
                  type="button"
                  onClick={() => setActiveContentType('canvas')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    activeContentType === 'canvas'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5 inline ml-1" />
                  محرر بصري
                </button>

                <button
                  type="button"
                  onClick={() => setActiveContentType('live_stream')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    activeContentType === 'live_stream'
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 inline ml-1" />
                  بث مباشر
                </button>
              </div>
            </div>

            {/* Canvas Editor */}
            {activeContentType === 'canvas' && (
              <ScreenCanvasEditor
                layers={canvasLayers}
                onChange={setCanvasLayers}
                background={canvasBackground}
                onBackgroundChange={setCanvasBackground}
                media={media}
                orientation={orientation as 'landscape' | 'portrait'}
              />
            )}

            {/* Live Stream URL Input */}
            {activeContentType === 'live_stream' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 text-xs font-bold mb-2">
                    <Radio className="w-4 h-4" />
                    <span>بث مباشر - Facebook Live / YouTube / أي رابط بث</span>
                  </div>
                  <p className="text-[11px] text-red-600 mb-3">
                    الصق رابط البث المباشر هنا. يُعرض على الشاشة بشكل مباشر.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">رابط البث المباشر</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        placeholder="https://www.facebook.com/your-page/live"
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setLiveStreamUrl('https://www.facebook.com/your-page/live')}
                      className="text-[10px] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                    >
                      Facebook Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setLiveStreamUrl('https://www.youtube.com/watch?v=XXXX')}
                      className="text-[10px] px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer"
                    >
                      YouTube Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setLiveStreamUrl('https://www.twitch.tv/XXXX')}
                      className="text-[10px] px-2 py-1 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 cursor-pointer"
                    >
                      Twitch
                    </button>
                  </div>
                </div>
                {liveStreamUrl && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-black aspect-video">
                    <iframe
                      src={liveStreamUrl.includes('facebook.com')
                        ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(liveStreamUrl)}&show_text=false&width=1920&autoplay=1`
                        : liveStreamUrl.includes('youtube.com') || liveStreamUrl.includes('youtu.be')
                          ? liveStreamUrl.replace('watch?v=', 'embed/').replace('youtube.com', 'youtube.com/embed') + '?autoplay=1'
                          : liveStreamUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            {/* Select specific playlist or template */}
            {activeContentType === 'playlist' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">اختر قائمة التشغيل</label>
                <select
                  value={activeContentId}
                  onChange={(e) => setActiveContentId(e.target.value)}
                  className="input"
                >
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl.items?.length || 0} عناصر - {pl.totalDurationSeconds} ثانية)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">اختر القالب متعدد المناطق</label>
                <select
                  value={activeContentId}
                  onChange={(e) => setActiveContentId(e.target.value)}
                  className="input"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Screen Settings Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" />
              إعدادات الشاشة
            </h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">اسم الشاشة</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">اتجاه العرض</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="input"
              >
                <option value="landscape">أفقي (Landscape - 16:9)</option>
                <option value="portrait">عمودي (Portrait - 9:16)</option>
              </select>
            </div>

            {/* Volume slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                  مستوى الصوت
                </span>
                <span className="font-bold">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 bg-slate-200 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">ملاحظات وموقع الشاشة</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="مثال: مثبتة في الدور الثاني بجوار قاعة الاجتماعات"
                className="input resize-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
