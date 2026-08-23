'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { fetchApi } from '@/lib/api-client';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useThemeStore } from '@/stores/themeStore';

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [trades, setTrades] = useState<any[]>([]);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalTrades = trades.length;
  const wins = trades.filter((t) => Number(t.pnl_currency) > 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const netPnl = trades.reduce((sum, t) => sum + Number(t.pnl_currency), 0);
  const avgR =
    totalTrades > 0
      ? (trades.reduce((sum, t) => sum + Number(t.r_multiple), 0) / totalTrades).toFixed(2)
      : '0.00';

  let streak = 0;
  if (trades.length > 0) {
    const isWin = Number(trades[0].pnl_currency) >= 0;
    for (const t of trades) {
      if ((Number(t.pnl_currency) >= 0) === isWin) {
        streak += 1;
      } else {
        break;
      }
    }
    streak = isWin ? streak : -streak;
  }

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      const [tradesRes, equityRes] = await Promise.all([
        fetchApi('/api/trades?limit=10&sortBy=entry_time&sortOrder=desc'),
        fetchApi('/api/analytics/equity-curve'),
      ]);

      if (tradesRes.success) setTrades(tradesRes.data || []);
      if (equityRes.success) setEquityCurve(equityRes.data || []);
      setIsLoading(false);
    }

    loadDashboardData();
  }, []);

  const chartLineColor = theme === 'dark' ? '#dfff00' : '#2962ff';
  const chartGridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';

  return (
    <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex flex-col font-sans text-slate-900 dark:text-slate-200">
      <TopHeaderBar />
      <SidebarNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 pb-16">
        {/* STATS ROW (60-30-10 TradingView Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Net P&L</span>
            <span className={`text-2xl font-bold font-mono ${netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
              {netPnl >= 0 ? `+$${netPnl.toFixed(2)}` : `-$${Math.abs(netPnl).toFixed(2)}`}
            </span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Win Rate</span>
            <span className="text-2xl font-bold font-mono text-[#2962ff] dark:text-[#dfff00]">
              {winRate}% <span className="text-xs text-slate-400 font-normal">({wins}/{totalTrades})</span>
            </span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Avg R</span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{avgR}R</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Risk-reward ratio</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Trades</span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{totalTrades}</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Streak</span>
            <span className={`text-2xl font-bold font-mono ${streak >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
              {streak >= 0 ? `+${streak} W` : `${streak} L`}
            </span>
          </div>
        </div>

        {/* P&L CHART */}
        <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              P&L Over Time
            </span>
            <span className="text-[11px] text-[#2962ff] dark:text-[#dfff00] font-mono font-bold">LIVE</span>
          </div>

          <div className="h-64 w-full pt-2">
            {equityCurve.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trades yet. Log your first trade to see your performance curve.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="entry_time" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(s) => s.slice(5, 10)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0d1322' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <Line type="monotone" dataKey="cumulative_pnl" stroke={chartLineColor} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RECENT TRADES */}
        <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Recent Trades
            </span>
            <Link href="/trades" className="text-xs text-[#2962ff] dark:text-[#dfff00] font-semibold hover:underline">
              View All Trades →
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-2">Date</th>
                  <th className="py-2.5 px-2">Ticker</th>
                  <th className="py-2.5 px-2">Side</th>
                  <th className="py-2.5 px-2 text-right">Size</th>
                  <th className="py-2.5 px-2 text-right">Entry</th>
                  <th className="py-2.5 px-2 text-right">Exit</th>
                  <th className="py-2.5 px-2 text-right">P&L</th>
                  <th className="py-2.5 px-2">Strategy</th>
                  <th className="py-2.5 px-2">Mood</th>
                  <th className="py-2.5 px-2 text-center">Plan?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                      No trades logged yet
                    </td>
                  </tr>
                ) : (
                  trades.map((row) => {
                    const pnl = Number(row.pnl_currency);
                    const isWin = pnl >= 0;
                    return (
                      <tr key={row.id} onClick={() => router.push(`/trades/${row.id}`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{row.entry_time?.slice(2, 16).replace('T', ' ')}</td>
                        <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{row.asset}</td>
                        <td className={`py-3 px-2 font-bold uppercase ${row.direction === 'long' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
                          {row.direction}
                        </td>
                        <td className="py-3 px-2 text-right">{row.position_size}</td>
                        <td className="py-3 px-2 text-right">${Number(row.entry_price).toFixed(2)}</td>
                        <td className="py-3 px-2 text-right">${Number(row.exit_price).toFixed(2)}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`px-2.5 py-0.5 font-bold rounded-md text-xs ${isWin ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
                            {isWin ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                          </span>
                        </td>
                        <td className="py-3 px-2 uppercase">{row.setup_name}</td>
                        <td className="py-3 px-2 uppercase">{row.emotional_state}</td>
                        <td className="py-3 px-2 text-center">
                          {row.followed_plan ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <AlertTriangle className="w-4 h-4 text-amber-500 inline" />}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomFooterBar />
    </div>
  );
}
