'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { fetchApi } from '@/lib/api-client';
import { CheckCircle2, AlertTriangle, Wallet, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from 'recharts';
import { useThemeStore } from '@/stores/themeStore';

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [trades, setTrades] = useState<any[]>([]);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [startingBalance, setStartingBalance] = useState(10000);
  const [chartMode, setChartMode] = useState<'pnl' | 'balance'>('pnl');
  const [isLoading, setIsLoading] = useState(true);

  const totalTrades = trades.length;
  const wins = trades.filter((t) => Number(t.pnl_currency) > 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const netPnl = trades.reduce((sum, t) => sum + Number(t.pnl_currency), 0);
  const currentBalance = startingBalance + netPnl;
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
      const [tradesRes, equityRes, meRes] = await Promise.all([
        fetchApi('/api/trades?limit=10&sortBy=entry_time&sortOrder=desc'),
        fetchApi('/api/analytics/equity-curve'),
        fetchApi('/api/auth/me'),
      ]);

      if (tradesRes.success) setTrades(tradesRes.data || []);
      if (equityRes.success) setEquityCurve(equityRes.data || []);
      if (meRes.success && meRes.data?.profile) {
        setStartingBalance(Number(meRes.data.profile.default_account_size) || 10000);
      }
      setIsLoading(false);
    }

    loadDashboardData();
  }, []);

  // Format chart data with account_balance
  const chartData = equityCurve.map((point) => ({
    ...point,
    account_balance: Number((startingBalance + (Number(point.cumulative_pnl) || 0)).toFixed(2)),
  }));

  const chartLineColor = theme === 'dark' ? '#388bfd' : '#2962ff';
  const chartGridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';

  return (
    <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex flex-col font-sans text-slate-900 dark:text-slate-200">
      <TopHeaderBar />
      <SidebarNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 pb-32">
        {/* STATS ROW (60-30-10 TradingView Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Balance</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#2962ff] dark:text-[#388bfd]">
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Net P&L</span>
            <span className={`text-xl sm:text-2xl font-bold font-mono ${netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
              {netPnl >= 0 ? `+$${netPnl.toFixed(2)}` : `-$${Math.abs(netPnl).toFixed(2)}`}
            </span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Win Rate</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {winRate}% <span className="text-xs text-slate-400 font-normal">({wins}/{totalTrades})</span>
            </span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Avg R</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{avgR}R</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Risk-reward ratio</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Trades</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{totalTrades}</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Streak</span>
            <span className={`text-xl sm:text-2xl font-bold font-mono ${streak >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
              {streak >= 0 ? `+${streak} W` : `${streak} L`}
            </span>
          </div>
        </div>

        {/* PERFORMANCE & ACCOUNT SIZE CHART */}
        <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                {chartMode === 'pnl' ? 'Cumulative P&L Over Time' : 'Total Account Size Over Time'}
              </span>
              <span className="text-[10px] text-slate-400">
                {chartMode === 'pnl' ? 'Net realized profits and losses' : 'Account balance growth curve'}
              </span>
            </div>

            {/* CHART MODE TOGGLE */}
            <div className="flex bg-slate-100 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setChartMode('pnl')}
                className={`px-3 py-1 rounded-md transition-all font-semibold cursor-pointer flex items-center gap-1.5 ${
                  chartMode === 'pnl'
                    ? 'bg-white dark:bg-slate-800 text-[#2962ff] dark:text-[#388bfd] font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>P&L ($)</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('balance')}
                className={`px-3 py-1 rounded-md transition-all font-semibold cursor-pointer flex items-center gap-1.5 ${
                  chartMode === 'balance'
                    ? 'bg-white dark:bg-slate-800 text-[#2962ff] dark:text-[#388bfd] font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Account Size ($)</span>
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trades yet. Log your first trade to see your performance curve.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="entry_time" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(s) => s.slice(5, 10)} />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0d1322' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, chartMode === 'pnl' ? 'P&L' : 'Account Balance']}
                  />
                  {chartMode === 'pnl' ? (
                    <Line
                      type="monotone"
                      dataKey="cumulative_pnl"
                      stroke={chartLineColor}
                      strokeWidth={2}
                      dot={false}
                    />
                  ) : (
                    <Line
                      type="monotone"
                      dataKey="account_balance"
                      stroke={chartLineColor}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RECENT TRADES SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Recent Trades
            </span>
            <Link href="/trades" className="text-xs text-[#2962ff] dark:text-[#388bfd] font-mono hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                    <th className="py-3 px-4 font-semibold">TICKER</th>
                    <th className="py-3 px-4 font-semibold">SIDE</th>
                    <th className="py-3 px-4 font-semibold">STRATEGY</th>
                    <th className="py-3 px-4 text-right font-semibold">R-MULTIPLE</th>
                    <th className="py-3 px-4 text-right font-semibold">P&L ($)</th>
                    <th className="py-3 px-4 text-center font-semibold">PLAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {trades.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                        No trades found. Start by clicking "Log Trade" above.
                      </td>
                    </tr>
                  ) : (
                    trades.map((t) => {
                      const pnl = Number(t.pnl_currency);
                      const isWin = pnl >= 0;
                      return (
                        <tr
                          key={t.id}
                          onClick={() => router.push(`/trades/${t.id}`)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white uppercase">{t.asset}</td>
                          <td className="py-3 px-4 uppercase">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                t.direction === 'long'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {t.direction}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{t.setup_name}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                            {Number(t.r_multiple).toFixed(2)}R
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${isWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isWin ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {t.followed_plan ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <BottomFooterBar />
    </div>
  );
}
