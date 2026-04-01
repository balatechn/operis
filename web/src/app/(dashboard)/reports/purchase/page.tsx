'use client';
import { useState } from 'react';
import { ReportPage, DateRangeFilter } from '@/components/reports/ReportPage';

export default function PurchaseReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (status) params.status = status;

  return (
    <ReportPage
      title="Purchase Report"
      endpoint="/reports/purchase"
      queryKey={['report-purchase']}
      queryParams={params}
      exportName="purchase-report"
      columns={[
        { key: 'poNumber', label: 'PO Number' },
        { key: 'vendor.name', label: 'Vendor' },
        { key: 'orderDate', label: 'Date', render: (r) => r.orderDate ? new Date(r.orderDate).toLocaleDateString() : '—' },
        { key: 'expectedDelivery', label: 'Expected Delivery', render: (r) => r.expectedDelivery ? new Date(r.expectedDelivery).toLocaleDateString() : '—' },
        { key: 'status', label: 'Status', render: (r) => <span className="capitalize">{r.status}</span> },
        { key: 'totalAmount', label: 'Total (₹)', render: (r) => r.totalAmount ? `₹${Number(r.totalAmount).toLocaleString()}` : '—' },
      ]}
      filterFields={
        <>
          <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </>
      }
    />
  );
}
