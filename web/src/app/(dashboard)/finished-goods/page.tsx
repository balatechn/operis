'use client';
import { useQuery } from '@tanstack/react-query';
import { Box, Plus } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { cn, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';

export default function FinishedGoodsPage() {
  const { data: fgs } = useQuery({
    queryKey: ['finished-goods'],
    queryFn: () => api.get('/finished-goods').then((r) => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['fg-stats'],
    queryFn: () => api.get('/finished-goods/dashboard').then((r) => r.data),
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Finished Goods" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total SKUs', value: stats?.total ?? '-' },
            { label: 'Approved', value: stats?.approved ?? '-' },
            { label: 'On Hold', value: stats?.hold ?? '-' },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Finished Goods Inventory</h2>
          <Button size="sm"><Plus className="w-4 h-4" /> Add SKU</Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {['SKU', 'Name', 'Category', 'Current Stock', 'Min Stock', 'Unit', 'Quality Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {fgs?.map((fg: any) => (
                <tr key={fg.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-indigo-600">{fg.sku}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{fg.name}</td>
                  <td className="px-4 py-3 text-gray-500">{fg.category || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{fg.currentStock}</td>
                  <td className="px-4 py-3 text-gray-500">{fg.minimumStock}</td>
                  <td className="px-4 py-3 text-gray-500">{fg.unit}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(fg.qualityStatus))}>{fg.qualityStatus}</span>
                  </td>
                </tr>
              ))}
              {!fgs?.length && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No finished goods yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
