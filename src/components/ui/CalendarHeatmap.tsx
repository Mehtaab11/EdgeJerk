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
    <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
          Daily P&L Density (Last 60 Days)
        </span>
        <div className="flex items-center gap-4 font-mono text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span> Profit Day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span> Loss Day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block"></span> No Activity
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
        {days.map((dateStr) => {
          const dayData = dayMap.get(dateStr);
          let bgClass = 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700';
          let textColor = 'text-slate-500';

          if (dayData && dayData.trade_count > 0) {
            if (dayData.total_pnl > 0) {
              bgClass = 'bg-emerald-500/15 border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
              textColor = 'text-emerald-400';
            } else if (dayData.total_pnl < 0) {
              bgClass = 'bg-rose-500/15 border-rose-500/50 hover:border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
              textColor = 'text-rose-400';
            } else {
              bgClass = 'bg-[#dfff00]/15 border-[#dfff00]/50 hover:border-[#dfff00]';
              textColor = 'text-[#dfff00]';
            }
          }

          return (
            <div
              key={dateStr}
              onClick={() => dayData && onDayClick && onDayClick(dateStr)}
              title={`${dateStr}: ${dayData ? `$${dayData.total_pnl} (${dayData.trade_count} trades)` : 'No trades'}`}
              className={`h-10 rounded-lg border p-1.5 flex flex-col justify-between cursor-pointer transition-all ${bgClass}`}
            >
              <span className="font-mono text-[9px] text-slate-500">
                {dateStr.slice(5)}
              </span>
              {dayData && dayData.trade_count > 0 && (
                <span className={`font-mono text-[10px] font-bold ${textColor}`}>
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
