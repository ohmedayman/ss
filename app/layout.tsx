import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScreenFlow | المنصة الاحترافية لإدارة الشاشات الرقمية',
  description: 'منصة سحابية متقدمة لإدارة شبكات الشاشات الرقمية والمحتوى عن بُعد مع دعم أنظمة أرقام انتظار العملاء والتواصل الفوري',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f6f7fb] text-slate-800 min-h-screen selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
