'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tv, Mail, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4 relative overflow-hidden font-['Cairo']">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800 bg-slate-900/80 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Tv className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">استعادة كلمة المرور</h1>
          <p className="text-xs text-slate-400 mt-1">أدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300">
              تم إرسال تعليمات إعادة تعيين كلمة المرور إلى <span className="text-white font-mono">{email}</span>
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:underline"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لتسجيل الدخول</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              إرسال رابط الاستعادة
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-slate-400 hover:text-white">
                تذكرت كلمة المرور؟ تسجيل الدخول
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
