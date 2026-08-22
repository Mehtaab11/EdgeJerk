'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Database, TrendingUp, Settings, Terminal, Activity } from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'DASHBOARD', icon: LayoutGrid },
    { href: '/trades', label: 'TRADE LOG', icon: Database },
    { href: '/analytics', label: 'ANALYTICS', icon: TrendingUp },
    { href: '/settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-[#0a0e1a] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* TOP BRAND LOGO & USER TERMINAL */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#dfff00] flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(223,255,0,0.25)]">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
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
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#dfff00] text-black shadow-[0_0_15px_rgba(223,255,0,0.2)] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* SYSTEM STATUS FOOTER IN SIDEBAR */}
      <div className="p-4 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>ENGINE: ONLINE</span>
          <Activity className="w-3 h-3 text-emerald-400" />
        </div>
        <div className="text-emerald-400 font-bold mt-1">0.4ms LATENCY</div>
      </div>
    </aside>
  );
}
