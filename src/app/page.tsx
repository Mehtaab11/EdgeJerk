'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { fetchApi } from '@/lib/api-client';
import { DollarSign, Percent, TrendingUp, Hash, Award, CheckCircle2, AlertTriangle } from 'lucide-react';
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
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<any[]>([]);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [expectancy, setExpectancy] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
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
      const [tradesRes, equityRes, expRes, sessionRes] = await Promise.all([
        fetchApi('/api/trades?limit=10&sortBy=entry_time&sortOrder=desc'),
        fetchApi('/api/analytics/equity-curve'),
        fetchApi('/api/analytics/expectancy-per-strategy'),
        fetchApi('/api/analytics/session-news-breakdown'),
      ]);

      if (tradesRes.success) setTrades(tradesRes.data || []);
      if (equityRes.success) setEquityCurve(equityRes.data || []);
      if (expRes.success) setExpectancy(expRes.data || []);
      if (sessionRes.success) setSessions(sessionRes.data?.sessions || []);
      setIsLoading(false);
    }

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#070a14] grid-bg flex flex-col font-mono text-slate-200">
      <TopHeaderBar />

      <div className="flex flex-1 overflow-hidden pb-10">
        <SidebarNav />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* STAT STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="bg-[#0b0f1d] border border-[#1d2640] p-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">NET P&L</span>
              <span className={`text-xl font-bold ${netPnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {netPnl >= 0 ? `+$${netPnl.toFixed(2)}` : `-$${Math.abs(netPnl).toFixed(2)}`}
              </span>
            </div>
            <div className="bg-[#0b0f1d] border border-[#1d2640] p-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">WIN RATE</span>
              <span className="text-xl font-bold text-[#dfff00]">
                {winRate}% <span className="text-xs text-slate-500 font-normal">({wins}/{totalTrades} W)</span>
              </span>
            </div>
            <div className="bg-[#0b0f1d] border border-[#1d2640] p-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">AVG R-MULTIPLE</span>
              <span className="text-xl font-bold text-slate-200">{avgR}R</span>
            </div>
            <div className="bg-[#0b0f1d] border border-[#1d2640] p-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">TOTAL TRADES</span>
              <span className="text-xl font-bold text-slate-200">{totalTrades}</span>
            </div>
            <div className="bg-[#0b0f1d] border border-[#1d2640] p-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">STREAK</span>
              <span className={`text-xl font-bold ${streak >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {streak >= 0 ? `+${streak} W` : `${streak} L`}
              </span>
            </div>
          </div>

          {/* EQUITY CURVE */}
          <div className="bg-[#0b0f1d] border border-[#1d2640] p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#1d2640] pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                PERFORMANCE DYNAMICS — CUMULATIVE P&L & DRAWDOWN
              </span>
              <span className="text-[10px] text-[#dfff00] font-bold">LIVE_DATA</span>
            </div>

            <div className="h-60 w-full">
              {equityCurve.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 uppercase">
                  NO TRADE HISTORY LOGGED YET
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1d2640" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="entry_time" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(s) => s.slice(5, 10)} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0b0f1d', borderColor: '#1d2640' }} />
                    <Line type="monotone" dataKey="cumulative_pnl" stroke="#dfff00" strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* RECENT TRADES */}
          <div className="bg-[#0b0f1d] border border-[#1d2640] p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#1d2640] pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                RECENT EXECUTION LOG
              </span>
              <Link href="/trades" className="text-xs text-[#dfff00] hover:underline uppercase">
                VIEW FULL TRADE LOG →
              </Link>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1d2640] text-slate-400">
                    <th className="py-2">DATE / TIME</th>
                    <th className="py-2">ASSET</th>
                    <th className="py-2">SIDE</th>
                    <th className="py-2 text-right">SIZE</th>
                    <th className="py-2 text-right">ENTRY</th>
                    <th className="py-2 text-right">EXIT</th>
                    <th className="py-2 text-right">P&L ($)</th>
                    <th className="py-2">STRATEGY</th>
                    <th className="py-2">EMOTION</th>
                    <th className="py-2 text-center">PLAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1d2640]">
                  {trades.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500 uppercase">
                        FETCHING LOG DATA...
                      </td>
                    </tr>
                  ) : (
                    trades.map((row) => {
                      const pnl = Number(row.pnl_currency);
                      const isWin = pnl >= 0;
                      return (
                        <tr key={row.id} onClick={() => router.push(`/trades/${row.id}`)} className="hover:bg-[#13192b] cursor-pointer">
                          <td className="py-2.5 text-slate-400">{row.entry_time?.slice(2, 16).replace('T', ' ')}</td>
                          <td className="py-2.5 font-bold text-white">{row.asset}</td>
                          <td className={`py-2.5 font-bold uppercase ${row.direction === 'long' ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {row.direction}
                          </td>
                          <td className="py-2.5 text-right">{row.position_size}</td>
                          <td className="py-2.5 text-right">{row.entry_price}</td>
                          <td className="py-2.5 text-right">{row.exit_price}</td>
                          <td className="py-2.5 text-right">
                            <span className={`px-2 py-0.5 font-bold ${isWin ? 'bg-[#0a3a2a] text-[#10b981]' : 'bg-[#3a0a0a] text-[#f43f5e]'}`}>
                              {isWin ? `+${pnl.toFixed(2)}` : `-${Math.abs(pnl).toFixed(2)}`}
                            </span>
                          </td>
                          <td className="py-2.5 uppercase">{row.setup_name}</td>
                          <td className="py-2.5 uppercase">{row.emotional_state}</td>
                          <td className="py-2.5 text-center">
                            {row.followed_plan ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline" />}
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
      </div>

      <BottomFooterBar />
    </div>
  );
}
