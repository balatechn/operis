'use client';
import { useState } from 'react';
import { ReportPage, DateRangeFilter } from '@/components/reports/ReportPage';

export default function SalesReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (status) params.status = status;

  return (
    <ReportPage
      title="Sales Report"
      endpoint="/reports/sales"
      queryKey={['report-sales']}
      queryParams={params}
      exportName="sales-report"
      columns={[
        { key: 'orderNumber', label: 'Order No.' },
        { key: 'customer.name', label: 'Customer' },
        { key: 'orderDate', label: 'Order Date', render: (r) => r.orderDate ? new Date(r.orderDate).toLocaleDateString() : '—' },
        { key: 'deliveryDate', label: 'Delivery Date', render: (r) => r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString() : '—' },
        { key: 'totalAmount', label: 'Amount (₹)', render: (r) => r.totalAmount ? `₹${Number(r.totalAmount).toLocaleString()}` : '—' },
        { key: 'status', label: 'Status', render: (r) => <span className="capitalize">{r.status}</span> },
        { key: 'dispatchStatus', label: 'Dispatch', render: (r) => (
          <span className={`capitalize inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            r.dispatchStatus === 'dispatched' ? 'bg-green-50 text-green-700' :
            r.dispatchStatus === 'pending' ? 'bg-yellow-50 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>{r.dispatchStatus || 'pending'}</span>
        )},
      ]}
      filterFields={
        <>
          <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </>
      }
    />
  );
}
