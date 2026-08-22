'use client';

import React from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DenseDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyText?: string;
}

export function DenseDataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyText = 'No trade records logged yet',
}: DenseDataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto border border-slate-800/80 bg-[#0d1322] rounded-xl shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#090e1a] border-b border-slate-800 text-slate-400">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-3 px-4 font-sans text-[10px] font-bold tracking-wider uppercase select-none"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-500 font-sans text-xs">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#dfff00] animate-ping"></span>
                  <span>Fetching trade records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-500 font-sans text-xs uppercase tracking-wider">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-slate-800/40 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-slate-200 whitespace-nowrap">
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
