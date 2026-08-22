'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Radio, Plus } from 'lucide-react';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';

export function TopHeaderBar() {
  const router = useRouter();
  const filterStore = useTradeFilterStore();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      filterStore.setFilter('asset', searchVal.trim().toUpperCase());
      router.push('/trades');
    }
  };

  return (
    <header className="h-14 bg-[#070a14] border-b border-[#1d2640] px-4 flex items-center justify-between shrink-0">
      {/* BRAND & SEARCH BAR */}
      <div className="flex items-center gap-6">
        <Link href="/" className="font-mono text-sm font-extrabold text-[#dfff00] tracking-wider hover:opacity-90">
          TRADER_LOG_V1
        </Link>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="TICKER / ID"
            className="bg-[#0c101d] border border-[#1d2640] rounded text-[11px] font-mono text-white placeholder-slate-500 pl-8 pr-3 py-1.5 w-44 focus:outline-none focus:border-[#dfff00] uppercase"
          />
        </form>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 rounded bg-[#0e1424] border border-[#1d2640] text-[11px] font-mono font-bold text-slate-300 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#dfff00] animate-pulse" />
          <span>LIVE_STATUS</span>
        </div>

        <Link
          href="/trades/new"
          className="px-3.5 py-1.5 rounded bg-[#dfff00] text-black font-mono text-xs font-bold tracking-wider hover:bg-[#c8e600] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>LOG TRADE</span>
        </Link>
      </div>
    </header>
  );
}
