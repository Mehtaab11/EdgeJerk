'use client';

import React from 'react';
import { EmotionalState } from '@/types/database.types';

interface EmotionSelectProps {
  value: EmotionalState;
  onChange: (val: EmotionalState) => void;
}

const EMOTIONS: { state: EmotionalState; label: string; color: string }[] = [
  { state: 'Confident', label: 'Confident', color: 'border-[#40e56c] text-[#40e56c]' },
  { state: 'Calm', label: 'Calm', color: 'border-[#3ce36a] text-[#3ce36a]' },
  { state: 'Bored', label: 'Bored', color: 'border-[#8b949e] text-[#8b949e]' },
  { state: 'Hesitant', label: 'Hesitant', color: 'border-[#ffb4a2] text-[#ffb4a2]' },
  { state: 'Anxious', label: 'Anxious', color: 'border-[#ff897d] text-[#ff897d]' },
  { state: 'FOMO', label: 'FOMO', color: 'border-[#ff6b6b] text-[#ff6b6b]' },
  { state: 'Revenge', label: 'Revenge', color: 'border-[#ff4d4d] text-[#ff4d4d]' },
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
            className={`px-3 py-1.5 border font-mono text-xs transition-colors ${
              isSelected
                ? `${item.color} bg-[#1a1f2f] font-bold border-2`
                : 'border-[#2d3748] text-[#8b949e] bg-[#111624] hover:border-[#8b949e]'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
