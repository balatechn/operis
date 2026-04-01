'use client';
import { useState } from 'react';
import { ReportPage, DateRangeFilter } from '@/components/reports/ReportPage';

export default function ConsumptionReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return (
    <ReportPage
      title="Consumption Report"
      endpoint="/reports/consumption"
      queryKey={['report-consumption']}
      queryParams={params}
      exportName="consumption-report"
      columns={[
        { key: 'productionOrder.orderNumber', label: 'Production Order' },
        { key: 'rawMaterial.name', label: 'Material' },
        { key: 'rawMaterial.unit', label: 'UOM' },
        { key: 'issuedQuantity', label: 'Issued Qty' },
        { key: 'returnedQuantity', label: 'Returned Qty' },
        { key: 'consumedQuantity', label: 'Consumed Qty', render: (r) => {
          const consumed = (r.issuedQuantity || 0) - (r.returnedQuantity || 0);
          return consumed.toFixed(2);
        }},
        { key: 'issuedAt', label: 'Date', render: (r) => r.issuedAt ? new Date(r.issuedAt).toLocaleDateString() : '—' },
      ]}
      filterFields={
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      }
    />
  );
}
