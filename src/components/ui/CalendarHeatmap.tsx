'use client';

import React from 'react';

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
  const dayMap = new Map<string, HeatmapDay>();
  data.forEach((d) => dayMap.set(d.date, d));

  const days: string[] = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
          Daily P&L (Last 60 Days)
        </span>
        <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
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

      <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
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
              className={`h-11 rounded-lg border p-1.5 flex flex-col justify-between cursor-pointer transition-all ${bgClass}`}
            >
              <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">
                {dateStr.slice(5)}
              </span>
              {dayData && dayData.trade_count > 0 && (
                <span className={`font-mono text-[10px] font-bold truncate ${textColor}`}>
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
