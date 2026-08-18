import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'ScreenFlow | المنصة الاحترافية لإدارة الشاشات الرقمية',
  description: 'منصة سحابية متقدمة لإدارة شبكات الشاشات الرقمية والمحتوى عن بُعد مع دعم البث المباشر والعروض الترويجية',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ScreenFlow',
  },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f6f7fb] text-slate-800 min-h-screen selection:bg-indigo-500 selection:text-white">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
