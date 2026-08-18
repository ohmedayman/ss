'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Lock,
  Building,
} from 'lucide-react';
import { registerSchema, RegisterFormData } from '@/lib/validations';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          organizationName: data.organizationName,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل التسجيل');

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-['Cairo']">
      <header className="w-full px-8 py-5 flex items-center justify-between absolute top-0 left-0 right-0 z-20">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="https://i.postimg.cc/Y05shkp1/screenflow-logo-final.png"
            alt="ScreenFlow"
            className="h-16 w-auto"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-40 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-10">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">إنشاء حساب جديد</h1>
            <p className="text-sm text-slate-400 mb-8">ابدأ إدارة شاشاتك الرقمية الآن</p>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    {...register('fullName')}
                    placeholder="مثال: أحمد محمد"
                    className={`w-full px-4 py-2.5 pl-10 rounded-xl border bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all ${
                      errors.fullName ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="example@email.com"
                    className={`w-full px-4 py-2.5 pl-10 rounded-xl border bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all ${
                      errors.email ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">اسم المتجر / المؤسسة</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    {...register('organizationName')}
                    placeholder="مثال: متجر الأفق للأدوات"
                    className={`w-full px-4 py-2.5 pl-10 rounded-xl border bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all ${
                      errors.organizationName ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.organizationName && <p className="text-xs text-red-500 mt-1">{errors.organizationName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="6 أحرف على الأقل"
                    className={`w-full px-4 py-2.5 pl-16 rounded-xl border bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all ${
                      errors.password ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="أعد إدخال كلمة المرور"
                    className={`w-full px-4 py-2.5 pl-10 rounded-xl border bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all ${
                      errors.confirmPassword ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <span>إنشاء حساب</span>
                )}
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-slate-400">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-[#4F46E5] hover:text-[#4338CA] font-bold transition-colors">
                سجّل الدخول
              </Link>
            </div>
          </div>
        </div>
      </main>

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
