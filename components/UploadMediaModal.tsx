'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Image,
  Film,
  Globe,
  Type,
  CheckCircle2,
  AlertCircle,
  Clock,
  Folder,
} from 'lucide-react';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (media: any) => void;
}

export default function UploadMediaModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadMediaModalProps) {
  const [tab, setTab] = useState<'file' | 'web_url' | 'ticker_text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [tickerText, setTickerText] = useState('');
  const [folder, setFolder] = useState('عام');
  const [duration, setDuration] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 'file') {
        if (!file) {
          setError('يرجى اختيار ملف للصورة أو الفيديو');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name.trim() || file.name);
        formData.append('folder', folder);
        formData.append('duration', duration);

        const res = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل رفع الملف');

        onSuccess(data.media);
        onClose();
      } else if (tab === 'web_url') {
        if (!webUrl.trim()) {
          setError('يرجى كتابة رابط الموقع الإلكتروني');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim() || 'صفحة ويب',
            fileType: 'web_url',
            fileUrl: webUrl.trim(),
            folder,
            durationSeconds: parseInt(duration, 10) || 30,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل حفظ الرابط');

        onSuccess(data.media);
        onClose();
      } else if (tab === 'ticker_text') {
        if (!tickerText.trim()) {
          setError('يرجى كتابة نص الشريط الإعلاني');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim() || 'شريط إعلاني',
            fileType: 'ticker_text',
            customTickerText: tickerText.trim(),
            folder,
            durationSeconds: parseInt(duration, 10) || 15,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل حفظ النص');

        onSuccess(data.media);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الوسائط');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">إضافة وسائط ومحتوى جديد</h3>
              <p className="text-xs text-slate-400">صور، فيديوهات، صفحات ويب أو أشرطة إخبارية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'file'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>رفع ملف (صورة / فيديو)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('web_url')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'web_url'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>صفحة ويب (URL)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('ticker_text')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'ticker_text'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>شريط متحرك</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    if (!name) setName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                  }
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-900/50 hover:bg-indigo-950/20 group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 group-hover:bg-indigo-600/30 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-xs font-semibold text-emerald-400">{file.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-300">اضغط لاختيار صورة أو فيديو من جهازك</p>
                    <p className="text-[11px] text-slate-500 mt-1">يدعم JPG, PNG, WEBP, MP4 حتى 50 MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'web_url' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رابط الموقع الإلكتروني (Website URL)
              </label>
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 text-left font-mono"
                required
              />
            </div>
          )}

          {tab === 'ticker_text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                نص الإعلان أو التنبيه المتحرك (Ticker Marquee)
              </label>
              <textarea
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="أدخل النص الذي ترغب في أن يتحرك في الشريط الإعلاني للشاشة..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                required
              />
            </div>
          )}

          {/* Common Fields: Name & Folder & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                عنوان أو اسم الملف
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: إعلان عروض الشتاء"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                المجلد / التصنيف
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="عام">عام</option>
                <option value="إعلانات">إعلانات</option>
                <option value="عروض ترويجية">عروض ترويجية</option>
                <option value="قوائم الطعام">قوائم الطعام</option>
                <option value="توعية وإرشادات">توعية وإرشادات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                مدة العرض الافتراضية
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="5">5 ثوانٍ</option>
                <option value="10">10 ثوانٍ</option>
                <option value="15">15 ثانية</option>
                <option value="20">20 ثانية</option>
                <option value="30">30 ثانية</option>
                <option value="60">دقيقة واحدة</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{loading ? 'جاري الحفظ...' : 'حفظ وإضافة للمكتبة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
