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
    <footer className="fixed bottom-0 left-0 w-full h-8 bg-[#070a14] border-t border-slate-800/80 px-6 flex items-center justify-between font-mono text-xs z-40 text-slate-400">
      <div>SYSTEM_STABLE_V2.4</div>

      <div className="flex items-center gap-6">
        <span>
          Total P&L:{' '}
          <strong className={stats.totalPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {stats.totalPnl >= 0 ? `+$${stats.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Math.abs(stats.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </strong>
        </span>
        <span>
          Win Rate:{' '}
          <strong className="text-[#dfff00] font-bold">
            {stats.winRate}%
          </strong>
        </span>
        <span>
          Daily:{' '}
          <strong className="text-emerald-400 font-bold">
            +{stats.dailyPnlPct}%
          </strong>
        </span>
      </div>
    </footer>
  );
}
