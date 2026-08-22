'use client';

import React from 'react';
import Link from 'next/link';

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
  emptyText = 'NO RECORDS FOUND',
}: DenseDataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto border border-[#2d3748] bg-[#0a0f1e]">
      <table className="w-full text-left border-collapse font-mono text-xs">
        <thead>
          <tr className="bg-[#111624] border-b border-[#2d3748]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-2.5 px-3 font-sans text-[10px] font-bold tracking-wider text-[#8b949e] uppercase select-none"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2d3748]">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-[#8b949e] font-sans text-xs">
                FETCHING LOG DATA...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-[#8b949e] font-sans text-xs uppercase">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-[#1a1f2f] transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-2 px-3 text-[#e5e7eb] whitespace-nowrap">
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
