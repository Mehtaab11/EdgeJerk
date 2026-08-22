'use client';

import React from 'react';
import { EmotionalState } from '@/types/database.types';

interface EmotionSelectProps {
  value: EmotionalState;
  onChange: (val: EmotionalState) => void;
}

const EMOTIONS: { state: EmotionalState; label: string; color: string }[] = [
  { state: 'Confident', label: 'Confident', color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
  { state: 'Calm', label: 'Calm', color: 'border-teal-500/50 text-teal-400 bg-teal-500/10' },
  { state: 'Bored', label: 'Bored', color: 'border-slate-500/50 text-slate-300 bg-slate-500/10' },
  { state: 'Hesitant', label: 'Hesitant', color: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
  { state: 'Anxious', label: 'Anxious', color: 'border-orange-500/50 text-orange-400 bg-orange-500/10' },
  { state: 'FOMO', label: 'FOMO', color: 'border-rose-500/50 text-rose-400 bg-rose-500/10' },
  { state: 'Revenge', label: 'Revenge', color: 'border-red-600/50 text-red-400 bg-red-600/10' },
];

export function EmotionSelect({ value, onChange }: EmotionSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {EMOTIONS.map((item) => {
        const isSelected = value === item.state;
        return (
          <button
            key={item.state}
            type="button"
            onClick={() => onChange(item.state)}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isSelected
                ? `${item.color} font-bold ring-2 ring-slate-400/30 scale-105`
                : 'border-slate-800 text-slate-400 bg-[#0d1322] hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
