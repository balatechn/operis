'use client';
import { useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui';
import { Download, ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export interface ReportColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface ReportPageProps<T> {
  title: string;
  endpoint: string;
  columns: ReportColumn<T>[];
  filterFields?: ReactNode;
  queryParams?: Record<string, string>;
  queryKey: string[];
  exportName?: string;
}

function getNestedValue(obj: any, key: string): any {
  return key.split('.').reduce((o, k) => (o ? o[k] : ''), obj);
}

export function ReportPage<T extends Record<string, any>>({
  title, endpoint, columns, filterFields, queryParams = {}, queryKey, exportName,
}: ReportPageProps<T>) {
  const { data = [], isLoading } = useQuery<T[]>({
    queryKey: [...queryKey, queryParams],
    queryFn: () => api.get(endpoint, { params: queryParams }).then((r) => r.data),
    enabled: true,
  });

  const handleExport = () => {
    if (!data.length) { toast.error('No data to export'); return; }
    const headers = columns.map((c) => c.label).join(',');
    const rows = data.map((row) =>
      columns.map((c) => {
        const val = getNestedValue(row, c.key as string);
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : (val ?? '');
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${exportName || title.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <Button onClick={handleExport} variant="ghost" icon={Download} size="sm">Export CSV</Button>
      </div>

      {/* Filters */}
      {filterFields && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {filterFields}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              {columns.map((col) => (
                <th key={col.key as string} className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">Loading report...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">No data found for the selected filters.</td></tr>
            ) : data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                {columns.map((col) => (
                  <td key={col.key as string} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {col.render ? col.render(row) : getNestedValue(row, col.key as string) ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 text-xs text-gray-400">
            {data.length} records
          </div>
        )}
      </div>
    </div>
  );
}

// Date filter helper component
export function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange }: {
  startDate: string; endDate: string;
  onStartChange: (v: string) => void; onEndChange: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-xs text-gray-500 mb-1">From</label>
        <input type="date" value={startDate} onChange={(e) => onStartChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">To</label>
        <input type="date" value={endDate} onChange={(e) => onEndChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
      </div>
    </>
  );
}
