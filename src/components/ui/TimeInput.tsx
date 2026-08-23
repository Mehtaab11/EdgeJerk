'use client';

import React, { useState, useEffect } from 'react';

interface TimeInputProps {
  value: string; // "HH:MM" in 24-hour format
  onChange: (val: string) => void;
  className?: string;
  hasError?: boolean;
}

export function TimeInput({ value, onChange, className = '', hasError = false }: TimeInputProps) {
  const [internalVal, setInternalVal] = useState(value || '09:30');

  useEffect(() => {
    if (value !== undefined) {
      setInternalVal(value);
    }
  }, [value]);

  const formatAndValidate = (input: string) => {
    // Remove non-digits and non-colons
    let clean = input.replace(/[^0-9:]/g, '');

    // Auto-insert colon after 2 digits if typed without colon
    if (clean.length === 2 && !clean.includes(':')) {
      clean = clean + ':';
    }

    if (clean.length > 5) {
      clean = clean.slice(0, 5);
    }

    setInternalVal(clean);

    // If matches complete HH:MM, validate hours 0-23 and mins 0-59
    if (/^\d{2}:\d{2}$/.test(clean)) {
      const [h, m] = clean.split(':').map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        onChange(clean);
      }
    }
  };

  const handleBlur = () => {
    let clean = internalVal.trim();
    if (!clean) {
      onChange('09:30');
      setInternalVal('09:30');
      return;
    }

    // Handle single hour digit e.g. "9:30" -> "09:30"
    if (/^\d:\d{2}$/.test(clean)) {
      clean = '0' + clean;
    }

    // Handle 4 digits without colon e.g. "0930" -> "09:30"
    if (/^\d{4}$/.test(clean)) {
      clean = clean.slice(0, 2) + ':' + clean.slice(2, 4);
    }

    if (/^\d{2}:\d{2}$/.test(clean)) {
      let [h, m] = clean.split(':').map(Number);
      h = Math.min(23, Math.max(0, h));
      m = Math.min(59, Math.max(0, m));
      const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      setInternalVal(formatted);
      onChange(formatted);
    } else {
      // Fallback to default
      setInternalVal(value || '09:30');
      onChange(value || '09:30');
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={internalVal}
      onChange={(e) => formatAndValidate(e.target.value)}
      onBlur={handleBlur}
      placeholder="HH:MM"
      maxLength={5}
      className={`form-input font-mono text-center tracking-wider ${
        hasError
          ? 'border-rose-500 text-rose-500 focus:border-rose-500'
          : ''
      } ${className}`}
    />
  );
}
