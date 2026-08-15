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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">إضافة وسائط ومحتوى جديد</h3>
              <p className="text-xs text-slate-500">صور، فيديوهات، صفحات ويب أو أشرطة إخبارية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'file'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
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
                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
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
                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>شريط متحرك</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-600">
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
                className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-indigo-50/50 group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600">{file.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-600">اضغط لاختيار صورة أو فيديو من جهازك</p>
                    <p className="text-[11px] text-slate-400 mt-1">يدعم JPG, PNG, WEBP, MP4 حتى 50 MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'web_url' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                رابط الموقع الإلكتروني (Website URL)
              </label>
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://example.com"
                className="input text-left font-mono placeholder:text-slate-400"
                required
              />
            </div>
          )}

          {tab === 'ticker_text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                نص الإعلان أو التنبيه المتحرك (Ticker Marquee)
              </label>
              <textarea
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="أدخل النص الذي ترغب في أن يتحرك في الشريط الإعلاني للشاشة..."
                rows={3}
                className="input resize-none placeholder:text-slate-400"
                required
              />
            </div>
          )}

          {/* Common Fields: Name & Folder & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                عنوان أو اسم الملف
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: إعلان عروض الشتاء"
                className="input placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-indigo-500" />
                المجلد / التصنيف
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="input"
              >
                <option value="عام">عام</option>
                <option value="إعلانات">إعلانات</option>
                <option value="عروض ترويجية">عروض ترويجية</option>
                <option value="قوائم الطعام">قوائم الطعام</option>
                <option value="توعية وإرشادات">توعية وإرشادات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                مدة العرض الافتراضية
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input"
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
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
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