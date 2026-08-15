'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  Tv,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getClientAuth } from '@/lib/firebase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
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
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
              : fbErr?.code === 'auth/invalid-login-credentials'
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
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
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-['Cairo']">
      {/* Header / Logo */}
      <header className="w-full px-8 py-5 flex items-center justify-between absolute top-0 left-0 right-0 z-20">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center shadow-md shadow-orange-500/20">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">
            Screen<span className="text-[#FF6B35]">Flow</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-40 relative z-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-10">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">مرحباً بعودتك!</h1>
            <p className="text-sm text-slate-400 mb-8">سجّل دخولك للوصول إلى لوحة التحكم</p>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Forget Password */}
              <div className="text-left">
                <Link href="/forgot-password" className="text-sm text-[#FF6B35] hover:text-[#E55A2B] transition-colors font-medium">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F7931E] hover:from-[#E55A2B] hover:to-[#E08819] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-7 text-sm text-slate-400">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-[#FF6B35] hover:text-[#E55A2B] font-bold transition-colors">
                أنشئ حساباً جديداً
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Illustration */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        {/* City silhouette */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-48 text-slate-50" viewBox="0 0 1440 320" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,224L40,213.3C80,203,160,181,240,181.3C320,181,400,203,480,213.3C560,224,640,224,720,208C800,192,880,160,960,165.3C1040,171,1120,213,1200,218.7C1280,224,1360,192,1400,176L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z" />
        </svg>
        {/* Decorative dots */}
        <div className="absolute bottom-32 left-[15%] w-2 h-2 rounded-full bg-[#FF6B35]/20" />
        <div className="absolute bottom-28 left-[25%] w-3 h-3 rounded-full bg-[#FF6B35]/15" />
        <div className="absolute bottom-36 left-[70%] w-2 h-2 rounded-full bg-[#FF6B35]/20" />
        <div className="absolute bottom-24 left-[80%] w-4 h-4 rounded-full bg-[#FF6B35]/10" />
        <div className="absolute bottom-40 left-[45%] w-1.5 h-1.5 rounded-full bg-[#F7931E]/25" />
      </div>
    </div>
  );
}
