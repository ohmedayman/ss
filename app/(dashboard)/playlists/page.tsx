'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  ListVideo,
  Plus,
  Clock,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Film,
  Type,
} from 'lucide-react';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Active Editing Playlist State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [isLoop, setIsLoop] = useState(true);
  const [defaultTransition, setDefaultTransition] = useState('fade');
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [plRes, medRes] = await Promise.all([
        fetch('/api/playlists'),
        fetch('/api/media'),
      ]);

      if (plRes.ok) {
        const d = await plRes.json();
        setPlaylists(d.playlists || []);
      }
      if (medRes.ok) {
        const d = await medRes.json();
        setMediaItems(d.media || []);
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

  const openNewEditor = () => {
    setEditingId(null);
    setPlaylistName('');
    setPlaylistDesc('');
    setIsLoop(true);
    setDefaultTransition('fade');
    setItems([]);
    setIsEditorOpen(true);
  };

  const openEditPlaylist = (pl: any) => {
    setEditingId(pl.id);
    setPlaylistName(pl.name);
    setPlaylistDesc(pl.description || '');
    setIsLoop(pl.isLoop);
    setDefaultTransition(pl.defaultTransition || 'fade');
    setItems(pl.items || []);
    setIsEditorOpen(true);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const addItemFromMedia = (media: any) => {
    const newItem = {
      id: 'pli-' + Math.random().toString(36).substring(2, 9),
      mediaId: media.id,
      media: media,
      durationSeconds: media.durationSeconds || 10,
      transition: defaultTransition,
      isMuted: true,
    };
    setItems([...items, newItem]);
    setIsMediaPickerOpen(false);
  };

  const savePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    setSaving(true);
    try {
      const url = editingId ? `/api/playlists/${editingId}` : '/api/playlists';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDesc,
          isLoop,
          defaultTransition,
          items,
        }),
      });

      if (res.ok) {
        await loadData();
        setIsEditorOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const deletePlaylist = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف قائمة التشغيل "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculateTotalDuration = () => {
    return items.reduce((acc, item) => acc + (parseInt(item.durationSeconds, 10) || 10), 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <Header
        title="قوائم التشغيل (Playlists)"
        subtitle="إنشاء وترتيب سلاسل الصور والفيديوهات والصفحات وضبط توقيتات العرض"
      />

      {/* Action Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          لديك <span className="font-bold text-indigo-600">{playlists.length}</span> قائمة تشغيل جاهزة للبث
        </div>

        <button
          onClick={openNewEditor}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء قائمة تشغيل جديدة</span>
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((pl) => {
          return (
            <div
              key={pl.id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-slate-200 group"
            >
              {/* Item Carousel Preview */}
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ListVideo className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-bold text-slate-900 text-sm truncate">{pl.name}</h3>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-mono border border-indigo-100">
                    {pl.totalDurationSeconds} ثانية
                  </span>
                </div>

                {/* Thumbnails row */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {pl.items && pl.items.length > 0 ? (
                    pl.items.map((it: any, idx: number) => (
                      <div
                        key={idx}
                        className="relative w-16 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-700"
                        title={it.media?.name || `عنصر ${idx + 1}`}
                      >
                        {it.media?.fileType === 'image' && (
                          <img
                            src={it.media.fileUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        {it.media?.fileType === 'video' && (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-indigo-400">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 text-white px-1 rounded">
                          {it.durationSeconds}s
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-3 text-center w-full">
                      قائمة فارغة
                    </div>
                  )}
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-500 line-clamp-2">
                  {pl.description || 'قائمة تشغيل إعلانية متتابعة للشاشات'}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {pl.items?.length || 0} عناصر • {pl.isLoop ? 'تكرار مستمر' : 'مرة واحدة'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditPlaylist(pl)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => deletePlaylist(pl.id, pl.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Playlist Visual Builder & Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ListVideo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingId ? 'تعديل قائمة التشغيل' : 'إنشاء قائمة تشغيل جديدة'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    المدة الإجمالية الحالية: <span className="font-bold text-indigo-600 font-mono">{calculateTotalDuration()} ثانية</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={savePlaylist} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Form Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    اسم قائمة التشغيل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="مثال: عروض المساء الترويجية"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    التأثير الانتقالي الافتراضي
                  </label>
                  <select
                    value={defaultTransition}
                    onChange={(e) => setDefaultTransition(e.target.value)}
                    className="input"
                  >
                    <option value="fade">تلاشي (Fade)</option>
                    <option value="slide_left">انزلاق يسار (Slide Left)</option>
                    <option value="slide_right">انزلاق يمين (Slide Right)</option>
                    <option value="zoom_in">تكبير (Zoom In)</option>
                    <option value="none">بدون تأثير</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    الوصف (اختياري)
                  </label>
                  <input
                    type="text"
                    value={playlistDesc}
                    onChange={(e) => setPlaylistDesc(e.target.value)}
                    placeholder="أدخل وصفاً توضيحياً للهدف من هذه القائمة..."
                    className="input"
                  />
                </div>
              </div>

              {/* Items Sequencer Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold text-slate-700">
                    عناصر وتتابع العرض ({items.length} عناصر)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة عنصر من المكتبة</span>
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50">
                    <ListVideo className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-500">القائمة فارغة حالياً</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      اضغط على زر "إضافة عنصر من المكتبة" لاختيار الصور والفيديوهات
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 gap-3"
                      >
                        {/* Order badge & preview */}
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold font-mono">
                            {idx + 1}
                          </span>

                          <div className="w-12 h-9 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center">
                            {item.media?.fileType === 'image' && (
                              <img src={item.media.fileUrl} alt="" className="w-full h-full object-cover" />
                            )}
                            {item.media?.fileType === 'video' && (
                              <Film className="w-4 h-4 text-indigo-400" />
                            )}
                            {item.media?.fileType === 'ticker_text' && (
                              <Type className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                              {item.media?.name || 'عنصر مخصص'}
                            </p>
                            <span className="text-[10px] text-slate-400 uppercase">{item.media?.fileType}</span>
                          </div>
                        </div>

                        {/* Controls: Duration, Transition, Reorder */}
                        <div className="flex items-center gap-3">
                          {/* Duration input */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <input
                              type="number"
                              min="1"
                              max="300"
                              value={item.durationSeconds}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx].durationSeconds = parseInt(e.target.value, 10) || 5;
                                setItems(newItems);
                              }}
                              className="w-16 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-center font-mono text-xs text-slate-800"
                            />
                            <span className="text-[10px]">ثانية</span>
                          </div>

                          {/* Reorder Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveItem(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-500 border border-slate-200"
                              title="تحريك لأعلى"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(idx, 'down')}
                              disabled={idx === items.length - 1}
                              className="p-1 rounded bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-500 border border-slate-200"
                              title="تحريك لأسفل"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || !playlistName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/25"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ قائمة التشغيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">اختر عنصراً من مكتبة الوسائط</h3>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {mediaItems.map((med) => (
                <div
                  key={med.id}
                  onClick={() => addItemFromMedia(med)}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer group transition-all"
                >
                  <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden mb-2 relative flex items-center justify-center">
                    {med.fileType === 'image' && (
                      <img src={med.fileUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    {med.fileType === 'video' && (
                      <Film className="w-6 h-6 text-indigo-400" />
                    )}
                    {med.fileType === 'ticker_text' && (
                      <Type className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate">{med.name}</p>
                  <span className="text-[10px] text-slate-400">{med.durationSeconds} ثانية</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}