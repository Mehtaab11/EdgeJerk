'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CalendarHeatmap } from '@/components/ui/CalendarHeatmap';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { fetchApi } from '@/lib/api-client';
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
    <div className="flex-1 flex flex-col min-h-screen pb-16">
      <NavigationHeader />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-8">
        {/* TOP BAR WITH GLOBAL DATE FILTER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111624] border border-[#2d3748] p-4">
          <div>
            <div className="font-mono text-sm font-bold text-[#dfff00]">SYS_ANALYTICS // DEEP REVIEW</div>
            <span className="font-sans text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">
              MULTI-ZONE QUANTITATIVE PERFORMANCE ANALYSIS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="form-label mb-0">START:</span>
              <input
                type="date"
                value={filterStore.startDate || ''}
                onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
                className="form-input text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="form-label mb-0">END:</span>
              <input
                type="date"
                value={filterStore.endDate || ''}
                onChange={(e) => filterStore.setFilter('endDate', e.target.value)}
                className="form-input text-xs w-36"
              />
            </div>
            <button
              onClick={() => filterStore.resetFilters()}
              className="px-3 py-1.5 border border-[#2d3748] font-mono text-xs text-[#dfff00] hover:underline"
            >
              RESET
            </button>
          </div>
        </div>

        {/* ZONE 1: PERFORMANCE DYNAMICS */}
        <div className="space-y-4">
          <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block border-b border-[#2d3748] pb-2">
            ZONE 1: PERFORMANCE DYNAMICS
          </span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Cumulative Equity Curve */}
            <div className="md:col-span-8 bg-[#111624] border border-[#2d3748] p-4">
              <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-2">
                CUMULATIVE P&L OVER TIME
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={equity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#2d3748" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="entry_time" tick={{ fill: '#8b949e', fontSize: 10 }} tickFormatter={(s) => s.slice(5, 10)} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                    <Area type="monotone" dataKey="cumulative_pnl" fill="#dfff00" fillOpacity={0.15} stroke="none" />
                    <Line type="monotone" dataKey="cumulative_pnl" stroke="#dfff00" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk % Over Time */}
            <div className="md:col-span-4 bg-[#111624] border border-[#2d3748] p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
                  RISK CONSISTENCY (%/TRADE)
                </span>
                <span className="font-mono text-xs text-[#dfff00]">
                  AVG: {riskTime?.average_risk_percent || 0}%
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskTime?.risk_series || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#2d3748" vertical={false} />
                    <XAxis dataKey="entry_time" tick={{ fill: '#8b949e', fontSize: 10 }} tickFormatter={(s) => s.slice(5, 10)} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                    <Bar dataKey="risk_percent" fill="#ffb4a2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 2: STRATEGY EDGE */}
        <div className="space-y-4">
          <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block border-b border-[#2d3748] pb-2">
            ZONE 2: STRATEGY EDGE & R-DISTRIBUTION
          </span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Expectancy Matrix */}
            <div className="md:col-span-7 bg-[#111624] border border-[#2d3748] p-4">
              <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-3">
                EXPECTANCY MATRIX PER STRATEGY
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#2d3748] text-[#8b949e]">
                      <th className="py-2">STRATEGY</th>
                      <th className="py-2 text-right">WIN %</th>
                      <th className="py-2 text-right">AVG R</th>
                      <th className="py-2 text-right">EXPECTED VAL</th>
                      <th className="py-2 text-right">NET P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d3748]">
                    {expectancy.map((row) => (
                      <tr key={row.setup_name}>
                        <td className="py-2 font-bold text-white">{row.setup_name}</td>
                        <td className="py-2 text-right text-[#40e56c]">{row.win_rate_percent}%</td>
                        <td className="py-2 text-right">{row.avg_r_multiple}R</td>
                        <td className="py-2 text-right text-[#dfff00]">${row.expected_value}</td>
                        <td
                          className={`py-2 text-right font-bold ${
                            row.total_pnl >= 0 ? 'text-[#40e56c]' : 'text-[#ff6b6b]'
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
            <div className="md:col-span-5 bg-[#111624] border border-[#2d3748] p-4">
              <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-2">
                R-MULTIPLE BUCKET DISTRIBUTION
              </span>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#2d3748" vertical={false} />
                    <XAxis dataKey="range" tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                    <Bar dataKey="count" fill="#dfff00" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 3: EXECUTION QUALITY */}
        <div className="space-y-4">
          <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block border-b border-[#2d3748] pb-2">
            ZONE 3: EXECUTION QUALITY & SLIPPAGE
          </span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Exit Reason Breakdown */}
            <div className="md:col-span-4 bg-[#111624] border border-[#2d3748] p-4">
              <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-3">
                EXIT REASON PROFITABILITY
              </span>
              <div className="space-y-3 font-mono text-xs">
                {exitReasons.map((reason) => (
                  <div key={reason.exit_reason} className="flex justify-between items-center border-b border-[#2d3748] pb-1">
                    <span className="uppercase text-[#8b949e]">{reason.exit_reason.replace('_', ' ')}</span>
                    <span className="text-white font-bold">{reason.win_rate_percent}% WIN</span>
                    <span className={reason.total_pnl_currency >= 0 ? 'text-[#40e56c]' : 'text-[#ff6b6b]'}>
                      ${reason.total_pnl_currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scatter plot: Grade vs Outcome */}
            <div className="md:col-span-4 bg-[#111624] border border-[#2d3748] p-4">
              <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-2">
                GRADE VS OUTCOME SCATTER
              </span>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#2d3748" />
                    <XAxis dataKey="trade_grade" type="number" domain={[1, 5]} tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <YAxis dataKey="r_multiple" tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                    <Scatter data={gradeVsOutcome?.data_points || []} fill="#dfff00" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Plan Deviation Stats */}
            <div className="md:col-span-4 bg-[#111624] border border-[#2d3748] p-4 flex flex-col justify-between font-mono text-xs">
              <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-2">
                PLAN DEVIATION & SLIPPAGE
              </span>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#2d3748] pb-2">
                  <span className="text-[#8b949e]">AVG ENTRY SLIPPAGE</span>
                  <span className="text-[#ff6b6b] font-bold">${planDev?.avg_entry_slippage || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#2d3748] pb-2">
                  <span className="text-[#8b949e]">AVG EXIT SLIPPAGE</span>
                  <span className="text-[#ff6b6b] font-bold">${planDev?.avg_exit_slippage || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8b949e]">PLAN COMPLIANCE %</span>
                  <span className="text-[#40e56c] font-bold">{planDev?.plan_compliance_percent || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 4: BEHAVIORAL IMPACT */}
        <div className="space-y-4">
          <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block border-b border-[#2d3748] pb-2">
            ZONE 4: BEHAVIORAL IMPACT & MISTAKE COST
          </span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Mistake Tag Frequency vs Cost Chart */}
            <div className="md:col-span-7 bg-[#111624] border border-[#2d3748] p-4">
              <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-3">
                MISTAKE FREQUENCY VS AGGREGATE P&L COST
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mistakes} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                    <CartesianGrid stroke="#2d3748" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <YAxis dataKey="tag_name" type="category" tick={{ fill: '#e5e7eb', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                    <Bar dataKey="total_pnl_impact" fill="#ff6b6b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* P&L by Emotional State & Rule Compliance */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#111624] border border-[#2d3748] p-4">
                <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-3">
                  P&L BY EMOTIONAL STATE
                </span>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pnlEmotion} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#2d3748" vertical={false} />
                      <XAxis dataKey="emotional_state" tick={{ fill: '#8b949e', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                      <Bar dataKey="total_pnl_currency" fill="#dfff00" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#111624] border border-[#2d3748] p-4">
                <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-3">
                  RULE COMPLIANCE % OVER TIME
                </span>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ruleCompliance} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#2d3748" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                      <Line type="monotone" dataKey="compliance_percent" stroke="#40e56c" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 5: EXPOSURE & CONTEXT */}
        <div className="space-y-4">
          <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block border-b border-[#2d3748] pb-2">
            ZONE 5: EXPOSURE & CALENDAR DENSITY
          </span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Calendar Heatmap Grid */}
            <div className="md:col-span-8">
              <CalendarHeatmap data={heatmap} onDayClick={handleHeatmapDayClick} />
            </div>

            {/* Correlated vs Isolated Trade P&L */}
            <div className="md:col-span-4 bg-[#111624] border border-[#2d3748] p-4 flex flex-col justify-between font-mono text-xs">
              <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-2">
                CORRELATED VS ISOLATED P&L
              </span>

              <div className="space-y-4">
                <div className="border border-[#2d3748] p-3 bg-[#1a1f2f]">
                  <div className="flex justify-between text-[#8b949e] mb-1">
                    <span>CORRELATED POSITIONS</span>
                    <span>{correlated?.correlated?.total_trades || 0} TRADES</span>
                  </div>
                  <div className="text-lg font-bold text-[#dfff00]">
                    ${correlated?.correlated?.total_pnl_currency || 0}
                  </div>
                </div>

                <div className="border border-[#2d3748] p-3 bg-[#1a1f2f]">
                  <div className="flex justify-between text-[#8b949e] mb-1">
                    <span>ISOLATED POSITIONS</span>
                    <span>{correlated?.isolated?.total_trades || 0} TRADES</span>
                  </div>
                  <div className="text-lg font-bold text-[#40e56c]">
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
