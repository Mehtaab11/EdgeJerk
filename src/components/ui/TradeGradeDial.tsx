'use client';

import React from 'react';

interface TradeGradeDialProps {
  value: number; // 1 to 5
  onChange: (val: number) => void;
}

export function TradeGradeDial({ value, onChange }: TradeGradeDialProps) {
  return (
    <div className="flex gap-2 h-10">
      {[1, 2, 3, 4, 5].map((grade) => {
        const isFilled = grade <= value;
        return (
          <button
            key={grade}
            type="button"
            onClick={() => onChange(grade)}
            className={`flex-1 rounded-lg border font-mono text-sm font-bold transition-all flex items-center justify-center ${
              isFilled
                ? 'bg-[#dfff00] border-[#dfff00] text-black shadow-[0_0_10px_rgba(223,255,0,0.2)]'
                : 'bg-[#0d1322] border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            {grade}
          </button>
        );
      })}
    </div>
  );
}
