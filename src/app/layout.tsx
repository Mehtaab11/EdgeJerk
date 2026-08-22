import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EdgeJerk — Personal Trading Journal',
  description: 'High-density, professional personal trading journal & performance analytics terminal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="grid-bg min-h-screen flex flex-col antialiased text-gray-200 bg-[#0a0f1e]">
        {children}
      </body>
    </html>
  );

}
