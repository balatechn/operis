'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportPage } from '@/components/reports/ReportPage';
import api from '@/lib/api';

interface RawMaterial { id: string; name: string; }

export default function StockLedgerPage() {
  const [materialId, setMaterialId] = useState('');

  const { data: materials = [] } = useQuery<RawMaterial[]>({
    queryKey: ['raw-materials'],
    queryFn: () => api.get('/raw-materials').then((r) => r.data),
  });

  const params: Record<string, string> = {};
  if (materialId) params.materialId = materialId;

  return (
    <ReportPage
      title="Stock Ledger"
      endpoint="/reports/stock-ledger"
      queryKey={['report-stock-ledger']}
      queryParams={params}
      exportName="stock-ledger"
      columns={[
        { key: 'rawMaterial.name', label: 'Material' },
        { key: 'type', label: 'Transaction Type', render: (r) => (
          <span className={`capitalize inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.type === 'in' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {r.type}
          </span>
        )},
        { key: 'quantity', label: 'Quantity' },
        { key: 'balanceAfter', label: 'Balance After' },
        { key: 'reference', label: 'Reference' },
        { key: 'createdAt', label: 'Date', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
        { key: 'notes', label: 'Notes' },
      ]}
      filterFields={
        <div>
          <label className="block text-xs text-gray-500 mb-1">Material</label>
          <select value={materialId} onChange={(e) => setMaterialId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white min-w-48">
            <option value="">All Materials</option>
            {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      }
    />
  );
}
