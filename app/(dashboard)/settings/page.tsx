'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  Settings,
  Building,
  User,
  HardDrive,
  Shield,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('مجموعة الأفق للحلول الرقمية');
  const [fullName, setFullName] = useState('أحمد بن عبد الله آل سعود');
  const [email, setEmail] = useState('admin@screenflow.io');
  const [phone, setPhone] = useState('+966 50 123 4567');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Header
        title="إعدادات الحساب والمؤسسة"
        subtitle="تخصيص بيانات المؤسسة، معلومات الحساب، وإدارة الباقات السحابية"
      />

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>تم حفظ الإعدادات بنجاح ✅</span>
        </div>
      )}

      {/* Plan Card */}
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
              الباقة السحابية الحالية
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">باقة الشركات المتقدمة (Pro Enterprise)</h3>
            <p className="text-xs text-slate-400 mt-1">
              تتيح لك إدارة حتى 25 شاشة مع مساحة تخزينية 10 GB ودعم فوري على مدار الساعة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              نشطة ومفعلة
            </span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Info */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-400" />
            بيانات المؤسسة (Organization Info)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم المنشأة / الشركة
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                معرف المؤسسة (Slug)
              </label>
              <input
                type="text"
                value="al-ofuq"
                disabled
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            الملف الشخصي للمسؤول
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم الجوال
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
}
