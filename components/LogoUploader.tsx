'use client';

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, Sparkles, X } from 'lucide-react';

interface LogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const STOCK_LOGOS = [
  {
    name: 'مجمع طبي 🩺',
    url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'كافيه وقهوة ☕',
    url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'مطعم وبرجر 🍔',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'متجر وتسوق 🛍️',
    url: 'https://images.unsplash.com/photo-1572584642822-6f8de0243c93?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'أعمال وتقنية 🏢',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  },
];

export default function LogoUploader({ value, onChange, label = 'شعار المؤسسة (Logo)' }: LogoUploaderProps) {
  const [tab, setTab] = useState<'upload' | 'url' | 'stock'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP)');
      return;
    }

    // 1. Instant local base64 preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // 2. Also try uploading to server /api/media
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', `لوجو - ${file.name}`);
      formData.append('folder', 'شعارات');
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const d = await res.json();
        if (d.media?.fileUrl) {
          onChange(d.media.fileUrl);
        }
      }
    } catch (err) {
      console.warn('Server upload fallback to base64');
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">{label}</label>
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              tab === 'upload' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>من الكمبيوتر</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              tab === 'url' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>رابط مباشر (فيس/ويب)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('stock')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              tab === 'stock' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>شعارات جاهزة</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Local File Upload from Computer / Phone */}
      {tab === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileInputChange}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">
              {uploading ? 'جاري الرفع والمعالجة...' : 'اضغط لاختيار صورة اللوجو من جهازك'}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              يدعم كافة صيغ الصور (PNG, JPG, SVG, WebP) وخلفيات الشفافية
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Direct URL from Facebook, Web, or Cloud */}
      {tab === 'url' && (
        <div className="space-y-1.5">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="انسخ رابط الصورة من فيسبوك أو موقعك https://.../logo.png"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <span className="text-[10px] text-slate-400 block">
            يمكنك نسخ رابط أي صورة من صفحتك على فيسبوك أو متجرك ولصقها هنا مباشرة.
          </span>
        </div>
      )}

      {/* Tab 3: Ready-Made Stock Logos */}
      {tab === 'stock' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STOCK_LOGOS.map((item, idx) => {
            const isSelected = value === item.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(item.url)}
                className={`p-2 rounded-xl border text-right flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <img src={item.url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                <span className="text-[11px] font-bold text-slate-800 truncate">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Live Preview Box if Logo is Selected */}
      {value && (
        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-lg bg-white/10 p-1 flex items-center justify-center backdrop-blur-xs">
              <img src={value} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-bold block">معاينة الشعار الحالي</span>
              <span className="text-[10px] text-slate-400 font-mono line-clamp-1 max-w-[200px] sm:max-w-xs">
                {value.startsWith('data:') ? 'ملف محلي تم رفعه بنجاح' : value}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
            title="إزالة الشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
