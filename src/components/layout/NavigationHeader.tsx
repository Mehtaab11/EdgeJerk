'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Database, TrendingUp, Settings, Plus, Terminal } from 'lucide-react';

export function NavigationHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'DASHBOARD', icon: LayoutGrid },
    { href: '/trades', label: 'TRADE LOG', icon: Database },
    { href: '/analytics', label: 'ANALYTICS', icon: TrendingUp },
    { href: '/settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a14] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm tracking-wider text-slate-900 dark:text-white">
              EDGEJERK <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-[#2962ff] dark:text-[#388bfd] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">v1.0</span>
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-slate-800/80 text-[#2962ff] dark:text-[#388bfd] border border-blue-200 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2962ff] dark:text-[#388bfd]' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <Link
            href="/trades/new"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e4bd8] text-white font-semibold text-xs tracking-wide transition-all ml-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>LOG TRADE</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
