import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthGuard } from '@/components/layout/AuthGuard';

export const metadata: Metadata = {
  title: 'EdgeJerk — Trading Journal',
  description: 'Clean personal trading journal & performance analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#f0f3fa] dark:bg-[#070a14] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}

