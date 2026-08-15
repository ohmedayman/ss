'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  Tv,
  Lock,
  Mail,
  User,
  Building,
  Sparkles,
} from 'lucide-react';
import { getClientAuth } from '@/lib/firebase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const firebaseConfigured = Boolean(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      );

      let idToken: string | null = null;
      if (firebaseConfigured) {
        try {
          const auth = getClientAuth();
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          idToken = await cred.user.getIdToken();
        } catch (fbErr: any) {
          throw new Error(
            fbErr?.code === 'auth/email-already-in-use'
              ? 'هذا البريد مسجل مسبقاً، سجل دخول مباشرة'
              : fbErr?.code === 'auth/weak-password'
              ? 'كلمة المرور ضعيفة (على الأقل 6 أحرف)'
              : fbErr?.message || 'فشل إنشاء الحساب'
          );
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idToken ? { idToken } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب');

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">إنشاء حساب جديد</h1>
          <p className="text-xs text-slate-400 mt-1">ابدأ إدارة شاشاتك الرقمية الآن مجاناً</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">الاسم الكامل</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: خالد محمد"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">اسم المنشأة أو الشركة</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="مثال: شركة الحلول الرقمية"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-6 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب وبدء التجربة'}</span>
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-bold">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}