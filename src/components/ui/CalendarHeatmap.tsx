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
  // Create a map for quick lookup
  const dayMap = new Map<string, HeatmapDay>();
  data.forEach((d) => dayMap.set(d.date, d));

  // Generate last 60 days
  const days: string[] = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="bg-[#111624] border border-[#2d3748] p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">
          DAILY P&L DENSITY (LAST 60 DAYS)
        </span>
        <div className="flex items-center gap-3 font-mono text-[10px] text-[#8b949e]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#40e56c] inline-block"></span> Win Day
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#ff6b6b] inline-block"></span> Loss Day
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#1a1f2f] inline-block"></span> No Trades
          </span>
        </div>
      </div>

      <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 gap-1.5">
        {days.map((dateStr) => {
          const dayData = dayMap.get(dateStr);
          let bgClass = 'bg-[#1a1f2f] border-[#2d3748]';
          let textColor = 'text-[#8b949e]';

          if (dayData && dayData.trade_count > 0) {
            if (dayData.total_pnl > 0) {
              bgClass = 'bg-[#40e56c]/20 border-[#40e56c]';
              textColor = 'text-[#40e56c]';
            } else if (dayData.total_pnl < 0) {
              bgClass = 'bg-[#ff6b6b]/20 border-[#ff6b6b]';
              textColor = 'text-[#ff6b6b]';
            } else {
              bgClass = 'bg-[#dfff00]/20 border-[#dfff00]';
              textColor = 'text-[#dfff00]';
            }
          }

          return (
            <div
              key={dateStr}
              onClick={() => dayData && onDayClick && onDayClick(dateStr)}
              title={`${dateStr}: ${dayData ? `$${dayData.total_pnl} (${dayData.trade_count} trades)` : 'No trades'}`}
              className={`h-9 border p-1 flex flex-col justify-between cursor-pointer hover:border-white transition-colors ${bgClass}`}
            >
              <span className="font-mono text-[9px] text-[#8b949e]">
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
