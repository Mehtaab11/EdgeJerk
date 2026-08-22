'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Database, TrendingUp, Settings, Terminal } from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'DASHBOARD', icon: LayoutGrid },
    { href: '/trades', label: 'TRADE_LOG', icon: Database },
    { href: '/analytics', label: 'ANALYTICS', icon: TrendingUp },
    { href: '/settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-[#090d1a] border-r border-[#1d2640] flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* TOP BRAND LOGO & USER TERMINAL */}
        <div className="p-4 border-b border-[#1d2640]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#13192b] border border-[#273454] flex items-center justify-center text-[#dfff00]">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-white tracking-wider">TERMINAL_01</span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                CONNECTED
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-mono font-bold tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#182035] text-[#dfff00] border-l-2 border-[#dfff00]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111728]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#dfff00]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* SYSTEM STATUS FOOTER IN SIDEBAR */}
      <div className="p-4 border-t border-[#1d2640] font-mono text-[10px] text-slate-500">
        <div>SYS_ENGINE: ACTIVE</div>
        <div className="text-emerald-400 font-bold mt-0.5">0.4ms LATENCY</div>
      </div>
    </aside>
  );
}
