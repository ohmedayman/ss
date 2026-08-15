'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Tv, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { getClientAuth } from '@/lib/firebase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const firebaseConfigured = Boolean(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      );
      if (firebaseConfigured) {
        const auth = getClientAuth();
        await sendPasswordResetEmail(auth, email);
      }
      if (email) setSent(true);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إرسال رابط الاستعادة');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-['Cairo']">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full card rounded-3xl p-8 relative z-10 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Tv className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">استعادة كلمة المرور</h1>
          <p className="text-xs text-slate-400 mt-1">أدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500">
              تم إرسال تعليمات إعادة تعيين كلمة المرور إلى <span className="text-slate-800 font-mono font-semibold">{email}</span>
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لتسجيل الدخول</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              إرسال رابط الاستعادة
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600">
                تذكرت كلمة المرور؟ تسجيل الدخول
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}