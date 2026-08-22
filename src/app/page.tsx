'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { StatReadout } from '@/components/ui/StatReadout';
import { DenseDataTable, ColumnDef } from '@/components/ui/DenseDataTable';
import { fetchApi } from '@/lib/api-client';
import { DollarSign, Percent, TrendingUp, Hash, Award, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
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

  const columns: ColumnDef<any>[] = [
    {
      key: 'entry_time',
      header: 'DATE / TIME',
      render: (row) => (
        <span className="text-slate-400 font-mono">
          {row.entry_time.replace('T', ' ').slice(0, 16)}
        </span>
      ),
    },
    {
      key: 'asset',
      header: 'ASSET',
      render: (row) => <span className="font-bold font-mono text-white text-sm">{row.asset}</span>,
    },
    {
      key: 'direction',
      header: 'SIDE',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 font-mono text-xs font-bold uppercase px-2 py-0.5 rounded ${
            row.direction === 'long'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          {row.direction === 'long' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {row.direction}
        </span>
      ),
    },
    { key: 'position_size', header: 'SIZE', render: (row) => <span className="font-mono text-slate-300">{row.position_size}</span> },
    { key: 'entry_price', header: 'ENTRY', render: (row) => <span className="font-mono text-slate-300">${row.entry_price}</span> },
    { key: 'exit_price', header: 'EXIT', render: (row) => <span className="font-mono text-slate-300">${row.exit_price}</span> },
    {
      key: 'pnl_currency',
      header: 'P&L ($)',
      render: (row) => {
        const pnl = Number(row.pnl_currency);
        return (
          <span
            className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md border ${
              pnl >= 0
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
            }`}
          >
            {pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
          </span>
        );
      },
    },
    {
      key: 'setup_name',
      header: 'STRATEGY',
      render: (row) => (
        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs">
          {row.setup_name}
        </span>
      ),
    },
    { key: 'emotional_state', header: 'EMOTION', render: (row) => <span className="text-slate-400 text-xs">{row.emotional_state}</span> },
    {
      key: 'followed_plan',
      header: 'PLAN',
      render: (row) => (
        <span
          className={`font-mono text-xs font-semibold ${
            row.followed_plan ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {row.followed_plan ? '✓ FOLLOWED' : '✗ BROKE'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070a12]">
      <NavigationHeader />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* COMPACT NUMERIC STAT STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <StatReadout
            label="NET P&L"
            value={`${netPnl >= 0 ? '+' : ''}$${netPnl.toFixed(2)}`}
            type={netPnl >= 0 ? 'positive' : 'negative'}
            icon={DollarSign}
          />
          <StatReadout
            label="WIN RATE"
            value={`${winRate}%`}
            subValue={`${wins}/${totalTrades} W`}
            type="accent"
            icon={Percent}
          />
          <StatReadout label="AVG R-MULTIPLE" value={`${avgR}R`} type="neutral" icon={TrendingUp} />
          <StatReadout label="TOTAL TRADES" value={totalTrades} type="neutral" icon={Hash} />
          <StatReadout
            label="WIN STREAK"
            value={streak >= 0 ? `+${streak} W` : `${streak} L`}
            type={streak >= 0 ? 'positive' : 'negative'}
            icon={Award}
          />
        </div>

        {/* FULL-WIDTH EQUITY CURVE WITH DRAWDOWN SHADING */}
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#dfff00]" />
              <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
                Performance Dynamics — Cumulative P&L & Equity Growth
              </span>
            </div>
            <span className="font-mono text-xs text-[#dfff00] bg-[#dfff00]/10 border border-[#dfff00]/30 px-2 py-0.5 rounded">
              LIVE_FEED
            </span>
          </div>

          <div className="h-72 w-full">
            {equityCurve.length === 0 ? (
              <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
                No trade history logged yet. Click "+ Log Trade" to record your first trade.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dfff00" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#dfff00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="entry_time" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(s) => s.slice(5, 10)} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="cumulative_pnl" fill="url(#equityGrad)" stroke="none" />
                  <Line type="monotone" dataKey="cumulative_pnl" stroke="#dfff00" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SECONDARY CHARTS - ASYMMETRIC LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Strategy Edge P&L */}
          <div className="md:col-span-7 bg-[#0d1322] border border-slate-800/80 rounded-xl p-6 shadow-xl">
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
              P&L Distribution by Strategy
            </span>
            <div className="h-56 w-full">
              {expectancy.length === 0 ? (
                <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
                  No strategy data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expectancy} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="setup_name" type="category" tick={{ fill: '#f8fafc', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="total_pnl" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Session Breakdown */}
          <div className="md:col-span-5 bg-[#0d1322] border border-slate-800/80 rounded-xl p-6 shadow-xl">
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
              Win Rate % by Session
            </span>
            <div className="h-56 w-full">
              {sessions.length === 0 ? (
                <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
                  No session data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessions} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="session" tick={{ fill: '#f8fafc', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="win_rate_percent" fill="#dfff00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* RECENT TRADES TABLE */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recent Execution Log
            </span>
            <Link href="/trades" className="font-mono text-xs text-[#dfff00] hover:underline flex items-center gap-1">
              <span>View Full Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DenseDataTable columns={columns} data={trades} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
