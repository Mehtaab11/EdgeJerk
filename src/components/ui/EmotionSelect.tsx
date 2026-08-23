'use client';

import React from 'react';

interface EmotionSelectProps {
  value: string[]; // multi-select array of emotional states
  onChange: (val: string[]) => void;
}

const ALL_EMOTIONS = [
  { state: 'Calm', category: 'positive' },
  { state: 'Confident', category: 'positive' },
  { state: 'Disciplined', category: 'positive' },
  { state: 'Excited', category: 'positive' },
  { state: 'Relieved', category: 'positive' },
  { state: 'Hesitant', category: 'caution' },
  { state: 'Doubtful', category: 'caution' },
  { state: 'Impatient', category: 'caution' },
  { state: 'Nervous', category: 'caution' },
  { state: 'Anxious', category: 'caution' },
  { state: 'Bored', category: 'neutral' },
  { state: 'FOMO', category: 'negative' },
  { state: 'Frustrated', category: 'negative' },
  { state: 'Overconfident', category: 'negative' },
  { state: 'Revenge', category: 'negative' },
];

export function EmotionSelect({ value = [], onChange }: EmotionSelectProps) {
  const selectedList = Array.isArray(value) ? value : value ? [value] : [];

  const toggleEmotion = (emotion: string) => {
    if (selectedList.includes(emotion)) {
      onChange(selectedList.filter((e) => e !== emotion));
    } else {
      onChange([...selectedList, emotion]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {ALL_EMOTIONS.map((item) => {
          const isSelected = selectedList.includes(item.state);
          return (
            <button
              key={item.state}
              type="button"
              onClick={() => toggleEmotion(item.state)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-[#2962ff] text-[#2962ff] dark:text-[#388bfd] font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#0d1322] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isSelected ? `✓ ${item.state}` : item.state}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        Select all that apply to your mindset during this trade
      </p>
    </div>
  );
}
