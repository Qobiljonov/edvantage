import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Edvantage — Milliy AI Ta'lim Platformasi",
  description:
    "O'zbekiston o'quvchilari uchun DTM tayyorgarligi, shaxsiy AI ustoz va milliy miqyosdagi ta'lim ekotizimi",
};

export const viewport: Viewport = {
  themeColor: '#0B1220',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
