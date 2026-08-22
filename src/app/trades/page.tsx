'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { fetchApi, buildTradeQueryString } from '@/lib/api-client';
import { Calendar, Layers, Target, Compass, Brain, Download, CheckCircle2, AlertTriangle } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070a14] grid-bg flex flex-col font-mono text-slate-200">
      <TopHeaderBar />

      <div className="flex flex-1 overflow-hidden pb-10">
        <SidebarNav />

        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* FILTER ROW CHIPS (MATCHING IMAGE 2) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d2640] pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter Chip */}
              <div className="relative">
                <select
                  value={filterStore.startDate || ''}
                  onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
                  className="bg-[#0e1424] border border-[#1d2640] text-xs font-mono text-slate-300 px-3 py-1.5 rounded appearance-none pr-8 cursor-pointer hover:border-slate-600"
                >
                  <option value="">📅 ALL TIME ▾</option>
                  <option value="2026-08-01">THIS MONTH</option>
                  <option value="2026-01-01">THIS YEAR</option>
                </select>
              </div>

              {/* Asset Filter Chip */}
              <div className="relative">
                <input
                  type="text"
                  value={filterStore.asset || ''}
                  onChange={(e) => filterStore.setFilter('asset', e.target.value.toUpperCase())}
                  placeholder="📊 ALL ASSETS ▾"
                  className="bg-[#0e1424] border border-[#1d2640] text-xs font-mono text-slate-300 px-3 py-1.5 rounded w-36 uppercase placeholder-slate-400 focus:outline-none focus:border-[#dfff00]"
                />
              </div>

              {/* Strategy Filter Chip */}
              <div className="relative">
                <input
                  type="text"
                  value={filterStore.setupName || ''}
                  onChange={(e) => filterStore.setFilter('setupName', e.target.value)}
                  placeholder="♟ ALL STRATEGIES ▾"
                  className="bg-[#0e1424] border border-[#1d2640] text-xs font-mono text-slate-300 px-3 py-1.5 rounded w-44 placeholder-slate-400 focus:outline-none focus:border-[#dfff00]"
                />
              </div>

              {/* Side Filter Chip */}
              <div className="relative">
                <select
                  value={filterStore.direction || ''}
                  onChange={(e) => filterStore.setFilter('direction', e.target.value || undefined)}
                  className="bg-[#0e1424] border border-[#1d2640] text-xs font-mono text-slate-300 px-3 py-1.5 rounded appearance-none pr-6 cursor-pointer hover:border-slate-600"
                >
                  <option value="">SIDE: ALL ▾</option>
                  <option value="long">SIDE: LONG</option>
                  <option value="short">SIDE: SHORT</option>
                </select>
              </div>

              {/* Emotion Filter Chip */}
              <div className="relative">
                <select
                  value={filterStore.emotionalState || ''}
                  onChange={(e) => filterStore.setFilter('emotionalState', e.target.value || undefined)}
                  className="bg-[#0e1424] border border-[#1d2640] text-xs font-mono text-slate-300 px-3 py-1.5 rounded appearance-none pr-6 cursor-pointer hover:border-slate-600"
                >
                  <option value="">🧠 EMOTION: ALL ▾</option>
                  <option value="Confident">CONFIDENT</option>
                  <option value="Calm">CALM</option>
                  <option value="Bored">BORED</option>
                  <option value="Hesitant">HESITANT</option>
                  <option value="Anxious">ANXIOUS</option>
                  <option value="FOMO">FOMO</option>
                  <option value="Revenge">REVENGE</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>{meta ? `${meta.total.toLocaleString()} RECORDS` : '0 RECORDS'}</span>
              <button title="Export Data" className="p-1.5 rounded bg-[#0e1424] border border-[#1d2640] hover:text-[#dfff00]">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* DENSE TRADE LOG TABLE (MATCHING IMAGE 2 EXACTLY) */}
          <div className="w-full overflow-x-auto border border-[#1d2640] bg-[#0c101d]">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#090d1a] border-b border-[#1d2640] text-slate-400">
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase">DATE / TIME</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase">ASSET</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase">SIDE</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase text-right">SIZE</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase text-right">ENTRY</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase text-right">EXIT</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase text-right">P&L ($)</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase">STRATEGY</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase">EMOTION</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wider uppercase text-center">COMPLIANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d2640]/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 font-mono text-xs">
                      Fetching trade log records...
                    </td>
                  </tr>
                ) : trades.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 font-mono text-xs uppercase">
                      No trade log records found matching filters
                    </td>
                  </tr>
                ) : (
                  trades.map((row) => {
                    const pnl = Number(row.pnl_currency);
                    const isWin = pnl >= 0;
                    const isLong = row.direction === 'long';

                    let emotionColor = 'text-slate-300';
                    if (row.emotional_state === 'FOMO' || row.emotional_state === 'Revenge') emotionColor = 'text-rose-500 font-bold';
                    if (row.emotional_state === 'Anxious' || row.emotional_state === 'Hesitant') emotionColor = 'text-amber-400 font-bold';

                    return (
                      <tr
                        key={row.id}
                        onClick={() => router.push(`/trades/${row.id}`)}
                        className="hover:bg-[#151c2e] transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          {row.entry_time?.replace('T', ' ').slice(2, 19)}
                        </td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {row.asset}
                        </td>
                        <td className="py-3 px-4 font-bold uppercase whitespace-nowrap">
                          <span className={isLong ? 'text-emerald-400' : 'text-rose-500'}>
                            {row.direction}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-200">
                          {row.position_size}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-200">
                          {Number(row.entry_price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-200">
                          {Number(row.exit_price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 font-bold text-xs rounded-xs ${
                              isWin
                                ? 'bg-[#0a3a2a] text-[#10b981] border border-[#10b981]/30'
                                : 'bg-[#3a0a0a] text-[#f43f5e] border border-[#f43f5e]/30'
                            }`}
                          >
                            {isWin ? `+${pnl.toFixed(2)}` : `-${Math.abs(pnl).toFixed(2)}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-semibold uppercase whitespace-nowrap">
                          {row.setup_name}
                        </td>
                        <td className={`py-3 px-4 uppercase whitespace-nowrap ${emotionColor}`}>
                          {row.emotional_state}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {row.followed_plan ? (
                            <span className="text-emerald-400 inline-flex items-center justify-center">
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

          {/* LOAD MORE BUTTON */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => filterStore.setFilter('page', (filterStore.page || 1) + 1)}
              className="px-6 py-2 bg-[#0e1424] border border-[#1d2640] text-xs font-mono font-bold text-slate-300 hover:border-slate-500 hover:text-white uppercase tracking-wider transition-colors"
            >
              LOAD MORE RECORDS
            </button>
          </div>
        </main>
      </div>

      <BottomFooterBar />
    </div>
  );
}
