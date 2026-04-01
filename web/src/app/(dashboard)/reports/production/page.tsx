'use client';
import { useState } from 'react';
import { ReportPage, DateRangeFilter } from '@/components/reports/ReportPage';

export default function ProductionReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return (
    <ReportPage
      title="Production Report"
      endpoint="/reports/production"
      queryKey={['report-production']}
      queryParams={params}
      exportName="production-report"
      columns={[
        { key: 'orderNumber', label: 'Order No.' },
        { key: 'recipe.name', label: 'Recipe / Product' },
        { key: 'plannedQuantity', label: 'Planned Qty' },
        { key: 'actualQuantity', label: 'Actual Qty' },
        { key: 'wastageQuantity', label: 'Wastage' },
        { key: 'efficiency', label: 'Efficiency %', render: (r) => {
          if (!r.plannedQuantity || !r.actualQuantity) return '—';
          return `${((r.actualQuantity / r.plannedQuantity) * 100).toFixed(1)}%`;
        }},
        { key: 'status', label: 'Status', render: (r) => <span className="capitalize">{r.status}</span> },
        { key: 'startDate', label: 'Start Date', render: (r) => r.startDate ? new Date(r.startDate).toLocaleDateString() : '—' },
        { key: 'completedAt', label: 'Completed', render: (r) => r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—' },
      ]}
      filterFields={
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      }
    />
  );
}
