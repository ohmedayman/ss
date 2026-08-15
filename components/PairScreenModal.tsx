'use client';

import React, { useState } from 'react';
import {
  Tv,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PairScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (screen: any) => void;
}

export default function PairScreenModal({
  isOpen,
  onClose,
  onSuccess,
}: PairScreenModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [activeContentType, setActiveContentType] = useState<'playlist' | 'template'>('playlist');
  const [activeContentId, setActiveContentId] = useState('pl-general-ads');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('يرجى كتابة كود الاقتران الظاهر على الشاشة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/screens/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim() || undefined,
          activeContentType,
          activeContentId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل اقتران الشاشة');
      }

      // Celebrate success!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      setSuccessMsg('🎉 تم ربط الشاشة بنجاح وبدء تشغيل المحتوى فورياً!');
      setTimeout(() => {
        onSuccess(data.screen);
        onClose();
        setCode('');
        setName('');
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">ربط واقتران شاشة جديدة</h3>
              <p className="text-xs text-slate-500">أدخل كود التسجيل المكون من 6 خانات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Banner */}
        <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
          <div className="text-xs text-indigo-800 leading-relaxed">
            <p className="font-semibold text-indigo-900 mb-1">كيف تقوم بتشغيل الشاشة؟</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
              <li>افتح صفحة المشغل على التلفزيون أو المتصفح من الرابط:
                <a
                  href="/player"
                  target="_blank"
                  className="text-indigo-600 underline font-mono mr-1 inline-flex items-center gap-0.5 hover:text-indigo-500"
                >
                  /player <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>سيظهر كود اقتران فريد على الشاشة (مثلاً: <span className="font-mono font-bold text-amber-600">SF-2026</span>).</li>
              <li>أدخل الكود أدناه لتتصل الشاشة فورياً بلوحة التحكم.</li>
            </ol>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePair} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Registration Code Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              كود تسجيل الشاشة (Registration Code) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: SF-2026 أو SF-8491"
              maxLength={10}
              className="input text-center font-mono text-xl tracking-widest text-indigo-600 uppercase placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400"
              required
            />
          </div>

          {/* Screen Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              اسم الشاشة (اختياري)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: شاشة الاستقبال - المدخل الرئيسي"
              className="input placeholder:text-slate-400"
            />
          </div>

          {/* Initial Content Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              المحتوى المخصص للشاشة
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveContentType('playlist');
                  setActiveContentId('pl-general-ads');
                }}
                className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                  activeContentType === 'playlist'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-slate-700">قائمة الإعلانات العامة</div>
                <div className="text-[11px] text-slate-500 mt-0.5">فيديوهات وصور ترويجية</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveContentType('template');
                  setActiveContentId('tpl-clinic-waiting');
                }}
                className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                  activeContentType === 'template'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-slate-700">قالب العيادات والانتظار</div>
                <div className="text-[11px] text-slate-500 mt-0.5">ساعة + طقس + أرقام انتظار</div>
              </button>
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
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'جاري الاقتران...' : 'إقران وتشغيل الشاشة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}