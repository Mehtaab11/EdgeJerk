'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

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
      className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1322] hover:border-[#2962ff] transition-all rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group p-3"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="w-full h-full relative flex flex-col items-center justify-center rounded-lg overflow-hidden">
          <img src={previewUrl} alt={`${label} Screenshot`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
            <UploadCloud className="w-5 h-5 text-white" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Change {label} Chart
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-[#2962ff] transition-colors">
            <ImageIcon className="w-4 h-4" />
          </div>
          <span className="font-sans text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#2962ff] transition-colors">
            Upload {label} Chart
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            PNG, JPG up to 10MB
          </span>
        </div>
      )}
    </div>
  );
}
