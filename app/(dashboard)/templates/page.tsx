'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  LayoutTemplate,
  Sparkles,
  Plus,
  Tv,
  Clock,
  CloudSun,
  Type,
  UsersRound,
  Eye,
  CheckCircle2,
  Layers,
  Monitor,
} from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const d = await res.json();
        setTemplates(d.templates || []);
        if (d.templates?.length > 0) {
          setSelectedTemplate(d.templates[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <Header
        title="استوديو القوالب والتصميمات (Templates Studio)"
        subtitle="شاشات جاهزة متعددة المناطق مع ودجات الطقس والساعة والشريط الإخباري وشاشات الانتظار"
      />

      {/* Grid: Template Selector + Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Templates List */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-400" />
            القوالب الجاهزة المتاحة
          </h3>

          <div className="space-y-3">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-600/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-xs">{tpl.name}</h4>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 pulse-green" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-3">
                    {tpl.headerTitle || 'تخطيط احترافي متعدد المناطق'}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {tpl.zones?.map((z: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                      >
                        {z.type === 'playlist'
                          ? 'فيديو/صور'
                          : z.type === 'queue_display'
                          ? 'أرقام انتظار'
                          : z.type === 'clock'
                          ? 'ساعة وطقس'
                          : z.type === 'ticker'
                          ? 'شريط إخباري'
                          : 'محتوى'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Interactive Interactive Preview Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              المعاينة التفاعلية المباشرة للقالب
            </h3>
            <span className="text-xs text-slate-400 font-mono">1920x1080 Full HD</span>
          </div>

          {selectedTemplate && (
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 p-2 bg-[#090d16]">
              {/* Virtual TV Frame */}
              <div
                className="w-full aspect-video rounded-xl overflow-hidden flex flex-col relative text-white select-none shadow-2xl border border-slate-700/50"
                style={{ backgroundColor: selectedTemplate.backgroundColor || '#0f172a' }}
              >
                {/* Header Title Bar if any */}
                {selectedTemplate.headerTitle && (
                  <div className="h-10 bg-slate-900/90 border-b border-slate-700/80 px-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <Tv className="w-4 h-4 text-indigo-400" />
                      <span>{selectedTemplate.headerTitle}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="font-mono">{new Date().toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                )}

                {/* Split zones body */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Main Zone (Left in RTL = Right in LTR) */}
                  <div className="flex-1 p-3 flex flex-col justify-center items-center relative overflow-hidden bg-slate-950/60">
                    <img
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white">
                      منطقة الفيديو الترويجي الرئيسية
                    </div>
                  </div>

                  {/* Sidebar Zones */}
                  {selectedTemplate.layout === 'split_3_sidebar' && (
                    <div className="w-64 bg-slate-900/90 border-r border-slate-800 p-3 flex flex-col justify-between space-y-3">
                      {/* Queue Display Widget */}
                      <div className="bg-gradient-to-br from-indigo-900/80 to-slate-900 p-3.5 rounded-xl border border-indigo-500/30 text-center shadow-lg">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-300 font-semibold mb-1">
                          <UsersRound className="w-3.5 h-3.5" />
                          <span>الرقم الحالي</span>
                        </div>
                        <div className="text-3xl font-black font-mono text-amber-400 tracking-wider">
                          A-104
                        </div>
                        <div className="text-[10px] text-slate-300 mt-1 font-medium">
                          عيادة الاستشارات 3
                        </div>
                      </div>

                      {/* Live Clock & Weather Widget */}
                      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-xl font-bold font-mono text-white">
                          14:35
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          الرياض • 32° مشمس ☀️
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Ticker Marquee */}
                <div className="h-9 bg-indigo-950/90 border-t border-indigo-900/50 flex items-center px-4 overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 pulse-green" />
                    <span className="font-bold text-amber-300 shrink-0">تنبيه إخباري:</span>
                    <span className="truncate">
                      {selectedTemplate.zones?.find((z: any) => z.type === 'ticker')?.text ||
                        '🎉 مرحباً بكم في شاشات العرض الذكية - خصومات وعروض خاصة طوال هذا الشهر!'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
