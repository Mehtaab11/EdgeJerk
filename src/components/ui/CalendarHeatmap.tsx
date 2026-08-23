'use client';

import React, { useState } from 'react';

interface HeatmapDay {
  date: string;
  total_pnl: number;
  trade_count: number;
  win_count: number;
  is_profitable: boolean;
}

interface CalendarHeatmapProps {
  data: HeatmapDay[];
  onDayClick?: (date: string) => void;
}

export function CalendarHeatmap({ data, onDayClick }: CalendarHeatmapProps) {
  const [periodDays, setPeriodDays] = useState<7 | 30 | 60>(60);
  const dayMap = new Map<string, HeatmapDay>();
  data.forEach((d) => dayMap.set(d.date, d));

  const days: string[] = [];
  const today = new Date();
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Calculate summary stats for the active period
  let periodPnl = 0;
  let periodTrades = 0;
  let periodWinDays = 0;
  let periodLossDays = 0;

  days.forEach((dStr) => {
    const d = dayMap.get(dStr);
    if (d && d.trade_count > 0) {
      periodPnl += d.total_pnl;
      periodTrades += d.trade_count;
      if (d.total_pnl > 0) periodWinDays++;
      else if (d.total_pnl < 0) periodLossDays++;
    }
  });

  return (
    <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4">
      {/* HEADER & PERIOD FILTER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
            Daily P&L Density ({periodDays} Days)
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            <span>
              Net:{' '}
              <strong className={periodPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {periodPnl >= 0 ? `+$${periodPnl.toFixed(2)}` : `-$${Math.abs(periodPnl).toFixed(2)}`}
              </strong>
            </span>
            <span>•</span>
            <span>
              Trades: <strong className="text-slate-700 dark:text-slate-200">{periodTrades}</strong>
            </span>
            <span>•</span>
            <span>
              Win Days: <strong className="text-emerald-600 dark:text-emerald-400">{periodWinDays}</strong>
              {periodLossDays > 0 && <span className="text-slate-400"> / {periodLossDays} loss</span>}
            </span>
          </div>
        </div>

        {/* CONTROLS: PERIOD TOGGLE + LEGEND */}
        <div className="flex flex-wrap items-center gap-4">
          {/* PERIOD TOGGLE (7D / 30D / 60D) */}
          <div className="flex bg-slate-100 dark:bg-[#070a14] border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[
              { label: '7D', val: 7 as const },
              { label: '30D', val: 30 as const },
              { label: '60D', val: 60 as const },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setPeriodDays(p.val)}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                  periodDays === p.val
                    ? 'bg-white dark:bg-slate-800 text-[#2962ff] dark:text-[#388bfd] font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* LEGEND */}
          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Profit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Loss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-800 inline-block"></span> No Trades
            </span>
          </div>
        </div>
      </div>

      {/* HEATMAP GRID */}
      <div
        className={`grid gap-2 ${
          periodDays === 7
            ? 'grid-cols-7'
            : periodDays === 30
            ? 'grid-cols-5 sm:grid-cols-6 md:grid-cols-10'
            : 'grid-cols-6 sm:grid-cols-10 md:grid-cols-12'
        }`}
      >
        {days.map((dateStr) => {
          const dayData = dayMap.get(dateStr);
          let bgClass = 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700';
          let textColor = 'text-slate-400';

          if (dayData && dayData.trade_count > 0) {
            if (dayData.total_pnl > 0) {
              bgClass = 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500';
              textColor = 'text-emerald-600 dark:text-emerald-400';
            } else if (dayData.total_pnl < 0) {
              bgClass = 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500';
              textColor = 'text-rose-600 dark:text-rose-400';
            } else {
              bgClass = 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500';
              textColor = 'text-[#2962ff] dark:text-[#388bfd]';
            }
          }

          return (
            <div
              key={dateStr}
              onClick={() => dayData && onDayClick && onDayClick(dateStr)}
              title={`${dateStr}: ${dayData ? `$${dayData.total_pnl} (${dayData.trade_count} trades)` : 'No trades'}`}
              className={`rounded-lg border p-1.5 flex flex-col justify-between cursor-pointer transition-all ${
                periodDays === 7 ? 'h-16' : 'h-11'
              } ${bgClass}`}
            >
              <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">
                {dateStr.slice(5)}
              </span>
              {dayData && dayData.trade_count > 0 && (
                <span className={`font-mono ${periodDays === 7 ? 'text-xs' : 'text-[10px]'} font-bold truncate ${textColor}`}>
                  {dayData.total_pnl >= 0 ? `+$${dayData.total_pnl}` : `-$${Math.abs(dayData.total_pnl)}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
