'use client';

import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SegmentedToggleProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  name: string;
}

export function SegmentedToggle({ options, value, onChange, name }: SegmentedToggleProps) {
  return (
    <div className="flex bg-slate-100 dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-1 rounded-lg w-full">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const isLong = opt.value === 'long';
        const isShort = opt.value === 'short';

        let activeStyle = 'bg-white dark:bg-slate-800 text-[#2962ff] dark:text-[#dfff00] font-bold shadow-xs';
        if (isLong && isSelected) activeStyle = 'bg-emerald-600 text-white font-bold shadow-xs';
        if (isShort && isSelected) activeStyle = 'bg-rose-600 text-white font-bold shadow-xs';

        return (
          <label key={opt.value} className="flex-1 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isSelected}
              onChange={() => onChange(opt.value)}
              className="hidden"
            />
            <div
              className={`py-2 text-center text-xs font-semibold rounded-md transition-all ${
                isSelected
                  ? activeStyle
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {opt.label}
            </div>
          </label>
        );
      })}
    </div>
  );
}
