'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export function BottomFooterBar() {
  const [stats, setStats] = useState({
    totalPnl: 12430.22,
    winRate: 64.2,
    dailyPnlPct: 1.2,
  });

  useEffect(() => {
    async function loadQuickStats() {
      const res = await fetchApi('/api/trades?limit=100');
      if (res.success && res.data && res.data.length > 0) {
        const trades = res.data;
        const totalPnl = trades.reduce((sum: number, t: any) => sum + Number(t.pnl_currency), 0);
        const wins = trades.filter((t: any) => Number(t.pnl_currency) > 0).length;
        const winRate = Number(((wins / trades.length) * 100).toFixed(1));
        setStats({
          totalPnl,
          winRate,
          dailyPnlPct: 1.2,
        });
      }
    }

    loadQuickStats();
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 w-full h-8 bg-white dark:bg-[#0d1322] border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between font-mono text-xs z-30 text-slate-500 dark:text-slate-400">
      <div>System Online</div>

      <div className="flex items-center gap-4 sm:gap-6">
        <span>
          Net P&L:{' '}
          <strong className={stats.totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
            {stats.totalPnl >= 0 ? `+$${stats.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Math.abs(stats.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </strong>
        </span>
        <span>
          Win Rate:{' '}
          <strong className="text-[#2962ff] dark:text-[#3b82f6] font-bold">
            {stats.winRate}%
          </strong>
        </span>
        <span>
          Today:{' '}
          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
            +{stats.dailyPnlPct}%
          </strong>
        </span>
      </div>
    </footer>
  );
}
