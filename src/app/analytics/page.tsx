'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { CalendarHeatmap } from '@/components/ui/CalendarHeatmap';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { fetchApi } from '@/lib/api-client';
import { BarChart3, TrendingUp, ShieldCheck, AlertTriangle, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const filterStore = useTradeFilterStore();

  const [equity, setEquity] = useState<any[]>([]);
  const [drawdown, setDrawdown] = useState<any>(null);
  const [expectancy, setExpectancy] = useState<any[]>([]);
  const [rDist, setRDist] = useState<any[]>([]);
  const [exitReasons, setExitReasons] = useState<any[]>([]);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [gradeVsOutcome, setGradeVsOutcome] = useState<any>(null);
  const [planDev, setPlanDev] = useState<any>(null);
  const [riskTime, setRiskTime] = useState<any>(null);
  const [pnlEmotion, setPnlEmotion] = useState<any[]>([]);
  const [ruleCompliance, setRuleCompliance] = useState<any[]>([]);
  const [correlated, setCorrelated] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [sessionNews, setSessionNews] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filterStore.startDate) queryParams.append('startDate', filterStore.startDate);
      if (filterStore.endDate) queryParams.append('endDate', filterStore.endDate);
      const q = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [
        eqRes,
        ddRes,
        expRes,
        rDistRes,
        exitRes,
        mistakeRes,
        gradeRes,
        planRes,
        riskRes,
        emoRes,
        ruleRes,
        correlRes,
        heatRes,
        sessRes,
      ] = await Promise.all([
        fetchApi(`/api/analytics/equity-curve${q}`),
        fetchApi(`/api/analytics/drawdown${q}`),
        fetchApi(`/api/analytics/expectancy-per-strategy${q}`),
        fetchApi(`/api/analytics/r-distribution${q}`),
        fetchApi(`/api/analytics/exit-reasons${q}`),
        fetchApi(`/api/analytics/mistake-frequency${q}`),
        fetchApi(`/api/analytics/trade-grade-vs-outcome${q}`),
        fetchApi(`/api/analytics/plan-deviation${q}`),
        fetchApi(`/api/analytics/risk-over-time${q}`),
        fetchApi(`/api/analytics/pnl-by-emotion${q}`),
        fetchApi(`/api/analytics/rule-compliance${q}`),
        fetchApi(`/api/analytics/correlated-vs-isolated${q}`),
        fetchApi(`/api/analytics/calendar-heatmap${q}`),
        fetchApi(`/api/analytics/session-news-breakdown${q}`),
      ]);

      if (eqRes.success) setEquity(eqRes.data || []);
      if (ddRes.success) setDrawdown(ddRes.data || null);
      if (expRes.success) setExpectancy(expRes.data || []);
      if (rDistRes.success) setRDist(rDistRes.data || []);
      if (exitRes.success) setExitReasons(exitRes.data || []);
      if (mistakeRes.success) setMistakes(mistakeRes.data || []);
      if (gradeRes.success) setGradeVsOutcome(gradeRes.data || null);
      if (planRes.success) setPlanDev(planRes.data || null);
      if (riskRes.success) setRiskTime(riskRes.data || null);
      if (emoRes.success) setPnlEmotion(emoRes.data || []);
      if (ruleRes.success) setRuleCompliance(ruleRes.data || []);
      if (correlRes.success) setCorrelated(correlRes.data || null);
      if (heatRes.success) setHeatmap(heatRes.data || []);
      if (sessRes.success) setSessionNews(sessRes.data || null);

      setIsLoading(false);
    }

    loadAnalytics();
  }, [filterStore.startDate, filterStore.endDate]);

  const handleHeatmapDayClick = (dateStr: string) => {
    filterStore.setFilter('startDate', dateStr);
    filterStore.setFilter('endDate', dateStr);
    router.push('/trades');
  };

  return (
    <div className="min-h-screen bg-[#070a14] flex flex-col font-sans text-slate-200">
      <TopHeaderBar />

      <div className="flex flex-1 overflow-hidden pb-12">
        <SidebarNav />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
          {/* HEADER BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#dfff00]" />
                <h1 className="font-mono text-base font-bold text-white tracking-tight">
                  Analytics
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                How your trading is going, broken down
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filterStore.startDate || ''}
                onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
                className="bg-[#070a14] border border-slate-800 text-xs font-mono text-slate-300 px-3.5 py-2 rounded-xl"
              />
              <span className="text-slate-500 text-xs font-mono">/</span>
              <input
                type="date"
                value={filterStore.endDate || ''}
                onChange={(e) => filterStore.setFilter('endDate', e.target.value)}
                className="bg-[#070a14] border border-slate-800 text-xs font-mono text-slate-300 px-3.5 py-2 rounded-xl"
              />
              <button
                onClick={() => filterStore.resetFilters()}
                className="p-2 rounded-xl border border-slate-800 bg-[#070a14] font-mono text-xs text-[#dfff00] hover:border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ZONE 1: PERFORMANCE DYNAMICS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <TrendingUp className="w-4 h-4 text-[#dfff00]" />
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
                Performance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Cumulative Equity Curve */}
              <div className="md:col-span-8 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Total P&L Over Time
                </span>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={equity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="anGradSoft" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dfff00" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#dfff00" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="entry_time" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(s) => s.slice(5, 10)} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="cumulative_pnl" fill="url(#anGradSoft)" stroke="none" />
                      <Line type="monotone" dataKey="cumulative_pnl" stroke="#dfff00" strokeWidth={2.5} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk % Over Time */}
              <div className="md:col-span-4 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Risk Per Trade
                  </span>
                  <span className="font-mono text-xs text-[#dfff00]">
                    Avg: {riskTime?.average_risk_percent || 0}%
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskTime?.risk_series || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="entry_time" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(s) => s.slice(5, 10)} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="risk_percent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ZONE 2 & 3 ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-[#dfff00]" />
                <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Which Strategies Work?
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5">Strategy</th>
                      <th className="py-2.5 text-right">Win %</th>
                      <th className="py-2.5 text-right">Avg R</th>
                      <th className="py-2.5 text-right">Expected $</th>
                      <th className="py-2.5 text-right">Net P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expectancy.map((row) => (
                      <tr key={row.setup_name}>
                        <td className="py-2.5 font-bold text-white uppercase">{row.setup_name}</td>
                        <td className="py-2.5 text-right text-emerald-400 font-bold">{row.win_rate_percent}%</td>
                        <td className="py-2.5 text-right">{row.avg_r_multiple}R</td>
                        <td className="py-2.5 text-right text-[#dfff00] font-bold">${row.expected_value}</td>
                        <td className={`py-2.5 text-right font-bold ${row.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${row.total_pnl}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:col-span-5 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Exit Breakdown
                </span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                {exitReasons.map((r) => (
                  <div key={r.exit_reason} className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="uppercase text-slate-400">{r.exit_reason.replace('_', ' ')}</span>
                    <span className="text-white font-bold">{r.win_rate_percent}% WIN</span>
                    <span className={r.total_pnl_currency >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      ${r.total_pnl_currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ZONE 5: CONTEXT HEATMAP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <CalendarIcon className="w-4 h-4 text-[#dfff00]" />
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
                Trading Calendar
              </span>
            </div>
            <CalendarHeatmap data={heatmap} onDayClick={handleHeatmapDayClick} />
          </div>
        </main>
      </div>

      <BottomFooterBar />
    </div>
  );
}
