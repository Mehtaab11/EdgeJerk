'use client';

import React from 'react';
import { EmotionalState } from '@/types/database.types';

interface EmotionSelectProps {
  value: EmotionalState;
  onChange: (val: EmotionalState) => void;
}

const EMOTIONS: { state: EmotionalState; label: string; darkColor: string; lightColor: string }[] = [
  { state: 'Confident', label: 'Confident', darkColor: 'border-emerald-500 text-emerald-400 bg-emerald-500/10', lightColor: 'border-emerald-600 text-emerald-700 bg-emerald-50' },
  { state: 'Calm', label: 'Calm', darkColor: 'border-teal-500 text-teal-400 bg-teal-500/10', lightColor: 'border-teal-600 text-teal-700 bg-teal-50' },
  { state: 'Bored', label: 'Bored', darkColor: 'border-slate-500 text-slate-300 bg-slate-500/10', lightColor: 'border-slate-400 text-slate-700 bg-slate-100' },
  { state: 'Hesitant', label: 'Hesitant', darkColor: 'border-amber-500 text-amber-400 bg-amber-500/10', lightColor: 'border-amber-600 text-amber-700 bg-amber-50' },
  { state: 'Anxious', label: 'Anxious', darkColor: 'border-orange-500 text-orange-400 bg-orange-500/10', lightColor: 'border-orange-600 text-orange-700 bg-orange-50' },
  { state: 'FOMO', label: 'FOMO', darkColor: 'border-rose-500 text-rose-400 bg-rose-500/10', lightColor: 'border-rose-600 text-rose-700 bg-rose-50' },
  { state: 'Revenge', label: 'Revenge', darkColor: 'border-red-600 text-red-400 bg-red-600/10', lightColor: 'border-red-600 text-red-700 bg-red-50' },
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
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isSelected
                ? 'font-bold border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-[#0d1322] hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
