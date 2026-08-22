import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EdgeJerk — Professional Quant Trading Journal',
  description: 'High-density, professional personal trading journal & quantitative performance analytics terminal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070a12] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-[#dfff00] selection:text-black">
        {children}
      </body>
    </html>
  );
}
