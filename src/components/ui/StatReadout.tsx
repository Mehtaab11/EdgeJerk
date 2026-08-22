'use client';

import React from 'react';

interface StatReadoutProps {
  label: string;
  value: string | number;
  subValue?: string;
  type?: 'positive' | 'negative' | 'neutral' | 'accent';
}

export function StatReadout({ label, value, subValue, type = 'neutral' }: StatReadoutProps) {
  let valueColor = 'text-[#e5e7eb]';
  if (type === 'positive') valueColor = 'text-[#40e56c]';
  if (type === 'negative') valueColor = 'text-[#ff6b6b]';
  if (type === 'accent') valueColor = 'text-[#dfff00]';

  return (
    <div className="bg-[#111624] border border-[#2d3748] p-3 flex flex-col justify-between">
      <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono text-lg font-bold tabular-nums ${valueColor}`}>
          {value}
        </span>
        {subValue && (
          <span className="font-mono text-xs text-[#8b949e] tabular-nums">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
