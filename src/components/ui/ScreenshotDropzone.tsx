'use client';

import React, { useRef, useState } from 'react';

interface ScreenshotDropzoneProps {
  label: 'BEFORE' | 'AFTER';
  existingUrl?: string;
  onFileSelect: (file: File) => void;
}

export function ScreenshotDropzone({ label, existingUrl, onFileSelect }: ScreenshotDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className="border border-dashed border-[#2d3748] bg-[#111624] hover:border-[#dfff00] transition-colors h-32 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group p-2"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="w-full h-full relative flex flex-col items-center justify-center">
          <img src={previewUrl} alt={`${label} Screenshot`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0a0f1e]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
            <span className="font-sans text-[10px] font-bold text-[#dfff00] uppercase tracking-wider">
              CHANGE {label} CHART
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-xs text-[#8b949e] group-hover:text-[#dfff00] mb-1">
            + UPLOAD IMAGE
          </span>
          <span className="font-sans text-[9px] font-bold text-[#8b949e] uppercase tracking-wider">
            {label} EVIDENCE
          </span>
        </div>
      )}
    </div>
  );
}
