'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  History,
  Monitor,
  Film,
  ListVideo,
  CalendarClock,
  Shield,
  Clock,
  Settings,
  UsersRound,
} from 'lucide-react';

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const d = await res.json();
        setLogs(d.recentLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'screen':
        return <Monitor className="w-4 h-4 text-indigo-400" />;
      case 'media':
        return <Film className="w-4 h-4 text-cyan-400" />;
      case 'playlist':
        return <ListVideo className="w-4 h-4 text-violet-400" />;
      case 'schedule':
        return <CalendarClock className="w-4 h-4 text-emerald-400" />;
      case 'auth':
        return <Shield className="w-4 h-4 text-amber-400" />;
      default:
        return <Settings className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Header
        title="سجل الأنشطة والعمليات (Audit & Activity Logs)"
        subtitle="توثيق كامل لجميع الأوامر والتعديلات وعمليات تسجيل الدخول على النظام"
      />

      <div className="glass-panel rounded-2xl p-6">
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                {getActionIcon(log.actionType)}
              </div>

              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {log.userName || 'المدير العام'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleString('ar-SA')}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{log.details}</p>

                {log.ipAddress && (
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    IP: {log.ipAddress}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
