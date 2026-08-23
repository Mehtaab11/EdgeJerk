'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Menu, Sun, Moon } from 'lucide-react';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { useNavStore } from '@/stores/navStore';
import { useThemeStore } from '@/stores/themeStore';

export function TopHeaderBar() {
  const router = useRouter();
  const filterStore = useTradeFilterStore();
  const { toggle: toggleNav } = useNavStore();
  const { theme, toggleTheme } = useThemeStore();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      filterStore.setFilter('asset', searchVal.trim().toUpperCase());
      router.push('/trades');
    }
  };

  return (
    <header className="h-14 bg-white dark:bg-[#0d1322] border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
      {/* LEFT: HAMBURGER + BRAND + SEARCH */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* HAMBURGER BUTTON */}
        <button
          onClick={toggleNav}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          href="/"
          className="font-mono text-base font-extrabold text-[#2962ff] dark:text-[#3b82f6] tracking-wider hover:opacity-90 transition-opacity"
        >
          EdgeJerk
        </Link>

        {/* SEARCH BOX */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search ticker..."
            className="bg-slate-100 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-9 pr-3 py-1.5 w-44 focus:outline-none focus:border-[#2962ff] uppercase"
          />
        </form>
      </div>

      {/* RIGHT: THEME TOGGLE + LOG TRADE */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* THEME TOGGLE BUTTON */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* LOG TRADE BUTTON */}
        <Link
          href="/trades/new"
          className="px-3.5 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e4bd8] text-white font-sans font-bold text-xs tracking-wide transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Trade</span>
        </Link>
      </div>
    </header>
  );
}
