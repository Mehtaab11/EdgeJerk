'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { LayoutDashboard, ListFilter, PlusCircle, BarChart3, LogOut, Terminal, Activity } from 'lucide-react';

export function NavigationHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, checkSession, logout } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/trades', label: 'Trade Log', icon: ListFilter },
    { href: '/trades/new', label: 'Log Trade', icon: PlusCircle, isPrimary: true },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070a12]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#dfff00] flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(223,255,0,0.3)] transition-transform group-hover:scale-105">
            <Terminal className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              EDGEJERK <span className="text-[10px] bg-slate-800 text-[#dfff00] px-1.5 py-0.5 rounded border border-slate-700 font-mono">v1.0</span>
            </span>
          </div>
        </Link>

        <div className="h-5 w-px bg-slate-800 hidden md:block"></div>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            if (link.isPrimary) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#dfff00] text-black font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(223,255,0,0.25)] hover:bg-[#c8e600] transition-all ml-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/80 text-[#dfff00] border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#dfff00]' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Activity className="w-3.5 h-3.5" />
          <span>CONNECTED</span>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <span className="text-xs font-mono text-slate-400 hidden lg:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Connect
          </Link>
        )}
      </div>
    </header>
  );
}
