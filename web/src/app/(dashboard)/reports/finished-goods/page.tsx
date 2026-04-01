'use client';
import { useState } from 'react';
import { ReportPage, DateRangeFilter } from '@/components/reports/ReportPage';

export default function FinishedGoodsReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sku, setSku] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (sku) params.sku = sku;

  return (
    <ReportPage
      title="Finished Goods Report"
      endpoint="/reports/finished-goods"
      queryKey={['report-finished-goods']}
      queryParams={params}
      exportName="finished-goods-report"
      columns={[
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Product Name' },
        { key: 'batchNumber', label: 'Batch No.' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'unit', label: 'UOM' },
        { key: 'qualityStatus', label: 'Quality', render: (r) => (
          <span className={`capitalize inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            r.qualityStatus === 'approved' ? 'bg-green-50 text-green-700' :
            r.qualityStatus === 'rejected' ? 'bg-red-50 text-red-700' :
            'bg-yellow-50 text-yellow-700'
          }`}>{r.qualityStatus || 'pending'}</span>
        )},
        { key: 'productionDate', label: 'Production Date', render: (r) => r.productionDate ? new Date(r.productionDate).toLocaleDateString() : '—' },
        { key: 'expiryDate', label: 'Expiry Date', render: (r) => r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—' },
      ]}
      filterFields={
        <>
          <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">SKU</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. FG-001"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
          </div>
        </>
      }
    />
  );
}
