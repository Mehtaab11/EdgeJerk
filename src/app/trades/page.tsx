'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { DenseDataTable, ColumnDef } from '@/components/ui/DenseDataTable';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { fetchApi, buildTradeQueryString } from '@/lib/api-client';
import { Filter, RotateCcw, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TradeLogPage() {
  const router = useRouter();
  const filterStore = useTradeFilterStore();
  const [trades, setTrades] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrades() {
      setIsLoading(true);
      const queryStr = buildTradeQueryString(filterStore);
      const res = await fetchApi(`/api/trades${queryStr}`);
      if (res.success) {
        setTrades(res.data || []);
        setMeta(res.meta || null);
      }
      setIsLoading(false);
    }

    loadTrades();
  }, [
    filterStore.startDate,
    filterStore.endDate,
    filterStore.asset,
    filterStore.setupName,
    filterStore.direction,
    filterStore.emotionalState,
    filterStore.mistakeTagId,
    filterStore.session,
    filterStore.exitReason,
    filterStore.page,
  ]);

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
      key: 'r_multiple',
      header: 'R-MULT',
      render: (row) => (
        <span className="font-mono text-xs text-[#dfff00]">
          {Number(row.r_multiple).toFixed(2)}R
        </span>
      ),
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
      header: 'COMPLIANCE',
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

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#dfff00]" />
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trade Execution Log — {meta ? `${meta.total} Total Records` : '0 Records'}
            </span>
          </div>
          <button
            onClick={() => filterStore.resetFilters()}
            className="flex items-center gap-1.5 font-mono text-xs text-[#dfff00] hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* DENSE FILTER BAR */}
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 shadow-xl">
          <div>
            <label className="form-label">Asset Ticker</label>
            <input
              type="text"
              value={filterStore.asset || ''}
              onChange={(e) => filterStore.setFilter('asset', e.target.value)}
              placeholder="e.g. AAPL"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label className="form-label">Strategy</label>
            <input
              type="text"
              value={filterStore.setupName || ''}
              onChange={(e) => filterStore.setFilter('setupName', e.target.value)}
              placeholder="Filter setup..."
              className="form-input text-xs"
            />
          </div>
          <div>
            <label className="form-label">Direction</label>
            <select
              value={filterStore.direction || ''}
              onChange={(e) => filterStore.setFilter('direction', e.target.value || undefined)}
              className="form-input text-xs bg-slate-900"
            >
              <option value="">ALL SIDES</option>
              <option value="long">LONG</option>
              <option value="short">SHORT</option>
            </select>
          </div>
          <div>
            <label className="form-label">Emotion</label>
            <select
              value={filterStore.emotionalState || ''}
              onChange={(e) => filterStore.setFilter('emotionalState', e.target.value || undefined)}
              className="form-input text-xs bg-slate-900"
            >
              <option value="">ALL EMOTIONS</option>
              <option value="Confident">Confident</option>
              <option value="Calm">Calm</option>
              <option value="Bored">Bored</option>
              <option value="Hesitant">Hesitant</option>
              <option value="Anxious">Anxious</option>
              <option value="FOMO">FOMO</option>
              <option value="Revenge">Revenge</option>
            </select>
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={filterStore.startDate || ''}
              onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
              className="form-input text-xs"
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={filterStore.endDate || ''}
              onChange={(e) => filterStore.setFilter('endDate', e.target.value)}
              className="form-input text-xs"
            />
          </div>
        </div>

        {/* DENSE DATA TABLE */}
        <DenseDataTable
          columns={columns}
          data={trades}
          isLoading={isLoading}
          onRowClick={(row) => router.push(`/trades/${row.id}`)}
        />

        {/* PAGINATION CONTROLS */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center font-mono text-xs text-slate-400 pt-2">
            <span>
              PAGE {meta.page} OF {meta.totalPages} ({meta.total} TRADES)
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => filterStore.setFilter('page', meta.page - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0d1322] disabled:opacity-30 hover:border-slate-700 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PREV</span>
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => filterStore.setFilter('page', meta.page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0d1322] disabled:opacity-30 hover:border-slate-700 flex items-center gap-1"
              >
                <span>NEXT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
