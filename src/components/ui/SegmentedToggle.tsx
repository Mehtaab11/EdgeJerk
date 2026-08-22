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
    <div className="flex bg-[#0d1322] border border-slate-800 p-1 rounded-xl w-full">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const isLong = opt.value === 'long';
        const isShort = opt.value === 'short';

        let activeStyle = 'bg-[#dfff00] text-black font-bold shadow-md';
        if (isLong && isSelected) activeStyle = 'bg-emerald-500 text-black font-bold shadow-md';
        if (isShort && isSelected) activeStyle = 'bg-rose-500 text-white font-bold shadow-md';

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
              className={`py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                isSelected
                  ? activeStyle
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
