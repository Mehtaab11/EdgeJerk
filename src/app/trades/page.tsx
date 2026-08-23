'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { fetchApi, buildTradeQueryString } from '@/lib/api-client';
import { Download, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TradeLogPage() {
  const router = useRouter();
  const filterStore = useTradeFilterStore();
  const [trades, setTrades] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrades() {
      setIsLoading(true);
      const queryStr = buildTradeQueryString(filterStore);
      const res = await fetchApi(`/api/trades${queryStr}`);
      if (res.success) {
        setTrades(res.data || []);
        setMeta(res.meta || null);
      }
      setIsLoading(false);
    }

    loadTrades();
  }, [
    filterStore.startDate,
    filterStore.endDate,
    filterStore.asset,
    filterStore.setupName,
    filterStore.direction,
    filterStore.emotionalState,
    filterStore.mistakeTagId,
    filterStore.session,
    filterStore.exitReason,
    filterStore.page,
  ]);

  return (
    <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex flex-col font-sans text-slate-900 dark:text-slate-200">
      <TopHeaderBar />
      <SidebarNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 pb-16">
        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStore.startDate || ''}
              onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
              className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 focus:outline-none focus:border-[#2962ff] dark:focus:border-[#dfff00]"
            >
              <option value="">All Time</option>
              <option value="2026-08-01">This Month</option>
              <option value="2026-01-01">This Year</option>
            </select>

            <input
              type="text"
              value={filterStore.asset || ''}
              onChange={(e) => filterStore.setFilter('asset', e.target.value.toUpperCase())}
              placeholder="Ticker"
              className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg w-28 uppercase placeholder-slate-400 focus:outline-none focus:border-[#2962ff] dark:focus:border-[#dfff00]"
            />

            <input
              type="text"
              value={filterStore.setupName || ''}
              onChange={(e) => filterStore.setFilter('setupName', e.target.value)}
              placeholder="Strategy"
              className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg w-32 placeholder-slate-400 focus:outline-none focus:border-[#2962ff] dark:focus:border-[#dfff00]"
            />

            <select
              value={filterStore.direction || ''}
              onChange={(e) => filterStore.setFilter('direction', e.target.value || undefined)}
              className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 focus:outline-none focus:border-[#2962ff] dark:focus:border-[#dfff00]"
            >
              <option value="">Any Side</option>
              <option value="long">Long Only</option>
              <option value="short">Short Only</option>
            </select>

            <select
              value={filterStore.emotionalState || ''}
              onChange={(e) => filterStore.setFilter('emotionalState', e.target.value || undefined)}
              className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 focus:outline-none focus:border-[#2962ff] dark:focus:border-[#dfff00]"
            >
              <option value="">Any Mood</option>
              <option value="Confident">Confident</option>
              <option value="Calm">Calm</option>
              <option value="Bored">Bored</option>
              <option value="Hesitant">Hesitant</option>
              <option value="Anxious">Anxious</option>
              <option value="FOMO">FOMO</option>
              <option value="Revenge">Revenge</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>{meta ? `${meta.total.toLocaleString()} trades` : '0 trades'}</span>
            <button title="Export" className="p-2 rounded-lg bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 hover:text-[#2962ff] dark:hover:text-[#dfff00]">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0d1322] rounded-xl shadow-xs">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#090d1a] border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase">Date</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase">Ticker</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase">Side</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase text-right">Size</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase text-right">Entry</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase text-right">Exit</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase text-right">P&L</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase">Strategy</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase">Mood</th>
                <th className="py-3.5 px-4 text-[10px] font-sans font-bold tracking-wider uppercase text-center">Plan?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-sans text-xs">
                    Loading trades...
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-sans text-xs">
                    No trades match these filters
                  </td>
                </tr>
              ) : (
                trades.map((row) => {
                  const pnl = Number(row.pnl_currency);
                  const isWin = pnl >= 0;
                  const isLong = row.direction === 'long';

                  let emotionColor = 'text-slate-600 dark:text-slate-300';
                  if (row.emotional_state === 'FOMO' || row.emotional_state === 'Revenge') emotionColor = 'text-rose-600 dark:text-rose-400 font-bold';
                  if (row.emotional_state === 'Anxious' || row.emotional_state === 'Hesitant') emotionColor = 'text-amber-600 dark:text-amber-400 font-bold';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => router.push(`/trades/${row.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {row.entry_time?.replace('T', ' ').slice(2, 19)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap text-sm">
                        {row.asset}
                      </td>
                      <td className="py-3.5 px-4 font-bold uppercase whitespace-nowrap">
                        <span className={isLong ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {row.direction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                        {row.position_size}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                        ${Number(row.entry_price).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                        ${Number(row.exit_price).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 font-bold text-xs rounded-md ${
                            isWin
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isWin ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold uppercase whitespace-nowrap">
                        {row.setup_name}
                      </td>
                      <td className={`py-3.5 px-4 uppercase whitespace-nowrap ${emotionColor}`}>
                        {row.emotional_state}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {row.followed_plan ? (
                          <span className="text-emerald-500 inline-flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="text-amber-500 inline-flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* LOAD MORE */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => filterStore.setFilter('page', (filterStore.page || 1) + 1)}
            className="px-6 py-2.5 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            Load More
          </button>
        </div>
      </main>

      <BottomFooterBar />
    </div>
  );
}
