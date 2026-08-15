'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  Tv,
  Lock,
  Mail,
  Sparkles,
  AlertCircle,
  Monitor,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { getClientAuth } from '@/lib/firebase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Decide which auth path to use based on backend readiness
      let firebaseReady = false;
      try {
        const cfg = await fetch('/api/auth/config').then(r => r.json());
        firebaseReady = Boolean(cfg.firebaseReady);
      } catch (e) {
        firebaseReady = false;
      }

      let body: Record<string, string>;
      if (firebaseReady) {
        try {
          const auth = getClientAuth();
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const idToken = await cred.user.getIdToken();
          body = { idToken };
        } catch (fbErr: any) {
          throw new Error(
            fbErr?.code === 'auth/user-not-found' || fbErr?.code === 'auth/invalid-credential' || fbErr?.code === 'auth/wrong-password'
              ? 'البريد أو كلمة المرور غير صحيحة'
              : fbErr?.code === 'auth/invalid-login-credentials'
              ? 'البريد أو كلمة المرور غير صحيحة'
              : fbErr?.message || 'فشل تسجيل الدخول'
          );
        }
      } else {
        body = { email, password };
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-['Cairo']">
      {/* Soft Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 items-center relative z-10">
        {/* Brand Side */}
        <div className="hidden lg:flex flex-col justify-center p-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-5">
            <Tv className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            منصة ScreenFlow لإدارة الشاشات الرقمية
          </h1>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed max-w-md">
            تحكم في شاشاتك الذكية من أي مكان: اربط، جدول، أرسل المحتوى، وراقب كل الشاشات في الوقت الحقيقي.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm">
                <Monitor className="w-4.5 h-4.5" />
              </div>
              <span>اقتران فوري عبر كود التسجيل و QR Code</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-500 shadow-sm">
                <Play className="w-4.5 h-4.5" />
              </div>
              <span>مشغل ذكي يعمل بدون إنترنت + أوامر لحظية</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <span>استضافة سحابية آمنة مع Firebase</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="card rounded-3xl p-8 relative z-10 shadow-xl">
          <div className="text-center mb-7 lg:hidden">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
              <Tv className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ScreenFlow</h1>
            <p className="text-xs text-slate-400 mt-1">المنصة السحابية لإدارة الشاشات الرقمية</p>
          </div>

          <div className="hidden lg:block text-center mb-7">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">تسجيل الدخول</h1>
            <p className="text-xs text-slate-400 mt-1">أدخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input pl-3 pr-9"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  كلمة المرور
                </label>
                <Link href="/forgot-password" className="text-[11px] text-indigo-600 hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-3 pr-9"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-6 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول إلى المنصة'}</span>
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-slate-400">
            ليس لديك حساب بعد؟{' '}
            <Link href="/register" className="text-indigo-600 hover:underline font-bold">
              أنشئ حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}