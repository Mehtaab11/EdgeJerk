'use client';

import React from 'react';

interface TradeGradeDialProps {
  value: number; // 1 to 5
  onChange: (val: number) => void;
}

export function TradeGradeDial({ value, onChange }: TradeGradeDialProps) {
  return (
    <div className="flex gap-2 h-9">
      {[1, 2, 3, 4, 5].map((grade) => {
        const isFilled = grade <= value;
        return (
          <button
            key={grade}
            type="button"
            onClick={() => onChange(grade)}
            className={`flex-1 border transition-colors flex items-center justify-center font-mono text-xs font-bold ${
              isFilled
                ? 'bg-[#dfff00] border-[#dfff00] text-[#0a0f1e]'
                : 'bg-[#111624] border-[#2d3748] text-[#8b949e] hover:border-[#8b949e]'
            }`}
          >
            {grade}
          </button>
        );
      })}
    </div>
  );
}
