'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getClientAuth } from '@/lib/firebase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let firebaseReady = false;
      try {
        const cfg = await fetch('/api/auth/config').then(r => r.json());
        firebaseReady = Boolean(cfg.firebaseReady);
      } catch (e) {
        firebaseReady = false;
      }
      if (firebaseReady) {
        const auth = getClientAuth();
        await sendPasswordResetEmail(auth, email);
      }
      if (email) setSent(true);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إرسال رابط الاستعادة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-['Cairo']">
      {/* Header / Logo */}
      <header className="w-full px-8 py-5 flex items-center justify-between absolute top-0 left-0 right-0 z-20">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="https://i.postimg.cc/Y05shkp1/screenflow-logo-final.png"
            alt="ScreenFlow"
            className="h-16 w-auto"
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-40 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-10">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">استعادة كلمة المرور</h1>
            <p className="text-sm text-slate-400 mb-8">أدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين</p>

            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  تم إرسال تعليمات إعادة تعيين كلمة المرور إلى
                </p>
                <p className="text-sm font-mono font-semibold text-slate-800 bg-slate-50 rounded-lg px-3 py-2">
                  {email}
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors mt-4"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لتسجيل الدخول</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <span>إرسال رابط الاستعادة</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                    تذكرت كلمة المرور؟{' '}
                    <span className="font-bold text-[#4F46E5] hover:text-[#4338CA]">تسجيل الدخول</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Illustration */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 left-0 right-0 w-full h-48 text-slate-50" viewBox="0 0 1440 320" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,224L40,213.3C80,203,160,181,240,181.3C320,181,400,203,480,213.3C560,224,640,224,720,208C800,192,880,160,960,165.3C1040,171,1120,213,1200,218.7C1280,224,1360,192,1400,176L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z" />
        </svg>
        <div className="absolute bottom-32 left-[15%] w-2 h-2 rounded-full bg-[#4F46E5]/20" />
        <div className="absolute bottom-28 left-[25%] w-3 h-3 rounded-full bg-[#4F46E5]/15" />
        <div className="absolute bottom-36 left-[70%] w-2 h-2 rounded-full bg-[#4F46E5]/20" />
        <div className="absolute bottom-24 left-[80%] w-4 h-4 rounded-full bg-[#4F46E5]/10" />
      </div>
    </div>
  );
}
