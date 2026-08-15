'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  X,
  Image,
  Film,
  Globe,
  Type,
  Music,
  CheckCircle2,
  AlertCircle,
  Clock,
  Folder,
  Link2,
} from 'lucide-react';

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (media: any) => void;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function UploadMediaModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadMediaModalProps) {
  const [tab, setTab] = useState<'file' | 'youtube' | 'web_url' | 'audio' | 'ticker_text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [tickerText, setTickerText] = useState('');
  const [folder, setFolder] = useState('عام');
  const [duration, setDuration] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        if (!name) setName(droppedFile.name.replace(/\.[^/.]+$/, ''));
        setTab('file');
      } else if (droppedFile.type.startsWith('audio/')) {
        setAudioFile(droppedFile);
        if (!name) setName(droppedFile.name.replace(/\.[^/.]+$/, ''));
        setTab('audio');
      }
    }
  };

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
      } else if (tab === 'youtube') {
        if (!youtubeUrl.trim()) {
          setError('يرجى كتابة رابط يوتيوب');
          setLoading(false);
          return;
        }

        const videoId = extractYouTubeId(youtubeUrl.trim());
        if (!videoId) {
          setError('رابط يوتيوب غير صحيح. يرجى استخدام رابط يوتيوب صالح');
          setLoading(false);
          return;
        }

        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim() || 'فيديو يوتيوب',
            fileType: 'youtube_video',
            fileUrl: youtubeUrl.trim(),
            customUrl: embedUrl,
            thumbnailUrl,
            folder,
            durationSeconds: parseInt(duration, 10) || 30,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل حفظ فيديو يوتيوب');

        onSuccess(data.media);
        onClose();
      } else if (tab === 'audio') {
        if (!audioFile) {
          setError('يرجى اختيار ملف صوتي');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('name', name.trim() || audioFile.name.replace(/\.[^/.]+$/, ''));
        formData.append('folder', folder);
        formData.append('duration', duration);
        formData.append('mediaType', 'audio');

        const res = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'fails رفع الملف الصوتي');

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

  const tabs = [
    { id: 'file' as const, label: 'صورة / فيديو', icon: Image },
    { id: 'youtube' as const, label: 'يوتيوب', icon: YoutubeIcon },
    { id: 'audio' as const, label: 'صوتيات', icon: Music },
    { id: 'web_url' as const, label: 'صفحة ويب', icon: Globe },
    { id: 'ticker_text' as const, label: 'شريط متحرك', icon: Type },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">إضافة وسائط ومحتوى جديد</h3>
              <p className="text-xs text-slate-500">صور، فيديوهات، يوتيوب، صوتيات، صفحات ويب</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1.5 gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-0 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  tab === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Zone (file tab only) */}
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
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all group ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors ${
                  isDragging ? 'bg-indigo-200 text-indigo-600' : 'bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-500'
                }`}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600">{file.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      {isDragging ? 'أفلت الملف هنا' : 'اضغط أو اسحب ملف صورة أو فيديو'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, WEBP, MP4 حتى 50 MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* YouTube */}
          {tab === 'youtube' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                  رابط فيديو يوتيوب
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input text-left font-mono placeholder:text-slate-400"
                  required
                />
              </div>
              {youtubeUrl && extractYouTubeId(youtubeUrl) && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video">
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(youtubeUrl)}/maxresdefault.jpg`}
                    alt="YouTube Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${extractYouTubeId(youtubeUrl)}/hqdefault.jpg`;
                    }}
                  />
                </div>
              )}
              <p className="text-[11px] text-slate-400">يدعم روابط يوتيوب العادية والقصيرة (shorts)</p>
            </div>
          )}

          {/* Audio */}
          {tab === 'audio' && (
            <div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAudioFile(e.target.files[0]);
                    if (!name) setName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                  }
                }}
              />
              <div
                onClick={() => audioInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-indigo-50/50 group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors">
                  <Music className="w-6 h-6" />
                </div>
                {audioFile ? (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600">{audioFile.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <audio src={URL.createObjectURL(audioFile)} controls className="mt-3 w-full max-w-xs mx-auto h-8" />
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-600">اضغط لاختيار ملف صوتي</p>
                    <p className="text-[11px] text-slate-400 mt-1">MP3, WAV, OGG, AAC حتى 20 MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Web URL */}
          {tab === 'web_url' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                رابط الموقع الإلكتروني
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

          {/* Ticker */}
          {tab === 'ticker_text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                نص الشريط الإعلاني المتحرك
              </label>
              <textarea
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="أدخل النص الذي ترغب في أن يتحرك في الشريط الإعلاني..."
                rows={3}
                className="input resize-none placeholder:text-slate-400"
                required
              />
            </div>
          )}

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                عنوان الملف
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
                المجلد
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="input"
              >
                <option value="عام">عام</option>
                <option value="صور">صور</option>
                <option value="فيديو">فيديو</option>
                <option value="صوتيات">صوتيات</option>
                <option value="يوتيوب">يوتيوب</option>
                <option value="إعلانات">إعلانات</option>
                <option value="عروض ترويجية">عروض ترويجية</option>
                <option value="قوائم الطعام">قوائم الطعام</option>
                <option value="توعية وإرشادات">توعية وإرشادات</option>
                <option value="لوجوهات">لوجوهات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                مدة العرض
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
                <option value="60">دقيقة</option>
                <option value="120">دقيقتان</option>
                <option value="300">5 دقائق</option>
              </select>
            </div>
          </div>

          {/* Footer */}
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
              <span>{loading ? 'جاري الحفظ...' : 'حفظ للمكتبة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
