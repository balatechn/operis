'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, CheckCircle } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const qc = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => api.get('/sales/orders').then((r) => r.data),
    refetchInterval: 15000,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/sales/customers').then((r) => r.data),
  });

  const dispatchMutation = useMutation({
    mutationFn: (id: string) => api.put(`/sales/orders/${id}/dispatch`),
    onSuccess: () => { toast.success('Order dispatched & stock deducted!'); qc.invalidateQueries({ queryKey: ['sales-orders'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Dispatch failed'),
  });

  const statusSummary = orders?.reduce((acc: any, o: any) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Sales & Dispatch" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: orders?.length ?? '-', color: 'text-gray-900' },
            { label: 'Draft', value: statusSummary.draft ?? 0, color: 'text-gray-500' },
            { label: 'Confirmed', value: statusSummary.confirmed ?? 0, color: 'text-blue-600' },
            { label: 'Dispatched', value: statusSummary.dispatched ?? 0, color: 'text-green-600' },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sales Orders</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">Customers ({customers?.length ?? 0})</Button>
            <Button size="sm"><Plus className="w-4 h-4" /> New Order</Button>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {['Order #', 'Invoice #', 'Customer', 'Total Amount', 'Status', 'Delivery Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {orders?.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-indigo-600">{o.orderNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.invoiceNumber || '-'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{o.customerName}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(o.status))}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{o.expectedDeliveryDate ? formatDate(o.expectedDeliveryDate) : '-'}</td>
                  <td className="px-4 py-3">
                    {o.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => dispatchMutation.mutate(o.id)}
                        loading={dispatchMutation.isPending}
                      >
                        <Truck className="w-3.5 h-3.5" /> Dispatch
                      </Button>
                    )}
                    {o.status !== 'confirmed' && <Button size="sm" variant="ghost">View</Button>}
                  </td>
                </tr>
              ))}
              {!orders?.length && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No sales orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
