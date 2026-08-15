'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PairScreenModal from '@/components/PairScreenModal';
import UploadMediaModal from '@/components/UploadMediaModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stats, setStats] = useState<any>(null);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex text-slate-800">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed top-4 right-4 z-[60] p-2.5 rounded-xl bg-white border border-slate-200 shadow-md text-slate-600 hover:bg-slate-50 lg:hidden cursor-pointer"
        aria-label="فتح القائمة"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Arabic RTL Sidebar */}
      <Sidebar
        storageUsedBytes={stats?.storageUsedBytes}
        storageLimitMb={stats?.storageLimitMb}
        onlineScreens={stats?.onlineScreens}
        totalScreens={stats?.totalScreens}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:mr-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pt-16 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <PairScreenModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        onSuccess={() => fetchStats()}
      />

      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => fetchStats()}
      />
    </div>
  );
}
