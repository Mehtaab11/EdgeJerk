'use client';

import React, { useState } from 'react';

interface TagChipSelectProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
}

export function TagChipSelect({
  availableTags,
  selectedTags,
  onChange,
  allowCustom = true,
  placeholder = '+ Add custom tag (press Enter)',
}: TagChipSelectProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customInput.trim()) {
      e.preventDefault();
      const newTag = customInput.trim();
      if (!selectedTags.includes(newTag)) {
        onChange([...selectedTags, newTag]);
      }
      setCustomInput('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-slate-800 border-[#dfff00] text-[#dfff00] font-semibold shadow-sm'
                  : 'bg-[#0d1322] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
        {selectedTags
          .filter((t) => !availableTags.includes(t))
          .map((customTag) => (
            <button
              key={customTag}
              type="button"
              onClick={() => toggleTag(customTag)}
              className="px-3 py-1.5 rounded-lg border bg-slate-800 border-[#dfff00] text-[#dfff00] text-xs font-semibold"
            >
              {customTag} &times;
            </button>
          ))}
      </div>

      {allowCustom && (
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleAddCustom}
          placeholder={placeholder}
          className="form-input text-xs"
        />
      )}
    </div>
  );
}
