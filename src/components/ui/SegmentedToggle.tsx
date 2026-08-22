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
    <div className="flex border border-[#2d3748] bg-[#111624] w-full">
      {options.map((opt, idx) => {
        const isSelected = value === opt.value;
        const isLong = opt.value === 'long';
        const isShort = opt.value === 'short';

        let activeBg = 'bg-[#dfff00] text-[#0a0f1e]';
        if (isLong && isSelected) activeBg = 'bg-[#40e56c] text-[#0a0f1e]';
        if (isShort && isSelected) activeBg = 'bg-[#ff6b6b] text-[#ffffff]';

        return (
          <label
            key={opt.value}
            className={`flex-1 text-center cursor-pointer ${
              idx > 0 ? 'border-l border-[#2d3748]' : ''
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isSelected}
              onChange={() => onChange(opt.value)}
              className="hidden"
            />
            <div
              className={`py-2 font-sans text-[10px] font-bold tracking-wider uppercase transition-colors ${
                isSelected ? activeBg : 'text-[#8b949e] hover:bg-[#1a1f2f]'
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
