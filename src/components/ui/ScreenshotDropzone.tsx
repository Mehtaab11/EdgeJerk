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
      className="border-2 border-dashed border-slate-800 bg-[#0d1322] hover:border-[#dfff00]/60 transition-all rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group p-3 shadow-inner"
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
          <div className="absolute inset-0 bg-[#070a12]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
            <UploadCloud className="w-5 h-5 text-[#dfff00]" />
            <span className="font-mono text-xs font-bold text-[#dfff00] uppercase tracking-wider">
              Change {label} Chart
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="w-9 h-9 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-[#dfff00] group-hover:border-[#dfff00]/40 transition-colors">
            <ImageIcon className="w-4 h-4" />
          </div>
          <span className="font-sans text-xs font-medium text-slate-300 group-hover:text-[#dfff00] transition-colors">
            Upload {label} Chart
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            PNG, JPG up to 10MB
          </span>
        </div>
      )}
    </div>
  );
}
