import type { Metadata } from 'next';
import './globals.css';
import ToastAndBell from '../components/ToastAndBell';

export const metadata: Metadata = {
  title: 'Wild & Water | Trang bị dã ngoại & câu cá cao cấp',
  description: 'Chinh phục thiên nhiên với các bộ trang bị chuyên biệt cho biển, sông suối và cắm trại.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-background text-on-surface antialiased font-sans min-h-screen">
        {children}
        <ToastAndBell />
      </body>
    </html>
  );
}
