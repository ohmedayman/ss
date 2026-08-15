'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Tv,
  Lock,
  Mail,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@screenflow.io');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4 relative overflow-hidden font-['Cairo']">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800 bg-slate-900/80 backdrop-blur-xl relative z-10 shadow-2xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Tv className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">ScreenFlow</h1>
          <p className="text-xs text-slate-400 mt-1">المنصة السحابية لإدارة الشاشات الرقمية</p>
        </div>

        {/* Demo Notice */}
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/50 mb-6 text-xs text-indigo-200 text-center">
          💡 حساب تجريبي جاهز: <span className="font-mono text-white">admin@screenflow.io</span>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                كلمة المرور
              </label>
              <Link href="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">
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
                className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول إلى المنصة'}</span>
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          ليس لديك حساب بعد؟{' '}
          <Link href="/register" className="text-indigo-400 hover:underline font-bold">
            أنشئ حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
}
