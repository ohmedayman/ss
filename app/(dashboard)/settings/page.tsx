'use client';

import React, { useState } from 'react';
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
  Key,
  CreditCard,
  MapPin,
  Plus,
  Trash2,
  Copy,
  FileText,
  Download,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'branches' | 'billing' | 'api'>('profile');

  // Profile Form
  const [orgName, setOrgName] = useState('مجموعة الأفق للحلول الرقمية');
  const [fullName, setFullName] = useState('أحمد بن عبد الله آل سعود');
  const [email, setEmail] = useState('admin@screenflow.io');
  const [phone, setPhone] = useState('+966 50 123 4567');

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Branches
  const [branches, setBranches] = useState([
    { id: '1', name: 'الفرع الرئيسي - الرياض (طريق الملك فهد)', city: 'الرياض', phone: '011-4567890', active: true },
    { id: '2', name: 'فرع جدة (حي الروضة)', city: 'جدة', phone: '012-6543210', active: true },
  ]);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');

  // API Key
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('تم حفظ وتحديث بيانات الملف الشخصي بنجاح ✅');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    setSavedMsg('تم تغيير كلمة المرور وتحديث إعدادات الأمان بنجاح 🔒');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const newBr = {
      id: Date.now().toString(),
      name: newBranchName.trim(),
      city: newBranchCity.trim() || 'الرياض',
      phone: '011-0000000',
      active: true,
    };
    setBranches([...branches, newBr]);
    setNewBranchName('');
    setNewBranchCity('');
    setSavedMsg('تمت إضافة الفرع بنجاح 🏢');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleDeleteBranch = (id: string) => {
    setBranches(branches.filter((b) => b.id !== id));
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('sf_live_98a7f4e82b1c6d99824');
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Header
        title="إعدادات الحساب والمؤسسة"
        subtitle="تخصيص بيانات المؤسسة، الفروع، الأمان، وإدارة الباقات السحابية"
      />

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>الملف الشخصي والمؤسسة</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>الأمان وكلمة المرور</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>إدارة الفروع ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>الباقة والاشتراك</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'api'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>مفاتيح API للمطورين</span>
        </button>
      </div>

      {/* 1. Profile & Organization Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              بيانات المؤسسة (Organization Info)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  اسم المنشأة / الشركة
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  معرف المؤسسة (Slug)
                </label>
                <input
                  type="text"
                  value="al-ofuq"
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              الملف الشخصي للمسؤول
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">رقم الجوال</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              تغيير كلمة المرور
            </h4>

            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>تحديث كلمة المرور</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Branches Tab */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          {/* Add Branch Form */}
          <form onSubmit={handleAddBranch} className="glass-panel rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              إضافة فرع جديد
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="اسم الفرع (مثال: فرع الدمام - الكورنيش)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newBranchCity}
                  onChange={(e) => setNewBranchCity(e.target.value)}
                  placeholder="المدينة (مثال: الدمام)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              إضافة الفرع
            </button>
          </form>

          {/* Branches List */}
          <div className="glass-panel rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              قائمة فروع المؤسسة
            </h4>

            <div className="space-y-3">
              {branches.map((br) => (
                <div key={br.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{br.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">المدينة: {br.city} • هاتف: {br.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200">
                      نشط
                    </span>
                    <button
                      onClick={() => handleDeleteBranch(br.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="حذف الفرع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-indigo-50 via-white to-slate-50 border border-indigo-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                  الباقة الحالية
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">باقة الشركات المتقدمة (Pro Enterprise)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  تتيح لك إدارة حتى 25 شاشة مع مساحة تخزينية 10 GB ودعم فوري على مدار الساعة
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                نشطة ومفعلة
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              سجل الفواتير الضريبية
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">فاتورة اشتراك سنوي - رقم #SF-9821</span>
                  <span className="text-slate-400 block text-[10px]">15 يناير 2026</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 font-mono">1,200.00 ر.س</span>
                  <button className="flex items-center gap-1 text-indigo-600 hover:underline font-semibold cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. API Keys Tab */}
      {activeTab === 'api' && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            مفاتيح واجهة البرمجة (API Keys)
          </h4>
          <p className="text-xs text-slate-500">
            يمكنك استخدام هذا المفتاح للربط البرمجي وإرسال المحتوى للشاشات مباشرة من برامجك وأنظمة الـ ERP الخاصة بك.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between font-mono text-xs">
            <span className="text-indigo-300">sf_live_98a7f4e82b1c6d99824...</span>
            <button
              onClick={copyApiKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs cursor-pointer font-semibold"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{apiKeyCopied ? 'تم النسخ!' : 'نسخ المفتاح'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
