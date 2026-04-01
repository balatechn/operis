'use client';
import { useState } from 'react';
import { ReportPage, DateRangeFilter } from '@/components/reports/ReportPage';

export default function PackingReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return (
    <ReportPage
      title="Packing Report"
      endpoint="/reports/packing"
      queryKey={['report-packing']}
      queryParams={params}
      exportName="packing-report"
      columns={[
        { key: 'packingOrderNumber', label: 'Packing Order' },
        { key: 'finishedGood.name', label: 'Product' },
        { key: 'finishedGood.sku', label: 'SKU' },
        { key: 'packSize', label: 'Pack Size' },
        { key: 'quantityPacked', label: 'Qty Packed' },
        { key: 'barcodeGenerated', label: 'Barcode', render: (r) => (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.barcodeGenerated ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {r.barcodeGenerated ? 'Yes' : 'No'}
          </span>
        )},
        { key: 'status', label: 'Status', render: (r) => <span className="capitalize">{r.status}</span> },
        { key: 'packedAt', label: 'Packed Date', render: (r) => r.packedAt ? new Date(r.packedAt).toLocaleDateString() : '—' },
      ]}
      filterFields={
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      }
    />
  );
}
