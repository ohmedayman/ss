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
    // Poll stats every 20 seconds
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex text-slate-800">
      {/* Arabic RTL Sidebar (Fixed on the right side) */}
      <Sidebar
        storageUsedBytes={stats?.storageUsedBytes}
        storageLimitMb={stats?.storageLimitMb}
        onlineScreens={stats?.onlineScreens}
        totalScreens={stats?.totalScreens}
      />

      {/* Main Content Area (Offset by 16rem / 64 tailwind units for the right sidebar) */}
      <div className="flex-1 mr-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8 overflow-y-auto">
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
