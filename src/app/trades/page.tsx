'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { DenseDataTable, ColumnDef } from '@/components/ui/DenseDataTable';
import { useTradeFilterStore } from '@/stores/tradeFilterStore';
import { fetchApi, buildTradeQueryString } from '@/lib/api-client';

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
    {
      key: 'r_multiple',
      header: 'R-MULT',
      render: (row) => `${Number(row.r_multiple).toFixed(2)}R`,
    },
    { key: 'setup_name', header: 'STRATEGY' },
    { key: 'emotional_state', header: 'EMOTION' },
    {
      key: 'followed_plan',
      header: 'COMPLIANCE',
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

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">
            TRADE LOG & HISTORY — {meta ? `${meta.total} RECORDS` : '0 RECORDS'}
          </span>
          <button
            onClick={() => filterStore.resetFilters()}
            className="font-mono text-xs text-[#dfff00] hover:underline"
          >
            RESET FILTERS
          </button>
        </div>

        {/* DENSE FILTER BAR */}
        <div className="bg-[#111624] border border-[#2d3748] p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="form-label">ASSET SEARCH</label>
            <input
              type="text"
              value={filterStore.asset || ''}
              onChange={(e) => filterStore.setFilter('asset', e.target.value)}
              placeholder="e.g. AAPL"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label className="form-label">STRATEGY</label>
            <input
              type="text"
              value={filterStore.setupName || ''}
              onChange={(e) => filterStore.setFilter('setupName', e.target.value)}
              placeholder="Filter setup..."
              className="form-input text-xs"
            />
          </div>
          <div>
            <label className="form-label">DIRECTION</label>
            <select
              value={filterStore.direction || ''}
              onChange={(e) => filterStore.setFilter('direction', e.target.value || undefined)}
              className="form-input text-xs bg-[#111624]"
            >
              <option value="">ALL SIDES</option>
              <option value="long">LONG</option>
              <option value="short">SHORT</option>
            </select>
          </div>
          <div>
            <label className="form-label">EMOTION</label>
            <select
              value={filterStore.emotionalState || ''}
              onChange={(e) => filterStore.setFilter('emotionalState', e.target.value || undefined)}
              className="form-input text-xs bg-[#111624]"
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
            <label className="form-label">START DATE</label>
            <input
              type="date"
              value={filterStore.startDate || ''}
              onChange={(e) => filterStore.setFilter('startDate', e.target.value)}
              className="form-input text-xs"
            />
          </div>
          <div>
            <label className="form-label">END DATE</label>
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
          <div className="flex justify-between items-center font-mono text-xs text-[#8b949e] pt-2">
            <span>
              PAGE {meta.page} OF {meta.totalPages} ({meta.total} TRADES)
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => filterStore.setFilter('page', meta.page - 1)}
                className="px-3 py-1 border border-[#2d3748] disabled:opacity-30 hover:border-white"
              >
                PREV
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => filterStore.setFilter('page', meta.page + 1)}
                className="px-3 py-1 border border-[#2d3748] disabled:opacity-30 hover:border-white"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
