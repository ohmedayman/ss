'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  User,
  Building2,
} from 'lucide-react';
import { getClientAuth } from '@/lib/firebase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
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

      let idToken: string | null = null;
      if (firebaseReady) {
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

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, fullName, companyName }),
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
          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-10">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">إنشاء حساب جديد</h1>
            <p className="text-sm text-slate-400 mb-8">ابدأ إدارة شاشاتك الرقمية الآن مجاناً</p>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">اسم المنشأة أو الشركة</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="مثال: شركة الحلول الرقمية"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">البريد الإلكتروني</label>
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
                <label className="block text-sm font-medium text-slate-600 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                    required
                    minLength={6}
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F7931E] hover:from-[#E55A2B] hover:to-[#E08819] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <span>إنشاء الحساب</span>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-7 text-sm text-slate-400">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-[#FF6B35] hover:text-[#E55A2B] font-bold transition-colors">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Illustration */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 left-0 right-0 w-full h-48 text-slate-50" viewBox="0 0 1440 320" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,224L40,213.3C80,203,160,181,240,181.3C320,181,400,203,480,213.3C560,224,640,224,720,208C800,192,880,160,960,165.3C1040,171,1120,213,1200,218.7C1280,224,1360,192,1400,176L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z" />
        </svg>
        <div className="absolute bottom-32 left-[15%] w-2 h-2 rounded-full bg-[#FF6B35]/20" />
        <div className="absolute bottom-28 left-[25%] w-3 h-3 rounded-full bg-[#FF6B35]/15" />
        <div className="absolute bottom-36 left-[70%] w-2 h-2 rounded-full bg-[#FF6B35]/20" />
        <div className="absolute bottom-24 left-[80%] w-4 h-4 rounded-full bg-[#FF6B35]/10" />
      </div>
    </div>
  );
}
