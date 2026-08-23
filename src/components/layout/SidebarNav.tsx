'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Database, TrendingUp, Settings, Terminal, Activity, X, Plus, LogOut, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavStore } from '@/stores/navStore';
import { useThemeStore } from '@/stores/themeStore';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, user, checkSession, logout } = useAuthStore();
  const { isOpen, close } = useNavStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Close drawer on navigation
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutGrid },
    { href: '/trades', label: 'Trade Log', icon: Database },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const userName = displayName || (user?.email ? user.email.split('@')[0] : 'Trader');

  const handleLogout = async () => {
    await logout();
    close();
    router.push('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP OVERLAY */}
      <div
        onClick={close}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* SLIDE-OUT DRAWER PANEL */}
      <aside className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* DRAWER HEADER WITH USER INFO & CLOSE BUTTON */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2962ff] flex items-center justify-center text-white font-bold">
                <Terminal className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userName}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Connected
                </span>
              </div>
            </div>

            <button
              onClick={close}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* QUICK ACTION */}
          <div className="p-3">
            <Link
              href="/trades/new"
              className="w-full py-2.5 px-4 rounded-lg bg-[#2962ff] hover:bg-[#1e4bd8] text-white font-sans font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Trade</span>
            </Link>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-sans font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2962ff] dark:text-[#3b82f6] font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2962ff] dark:text-[#3b82f6]' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM CONTROLS (THEME TOGGLE, LOGOUT, STATUS) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* THEME TOGGLE ROW */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Theme</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500 uppercase">
              {theme}
            </span>
          </button>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          {/* STATUS */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono text-[10px] text-slate-400 flex items-center justify-between">
            <span>System: Online</span>
            <Activity className="w-3 h-3 text-emerald-500" />
          </div>
        </div>
      </aside>
    </>
  );
}
