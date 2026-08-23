'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { CalendarHeatmap } from '@/components/ui/CalendarHeatmap';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { useThemeStore } from '@/stores/themeStore';
import { fetchApi } from '@/lib/api-client';
import { BarChart3, TrendingUp, ShieldCheck, AlertTriangle, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const filterStore = useTradeFilterStore();
  const { theme } = useThemeStore();

  const [equity, setEquity] = useState<any[]>([]);
  const [expectancy, setExpectancy] = useState<any[]>([]);
  const [exitReasons, setExitReasons] = useState<any[]>([]);
  const [riskTime, setRiskTime] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filterStore.startDate) queryParams.append('startDate', filterStore.startDate);
      if (filterStore.endDate) queryParams.append('endDate', filterStore.endDate);
      const q = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [eqRes, expRes, exitRes, riskRes, heatRes] = await Promise.all([
        fetchApi(`/api/analytics/equity-curve${q}`),
        fetchApi(`/api/analytics/expectancy-per-strategy${q}`),
        fetchApi(`/api/analytics/exit-reasons${q}`),
        fetchApi(`/api/analytics/risk-over-time${q}`),
        fetchApi(`/api/analytics/calendar-heatmap${q}`),
      ]);

      if (eqRes.success) setEquity(eqRes.data || []);
      if (expRes.success) setExpectancy(expRes.data || []);
      if (exitRes.success) setExitReasons(exitRes.data || []);
      if (riskRes.success) setRiskTime(riskRes.data || null);
      if (heatRes.success) setHeatmap(heatRes.data || []);

      setIsLoading(false);
    }

    loadAnalytics();
  }, [filterStore.startDate, filterStore.endDate]);

  const handleHeatmapDayClick = (dateStr: string) => {
    filterStore.setFilter('startDate', dateStr);
    filterStore.setFilter('endDate', dateStr);
    router.push('/trades');
  };

  const chartLineColor = theme === 'dark' ? '#dfff00' : '#2962ff';
  const chartGridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';

  return (
    <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex flex-col font-sans text-slate-900 dark:text-slate-200">
      <TopHeaderBar />
      <SidebarNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 pb-16">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#2962ff] dark:text-[#dfff00]" />
              <h1 className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Analytics
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              How your trading is going, broken down
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filterStore.startDate || ''}
              onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
              className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg"
            />
            <span className="text-slate-400 text-xs font-mono">/</span>
            <input
              type="date"
              value={filterStore.endDate || ''}
              onChange={(e) => filterStore.setFilter('endDate', e.target.value)}
              className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg"
            />
            <button
              onClick={() => filterStore.resetFilters()}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070a14] font-mono text-xs text-[#2962ff] dark:text-[#dfff00] hover:border-slate-400 dark:hover:border-slate-700 cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PERFORMANCE SECTION */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4 text-[#2962ff] dark:text-[#dfff00]" />
            <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              Performance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            {/* Cumulative Equity Curve */}
            <div className="md:col-span-8 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4">
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
                Total P&L Over Time
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={equity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="entry_time" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(s) => s.slice(5, 10)} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
              </div>
            </div>

            {/* Risk % Over Time */}
            <div className="md:col-span-4 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  Risk Per Trade
                </span>
                <span className="font-mono text-xs text-[#2962ff] dark:text-[#dfff00] font-bold">
                  Avg: {riskTime?.average_risk_percent || 0}%
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskTime?.risk_series || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={chartGridColor} vertical={false} />
                    <XAxis dataKey="entry_time" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(s) => s.slice(5, 10)} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#0d1322' : '#ffffff',
                        borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                        borderRadius: '8px',
                        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      }}
                    />
                    <Bar dataKey="risk_percent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* STRATEGIES & EXITS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          <div className="md:col-span-7 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-[#2962ff] dark:text-[#dfff00]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                Which Strategies Work?
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5">Strategy</th>
                    <th className="py-2.5 text-right">Win %</th>
                    <th className="py-2.5 text-right">Avg R</th>
                    <th className="py-2.5 text-right">Expected $</th>
                    <th className="py-2.5 text-right">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {expectancy.map((row) => (
                    <tr key={row.setup_name}>
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white uppercase">{row.setup_name}</td>
                      <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">{row.win_rate_percent}%</td>
                      <td className="py-2.5 text-right">{row.avg_r_multiple}R</td>
                      <td className="py-2.5 text-right text-[#2962ff] dark:text-[#dfff00] font-bold">${row.expected_value}</td>
                      <td className={`py-2.5 text-right font-bold ${row.total_pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        ${row.total_pnl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:col-span-5 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                Exit Breakdown
              </span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              {exitReasons.map((r) => (
                <div key={r.exit_reason} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="uppercase text-slate-600 dark:text-slate-400">{r.exit_reason.replace('_', ' ')}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{r.win_rate_percent}% WIN</span>
                  <span className={r.total_pnl_currency >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                    ${r.total_pnl_currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CALENDAR SECTION */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <CalendarIcon className="w-4 h-4 text-[#2962ff] dark:text-[#dfff00]" />
            <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              Trading Calendar
            </span>
          </div>
          <CalendarHeatmap data={heatmap} onDayClick={handleHeatmapDayClick} />
        </div>
      </main>

      <BottomFooterBar />
    </div>
  );
}
