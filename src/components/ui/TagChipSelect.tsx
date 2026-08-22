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
  placeholder = 'Add new tag...',
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 border font-mono text-xs transition-colors ${
                isSelected
                  ? 'bg-[#1a1f2f] border-[#dfff00] text-[#ffffff] font-bold'
                  : 'bg-[#111624] border-[#2d3748] text-[#8b949e] hover:border-[#8b949e]'
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
              className="px-3 py-1 border bg-[#1a1f2f] border-[#dfff00] text-[#ffffff] font-mono text-xs font-bold"
            >
              {customTag} [x]
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
