'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CalendarHeatmap } from '@/components/ui/CalendarHeatmap';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { fetchApi } from '@/lib/api-client';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Calendar as CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  LineChart,
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
    <div className="flex-1 flex flex-col min-h-screen pb-16 bg-[#070a12]">
      <NavigationHeader />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* TOP BAR WITH GLOBAL DATE FILTER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#dfff00]" />
              <h1 className="font-mono text-base font-bold text-white tracking-tight">
                SYS_ANALYTICS // DEEP REVIEW
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-Zone Quantitative Performance & Behavioral Analysis
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="form-label mb-0 text-[10px]">Start:</span>
              <input
                type="date"
                value={filterStore.startDate || ''}
                onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
                className="form-input text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="form-label mb-0 text-[10px]">End:</span>
              <input
                type="date"
                value={filterStore.endDate || ''}
                onChange={(e) => filterStore.setFilter('endDate', e.target.value)}
                className="form-input text-xs w-36"
              />
            </div>
            <button
              onClick={() => filterStore.resetFilters()}
              className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 font-mono text-xs text-[#dfff00] hover:border-slate-700 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ZONE 1: PERFORMANCE DYNAMICS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4 text-[#dfff00]" />
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
              Zone 1: Performance Dynamics & Risk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Cumulative Equity Curve */}
            <div className="md:col-span-8 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
                Cumulative P&L Curve Over Time
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={equity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dfff00" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#dfff00" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="entry_time" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(s) => s.slice(5, 10)} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="cumulative_pnl" fill="url(#anGrad)" stroke="none" />
                    <Line type="monotone" dataKey="cumulative_pnl" stroke="#dfff00" strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk % Over Time */}
            <div className="md:col-span-4 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Risk Consistency (%/Trade)
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

        {/* ZONE 2: STRATEGY EDGE */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-[#dfff00]" />
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
              Zone 2: Strategy Edge & R-Multiple Distribution
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Expectancy Matrix */}
            <div className="md:col-span-7 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
                Expectancy Matrix per Strategy
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5">STRATEGY</th>
                      <th className="py-2.5 text-right">WIN %</th>
                      <th className="py-2.5 text-right">AVG R</th>
                      <th className="py-2.5 text-right">EV ($)</th>
                      <th className="py-2.5 text-right">NET P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expectancy.map((row) => (
                      <tr key={row.setup_name}>
                        <td className="py-2.5 font-bold text-white">{row.setup_name}</td>
                        <td className="py-2.5 text-right text-emerald-400 font-bold">{row.win_rate_percent}%</td>
                        <td className="py-2.5 text-right">{row.avg_r_multiple}R</td>
                        <td className="py-2.5 text-right text-[#dfff00] font-bold">${row.expected_value}</td>
                        <td
                          className={`py-2.5 text-right font-bold ${
                            row.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ${row.total_pnl}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* R-Multiple Distribution Histogram */}
            <div className="md:col-span-5 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
                R-Multiple Bucket Distribution
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#dfff00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 3: EXECUTION QUALITY */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <AlertTriangle className="w-4 h-4 text-[#dfff00]" />
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
              Zone 3: Execution Quality & Plan Slippage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Exit Reason Breakdown */}
            <div className="md:col-span-4 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
                Exit Reason Profitability
              </span>
              <div className="space-y-3 font-mono text-xs">
                {exitReasons.map((reason) => (
                  <div key={reason.exit_reason} className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="uppercase text-slate-400 font-semibold">{reason.exit_reason.replace('_', ' ')}</span>
                    <span className="text-slate-200 font-bold">{reason.win_rate_percent}% Win</span>
                    <span className={reason.total_pnl_currency >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      ${reason.total_pnl_currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scatter plot: Grade vs Outcome */}
            <div className="md:col-span-4 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
                Grade vs Outcome Scatter Plot
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" />
                    <XAxis dataKey="trade_grade" type="number" domain={[1, 5]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="r_multiple" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                    <Scatter data={gradeVsOutcome?.data_points || []} fill="#dfff00" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Plan Deviation Stats */}
            <div className="md:col-span-4 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between font-mono text-xs">
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Plan Slippage & Compliance
              </span>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">AVG ENTRY SLIPPAGE</span>
                  <span className="text-rose-400 font-bold">${planDev?.avg_entry_slippage || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">AVG EXIT SLIPPAGE</span>
                  <span className="text-rose-400 font-bold">${planDev?.avg_exit_slippage || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">PLAN COMPLIANCE %</span>
                  <span className="text-emerald-400 font-bold">{planDev?.plan_compliance_percent || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 4: BEHAVIORAL IMPACT */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
              Zone 4: Behavioral Impact & Mistake Cost
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Mistake Tag Frequency vs Cost Chart */}
            <div className="md:col-span-7 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
                Mistake Frequency vs Aggregate Dollar Cost
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mistakes} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="tag_name" type="category" tick={{ fill: '#f8fafc', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="total_pnl_impact" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* P&L by Emotional State & Rule Compliance */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                  P&L by Emotional State
                </span>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pnlEmotion} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="emotional_state" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="total_pnl_currency" fill="#dfff00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                  Rule Compliance % Over Time
                </span>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ruleCompliance} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="compliance_percent" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 5: EXPOSURE & CONTEXT */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <CalendarIcon className="w-4 h-4 text-[#dfff00]" />
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
              Zone 5: Exposure & Calendar Density
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Calendar Heatmap Grid */}
            <div className="md:col-span-8">
              <CalendarHeatmap data={heatmap} onDayClick={handleHeatmapDayClick} />
            </div>

            {/* Correlated vs Isolated Trade P&L */}
            <div className="md:col-span-4 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between font-mono text-xs">
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
                Correlated vs Isolated Trade P&L
              </span>

              <div className="space-y-4">
                <div className="border border-slate-800 p-4 rounded-xl bg-slate-900/60">
                  <div className="flex justify-between text-slate-400 mb-1.5">
                    <span>CORRELATED POSITIONS</span>
                    <span>{correlated?.correlated?.total_trades || 0} TRADES</span>
                  </div>
                  <div className="text-xl font-bold text-[#dfff00]">
                    ${correlated?.correlated?.total_pnl_currency || 0}
                  </div>
                </div>

                <div className="border border-slate-800 p-4 rounded-xl bg-slate-900/60">
                  <div className="flex justify-between text-slate-400 mb-1.5">
                    <span>ISOLATED POSITIONS</span>
                    <span>{correlated?.isolated?.total_trades || 0} TRADES</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${correlated?.isolated?.total_pnl_currency || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
