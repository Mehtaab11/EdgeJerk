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
            className={`flex-1 rounded-lg border font-mono text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
              isFilled
                ? 'bg-[#2962ff] hover:bg-[#1e4bd8] border-transparent text-white font-bold'
                : 'bg-white dark:bg-[#0d1322] border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            {grade}
          </button>
        );
      })}
    </div>
  );
}
