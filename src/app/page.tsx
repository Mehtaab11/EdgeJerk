'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { StatReadout } from '@/components/ui/StatReadout';
import { DenseDataTable, ColumnDef } from '@/components/ui/DenseDataTable';
import { fetchApi } from '@/lib/api-client';
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

  // Compute stat strip metrics
  const totalTrades = trades.length;
  const wins = trades.filter((t) => Number(t.pnl_currency) > 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const netPnl = trades.reduce((sum, t) => sum + Number(t.pnl_currency), 0);
  const avgR =
    totalTrades > 0
      ? (trades.reduce((sum, t) => sum + Number(t.r_multiple), 0) / totalTrades).toFixed(2)
      : '0.00';

  // Compute current win/loss streak
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
      render: (row) => row.entry_time.replace('T', ' ').slice(0, 16),
    },
    { key: 'asset', header: 'ASSET', render: (row) => <span className="font-bold">{row.asset}</span> },
    {
      key: 'direction',
      header: 'SIDE',
      render: (row) => (
        <span
          className={`font-bold uppercase ${
            row.direction === 'long' ? 'text-[#40e56c]' : 'text-[#ff6b6b]'
          }`}
        >
          {row.direction}
        </span>
      ),
    },
    { key: 'position_size', header: 'SIZE' },
    { key: 'entry_price', header: 'ENTRY', render: (row) => `$${row.entry_price}` },
    { key: 'exit_price', header: 'EXIT', render: (row) => `$${row.exit_price}` },
    {
      key: 'pnl_currency',
      header: 'P&L ($)',
      render: (row) => {
        const pnl = Number(row.pnl_currency);
        return (
          <span
            className={`font-bold ${
              pnl >= 0 ? 'text-[#40e56c] bg-[#40e56c]/10 px-2 py-0.5' : 'text-[#ff6b6b] bg-[#ff6b6b]/10 px-2 py-0.5'
            }`}
          >
            {pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
          </span>
        );
      },
    },
    { key: 'setup_name', header: 'STRATEGY' },
    { key: 'emotional_state', header: 'EMOTION' },
    {
      key: 'followed_plan',
      header: 'PLAN',
      render: (row) => (
        <span className={row.followed_plan ? 'text-[#40e56c]' : 'text-[#ff6b6b]'}>
          {row.followed_plan ? 'FOLLOWED' : 'BROKE'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <NavigationHeader />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* COMPACT NUMERIC STAT STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <StatReadout
            label="NET P&L"
            value={`${netPnl >= 0 ? '+' : ''}$${netPnl.toFixed(2)}`}
            type={netPnl >= 0 ? 'positive' : 'negative'}
          />
          <StatReadout
            label="WIN RATE"
            value={`${winRate}%`}
            subValue={`${wins}/${totalTrades} WINS`}
            type="accent"
          />
          <StatReadout label="AVG R-MULTIPLE" value={`${avgR}R`} type="neutral" />
          <StatReadout label="TOTAL TRADES" value={totalTrades} type="neutral" />
          <StatReadout
            label="STREAK"
            value={streak >= 0 ? `+${streak} W` : `${streak} L`}
            type={streak >= 0 ? 'positive' : 'negative'}
          />
        </div>

        {/* FULL-WIDTH EQUITY CURVE WITH DRAWDOWN SHADING */}
        <div className="bg-[#111624] border border-[#2d3748] p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">
              PERFORMANCE DYNAMICS — CUMULATIVE P&L & DRAWDOWN
            </span>
            <span className="font-mono text-xs text-[#dfff00]">LIVE_DATA</span>
          </div>

          <div className="h-64 w-full">
            {equityCurve.length === 0 ? (
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#8b949e]">
                NO TRADE HISTORY LOGGED YET
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#2d3748" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="entry_time" tick={{ fill: '#8b949e', fontSize: 10 }} tickFormatter={(str) => str.slice(5, 10)} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748', color: '#fff' }} />
                  <Area type="monotone" dataKey="cumulative_pnl" fill="#dfff00" fillOpacity={0.1} stroke="none" />
                  <Line type="monotone" dataKey="cumulative_pnl" stroke="#dfff00" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SECONDARY CHARTS - ASYMMETRIC LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Strategy Edge P&L */}
          <div className="md:col-span-7 bg-[#111624] border border-[#2d3748] p-4">
            <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block mb-4">
              P&L BY STRATEGY
            </span>
            <div className="h-48 w-full">
              {expectancy.length === 0 ? (
                <div className="h-full flex items-center justify-center font-mono text-xs text-[#8b949e]">
                  NO DATA
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expectancy} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                    <CartesianGrid stroke="#2d3748" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <YAxis dataKey="setup_name" type="category" tick={{ fill: '#e5e7eb', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                    <Bar dataKey="total_pnl" fill="#40e56c" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Session Breakdown */}
          <div className="md:col-span-5 bg-[#111624] border border-[#2d3748] p-4">
            <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block mb-4">
              WIN RATE BY SESSION
            </span>
            <div className="h-48 w-full">
              {sessions.length === 0 ? (
                <div className="h-full flex items-center justify-center font-mono text-xs text-[#8b949e]">
                  NO DATA
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessions} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#2d3748" vertical={false} />
                    <XAxis dataKey="session" tick={{ fill: '#e5e7eb', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#111624', borderColor: '#2d3748' }} />
                    <Bar dataKey="win_rate_percent" fill="#dfff00" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* RECENT TRADES TABLE */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">
              RECENT EXECUTION LOG
            </span>
            <Link href="/trades" className="font-mono text-xs text-[#dfff00] hover:underline">
              VIEW FULL TRADE LOG →
            </Link>
          </div>

          <DenseDataTable columns={columns} data={trades} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
