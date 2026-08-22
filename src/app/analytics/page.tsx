'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
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
    <div className="min-h-screen bg-[#070a14] grid-bg flex flex-col font-mono text-slate-200">
      <TopHeaderBar />

      <div className="flex flex-1 overflow-hidden pb-10">
        <SidebarNav />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* HEADER BAR */}
          <div className="flex justify-between items-center border-b border-[#1d2640] pb-4">
            <div>
              <h1 className="text-sm font-bold text-[#dfff00] tracking-wider uppercase">
                SYS_ANALYTICS // DEEP REVIEW
              </h1>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">
                QUANTITATIVE PERFORMANCE & BEHAVIORAL MULTI-ZONE ENGINE
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filterStore.startDate || ''}
                onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
                className="bg-[#0e1424] border border-[#1d2640] text-xs font-mono text-slate-300 px-3 py-1 rounded"
              />
              <span className="text-slate-500 text-xs">/</span>
              <input
                type="date"
                value={filterStore.endDate || ''}
                onChange={(e) => filterStore.setFilter('endDate', e.target.value)}
                className="bg-[#0e1424] border border-[#1d2640] text-xs font-mono text-slate-300 px-3 py-1 rounded"
              />
            </div>
          </div>

          {/* ZONE 1: PERFORMANCE DYNAMICS */}
          <div className="bg-[#0b0f1d] border border-[#1d2640] p-4 space-y-4">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1d2640] pb-2">
              ZONE 1: PERFORMANCE DYNAMICS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Cumulative Equity Curve & Drawdown */}
              <div className="md:col-span-8 bg-[#090d1a] border border-[#1d2640] p-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  CUMULATIVE P&L & DRAWDOWN DEPTH
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={equity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1d2640" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="entry_time" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(s) => s.slice(5, 10)} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0b0f1d', borderColor: '#1d2640', borderRadius: '0px' }} />
                      <Line type="monotone" dataKey="cumulative_pnl" stroke="#dfff00" strokeWidth={3} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-20 w-full pt-1 border-t border-[#1d2640]">
                  <DrawdownAreaChart data={equity} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                    <Area type="monotone" dataKey="cumulative_pnl" fill="#3a0a0a" stroke="#f43f5e" />
                  </DrawdownAreaChart>
                </div>
              </div>

              {/* Risk Consistency Scatter */}
              <div className="md:col-span-4 bg-[#090d1a] border border-[#1d2640] p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  RISK CONSISTENCY (%/TRADE)
                </span>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskTime?.risk_series || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1d2640" vertical={false} />
                      <XAxis dataKey="entry_time" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(s) => s.slice(5, 10)} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0b0f1d', borderColor: '#1d2640' }} />
                      <Bar dataKey="risk_percent" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ZONE 2 & ZONE 3 ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* ZONE 2: STRATEGY EDGE */}
            <div className="md:col-span-7 bg-[#0b0f1d] border border-[#1d2640] p-4 space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1d2640] pb-2">
                ZONE 2: STRATEGY EDGE
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#1d2640] text-slate-400">
                      <th className="py-2">STRATEGY</th>
                      <th className="py-2 text-right">WIN %</th>
                      <th className="py-2 text-right">AVG R</th>
                      <th className="py-2 text-right">AVG W</th>
                      <th className="py-2 text-right">AVG L</th>
                      <th className="py-2 text-right">TRADES</th>
                      <th className="py-2 text-right">EV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d2640]">
                    {expectancy.map((row) => (
                      <tr key={row.setup_name}>
                        <td className="py-2 font-bold text-white uppercase">{row.setup_name}</td>
                        <td className="py-2 text-right text-emerald-400 font-bold">{row.win_rate_percent}%</td>
                        <td className="py-2 text-right">{row.avg_r_multiple}R</td>
                        <td className="py-2 text-right text-emerald-400">+${row.expected_value}</td>
                        <td className="py-2 text-right text-rose-500">-$210</td>
                        <td className="py-2 text-right">{row.total_trades}</td>
                        <td className="py-2 text-right text-[#dfff00] font-bold">{row.expected_value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#1d2640]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">R-MULT DISTRIBUTION</span>
                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rDist}>
                        <Bar dataKey="count" fill="#dfff00" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">WIN% VS AVG R (PAIRED)</span>
                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expectancy}>
                        <Bar dataKey="win_rate_percent" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* ZONE 3: EXECUTION QUALITY */}
            <div className="md:col-span-5 bg-[#0b0f1d] border border-[#1d2640] p-4 space-y-4 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1d2640] pb-2">
                ZONE 3: EXECUTION QUALITY
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-2">EXIT REASON PROFITABILITY</span>
                  <div className="space-y-2 text-xs">
                    {exitReasons.map((r) => (
                      <div key={r.exit_reason} className="flex justify-between items-center">
                        <span className="uppercase text-slate-400">{r.exit_reason.slice(0, 3)}</span>
                        <span className={r.total_pnl_currency >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                          ${r.total_pnl_currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-2">GRADE VS OUTCOME</span>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <XAxis dataKey="trade_grade" domain={[1, 5]} hide />
                        <YAxis dataKey="r_multiple" hide />
                        <Scatter data={gradeVsOutcome?.data_points || []} fill="#dfff00" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#1d2640] pt-3 text-xs">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">AVG ENTRY SLIPPAGE</span>
                  <span className="text-rose-500 font-bold">-1.2 Ticks</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 uppercase block text-[10px]">PLAN DEVIATION</span>
                  <span className="text-emerald-400 font-bold">14% ↓2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ZONE 4 & ZONE 5 ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* ZONE 4: BEHAVIORAL IMPACT */}
            <div className="md:col-span-7 bg-[#0b0f1d] border border-[#1d2640] p-4 space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1d2640] pb-2">
                ZONE 4: BEHAVIORAL IMPACT
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">
                  MISTAKE FREQUENCY VS COST IMPACT
                </span>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mistakes} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="tag_name" type="category" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
                      <Bar dataKey="total_pnl_impact" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ZONE 5: CONTEXT */}
            <div className="md:col-span-5 bg-[#0b0f1d] border border-[#1d2640] p-4 space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1d2640] pb-2">
                ZONE 5: CONTEXT
              </div>
              <CalendarHeatmap data={heatmap} onDayClick={handleHeatmapDayClick} />
            </div>
          </div>
        </main>
      </div>

      <BottomFooterBar />
    </div>
  );
}

// Helper Component for Drawdown Depth Chart
function DrawdownAreaChart({ data, margin, children }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={margin}>
        <CartesianGrid stroke="#1d2640" vertical={false} />
        <YAxis hide />
        <XAxis hide dataKey="entry_time" />
        {children}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
