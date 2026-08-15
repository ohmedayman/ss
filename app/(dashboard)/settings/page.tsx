'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  AlertTriangle,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  Camera,
  LogOut,
  Trash2,
  Key,
  MonitorSmartphone,
  HardDrive,
  UploadCloud,
  ArrowUpCircle,
  Monitor,
  Clock,
  Globe,
} from 'lucide-react';

interface UserData {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

interface OrgData {
  name: string;
  slug: string;
  plan: string;
  storageLimitMb: number;
  storageUsedBytes: number;
  maxScreens: number;
  screensCount: number;
}

interface NotificationsData {
  email: boolean;
  offlineAlerts: boolean;
  weeklyReports: boolean;
  subscriptionAlerts: boolean;
}

interface SessionData {
  ip: string;
  device: string;
  lastActive: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData>({ fullName: '', email: '', phone: '', avatarUrl: '' });
  const [org, setOrg] = useState<OrgData>({ name: '', slug: '', plan: 'free', storageLimitMb: 10240, storageUsedBytes: 0, maxScreens: 5, screensCount: 0 });
  const [notifications, setNotifications] = useState<NotificationsData>({ email: true, offlineAlerts: true, weeklyReports: true, subscriptionAlerts: true });
  const [sessionInfo, setSessionInfo] = useState<SessionData>({ ip: '', device: '', lastActive: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        setOrg(data.org || data.organization);
        setNotifications(data.notifications);
        setSessionInfo(data.session);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { fullName: user.fullName, phone: user.phone } }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization: { name: org.name, slug: org.slug } }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'حذف') return;
    setShowDeleteConfirm(false);
    setDeleteText('');
  };

  const storageUsedGB = (org.storageUsedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const storageLimitGB = (org.storageLimitMb / 1024).toFixed(1);
  const storagePercent = Math.min(100, (org.storageUsedBytes / (org.storageLimitMb * 1024 * 1024)) * 100);

  const planLabels: Record<string, string> = { free: 'مجانية', starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
  const planColors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    starter: 'bg-blue-50 text-blue-600 border-blue-200',
    pro: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    enterprise: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer ${
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-1' : 'translate-x-6'
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Header title="إعدادات الحساب" subtitle="إدارة بياناتك وإعدادات منظمتك" />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Header title="إعدادات الحساب" subtitle="إدارة بياناتك وإعدادات منظمتك" />

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>تم حفظ الإعدادات بنجاح</span>
        </div>
      )}

      {/* Account Section */}
      <form onSubmit={handleSaveAccount} className="glass-panel rounded-2xl p-6 space-y-5">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          الحساب
        </h4>

        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <button
              type="button"
              className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">الاسم الكامل</label>
              <input
                type="text"
                value={user.fullName}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input bg-slate-50 border-slate-200 text-slate-400 pr-10"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">رقم الجوال</label>
              <div className="relative">
                <input
                  type="text"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  className="input pr-10"
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>
      </form>

      {/* Organization Section */}
      <form onSubmit={handleSaveOrg} className="glass-panel rounded-2xl p-6 space-y-5">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-500" />
          المنظمة
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">اسم المنظمة</label>
            <input
              type="text"
              value={org.name}
              onChange={(e) => {
                const name = e.target.value;
                setOrg({ ...org, name, slug: slugify(name) });
              }}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">المعرّف (Slug)</label>
            <input
              type="text"
              value={org.slug}
              disabled
              className="input bg-slate-50 border-slate-200 text-slate-400 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">الباقة الحالية</span>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${planColors[org.plan] || planColors.free}`}>
                {planLabels[org.plan] || org.plan}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">المساحة المستخدمة</span>
            <div className="mt-2 text-sm font-bold text-slate-800">{storageUsedGB} GB / {storageLimitGB} GB</div>
            <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${storagePercent}%`,
                  backgroundColor: storagePercent > 80 ? '#ef4444' : storagePercent > 60 ? '#f59e0b' : '#6366f1',
                }}
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">الشاشات</span>
            <div className="mt-2 text-sm font-bold text-slate-800">{org.screensCount} / {org.maxScreens}</div>
            <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (org.screensCount / org.maxScreens) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" />
            حفظ إعدادات المنظمة
          </button>
        </div>
      </form>

      {/* Notifications Section */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-500" />
          الإشعارات
        </h4>

        <div className="space-y-4">
          {[
            { key: 'email' as const, label: 'إشعارات البريد الإلكتروني', desc: 'استلام إشعارات عبر البريد عند تحديثات مهمة' },
            { key: 'offlineAlerts' as const, label: 'تنبيهات الشاشات غير المتصلة', desc: 'تنبيه فوري عند انقطاع أي شاشة عن الشبكة' },
            { key: 'weeklyReports' as const, label: 'تقارير الاستخدام الأسبوعية', desc: 'ملخص أسبوعي لأداء الشاشات والاستخدام' },
            { key: 'subscriptionAlerts' as const, label: 'تنبيهات انتهاء الاشتراك', desc: 'تنبيه مبكر قبل انتهاء فترة الاشتراك الحالية' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
              </div>
              <Toggle
                checked={notifications[item.key]}
                onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            حفظ الإشعارات
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          الأمان
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="btn-secondary justify-center">
            <Key className="w-4 h-4 text-indigo-500" />
            تغيير كلمة المرور
          </button>
          <button className="btn-secondary justify-center">
            <LogOut className="w-4 h-4 text-amber-500" />
            تسجيل الخروج من كل الأجهزة
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-3">معلومات الجلسة الحالية</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">الجهاز</div>
                <div className="text-xs font-semibold text-slate-700">{sessionInfo.device}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">عنوان IP</div>
                <div className="text-xs font-semibold text-slate-700">{sessionInfo.ip}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">آخر نشاط</div>
                <div className="text-xs font-semibold text-slate-700">الآن</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Section */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-500" />
          الاشتراك والفوترة
        </h4>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50 border border-indigo-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">الباقة الحالية</span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                باقة {planLabels[org.plan] || org.plan}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                إدارة حتى {org.maxScreens} شاشة مع {storageLimitGB} GB مساحة تخزينية
              </p>
            </div>
            <button className="btn-primary">
              <ArrowUpCircle className="w-4 h-4" />
              ترقية الخطة
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-600">المساحة التخزينية</span>
              </div>
              <div className="text-sm font-bold text-slate-800">{storageUsedGB} GB / {storageLimitGB} GB</div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${storagePercent}%`,
                    backgroundColor: storagePercent > 80 ? '#ef4444' : storagePercent > 60 ? '#f59e0b' : '#6366f1',
                  }}
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-600">الشاشات المتصلة</span>
              </div>
              <div className="text-sm font-bold text-slate-800">{org.screensCount} / {org.maxScreens}</div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (org.screensCount / org.maxScreens) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 space-y-4">
        <h4 className="font-bold text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          منطقة الخطر
        </h4>

        {!showDeleteConfirm ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-red-100">
            <div>
              <div className="text-sm font-semibold text-slate-800">حذف الحساب</div>
              <div className="text-xs text-slate-400 mt-0.5">حذف الحساب وجميع البيانات المرتبطة به بشكل نهائي</div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              حذف الحساب
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-white border border-red-200 space-y-4">
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
              هذا الإجراء لا يمكن التراجع عنه. جميع بياناتك ستُحذف نهائيًا.
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                اكتب <span className="text-red-600 font-bold">حذف</span> للتأكيد
              </label>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                className="input"
                placeholder="حذف"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== 'حذف'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                تأكيد الحذف
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                className="btn-secondary text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
