'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatReadoutProps {
  label: string;
  value: string | number;
  subValue?: string;
  type?: 'positive' | 'negative' | 'neutral' | 'accent';
  icon?: LucideIcon;
}

export function StatReadout({ label, value, subValue, type = 'neutral', icon: Icon }: StatReadoutProps) {
  let valueColor = 'text-slate-900 dark:text-slate-100';
  let badgeBg = 'bg-white dark:bg-[#0d1322] border-slate-200 dark:border-slate-800';

  if (type === 'positive') {
    valueColor = 'text-emerald-600 dark:text-emerald-400';
    badgeBg = 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30';
  } else if (type === 'negative') {
    valueColor = 'text-rose-600 dark:text-rose-400';
    badgeBg = 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20 dark:border-rose-500/30';
  } else if (type === 'accent') {
    valueColor = 'text-[#2962ff] dark:text-[#dfff00]';
    badgeBg = 'bg-blue-500/5 dark:bg-[#dfff00]/10 border-blue-500/20 dark:border-[#dfff00]/30';
  }

  return (
    <div className={`p-4 rounded-xl border ${badgeBg} transition-all flex flex-col justify-between shadow-xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {Icon && <Icon className={`w-4 h-4 ${valueColor} opacity-80`} />}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono text-xl md:text-2xl font-bold tracking-tight tabular-nums ${valueColor}`}>
          {value}
        </span>
        {subValue && (
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
