'use client';
import { useState } from 'react';
import { ReportPage, DateRangeFilter } from '@/components/reports/ReportPage';

export default function GrnReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return (
    <ReportPage
      title="GRN Report"
      endpoint="/reports/grn"
      queryKey={['report-grn']}
      queryParams={params}
      exportName="grn-report"
      columns={[
        { key: 'grnNumber', label: 'GRN Number' },
        { key: 'purchaseOrder.poNumber', label: 'PO Number' },
        { key: 'vendor.name', label: 'Vendor' },
        { key: 'receivedDate', label: 'Received Date', render: (r) => r.receivedDate ? new Date(r.receivedDate).toLocaleDateString() : '—' },
        { key: 'rawMaterial.name', label: 'Material' },
        { key: 'receivedQuantity', label: 'Qty Received' },
        { key: 'acceptedQuantity', label: 'Qty Accepted' },
        { key: 'rejectedQuantity', label: 'Qty Rejected' },
        { key: 'batchNumber', label: 'Batch No.' },
      ]}
      filterFields={
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      }
    />
  );
}
